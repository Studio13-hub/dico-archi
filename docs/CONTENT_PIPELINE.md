# Pipeline contenu core

Ce document decrit la procedure propre pour remplacer les donnees editoriales de test par un vrai
corpus, sans toucher aux tables systeme.

## Source canonique

Le contenu editorial versionne vit dans :

- `content/categories.json`
- `content/terms.json`
- `content/relations.json`
- `content/media.json`
- `content/templates/`
- `content/candidates/`

Ne pas editer directement la base distante comme source principale.

## Commandes locales

Validation :

```bash
npm run content:validate
```

Generation SQL core :

```bash
npm run content:build-sql > /tmp/dico_archi_core_content.sql
```

Reset editorial uniquement :

```bash
cat scripts/content/reset_editorial_content.sql
```

## Procedure de bascule propre

1. Mettre a jour les fichiers `content/*.json`
2. Valider localement :

```bash
npm run content:validate
```

3. Generer le SQL d'import :

```bash
npm run content:build-sql > /tmp/dico_archi_core_content.sql
```

4. Verifier rapidement le SQL genere
5. Dans Supabase SQL Editor :
   - executer `scripts/content/reset_editorial_content.sql` si vous voulez repartir d'un contenu editorial vide
   - executer ensuite le SQL genere
6. Verifier le site :
   - home
   - dictionnaire
   - categorie
   - fiche terme

## Gabarits editoriaux

Pour ajouter du contenu sans ambiguite :

- terme : `content/templates/term.template.json`
- relation : `content/templates/relation.template.json`
- media : `content/templates/media.template.json`

Regle pratique :
- on duplique d'abord un gabarit
- on remplit ensuite le contenu
- on valide ensuite avec `npm run content:validate`

## Zone candidates

Les brouillons ou contenus extraits de fascicules doivent d'abord passer par `content/candidates/`.

But :
- qualifier les vraies nouvelles fiches
- identifier les doublons
- marquer les enrichissements de fiches existantes

Exemples actuellement structures :
- `content/candidates/bases-des-materiaux.json`
- `content/candidates/toitures-plates.json`

Tant qu'un contenu est dans `candidates/`, il ne fait pas partie du corpus canonique actif.

## Ce que le reset supprime

Le reset editorial ne touche que :

- `public.term_relations`
- `public.media`
- `public.terms`
- `public.categories`

Il ne touche pas :

- `public.profiles`
- `public.term_submissions`
- `public.audit_logs`
- `public.chatbot_feedback`

## Strategie recommandee

- utiliser `content/` comme source unique
- traiter la base distante comme une cible de projection
- garder les donnees de test tant que le corpus reel n'est pas pret
- ne lancer le reset editorial qu'au moment de la vraie bascule

## Prochaine evolution recommandee

Quand le corpus reel commencera a grossir :

- ajouter un export SQL versionne dans un dossier `content/build/` ignore par Git
- ajouter ensuite un import direct via API ou via CLI seulement apres validation du pipeline
