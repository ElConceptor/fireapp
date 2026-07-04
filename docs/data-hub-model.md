# Data Hub - modele de donnees initial

## Objectif

Le Data Hub est le registre partage entre le souscripteur, les agents et les
modules SaaS. Il doit conserver les sources, les artefacts, les decisions, les
couts IA et les permissions de maniere auditable par tenant.

## Principes

- Chaque ligne appartient a un `tenant_id`.
- Chaque artefact important est rattache a une `mission_id`.
- Toute action sensible produit un evenement d audit.
- Toute consommation IA produit un evenement de cout.
- Les agents ne lisent que les donnees autorisees par module et mission.

## Entites principales

| Entite | Role | Champs minimum |
| --- | --- | --- |
| tenants | Organisation souscriptrice | id, name, plan, ai_budget_limit, created_at |
| users | Utilisateurs humains | id, tenant_id, email, role, status |
| modules | Services activables | id, tenant_id, key, enabled, monthly_budget, approval_policy |
| missions | Objectifs business | id, tenant_id, title, objective, status, target_metric |
| agents | Agents disponibles | id, tenant_id, key, role, default_model_tier, max_budget |
| tasks | Travail agentique | id, mission_id, agent_id, module_id, status, priority |
| documents | Sources importees | id, mission_id, source_type, storage_uri, classification |
| artifacts | Livrables produits | id, mission_id, module_id, title, type, status, version |
| decisions | Validations humaines | id, mission_id, requested_by, owner_id, risk_level, status |
| ai_usage_events | Suivi cout modele | id, tenant_id, mission_id, task_id, model, tokens, estimated_cost |
| audit_events | Traces securite | id, tenant_id, actor_type, actor_id, action, resource_ref |
| integrations | Connecteurs externes | id, tenant_id, provider, scopes, status, last_sync_at |

## Evenement de cout IA

```json
{
  "tenant_id": "tenant_123",
  "mission_id": "mission_456",
  "task_id": "task_789",
  "module_key": "campaign_builder",
  "agent_key": "agent_campaign",
  "model": "economy-text",
  "model_tier": "economy",
  "input_tokens": 4200,
  "output_tokens": 900,
  "estimated_cost": 0.05,
  "currency": "EUR",
  "decision_required": false,
  "created_at": "2026-07-04T00:00:00Z"
}
```

## Decision humaine

Une decision est requise quand une action:

- engage un budget externe;
- publie un contenu;
- contacte des prospects;
- active une integration;
- modifie une permission;
- utilise un modele premium au-dessus d un seuil;
- exporte des donnees du tenant.

Statuts recommandes:

- `requested`
- `approved`
- `rejected`
- `expired`
- `cancelled`

## Cycle de vie d une mission

1. Creation de mission par le souscripteur.
2. Collecte documentaire et questionnaire.
3. Extraction et classement dans le Data Hub.
4. Creation des taches agents.
5. Production des artefacts.
6. Demande de decisions humaines.
7. Execution controlee.
8. Mesure des resultats.
9. Archivage ou iteration.

## Isolation et securite

- Indexer toutes les tables par `tenant_id`.
- Appliquer RBAC au niveau API, pas seulement dans l interface.
- Chiffrer les documents et secrets d integration.
- Ne jamais exposer les prompts systeme internes au souscripteur.
- Stocker les scopes MCP par integration et par module.
- Journaliser toute lecture ou export de document sensible.

## Prochaine implementation

Pour le MVP backend, commencer par:

1. `tenants`
2. `users`
3. `modules`
4. `missions`
5. `tasks`
6. `artifacts`
7. `decisions`
8. `ai_usage_events`

Les documents et integrations MCP peuvent venir ensuite, une fois les permissions
et la retention clarifiees.
