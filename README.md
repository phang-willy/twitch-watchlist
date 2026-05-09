# Twitch Watchlist (MVP + Backend PHP + Backend NestJS + Extension Chrome)

Projet personnel pour suivre tes streamers Twitch, connaitre qui est en live et gérer ta watchlist.

Il se compose de 4 briques :

- `mvp/` : application web Next.js (App Router) qui interroge Twitch via des Route Handlers serveur.
- `backend-production/` : backend PHP minimal (à héberger sur Hostinger / Apache) qui expose la même API que `mvp/`.
- `backend-nest/` : backend NestJS (Node.js / TypeScript) qui réimplémente la même API, prévu pour un VPS, avec rate limiting intégré. **C'est le backend utilisé en production** par l'extension (`https://twitch.phangwilly.com`).
- `extension/` : extension Chrome (Manifest V3) qui affiche un popup avec ta watchlist et met à jour le badge d'icône.

---

## Architecture & API (contrat)

Tous les backends partagent le **même contrat d'API** :

- `GET /api/twitch/search?q={login}`
  - Renvoie un objet `SearchResultItem` (`id`, `login`, `displayName`, `profileImageUrl`, `twitchUrl`).
  - Si aucun utilisateur trouvé : `[]` (tableau vide).
- `POST /api/twitch/streams`
  - Body : `{ "logins": ["otplol_", "solary"] }`
  - Renvoie : `{ live: [...], offline: [...], liveCount: number }`
- `GET /health`
  - Renvoie : `{ "ok": true }` (utile pour vérifier le déploiement).

Le point important : **les appels Twitch (Helix) passent uniquement côté serveur** afin de protéger `TWITCH_CLIENT_SECRET`.

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
- `TWITCH_API_URL` (par défaut : `https://api.twitch.tv/helix`)

---

## `backend-production/` (PHP)

### Ce que c'est

Un backend PHP minimal qui **reproduit les endpoints** attendus par l'extension et par le MVP.

Il sert :

- `GET /api/twitch/search` (paramètre `q`)
- `POST /api/twitch/streams` (body JSON `logins: []`)
- `GET /health`

### Variables d'environnement

Le fichier exemple est fourni via `backend-production/.env.example` :

- `TWITCH_CLIENT_ID`
- `TWITCH_CLIENT_SECRET`
- `TWITCH_API_URL` (par défaut : `https://api.twitch.tv/helix`)
- `CORS_ORIGIN` (ex: `*`)

### Hébergement (Apache / Hostinger)

Le fichier `backend-production/.htaccess` gère :

- le rewrite vers les scripts PHP sans extension (`/api/twitch/...` -> `api/twitch/...php`)
- le blocage des fichiers "cachés" (ex: `.env`)

### Installer / configurer

1. Dépose `backend-production/` sur ton hôte Apache.
2. Assure-toi que `.htaccess` est actif.
3. Configure les variables dans un `.env` au bon emplacement (selon Hostinger).

### CORS

Le backend expose des headers CORS pour permettre les appels depuis l'extension :

- `Access-Control-Allow-Origin` (via `CORS_ORIGIN`)
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`

---

## `backend-nest/` (NestJS / Node.js)

### Ce que c'est

Backend **NestJS 11** (Node.js / TypeScript) qui réimplémente le même contrat d'API que `backend-production/` mais avec :

- **Rate limiting** : `100 req / 60s / IP` via `@nestjs/throttler` (le `/health` est exclu).
- **Cache du token Twitch en mémoire** (au lieu d'un fichier dans `/tmp` côté PHP).
- **Validation** automatique des entrées via `class-validator` / `class-transformer`.
- **CORS** configurable via `CORS_ORIGIN`.
- `trust proxy` activé pour récupérer la vraie IP cliente derrière un reverse proxy (Nginx, Cloudflare).

### Endpoints

Identiques aux autres backends :

- `GET /health`
- `GET /api/twitch/search?q={login}`
- `POST /api/twitch/streams`

### Lancer en local

```bash
cd backend-nest
npm install
cp .env.example .env   # puis remplis TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET
npm run start:dev
```

Par défaut le serveur écoute sur `http://localhost:3000`.

### Variables d'environnement

Le fichier exemple est fourni via `backend-nest/.env.example` :

- `TWITCH_CLIENT_ID`
- `TWITCH_CLIENT_SECRET`
- `TWITCH_API_URL` (par défaut : `https://api.twitch.tv/helix`)
- `CORS_ORIGIN` (par défaut : `*`)
- `PORT` (par défaut : `3000`)

### Hébergement (VPS)

Stack recommandée :

- **Node.js 20 LTS**, build via `npm run build` puis `node dist/main.js`.
- **PM2** ou **systemd** pour le process management (démarrage auto, logs, redémarrage).
- **Nginx** en reverse proxy devant (TLS via Let's Encrypt / Certbot), avec `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;` pour que le rate limiter compte la vraie IP cliente.
- **`.env`** hors du repo, avec permissions restreintes.

En production, le backend Nest est servi sur **`https://twitch.phangwilly.com`** et c'est l'URL utilisée par l'extension.

---

## `extension/` (Chrome, Manifest V3)

### Ce que c'est

Une extension qui :

- gère une watchlist via `chrome.storage.local`
- affiche une liste `LIVE` / `OFFLINE`
- propose la recherche d'un streamer
- met à jour le badge d'icône avec le nombre de lives
- rafraîchit le badge via `chrome.alarms` (1 minute)

### Scripts & build

```bash
cd extension
npm install
npm run build
```

### Local / sans "Vite"

Le build génère `dist/`. En pratique, pour charger l'extension en local, tu utilises le mode "chargée depuis un dossier" dans Chrome.

### Connexion au backend

L'extension teste plusieurs base URLs dans l'ordre, configurées dans :

- `extension/src/lib/api.ts`
- `extension/public/background.js`
- `extension/public/manifest.json` (`host_permissions`)

Actuellement :

- `https://twitch.phangwilly.com` → backend NestJS en production (VPS)
- `http://localhost:3000` → fallback dev local (`backend-nest` ou `backend-production`)

Si tu héberges ton backend sur un autre domaine, adapte ces valeurs **et** la liste `host_permissions` dans `manifest.json`.

---

## Notes de sécurité

- `TWITCH_CLIENT_SECRET` ne doit jamais être dans le client (`mvp/` et `extension/` ne doivent pas l'exposer).
- Le secret est côté serveur :
  - MVP (Next.js Route Handlers)
  - backend PHP (`backend-production/`)
  - backend NestJS (`backend-nest/`)

---
