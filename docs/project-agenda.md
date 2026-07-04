# Agenda projet - SaaS agentique marketing & sales

## Objectif courant

Construire un SaaS modulaire ou une equipe d agents IA aide un souscripteur a
comprendre son produit, analyser le marche, proposer campagnes, budgets et plans
d action, avec validation humaine et suivi strict des couts.

## Etat actuel

- Prototype UI Ionic transforme en trois espaces:
  - Mission Control;
  - Architecture;
  - Admin Console.
- Documentation d architecture initiale ajoutee.
- Verification TypeScript OK avec `tsc -p tsconfig.json --noEmit`.
- Build Ionic bloque par la dependance historique `node-sass@4.7.2` sous Node 22.
- Correction en cours: installer sans scripts natifs et remplacer `node-sass`
  par un shim local vers Dart Sass.

## Agenda technique priorise

### 1. Stabiliser la chaine de build

- Remplacer ou contourner `node-sass`.
- Relancer `npm install`, `npm run build` et `npm run lint`.
- Documenter le runtime Node supporte si une migration complete est necessaire.

### 2. Consolider le prototype SaaS

- Ajouter une navigation plus produit si le socle Ionic est conserve.
- Rendre la console admin interactive pour activer/desactiver les modules.
- Ajouter une vue detail mission: objectifs, agents, decisions, artefacts.

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
| Socle frontend | Continuer Ionic temporairement ou migrer Next.js | Ionic 3 ralentit le delivery SaaS moderne |
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

## Journal de debug

### Build Ionic

- Symptome: `npm run build` echoue avant compilation applicative.
- Cause: `node-sass@4.7.2` ne supporte pas Node 22.
- Verification contournee: `tsc -p tsconfig.json --noEmit` passe.
- Tentative 1: `overrides` npm vers Dart Sass. Resultat: le lockfile v1 a
  encore resolu `node-sass@4.7.2`.
- Tentative 2 en cours: `.npmrc` avec `ignore-scripts=true`, dependance
  `sass`, puis script `patch-node-sass` avant build/lint.
- Observation: eviter `npm run` imbrique dans les scripts, car la dependance
  historique `npm@5.8.0` du projet prend le dessus et ne supporte pas Node 22.
- Observation: Dart Sass parse plus strictement les chaines multi-lignes de
  `ionic.functions.scss`; le script de patch normalise ces messages d erreur.
