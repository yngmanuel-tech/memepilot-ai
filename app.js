// Interfaccia dell'app. Tutta la logica di trading e di rischio sta in engine.js.
import {Engine, MODE_LABELS, SETTING_GROUPS, HARD_LIMITS, DEFAULTS, summaryLines} from "./engine.js";
import {discoverWallets, connectWallet, walletBrowseLinks} from "./wallet.js";

const STORE = "memepilot_v1";
const $ = s => document.querySelector(s);
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
const fmt = (n, d = 2) => (n == null || isNaN(n)) ? "-" : Number(n).toLocaleString("it-IT", {minimumFractionDigits: d, maximumFractionDigits: d});
const usd = (n, sign = false) => n == null ? "-" : (sign && n > 0 ? "+" : "") + fmt(n) + " $";
const cls = n => n > 0 ? "pos" : n < 0 ? "neg" : "";
const price = n => !n ? "-" : n >= 1 ? fmt(n, 4) : Number(n).toPrecision(4);
const ts = t => t ? new Date(t * 1000).toLocaleString("it-IT", {day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"}) : "-";
const STATE_COL = {RUNNING: "var(--g)", PAUSED: "var(--a)", STOPPED: "var(--m)", ERROR: "var(--r)"};

// ---------------------------------------------------------------- motore
const engine = new Engine({
  fetch: (u, o) => fetch(u, o),
  sleep: ms => new Promise(r => setTimeout(r, ms)),
  nowMs: () => Date.now(),
  load: () => { try { return JSON.parse(localStorage.getItem(STORE)); } catch { return null; } },
  save: d => { try { localStorage.setItem(STORE, JSON.stringify(d)); } catch { } },
  notify: msg => { try { if (document.visibilityState !== "visible" && Notification?.permission === "granted") new Notification("MemePilot AI", {body: msg}); } catch { } },
});
window.__engine = engine;   // utile per il debug dalla console
try { navigator.storage?.persist?.(); } catch { }
const UI = {view: "home", more: "wallet", dirty: false, sheet: false, walletBusy: false};

// ---------------------------------------------------------------- utilità UI
function toast(msg, ms = 3500) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(t._h); t._h = setTimeout(() => t.hidden = true, ms); }
function openSheet(html) { $("#sheet").innerHTML = html; $("#sheetbg").hidden = false; UI.sheet = true; bindIn($("#sheet")); }
function closeSheet() { $("#sheetbg").hidden = true; $("#sheet").innerHTML = ""; UI.sheet = false; render(); }
$("#sheetbg").addEventListener("click", e => { if (e.target.id === "sheetbg") closeSheet(); });
async function run(fn, okMsg) {
  try { const r = await fn(); const [ok, msg] = Array.isArray(r) ? r : [true, okMsg];
    toast(ok ? (okMsg || msg) : "⚠ " + msg); } catch (e) { toast("⚠ " + (e.message || e)); }
  render();
}
async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast("Copiato"); } catch { toast(text, 8000); }
}

document.querySelectorAll("#nav button").forEach(b => b.onclick = () => {
  UI.view = b.dataset.v; document.querySelectorAll("#nav button").forEach(x => x.classList.toggle("on", x === b));
  window.scrollTo(0, 0); render();
});

// ---------------------------------------------------------------- render
function render() {
  const s = engine.snapshot();
  const p = $("#pill"); p.textContent = s.state_label; p.style.background = STATE_COL[s.state] || "var(--m)";
  const b = $("#badge"); b.hidden = !s.proposals.length; b.textContent = s.proposals.length;
  if (UI.sheet) return;
  if (UI.view === "more" && UI.more === "settings" && UI.dirty) return;
  $("#main").innerHTML = {home: vHome, pos: vPos, tok: vTok, prop: vProp, more: vMore}[UI.view](s);
  bindIn($("#main"));
}

