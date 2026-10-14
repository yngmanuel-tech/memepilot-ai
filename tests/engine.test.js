// Test del motore browser con API finte. Esegui:  node --test webapp/tests/
import test from "node:test";
import assert from "node:assert/strict";
import {buildCloseAccountsTx, b58decode, Engine, scoreToken, buildSnapshot, parseTokenInfo, checkBuy, availableBudget, evaluateExit, positionNetPnl,
  validateSettings, DEFAULTS, USDC_MINT, SOL_MINT, isValidPubkey, classifyTx, walletStats, emptyData} from "../engine.js";

const MEME = "MemeMint1111111111111111111111111111111111";
const T0 = 1_800_000_000;

function pair(price = 0.001, extra = {}) {
  return {chainId: "solana", dexId: "raydium", pairAddress: "PairX", baseToken: {address: MEME, symbol: "MEME"},
    quoteToken: {address: SOL_MINT, symbol: "SOL"}, priceUsd: String(price), liquidity: {usd: extra.liq ?? 200000},
    volume: {m5: 15000, h1: 100000, h6: 500000}, txns: {m5: {buys: 80, sells: 50}, h1: {buys: extra.buys ?? 600, sells: extra.sells ?? 400}},
    priceChange: {m5: 1, h1: extra.ch ?? 12, h24: 40}, pairCreatedAt: (T0 - 6 * 3600) * 1000};
}
function info(extra = {}) {
  return {id: MEME, symbol: "MEME", decimals: 6, holderCount: 2500,
    audit: {mintAuthorityDisabled: true, freezeAuthorityDisabled: extra.freezeOff ?? true, topHoldersPercentage: extra.top ?? 20},
    organicScore: 70, stats1h: {liquidityChange: 8, numTraders: 450}};
}

function world() {
  const w = {t: T0 * 1000, price: 0.001, dexFail: false, jupFail: false, stored: null, calls: [], quoteFactor: 1};
  w.fetch = async (url, opt) => {
    w.calls.push(url);
    const json = d => ({ok: true, status: 200, json: async () => d, text: async () => JSON.stringify(d)});
    const fail = s => ({ok: false, status: s, json: async () => ({}), text: async () => "errore"});
    if (url.includes("dexscreener")) return w.dexFail ? fail(503) : json([pair(w.price, w.pairExtra || {})]);
    if (w.jupFail && url.includes("jup.ag")) return fail(500);
    if (url.includes("/price/v3")) return json({[SOL_MINT]: {usdPrice: 150}});
    if (url.includes("/tokens/v2/toptrending")) return json([info(w.infoExtra || {})]);
    if (url.includes("/tokens/v2/")) return json([]);
    if (url.includes("/swap/v2/order")) {
      const u = new URL(url), amt = Number(u.searchParams.get("amount"));
      const out = u.searchParams.get("inputMint") === USDC_MINT ? Math.floor(amt / 1e6 * 0.994 * w.quoteFactor / w.price * 1e6)
        : Math.floor(amt / 1e6 * w.price * 0.994 * 1e6);
      return json({inputMint: u.searchParams.get("inputMint"), outputMint: u.searchParams.get("outputMint"), inAmount: String(amt), outAmount: String(out), transaction: null});
    }
    return fail(404);
  };
  w.deps = {fetch: w.fetch, sleep: async ms => { w.t += ms; }, nowMs: () => w.t,
    load: () => w.stored ? JSON.parse(w.stored) : null, save: d => { w.stored = JSON.stringify(d); }};
  return w;
}
const adv = (w, s) => { w.t += s * 1000; };

test("simulazione: acquisto e take profit netto", async () => {
  const w = world(), e = new Engine(w.deps);
  assert.equal(e.cfg.mode, "simulation");
  assert.deepEqual(e.start(), [true, "Bot avviato"]);
  await e.tick();
  const pos = e.active();
  assert.equal(pos.length, 1); assert.equal(pos[0].status, "open");
  assert.ok(pos[0].cost_usd > pos[0].usdc_spent, "commissioni incluse nel costo");
  assert.ok(Math.abs(e.data.sim.cash - 45) < 0.01);
  adv(w, 20); w.price = 0.0014; await e.tick();
  const closed = e.data.positions.filter(p => p.status === "closed");
  assert.equal(closed.length, 1); assert.match(closed[0].exit_reason, /take profit/);
  assert.ok(closed[0].realized_pnl_usd > 0 && closed[0].realized_pnl_usd / closed[0].cost_usd < 0.4);
});

test("STOP blocca nuove operazioni e non vende; la liquidazione richiede LIQUIDA", async () => {
  const w = world(), e = new Engine(w.deps); e.start(); await e.tick();
  e.stop(); assert.equal(e.state, "STOPPED");
  adv(w, 30); w.price = 0.0005; await e.tick();
  assert.equal(e.active()[0].status, "open");
  assert.equal((await e.liquidateAll("si"))[0], false);
  assert.equal((await e.liquidateAll("LIQUIDA"))[0], true);
  assert.equal(e.active().length, 0);
});

