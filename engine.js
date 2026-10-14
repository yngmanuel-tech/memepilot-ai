// MemePilot AI - motore per browser (porting della versione Python testata).
// Nessuna chiave privata passa mai da qui: in modalità reale le transazioni vengono
// firmate dal wallet dell'utente (Phantom / Solflare) con conferma esplicita.

export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDT_MINT = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";
const GOOD_QUOTES = new Set([SOL_MINT, USDC_MINT, USDT_MINT]);
const EXCLUDED = GOOD_QUOTES;
const JUP = "https://api.jup.ag";
const DEX = "https://api.dexscreener.com";

export const MODE_LABELS = {
  simulation: "SIMULAZIONE (denaro virtuale)",
  manual: "REALE con approvazione (firma nel wallet)",
};

// ------------------------------------------------------------------ impostazioni
export const DEFAULTS = {
  mode: "simulation", signal_only: false,
  initial_capital_usdc: 50, max_capital_usdc: 50, max_position_usdc: 5, max_open_positions: 3,
  daily_loss_limit_pct: 5, min_sol_reserve: 0.03,
  min_liquidity_usd: 30000, min_volume_h1_usd: 15000, min_txns_h1: 150, min_sells_h1: 20,
  min_pair_age_minutes: 30, max_pair_age_hours: 168, max_top_holders_pct: 40,
  min_opportunity_score: 60, max_risk_score: 45, max_price_impact_pct: 1, max_slippage_bps: 300,
  max_round_trip_cost_pct: 4, min_seconds_between_buys: 180, reentry_cooldown_minutes: 60,
  require_mint_authority_disabled: true,
  take_profit_pct: 25, stop_loss_pct: 12, trailing_stop_pct: 0, trailing_activation_pct: 10,
  max_hold_minutes: 240, partial_take_profit_pct: 0, partial_sell_fraction: 0.5, liquidity_drop_exit_pct: 35,
  swap_fee_bps: 60, network_fee_sol_per_swap: 0.0002, ata_rent_sol: 0.00204,
  scan_interval_s: 30, position_refresh_s: 10, max_data_age_s: 90, max_consecutive_api_errors: 3,
  max_consecutive_tx_failures: 3, proposal_ttl_s: 90, trader_signal_max_age_min: 15,
  rpc_url: "https://api.mainnet-beta.solana.com", jupiter_api_key: "",
};

export const HARD_LIMITS = {
  initial_capital_usdc: [1, 1e6], max_capital_usdc: [1, 1e6], max_position_usdc: [1, 1e5],
  max_open_positions: [1, 10], daily_loss_limit_pct: [0.5, 25], min_sol_reserve: [0.01, 10],
  min_liquidity_usd: [5000, 1e12], min_volume_h1_usd: [0, 1e12], min_txns_h1: [0, 1e6], min_sells_h1: [5, 1e6],
  min_pair_age_minutes: [5, 1e5], max_pair_age_hours: [1, 1e6], max_top_holders_pct: [5, 90],
  min_opportunity_score: [0, 100], max_risk_score: [0, 80], max_price_impact_pct: [0.05, 5],
  max_slippage_bps: [10, 1000], max_round_trip_cost_pct: [0.5, 10], min_seconds_between_buys: [10, 86400],
  reentry_cooldown_minutes: [0, 10000], take_profit_pct: [1, 1000], stop_loss_pct: [1, 50],
  trailing_stop_pct: [0, 50], trailing_activation_pct: [0, 1000], max_hold_minutes: [5, 1e5],
  partial_take_profit_pct: [0, 1000], partial_sell_fraction: [0.1, 0.9], liquidity_drop_exit_pct: [5, 90],
  swap_fee_bps: [10, 500], network_fee_sol_per_swap: [0.000005, 0.01], ata_rent_sol: [0, 0.01],
  scan_interval_s: [10, 3600], position_refresh_s: [5, 300], max_data_age_s: [10, 300],
  max_consecutive_api_errors: [1, 20], max_consecutive_tx_failures: [1, 10], proposal_ttl_s: [20, 900],
  trader_signal_max_age_min: [1, 240],
};

export const SETTING_GROUPS = [
  ["Capitale e rischio", [
    ["initial_capital_usdc", "Capitale virtuale simulazione (USDC)"], ["max_capital_usdc", "Capitale massimo utilizzabile (USDC)"],
    ["max_position_usdc", "Massimo per posizione (USDC)"], ["max_open_positions", "Posizioni aperte massime"],
    ["daily_loss_limit_pct", "Perdita giornaliera massima (%)"], ["min_sol_reserve", "Riserva SOL per commissioni"],
    ["signal_only", "Solo segnali (nessun acquisto)"]]],
  ["Uscite (su risultato NETTO)", [
    ["take_profit_pct", "Take profit (%)"], ["stop_loss_pct", "Stop loss (%)"],
    ["trailing_stop_pct", "Trailing stop (%; 0 = off)"], ["trailing_activation_pct", "Attivazione trailing (% netto)"],
    ["partial_take_profit_pct", "Take profit parziale (%; 0 = off)"], ["partial_sell_fraction", "Quota venduta al parziale"],
    ["max_hold_minutes", "Durata massima posizione (min)"], ["liquidity_drop_exit_pct", "Esci se la liquidità cala del (%)"]]],
  ["Filtri d'ingresso", [
    ["min_liquidity_usd", "Liquidità minima (USD)"], ["min_volume_h1_usd", "Volume minimo 1h (USD)"],
    ["min_txns_h1", "Transazioni minime 1h"], ["min_sells_h1", "Vendite minime 1h"],
    ["min_pair_age_minutes", "Età minima coppia (min)"], ["max_pair_age_hours", "Età massima coppia (ore)"],
    ["max_top_holders_pct", "Concentrazione max possessori (%)"], ["min_opportunity_score", "Punteggio opportunità minimo"],
    ["max_risk_score", "Punteggio rischio massimo"], ["max_price_impact_pct", "Impatto prezzo massimo (%)"],
    ["max_slippage_bps", "Slippage massimo (bps)"], ["max_round_trip_cost_pct", "Costo andata/ritorno max (%)"],
    ["min_seconds_between_buys", "Secondi minimi tra acquisti"], ["reentry_cooldown_minutes", "Attesa prima di rientrare (min)"],
    ["require_mint_authority_disabled", "Richiedi mint authority disattivata"]]],
  ["Costi stimati e connessioni", [
    ["swap_fee_bps", "Fee swap stimata (bps)"], ["network_fee_sol_per_swap", "Commissione di rete per swap (SOL)"],
    ["scan_interval_s", "Intervallo scansione (s)"], ["max_data_age_s", "Età massima dei dati (s)"],
    ["rpc_url", "URL RPC Solana"], ["jupiter_api_key", "Chiave API Jupiter (facoltativa)"]]],
];

const LABELS = Object.fromEntries(SETTING_GROUPS.flatMap(g => g[1]));

export function validateSettings(c) {
  const e = [];
  for (const [k, [lo, hi]] of Object.entries(HARD_LIMITS)) {
    const v = c[k];
    if (typeof v !== "number" || !isFinite(v)) { e.push(`${LABELS[k] || k}: valore non numerico`); continue; }
    if (v < lo || v > hi) e.push(`${LABELS[k] || k}: ${v} fuori dai limiti consentiti [${lo} – ${hi}]`);
  }
  if (!MODE_LABELS[c.mode]) e.push("Modalità sconosciuta");
  if (c.max_position_usdc > c.max_capital_usdc) e.push("L'esposizione per posizione non può superare il capitale massimo");
  if (c.take_profit_pct <= c.swap_fee_bps / 100 * 2) e.push("Il take profit deve superare almeno i costi di andata e ritorno");
  if (c.partial_take_profit_pct && c.partial_take_profit_pct >= c.take_profit_pct) e.push("Il take profit parziale deve essere inferiore al take profit totale");
  if (c.trailing_stop_pct && c.trailing_activation_pct <= 0) e.push("Con il trailing stop serve una soglia di attivazione > 0");
  if (!String(c.rpc_url).startsWith("https://")) e.push("L'URL RPC deve usare https://");
  return e;
}

export function summaryLines(c, mode) {
  return [
    `Modalità: ${MODE_LABELS[mode || c.mode]}`,
    `Capitale massimo utilizzabile: ${c.max_capital_usdc.toFixed(2)} USDC`,
    `Massimo per posizione: ${c.max_position_usdc.toFixed(2)} USDC`,
    `Posizioni contemporanee: ${c.max_open_positions}`,
    `Perdita giornaliera massima: ${c.daily_loss_limit_pct}%`,
    `Take profit: ${c.take_profit_pct}%  |  Stop loss: ${c.stop_loss_pct}% (netti)`,
    `Trailing stop: ${c.trailing_stop_pct ? c.trailing_stop_pct + "%" : "disattivato"}`,
    `Durata massima posizione: ${c.max_hold_minutes} min`,
    `Liquidità minima: ${c.min_liquidity_usd} USD`,
    `Slippage massimo: ${(c.max_slippage_bps / 100).toFixed(2)}%`,
    `Riserva SOL per commissioni: ${c.min_sol_reserve} SOL`,
  ];
}

