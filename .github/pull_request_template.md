# Pull Request

## Contexte

<!-- Quel besoin produit ou quelle phase (voir AGENTS.md et docs/project-agenda.md) ? -->

## Changements

<!-- Liste concise des changements par domaine: contrat, UI, backend, docs, tests. -->

## Regles structurantes respectees

- [ ] Zero dependance runtime ajoutee (ou justifiee et documentee)
- [ ] Donnees produit dans `src/data/prototype-data.json`, pas en dur dans l UI
- [ ] Enforcement de plan/role/quota cote serveur (`server/api.js`)
- [ ] HTML echappe via `escapeHtml()`
- [ ] Prompts complets non exposes cote client
- [ ] Actions sensibles auditees (`recordAudit`)

## Verification

- [ ] `npm run lint`
- [ ] `npm run test:journeys`
- [ ] `npm run test:backend`
- [ ] `npm run build`
- [ ] Aucun terme legacy (ionic/cordova/firebase/angularfire/node-sass)

## Documentation

- [ ] `docs/project-agenda.md` et/ou `AGENTS.md` mis a jour si une regle
      structurante ou l etat d une phase a change.