function banners(s) {
  let h = "";
  if (s.state === "ERROR") h += `<div class="alert err">⛔ Bot fermato per errore: ${esc(s.error_reason)}</div>`;
  else if (s.alerts.length) { const a = s.alerts[0]; h += `<div class="alert err">⚠ ${ts(a.ts)} [${esc(a.category)}] ${esc(a.message)}</div>`; }
  const w = [];
  if (s.state === "PAUSED") w.push("In pausa automatica: " + esc(s.pause_reason));
  if (s.daily_locked) w.push("Limite di perdita giornaliero raggiunto: nuovi acquisti bloccati fino a domani.");
  if ((s.state === "STOPPED" || s.state === "ERROR") && s.positions.length) w.push(`${s.positions.length} posizioni aperte NON sono gestite mentre il bot è fermo.`);
  if (s.state === "RUNNING" || s.state === "PAUSED") w.push("Tieni l'app aperta e lo schermo acceso: se la chiudi o il telefono va in standby il bot si ferma e le posizioni non vengono gestite.");
  if (s.other_family_open) w.push(`${s.other_family_open} posizioni aperte nell'altra modalità (non gestite ora).`);
  if (s.mode === "simulation") w.push("SIMULAZIONE: dati e quotazioni reali, denaro virtuale. I risultati reali possono essere peggiori.");
  if (w.length) h += `<div class="alert w">${w.join("<br>")}</div>`;
  return h;
}

function vHome(s) {
  const running = s.state === "RUNNING" || s.state === "PAUSED", tot = s.realized_total_usd + s.unrealized_usd;
  const resOk = s.sol_balance >= s.settings.min_sol_reserve;
  return banners(s) + `
  <div class="btns">
    <button class="big start" data-a="start" ${running ? "disabled" : ""}>▶ START BOT</button>
    <button class="big stop" data-a="stop" ${running ? "" : "disabled"}>■ STOP BOT</button>
  </div>
  <div class="card row"><div><div class="k">Modalità</div><div>${esc(s.mode_label)}${s.signal_only ? " · <span class='warn'>SOLO SEGNALI</span>" : ""}</div></div>
    <button class="sm" data-a="mode" ${running ? "disabled" : ""}>Cambia</button></div>
  ${s.busy ? `<div class="alert i">⏳ ${esc(s.busy)}</div>` : ""}
  <div class="grid">
    <div class="card"><div class="k">Saldo totale</div><div class="v">${usd(s.total_equity_usd)}</div><div class="s">${fmt(s.cash_usdc)} USDC + posizioni + SOL</div></div>
    <div class="card"><div class="k">Disponibile bot</div><div class="v">${usd(s.available_usdc)}</div><div class="s">limite ${fmt(s.settings.max_capital_usdc, 0)} USDC</div></div>
    <div class="card"><div class="k">Investito</div><div class="v">${usd(s.invested_usd)}</div><div class="s">${s.positions.length} posizioni · valore ${usd(s.positions_value_usd)}</div></div>
    <div class="card"><div class="k">Riserva commissioni</div><div class="v ${resOk ? "" : "neg"}">${fmt(s.sol_balance, 4)} SOL</div><div class="s">minimo ${s.settings.min_sol_reserve} SOL</div></div>
    <div class="card"><div class="k">P/L oggi</div><div class="v ${cls(s.daily_pnl_usd)}">${usd(s.daily_pnl_usd, true)}</div><div class="s">limite −${fmt(s.daily_limit_usd)} $</div></div>
    <div class="card"><div class="k">P/L complessivo</div><div class="v ${cls(tot)}">${usd(tot, true)}</div><div class="s">realizz. ${usd(s.realized_total_usd, true)} · aperto ${usd(s.unrealized_usd, true)}</div></div>
  </div>
  ${s.positions.length ? `<h3>Posizioni aperte</h3>` + posList(s.positions) : ""}
  <button class="danger" style="width:100%;margin-top:6px" data-a="liq" ${s.positions.length ? "" : "disabled"}>Liquida tutte le posizioni…</button>
  <p class="s" style="margin-top:12px">Ultima scansione: ${esc(s.last_scan)} fa · ${s.health.map(h => esc(h.name) + ": " + (h.errors ? h.errors + " errori" : "OK")).join(" · ")}</p>`;
}

function posList(list) {
  return list.map(p => `<div class="item">
    <div class="row"><span class="t">${esc(p.symbol)}<span class="tag">${esc(p.status)}</span></span><span class="${cls(p.unrealized_usd)}"><b>${usd(p.unrealized_usd, true)}</b> (${fmt(p.unrealized_pct, 1)}%)</span></div>
    <div class="s">Costo ${usd(p.cost_usd)} · valore netto ${usd(p.value_usd)} · prezzo ${price(p.entry_price)} → ${price(p.last_price)}</div>
    <div class="s">Aperta ${ts(p.opened_at)} · prezzo aggiornato ${esc(p.price_age)} fa</div></div>`).join("");
}

