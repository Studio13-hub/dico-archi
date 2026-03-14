# Prochaines etapes (reprise)

## Priorite 1 - Base de contenu canonique
1. Maintenir `content/` comme source unique des categories, termes, relations et medias.
2. Utiliser `scripts/content/build_core_sql.js` pour generer le SQL core a partir de `content/`.
3. Remplacer progressivement les donnees de test distantes par un vrai corpus editorial.

## Priorite 2 - Pipeline core
4. Completer les migrations encore vides liees au passage legacy -> core.
5. Generer des seeds core depuis `content/`.
6. Utiliser `scripts/content/reset_editorial_content.sql` avant une vraie reinjection complete.
7. Sortir definitivement le legacy de tous les flux d'import.

## Priorite 3 - Fiabilite long terme
8. Ajouter des tests smoke automatises pour les routes critiques.
9. Continuer l'assainissement des messages UI et de la documentation active.
10. Finaliser ensuite la rotation des secrets et la verification Vercel quand ce chantier sera clos.

## Priorite 4 - Produit et engagement
11. Finir la V1.1 publique : medias reels, categories non vides, home plus demonstrative.
12. Densifier la V1.2 editoriale : fiches plus riches, sous-categories plus visibles, nouvelles familles.
13. Sortir une vraie V1.3 `quiz.html` basee sur le corpus publie.
14. Ajouter ensuite deux jeux educatifs :
    - Memory Architecture
    - Speed Run