test("errori API: pausa automatica e ripresa", async () => {
  const w = world(), e = new Engine(w.deps); e.cfg.max_data_age_s = 30; e.cfg.scan_interval_s = 10;
  e.start(); await e.tick(); assert.equal(e.state, "RUNNING");
  w.dexFail = true;
  for (let i = 0; i < 5; i++) { adv(w, 15); await e.tick(); }
  assert.equal(e.state, "PAUSED"); assert.ok(e.pause);
  w.dexFail = false; adv(w, 15); await e.tick();
  assert.equal(e.state, "RUNNING");
});

test("limite di perdita giornaliero blocca i nuovi acquisti", async () => {
  const w = world(), e = new Engine(w.deps); e.cfg.min_seconds_between_buys = 10; e.cfg.reentry_cooldown_minutes = 0;
  e.start(); await e.tick();
  adv(w, 20); w.price = 0.0004; await e.tick();       // stop loss con perdita > 5% di 50$
  const rec = Object.values(e.data.daily)[0];
  assert.ok(rec.locked);
  assert.ok(e.alerts.some(a => a.message.includes("Limite di perdita giornaliero")));
  adv(w, 60); await e.tick();
  assert.equal(e.active().length, 0);
});

test("riavvio: posizioni ritrovate, si riparte FERMI e in simulazione", async () => {
  const w = world(), e = new Engine(w.deps); e.start(); await e.tick();
  const id = e.active()[0].id;
  const e2 = new Engine(w.deps);
  assert.equal(e2.state, "STOPPED"); assert.equal(e2.cfg.mode, "simulation");
  assert.equal(e2.active()[0].id, id);
  e2.start(); adv(w, 20); w.price = 0.0014; await e2.tick();
  assert.equal(e2.data.positions.find(p => p.id === id).status, "closed");
});

test("modalità reale: serve wallet, accettazione rischio e CONFERMO", () => {
  const w = world(), e = new Engine(w.deps);
  assert.equal(e.setMode("manual", "CONFERMO", true)[0], false);           // nessun wallet
  e.wallet = {address: MEME, name: "test", signBytes: async b => b}; e.realBal = [50, 0.1];
  assert.equal(e.setMode("manual", "CONFERMO", false)[0], false);
  assert.equal(e.setMode("manual", "no", true)[0], false);
  assert.equal(e.setMode("manual", "confermo", true)[0], true);
  e.start(); assert.equal(e.setMode("simulation")[0], false);              // non mentre è attivo
});

test("modalità reale: ogni acquisto è una proposta, mai eseguito da solo", async () => {
  const w = world(), e = new Engine(w.deps);
  e.wallet = {address: MEME, name: "test", signBytes: async () => { throw new Error("non deve firmare"); }};
  e.realBal = [50, 0.1]; e.realBalAt = T0 + 1e6; e.setMode("manual", "CONFERMO", true);
  e.live.balances = async () => [50, 0.1];
  e.start(); await e.tick();
  assert.equal(e.proposals.filter(p => p.status === "pending" && p.kind === "buy").length, 1);
  assert.equal(e.active().length, 0);
});

test("firma rifiutata nel wallet = operazione annullata, non conteggiata come errore", async () => {
  const w = world(), e = new Engine(w.deps);
  const fetch0 = w.deps.fetch;
  e.deps.fetch = async (url, o) => {
    if (url.includes("/swap/v2/order") && url.includes("taker=")) {
      const r = await fetch0(url, o); const d = await r.json(); d.transaction = "AAAA"; d.requestId = "r1";
      return {ok: true, status: 200, json: async () => d};
    }
    if (url.includes("mainnet")) return {ok: true, status: 200, json: async () => ({result: {value: []}})};
    return fetch0(url, o);
  };
  e.wallet = {address: MEME, name: "test", signBytes: async () => { throw new Error("User rejected the request"); }};
  e.realBal = [50, 0.1]; e.realBalAt = T0 + 1e6; e.setMode("manual", "CONFERMO", true);
  e.live.balances = async () => [50, 0.1];
  e.start(); await e.tick();
  const prop = e.proposals.find(p => p.status === "pending");
  await e.approve(prop.id);
  const pos = e.data.positions[0];
  assert.equal(pos.status, "failed"); assert.match(pos.notes[0], /firma rifiutata/);
  assert.equal(e.txFailures, 0);
  assert.ok(!w.calls.some(u => u.includes("/execute")), "nessun invio senza firma");
});

