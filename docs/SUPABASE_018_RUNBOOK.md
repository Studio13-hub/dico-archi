# Runbook Supabase 018

Date: 2026-03-16
Projet: `/Users/awat/workspace/projects/dico-archi`
Migration cible: `supabase/migrations/018_site_visitors.sql`

## But

Aligner la base distante avec le code deja deploye sur Vercel pour le suivi des visiteurs uniques.

## Ce que la migration cree

- table `public.site_visitors`
- index `site_visitors_last_seen_at_idx`
- activation RLS sur `public.site_visitors`

## Pourquoi elle est importante

Le code prod utilise deja `site_visitors` dans:

- `api/track-page.js`
- `api/home-metrics.js`

Sans cette table:

- `track-page` continue d’inserer les `page_views`, mais ne peut pas enrichir `site_visitors`
- `home-metrics` retombe en mode degrade pour les visiteurs uniques

## Prerequis

1. Avoir un token CLI Supabase valide.
2. Etre dans le repo:

```bash
cd /Users/awat/workspace/projects/dico-archi
```

## Authentification

Si la CLI n’est pas connectee:

```bash
supabase login
```

Ou avec variable d’environnement:

```bash
export SUPABASE_ACCESS_TOKEN="..."
```

## Commande de migration

```bash
supabase db push
```

## Resultat attendu

- la migration `018_site_visitors.sql` est appliquee sans erreur
- aucune autre migration inattendue ne doit casser le flux

## Verifications immediates

### 1. Verifier que le site prod repond

```bash
curl -I https://dico-archi.vercel.app
```

Attendu:

- HTTP `200`

### 2. Verifier que l’accueil charge

```bash
curl -sS https://dico-archi.vercel.app | sed -n '1,30p'
```

Attendu:

- titre `Dico-Archi - Bienvenue`

### 3. Verifier qu’une visite peut etre suivie

Ouvrir en navigateur:

- `https://dico-archi.vercel.app`
- `https://dico-archi.vercel.app/dictionnaire.html`

Attendre quelques secondes entre les pages.

### 4. Verifier `home-metrics`

Ouvrir:

- `https://dico-archi.vercel.app`

Puis verifier dans l’UI que les blocs de stats d’accueil ne sont pas en erreur si ce composant est visible.

### 5. Verifier le suivi admin

Ouvrir:

- `https://dico-archi.vercel.app/admin.html`

Verifier dans `Suivi`:

- vues
- sessions
- top pages
- derniers scores

## Controle SQL conseille

Si tu veux verifier directement en SQL dans Supabase Studio:

```sql
select count(*) from public.site_visitors;

select visitor_id, first_seen_at, last_seen_at, first_page_path, last_page_path
from public.site_visitors
order by last_seen_at desc
limit 20;
```

## Signaux d’erreur a surveiller

- `supabase db push` refuse faute de token
- erreurs SQL sur `site_visitors`
- `home-metrics` en `502`
- `track-page` qui n’insere que `page_views` sans enrichir `site_visitors`

## Si tout est bon

Mettre a jour ensuite:

- `docs/RESUME_NOW.md`
- `docs/JOURNAL.md`
- `docs/HISTORIQUE.md`
- `/Users/awat/.codex/memories/DICO_ARCHI_MEMORY_2026-03-08.md`
