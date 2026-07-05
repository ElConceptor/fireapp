# Agenda projet - SaaS agentique marketing & sales

## Objectif courant

Construire un SaaS modulaire ou une equipe d agents IA aide un souscripteur a
comprendre son produit, analyser le marche, proposer campagnes, budgets et plans
d action, avec validation humaine et suivi strict des couts.

## Etat actuel

- Ancien prototype sans lien supprime du contenu suivi.
- Nouveau prototype web statique cree dans `src/`.
- Aucun framework legacy ni dependance externe dans `package.json`.
- Documentation d architecture initiale ajoutee dans `docs/`.
- Modele de donnees Data Hub ajoute dans `docs/data-hub-model.md`.
- Prototype enrichi avec modules cliquables, budget, decisions et artefacts.
- Donnees runtime extraites dans `src/data/prototype-data.json`.
- Contrat runtime documente dans `docs/runtime-contracts.md`.
- Passe journey, UI/UX et query documentee dans `docs/journey-ux-review.md`.
- Scenario compte client et campagne test documente dans `docs/demo-campaign-scenario.md`.
- Monetisation V1 (plans, niveaux d agents, prompt packs) documentee dans
  `docs/monetization-v1.md` et active dans le prototype.
- Revue critique par reseau d agents et mitigations dans
  `docs/critical-review-and-mitigations.md`; outils agents, autonomie par
  module, reseau QA, registre securite et jauge credits ajoutes.
- Rapports consulting (Minto, TAM/SAM/SOM, Porter, SWOT, business case) et
  chat humain-agents avec avatars et vocal dans
  `docs/consulting-reports-and-chat.md`.
- Chaine operationnelle en place dans le prototype: intake -> lancement de
  mission -> taches agents en sequence -> brief GTM genere depuis les reponses.
- Decisions humaines actionnables (approuver/rejeter) avec journal d audit
  permanent qui trace plans, modules, autonomie, missions et campagnes.
- Entree vocale (speech-to-text) ajoutee au chat agents.
- Phase 1 mise en prod livree dans `server/`: auth scrypt + sessions,
  isolation multi-tenant SQLite, enforcement serveur des plans, protection
  des prompts cote serveur et audit persistant (`docs/backend-phase1.md`).
- Passation structuree pour agents dans `AGENTS.md`.
- CI GitHub Actions et template de PR dans `.github/`.
- Scripts projet:
  - `npm run lint`: valide contrat, fichiers requis et syntaxe;
  - `npm run test:journeys`: parcours produit et query;
  - `npm run test:backend`: auth, isolation tenant, enforcement, audit;
  - `npm run build`: copie prototype + docs dans `dist/`;
  - `npm run serve`: UI statique (4173);
  - `npm run start`: backend multi-tenant + UI (4180).

## Roadmap de mise en production par phases

### Phase 0 - Prototype et contrat (FAIT)

- Prototype UI complet sans dependance dans `src/`.
- Contrat runtime versionne dans `src/data/prototype-data.json`.
- Chaine intake -> mission -> taches -> brief GTM genere.
- Decisions approve/reject, journal d audit, chat agents avec avatars et vocal.
- Rapports consulting, outils agents, autonomie par module, reseau QA.

### Phase 1 - Socle backend multi-tenant (FAIT)

- Auth scrypt + sessions Bearer + RBAC (`server/auth.js`).
- Isolation multi-tenant SQLite, concue pour migrer vers PostgreSQL + RLS.
- Enforcement serveur des plans (403 sur module hors plan, meme forge).
- Protection des prompts cote serveur, audit persistant par tenant.
- Suite `npm run test:backend`: auth, IDOR, enforcement, audit.

### Phase 2 - Orchestrateur LLM reel (PROCHAINE)

- Route `POST /api/missions` reutilisant `missionPlan` du contrat.
- Un `ai_usage_events` ecrit par tache (nouvelle table a creer).
- Routage multi-modele par niveau d agent (debutant/confirme/expert).
- Decrement des credits du plan + coupure a 100% du quota.
- Prompts resolus cote serveur apres verif plan/role.
- Connecter le front a `/api/runtime` pour refleter l etat serveur.

### Phase 3 - Monetisation reelle

- Stripe checkout + webhooks abonnement + mapping plan/tenant.
- Facturation des credits hors quota, essai/demo sandbox.
- Application stricte des limites (connecteurs, packs, niveaux).

### Phase 4 - Connecteurs et outils reels

- Demarrer etroit: Google Drive + Brevo + GA4.
- Coffre de secrets (KMS), scopes OAuth minimaux, revocation.
- Etendre au reste du catalogue apres preuve de la boucle envoyer -> mesurer.

### Phase 5 - Durcissement avant ouverture publique

- Audit append-only branche sur SIEM + alertes.
- Rate limiting par tenant/IP/route.
- Defense anti-injection de prompt + agent red team en continu.
- DPIA + DPA sous-traitants IA + effacement par tenant (RGPD).
- TLS + reverse proxy + WAF; headers securite deja en place cote API.

### Phase 6 - Deploiement et observabilite

- Hebergement: Vercel (app) + Neon/Supabase (Postgres) + S3/R2 (objets).
- CI (deja en place) en gate de deploiement + scan de dependances.
- OpenTelemetry + Grafana: latence, cout IA par tenant, taux d erreur agents.
- Environnements dev/staging/prod separes.

## Outillage developpeur (GitHub)

- CI GitHub Actions: `.github/workflows/ci.yml` (lint, journeys, backend,
  build, garde anti-legacy) sur push master et pull requests.
- Template de PR: `.github/pull_request_template.md` avec checklist des regles
  structurantes.
- Passation agents: `AGENTS.md` a la racine, lu en premier par tout agent.

## Decisions ouvertes

| Sujet | Decision a prendre | Risque |
| --- | --- | --- |
| Socle frontend | Garder prototype statique ou passer a Next.js | Migrer trop tot avant le modele produit |
| Orchestration | Vercel AI SDK, LangGraph ou orchestration maison | Trop d abstraction trop tot |
| Vector store | pgvector ou Qdrant | Cout et complexite operationnelle |
| MCP | Connecteurs natifs ou MCP generique | Permissions trop larges si mal gouvernees |
| Modele cout | AI Gateway/OpenRouter/couche interne | Perte de controle si les couts ne sont pas audites |
| Contrat runtime | JSON versionne puis API multi-tenant | Divergence UI/backend sans validation |

## Definition de done du MVP

- Un souscripteur cree une mission.
- Le systeme collecte les documents et pose les questions manquantes.
- L orchestrateur cree des taches pour les agents specialises.
- Les agents produisent un brief produit, une analyse marche, une campagne, un
  budget et un plan d action.
- Le souscripteur valide les decisions sensibles.
- Le Data Hub conserve artefacts, decisions, sources et couts.
- L admin peut activer/desactiver les modules et fixer des limites.
