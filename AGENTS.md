# AGENTS.md - Dossier de passation pour agents IA

Source de verite pour tout agent (ou developpeur) qui prend le relai sur ce
depot. A lire en entier avant toute modification. Optimise pour un workflow
expert avec Claude Fable.

## Le produit en une phrase

SaaS agentique marketing & sales: une equipe d agents IA orchestree qui comprend
le produit d un souscripteur, analyse son marche, construit campagnes et
rapports de niveau consulting, sous validation humaine ajustable, avec suivi
strict des couts IA et monetisation par plans.

## Etat actuel

| Composant | Etat | Emplacement |
| --- | --- | --- |
| Prototype UI complet | Livre, zero dependance | `src/` |
| Contrat runtime versionne | Source de verite produit | `src/data/prototype-data.json` |
| Backend multi-tenant phase 1 | Livre et teste | `server/` |
| Tests automatises (3 suites) | Verts | `scripts/` |
| Documentation produit/securite | Complete | `docs/` |
| CI GitHub Actions | En place | `.github/workflows/ci.yml` |

- Branche de travail: `cursor/agentic-saas-foundation-35dd`
- PR ouverte: #2 (`ElConceptor/fireapp`, base `master`)
- Serveurs de test (sessions tmux sur la VM):
  - `saas-prototype-server` -> UI statique, port 4173
  - `saas-backend-server` -> API + UI, port 4180

## Regles structurantes (a respecter)

1. **Zero dependance runtime.** Tout est en Node natif et JS/CSS/HTML pur.
   N ajoute une dependance que si un besoin reel le justifie, et documente-le.
2. **Le contrat JSON est la source de verite.** Ajoute une donnee produit dans
   `src/data/prototype-data.json`, jamais en dur dans l UI. Le backend le sert
   filtre par plan.
3. **Enforcement cote serveur uniquement.** Le gating UI est cosmetique; toute
   regle de plan/role/quota se verifie dans `server/api.js`.
4. **Echapper tout HTML injecte** via `escapeHtml()` dans `src/app.js`.
5. **Les prompts complets restent cote serveur.** Ne jamais serialiser un
   `samplePrompt` verrouille (voir `buildRuntime` dans `server/api.js`).
6. **Toute action sensible ecrit un audit** (`recordAudit`).
7. **Tests verts avant commit.** Voir section Verification.
8. **Un commit = un changement logique.** Committer puis pousser, puis mettre a
   jour la PR #2 a chaque iteration.
9. **Rester sur la branche de travail.** Ne pas forcer, ne pas amender.

## Architecture

```
src/                Prototype front (index.html, app.js, styles.css)
src/data/           prototype-data.json = contrat runtime
server/
  db.js             SQLite (node:sqlite) + schema multi-tenant + audit
  auth.js           scrypt, sessions Bearer, RBAC
  api.js            API HTTP, enforcement plan, service statique durci
scripts/
  validate-static.js  lint contrat + fichiers requis + syntaxe
  test-journeys.js    parcours, query, cibles UI, coherence contrat
  test-backend.js     auth, isolation tenant/IDOR, enforcement plan, audit
  build-static.js     copie src/ + docs/ vers dist/
docs/               toute la doc produit, securite, backend, agenda
```

Schema DB (concu pour migrer vers PostgreSQL + Row Level Security):
`tenants`, `users`, `sessions`, `tenant_modules`, `audit_events`.

API principale: `POST /api/auth/register|login`, `GET /api/runtime`,
`GET /api/audit`, `PATCH /api/tenant/modules/:id`, `POST /api/tenant/plan`.

## Verification (obligatoire avant commit)

```bash
npm run lint          # contrat + fichiers + syntaxe
npm run test:journeys # parcours produit et query
npm run test:backend  # securite: auth, isolation, enforcement, audit
npm run build         # build statique dans dist/
```

Anti-regression legacy: `package.json` et `package-lock.json` ne doivent
contenir aucun de ces termes: ionic, cordova, firebase, angularfire, node-sass.

## Lancer en local

```bash
npm run start   # backend + UI sur 127.0.0.1:4180
npm run serve   # UI statique seule sur 4173
```

## Ou trouver quoi (docs)

| Sujet | Fichier |
| --- | --- |
| Vision et architecture | `docs/agentic-marketing-saas-architecture.md` |
| Modele de donnees Data Hub | `docs/data-hub-model.md` |
| Contrat runtime | `docs/runtime-contracts.md` |
| Monetisation (plans, niveaux, prompts) | `docs/monetization-v1.md` |
| Rapports consulting + chat/vocal | `docs/consulting-reports-and-chat.md` |
| Revue critique et mitigations | `docs/critical-review-and-mitigations.md` |
| Scenario demo client + campagne | `docs/demo-campaign-scenario.md` |
| Passe UX/journeys | `docs/journey-ux-review.md` |
| Backend phase 1 | `docs/backend-phase1.md` |
| Agenda et next steps | `docs/project-agenda.md` |

## Prochaine tache prioritaire (phase 2)

Brancher l orchestrateur LLM reel derriere une route `POST /api/missions`:
- reutiliser `missionPlan` du contrat comme sequence de taches;
- ecrire un `ai_usage_events` par tache (creer la table);
- router selon le niveau d agent (debutant/confirme/expert) vers un tier modele;
- decrementer les credits du plan et couper a 100%;
- garder les prompts cote serveur, resolus apres verif plan/role.

Ensuite: connecter le front a `/api/runtime`, puis Stripe (phase 3).

## Convention de reprise

Quand tu prends le relai:
1. Lis ce fichier, puis `docs/project-agenda.md`.
2. Verifie l etat: `git log --oneline -10` et `git status`.
3. Lance les 4 commandes de verification.
4. Travaille par petits commits, mets a jour la PR #2.
5. Mets a jour ce fichier et `docs/project-agenda.md` si tu changes une regle
   structurante ou l etat d une phase.
