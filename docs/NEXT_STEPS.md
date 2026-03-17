# Prochaines etapes (reprise)

Reference centrale:
- [PLAN_MAITRE_DICOARCHI.md](/Users/awat/workspace/projects/dico-archi/docs/PLAN_MAITRE_DICOARCHI.md)

## Priorite 1 - Esthetique
1. Reprendre `index.html` en priorite jusqu’a validation nette de l’accueil `Dico-Archi`.
2. Ajuster finement:
   - rythme vertical
   - poids de `Fiche du jour`
   - place de l’assistant
   - footer
3. Une fois l’accueil valide, reprendre `dictionnaire.html` puis `category.html` et `term.html`.
4. Garder une direction sobre: lisibilite avant effet.

## Priorite 2 - Fonctionnement
5. Revalider les parcours critiques apres la refonte visuelle.
6. Inclure explicitement les jeux dans la verification fonctionnelle:
   - `games.html`
   - `quiz.html`
   - `flashcards.html`
   - `match.html`
   - `daily.html`
   - `memory.html`
7. Verifier aussi que le mock local `/api/quiz` reste coherent avec le comportement attendu des pages de jeux.
8. Ameliorer l’assistant Gemini comme chantier produit:
   - qualite des definitions
   - orientation vers les fiches
   - meilleur traitement du hors-sujet
   - meilleure gestion des ambiguïtés restantes
   - ton plus naturel encore dans les reponses deterministes
   - exploitation des feedbacks negatifs admin
9. Stabiliser recherche, filtres, navigation et suivi.
10. Corriger les frictions qui apparaissent apres les changements UI.
11. Garder les tests Playwright comme verification systematique.

## Priorite 3 - Roles
12. Clarifier les permissions visibles et reelles pour `Contributeur`, `Relecture`, `Administration`.
13. Cacher ou montrer les bonnes commandes selon le role.
14. Verifier les cas de promotion, retrogradation, activation et desactivation.

## Priorite 4 - Pages
15. Repenser l’ordre et l’utilite des pages principales.
16. Donner une vraie personnalite a `index.html`, `dictionnaire.html`, `category.html`, `term.html`.
17. Aligner `auth.html`, `compte.html`, `contribuer.html`, `admin.html` et `methodologie.html` avec la nouvelle direction produit.

## Priorite 5 - Contenus
18. Enrichir les categories et les fiches prioritaires.
19. Ajouter des medias plus convaincants et des exemples plus concrets.
20. Renforcer les liens entre termes et les parcours de lecture.
21. Utiliser `npm run content:stats` et `npm run content:audit` pour prioriser les lots.

## Priorite 6 - Acces / attribution
22. Finaliser la logique d’acces par role.
23. Verifier l’attribution des droits et la lisibilite des statuts utilisateur.
24. Stabiliser le parcours complet compte -> role -> contribution -> relecture -> publication.

## Point de reprise recommande

- ouvrir `https://dico-archi.vercel.app`
- verifier d’abord:
  - accueil
  - `Mon compte`
  - `Admin`
  - jeux:
    - `games.html`
    - `quiz.html`
    - `flashcards.html`
    - `match.html`
    - `daily.html`
    - `memory.html`
- le socle `site_visitors` est maintenant en place
- reprendre ensuite:
  - l’amelioration produit de l’assistant Gemini
  - puis les derniers chantiers visuels et de contenu