test("punteggi, blocchi e limiti di capitale", () => {
  const c = {...DEFAULTS}, now = T0;
  const good = scoreToken(buildSnapshot(MEME, pair(), parseTokenInfo(info()), now), c, now);
  assert.deepEqual(good.blocks, []);
  const st = {cash: 50, sol: 0.1, invested: 0, realized_total: 0, open_count: 0, active_mints: new Set(), recently_closed: {},
    last_buy_at: 0, daily_loss: 0, day_start_equity: 50, daily_locked: false, paused: ""};
  assert.equal(checkBuy(good, st, c, now, 150).allowed, true);
  assert.equal(availableBudget({...st, invested: 48}, c), 2);
  assert.equal(availableBudget({...st, realized_total: 30, cash: 500}, c), 50);
  assert.equal(availableBudget({...st, realized_total: -10}, c), 40);
  const frozen = scoreToken(buildSnapshot(MEME, pair(), parseTokenInfo(info({freezeOff: false})), now), c, now);
  assert.ok(frozen.blocks.some(b => b.includes("Freeze")));
  const honeypot = scoreToken(buildSnapshot(MEME, pair(0.001, {buys: 900, sells: 2}), parseTokenInfo(info()), now), c, now);
  assert.ok(honeypot.blocks.some(b => b.includes("honeypot")));
  const pump = scoreToken(buildSnapshot(MEME, pair(0.001, {ch: 300}), parseTokenInfo(info()), now), c, now);
  assert.ok(pump.risk > good.risk);
  assert.equal(checkBuy(good, {...st, daily_loss: 2.5}, c, now, 150).allowed, false);
});

test("uscite sul netto e impostazioni invalicabili", () => {
  const c = {...DEFAULTS}, p = {status: "open", qty: 5000, qty_raw: 5e9, cost_usd: 5.06, proceeds_usd: 0, entry_liquidity_usd: 200000,
    opened_at: T0 - 60, peak_net_pct: 0, peak_price: 0, partial_done: false};
  assert.equal(evaluateExit(p, 0.00125, 200000, 5, c, T0, 150).action, "none");   // +25% lordo non basta
  assert.equal(evaluateExit(p, 0.00135, 200000, 5, c, T0, 150).action, "sell_all");
  assert.match(evaluateExit(p, 0.00088, 200000, 5, c, T0, 150).reason, /stop loss/);
  assert.equal(evaluateExit(p, 0.0005, 200000, 999, c, T0, 150).action, "alert");
  assert.ok(positionNetPnl(p, 0.001, 200000, c, 150).pnl_pct < 0);
  assert.ok(validateSettings({...c, stop_loss_pct: 0}).length);
  assert.ok(validateSettings({...c, daily_loss_limit_pct: 100}).length);
  assert.ok(validateSettings({...c, max_position_usdc: 80}).length);
  assert.equal(validateSettings(c).length, 0);
});

test("indirizzi e classificazione operazioni dei trader", () => {
  assert.ok(isValidPubkey(SOL_MINT)); assert.ok(!isValidPubkey("ciao"));
  const W = "Wallet1111111111111111111111111111111111111";
  const tx = (pre, post, tp, tq) => ({blockTime: 1, meta: {err: null, fee: 5000, preBalances: [pre], postBalances: [post],
    preTokenBalances: tp == null ? [] : [{owner: W, mint: MEME, uiTokenAmount: {uiAmount: tp}}],
    postTokenBalances: tq == null ? [] : [{owner: W, mint: MEME, uiTokenAmount: {uiAmount: tq}}]}, transaction: {message: {accountKeys: [{pubkey: W}]}}});
  assert.equal(classifyTx(tx(2e9, 1e9, 0, 1000), W).kind, "BUY");
  assert.equal(classifyTx(tx(1e9, 2.5e9, 1000, 0), W).kind, "SELL");
  assert.equal(classifyTx(tx(1e9, 1e9 - 5000, 0, 500), W).kind, "TRANSFER_IN");
  const few = walletStats([{kind: "BUY", ts: 1, mint: "A", qty: 1, base: "SOL", price_base: 1}, {kind: "SELL", ts: 500, mint: "A", qty: 1, base: "SOL", price_base: 3}]);
  assert.equal(few.reliable, false); assert.match(few.verdict, /insufficienti/);
});

test("transazione di recupero deposito: solo CloseAccount verso il proprietario", () => {
  const owner = SOL_MINT, acc = USDC_MINT, prog = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
  const tx = buildCloseAccountsTx(owner, [{address: acc, program: prog}], SOL_MINT);
  assert.equal(tx[0], 1);                                  // una firma richiesta
  const msg = tx.slice(65);
  assert.deepEqual([...msg.slice(0, 4)], [1, 0, 1, 3]);    // 1 firmatario, 1 programma, 3 chiavi
  assert.deepEqual([...msg.slice(4, 36)], [...b58decode(owner)]);
  assert.deepEqual([...msg.slice(-8)], [1, 2, 3, 1, 0, 0, 1, 9]);   // 1 istruzione: programma 2, conti [ata, owner, owner], dati [9]
});