function vPos(s) {
  const closed = s.closed_positions.map(p => { const pct = p.cost_usd ? p.realized_pnl_usd / p.cost_usd * 100 : 0;
    return `<div class="item"><div class="row"><span class="t">${esc(p.symbol)}</span><span class="${cls(p.realized_pnl_usd)}"><b>${usd(p.realized_pnl_usd, true)}</b> (${fmt(pct, 1)}%)</span></div>
    <div class="s">${ts(p.opened_at)} → ${ts(p.closed_at)} · costo ${usd(p.cost_usd)} · incasso ${usd(p.proceeds_usd)}</div><div class="s">${esc(p.exit_reason)}</div></div>`; }).join("");
  const col = {confirmed: "pos", failed: "neg", unknown: "warn", submitted: "warn", aborted: "mut"};
  const orders = s.orders.map(o => `<div class="item"><div class="row"><span class="t">${o.side === "buy" ? "ACQUISTO" : "VENDITA"} <span class="mono">${esc(o.mint.slice(0, 6))}…</span></span><span class="${col[o.status] || ""}">${esc(o.status)}</span></div>
    <div class="s">${ts(o.created_at)} · ${esc(o.reason)}</div>${o.error || (o.signature && o.signature !== "SIM") ? `<div class="s mono">${esc(o.error || o.signature)}</div>` : ""}</div>`).join("");
  return banners(s) + `<h3>Aperte</h3>${s.positions.length ? posList(s.positions) : `<p class="s">Nessuna posizione aperta.</p>`}
    <h3>Chiuse</h3>${closed || `<p class="s">Nessuna.</p>`}<h3>Ultime operazioni</h3>${orders || `<p class="s">Nessuna.</p>`}`;
}

function vTok(s) {
  const min = s.settings.min_opportunity_score, max = s.settings.max_risk_score;
  const rows = s.scanned.map((t, i) => { const n = t.snapshot;
    const esito = t.blocks.length ? `<span class="neg">bloccato</span>` : (t.decision?.length ? `<span class="warn">scartato</span>` : `<span class="pos">idoneo</span>`);
    return `<div class="item" data-tok="${i}" role="button" tabindex="0"><div class="row"><span class="t">${esc(n.symbol)}${n.trader_signal ? " 👤" : ""}</span>${esito}</div>
      <div class="row s"><span>Opp. <b class="${t.opportunity >= min ? "pos" : ""}">${t.opportunity}</b> · Rischio <b class="${t.risk > max ? "neg" : ""}">${t.risk}</b></span><span class="${cls(n.price_change_h1)}">${fmt(n.price_change_h1, 1)}% 1h</span></div>
      <div class="s">Liq. ${fmt(n.liquidity_usd, 0)} $ · Vol 1h ${fmt(n.volume_h1, 0)} $ · dati ${esc(t.age)} fa</div></div>`; }).join("");
  return `<p class="s">Scansione ${esc(s.last_scan)} fa. Tocca un token per leggere tutti i motivi. La popolarità serve solo a trovare candidati, mai come motivo d'acquisto.</p>${rows || `<p class="s">Nessun dato: premi START per iniziare l'analisi.</p>`}`;
}
function tokSheet(t) {
  const n = t.snapshot, li = a => a?.length ? a.map(x => `• ${esc(x)}`).join("<br>") : "<span class='mut'>nessuno</span>";
  let h = `<h2>${esc(n.symbol)}</h2><div class="mono mut">${esc(n.mint)}</div><p>Opportunità <b>${t.opportunity}</b> · Rischio <b>${t.risk}</b> · prezzo ${price(n.price_usd)}</p>
    <h3>Motivi opportunità</h3><div class="s">${li(t.opportunity_reasons)}</div><h3>Motivi rischio</h3><div class="s">${li(t.risk_reasons)}</div>`;
  if (t.blocks.length) h += `<h3 class="neg">Blocchi (acquisto impossibile)</h3><div class="s">${li(t.blocks)}</div>`;
  if (t.decision?.length) h += `<h3>Decisione del risk manager</h3><div class="s">${li(t.decision)}</div>`;
  if (n.trader_signal) h += `<h3>Segnale trader</h3><div class="s">${esc(n.trader_signal.label)} · ${Math.round(n.trader_signal.age_s)}s fa · ${n.trader_signal.reliable ? "storico positivo" : "storico insufficiente"}</div>`;
  h += `<p class="s">Fonti: ${esc(n.sources.join(", "))}</p><a class="btn" href="https://dexscreener.com/solana/${encodeURIComponent(n.mint)}" target="_blank" rel="noopener">Apri su DexScreener</a><div style="height:8px"></div><button style="width:100%" data-a="close">Chiudi</button>`;
  openSheet(h);
}

