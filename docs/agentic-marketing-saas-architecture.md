# SaaS agentique marketing & sales

## Vision

Le produit est une plateforme SaaS qui remplace une partie du travail operationnel
marketing et commercial par une equipe d agents IA coordonnee. Le systeme ne doit
pas agir comme un chatbot isole, mais comme une equipe virtuelle qui travaille avec
des objectifs, des couts, des artefacts, des validations et un historique auditables.

La premiere mission de chaque equipe est de comprendre le produit ou service du
souscripteur. Les agents doivent interroger le client, demander les documents
manquants, analyser les informations recues et organiser les resultats dans un Data
Hub partage.

## Principes produit

- Le souscripteur reste dans la boucle pour toute decision sensible.
- Chaque mission a un objectif mesurable: revenu cible, pipeline, leads, campagne,
  lancement produit ou expansion marche.
- Les agents produisent des artefacts reutilisables: brief produit, personas, carte
  marche, campagnes, budget, plan d action, objections, scripts sales.
- Les couts IA sont suivis par tenant, mission, module, agent, modele et tache.
- Les modules sont activables depuis une console admin.
- Les integrations externes passent par une couche de permissions explicites.

## Modules SaaS

| Module | Role | Validation humaine |
| --- | --- | --- |
| Product Intelligence | Comprendre le produit, extraire la proposition de valeur, identifier les zones floues | Brief final |
| Market Research | Analyser marche, concurrents, tendances, segments et risques | Sources et hypotheses |
| Campaign Builder | Generer messages, canaux, calendrier, assets et budget | Publication et depense |
| Sales Playbook | Creer objections, scripts, sequences, qualification et next best action | Activation commerciale |
| Content Factory | Produire textes, landing pages, emails, posts et variantes | Diffusion externe |
| Budget Planner | Simuler budget media, cout IA, priorites et ROI attendu | Engagement budgetaire |
| MCP Integrations | Connecter CRM, drive, analytics, emailing, ads et outils internes | OAuth et permissions |
| Cost Governance | Fixer plafonds, alertes, routage modele et controles | Depassement de seuil |

## Architecture logique

```text
Utilisateur / Admin
        |
        v
Console SaaS et Mission Control
        |
        v
Orchestrateur principal
        |
        +--> Agent decouverte produit
        +--> Agent analyse marche
        +--> Agent campagne
        +--> Agent sales playbook
        +--> Agent budget
        +--> Agent documentation
        |
        v
Data Hub partage
        |
        +--> PostgreSQL: tenants, missions, taches, decisions, couts
        +--> Vector store: memoire semantique et recherche documentaire
        +--> Object storage: documents et assets
        +--> Audit log: actions, validations, permissions
        |
        v
MCP / Connecteurs controles
```

## Routage des modeles et optimisation des couts

L orchestrateur choisit le modele selon la criticite de la tache.

- Modele premium: strategie, arbitrage, raisonnement complexe, consolidation finale.
- Modele intermediaire: analyse de documents, recherche, synthese.
- Modele economique: extraction, classification, reformulation, generation de
  variantes, resume.
- Modele local ou open source: taches non sensibles, pretraitement, embeddings si le
  cout et la confidentialite le justifient.

Chaque appel modele doit generer un evenement de cout:

- tenant_id
- mission_id
- module
- agent
- task_id
- model
- input_tokens
- output_tokens
- estimated_cost
- decision_required

## Data Hub

Le Data Hub est l actif central du SaaS. Il stocke:

- documents source fournis par le souscripteur;
- questionnaires et reponses;
- briefs et syntheses;
- assets marketing;
- hypotheses et scores de confiance;
- decisions humaines;
- historique des taches agents;
- couts IA;
- permissions et connecteurs actifs.

Schema minimal recommande:

- tenants
- users
- modules
- missions
- agents
- tasks
- artifacts
- documents
- decisions
- ai_usage_events
- integrations
- audit_events

## Securite

Mesures prioritaires:

- isolation stricte multi-tenant;
- RBAC: owner, admin, operator, viewer, agent-service;
- chiffrement au repos des documents et artefacts;
- secrets hors code, injectes par environnement;
- journalisation immuable des actions sensibles;
- validation obligatoire avant publication, depense ou envoi externe;
- permissions MCP par connecteur, tenant et module;
- limites de cout par tenant, mission et module;
- retention configurable des donnees;
- redaction des donnees sensibles dans logs et traces;
- revue humaine des prompts systeme et politiques d outils.

## Choix techniques cout-efficaces

| Besoin | Option recommandee |
| --- | --- |
| Frontend SaaS final | Next.js, React, Tailwind, shadcn/ui |
| Prototype actuel | Web statique sans dependance, facile a remplacer |
| Base relationnelle | PostgreSQL |
| Recherche semantique | pgvector au depart, Qdrant si volume augmente |
| Stockage fichiers | S3 compatible, Cloudflare R2, MinIO pour dev |
| Jobs et files | Redis + BullMQ, ou workflow durable selon besoin |
| Agents | Vercel AI SDK, LangGraph ou orchestration maison TypeScript |
| Routage modeles | AI Gateway, OpenRouter ou couche interne abstraite |
| Observabilite | OpenTelemetry + Grafana |
| MCP | Serveurs MCP limites par permissions et audit |

## Feuille de route technique

1. Garder une base propre sans heritage technique inutile.
2. Consolider le prototype UI: mission, architecture, admin modules.
3. Definir le modele de donnees multi-tenant et les evenements de cout.
4. Implementer l upload documentaire et le Data Hub.
5. Ajouter un orchestrateur simple avec agents specialises declaratifs.
6. Ajouter validation humaine et audit trail.
7. Ajouter routage modele par cout et criticite.
8. Ajouter modules activables et permissions par module.
9. Ajouter connecteurs MCP prioritaires.
10. Mesurer les campagnes et boucler avec les objectifs business.

## MVP recommande

Le MVP doit se concentrer sur une mission complete:

> Comprendre le produit du client, demander les informations manquantes, organiser
> les documents, produire un plan marketing et sales avec budget, puis demander la
> validation du souscripteur.

Ce flux prouve la valeur du produit sans construire trop tot toutes les integrations.
