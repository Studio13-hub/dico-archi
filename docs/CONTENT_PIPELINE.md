# Pipeline contenu core

Ce document decrit la procedure propre pour remplacer les donnees editoriales de test par un vrai
corpus, sans toucher aux tables systeme.

## Source canonique

Le contenu editorial versionne vit dans :

- `content/v2/taxonomy/categories.json`
- `content/v2/taxonomy/subcategories.json`
- `content/v2/terms/*.json`
- `content/v2/relations/relations.json`
- `content/v2/media/media.json`
- `content/templates/`
- `content/candidates/`

Le dossier `content/v2/` est la source editoriale cible a long terme.

Les fichiers plats a la racine de `content/` restent la projection core compatible avec le site actuel.

Ne pas editer directement la base distante comme source principale.

## Commandes locales

Validation :

```bash
npm run content:validate
```

Controle linguistique :

```bash
npm run content:lint:fr
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

1. Mettre a jour les fichiers `content/v2/`
2. Valider localement :

```bash
npm run content:validate
npm run content:lint:fr
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
- terme riche V2 : `content/v2/templates/term.template.json`

Regle pratique :
- on duplique d'abord un gabarit
- on remplit ensuite le contenu
- on valide ensuite avec `npm run content:validate`
- on relit ensuite avec `npm run content:lint:fr`

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
- ne pas publier un lot important sans verification linguistique finale

## Exigence de langue

DicoArchi est destine a des non-francophones.

Le contenu final doit donc :

- respecter l'orthographe francaise correcte
- conserver les accents utiles
- garder une ponctuation propre
- rester clair et pedagogique

Voir aussi :
- `docs/EDITORIAL_RULES.md`

## Prochaine evolution recommandee

La V2 permet maintenant :

- une taxonomie `categories` / `subcategories`
- un fichier par terme
- des metadonnees riches, sans casser la projection core

Quand le corpus reel commencera a grossir davantage :

- ajouter un export SQL versionne dans un dossier `content/build/` ignore par Git
- ajouter ensuite un import direct via API ou via CLI seulement apres validation du pipeline