function vProp(s) {
  const now = s.now;
  const items = s.proposals.map(p => `<div class="item"><div class="row"><span class="t">${p.kind === "buy" ? "ACQUISTO" : "VENDITA"} ${esc(p.symbol)}</span><span class="warn">${Math.max(0, Math.round(p.expires_at - now))}s</span></div>
    <div class="s">${p.kind === "buy" ? fmt(p.amount_usdc) + " USDC · opportunità " + p.opportunity + " · rischio " + p.risk : "quota " + Math.round(p.fraction * 100) + "%"}</div>
    <div class="s">${esc(p.reason)}</div>
    <div class="btns" style="margin:8px 0 0"><button class="ok" data-ap="${esc(p.id)}">✔ Approva e firma</button><button class="danger" data-rj="${esc(p.id)}">✖ Rifiuta</button></div></div>`).join("");
  return `<p class="s">In modalità REALE il bot propone, tu approvi e poi confermi nel wallet. Ogni proposta viene ricontrollata con dati freschi e scade dopo ${s.settings.proposal_ttl_s}s.</p>${items || `<p class="s">Nessuna proposta in attesa.</p>`}`;
}

function vMore(s) {
  const tabs = [["wallet", "Wallet"], ["settings", "Impostazioni"], ["watch", "Trader"], ["log", "Log"], ["info", "Guida"]];
  return `<div class="seg">${tabs.map(([k, l]) => `<button data-more="${k}" class="${UI.more === k ? "on" : ""}">${l}</button>`).join("")}</div>` +
    ({wallet: vWallet, settings: vSettings, watch: vWatch, log: vLog, info: vInfo})[UI.more](s);
}

function vWallet(s) {
  const wallets = discoverWallets(), url = location.href.split("#")[0], links = walletBrowseLinks(url);
  let h = "";
  if (s.wallet) {
    h += `<div class="card"><div class="k">Wallet collegato · ${esc(s.wallet.name)}</div><div class="mono" style="margin:6px 0">${esc(s.wallet.address)}</div>
      <div class="s">Saldo: ${fmt(engine.realBal[0])} USDC · ${fmt(engine.realBal[1], 4)} SOL</div>
      <div class="btns" style="margin-top:10px"><button data-a="copyaddr">Copia indirizzo</button><button data-a="disconnect">Scollega</button></div>
      <button style="width:100%" data-a="recover">Recupera depositi degli account vuoti</button>
      <p class="s">Ogni token comprato richiede un piccolo deposito (~0,002 SOL). Dopo la vendita puoi riaverlo indietro con un tocco: il wallet ti chiederà di confermare.</p></div>`;
  } else if (wallets.length) {
    h += `<div class="card"><b>Collega il tuo wallet</b><p class="s">Il bot non vedrà mai la tua chiave: ogni operazione la confermi tu nel wallet.</p>
      ${wallets.map((w, i) => `<button class="ok" style="width:100%;margin-top:8px" data-wallet="${i}">Collega ${esc(w.name)}</button>`).join("")}</div>`;
  } else {
    h += `<div class="card"><b>Per il trading reale apri l'app dentro il tuo wallet</b>
      <p class="s">Il collegamento sicuro funziona nel browser integrato di Phantom o Solflare. Tocca il tuo wallet: si apre questa app al suo interno, già pronta.</p>
      <a class="btn ok" href="${esc(links.phantom)}" style="margin-top:8px">Apri in Phantom</a>
      <a class="btn ok" href="${esc(links.solflare)}" style="margin-top:8px">Apri in Solflare</a>
      <button style="width:100%;margin-top:8px" data-a="copylink">Copia il link dell'app</button>
      <p class="s">In alternativa: apri il wallet → scheda Browser (🌐) → incolla il link.</p></div>`;
  }
  h += `<div class="alert i">Consiglio: usa un wallet o un account <b>dedicato</b> con dentro solo gli USDC che sei disposto a perdere e circa 0,05 SOL per le commissioni. In Phantom puoi creare un secondo account in pochi tocchi.</div>`;
  return h;
}

