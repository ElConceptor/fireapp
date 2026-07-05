# Rapports consulting et interaction humain-agents

## Analyses et rapports de niveau cabinet de conseil

L equipe marketing IA doit produire des livrables dignes d un cabinet de
conseil, pas seulement des textes marketing. Chaque agent porte des skills
consulting explicites, et la plateforme expose une bibliotheque de rapports
structures par framework.

### Skills consulting par agent

| Agent | Skills |
| --- | --- |
| Orchestrateur | Structuration MECE, synthese executive, arbitrage budget, pyramide de Minto |
| Agent produit | Value proposition design, jobs-to-be-done, SWOT, benchmark fonctionnel |
| Agent marche | Market sizing TAM/SAM/SOM, 5 forces de Porter, analyse concurrentielle, segmentation ICP |
| Agent campagne | Copywriting AIDA, test A/B, plan media, funnel AARRR |

### Bibliotheque de rapports

| Rapport | Framework | Plan minimum |
| --- | --- | --- |
| Executive Summary | Pyramide de Minto | Starter |
| SWOT Strategique | SWOT croise TOWS | Starter |
| Market Sizing | TAM / SAM / SOM | Growth |
| Competitive Landscape | Porter + matrice 2x2 | Growth |
| Campaign Performance Review | Funnel AARRR + cohortes | Growth |
| GTM Business Case | Scenarios + ROI | Scale |

Regles de qualite pour chaque rapport:

- conclusion d abord (Minto), puis arguments et preuves;
- hypotheses sourcees et chiffrees;
- sections standardisees validees par l agent testeur du reseau QA;
- recommandations actionnables avec KPI de pilotage;
- exportable pour un comite de direction.

## Chat et vocal avec les agents

Des la souscription, les utilisateurs humains du tenant peuvent discuter avec
les agents:

- **Avatars**: chaque agent a une identite visuelle (avatar) reconnaissable
  dans les cartes d equipe et dans le chat.
- **Chat**: l utilisateur choisit un agent et pose sa question; le message est
  route vers l agent dont les skills correspondent le mieux (l orchestrateur
  reprend la main sinon).
- **Vocal**: une option de synthese vocale lit les reponses des agents
  (Web Speech API, sans dependance). La reconnaissance vocale (parler a
  l agent) est prevue en amelioration via la meme API.
- **Multi-utilisateurs**: plusieurs humains du tenant pourront rejoindre la
  conversation; chaque echange restera trace dans le Data Hub avec auteur,
  agent, cout IA et decisions declenchees.

## Implementation dans le prototype

- `agents[*]` porte desormais `avatar`, `skills`, `greeting`, `chatReply`.
- `reportTemplates` liste les rapports avec framework, sections et plan minimum.
- Section "Analyses & rapports consulting" avec gating par plan.
- Section "Chat agents": selecteur d agents a avatars, log de conversation,
  routage par skills et reponse vocale optionnelle.
- Recherche globale etendue aux rapports (`market sizing tam`, `swot strategie`).

## Vers la version production

1. Brancher le chat sur le vrai orchestrateur (streaming des reponses).
2. Reconnaissance vocale (speech-to-text) pour parler aux agents.
3. Generation reelle des rapports depuis le Data Hub avec export PDF/slides.
4. Presence multi-utilisateurs et mentions (@agent, @collegue).
5. Memoire de conversation par mission avec cout IA par echange.
