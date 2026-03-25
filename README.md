# Twitch Watchlist (MVP + Backend PHP + Extension Chrome)

Projet personnel pour suivre tes streamers Twitch, connaitre qui est en live et gérer ta watchlist.

Il se compose de 3 briques :

- `mvp/` : une application web Next.js (App Router) qui interroge Twitch via des Route Handlers serveur.
- `backend-production/` : un backend PHP minimal (a heberger sur Hostinger / Apache) qui expose la meme API que `mvp/`.
- `extension/` : une extension Chrome (Manifest V3) qui affiche un popup avec ta watchlist et met a jour le badge d'icone.

---

## Architecture & API (contrat)

L'extension et le backend partagent un contrat d'API (mêmes endpoints que ceux du MVP) :

- `GET /api/twitch/search?q={login}`
  - Renvoie un objet `SearchResultItem` (id, login, displayName, profileImageUrl, twitchUrl).
- `POST /api/twitch/streams`
  - Body : `{ "logins": ["otplol_", "solary"] }`
  - Renvoie : `{ live: [...], offline: [...], liveCount: number }`

Le point important : **les appels Twitch (Helix) passent uniquement cote serveur** afin de protéger `TWITCH_CLIENT_SECRET`.

---

## `mvp/` (Next.js)

### Ce que c'est

Une UI web pour :

- rechercher un streamer
- l'ajouter à ta watchlist (stockée en `localStorage`)
- afficher `LIVE` et `OFFLINE`
- trier et rafraîchir périodiquement

### Lancer en local

```bash
cd mvp
npm install
npm run dev
```

### Variables d'environnement

Le fichier exemple est fourni via `mvp/.env.example` :

- `TWITCH_CLIENT_ID`
- `TWITCH_CLIENT_SECRET`
- `TWITCH_API_URL` (par defaut : `https://api.twitch.tv/helix`)

---

## `backend-production/` (PHP)

### Ce que c'est

Un backend PHP minimal qui **reproduit les endpoints** attendus par l'extension et par le MVP.

Il sert :

- `GET /api/twitch/search` (parametre `q`)
- `POST /api/twitch/streams` (body JSON `logins: []`)
- `GET /health` (utile pour verifier le deploiement)

### Variables d'environnement

Le fichier exemple est fourni via `backend-production/.env.example` :

- `TWITCH_CLIENT_ID`
- `TWITCH_CLIENT_SECRET`
- `TWITCH_API_URL` (par defaut : `https://api.twitch.tv/helix`)
- `CORS_ORIGIN` (ex: `*`)

### Hebergement (Apache / Hostinger)

Le fichier `backend-production/.htaccess` gère :

- le rewrite vers les scripts PHP sans extension (`/api/twitch/...` -> `api/twitch/...php`)
- le blocage des fichiers "caches" (ex: `.env`)

### Installer / configurer

1. Depose `backend-production/` sur ton hote Apache.
2. Assure-toi que `.htaccess` est actif.
3. Configure les variables dans un `.env` au bon emplacement (selon Hostinger).

### CORS

Le backend expose des headers CORS pour permettre les appels depuis l'extension :

- `Access-Control-Allow-Origin` (via `CORS_ORIGIN`)
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`

---

## `extension/` (Chrome, Manifest V3)

### Ce que c'est

Une extension qui :

- gère une watchlist via `chrome.storage.local`
- affiche une liste `LIVE` / `OFFLINE`
- propose la recherche d'un streamer
- met a jour le badge d'icone avec le nombre de lives
- rafraichit le badge via `chrome.alarms` (1 minute)

### Scripts & build

```bash
cd extension
npm install
npm run build
```

### Local / sans "Vite"

Le build génère `dist/`. En pratique, pour charger l'extension en local, tu utilises le mode "chargée depuis un dossier" dans Chrome.

### Connexion au backend

L'extension choisit une liste de base URLs dans :

- `extension/src/lib/api.ts`
- `extension/public/background.js`

Actuellement :

- `https://test.phangwilly.com/twitch`
- `http://localhost:3000`

Si tu héberges ton backend sous un autre chemin (ex: `https://ton-site.com/twitch/`), adapte ces valeurs.

---

## Notes de sécurité

- `TWITCH_CLIENT_SECRET` ne doit jamais etre dans le client (`mvp/` et `extension/` ne doivent pas l'exposer).
- Le secret est cote serveur :
  - MVP (Next.js Route Handlers)
  - backend PHP (`backend-production/`)

---