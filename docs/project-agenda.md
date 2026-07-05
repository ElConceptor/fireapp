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
- Scripts projet:
  - `npm run lint`: valide la base propre;
  - `npm run build`: copie le prototype dans `dist/`;
  - `npm run serve`: sert `dist/` ou `src/` localement.

## Agenda technique priorise

### 1. Stabiliser la base propre

- Statut: fait pour le prototype statique actuel.
- Garder le depot sans artefacts historiques ni dependances inutiles.
- Ajouter une vraie stack applicative seulement quand les modeles de donnees et
  les workflows sont decides.

### 2. Consolider le prototype SaaS

- Statut: console admin interactive ajoutee au prototype.
- Statut: agents, modules, workflow, decisions et artefacts sont maintenant
  alimentes par un contrat JSON versionne.
- Statut: intake, query globale, filtre artefacts et journey map ajoutes.
- Ajouter une vue detail mission: objectifs, agents, taches et timeline.
- Enrichir la vue couts IA avec alertes et arbitrages modele.
- Ajouter actions approve/reject sur les validations de la campagne test.

### 3. Definir le Data Hub

- Statut: modele initial documente dans `docs/data-hub-model.md`.
- Definir la politique de retention et de chiffrement.
- Preparer l ajout d un vector store pour la memoire semantique.

### 4. Orchestration agentique

- Decrire les agents en configuration: role, outils, modele par defaut, budget,
  permissions et conditions de delegation.
- Ajouter le routage de modeles par cout et criticite.
- Ajouter un registre de validation humaine pour actions sensibles.

### 5. Securite et gouvernance

- Mettre en place RBAC multi-tenant.
- Separer secrets, configurations et permissions MCP.
- Journaliser toutes les actions sensibles.
- Ajouter des plafonds de cout par tenant, module et mission.

### 6. Integrations externes

- Commencer par imports documents et CRM simple.
- Ajouter MCP seulement avec scopes limites et audit.
- Prioriser connecteurs utiles: Drive/Notion, CRM, email, analytics, ads.

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
