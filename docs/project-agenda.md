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

- Rendre la console admin interactive pour activer/desactiver les modules.
- Ajouter une vue detail mission: objectifs, agents, decisions, artefacts.
- Ajouter une vue couts IA: budget, consommation, alertes et arbitrages modele.

### 3. Definir le Data Hub

- Modeliser tenants, users, missions, tasks, artifacts, documents, decisions,
  modules, integrations et ai_usage_events.
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

## Definition de done du MVP

- Un souscripteur cree une mission.
- Le systeme collecte les documents et pose les questions manquantes.
- L orchestrateur cree des taches pour les agents specialises.
- Les agents produisent un brief produit, une analyse marche, une campagne, un
  budget et un plan d action.
- Le souscripteur valide les decisions sensibles.
- Le Data Hub conserve artefacts, decisions, sources et couts.
- L admin peut activer/desactiver les modules et fixer des limites.
