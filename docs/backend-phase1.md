# Backend phase 1 - socle multi-tenant securise

## Objectif atteint

La phase 1 de mise en production est implantee dans `server/`:
authentification, isolation multi-tenant, enforcement serveur des plans et
audit persistant. C est la reponse directe aux manques critiques 1-3 de la
revue securite (auth absente, isolation inexistante, gating cote client).

## Architecture

- **Runtime**: Node.js pur, zero dependance externe.
- **Base de donnees**: SQLite via `node:sqlite` (natif Node 22). Le schema est
  concu pour migrer tel quel vers PostgreSQL + Row Level Security.
- **Contrat**: le backend charge `src/data/prototype-data.json` comme source
  de verite produit (plans, modules, packs, integrations) et le filtre par
  tenant avant de le servir.

### Schema

| Table | Role |
| --- | --- |
| tenants | id, name, plan_id |
| users | id, tenant_id, email, password_hash (scrypt), role |
| sessions | token, user_id, tenant_id, expires_at (TTL 60 min) |
| tenant_modules | etat enabled + autonomy par tenant et module |
| audit_events | journal permanent par tenant (actor, action, created_at) |

## API

| Methode | Route | Regle |
| --- | --- | --- |
| POST | /api/auth/register | Cree tenant + owner + session; seed des modules du plan |
| POST | /api/auth/login | scrypt + timingSafeEqual; session Bearer |
| GET | /api/runtime | Contrat filtre par plan du tenant authentifie |
| PATCH | /api/tenant/modules/:id | 403 si module hors plan; roles owner/admin; audit |
| POST | /api/tenant/plan | Owner uniquement; desactive les modules hors nouveau plan |
| GET | /api/audit | Evenements du tenant uniquement (scoping tenant_id) |

Toutes les reponses portent des en-tetes de securite (nosniff, deny framing,
CSP). Le serveur ecoute sur 127.0.0.1 par defaut.

## Garanties verifiees par `npm run test:backend`

1. Inscription/login fonctionnels; email duplique refuse; mauvais mot de passe
   refuse; token forge refuse; acces anonyme refuse.
2. **Isolation tenant (anti-IDOR)**: l audit d un tenant ne contient jamais
   les evenements d un autre; aucun evenement orphelin en base.
3. **Enforcement plan cote serveur**: un tenant Starter recoit un 403 s il
   force l activation du module MCP (plan Scale), meme avec une requete
   forgee.
4. **Protection de la propriete intellectuelle**: les prompts des packs
   verrouilles ne sont jamais serialises dans la reponse (null cote serveur,
   pas de masquage cote client).
5. Changement de plan reserve au owner, avec resynchronisation des modules.
6. Chaque action sensible produit un evenement d audit persistant.

## Lancer le backend

```bash
npm run start        # API + UI sur http://127.0.0.1:4180
npm run test:backend # suite d isolation et d enforcement
```

## Ce qui reste pour la production managee

- Migrer SQLite vers PostgreSQL avec Row Level Security native.
- Remplacer les sessions maison par un IdP OIDC avec MFA (Clerk/Auth0).
- Ajouter rate limiting par tenant/IP (token bucket Redis).
- Brancher le frontend sur `/api/runtime` (aujourd hui le prototype statique
  reste autonome; le backend sert deja les memes fichiers).
- TLS + reverse proxy + WAF devant le serveur.
