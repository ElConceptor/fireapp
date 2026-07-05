# Agentic Marketing & Sales SaaS

Prototype web propre d un SaaS qui orchestre une equipe d agents IA pour aider une
entreprise a comprendre son produit, analyser son marche, construire des campagnes,
proposer un budget et garder le souscripteur dans la boucle de decision.

## Ce que contient ce prototype

- Interface statique sans dependance legacy.
- Mission Control: visualisation des agents, objectifs, couts et artefacts.
- Admin Console: modules activables, limites de cout et gouvernance.
- Agenda projet: decisions, risques et prochaines etapes.

## Reprise par un autre agent

Tout agent ou developpeur qui reprend le projet doit lire [AGENTS.md](AGENTS.md)
en premier: regles structurantes, architecture, commandes de verification et
prochaine tache prioritaire.

## Documentation

La vision produit, l architecture, la securite, les modules et la feuille de route
sont decrits dans:

- [docs/agentic-marketing-saas-architecture.md](docs/agentic-marketing-saas-architecture.md)
- [docs/backend-phase1.md](docs/backend-phase1.md)
- [docs/consulting-reports-and-chat.md](docs/consulting-reports-and-chat.md)
- [docs/critical-review-and-mitigations.md](docs/critical-review-and-mitigations.md)
- [docs/data-hub-model.md](docs/data-hub-model.md)
- [docs/demo-campaign-scenario.md](docs/demo-campaign-scenario.md)
- [docs/journey-ux-review.md](docs/journey-ux-review.md)
- [docs/monetization-v1.md](docs/monetization-v1.md)
- [docs/runtime-contracts.md](docs/runtime-contracts.md)
- [docs/project-agenda.md](docs/project-agenda.md)

## Commandes

```bash
npm install
npm run lint
npm run test:journeys
npm run test:backend
npm run build
npm run serve   # UI statique seule (port 4173)
npm run start   # backend multi-tenant + UI (port 4180)
```
