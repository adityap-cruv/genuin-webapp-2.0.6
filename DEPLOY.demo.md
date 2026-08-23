# Demo deploy (single container, dummy backend)

Deploys `/home` as a self-contained webapp: infinite scroll, contextual video↔article mapping,
intelligence chat + Koah ad, article pages — with the "backend" served by the app's own
`/api/home/*` routes (dummy data). **No separate BFF, no CORS, no backend URL to configure.**

## What the image builds (why `Dockerfile.demo`, not the official one)
`next build` now imports `@genuin/genai-sdk` (KoahAdWidget), whose `dist` is gitignored, and the
placements must load your modified web-sdk. So the demo image additionally:
1. builds **genai** (needed by `next build`),
2. builds the modified **web-sdk** → bundles it into `public/sdk` (served at `/sdk/gen_sdk.min.js`).
The official `apps/webapp/Dockerfile` is untouched.

## One thing you must provide: `apps/webapp/.env.production.local`
The webapp's own build/runtime env (API base URLs, brand/auth config, etc.) — the prod/qa
equivalent of what you run locally (`apps/webapp/.env.local` + root `.env`). It's passed as a build
**secret**, never baked into an image layer. The demo-specific `NEXT_PUBLIC_*` already have defaults
baked into `Dockerfile.demo` (as build ARGs), so do **not** put these in the secret:
`NEXT_PUBLIC_GENUIN_SDK_URL`, `NEXT_PUBLIC_CURRENT_ENV`, `NEXT_PUBLIC_HOME_BFF_URL` (must stay unset).

## Build & run (on the AWS instance) — Dockerfile only
```bash
# 1. put your env in apps/webapp/.env.production.local  (see above)

# 2. build (BuildKit is required for the --secret mount; default on Docker 23+, else prefix DOCKER_BUILDKIT=1)
docker build \
  -f apps/webapp/Dockerfile.demo \
  --secret id=env_file,src=apps/webapp/.env.production.local \
  -t genuin-webapp-demo .

# 3. run
docker run -d -p 8080:4000 --name genuin-webapp-demo genuin-webapp-demo
# open http://<ec2-public-dns>:8080/home
```
The Koah token and `NEXT_PUBLIC_*` default inside `Dockerfile.demo`; override any with
`--build-arg NAME=value` if needed. Only the `--secret` is required.

## AWS notes
- Open **port 8080** (webapp) in the EC2 security group. No other port is needed — everything is
  same-origin (the dummy backend is `/api/home/*` inside the app).
- Because it's same-origin, the deploy works on **any** EC2 IP/DNS with **no rebuild** — nothing is
  hardcoded to a host.
- To serve on port 80 instead, run with `-p 80:4000`.

## Caveats (fine for a demo; here's how to go further)
- **Intelligence chat text is mock data**: genai is built in `development` mode (to skip its
  env-validation wall), which uses its built-in mock assistant responses. The **Koah ad is real**
  (token baked in). For real chat, build genai with the full `VITE_GENAI_*` env in qa mode.
- **web-sdk builds with qa defaults** (its `.env` is dockerignored) — fine for public placement
  content.

## Swapping in a real home backend later
See `apps/webapp/src/lib/home-feed/README.md` — either set `NEXT_PUBLIC_HOME_BFF_URL` to a real
backend, or edit the two seam functions (`getHomeLayout` / `getHomeFeedPage`). The UI never changes.
