# AGENTS.md

## Cursor Cloud specific instructions

`fireapp` is an **Ionic 3 / Angular 5** mobile web app (built with `@ionic/app-scripts` 3.1.9)
that stores a "garde" list in a Firebase Realtime Database. There is a single frontend service
(no backend in this repo).

### Node version (critical)
This legacy 2018 toolchain (`@ionic/app-scripts` 3.1.9, `node-sass` 4.7.2, TypeScript 2.6) does
**not** work on modern Node. Use **Node 8.17.0** (installed via `nvm`). `node-sass` 4.7.2 only has
prebuilt binaries up to Node 9.

The sandbox ships `/exec-daemon/node` (Node 22) earlier in `PATH` than nvm, so `nvm use` alone is
not enough. Node 8 is prepended to `PATH` in `~/.bashrc`, so **new login/interactive shells and new
tmux sessions already get Node 8** (`node --version` should print `v8.17.0`). If you run a command in
a stripped environment, prepend it manually:
`export PATH="$HOME/.nvm/versions/node/v8.17.0/bin:$PATH"`.

### Commands (run from repo root, see `package.json` scripts)
- Lint: `npm run lint` (tslint; unused-import warnings are expected and do not fail the run)
- Build: `npm run build` (outputs to `www/`)
- Dev server: `npm run ionic:serve -- --nobrowser --address 0.0.0.0` → serves at
  http://localhost:8100/ with live-reload/watch. Runs in the foreground; use tmux to keep it alive.

### Firebase backend is dead (important gotcha)
The hardcoded Firebase project in `src/app/app.module.ts` (`master-ad05d`) has been
**deactivated** by Google, so add/list operations against it fail silently (clicking "Add!" does
nothing visible and the list stays empty). This is an external dependency issue, not an environment
bug. The frontend, build, and navigation all work. To exercise the list persistence feature you must
plug your own Firebase config into `src/app/app.module.ts` (the README asks for exactly this).
