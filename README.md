# S3WebClient

React + TypeScript + Vite application to browse/manage S3-compatible storage, with a production Docker image served by Nginx.

## Prerequisites
- Node.js 20+ (22 recommended)
- npm 9+
- Docker (for container build/run)

## Run locally (dev)
1. Install dependencies:
   - `cd S3WebClient`
   - `npm ci`
2. Start the dev server:
   - `npm run dev`
3. Open the app:
   - http://localhost:5173

Optional:
- Unit tests: `npm test`
- Type-check + build preview: `npm run build && npm run preview`

## Build production (static)
From `S3WebClient`:
- `npm run build`
- Output is in `S3WebClient/dist/`

## Configuration (Vite)
Runtime config for a static SPA is baked at build-time. Provide variables via `.env.production` in `S3WebClient/` before building. Only variables prefixed with `VITE_` are exposed to the client.

Example `S3WebClient/.env.production`:
```
VITE_APP_NAME=S3 Web Client
VITE_API_BASE_URL=https://api.example.com
```

## Docker

This repo includes a multi-stage Dockerfile at the repo root that builds the app and serves it with Nginx.

Build image:
- `docker build -t s3webclient .`

Run container:
- `docker run --rm -p 8080:80 s3webclient`
- Open http://localhost:8080

Notes:
- The Docker build uses Node 22 (alpine) and `nginx:stable-alpine`.
- SPA routing is configured via `nginx.conf` with `try_files ... /index.html`.
- To customize app config, add/edit `S3WebClient/.env.production` before building the image (see Configuration above).

## CI/CD (GitHub Actions → Docker Hub)

This repo includes a GitHub Actions workflow to build and publish the Docker image to Docker Hub.

1) Create repository secrets (Settings → Secrets and variables → Actions → New repository secret):
- `DOCKERHUB_USERNAME`: your Docker Hub username
- `DOCKERHUB_TOKEN`: a Docker Hub access token (Account Settings → Security → New Access Token)

2) Optional: adjust image name
- By default, the workflow publishes to `${DOCKERHUB_USERNAME}/s3webclient`.
- To change, edit `env.IMAGE_NAME` in `.github/workflows/docker-publish.yml`.

3) Triggers
- On push to branches named `release-<version>` (e.g., `release-0.0.1`) or `realease-<version>`.
- Also via manual dispatch from the Actions tab.

4) Tagging & Releases
- On `release-*` branches the workflow pushes two tags:
  - `<DOCKERHUB_USERNAME>/s3webclient:<version>` where `<version>` comes from the branch name (prefix `release-`/`realease-` stripped)
  - `<DOCKERHUB_USERNAME>/s3webclient:latest`
- Nessun trigger su `main`/`master`: crei la release quando apri/pushi un branch `release-*`.
- Viene anche creata/aggiornata una GitHub Release con tag `<version>`.
