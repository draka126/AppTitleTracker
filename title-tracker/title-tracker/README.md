# Title Tracker

Mini finestra sempre in primo piano, in basso a sinistra, che mostra in tempo reale
il title di una pagina web (anche quando cambia via JavaScript).

## Provarla senza installare nulla
    npm install
    npm start

## Creare l'installer per il tuo sistema
    npm run build

L'installer compare nella cartella `dist/`:
- Windows: `Title Tracker Setup 1.0.0.exe`
- macOS:   `Title Tracker-1.0.0.dmg`
- Linux:   `Title Tracker-1.0.0.AppImage`

L'installer va generato sul sistema operativo per cui è destinato.
Requisito: Node.js (https://nodejs.org), versione LTS.

## Uso
- 🔒/🔓  blocca nell'angolo / sblocca per trascinare la finestra
- ✎      cambia link
- ✕      chiude
Link e stato del blocco vengono ricordati tra un avvio e l'altro.

## Installer senza terminale (via GitHub)
1. Crea un account gratuito su github.com e un nuovo repository.
2. "Add file" > "Upload files": trascina tutti i file di questa cartella (tranne build-workflow.yml) e conferma con "Commit changes".
3. "Add file" > "Create new file": come nome scrivi  .github/workflows/build.yml
   e incolla dentro il contenuto di build-workflow.yml. Conferma con "Commit changes".
4. Apri la scheda "Actions": parte da sola la creazione degli installer (5-10 minuti).
5. Quando è verde, apri l'esecuzione e scarica da "Artifacts" l'installer per il tuo sistema.
