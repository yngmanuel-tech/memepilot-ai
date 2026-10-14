// Collegamento ai wallet Solana tramite Wallet Standard (Phantom, Solflare, Backpack…).
// L'app non vede mai la chiave privata: passa al wallet i byte della transazione e il
// wallet chiede all'utente di confermare, poi restituisce la transazione firmata.

const found = [];
const api = {register: (...ws) => { for (const w of ws) if (!found.includes(w)) found.push(w); return () => {}; }};
let started = false;

export function discoverWallets() {
  if (!started && typeof window !== "undefined") {
    started = true;
    window.addEventListener("wallet-standard:register-wallet", e => { try { e.detail(api); } catch { /* wallet non conforme */ } });
    try { window.dispatchEvent(new CustomEvent("wallet-standard:app-ready", {detail: api})); } catch { }
  }
  return found.filter(w => w.features?.["standard:connect"] && w.features?.["solana:signTransaction"] &&
    (w.chains || []).some(c => c === "solana:mainnet"));
}

export async function connectWallet(w) {
  const res = await w.features["standard:connect"].connect();
  const acc = res?.accounts?.[0] || w.accounts?.[0];
  if (!acc) throw new Error("Il wallet non ha condiviso nessun account");
  const sign = w.features["solana:signTransaction"];
  return {
    address: acc.address, name: w.name, icon: w.icon,
    async signBytes(bytes) {
      const [out] = await sign.signTransaction({account: acc, transaction: bytes, chain: "solana:mainnet"});
      if (!out?.signedTransaction) throw new Error("il wallet non ha restituito la transazione firmata");
      return out.signedTransaction;
    },
    disconnect() { try { w.features["standard:disconnect"]?.disconnect(); } catch { } },
  };
}

// Link che aprono questa stessa app dentro il browser integrato del wallet.
export function walletBrowseLinks(url) {
  const u = encodeURIComponent(url), ref = encodeURIComponent(new URL(url).origin);
  return {
    phantom: `https://phantom.app/ul/browse/${u}?ref=${ref}`,
    solflare: `https://solflare.com/ul/v1/browse/${u}?ref=${ref}`,
  };
}
