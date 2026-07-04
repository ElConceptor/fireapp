# Passe Journey, UI/UX et query

## Parcours verifies

### 1. Souscripteur: cadrer une mission

- Point d entree: section `Client intake`.
- Entrees: produit/service, client cible, objectif business, contraintes.
- Feedback: score de qualite du brief et liste des informations manquantes.
- Critere de succes: les champs requis sont remplis avant orchestration.

### 2. Admin tenant: activer les modules

- Point d entree: section `Admin Console`.
- Action: clic sur une carte module.
- Feedback: statut actif/inactif, budget IA, validations et artefacts recalcules.
- Critere de succes: aucun module sensible ne s active sans impact visible sur
  couts et validations.

### 3. Operateur marketing: traiter les decisions

- Point d entree: section `Decisions humaines`.
- Feedback: decision, owner, risque et statut.
- Critere de succes: les actions sensibles restent identifiables avant execution.

### 4. Recherche Data Hub

- Point d entree: section `Query Data Hub`.
- Exemples testes:
  - `budget campagne`
  - `CRM MCP`
  - `brief produit`
- Critere de succes: la recherche retourne les modules, decisions ou artefacts
  attendus depuis le contrat runtime.

### 5. Exploration des artefacts

- Point d entree: section `Artefacts`.
- Entree: filtre texte.
- Feedback: liste reduite ou message vide.
- Critere de succes: le souscripteur trouve rapidement un livrable par nom,
  type ou module.

## Ameliorations UI/UX effectuees

- Navigation ajoutee vers Intake et Query.
- Formulaire client visible avant le workflow agentique.
- Feedback immediat sur la readiness du brief.
- Recherche globale dans modules, agents, decisions et artefacts.
- Filtre dedie aux artefacts.
- Journey map affichant acteurs, etapes et metriques de succes.
- Etats focus visibles sur champs de saisie.
- Messages d erreur si le contrat runtime ne charge pas.

## Tests ajoutes

`npm run test:journeys` verifie:

- presence des cibles HTML critiques;
- journeys avec au moins trois etapes;
- placeholders des questions requises;
- exemples de recherche qui trouvent les objets attendus.

`npm run lint` verifie en plus:

- syntaxe JavaScript;
- structure du contrat JSON;
- ids uniques;
- references entre artefacts et modules;
- budgets et taux valides.

## Next steps features

1. Ajouter une action de validation/rejet sur chaque decision.
2. Ajouter un mode "mission detail" avec timeline des taches agents.
3. Ajouter une simulation de cout par modele et seuil d alerte.
4. Ajouter upload documentaire fictif puis vraie integration stockage.
5. Ajouter RBAC visuel: owner, admin, operator, viewer.
6. Ajouter journal d audit consultable.
7. Ajouter integration MCP mockee avant connecteurs reels.
8. Ajouter persistance locale ou backend minimal pour conserver les saisies.
9. Migrer vers Next.js quand le contrat runtime et le modele Data Hub sont stables.
