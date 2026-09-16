# Meet at 9

Meet at 9 is a shared meeting-availability board. Three participants select
their colors, mark available hours, and edit the meeting description, day
labels, names, and start time.

## Stack

- **Client:** Expo 54, React Native, Expo Router, React Native Web, TypeScript
- **API:** Express 5, TypeScript, Zod validation, Pino logging
- **Database:** PostgreSQL through `pg` and Drizzle ORM
- **API contract:** OpenAPI in `lib/api-spec/openapi.yaml`
- **Generated clients:** Orval-generated React Query and Zod packages
- **Workspace:** pnpm monorepo

The runtime flow is:

```text
Expo client -> REST API under /api -> Express -> Drizzle -> PostgreSQL
```

The app has no authentication. Anyone who can reach the API can read and
change the shared board. Add authentication, authorization, HTTPS, and
rate-limiting before exposing it to an untrusted audience.

## Required tool versions

The repository pins the expected versions in `package.json` and `.nvmrc`:

- Node.js 20.19.4 (any Node 20.x release supported by Expo is acceptable)
- pnpm 10.26.1

With `nvm`:

```bash
nvm install
nvm use
corepack enable
corepack prepare pnpm@10.26.1 --activate
```

## Database setup

The API needs a PostgreSQL-compatible database. Supabase is a convenient
choice, but any PostgreSQL provider works.

### Option A: apply the SQL file

1. Create a PostgreSQL or Supabase project.
2. Open the provider's SQL editor.
3. Copy and run [`supabase/schema.sql`](supabase/schema.sql).
4. Create a local `.env` file:

   ```bash
   cp .env.example .env
   ```

5. Set the server-only connection string in `.env`:

   ```env
   APP_DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/postgres?sslmode=require
   ```

   `DATABASE_URL` is also supported as an alias.

The SQL file creates the current five tables:

- `meeting_cells`
- `meeting_labels`
- `meeting_user_names`
- `meeting_description`
- `meeting_config`

If you use `schema.sql`, you do **not** also need to run Drizzle for the
initial setup.

### Option B: let Drizzle synchronize the schema

This repository also contains the Drizzle schema definitions and a `push`
script. Load the environment variables and run:

```bash
set -a
. ./.env
set +a
pnpm --filter @workspace/db run push
```

The current project uses `drizzle-kit push`; it does not currently contain a
committed migration history. Drizzle remains the source of truth for future
schema changes. Review changes before applying them to production, and do not
use `push-force` unless you understand its consequences.

## Run locally

Install all workspace dependencies:

```bash
pnpm install
```

Load the local server environment:

```bash
set -a
. ./.env
set +a
```

Start the API in one terminal:

```bash
PORT=8080 pnpm --filter @workspace/api-server run dev
```

The API is available at `http://localhost:8080`. Its health endpoint is:

```text
http://localhost:8080/api/healthz
```

Start the Expo client in another terminal:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8080 pnpm --filter @workspace/mobile run dev
```

For Expo Go on a physical phone, replace `localhost` with the computer's
LAN address, for example:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.10:8080 pnpm --filter @workspace/mobile run dev
```

`EXPO_PUBLIC_API_URL` is a public URL and is bundled into the client. Never
put a database URL in an `EXPO_PUBLIC_*` variable.

## Concrete deployment: Render + Supabase

This is one complete hosting path. The same repository can be connected to
two Render services:

- a **Render Web Service** for the Express API;
- a **Render Static Site** for the Expo web export.

### 1. Create and initialize the database

Create a Supabase project, open the SQL Editor, and run:

```text
supabase/schema.sql
```

Copy the server-side PostgreSQL connection string from Supabase. Keep it
private; do not use it as an Expo or browser variable.

### 2. Deploy the API to Render

Create a new **Web Service** from the GitHub repository with:

| Setting | Value |
| --- | --- |
| Root directory | repository root |
| Runtime | Node |
| Build command | `corepack enable && corepack prepare pnpm@10.26.1 --activate && pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build` |
| Start command | `pnpm --filter @workspace/api-server run start` |
| Health check path | `/api/healthz` |

Add this environment variable to the Render API service:

```text
APP_DATABASE_URL=your-private-postgresql-connection-string
```

Render provides `PORT` automatically. The API listens on that value, so do
not hard-code a port in the server code.

After the service deploys, copy its HTTPS URL. It will look similar to:

```text
https://meet-at-9-api.onrender.com
```

### 3. Deploy the Expo web client as a Render Static Site

Create a second Render service of type **Static Site** from the same
repository:

| Setting | Value |
| --- | --- |
| Root directory | repository root |
| Build command | `corepack enable && corepack prepare pnpm@10.26.1 --activate && pnpm install --frozen-lockfile && pnpm --filter @workspace/mobile run build` |
| Publish directory | `artifacts/mobile/dist` |

Add this environment variable to the Render Static Site:

```text
EXPO_PUBLIC_API_URL=https://meet-at-9-api.onrender.com
```

Replace the example URL with the actual Render API URL. The variable must be
present during the web build because Expo embeds it into the generated
JavaScript.

Add this Render rewrite so Expo Router routes work when a user refreshes a
deep link:

```text
Source: /*
Destination: /index.html
Action: Rewrite
```

This app uses an Expo **static export**, not SSR. The web build produces
files in `artifacts/mobile/dist`; Render serves those files directly. There
is no Next.js-style server rendering process.

### 4. Optional native/mobile build

For an Expo Go session or a native build, use the same API URL:

```bash
EXPO_PUBLIC_API_URL=https://meet-at-9-api.onrender.com pnpm --filter @workspace/mobile run dev
```

The mobile bundle must be rebuilt whenever `EXPO_PUBLIC_API_URL` changes.

## Build and verification

Type-check the workspace:

```bash
pnpm run typecheck
```

Build the API and Expo web client:

```bash
pnpm run build
```

Build only the static web export:

```bash
EXPO_PUBLIC_API_URL=https://your-api.example.com \
  pnpm --filter @workspace/mobile run build
```

Serve the generated static export locally:

```bash
PORT=3000 pnpm --filter @workspace/mobile run serve
```

## API client generation

When changing an endpoint:

1. Update `lib/api-spec/openapi.yaml`.
2. Regenerate the clients:

   ```bash
   pnpm --filter @workspace/api-spec run codegen
   ```

3. Update the server implementation and client usage.
4. Run `pnpm run typecheck` and `pnpm run build`.

## Contributing

```bash
git clone https://github.com/YOUR_ACCOUNT/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
nvm install
nvm use
corepack enable
corepack prepare pnpm@10.26.1 --activate
pnpm install
cp .env.example .env
```

Each contributor should use their own database and their own `.env` file.
Never commit `.env`, database passwords, Supabase service-role keys, or
other credentials.