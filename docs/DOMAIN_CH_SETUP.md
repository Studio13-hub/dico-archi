# Domaine .ch - Setup pro

## Objectif
Attacher `dico-archi.ch` a Vercel avec HTTPS, canonical propre et SEO stable.

## Etapes
1. Acheter `dico-archi.ch` chez un registrar fiable.
2. Ajouter le domaine dans Vercel: `Project > Settings > Domains`.
3. Configurer les enregistrements DNS demandes par Vercel.
4. Ajouter aussi `www.dico-archi.ch` et rediriger vers le domaine principal.

## Verification
- HTTPS actif.
- `https://dico-archi.ch` charge sans warning.
- `https://www.dico-archi.ch` redirige vers `https://dico-archi.ch`.

## SEO
- Dans Search Console, ajouter la propriete de domaine.
- Soumettre `https://dico-archi.ch/sitemap.xml`.
- Demander indexation des pages principales (`/`, `category.html`, `term.html?...`).
