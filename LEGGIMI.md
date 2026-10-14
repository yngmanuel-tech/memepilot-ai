# MemePilot AI - app per telefono (versione browser)

App web installabile (PWA): si apre da un link e si aggiunge alla schermata Home.
Nessun server: motore del bot, storico e impostazioni restano nel browser del telefono.

## Uso
1. Apri il link dell'app in **Chrome** sul telefono.
2. Menu ⋮ → **Installa app** (o "Aggiungi a schermata Home").
3. Premi **START BOT**: parte in **simulazione** con 50 USDC virtuali e dati reali.

## Trading reale (approvazione manuale)
1. Nell'app: Altro → Wallet → **Apri in Phantom** (o Solflare). L'app si riapre dentro il wallet.
2. Tocca **Collega Phantom**. Il bot riceve solo il tuo indirizzo pubblico, mai la chiave.
3. Home → Modalità → "REALE con approvazione": leggi il riepilogo, spunta e scrivi `CONFERMO`.
4. Premi START. Le proposte arrivano nella scheda **Proposte**: "Approva e firma" → conferma nel wallet.

Consiglio: usa un account dedicato del wallet con dentro solo gli USDC che puoi perdere
e circa 0,05 SOL per le commissioni.

## Limiti da conoscere
- Il bot lavora **solo con l'app aperta e lo schermo acceso** (l'app chiede di tenerlo acceso
  mentre è attivo). Android sospende le pagine in background: in quel tempo le posizioni non
  vengono gestite. Per questo in questa versione non esiste la modalità automatica reale.
- I dati sono salvati nel browser: cancellare i dati di Chrome/Phantom azzera lo storico
  (i fondi restano nel tuo wallet, non nell'app).
- Ogni token comprato richiede un deposito di ~0,002 SOL per il suo account: dopo la vendita
  si recupera con Altro → Wallet → "Recupera depositi".
- Nessun profitto è garantito. Le memecoin possono perdere quasi tutto il valore in minuti.

## Per sviluppatori
File: `index.html`, `app.js` (interfaccia), `engine.js` (motore, rischio, esecuzione),
`wallet.js` (Wallet Standard), `sw.js` (offline), `manifest.webmanifest`.
Test del motore: `node --test webapp/tests/` (Node 20+).
Pubblicazione: qualsiasi hosting statico HTTPS (es. GitHub Pages) servendo questa cartella.
