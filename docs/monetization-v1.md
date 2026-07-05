# Monetisation V1 - premiere version vendable

## Concept

La valeur du produit repose sur trois piliers:

1. **Les prompts sont la valeur.** Chaque prompt pack encode une expertise
   marketing/sales reutilisable. Le client n achete pas de l IA brute, il achete
   des playbooks operationnels executes par des agents.
2. **Le multi-modele reduit le cout et augmente la marge.** Chaque niveau
   d agent est adosse a un tier de modele different, du plus economique au plus
   premium.
3. **Les integrations demultiplient les possibilites.** Chaque connecteur ouvre
   un nouveau cas d usage et justifie l upgrade de plan.

## Plans tarifaires

| Plan | Prix/mois | Credits IA | Niveau agents max | Modules | Connecteurs |
| --- | --- | --- | --- | --- | --- |
| Starter | 149 EUR | 300 | Debutant | Product Intelligence | 3 essentiels |
| Growth | 449 EUR | 1 200 | Confirme | + Market Research, Campaign Builder | 8 marketing/CRM |
| Scale | 1 190 EUR | 4 000 | Expert | + MCP Integrations | Illimites + MCP custom |

Logique de progression:

- Starter prouve la valeur avec le brief produit et le premier pack de prompts.
- Growth debloque le moteur de génération de leads (marche + campagne).
- Scale debloque la strategie expert, les playbooks sales et le MCP custom.

## Niveaux d agents (multi-modele)

| Niveau | Tier modele | Multiplicateur cout | Usage |
| --- | --- | --- | --- |
| Debutant | Economique | x0,6 | Extraction, resume, variantes guidees |
| Confirme | Intermediaire | x1,0 | Analyse marche, campagnes completes |
| Expert | Premium | x1,8 | Strategie GTM, arbitrage budget, consolidation |

Regles:

- Le plan determine le niveau maximum accessible.
- L orchestrateur route chaque tache vers le niveau le moins cher capable de la
  reussir; le client peut forcer un niveau superieur si son plan le permet.
- Chaque execution genere un `ai_usage_event` avec le multiplicateur applique.

## Prompt library (la valeur)

| Pack | Module | Plan minimum | Prompts |
| --- | --- | --- | --- |
| Product Discovery | Product Intelligence | Starter | 12 |
| Market Research | Market Research | Growth | 15 |
| Campaign Launch | Campaign Builder | Growth | 18 |
| Sales Playbook | Campaign Builder | Scale | 20 |
| Expert GTM Strategy | Campaign Builder | Scale | 14 |

Protection de la valeur:

- Les prompts complets ne sont jamais exposes cote client; seul un extrait
  d exemple est visible.
- Les prompts vivent cote serveur avec versioning et tests de regression.
- Chaque pack a des variables standardisees ({persona}, {objection}, {budget})
  pour brancher automatiquement les donnees du Data Hub.

## Integrations comme multiplicateur

- Starter: Google Drive, Notion, Brevo, GA4, Slack (essentiels gratuits).
- Growth: + HubSpot, Pipedrive, Mailchimp, LinkedIn Ads, Google Ads, PostHog,
  Teams, Stripe.
- Scale: + Salesforce, n8n, MCP custom servers.

Chaque integration doit rester gouvernee: scopes limites, validation humaine
pour les actions sortantes et audit trail.

## Modele de revenus

- Abonnement mensuel par plan (revenu recurrent principal).
- Credits IA additionnels au-dela du quota (revenu d usage, marge sur le
  routage multi-modele).
- Add-ons futurs: packs de prompts verticaux (SaaS, e-commerce, services),
  connecteurs premium, siege supplementaire, white-label agence.

## Ameliorations proposees (au-dela de la V1)

1. Facturation Stripe reelle avec quotas de credits par tenant.
2. Marketplace de prompt packs avec versioning et notes de performance.
3. Mode agence: gerer plusieurs clients finaux sous un meme compte.
4. Scoring automatique de la qualite des livrables pour justifier l upgrade.
5. Rapport ROI mensuel envoye au decideur (leads, cout par lead, temps gagne).
6. Fine-tuning des prompts par secteur avec les retours de validation humaine.

## Livrable operationnel

La V1 est testable dans le prototype:

- selection de plan en direct (Starter/Growth/Scale);
- gating automatique des modules, prompt packs et connecteurs;
- selecteur de niveau d agents avec impact visible sur les couts;
- resume du plan (packs debloques, connecteurs, niveau max);
- verification automatisee via `npm run lint` et `npm run test:journeys`.