function vSettings(s) {
  const c = s.settings;
  let h = `<p class="s">I limiti di sicurezza non si possono disattivare: i valori fuori range vengono rifiutati con un messaggio.</p>`;
  for (const [title, items] of SETTING_GROUPS) {
    h += `<div class="card"><b>${esc(title)}</b>`;
    for (const [name, label] of items) {
      const d = DEFAULTS[name], lim = HARD_LIMITS[name], rng = lim ? ` <span class="mut">(${lim[0]} – ${lim[1]})</span>` : "";
      if (typeof d === "boolean") h += `<label class="chk"><input type="checkbox" id="set-${name}" data-set="${name}" ${c[name] ? "checked" : ""}>${esc(label)}</label>`;
      else if (name === "jupiter_api_key") h += `<label class="f" for="set-${name}">${esc(label)} ${s.jupiter_key_set ? "<span class='pos'>(impostata)</span>" : ""}</label><input id="set-${name}" data-set="${name}" type="password" placeholder="lascia vuoto per non modificare" autocomplete="off">`;
      else h += `<label class="f" for="set-${name}">${esc(label)}${rng}</label><input id="set-${name}" data-set="${name}" ${typeof d === "number" ? 'inputmode="decimal"' : ""} value="${esc(c[name])}">`;
    }
    h += `</div>`;
  }
  return h + `<div class="btns"><button class="ok" data-a="saveset">Salva</button><button data-a="resetset">Annulla modifiche</button></div>
    <button class="danger" style="width:100%" data-a="resetsim">Azzera simulazione…</button>`;
}

function vWatch(s) {
  const items = s.watchlist.map(w => { const st = w.stats || {};
    let v = esc(st.verdict || "in attesa di dati (aggiornamento ogni 2 minuti con il bot attivo)");
    if (st.sufficient && st.profit_factor) v += ` · vincenti ${fmt(st.win_rate, 0)}% · mediana ${fmt(st.median_pnl_pct, 1)}% · peggiore ${fmt(st.worst_pnl_pct, 0)}%`;
    return `<div class="item"><div class="row"><span class="t">${esc(w.label || "-")}</span><button class="sm danger" data-rmw="${esc(w.address)}">Rimuovi</button></div>
      <div class="mono mut">${esc(w.address)}</div><div class="s">Acquisti ${st.buys || 0} · vendite ${st.sells || 0} · trasferimenti ${st.transfers || 0} · chiuse ${st.roundtrips || 0}</div>
      <div class="s">${v}</div>${(st.flags || []).length ? `<div class="s neg">⚠ ${st.flags.map(esc).join("<br>⚠ ")}</div>` : ""}</div>`; }).join("");
  return `<p class="s">Le operazioni dei wallet osservati sono solo segnali: ogni acquisto deve comunque superare tutti i controlli. Statistiche solo con almeno 20 operazioni chiuse.</p>
    <div class="card"><label class="f" for="waddr">Indirizzo pubblico Solana</label><input id="waddr" autocomplete="off">
    <label class="f" for="wlabel">Etichetta (facoltativa)</label><input id="wlabel"><div style="height:10px"></div>
    <button class="ok" style="width:100%" data-a="addw">Aggiungi wallet</button></div>${items}`;
}

function vLog(s) {
  return `<div class="card log">${s.events.map(e => `<div><span class="mut">${ts(e[0])}</span> <b class="${e[1] === "ERROR" || e[1] === "ALERT" ? "neg" : e[1] === "TRADE" ? "pos" : e[1] === "WARN" ? "warn" : ""}">${esc(e[1])}</b> [${esc(e[2])}] ${esc(e[3])}</div>`).join("")}</div>`;
}