// ------------------------------------------------------------------ utilità
const newId = p => `${p}-${Math.random().toString(16).slice(2, 10)}${Date.now().toString(16).slice(-4)}`;
export function dayKey(ts) {
  return new Intl.DateTimeFormat("en-CA", {timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit"})
    .format(new Date(ts * 1000));
}
export function fmtAge(s) {
  if (s == null || !isFinite(s)) return "-";
  s = Math.max(0, Math.floor(s));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  return `${Math.floor(s / 86400)}g`;
}
const ALPH = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
export function isValidPubkey(s) {
  if (typeof s !== "string" || s.length < 32 || s.length > 44) return false;
  let n = 0n;
  for (const ch of s) { const i = ALPH.indexOf(ch); if (i < 0) return false; n = n * 58n + BigInt(i); }
  const lead = s.length - s.replace(/^1+/, "").length;
  let bytes = 0; while (n > 0n) { n >>= 8n; bytes++; }
  return bytes + lead === 32;
}

// ------------------------------------------------------------------ HTTP con limiti
export class ApiError extends Error {
  constructor(msg, status, retryable) { super(msg); this.status = status; this.retryable = !!retryable; }
}
export class Http {
  constructor(name, ratePerS, deps) {
    this.name = name; this.minInterval = 1000 / ratePerS; this.next = 0;
    this.errors = 0; this.lastOk = 0; this.lastError = ""; this.deps = deps;
  }
  async request(url, {method = "GET", body, headers = {}, retries = 2, timeout = 15000} = {}) {
    const {fetch, sleep, nowMs} = this.deps;
    for (let attempt = 1; ; attempt++) {
      const t = nowMs(); const wait = this.next - t; this.next = Math.max(t, this.next) + this.minInterval;
      if (wait > 0) await sleep(wait);
      let err;
      try {
        const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
        const timer = ctl ? setTimeout(() => ctl.abort(), timeout) : null;
        const h = {Accept: "application/json", ...headers};
        if (body !== undefined) h["Content-Type"] = "application/json";
        const r = await fetch(url, {method, headers: h, body: body !== undefined ? JSON.stringify(body) : undefined, signal: ctl?.signal});
        if (timer) clearTimeout(timer);
        if (r.ok) {
          const data = await r.json();
          this.errors = 0; this.lastOk = Date.now(); this.lastError = "";
          return data;
        }
        const txt = (await r.text().catch(() => "")).slice(0, 160);
        err = new ApiError(`${this.name}: HTTP ${r.status} ${txt}`, r.status, r.status === 429 || r.status >= 500);
      } catch (e) {
        err = e instanceof ApiError ? e : new ApiError(`${this.name}: errore di rete (${e.message || e})`, 0, true);
      }
      if (err.retryable && attempt <= retries) { await sleep(Math.min(8000, 1500 * 2 ** (attempt - 1))); continue; }
      this.errors++; this.lastError = err.message;
      throw err;
    }
  }
  health() { return {name: this.name, errors: this.errors, last_error: this.lastError}; }
}

// ------------------------------------------------------------------ connettori
export class Jupiter {
  constructor(deps, apiKey = "") { this.http = new Http("Jupiter", apiKey ? 0.9 : 0.45, deps); this.exec = new Http("Jupiter-execute", 5, deps); this.apiKey = apiKey; }
  h() { return this.apiKey ? {"x-api-key": this.apiKey} : {}; }
  category(cat, interval = "1h", limit = 40) { return this.http.request(`${JUP}/tokens/v2/${cat}/${interval}?limit=${limit}`, {headers: this.h()}); }
  recent() { return this.http.request(`${JUP}/tokens/v2/recent`, {headers: this.h()}); }
  search(mints) { return this.http.request(`${JUP}/tokens/v2/search?query=${mints.slice(0, 100).join(",")}`, {headers: this.h()}); }
  async solPrice() {
    const d = await this.http.request(`${JUP}/price/v3?ids=${SOL_MINT}`, {headers: this.h()});
    const p = d?.[SOL_MINT]?.usdPrice; if (!p) throw new ApiError("prezzo SOL non disponibile", 0, false); return Number(p);
  }
  order(inMint, outMint, amountRaw, taker) {
    let u = `${JUP}/swap/v2/order?inputMint=${inMint}&outputMint=${outMint}&amount=${BigInt(amountRaw)}`;
    if (taker) u += `&taker=${taker}`;
    return this.http.request(u, {headers: this.h()});
  }
  execute(signedTx, requestId) {
    return this.exec.request(`${JUP}/swap/v2/execute`, {method: "POST", body: {signedTransaction: signedTx, requestId}, headers: this.h(), retries: 0, timeout: 70000});
  }
}

export class DexScreener {
  constructor(deps) { this.http = new Http("DexScreener", 4, deps); }
  async tokenPairs(mints) {
    const best = {};
    for (let i = 0; i < mints.length; i += 30) {
      const chunk = mints.slice(i, i + 30);
      let data = await this.http.request(`${DEX}/tokens/v1/solana/${chunk.join(",")}`) || [];
      if (!Array.isArray(data)) data = data.pairs || [];
      for (const p of data) {
        if (p.chainId !== "solana") continue;
        const base = p.baseToken?.address, quote = p.quoteToken?.address;
        if (!chunk.includes(base) || !GOOD_QUOTES.has(quote)) continue;
        const liq = p.liquidity?.usd || 0;
        if (!best[base] || liq > (best[base].liquidity?.usd || 0)) best[base] = p;
      }
    }
    return best;
  }
}

export class Rpc {
  constructor(deps, url) { this.http = new Http("Solana RPC", 4, deps); this.url = url; this.id = 1; }
  async call(method, params) {
    const d = await this.http.request(this.url, {method: "POST", body: {jsonrpc: "2.0", id: this.id++, method, params}});
    if (d?.error) throw new ApiError(`RPC ${method}: ${d.error.message || JSON.stringify(d.error)}`, 0, false);
    return d?.result;
  }
  async solBalance(owner) { return ((await this.call("getBalance", [owner, {commitment: "confirmed"}]))?.value || 0) / 1e9; }
  async tokenBalanceRaw(owner, mint) {
    const r = await this.call("getTokenAccountsByOwner", [owner, {mint}, {encoding: "jsonParsed", commitment: "confirmed"}]);
    return (r?.value || []).reduce((a, x) => a + BigInt(x.account.data.parsed.info.tokenAmount.amount), 0n);
  }
  async signatureStatus(sig) {
    const r = await this.call("getSignatureStatuses", [[sig], {searchTransactionHistory: true}]);
    return r?.value?.[0] || null;
  }
  signaturesFor(addr, limit = 25) { return this.call("getSignaturesForAddress", [addr, {limit, commitment: "confirmed"}]); }
  transaction(sig) { return this.call("getTransaction", [sig, {encoding: "jsonParsed", commitment: "confirmed", maxSupportedTransactionVersion: 0}]); }
}

// ------------------------------------------------------------------ dati token
export function parsePair(p) {
  const tx = p.txns || {}, vol = p.volume || {}, pc = p.priceChange || {};
  return {
    symbol: p.baseToken?.symbol || "?", name: p.baseToken?.name || "", pair_address: p.pairAddress || "",
    dex_id: p.dexId || "", price_usd: Number(p.priceUsd || 0), liquidity_usd: Number(p.liquidity?.usd || 0),
    volume_m5: Number(vol.m5 || 0), volume_h1: Number(vol.h1 || 0), volume_h6: Number(vol.h6 || 0),
    buys_m5: tx.m5?.buys || 0, sells_m5: tx.m5?.sells || 0, buys_h1: tx.h1?.buys || 0, sells_h1: tx.h1?.sells || 0,
    price_change_m5: Number(pc.m5 || 0), price_change_h1: Number(pc.h1 || 0), price_change_h24: Number(pc.h24 || 0),
    pair_created_at: p.pairCreatedAt ? p.pairCreatedAt / 1000 : null,
  };
}
export function parseTokenInfo(t) {
  const a = t.audit || {}, s = t.stats1h || {};
  const created = t.firstPool?.createdAt ? Date.parse(t.firstPool.createdAt) / 1000 : null;
  return {
    mint: t.id, symbol: t.symbol || "?", name: t.name || "", decimals: t.decimals ?? null,
    holder_count: t.holderCount ?? null, top_holders_pct: a.topHoldersPercentage ?? null,
    mint_authority_disabled: a.mintAuthorityDisabled ?? null, freeze_authority_disabled: a.freezeAuthorityDisabled ?? null,
    organic_score: t.organicScore ?? null, liquidity_change_h1: s.liquidityChange ?? null,
    num_traders_h1: s.numTraders ?? null, first_pool_created_at: isFinite(created) ? created : null,
  };
}
export function buildSnapshot(mint, pair, info, now) {
  const s = {mint, symbol: "?", decimals: null, price_usd: 0, liquidity_usd: 0, volume_m5: 0, volume_h1: 0,
    buys_m5: 0, sells_m5: 0, buys_h1: 0, sells_h1: 0, price_change_m5: 0, price_change_h1: 0, pair_created_at: null,
    holder_count: null, top_holders_pct: null, mint_authority_disabled: null, freeze_authority_disabled: null,
    organic_score: null, liquidity_change_h1: null, num_traders_h1: null, fetched_at: now, sources: [], trader_signal: null};
  if (pair) { Object.assign(s, parsePair(pair)); s.sources.push("DexScreener"); }
  if (info) {
    for (const k of ["decimals", "holder_count", "top_holders_pct", "mint_authority_disabled", "freeze_authority_disabled",
      "organic_score", "liquidity_change_h1", "num_traders_h1"]) if (info[k] != null) s[k] = info[k];
    if (!pair && info.symbol) s.symbol = info.symbol;
    if (!s.pair_created_at && info.first_pool_created_at) s.pair_created_at = info.first_pool_created_at;
    s.sources.push("Jupiter");
  }
  if (!pair) s.fetched_at = 0;
  return s;
}

// ------------------------------------------------------------------ punteggi
export const priceImpactPct = (trade, liq) => liq <= 0 ? 100 : Math.min(100, 200 * trade / liq);

export function scoreToken(s, c, now, tradeUsd) {
  tradeUsd = tradeUsd ?? c.max_position_usdc;
  let risk = 0, opp = 0; const rr = [], orr = [], blocks = [];
  const R = (p, w) => { risk += p; rr.push(`+${p} ${w}`); };
  const O = (p, w) => { opp += p; orr.push(`+${p} ${w}`); };
  const f0 = n => Math.round(n).toLocaleString("it-IT");
  const age = s.fetched_at ? now - s.fetched_at : 1e9;
  if (age > c.max_data_age_s) blocks.push(`Dati vecchi di ${Math.floor(Math.min(age, 99999))}s (massimo ${c.max_data_age_s}s)`);
  if (s.price_usd <= 0) blocks.push("Prezzo non disponibile");
  if (s.freeze_authority_disabled === false) { R(35, "freeze authority attiva: il creatore può congelare i token (vendita impossibile)"); blocks.push("Freeze authority attiva"); }
  if (s.mint_authority_disabled === false) { R(25, "mint authority attiva: possono essere creati nuovi token (diluizione)"); if (c.require_mint_authority_disabled) blocks.push("Mint authority attiva"); }
  if (s.freeze_authority_disabled == null || s.mint_authority_disabled == null) { R(10, "controlli di sicurezza del token non disponibili"); blocks.push("Dati di sicurezza (mint/freeze authority) non disponibili"); }
  if (s.top_holders_pct == null) R(8, "concentrazione dei possessori sconosciuta");
  else if (s.top_holders_pct > 60) R(25, `i maggiori possessori detengono il ${f0(s.top_holders_pct)}% dell'offerta`);
  else if (s.top_holders_pct > 35) R(12, `concentrazione elevata dei maggiori possessori (${f0(s.top_holders_pct)}%)`);
  if (s.top_holders_pct != null && s.top_holders_pct > c.max_top_holders_pct) blocks.push(`Concentrazione possessori ${f0(s.top_holders_pct)}% > ${c.max_top_holders_pct}%`);
  if (s.holder_count != null && s.holder_count < 300) R(8, `pochi possessori (${s.holder_count})`);
  if (s.liquidity_usd < c.min_liquidity_usd) blocks.push(`Liquidità ${f0(s.liquidity_usd)} $ < minimo ${f0(c.min_liquidity_usd)} $`);
  else if (s.liquidity_usd < 2 * c.min_liquidity_usd) R(10, `liquidità appena sopra la soglia (${f0(s.liquidity_usd)} $)`);
  if (s.liquidity_change_h1 != null && s.liquidity_change_h1 < -20) R(15, `liquidità in calo del ${f0(-s.liquidity_change_h1)}% nell'ultima ora`);
  const impact = priceImpactPct(tradeUsd, s.liquidity_usd);
  if (impact > c.max_price_impact_pct) blocks.push(`Impatto stimato ${impact.toFixed(2)}% > massimo ${c.max_price_impact_pct}%`);
  if (s.sells_h1 < c.min_sells_h1) blocks.push(`Solo ${s.sells_h1} vendite nell'ultima ora: impossibile verificare che si possa vendere`);
  if (s.buys_h1 > 50 && s.sells_h1 < Math.max(3, s.buys_h1 * 0.05)) { R(30, "quasi nessuna vendita a fronte di molti acquisti: possibile honeypot"); blocks.push("Sospetto honeypot (vendite assenti)"); }
  const ageMin = s.pair_created_at ? (now - s.pair_created_at) / 60 : null;
  if (ageMin == null) R(10, "età della coppia sconosciuta");
  else {
    if (ageMin < c.min_pair_age_minutes) blocks.push(`Coppia troppo recente (${f0(ageMin)} min)`);
    else if (ageMin < 60) R(15, `coppia molto giovane (${f0(ageMin)} min)`);
    else if (ageMin < 360) R(8, `coppia giovane (${(ageMin / 60).toFixed(1)} h)`);
    if (ageMin > c.max_pair_age_hours * 60) blocks.push(`Coppia fuori dalla finestra di età (${f0(ageMin / 60)} h)`);
  }
  if (s.liquidity_usd > 0) { const t = s.volume_h1 / s.liquidity_usd; if (t > 8) R(15, `volume orario ${t.toFixed(1)}x la liquidità: possibile wash trading`); }
  if (s.organic_score != null && s.organic_score < 25) R(12, `organic score basso (${f0(s.organic_score)}/100): attività poco organica`);
  if (s.price_change_h1 > 150) R(15, `prezzo +${f0(s.price_change_h1)}% in 1h: rischio di inseguire un pump`);
  else if (s.price_change_h1 > 80) R(8, `prezzo +${f0(s.price_change_h1)}% in 1h: movimento già esteso`);
  if (s.price_change_m5 < -15) R(10, `calo del ${f0(-s.price_change_m5)}% negli ultimi 5 minuti`);
  const tot = s.buys_h1 + s.sells_h1;
  if (tot < c.min_txns_h1) blocks.push(`Solo ${tot} transazioni nell'ultima ora (minimo ${c.min_txns_h1})`);
  if (s.volume_h1 < c.min_volume_h1_usd) blocks.push(`Volume 1h ${f0(s.volume_h1)} $ < minimo ${f0(c.min_volume_h1_usd)} $`);
  if (s.volume_h1 > 0) { const a = s.volume_m5 * 12 / s.volume_h1;
    if (a > 1.5) O(20, `volume in accelerazione (${a.toFixed(1)}x la media oraria)`); else if (a > 1) O(10, `volume in crescita (${a.toFixed(1)}x la media oraria)`); }
  if (tot > 0) {
    const ta = (s.buys_m5 + s.sells_m5) * 12 / tot; if (ta > 1.3) O(10, `numero di transazioni in aumento (${ta.toFixed(1)}x)`);
    const br = s.buys_h1 / tot;
    if (br >= 0.55 && br <= 0.75) O(15, `pressione d'acquisto sana (${f0(br * 100)}% acquisti)`);
    else if (br > 0.85) R(8, `acquisti al ${f0(br * 100)}%: squilibrio sospetto`);
  }
  if (s.num_traders_h1 != null) { if (s.num_traders_h1 > 300) O(15, `${s.num_traders_h1} trader attivi nell'ultima ora`); else if (s.num_traders_h1 > 80) O(8, `${s.num_traders_h1} trader attivi nell'ultima ora`); }
  if (s.liquidity_change_h1 != null && s.liquidity_change_h1 > 5) O(10, `liquidità in crescita (+${f0(s.liquidity_change_h1)}% in 1h)`);
  if (s.price_change_h1 >= 3 && s.price_change_h1 <= 60) O(10, `momentum positivo ma non estremo (+${f0(s.price_change_h1)}% in 1h)`);
  if (s.organic_score != null && s.organic_score >= 60) O(15, `organic score alto (${f0(s.organic_score)}/100)`);
  if (s.liquidity_usd > 0) { const t = s.volume_h1 / s.liquidity_usd; if (t >= 0.2 && t <= 3) O(10, "rapporto volume/liquidità equilibrato"); }
  if (s.liquidity_usd >= 4 * c.min_liquidity_usd) O(5, "liquidità ampia: uscita più agevole");
  if (s.trader_signal) {
    if (s.trader_signal.reliable) O(10, `acquisto recente di un wallet monitorato affidabile (${s.trader_signal.label})`);
    else orr.push("+0 acquisto di un wallet monitorato (storico insufficiente: nessun bonus)");
  }
  return {snapshot: s, risk: Math.min(100, risk), opportunity: Math.min(100, opp), risk_reasons: rr, opportunity_reasons: orr, blocks, scored_at: now};
}

// ------------------------------------------------------------------ profitto netto
export function exitValueUsd(qty, price, liq, c, solPrice) {
  const gross = qty * price, impact = priceImpactPct(gross, liq);
  let net = gross * (1 - impact / 100) * (1 - c.swap_fee_bps / 1e4) - c.network_fee_sol_per_swap * solPrice;
  return [Math.max(0, net), impact];
}
export function positionNetPnl(p, price, liq, c, solPrice) {
  const [v, impact] = exitValueUsd(p.qty, price, liq, c, solPrice);
  const total = v + p.proceeds_usd, pnl = total - p.cost_usd;
  return {exit_value_usd: total, cost_usd: p.cost_usd, pnl_usd: pnl, pnl_pct: p.cost_usd > 0 ? pnl / p.cost_usd * 100 : 0, impact};
}
export function roundTripCostPct(trade, liq, c, solPrice) {
  if (trade <= 0) return 100;
  // il deposito dell'account token (~0,002 SOL) non è un costo: si recupera chiudendo l'account vuoto dopo la vendita
  const fixed = c.network_fee_sol_per_swap * 3 * solPrice;
  return 2 * priceImpactPct(trade, liq) + 2 * c.swap_fee_bps / 100 + fixed / trade * 100;
}

// ------------------------------------------------------------------ rischio
export function availableBudget(st, c) {
  const ceiling = Math.min(c.max_capital_usdc, c.max_capital_usdc + st.realized_total);
  return Math.max(0, Math.min(ceiling - st.invested, st.cash));
}
export const dailyLimitHit = (st, c) => st.day_start_equity > 0 && st.daily_loss >= st.day_start_equity * c.daily_loss_limit_pct / 100;

export function checkBuy(tok, st, c, now, solPrice) {
  const r = [], s = tok.snapshot;
  if (c.signal_only) r.push("Modalità solo segnali: nessun acquisto");
  if (st.paused) r.push(`Bot in pausa: ${st.paused}`);
  if (st.daily_locked || dailyLimitHit(st, c)) r.push("Limite di perdita giornaliero raggiunto: nuovi acquisti bloccati fino a domani");
  if (st.active_mints.has(s.mint)) r.push("Posizione già aperta o ordine in corso su questo token (acquisto duplicato)");
  const closedAt = st.recently_closed[s.mint];
  if (closedAt && now - closedAt < c.reentry_cooldown_minutes * 60) r.push("Token venduto di recente: attesa prima di un nuovo ingresso");
  if (st.open_count >= c.max_open_positions) r.push(`Raggiunto il numero massimo di posizioni (${c.max_open_positions})`);
  if (st.last_buy_at && now - st.last_buy_at < c.min_seconds_between_buys) r.push(`Intervallo minimo tra acquisti non trascorso (${c.min_seconds_between_buys}s)`);
  const budget = availableBudget(st, c);
  const amount = Math.round(Math.min(c.max_position_usdc, budget) * 100) / 100;
  if (amount < 1) r.push(`Capitale disponibile insufficiente (${budget.toFixed(2)} USDC entro il limite)`);
  if (st.sol < c.min_sol_reserve) r.push(`SOL per commissioni insufficienti (${st.sol.toFixed(4)} < ${c.min_sol_reserve})`);
  r.push(...tok.blocks);
  if (tok.risk > c.max_risk_score) r.push(`Rischio ${tok.risk} > massimo ${c.max_risk_score}`);
  if (tok.opportunity < c.min_opportunity_score) r.push(`Opportunità ${tok.opportunity} < minimo ${c.min_opportunity_score}`);
  if (amount >= 1) { const rtc = roundTripCostPct(amount, s.liquidity_usd, c, solPrice);
    if (rtc > c.max_round_trip_cost_pct) r.push(`Costo andata/ritorno stimato ${rtc.toFixed(2)}% > massimo ${c.max_round_trip_cost_pct}%`); }
  return {allowed: r.length === 0, amount: r.length ? 0 : amount, reasons: r};
}

export function verifyQuote(expPrice, usdcIn, outRaw, decimals, c, slippageBps, impactPct) {
  const p = [];
  if (!(outRaw > 0) || decimals == null) return ["Quotazione senza quantità in uscita"];
  const eff = usdcIn / (outRaw / 10 ** decimals);
  if (expPrice > 0) { const dev = (eff / expPrice - 1) * 100;
    if (dev > c.max_slippage_bps / 100) p.push(`Prezzo quotato ${dev.toFixed(2)}% peggiore del previsto (max ${(c.max_slippage_bps / 100).toFixed(2)}%)`); }
  if (slippageBps != null && slippageBps > c.max_slippage_bps) p.push(`Slippage consentito ${slippageBps} bps > massimo ${c.max_slippage_bps}`);
  if (impactPct != null && Math.abs(impactPct) > c.max_price_impact_pct) p.push(`Impatto quotato ${Math.abs(impactPct).toFixed(2)}% > massimo ${c.max_price_impact_pct}%`);
  return p;
}

// ------------------------------------------------------------------ uscite
export function evaluateExit(p, price, liq, dataAge, c, now, solPrice, riskFlag = "") {
  if (p.status !== "open") return {action: "none"};
  if (price <= 0 || dataAge > c.max_data_age_s) return {action: "alert", reason: `prezzo non aggiornato (${Math.floor(Math.min(dataAge, 99999))}s): regole d'uscita sospese`};
  const pct = positionNetPnl(p, price, liq, c, solPrice).pnl_pct;
  if (pct > p.peak_net_pct) { p.peak_net_pct = pct; p.peak_price = price; }
  if (riskFlag) return {action: "sell_all", fraction: 1, reason: `segnale di rischio: ${riskFlag}`, pct};
  if (p.entry_liquidity_usd > 0) { const drop = (1 - liq / p.entry_liquidity_usd) * 100;
    if (drop >= c.liquidity_drop_exit_pct) return {action: "sell_all", fraction: 1, reason: `liquidità scesa del ${drop.toFixed(0)}% dall'ingresso`, pct}; }
  if (pct <= -c.stop_loss_pct) return {action: "sell_all", fraction: 1, reason: `stop loss: risultato netto ${pct.toFixed(1)}%`, pct};
  if (c.trailing_stop_pct > 0 && p.peak_net_pct >= c.trailing_activation_pct && p.peak_price > 0) {
    const fall = (1 - price / p.peak_price) * 100;
    if (fall >= c.trailing_stop_pct) return {action: "sell_all", fraction: 1, reason: `trailing stop: -${fall.toFixed(1)}% dal massimo`, pct};
  }
  if (c.partial_take_profit_pct > 0 && !p.partial_done && pct >= c.partial_take_profit_pct)
    return {action: "sell_partial", fraction: c.partial_sell_fraction, reason: `take profit parziale: netto +${pct.toFixed(1)}%`, pct};
  if (pct >= c.take_profit_pct) return {action: "sell_all", fraction: 1, reason: `take profit: netto +${pct.toFixed(1)}%`, pct};
  if (p.opened_at && (now - p.opened_at) / 60 >= c.max_hold_minutes) return {action: "sell_all", fraction: 1, reason: `tempo massimo raggiunto (${c.max_hold_minutes} min)`, pct};
  return {action: "none", pct};
}

// ------------------------------------------------------------------ wallet monitorati
export function classifyTx(tx, wallet) {
  if (!tx?.meta) return null;
  const m = tx.meta, ts = tx.blockTime || 0;
  if (m.err != null) return {kind: "FAILED", ts};
  const keys = tx.transaction.message.accountKeys.map(k => typeof k === "string" ? k : k.pubkey);
  const i = keys.indexOf(wallet); if (i < 0) return null;
  const fee = i === 0 ? m.fee / 1e9 : 0;
  let sol = (m.postBalances[i] - m.preBalances[i]) / 1e9 + fee;
  const d = {};
  for (const [sign, arr] of [[-1, m.preTokenBalances || []], [1, m.postTokenBalances || []]])
    for (const b of arr) { if (b.owner !== wallet) continue;
      const a = b.uiTokenAmount || {}; const ui = a.uiAmount ?? Number(a.amount || 0) / 10 ** (a.decimals || 0);
      d[b.mint] = (d[b.mint] || 0) + sign * ui; }
  sol += d[SOL_MINT] || 0; delete d[SOL_MINT];
  const usdc = d[USDC_MINT] || 0; delete d[USDC_MINT];
  const toks = Object.entries(d).filter(([, v]) => Math.abs(v) > 1e-9);
  const base = []; if (Math.abs(sol) > 0.0005) base.push(["SOL", sol]); if (Math.abs(usdc) > 0.01) base.push(["USDC", usdc]);
  if (toks.length === 1 && base.length === 1) {
    const [mint, q] = toks[0], [b, bd] = base[0];
    if (q > 0 && bd < 0) return {kind: "BUY", ts, mint, qty: q, base: b, price_base: -bd / q};
    if (q < 0 && bd > 0) return {kind: "SELL", ts, mint, qty: -q, base: b, price_base: bd / -q};
  }
  if (toks.length === 1 && !base.length) return {kind: toks[0][1] > 0 ? "TRANSFER_IN" : "TRANSFER_OUT", ts, mint: toks[0][0]};
  return {kind: "OTHER", ts};
}
export const MIN_ROUNDTRIPS = 20;
export function walletStats(txs) {
  const lots = {}, rts = []; let buys = 0, sells = 0, transfers = 0, flips = 0; const lastBuy = {};
  for (const t of [...txs].sort((a, b) => a.ts - b.ts)) {
    if (t.kind === "BUY") { buys++; (lots[t.mint + t.base] ||= []).push([t.qty, t.price_base]); lastBuy[t.mint] = t.ts; }
    else if (t.kind === "SELL") {
      sells++; let q = t.qty, cost = 0, matched = 0; const book = lots[t.mint + t.base] || [];
      while (q > 1e-9 && book.length) { const l = book[0], take = Math.min(q, l[0]); cost += take * l[1]; matched += take; l[0] -= take; q -= take; if (l[0] <= 1e-9) book.shift(); }
      if (matched > 1e-9) { const pnl = t.price_base * matched - cost; rts.push({pnl, pct: cost ? pnl / cost * 100 : 0});
        if (lastBuy[t.mint] != null && t.ts - lastBuy[t.mint] < 120 && Math.abs(pnl) < cost * 0.01) flips++; }
    } else if (t.kind.startsWith("TRANSFER")) transfers++;
  }
  const n = rts.length, flags = [];
  if (n && flips / n > 0.3) flags.push("molti acquisti/vendite in pochi secondi senza guadagno: possibile wash trading");
  if (transfers > buys && transfers > 5) flags.push("molti trasferimenti tra wallet: i 'acquisti' potrebbero essere movimentazioni");
  const st = {buys, sells, transfers, roundtrips: n, flags, sufficient: n >= MIN_ROUNDTRIPS, reliable: false};
  if (n >= MIN_ROUNDTRIPS) {
    const wins = rts.filter(r => r.pnl > 0), gw = wins.reduce((a, r) => a + r.pct, 0), gl = -rts.filter(r => r.pnl <= 0).reduce((a, r) => a + r.pct, 0);
    const sorted = rts.map(r => r.pct).sort((a, b) => a - b), med = sorted[Math.floor(n / 2)];
    Object.assign(st, {win_rate: wins.length / n * 100, median_pnl_pct: med, profit_factor: gl > 0 ? gw / gl : null, worst_pnl_pct: sorted[0]});
    st.reliable = !!(st.profit_factor && st.profit_factor > 1.2 && med > 0 && !flags.length);
    st.verdict = st.reliable ? "risultati storici positivi (non garantiscono il futuro)" : "risultati storici non convincenti";
  } else st.verdict = `dati insufficienti (${n}/${MIN_ROUNDTRIPS} operazioni chiuse ricostruibili)`;
  return st;
}

// ------------------------------------------------------------------ esecutori
export class SimExecutor {
  constructor(eng) { this.e = eng; }
  balances() { return [this.e.data.sim.cash, this.e.data.sim.sol]; }
  async quoteOut(inMint, outMint, raw) {
    try { const q = await this.e.jup.order(inMint, outMint, raw); const o = Number(q?.outAmount || 0); return o > 0 ? o : null; }
    catch { return null; }
  }
  async buy(mint, dec, usdc, expPrice, liq) {
    const c = this.e.cfg, sim = this.e.data.sim;
    if (usdc > sim.cash + 1e-9) return {ok: false, status: "failed", error: "USDC virtuali insufficienti"};
    const inRaw = Math.round(usdc * 1e6);
    let out = await this.quoteOut(USDC_MINT, mint, inRaw), note = "quotazione Jupiter";
    if (out == null) {
      if (!(expPrice > 0)) return {ok: false, status: "failed", error: "prezzo non disponibile"};
      out = Math.floor(usdc * (1 - c.swap_fee_bps / 1e4) * (1 - priceImpactPct(usdc, liq) / 100) / expPrice * 10 ** dec);
      note = "modello (quotazione non disponibile)";
    }
    const pr = verifyQuote(expPrice, usdc, out, dec, c, null, null);
    if (pr.length) return {ok: false, status: "failed", error: pr.join("; ")};
    const fee = c.network_fee_sol_per_swap;
    sim.cash -= usdc; sim.sol -= fee + c.ata_rent_sol;   // il deposito dell'account viene restituito alla chiusura
    return {ok: true, status: "confirmed", in_raw: inRaw, out_raw: out, fee_sol: fee, signature: "SIM", note};
  }
  async sell(mint, dec, qtyRaw, expPrice, liq, _cb, _ia, full = true) {
    const c = this.e.cfg, sim = this.e.data.sim;
    let out = await this.quoteOut(mint, USDC_MINT, qtyRaw);
    if (out == null) {
      if (!(liq > 0) || !(expPrice > 0)) return {ok: false, status: "failed", error: "nessuna liquidità: vendita impossibile"};
      const g = qtyRaw / 10 ** dec * expPrice;
      out = Math.floor(g * (1 - priceImpactPct(g, liq) / 100) * (1 - c.swap_fee_bps / 1e4) * 1e6);
    }
    const fee = c.network_fee_sol_per_swap; sim.cash += out / 1e6; sim.sol -= fee;
    if (full) sim.sol += c.ata_rent_sol - c.network_fee_sol_per_swap;   // chiusura account e recupero deposito
    return {ok: true, status: "confirmed", in_raw: qtyRaw, out_raw: out, fee_sol: fee + (full ? c.network_fee_sol_per_swap : 0), signature: "SIM"};
  }
}

export function b58decode(str) {
  let n = 0n; for (const ch of str) { const i = ALPH.indexOf(ch); if (i < 0) throw new Error("base58 non valido"); n = n * 58n + BigInt(i); }
  const out = []; while (n > 0n) { out.unshift(Number(n & 255n)); n >>= 8n; }
  for (const ch of str) { if (ch !== "1") break; out.unshift(0); }
  return Uint8Array.from(out);
}
const cu16 = n => { const o = []; for (;;) { const b = n & 0x7f; n >>= 7; if (n) o.push(b | 0x80); else { o.push(b); return o; } } };
// Transazione legacy con istruzioni SPL Token CloseAccount (indice 9): destinazione = proprietario.
// Il bot può solo restituire a te il deposito degli account VUOTI: nessun trasferimento verso terzi.
export function buildCloseAccountsTx(owner, accs, blockhash) {
  const progs = [...new Set(accs.map(a => a.program))];
  const keys = [owner, ...accs.map(a => a.address), ...progs];
  const msg = [1, 0, progs.length, ...cu16(keys.length)];
  for (const k of keys) msg.push(...b58decode(k));
  msg.push(...b58decode(blockhash), ...cu16(accs.length));
  accs.forEach((a, i) => msg.push(1 + accs.length + progs.indexOf(a.program), ...cu16(3), 1 + i, 0, 0, ...cu16(1), 9));
  return Uint8Array.from([...cu16(1), ...new Array(64).fill(0), ...msg]);
}
const b64ToBytes = b => Uint8Array.from(atob(b), ch => ch.charCodeAt(0));
const bytesToB64 = u => { let s = ""; for (const x of u) s += String.fromCharCode(x); return btoa(s); };

export class WalletExecutor {
  // Firma tramite il wallet dell'utente (Phantom/Solflare): ogni transazione richiede la sua conferma.
  constructor(eng) { this.e = eng; }
  async balances() {
    const o = this.e.wallet.address;
    return [Number(await this.e.rpc.tokenBalanceRaw(o, USDC_MINT)) / 1e6, await this.e.rpc.solBalance(o)];
  }
  async swap(inMint, outMint, inRaw, check, onSubmitted, abortable) {
    const e = this.e, w = e.wallet;
    if (abortable && e.aborted) return {ok: false, status: "aborted", error: "STOP premuto prima della richiesta"};
    let o, solBefore = null;
    try { solBefore = await e.rpc.solBalance(w.address).catch(() => null); o = await e.jup.order(inMint, outMint, inRaw, w.address); }
    catch (x) { return {ok: false, status: "failed", error: `quotazione non ottenuta: ${x.message}`}; }
    if (!o?.transaction) return {ok: false, status: "failed", error: `Jupiter: nessuna transazione (${o?.router || "?"} codice ${o?.errorCode}: ${o?.errorMessage || ""})`};
    if ((o.inputMint && o.inputMint !== inMint) || (o.outputMint && o.outputMint !== outMint)) return {ok: false, status: "failed", error: "la quotazione riguarda token diversi da quelli richiesti"};
    if (o.inAmount != null && BigInt(o.inAmount) !== BigInt(inRaw)) return {ok: false, status: "failed", error: "importo della quotazione diverso da quello richiesto"};
    const out = Number(o.outAmount || 0);
    const pr = check(out, o); if (pr.length) return {ok: false, status: "failed", error: pr.join("; ")};
    if (abortable && e.aborted) return {ok: false, status: "aborted", error: "STOP premuto prima della firma"};
    let signedB64;
    try {
      const signed = await w.signBytes(b64ToBytes(o.transaction));   // il wallet mostra la richiesta di conferma
      signedB64 = bytesToB64(signed);
    } catch (x) { return {ok: false, status: "aborted", error: `firma rifiutata o non riuscita nel wallet (${x.message || x})`}; }
    if (abortable && e.aborted) return {ok: false, status: "aborted", error: "STOP premuto prima dell'invio"};
    onSubmitted?.(o.requestId, out);
    let r;
    try { r = await e.jup.execute(signedB64, o.requestId); }
    catch (x) { return {ok: false, status: "unknown", error: `esito di /execute sconosciuto: ${x.message}`, request_id: o.requestId}; }
    const sig = r?.signature || "";
    if (r?.status !== "Success") return {ok: false, status: sig ? "unknown" : "failed", signature: sig, error: `Jupiter: ${r?.error || "Failed"} (codice ${r?.code})`};
    let note = "";
    try { const st = await e.rpc.signatureStatus(sig);
      if (st?.err != null) return {ok: false, status: "failed", signature: sig, error: `fallita on-chain: ${JSON.stringify(st.err)}`};
      if (!st) note = "conferma fornita da Jupiter (RPC non ancora aggiornato)";
    } catch { note = "conferma fornita da Jupiter (RPC non raggiungibile)"; }
    let fee = e.cfg.network_fee_sol_per_swap;
    if (solBefore != null) { const after = await e.rpc.solBalance(w.address).catch(() => null);
      if (after != null) { fee = Math.max(0, solBefore - after);
        if (fee >= e.cfg.ata_rent_sol) fee -= e.cfg.ata_rent_sol; } }   // il deposito account è recuperabile, non un costo
    return {ok: true, status: "confirmed", in_raw: Number(r.totalInputAmount || inRaw), out_raw: Number(r.totalOutputAmount || out), fee_sol: fee, signature: sig, note};
  }
  buy(mint, dec, usdc, expPrice, liq, onSubmitted) {
    const c = this.e.cfg;
    return this.swap(USDC_MINT, mint, Math.round(usdc * 1e6), (out, o) => {
      let imp = o.priceImpact != null ? Number(o.priceImpact) : null; if (!isFinite(imp)) imp = null;
      return verifyQuote(expPrice, usdc, out, dec, c, o.slippageBps ?? null, imp);
    }, onSubmitted, true);
  }
  async sell(mint, dec, qtyRaw, expPrice, liq, onSubmitted, ignoreAbort) {
    const c = this.e.cfg;
    let chain;
    try { chain = Number(await this.e.rpc.tokenBalanceRaw(this.e.wallet.address, mint)); }
    catch (x) { return {ok: false, status: "failed", error: `saldo token non verificabile: ${x.message}`}; }
    qtyRaw = Math.min(qtyRaw, chain);
    if (qtyRaw <= 0) return {ok: false, status: "failed", error: "nessun token da vendere nel wallet"};
    return this.swap(mint, USDC_MINT, qtyRaw, (out, o) => {
      const p = [];
      if (o.slippageBps != null && o.slippageBps > c.max_slippage_bps) p.push(`slippage ${o.slippageBps} bps > massimo ${c.max_slippage_bps}`);
      if (expPrice > 0 && out > 0) { const gross = qtyRaw / 10 ** dec * expPrice, got = out / 1e6;
        if (got < gross * 0.5) p.push(`incasso quotato ${got.toFixed(2)}$ meno della metà del valore atteso (${gross.toFixed(2)}$): liquidità insufficiente, serve una decisione manuale`); }
      return p;
    }, onSubmitted, !ignoreAbort);
  }
}

// ------------------------------------------------------------------ motore
const STATE_LABELS = {STOPPED: "FERMO", RUNNING: "ATTIVO", PAUSED: "IN PAUSA", ERROR: "ERRORE"};

export function emptyData() {
  return {version: 1, settings: {...DEFAULTS}, positions: [], orders: [], events: [], sim: {cash: DEFAULTS.initial_capital_usdc, sol: 0.1},
    daily: {}, last_buy: {sim: 0, real: 0}, watchlist: [], wtx: {}, wseen: {}};
}

export class Engine {
  constructor(deps) {
    // deps: {fetch, sleep, nowMs, load(), save(data), notify?(msg)}
    this.deps = deps;
    this.data = deps.load() || emptyData();
    this.data.settings = {...DEFAULTS, ...this.data.settings, mode: "simulation"};   // all'avvio sempre simulazione
    this.cfg = this.data.settings;
    this.jup = new Jupiter(deps, this.cfg.jupiter_api_key);
    this.dex = new DexScreener(deps);
    this.rpc = new Rpc(deps, this.cfg.rpc_url);
    this.sim = new SimExecutor(this); this.live = new WalletExecutor(this);
    this.wallet = null;            // {address, name, signBytes}
    this.state = "STOPPED"; this.pause = ""; this.errorReason = ""; this.running = false; this.aborted = false;
    this.solPrice = 0; this.solPriceAt = 0; this.realBal = [0, 0]; this.realBalAt = 0;
    this.lastScanAt = 0; this.lastScanOk = 0; this.lastPosRefresh = 0; this.lastWatch = 0;
    this.scanned = []; this.infoCache = {}; this.posSnaps = {}; this.decisions = {};
    this.proposals = []; this.alerts = []; this.txFailures = 0; this.busy = ""; this.ticking = false;
    this.walletStats = {};
    for (const p of this.data.positions) if (p.status === "opening" || p.status === "closing") {
      const pend = this.data.orders.find(o => o.position_id === p.id && ["submitted", "unknown"].includes(o.status));
      if (!pend) p.status = p.status === "opening" ? "failed" : "open";
    }
    this.log("INFO", "AVVIO", "App aperta: stato FERMO, modalità simulazione.");
  }

  now() { return this.deps.nowMs() / 1000; }
  get family() { return this.cfg.mode === "simulation" ? "sim" : "real"; }
  save() { try { this.deps.save(this.data); } catch (e) { /* storage pieno o non disponibile */ } }
  log(level, cat, msg) {
    const ev = [this.now(), level, cat, msg];
    this.data.events.unshift(ev); if (this.data.events.length > 400) this.data.events.length = 400;
    if (level === "ALERT" || level === "ERROR") { this.alerts.unshift({ts: ev[0], level, category: cat, message: msg}); this.alerts.length = Math.min(this.alerts.length, 30); }
    this.save();
  }
  active(fam = this.family) { return this.data.positions.filter(p => p.family === fam && ["opening", "open", "closing"].includes(p.status)); }
  pendingOrders(fam = this.family) { return this.data.orders.filter(o => o.family === fam && ["submitted", "unknown"].includes(o.status)); }

  // ------------------------------- comandi
  start() {
    if (this.state === "RUNNING" || this.state === "PAUSED") return [false, "Il bot è già avviato"];
    const errs = validateSettings(this.cfg); if (errs.length) return [false, "Impostazioni non valide: " + errs.join("; ")];
    if (this.family === "real" && !this.wallet) return [false, "Modalità reale: collega prima il wallet"];
    this.aborted = false; this.running = true; this.state = "RUNNING"; this.txFailures = 0; this.errorReason = "";
    this.log("INFO", "BOT", `START - modalità ${MODE_LABELS[this.cfg.mode]}${this.cfg.signal_only ? " (solo segnali)" : ""}`);
    return [true, "Bot avviato"];
  }
  stop(reason = "premuto STOP") {
    this.running = false; this.aborted = true;
    for (const p of this.proposals) if (p.status === "pending") p.status = "rejected";
    if (this.state !== "ERROR") this.state = "STOPPED"; this.pause = "";
    const n = this.active().length;
    this.log("WARN", "BOT", `STOP (${reason}). Nessun nuovo ordine verrà inviato.` + (n ? ` Restano ${n} posizioni aperte NON gestite finché il bot è fermo.` : ""));
  }
  failHard(reason) { this.state = "ERROR"; this.errorReason = reason; this.stop(reason); this.state = "ERROR";
    this.log("ALERT", "BOT", `Bot fermato automaticamente: ${reason}. Controlla e premi START per riprendere.`); }
  setMode(mode, confirm, acceptRisk) {
    if (!MODE_LABELS[mode]) return [false, "Modalità sconosciuta"];
    if (this.state === "RUNNING" || this.state === "PAUSED") return [false, "Ferma il bot prima di cambiare modalità"];
    if (mode === "manual") {
      if (!this.wallet) return [false, "Collega prima il wallet (apri l'app dentro Phantom o Solflare)"];
      if (String(confirm || "").trim().toUpperCase() !== "CONFERMO" || !acceptRisk) return [false, "Conferma mancante: accetta il rischio e scrivi CONFERMO"];
      if (this.realBal[1] < this.cfg.min_sol_reserve) return [false, `SOL insufficienti per le commissioni (${this.realBal[1].toFixed(4)} < ${this.cfg.min_sol_reserve})`];
    }
    this.cfg.mode = mode; this.save();
    this.log("INFO", "MODALITÀ", `Modalità impostata: ${MODE_LABELS[mode]}`);
    const other = mode === "simulation" ? "real" : "sim";
    if (this.active(other).length) this.log("ALERT", "MODALITÀ", `Ci sono posizioni aperte nell'altra modalità: non verranno gestite finché resti in questa.`);
    return [true, "ok"];
  }
  updateSettings(incoming) {
    const n = {...this.cfg};
    for (const [k, v] of Object.entries(incoming)) if (k in DEFAULTS && k !== "mode") {
      if (k === "jupiter_api_key" && v === "") continue;
      n[k] = typeof DEFAULTS[k] === "number" ? Number(v) : typeof DEFAULTS[k] === "boolean" ? !!v : String(v);
    }
    const errs = validateSettings(n); if (errs.length) return [false, errs.join("\n")];
    Object.assign(this.cfg, n);
    this.jup.apiKey = n.jupiter_api_key; this.jup.http.minInterval = 1000 / (n.jupiter_api_key ? 0.9 : 0.45);
    this.rpc.url = n.rpc_url; this.save();
    this.log("INFO", "IMPOSTAZIONI", "Impostazioni salvate");
    return [true, "Impostazioni salvate"];
  }
  async connectWallet(w) {
    // w: {address, name, signBytes(Uint8Array) -> Uint8Array, disconnect?}  (vedi wallet.js, Wallet Standard)
    const pk = w.address;
    if (!isValidPubkey(pk)) throw new Error("Il wallet non ha restituito un indirizzo valido");
    this.wallet = w; const name = w.name;
    this.log("INFO", "WALLET", `Wallet ${name} collegato: ${pk}`);
    try { this.realBal = await this.live.balances(); this.realBalAt = this.now(); } catch (e) { this.log("WARN", "WALLET", `Saldo non leggibile: ${e.message}`); }
    return pk;
  }
  disconnectWallet() {
    if (this.family === "real" && this.state !== "STOPPED" && this.state !== "ERROR") return [false, "Ferma il bot prima di scollegare il wallet"];
    if (this.family === "real") this.cfg.mode = "simulation";
    try { this.wallet?.disconnect?.(); } catch { }
    this.wallet = null; this.log("INFO", "WALLET", "Wallet scollegato"); return [true, "Wallet scollegato"];
  }
  addWatch(addr, label) {
    addr = String(addr || "").trim();
    if (!isValidPubkey(addr)) return [false, "Indirizzo Solana non valido"];
    if (!this.data.watchlist.find(w => w.address === addr)) this.data.watchlist.push({address: addr, label: String(label || "").trim().slice(0, 40)});
    this.lastWatch = 0; this.save(); this.log("INFO", "WATCHLIST", `Aggiunto wallet ${addr}`); return [true, "Wallet aggiunto"];
  }
  removeWatch(addr) {
    this.data.watchlist = this.data.watchlist.filter(w => w.address !== addr);
    delete this.data.wtx[addr]; delete this.data.wseen[addr]; delete this.walletStats[addr]; this.save();
  }
  resetSim() {
    if (this.state === "RUNNING" || this.state === "PAUSED") return [false, "Ferma il bot prima di azzerare la simulazione"];
    this.data.positions = this.data.positions.filter(p => p.family !== "sim");
    this.data.orders = this.data.orders.filter(o => o.family !== "sim");
    for (const k of Object.keys(this.data.daily)) if (k.endsWith("|sim")) delete this.data.daily[k];
    this.data.sim = {cash: this.cfg.initial_capital_usdc, sol: 0.1}; this.data.last_buy.sim = 0; this.save();
    this.log("INFO", "SIMULAZIONE", "Simulazione azzerata"); return [true, "Simulazione azzerata"];
  }
  reject(id) { const p = this.proposals.find(x => x.id === id); if (p?.status === "pending") { p.status = "rejected"; this.log("INFO", "PROPOSTA", `Proposta rifiutata: ${p.symbol}`); } }

  async approve(id) {
    const now = this.now(), pr = this.proposals.find(x => x.id === id);
    if (!pr || pr.status !== "pending") return [false, "Proposta non più disponibile"];
    if (now > pr.expires_at) { pr.status = "expired"; return [false, "Proposta scaduta"]; }
    if (!this.running) { pr.status = "rejected"; return [false, "Il bot non è attivo"]; }
    pr.status = "approved";
    await this.withLock(async () => {
      if (pr.kind === "buy") {
        const tok = this.scanned.find(t => t.snapshot.mint === pr.mint);
        if (!tok) { this.log("WARN", "PROPOSTA", `${pr.symbol}: dati non più disponibili`); return; }
        const d = checkBuy(tok, this.accountState(now), this.cfg, now, this.solPrice);
        if (!d.allowed) { this.log("WARN", "PROPOSTA", `${pr.symbol}: acquisto non più consentito: ${d.reasons.slice(0, 3).join("; ")}`); return; }
        await this.executeBuy(tok, Math.min(pr.amount_usdc, d.amount), now);
      } else {
        const p = this.data.positions.find(x => x.id === pr.position_id);
        if (p?.status === "open") await this.executeSell(p, pr.fraction, pr.reason + " (approvata)", now);
      }
    });
    pr.status = "done"; return [true, "Eseguita: controlla l'esito nel log"];
  }
  async liquidateAll(confirm) {
    if (String(confirm || "").trim().toUpperCase() !== "LIQUIDA") return [false, "Conferma non valida"];
    if (this.family === "real" && !this.wallet) return [false, "Collega prima il wallet"];
    const list = this.active().filter(p => p.status === "open");
    this.log("ALERT", "LIQUIDAZIONE", `Liquidazione richiesta dall'utente: ${list.length} posizioni`);
    await this.withLock(async () => { for (const p of list) await this.executeSell(p, 1, "liquidazione richiesta dall'utente", this.now(), true); });
    return [true, "Liquidazione tentata: controlla il log"];
  }
  async withLock(fn) {
    while (this.ticking) await this.deps.sleep(200);
    this.ticking = true; try { await fn(); } finally { this.ticking = false; }
  }

  // ------------------------------- ciclo
  async tick() {
    if (this.ticking) return; this.ticking = true;
    try {
      const now = this.now();
      for (const p of this.proposals) if (p.status === "pending" && now > p.expires_at) p.status = "expired";
      this.proposals = this.proposals.filter(p => p.status === "pending" || now - p.created_at < 600);
      await this.reconcile(now);
      if (!this.running) return;
      await this.refreshMarket(now);
      if (!this.running) return;
      this.updateDaily(now);
      await this.runExits(now);
      if (this.state === "RUNNING" && this.running) await this.runEntries(now);
    } catch (e) {
      this.log("ERROR", "MOTORE", `Errore imprevisto: ${e.message || e}`); this.failHard("errore imprevisto");
    } finally { this.ticking = false; }
  }

  async refreshMarket(now) {
    const c = this.cfg, probs = [];
    if (now - this.solPriceAt > 60) { try { this.solPrice = await this.jup.solPrice(); this.solPriceAt = now; } catch (e) { this.log("WARN", "API", `Prezzo SOL: ${e.message}`); } }
    if (!this.solPrice || now - this.solPriceAt > 600) probs.push("prezzo SOL non disponibile");
    if (this.family === "real" && this.wallet && now - this.realBalAt > 20) {
      try { this.realBal = await this.live.balances(); this.realBalAt = now; } catch (e) { this.log("WARN", "API", `Saldi wallet: ${e.message}`); }
    }
    if (this.family === "real" && now - this.realBalAt > 120) probs.push("saldi del wallet non aggiornati (RPC)");
    const act = this.active();
    if (act.length && now - this.lastPosRefresh >= c.position_refresh_s) {
      try { const pairs = await this.dex.tokenPairs(act.map(p => p.mint));
        for (const p of act) this.posSnaps[p.mint] = buildSnapshot(p.mint, pairs[p.mint], this.infoCache[p.mint], now);
        this.lastPosRefresh = now; } catch (e) { this.log("WARN", "API", `Prezzi posizioni: ${e.message}`); }
    }
    if (this.data.watchlist.length && now - this.lastWatch >= 120) { this.lastWatch = now;
      try { await this.refreshWatch(now); } catch (e) { this.log("WARN", "API", `Watchlist: ${e.message}`); } }
    if (now - this.lastScanAt >= c.scan_interval_s) {
      this.lastScanAt = now;
      try { await this.scan(now); this.lastScanOk = now; } catch (e) { this.log("WARN", "API", `Scansione mercato: ${e.message}`); }
    }
    if (now - this.lastScanOk > c.max_data_age_s + c.scan_interval_s) probs.push("dati di mercato obsoleti");
    const errs = Math.max(this.dex.http.errors, this.jup.http.errors);
    if (errs >= c.max_consecutive_api_errors) probs.push(`${errs} errori API consecutivi`);
    if (probs.length && this.state === "RUNNING") { this.state = "PAUSED"; this.pause = probs.join(", "); this.log("ALERT", "PAUSA", `Pausa automatica: ${this.pause}. Nuovi acquisti sospesi.`); }
    else if (probs.length && this.state === "PAUSED") this.pause = probs.join(", ");
    else if (!probs.length && this.state === "PAUSED") { this.state = "RUNNING"; this.pause = ""; this.log("INFO", "PAUSA", "Dati di nuovo disponibili: bot ripartito"); }
  }

  async scan(now) {
    const infos = {};
    for (const f of [() => this.jup.category("toptrending"), () => this.jup.category("toporganicscore"), () => this.jup.recent()])
      for (const t of (await f()) || []) { const i = parseTokenInfo(t); if (i.mint && !EXCLUDED.has(i.mint)) infos[i.mint] = i; }
    const signals = this.traderSignals(now);
    const missing = Object.keys(signals).filter(m => !infos[m] && !EXCLUDED.has(m));
    if (missing.length) for (const t of (await this.jup.search(missing)) || []) { const i = parseTokenInfo(t); if (i.mint) infos[i.mint] = i; }
    Object.assign(this.infoCache, infos);
    const mints = Object.keys(infos).slice(0, 90);
    const pairs = mints.length ? await this.dex.tokenPairs(mints) : {};
    const res = mints.map(m => { const s = buildSnapshot(m, pairs[m], infos[m], now); if (signals[m]) s.trader_signal = signals[m]; return scoreToken(s, this.cfg, now); });
    res.sort((a, b) => (a.blocks.length > 0) - (b.blocks.length > 0) || (b.opportunity - b.risk) - (a.opportunity - a.risk));
    this.scanned = res;
  }

  accountState(now) {
    const fam = this.family, act = this.active(fam), closed = this.data.positions.filter(p => p.family === fam && p.status === "closed");
    const [cash, sol] = fam === "sim" ? this.sim.balances() : this.realBal;
    const rec = this.data.daily[`${dayKey(now)}|${fam}`] || {};
    const recently = {}; for (const p of closed) if (p.closed_at && now - p.closed_at < this.cfg.reentry_cooldown_minutes * 60) recently[p.mint] = p.closed_at;
    return {cash, sol, invested: act.reduce((a, p) => a + (p.cost_usd || p.usdc_spent), 0),
      realized_total: closed.reduce((a, p) => a + p.realized_pnl_usd, 0), open_count: act.length,
      active_mints: new Set([...act.map(p => p.mint), ...this.pendingOrders(fam).map(o => o.mint)]),
      recently_closed: recently, last_buy_at: this.data.last_buy[fam] || 0, daily_loss: rec.loss || 0,
      day_start_equity: rec.start_equity || 0, daily_locked: !!rec.locked, paused: this.state === "PAUSED" ? this.pause : ""};
  }
  unrealized(p) {
    const s = this.posSnaps[p.mint], price = s?.price_usd || p.last_price, liq = s?.liquidity_usd || p.last_liquidity_usd;
    if (!price || !["open", "closing"].includes(p.status)) return [0, 0];
    const n = positionNetPnl(p, price, liq, this.cfg, this.solPrice); return [n.pnl_usd, n.exit_value_usd - p.proceeds_usd];
  }
  updateDaily(now) {
    const fam = this.family, key = `${dayKey(now)}|${fam}`, st = this.accountState(now);
    const open = this.active(fam).filter(p => p.status !== "opening");
    let rec = this.data.daily[key];
    if (!rec) {
      const val = open.reduce((a, p) => a + this.unrealized(p)[1], 0);
      const eq = Math.min(this.cfg.max_capital_usdc, st.cash + val);
      rec = {start_equity: eq, start_unreal: Object.fromEntries(open.map(p => [p.id, this.unrealized(p)[0]])), loss: 0, pnl: 0, locked: false};
      this.log("INFO", "GIORNATA", `Nuova giornata ${dayKey(now)}: capitale di riferimento ${eq.toFixed(2)} USD, perdita massima ${(eq * this.cfg.daily_loss_limit_pct / 100).toFixed(2)} USD`);
    }
    let pnl = 0;
    for (const p of this.data.positions) if (p.family === fam && p.status === "closed" && p.closed_at && dayKey(p.closed_at) === dayKey(now)) pnl += p.realized_pnl_usd - (rec.start_unreal[p.id] || 0);
    for (const p of open) pnl += this.unrealized(p)[0] - (rec.start_unreal[p.id] || 0);
    rec.pnl = pnl; rec.loss = Math.max(0, -pnl);
    if (!rec.locked && rec.start_equity > 0 && rec.loss >= rec.start_equity * this.cfg.daily_loss_limit_pct / 100) {
      rec.locked = true;
      this.log("ALERT", "RISCHIO", `Limite di perdita giornaliero raggiunto (${rec.loss.toFixed(2)} USD). Nuovi acquisti BLOCCATI fino a domani. Le posizioni aperte restano gestite dalle regole d'uscita.`);
    }
    this.data.daily[key] = rec; this.save();
  }

  async runExits(now) {
    for (const p of this.active()) {
      if (p.status !== "open") continue;
      const s = this.posSnaps[p.mint];
      if (s?.price_usd) { p.last_price = s.price_usd; p.last_liquidity_usd = s.liquidity_usd; p.last_price_at = s.fetched_at; }
      const age = p.last_price_at ? now - p.last_price_at : 1e9;
      const d = evaluateExit(p, p.last_price, p.last_liquidity_usd, age, this.cfg, now, this.solPrice, s?.freeze_authority_disabled === false ? "freeze authority attiva" : "");
      if (d.action === "alert") { if (!p._alertAt || now - p._alertAt > 300) { p._alertAt = now; this.log("ALERT", "RISCHIO", `${p.symbol}: ${d.reason}`); } }
      else if (d.action === "sell_all" || d.action === "sell_partial") {
        if (now < (p.retry_after || 0)) continue;
        if (this.family === "real") this.proposeSell(p, d.fraction, d.reason, now);
        else await this.executeSell(p, d.fraction, d.reason, now);
        if (!this.running) return;
      }
    }
    this.save();
  }
  async runEntries(now) {
    if (!this.solPrice) return;
    const st = this.accountState(now);
    for (const tok of this.scanned.slice(0, 15)) {
      const d = checkBuy(tok, st, this.cfg, now, this.solPrice);
      this.decisions[tok.snapshot.mint] = d.reasons;
      if (!d.allowed) continue;
      if (this.family === "real") this.proposeBuy(tok, d.amount, now);
      else await this.executeBuy(tok, d.amount, now);
      return;
    }
  }
  proposeBuy(tok, amount, now) {
    if (this.proposals.some(p => p.mint === tok.snapshot.mint && p.status === "pending")) return;
    this.proposals.push({id: newId("prop"), kind: "buy", mint: tok.snapshot.mint, symbol: tok.snapshot.symbol, created_at: now,
      expires_at: now + this.cfg.proposal_ttl_s, amount_usdc: amount, reason: tok.opportunity_reasons.slice(0, 4).join("; "),
      risk: tok.risk, opportunity: tok.opportunity, status: "pending"});
    this.log("ALERT", "PROPOSTA", `Proposta ACQUISTO ${tok.snapshot.symbol} per ${amount.toFixed(2)} USDC (opportunità ${tok.opportunity}, rischio ${tok.risk})`);
    this.deps.notify?.(`Proposta di acquisto: ${tok.snapshot.symbol}`);
  }
  proposeSell(p, fraction, reason, now) {
    if (this.proposals.some(x => x.position_id === p.id && x.status === "pending")) return;
    this.proposals.push({id: newId("prop"), kind: "sell", mint: p.mint, symbol: p.symbol, created_at: now,
      expires_at: now + this.cfg.proposal_ttl_s, position_id: p.id, fraction, reason, status: "pending"});
    this.log("ALERT", "PROPOSTA", `Proposta VENDITA ${p.symbol} (${Math.round(fraction * 100)}%): ${reason}`);
    this.deps.notify?.(`Proposta di vendita: ${p.symbol} - ${reason}`);
  }

  executor() { if (this.family === "real") { if (!this.wallet) throw new Error("wallet non collegato"); return this.live; } return this.sim; }

  async executeBuy(tok, amount, now) {
    const c = this.cfg, mint = tok.snapshot.mint;
    let fresh;
    try { const pairs = await this.dex.tokenPairs([mint]);
      let info = this.infoCache[mint];
      if (this.family === "real") { const r = await this.jup.search([mint]); const i = r?.[0] && parseTokenInfo(r[0]); if (i?.mint === mint) { info = i; this.infoCache[mint] = i; } }
      fresh = buildSnapshot(mint, pairs[mint], info, now);
    } catch (e) { this.log("WARN", "ACQUISTO", `${tok.snapshot.symbol}: ricontrollo fallito (${e.message}), acquisto annullato`); return; }
    fresh.trader_signal = tok.snapshot.trader_signal;
    const rs = scoreToken(fresh, c, now, amount), d = checkBuy(rs, this.accountState(now), c, now, this.solPrice);
    if (!d.allowed) { this.log("WARN", "ACQUISTO", `${fresh.symbol}: annullato al ricontrollo: ${d.reasons.slice(0, 3).join("; ")}`); return; }
    amount = Math.min(amount, d.amount);
    if (fresh.decimals == null) { this.log("WARN", "ACQUISTO", `${fresh.symbol}: decimali sconosciuti, annullato`); return; }
    if (this.aborted) return;
    const fam = this.family;
    const pos = {id: newId("pos"), mint, symbol: fresh.symbol, family: fam, status: "opening", decimals: fresh.decimals,
      qty: 0, qty_raw: 0, initial_qty: 0, usdc_spent: 0, cost_usd: 0, entry_price: 0, entry_liquidity_usd: fresh.liquidity_usd,
      opened_at: now, closed_at: 0, peak_net_pct: 0, peak_price: 0, proceeds_usd: 0, partial_done: false, exit_reason: "",
      realized_pnl_usd: 0, last_price: fresh.price_usd, last_liquidity_usd: fresh.liquidity_usd, last_price_at: fresh.fetched_at,
      entry_score: {risk: rs.risk, opportunity: rs.opportunity, reasons: rs.opportunity_reasons.slice(0, 5)}, notes: []};
    const order = {id: newId("ord"), position_id: pos.id, side: "buy", family: fam, status: "created", mint, created_at: now,
      amount_in_raw: Math.round(amount * 1e6), signature: "", error: "", reason: "ingresso", fraction: 1};
    this.data.positions.unshift(pos); this.data.orders.unshift(order); this.data.last_buy[fam] = now; this.save();
    this.busy = fam === "real" ? `Conferma l'acquisto di ${fresh.symbol} nel wallet…` : `Acquisto ${fresh.symbol}…`;
    this.log("TRADE", "ACQUISTO", `${fresh.symbol}: ordine da ${amount.toFixed(2)} USDC (${fam === "sim" ? "simulato" : "REALE"})`);
    let fill;
    try { fill = await this.executor().buy(mint, pos.decimals, amount, fresh.price_usd, fresh.liquidity_usd,
      (rid, out) => { order.status = "submitted"; order.request_id = rid; order.expected_out_raw = out; this.save(); }); }
    finally { this.busy = ""; }
    this.applyBuy(pos, order, fill, now);
  }
  applyBuy(pos, order, f, now) {
    order.status = f.status; order.signature = f.signature || order.signature; order.error = f.ok ? "" : f.error;
    if (f.ok) {
      const usdc = f.in_raw / 1e6; pos.qty_raw = f.out_raw; pos.qty = pos.initial_qty = f.out_raw / 10 ** pos.decimals;
      pos.usdc_spent = usdc; pos.cost_usd = usdc + f.fee_sol * this.solPrice; pos.entry_price = pos.qty ? pos.cost_usd / pos.qty : 0;
      pos.status = "open"; pos.opened_at = now; this.txFailures = 0;
      this.log("TRADE", "ACQUISTO", `${pos.symbol}: CONFERMATO ${pos.qty.toLocaleString("it-IT", {maximumFractionDigits: 2})} token per ${usdc.toFixed(2)} USDC, costo totale ${pos.cost_usd.toFixed(2)} USD${f.note ? ` [${f.note}]` : ""}`);
    } else if (f.status === "unknown") {
      this.log("ALERT", "ACQUISTO", `${pos.symbol}: esito non ancora noto (${f.error}). Verifica automatica, nessun nuovo tentativo.`);
    } else {
      pos.status = "failed"; pos.notes.push(f.error);
      if (f.status === "failed") { this.txFailures++; this.log("ALERT", "ACQUISTO", `${pos.symbol}: FALLITO - ${f.error}`); }
      else this.log("WARN", "ACQUISTO", `${pos.symbol}: annullato - ${f.error}`);
    }
    this.save(); this.checkFailures();
  }
  async executeSell(p, fraction, reason, now, ignoreAbort = false) {
    if (p.status !== "open") return;
    fraction = fraction >= 0.999 ? 1 : fraction;
    const qty = fraction === 1 ? p.qty_raw : Math.floor(p.qty_raw * fraction); if (qty <= 0) return;
    p.status = "closing";
    const order = {id: newId("ord"), position_id: p.id, side: "sell", family: p.family, status: "created", mint: p.mint, created_at: now,
      amount_in_raw: qty, signature: "", error: "", reason, fraction};
    this.data.orders.unshift(order); this.save();
    this.busy = p.family === "real" ? `Conferma la vendita di ${p.symbol} nel wallet…` : `Vendita ${p.symbol}…`;
    this.log("TRADE", "VENDITA", `${p.symbol}: vendita ${Math.round(fraction * 100)}% - motivo: ${reason}`);
    let f;
    try { f = await this.executor().sell(p.mint, p.decimals, qty, p.last_price, p.last_liquidity_usd,
      (rid, out) => { order.status = "submitted"; order.request_id = rid; order.expected_out_raw = out; this.save(); }, ignoreAbort, fraction === 1); }
    finally { this.busy = ""; }
    this.applySell(p, order, f, now);
  }
  applySell(p, order, f, now) {
    order.status = f.status; order.signature = f.signature || order.signature; order.error = f.ok ? "" : f.error;
    if (f.ok) {
      const proceeds = f.out_raw / 1e6 - f.fee_sol * this.solPrice;
      p.proceeds_usd += proceeds; p.qty_raw = Math.max(0, p.qty_raw - f.in_raw); p.qty = p.qty_raw / 10 ** p.decimals;
      if (order.fraction === 1 || p.qty <= p.initial_qty * 0.001) {
        p.status = "closed"; p.closed_at = now; p.exit_reason = order.reason; p.realized_pnl_usd = p.proceeds_usd - p.cost_usd;
        this.log("TRADE", "VENDITA", `${p.symbol}: CHIUSA - incasso ${p.proceeds_usd.toFixed(2)} USD, risultato ${p.realized_pnl_usd >= 0 ? "+" : ""}${p.realized_pnl_usd.toFixed(2)} USD (${(p.realized_pnl_usd / p.cost_usd * 100).toFixed(1)}%)`);
      } else { p.status = "open"; p.partial_done = true; this.log("TRADE", "VENDITA", `${p.symbol}: vendita parziale confermata, incasso ${proceeds.toFixed(2)} USD`); }
      this.txFailures = 0;
    } else if (f.status === "unknown") {
      this.log("ALERT", "VENDITA", `${p.symbol}: esito non ancora noto (${f.error}). Verifica in corso.`);
    } else {
      p.status = "open"; p.sell_fails = (p.sell_fails || 0) + 1;
      const wait = 2 ** Math.min(p.sell_fails - 1, 5); p.retry_after = now + 60 * wait; p.notes.push(`vendita fallita: ${f.error}`);
      if (f.status === "failed") { this.txFailures++;
        this.log("ALERT", "VENDITA", `${p.symbol}: vendita FALLITA (${f.error}). Nuovo tentativo non prima di ${wait} min.${p.sell_fails >= 2 ? " INTERVENTO RICHIESTO: valuta una vendita manuale." : ""}`); }
      else this.log("WARN", "VENDITA", `${p.symbol}: vendita annullata (${f.error})`);
    }
    this.save(); this.checkFailures();
  }
  checkFailures() { if (this.txFailures >= this.cfg.max_consecutive_tx_failures) { this.txFailures = 0; this.failHard(`${this.cfg.max_consecutive_tx_failures} transazioni fallite di seguito`); } }

  async reconcile(now) {
    for (const o of this.data.orders.filter(x => ["submitted", "unknown", "created"].includes(x.status))) {
      const p = this.data.positions.find(x => x.id === o.position_id); if (!p) continue;
      if (o.family === "sim" || o.status === "created") {
        if (now - o.created_at < 120) continue;
        o.status = "aborted"; o.error = "interrotto (app chiusa durante l'operazione)";
        p.status = o.side === "buy" ? (p.status === "opening" ? "failed" : p.status) : "open"; this.save(); continue;
      }
      if (!this.wallet || now - (o.checked_at || 0) < 10) continue;
      o.checked_at = now;
      let f = null;
      try {
        if (o.signature) { const st = await this.rpc.signatureStatus(o.signature);
          if (st?.err != null) f = {ok: false, status: "failed", error: "fallita on-chain"};
          else if (st && ["confirmed", "finalized"].includes(st.confirmationStatus)) f = await this.fillFromChain(o, p); }
        if (!f && now - o.created_at > 240) f = await this.fillFromChain(o, p);
      } catch (e) { continue; }
      if (!f) continue;
      this.log("INFO", "VERIFICA", `Ordine ${o.side} ${p.symbol}: esito verificato on-chain = ${f.status}`);
      if (o.side === "buy") this.applyBuy(p, o, f, now); else this.applySell(p, o, f, now);
    }
  }
  async fillFromChain(o, p) {
    const bal = Number(await this.rpc.tokenBalanceRaw(this.wallet.address, o.mint));
    if (o.side === "buy") return bal > 0 ? {ok: true, status: "confirmed", in_raw: o.amount_in_raw, out_raw: bal, fee_sol: this.cfg.network_fee_sol_per_swap, note: "importi ricostruiti dal saldo on-chain"}
      : {ok: false, status: "failed", error: "nessun token ricevuto: acquisto non avvenuto"};
    const sold = Math.max(0, p.qty_raw - bal);
    return sold > 0 ? {ok: true, status: "confirmed", in_raw: sold, out_raw: o.expected_out_raw || 0, fee_sol: this.cfg.network_fee_sol_per_swap, note: "incasso stimato dalla quotazione"}
      : {ok: false, status: "failed", error: "token ancora nel wallet: vendita non avvenuta"};
  }

  // ------------------------------- recupero depositi degli account token vuoti (reale)
  async emptyTokenAccounts() {
    if (!this.wallet) return [];
    const out = [];
    for (const prog of ["TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"]) {
      const r = await this.rpc.call("getTokenAccountsByOwner", [this.wallet.address, {programId: prog}, {encoding: "jsonParsed", commitment: "confirmed"}]);
      for (const a of r?.value || []) { const i = a.account.data.parsed.info;
        if (i.tokenAmount.amount === "0" && i.owner === this.wallet.address && i.mint !== USDC_MINT && i.mint !== SOL_MINT)
          out.push({address: a.pubkey, program: prog, mint: i.mint}); }
    }
    return out;
  }
  async recoverDeposits() {
    if (!this.wallet) return [false, "Collega prima il wallet"];
    if (this.state === "RUNNING" || this.state === "PAUSED") return [false, "Ferma il bot prima di recuperare i depositi"];
    const accs = (await this.emptyTokenAccounts()).slice(0, 20);
    if (!accs.length) return [true, "Nessun account token vuoto da chiudere"];
    const {blockhash} = (await this.rpc.call("getLatestBlockhash", [{commitment: "confirmed"}])).value;
    const unsigned = buildCloseAccountsTx(this.wallet.address, accs, blockhash);
    const signed = await this.wallet.signBytes(unsigned);   // conferma nel wallet
    const sig = await this.rpc.call("sendTransaction", [bytesToB64(signed), {encoding: "base64", preflightCommitment: "confirmed"}]);
    this.log("INFO", "WALLET", `Chiusi ${accs.length} account token vuoti: circa ${(accs.length * this.cfg.ata_rent_sol).toFixed(4)} SOL tornano al wallet (tx ${sig})`);
    return [true, `Recupero inviato: circa ${(accs.length * this.cfg.ata_rent_sol).toFixed(4)} SOL tornano nel wallet`];
  }

  // ------------------------------- watchlist
  async refreshWatch(now) {
    for (const w of this.data.watchlist) {
      const sigs = await this.rpc.signaturesFor(w.address, 25);
      const seen = new Set(this.data.wseen[w.address] || []), list = this.data.wtx[w.address] ||= [];
      for (const s of sigs.filter(s => !seen.has(s.signature)).slice(0, 6)) {
        seen.add(s.signature);
        if (s.err != null) continue;
        const c = classifyTx(await this.rpc.transaction(s.signature), w.address);
        if (c && c.kind !== "OTHER") list.push(c);
      }
      if (list.length > 300) list.splice(0, list.length - 300);
      this.data.wseen[w.address] = [...seen].slice(-300);
      this.walletStats[w.address] = {...walletStats(list), updated: now};
    }
    this.save();
  }
  traderSignals(now) {
    const out = {};
    for (const w of this.data.watchlist) { const st = this.walletStats[w.address] || {};
      for (const t of (this.data.wtx[w.address] || []).slice(-50))
        if (t.kind === "BUY" && now - t.ts <= this.cfg.trader_signal_max_age_min * 60)
          out[t.mint] = {wallet: w.address, label: w.label || w.address.slice(0, 6), reliable: !!st.reliable, age_s: now - t.ts}; }
    return out;
  }

  // ------------------------------- vista
  snapshot() {
    const now = this.now(), fam = this.family, st = this.accountState(now), rec = this.data.daily[`${dayKey(now)}|${fam}`] || {};
    let unreal = 0, val = 0;
    const positions = this.active(fam).map(p => { const [u, v] = this.unrealized(p); unreal += u; val += v;
      return {...p, unrealized_usd: u, value_usd: v, unrealized_pct: p.cost_usd ? u / p.cost_usd * 100 : 0, price_age: p.last_price_at ? fmtAge(now - p.last_price_at) : "-"}; });
    const closed = this.data.positions.filter(p => p.family === fam && p.status === "closed").sort((a, b) => b.closed_at - a.closed_at);
    let label = STATE_LABELS[this.state];
    if (this.state === "RUNNING") label = fam === "sim" ? "SIMULAZIONE" : "ATTIVO (APPROVAZIONE)";
    return {
      state: this.state, state_label: label, pause_reason: this.pause, error_reason: this.errorReason, mode: this.cfg.mode,
      mode_label: MODE_LABELS[this.cfg.mode], signal_only: this.cfg.signal_only, busy: this.busy,
      wallet: this.wallet ? {address: this.wallet.address, name: this.wallet.name} : null,
      cash_usdc: st.cash, sol_balance: st.sol, sol_price: this.solPrice, invested_usd: st.invested, positions_value_usd: val,
      available_usdc: availableBudget(st, this.cfg), total_equity_usd: st.cash + val + st.sol * this.solPrice,
      realized_total_usd: st.realized_total, unrealized_usd: unreal, daily_pnl_usd: rec.pnl || 0,
      realized_today_usd: closed.filter(p => dayKey(p.closed_at) === dayKey(now)).reduce((a, p) => a + p.realized_pnl_usd, 0),
      daily_limit_usd: (rec.start_equity || 0) * this.cfg.daily_loss_limit_pct / 100, daily_locked: !!rec.locked,
      positions, closed_positions: closed.slice(0, 50), orders: this.data.orders.filter(o => o.family === fam).slice(0, 50),
      other_family_open: this.active(fam === "sim" ? "real" : "sim").length,
      scanned: this.scanned.slice(0, 40).map(t => ({...t, decision: this.decisions[t.snapshot.mint] || null, age: fmtAge(now - t.snapshot.fetched_at)})),
      last_scan: this.lastScanAt ? fmtAge(now - this.lastScanAt) : "mai",
      watchlist: this.data.watchlist.map(w => ({...w, stats: this.walletStats[w.address] || null})),
      proposals: this.proposals.filter(p => p.status === "pending"), events: this.data.events.slice(0, 200), alerts: this.alerts,
      health: [this.dex.http.health(), this.jup.http.health(), this.rpc.http.health()], settings: {...this.cfg, jupiter_api_key: ""},
      jupiter_key_set: !!this.cfg.jupiter_api_key, now,
    };
  }
}
