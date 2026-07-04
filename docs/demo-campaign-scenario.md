# Scenario demo - compte client et campagne test

## Compte client fictif

Client: **Acme Sales Academy**

- Produit: programme de formation commerciale B2B assiste par IA.
- Cible: directions commerciales de PME SaaS en Europe.
- Objectif: generer 50 leads qualifies en 30 jours.
- Limites: budget media plafonne a 2 500 EUR et validation humaine obligatoire
  avant publication.
- Plan: Growth Pilot.

## Capacites SaaS utilisees

- Product Intelligence: comprendre l offre et construire le brief.
- Market Research: identifier segments, concurrents et objections.
- Campaign Builder: proposer messages, canaux, budget et calendrier.
- Cost Governance: suivre le cout IA et media.
- Human Approval Workflow: bloquer publication et depense tant que le client
  n a pas valide.

## Campagne test

Nom: **Sales Teams AI Readiness Sprint**

Objectif: creer un pipeline de leads qualifies pour l offre de formation
commerciale IA.

Audience:

- VP Sales;
- Head of Revenue;
- Sales Enablement Managers;
- SaaS B2B de 50 a 500 employes.

Canaux:

- LinkedIn Ads;
- email outbound;
- landing page;
- webinar partenaire.

Budget: **2 500 EUR** sur 30 jours.

Actions agents:

1. Analyser les documents produit.
2. Extraire la proposition de valeur.
3. Construire trois personas.
4. Generer variantes LinkedIn.
5. Creer une sequence email.
6. Proposer un budget par canal.
7. Demander validation avant publication.

Validations humaines:

- brief produit;
- budget media;
- contenu avant diffusion.

## Solutions connectables

| Categorie | Solutions | Usage |
| --- | --- | --- |
| CRM | HubSpot, Salesforce, Pipedrive | Contacts, deals, pipeline, statut leads |
| Documents | Google Drive, Notion, SharePoint | Briefs, offres, assets, knowledge base |
| Email | Brevo, Mailchimp, SendGrid | Campagnes, sequences, tracking |
| Ads | LinkedIn Ads, Google Ads, Meta Ads | Activation media apres validation budget |
| Analytics | GA4, PostHog, Segment | Conversions, funnels, attribution |
| Collaboration | Slack, Microsoft Teams | Notifications, validations, alertes cout |
| Billing | Stripe | Plans SaaS, abonnements, limites d usage |
| Automation | n8n, Make, Zapier | Workflows entre outils clients |
| Support | Intercom, Zendesk | Feedback client, signaux marche |
| Data | BigQuery, Snowflake, Postgres | Reporting, data hub, historique |
| MCP | Serveurs MCP custom | Outils internes et actions controlees |

## Regle de securite

Chaque integration doit etre activee par tenant, module et scope. Les actions
externes sensibles doivent produire une decision humaine et un `audit_event`.
