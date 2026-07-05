# Revue critique externe et mitigations

Cette revue a ete produite par un reseau de deux agents critiques independants
(un angle produit/UX, un angle securite/pentest) executes sur le depot, puis
consolidee ici avec les mitigations retenues.

## Verdict global

Le prototype repond a la question "a quoi ressemble le produit" mais pas encore
a "pourquoi payer 449 EUR/mois". Les trois piliers differenciants — execution
controlee, mesure du ROI, gouvernance des couts — sont documentes mais doivent
devenir operationnels. Cote securite, aucun controle n est encore applique:
tout gating est cote client et il n y a ni auth ni isolation tenant.

## Manques critiques (produit)

| # | Manque | Severite | Mitigation | Statut |
| --- | --- | --- | --- | --- |
| 1 | Aucune execution agentique reelle | Critique | Orchestrateur minimal qui produit brief + plan depuis l intake | Backlog MVP |
| 2 | Credits IA affiches mais jamais consommes | Critique | Ledger ai_usage_events + jauge de consommation | Jauge credits ajoutee au prototype; ledger backend au MVP |
| 3 | Decisions humaines en lecture seule | Critique | Actions approve/reject avec etats et audit | Backlog MVP |
| 4 | Integrations vitrines sans connexion | Critique | Demarrer avec Drive + Brevo + GA4 reels | Backlog MVP |
| 5 | Pas d outils operationnels executables | Critique | Catalogue d outils gouvernes pilotes par la team IA | Catalogue ajoute (canon mail, social, analytics, credits, landing, enquetes) |
| 6 | Intake sans issue apres readiness 100% | Majeur | CTA "Lancer la mission" reliant intake -> mission -> taches | Backlog MVP |
| 7 | Artefacts sans contenu ouvrable | Majeur | Vue detail artefact avec versions | Backlog |
| 8 | Ecart doc (8 modules) vs prototype (4) | Majeur | Aligner le perimetre V1 | Backlog |
| 9 | Pas de controle d autonomie par module | Majeur | Matrice module x autonomie ajustable | Ajoute au prototype |
| 10 | Data Hub = recherche mots-cles seulement | Majeur | Vector store + evenements consultables | Backlog MVP |
| 11 | Aucun KPI business (leads, CPL, ROI) | Majeur | Dashboard mission lie aux target_metric | Backlog MVP |
| 12 | Pas de checkout ni enforcement de plan | Majeur | Stripe + quotas cote backend | Backlog MVP |

## Manques critiques (securite)

| # | Manque | Severite | Mitigation | Statut |
| --- | --- | --- | --- | --- |
| 1 | Isolation multi-tenant inexistante | Critique | RLS PostgreSQL + tests IDOR | Controle trace dans le registre securite |
| 2 | Auth/session absents | Critique | OIDC + MFA + RBAC cote API | Controle trace |
| 3 | Gating plans/modules cote client | Critique | Validation serveur a chaque appel | Controle trace; enforcement au MVP backend |
| 4 | Injection de prompt non adressee | Critique | Separation instructions/contenu, sanitisation, agent red team | Agent red team ajoute au reseau QA |
| 5 | Exfiltration via agents/MCP | Critique | Moindre privilege, allowlist destinations, DLP | Controle trace |
| 6 | Abus connecteurs sortants (spam/phishing) | Majeur | Quotas par canal, listes de suppression, suspension auto | Gouvernance ecrite sur chaque outil |
| 7 | Secrets/tokens OAuth non specifies | Majeur | Coffre KMS, rotation, scopes minimaux | Controle trace |
| 8 | XSS: innerHTML sans echappement systematique | Majeur | escapeHtml partout + CSP | Corrige dans le prototype |
| 9 | Serveur statique non durci | Majeur | Bind 127.0.0.1 en dev, headers securite, TLS/WAF en prod | Documente; a faire au deploiement |
| 10 | Prompts proprietaires exposes dans le JSON | Majeur | Prompts complets cote serveur uniquement | Regle documentee; extraits seuls exposes |
| 11 | Audit permanent absent | Majeur | Journal append-only + SIEM + alertes | Controle "Audit permanent" au registre |
| 12 | Rate limiting/quotas non appliques | Majeur | Token bucket par tenant + coupure credits | Jauge + alerte 80% dans le prototype; enforcement backend |
| 13 | Supply chain MCP custom | Majeur | Allowlist connecteurs certifies + sandbox | Controle trace |
| 14 | RGPD incomplet | Majeur | DPIA, DPA sous-traitants, effacement par tenant | Controle trace |

## Ce qui a ete ajoute au produit suite a la revue

1. **Outils pilotes par la team IA** (contrat + UI + gating par plan):
   canon a mail, acces reseaux sociaux, analytique de suivi, visualisation de la
   consommation de credits, createur de landing pages, enquetes/sondages.
   Chaque outil affiche sa regle de gouvernance.
2. **Autonomie ajustable par module**: le souscripteur regle Manuel / Assiste /
   Autonome pour chaque module actif; le nombre de validations affiche s adapte.
3. **Reseau d agents test & optimisation**: agent testeur, agent optimiseur,
   agent red team (anti prompt-injection), agent auditeur de couts.
4. **Registre de securite tenant**: 8 controles visibles (isolation, MFA,
   audit permanent, anti-injection, garde-fous sortants, coffre de secrets,
   rate limiting, RGPD) avec statut.
5. **Jauge de credits IA** liee au plan et au niveau d agent, avec alerte a 80%.
6. **Correction XSS**: echappement systematique des interpolations innerHTML.

## Priorites suivantes (ordre recommande)

1. Orchestrateur minimal reel: intake -> mission -> brief genere.
2. Actions approve/reject sur les decisions avec audit trail.
3. Backend d enforcement: auth OIDC, isolation tenant, quotas credits.
4. Premiers connecteurs reels: Google Drive, Brevo, GA4.
5. Stripe checkout + application des limites de plan.
6. Dashboard KPI mission (leads, CPL, ROI).
