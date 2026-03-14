# Prochaines etapes (reprise)

## Priorite 1 - Base de contenu canonique
1. Maintenir `content/` comme source unique des categories, termes, relations et medias.
2. Ajouter un script d'import core a partir de `content/`.
3. Remplacer progressivement les donnees de test distantes par un vrai corpus editorial.

## Priorite 2 - Pipeline core
4. Completer les migrations encore vides liees au passage legacy -> core.
5. Generer des seeds core depuis `content/`.
6. Sortir definitivement le legacy de tous les flux d'import.

## Priorite 3 - Fiabilite long terme
7. Ajouter des tests smoke automatises pour les routes critiques.
8. Continuer l'assainissement des messages UI et de la documentation active.
9. Finaliser ensuite la rotation des secrets et la verification Vercel quand ce chantier sera clos.