function vInfo() {
  return `<div class="card s" style="color:var(--t)"><b>Come funziona</b><ol>
    <li><b>Simulazione</b> (predefinita): dati di mercato e quotazioni reali, 50 USDC virtuali. Nessun rischio.</li>
    <li>Il bot scarta i token pericolosi (congelabili, con liquidità bassa, senza vendite, troppo concentrati) e spiega ogni decisione nella scheda Token.</li>
    <li>Take profit e stop loss sono calcolati sul risultato <b>netto</b> di commissioni e slippage. Lo stop loss non garantisce il prezzo.</li>
    <li><b>Reale</b>: apri l'app dentro Phantom o Solflare, collega il wallet e scegli la modalità reale. Il bot propone, tu approvi e firmi.</li>
    <li>Protezioni sempre attive: capitale massimo, 5 USDC per posizione, 3 posizioni, perdita giornaliera 5%, pausa se i dati sono vecchi.</li>
    <li>Il bot lavora solo con l'app aperta. Chiusa l'app, le posizioni restano nel wallet ma non vengono gestite.</li></ol>
    <p>Non sono garantiti profitti: le memecoin possono perdere quasi tutto il loro valore in pochi minuti. Usa solo denaro che puoi permetterti di perdere.</p>
    <p class="mut">Dati salvati solo su questo telefono. Fonti: Jupiter (token, prezzi, swap) e DexScreener (mercato).</p></div>
    <button style="width:100%" data-a="notif">Attiva notifiche per le proposte</button>`;
}

// ---------------------------------------------------------------- azioni
function bindIn(root) {
  root.querySelectorAll("[data-a]").forEach(b => b.onclick = () => ACTIONS[b.dataset.a]());
  root.querySelectorAll("[data-tok]").forEach(b => { b.onclick = () => tokSheet(engine.snapshot().scanned[+b.dataset.tok]); b.onkeydown = e => { if (e.key === "Enter") b.onclick(); }; });
  root.querySelectorAll("[data-ap]").forEach(b => b.onclick = () => { b.disabled = true; toast("Ricontrollo dati… poi conferma nel wallet"); run(() => engine.approve(b.dataset.ap)); });
  root.querySelectorAll("[data-rj]").forEach(b => b.onclick = () => { engine.reject(b.dataset.rj); render(); });
  root.querySelectorAll("[data-rmw]").forEach(b => b.onclick = () => confirmSheet("Rimuovere questo wallet dalla watchlist?", "Rimuovi", () => engine.removeWatch(b.dataset.rmw)));
  root.querySelectorAll("[data-more]").forEach(b => b.onclick = () => { UI.more = b.dataset.more; UI.dirty = false; render(); });
  root.querySelectorAll("[data-set]").forEach(i => i.addEventListener("input", () => UI.dirty = true));
  root.querySelectorAll("[data-wallet]").forEach(b => b.onclick = async () => {
    if (UI.walletBusy) return; UI.walletBusy = true; b.disabled = true;
    try { const w = await connectWallet(discoverWallets()[+b.dataset.wallet]); await engine.connectWallet(w); toast("Wallet collegato"); }
    catch (e) { toast("⚠ Collegamento non riuscito: " + (e.message || e)); }
    UI.walletBusy = false; render();
  });
}

function confirmSheet(text, label, fn) {
  openSheet(`<h2>Conferma</h2><p>${esc(text)}</p><div class="btns"><button data-a="close">Annulla</button><button class="danger" id="cfok">${esc(label)}</button></div>`);
  $("#cfok").onclick = () => { closeSheet(); run(async () => fn()); };
}

let wakeLock = null;
async function keepAwake(on) {
  try { if (on && !wakeLock && "wakeLock" in navigator) { wakeLock = await navigator.wakeLock.request("screen"); wakeLock.addEventListener("release", () => wakeLock = null); }
    if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; } } catch { }
}

