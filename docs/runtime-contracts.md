# Contrats runtime du prototype

## Objectif

Le prototype charge ses donnees depuis `src/data/prototype-data.json`. Ce fichier
sert de premier contrat entre l interface, le futur backend et l orchestrateur
agentique.

Cette separation evite de coder les agents, modules et budgets directement dans
l interface. Le meme format pourra ensuite etre servi par une API multi-tenant.

## Sections du contrat

| Section | Role |
| --- | --- |
| version | Version du contrat de demo |
| mission | Titre, resume et taux de consommation budget simule |
| workflow | Etapes de mission affichees dans Mission Control |
| agents | Equipe agentique et cout unitaire par niveau de modele |
| modules | Services activables, budget mensuel et validations requises |
| dataHubItems | Capacites affichees dans la memoire partagee |
| decisions | File des decisions humaines a traiter |
| modelRouting | Politique de delegation vers les modeles |
| artifacts | Livrables produits par module |
| agenda | Suivi projet affiche dans le prototype |

## Contraintes validees

`npm run lint` verifie:

- presence du fichier JSON;
- syntaxe JavaScript des scripts et du prototype;
- ids uniques pour agents, modules, decisions et artefacts;
- references `artifact.moduleId` vers un module existant;
- budgets positifs;
- taux de consommation entre 0 et 1;
- absence de references package legacy dans `package.json`.

## Regles de compatibilite

- Ajouter une nouvelle section uniquement si elle peut etre ignoree par une
  ancienne interface.
- Ne pas renommer un champ existant sans migrer le validateur.
- Preferer des ids stables (`campaign`, `market`, `mcp`) aux noms affiches.
- Les montants restent numeriques dans le contrat et sont formates dans l UI.
- Les statuts affiches peuvent etre textuels dans le prototype, mais devront
  devenir des enums cote backend.

## Evolution vers une API

Le contrat pourra devenir:

```text
GET /api/tenants/:tenantId/missions/:missionId/runtime
```

Reponse:

```json
{
  "version": "2026-07-04.1",
  "mission": {},
  "workflow": [],
  "agents": [],
  "modules": [],
  "decisions": [],
  "artifacts": []
}
```

Les mutations recommandees:

```text
PATCH /api/tenants/:tenantId/modules/:moduleId
POST /api/tenants/:tenantId/decisions/:decisionId/approve
POST /api/tenants/:tenantId/decisions/:decisionId/reject
POST /api/tenants/:tenantId/ai-usage-events
```

Chaque mutation devra produire un `audit_event`.

## Risques a surveiller

- Divergence entre contrat UI et schema backend.
- Activation d un module sans verification des permissions.
- Cout IA simule dans l UI mais non borne cote backend.
- Decisions humaines representees comme texte libre au lieu d enums controlees.
- Absence de versioning lors des migrations du contrat.
