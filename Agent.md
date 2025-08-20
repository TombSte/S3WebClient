# Agent.md – Client Web S3 (React + TypeScript)

## 📌 Contesto

Obiettivo: sviluppare un client web in **React + TypeScript** per interagire con storage compatibili con **S3** (AWS e alternative come MinIO, Ceph, Wasabi, ecc.).  
L’applicazione sarà una **SPA (Single Page Application)** senza backend dedicato (per ora), con persistenza locale nel browser.  
Le credenziali dei bucket restano nel browser, con opzione di cifratura locale.

---

## ✅ Requisiti Funzionali

### Gestione Connessioni ai Bucket

- L’utente può aggiungere uno o più bucket configurando:
  - Nome visuale
  - Environment (Dev, Test, Prod, custom)
  - Endpoint e regione
  - Access key e secret key
  - Nome bucket
  - Path-style / Virtual-hosted
- Test connessione prima del salvataggio.
- Connessioni salvate in **database locale** del browser.
- Possibilità di modificare, disabilitare, duplicare o rimuovere connessioni.
- Ricerca e filtri su bucket per nome, environment, stato e metadati client-side.

### Vista Buckets

- Elenco di tutti i bucket configurati con:
  - Nome, environment, endpoint, stato verifica, ultimo test
- Ricerca testuale per nome.
- Sidebar con filtri per environment, endpoint, stato, metadati.

### Dashboard Bucket

- Panoramica connessione: nome, environment, endpoint, region, stato.
- Azioni rapide: ritesta connessione, modifica, duplica, esporta/importa configurazione.
- Metadati client-side editabili per ogni bucket.

### Esplora Oggetti

- Navigazione stile file manager con breadcrumb.
- Lista oggetti con: Nome, Dimensione, Ultima modifica, Storage class, Tag, Versioni.
- Ricerca per nome e filtri per estensione, data, dimensione, tag.
- Operazioni sugli oggetti:
  - Upload (multipart per file grandi, drag&drop, con progress bar).
  - Download singolo o multiplo.
  - Copia/Sposta tra bucket/prefix.
  - Rinomina (copy + delete).
  - Eliminazione singola o bulk.
  - Gestione metadati e tag.
  - Generazione link pubblico firmato (presigned URL).
  - Accesso versioni oggetto (se supportato).

### Strumenti & Utility

- Tester CORS per endpoint.
- Generatore presigned URL (GET/PUT, durata configurabile).
- Calcolo checksum client-side (MD5, SHA256).
- Template di metadati comuni (Cache-Control, Content-Disposition).

### Impostazioni

- Cifratura locale opzionale con passphrase via WebCrypto.
- Backup/restore configurazioni (JSON).
- Tema chiaro/scuro, lingua (IT/EN), preferenze UI.
- Pulizia completa (“Dimentica tutto”).

### Error Handling & UX

- Banner errori contestuali con spiegazioni (auth, rete, CORS).
- Stato vuoto e placeholder chiari.
- Retry intelligente per operazioni transienti.
- Notifiche non intrusive con storico attività.
- Navigazione accessibile (tastiera, ARIA, contrasto).

---

## ⚙️ Requisiti Tecnici

### Architettura

- **React + TypeScript** come framework principale.
- SPA statica, deployabile su hosting generici (Netlify, Vercel, S3/CloudFront).
- Comunicazione diretta browser ↔️ S3 (no backend).
- Modularità: separazione tra moduli di connessione, storage, UI e utilities.

### Integrazione S3

- Utilizzo di **AWS SDK v3 (modulare)** o librerie compatibili.
- Supporto endpoint custom (S3-compatibili).
- Operazioni base: list, get, put, delete, copy, headObject, presignedUrl.

### Persistenza Locale

- Database: **IndexedDB** (gestito con Dexie.js o simile).
- Tabelle:
  - **Connections**: bucketId, endpoint, credenziali (cifrate), metadata
  - **Preferences**: tema, lingua, opzioni UI
  - **RecentLocations**: bucketId, prefix, timestamp
- Opzionale: cifratura con WebCrypto se attiva passphrase.

### Sicurezza

- Connessione solo HTTPS.
- Credenziali **mai inviate a server terzi**.
- Secret access key cifrata localmente (se abilitato).
- Timeout di inattività per blocco sessione (richiede passphrase).

### UI/UX

- **Home page**: elenco bucket con ricerca e filtri.
- **Bucket dashboard**: overview connessione e azioni rapide.
- **File browser**: navigazione oggetti, preview (immagini, testo, JSON).
- **Coda operazioni**: pannello con avanzamento, errori e retry.
- **Impostazioni**: sicurezza, tema, backup config.

### Non Funzionali

- **Performance**: paginazione server-side, virtualizzazione liste.
- **Scalabilità client-side**: gestione centinaia di bucket e migliaia di oggetti.
- **Accessibilità**: WAI-ARIA e navigazione tastiera.
- **Internazionalizzazione**: supporto i18n (EN/IT).
- **Manutenibilità**: codice modulare e tipizzato.

### Roadmap Tecnica

1. **MVP**: Connessione bucket + list objects + download singolo.
2. **Base**: Upload, eliminazione, coda operazioni.
3. **Avanzato**: Presigned URL, metadati/tag, copia/sposta.
4. **UX**: Ricerca, filtri, preview avanzata.
5. **Hardening**: Cifratura credenziali, backup configurazioni, i18n.

---
