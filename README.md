# OneStop Web Apps

Nx monorepo for the OneStop Cinolu web applications. The workspace currently contains two server-rendered Angular apps:

- `client`: public-facing OneStop site with pages for landing, programs, projects, opportunities, events, blog, ambassadors, partners, FAQ, auth, and user dashboard flows.
- `admin`: internal admin portal for managing dashboard, users, ventures, programs, projects, opportunities, events, mentors, blog, and account flows.

## Tech Stack

- Nx `22`
- Angular `21`
- Angular SSR with Express server output
- Tailwind CSS `4`
- ESLint and Prettier
- NgRx Signals
- ngx-translate
- Quill, FilePond, Notyf, and lucide-angular for editor, upload, notification, and icon UI pieces

## Requirements

- Node.js compatible with Angular `21`
- pnpm

Install dependencies:

```sh
pnpm install
```

## Development

Run the public client app:

```sh
pnpm dev:client
```

Run the admin app:

```sh
pnpm dev:admin
```

The client dev server runs on port `4000`, the admin dev server on port `4100`.

You can also call Nx targets directly:

```sh
pnpm nx serve client
pnpm nx serve admin
```

### With Docker

A dev Compose file mounts the repo into containers and runs both apps via the Nx dev servers:

```sh
docker compose -f compose.dev.yml -p onestop-web up
```

`client` is served on `4000` and `admin` on `4100`.

## Build

Build each app for production:

```sh
pnpm build:client
pnpm build:admin
```

Build outputs are written to:

- `dist/apps/client`
- `dist/apps/admin`

Both apps use Angular's server output mode. After building, run the SSR server entry with:

```sh
pnpm ssr:client
pnpm ssr:admin
```

### With Docker

The `Dockerfile` is a multi-stage build (`base` -> `dependencies` -> `development`/`build` -> `production`) that installs dependencies, runs `pnpm build`, and prunes to production dependencies. `compose.prod.yml` builds the `production` target and serves both apps' SSR output:

```sh
docker compose -f compose.prod.yml -p onestop-web up -d
```

## CI/CD

`.github/workflows/deploy.yml` runs lint on every push to `main`, then deploys over SSH by pulling the latest `main` and running `docker compose -f compose.prod.yml up -d --remove-orphans` on the target VPS.

## Quality Checks

Run lint for a project:

```sh
pnpm nx lint client
pnpm nx lint admin
```

Inspect all available targets for a project:

```sh
pnpm nx show project client
pnpm nx show project admin
```

View the Nx project graph:

```sh
pnpm nx graph
```

## Project Layout

```text
apps/
  client/
    src/app/core/        Shared client infrastructure such as auth, guards, interceptors, providers, services, and strategies
    src/app/features/    Public site and client dashboard feature areas
    src/app/layout/      Client shell, layout pages, and navigation data
    src/app/shared/      Client shared UI, models, services, helpers, pipes, directives, config, and styles
    src/assets/i18n/     Client translation files
    public/              Client public assets, robots.txt, sitemap.xml
  admin/
    src/app/core/        Shared admin infrastructure such as auth, guards, interceptors, providers, and strategies
    src/app/features/    Admin feature areas
    src/app/layout/      Admin shell, layout pages, navigation data, and layout types
    src/app/shared/      Admin shared UI, models, services, helpers, pipes, and data
    public/              Admin public assets and robots.txt
```

## Nx Notes

This workspace uses project-level `project.json` files under `apps/client` and `apps/admin`. Shared Nx defaults live in `nx.json`, including Angular build caching and ESLint target configuration.

New Angular applications and libraries should follow the generator defaults in `nx.json`: CSS styles, ESLint enabled, and no generated test runner unless explicitly added.