const ACTIONS = {
  close: () => closeSheet(),
  start: () => { const [ok, msg] = engine.start(); toast(ok ? "Bot avviato" : "⚠ " + msg); if (ok) keepAwake(true); render(); engine.tick().then(render); },
  stop: () => { engine.stop(); keepAwake(false); toast("Bot fermato: nessun nuovo ordine"); render(); },
  liq: () => {
    openSheet(`<h2>Liquidare tutte le posizioni?</h2><p class="s">Verrà tentata la vendita di tutte le posizioni aperte al prezzo attuale. Con poca liquidità la vendita può fallire o causare perdite elevate.${engine.family === "real" ? " Dovrai confermare ogni vendita nel wallet." : ""}</p>
      <label class="f" for="liqw">Scrivi LIQUIDA per confermare</label><input id="liqw" autocomplete="off" autocapitalize="characters">
      <div class="btns" style="margin-top:14px"><button data-a="close">Annulla</button><button class="danger" id="liqok" disabled>Liquida</button></div>`);
    $("#liqw").oninput = e => $("#liqok").disabled = e.target.value.trim().toUpperCase() !== "LIQUIDA";
    $("#liqok").onclick = () => { const v = $("#liqw").value; closeSheet(); run(() => engine.liquidateAll(v)); };
  },
  mode: () => {
    const opts = Object.entries(MODE_LABELS).map(([k, l]) => `<option value="${k}" ${k === engine.cfg.mode ? "selected" : ""}>${esc(l)}</option>`).join("");
    openSheet(`<h2>Modalità</h2><label class="f" for="msel">Scegli la modalità</label><select id="msel">${opts}</select><div id="mreal"></div>
      <div class="btns" style="margin-top:14px"><button data-a="close">Annulla</button><button class="ok" id="mok">Applica</button></div>`);
    const upd = () => {
      const m = $("#msel").value, box = $("#mreal"), ok = $("#mok");
      if (m === "simulation") { box.innerHTML = ""; ok.disabled = false; return; }
      if (!engine.wallet) { box.innerHTML = `<div class="alert w" style="margin-top:10px">Collega prima il wallet: Altro → Wallet.</div>`; ok.disabled = true; return; }
      box.innerHTML = `<div class="alert err" style="margin-top:10px"><b>Denaro reale.</b> Puoi perdere tutto il capitale impiegato. Nessun risultato simulato garantisce profitti. Lo stop loss non garantisce il prezzo di vendita.</div>
        <div class="s">Wallet ${esc(engine.wallet.address.slice(0, 6))}… · saldo ${fmt(engine.realBal[0])} USDC · ${fmt(engine.realBal[1], 4)} SOL</div>
        <pre>${summaryLines(engine.cfg, m).map(esc).join("\n")}</pre>
        <label class="chk"><input type="checkbox" id="macc">Ho letto il riepilogo e accetto il rischio</label>
        <label class="f" for="mconf">Scrivi CONFERMO</label><input id="mconf" autocomplete="off" autocapitalize="characters">`;
      const chk = () => ok.disabled = !($("#macc").checked && $("#mconf").value.trim().toUpperCase() === "CONFERMO");
      $("#macc").onchange = chk; $("#mconf").oninput = chk; chk();
    };
    $("#msel").onchange = upd; upd();
    $("#mok").onclick = () => { const m = $("#msel").value, acc = !!$("#macc")?.checked, conf = $("#mconf")?.value || "";
      closeSheet(); run(() => engine.setMode(m, conf, acc), "Modalità aggiornata"); };
  },
  saveset: () => {
    const out = {};
    for (const i of document.querySelectorAll("[data-set]")) {
      const k = i.dataset.set, d = DEFAULTS[k];
      if (typeof d === "boolean") out[k] = i.checked;
      else if (typeof d === "number") { const v = parseFloat(i.value.replace(",", ".")); if (isNaN(v)) { toast("⚠ Valore non numerico: " + k); return; } out[k] = v; }
      else out[k] = i.value.trim();
    }
    const [ok, msg] = engine.updateSettings(out);
    if (ok) { UI.dirty = false; toast("Impostazioni salvate"); render(); }
    else openSheet(`<h2>Impostazioni non salvate</h2><pre>${esc(msg)}</pre><button style="width:100%" data-a="close">Correggi</button>`);
  },
  resetset: () => { UI.dirty = false; render(); },
  resetsim: () => confirmSheet("Cancellare posizioni e ordini SIMULATI e ripristinare il capitale virtuale?", "Azzera", () => engine.resetSim()),
  addw: () => run(() => engine.addWatch($("#waddr").value, $("#wlabel").value)),
  copyaddr: () => copy(engine.wallet?.address || ""),
  copylink: () => copy(location.href.split("#")[0]),
  disconnect: () => run(() => engine.disconnectWallet()),
  recover: () => { toast("Cerco account vuoti… poi conferma nel wallet"); run(() => engine.recoverDeposits()); },
  notif: async () => { try { const p = await Notification.requestPermission(); toast(p === "granted" ? "Notifiche attive" : "Notifiche non consentite"); } catch { toast("Notifiche non supportate"); } },
};

// ---------------------------------------------------------------- ciclo
discoverWallets();
render();
setInterval(async () => { await engine.tick(); render(); }, 2000);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") { if (engine.running) keepAwake(true); render(); } });
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
