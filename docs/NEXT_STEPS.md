# Prochaines etapes (reprise)

Reference centrale:
- [PLAN_MAITRE_DICOARCHI.md](/Users/awat/workspace/projects/dico-archi/docs/PLAN_MAITRE_DICOARCHI.md)

## Priorite immediate - Verification live restante

1. le workflow editorial complet est maintenant valide en prod
2. garder comme preuve de recette:
   - terme `Workflow réel 2026-03-19-10-37`
   - submission id `b62302b5-6b9b-44dd-be2f-92e63f69937a`
3. prochain vrai chantier:
   - preparation de la presentation formateurs / apprentis
4. point d’attention a rappeler:
   - les uploads media ne se testent pas correctement via `python3 -m http.server`
   - pour les routes `POST /api/...`, utiliser la prod ou un vrai environnement Vercel

## Priorite immediate - Structure durable

0. verifier le nouveau workflow editorial maintenant actif:
   - `020_notifications_inbox.sql` appliquee
   - `021_submission_messages.sql` appliquee
   - `022_submission_resubmission_flow.sql` appliquee
   - prod redeployee
   - verifier le parcours complet:
     - refus
     - message editorial
     - reponse apprenti
     - correction dans `Contribuer`
     - statut `resubmitted`
     - reprise admin priorisee
1. verifier dans `admin.html` la proposition test riche:
   - `Terme test contribution image`
   - submission id `cba9eb0c-24cf-4cf6-b493-5c3e0491c507`
2. verrouiller l’architecture des pages pour eviter les doublons
3. garder partout les memes roles visibles:
   - `Public`
   - `Apprenti`
   - `Formateur`
   - `Administration`
4. separer clairement:
   - consultation
   - contribution
   - espace personnel
   - validation formateur
   - administration
5. traiter la securite et la clarte du workflow avant les grandes finitions visuelles
6. conserver le corpus public canonique aligne entre machines, navigateurs et prod
7. simplifier encore `contribuer.html` sans casser le flux unique:
   - moins de micro-textes
   - meilleure lisibilite de `Fiche complete`
   - aucune fenetre separee pour un seul terme

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
12. Clarifier les permissions visibles et reelles pour `Apprenti`, `Formateur`, `Administration`.
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

## Etat de reprise apres sync 2026-03-17

- `main` local = `origin/main` = prod Vercel sur le lot pousse le `2026-03-17`
- inutile de refaire un menage general immediat
- reprendre depuis une base propre avec cet ordre:
  1. verifier un parcours reel en prod:
     - accueil
     - dictionnaire
     - compte
     - admin
  2. reprendre la qualite des reponses assistant
  3. reprendre ensuite la direction visuelle des pages majeures encore perfectibles

## Point de reprise local actuel

- le lot `Bois lamellé-collé` sert maintenant de modele editorial et visuel
- le lot structurel `Mon compte / Contribuer / Administration` est engage
- la migration `019_rich_payload_terms_and_submissions.sql` est maintenant appliquee en base
- une proposition test reelle avec image a deja ete soumise pour validation du workflow
- priorite immediate:
  1. verifier le cycle complet `rejected -> message -> correction -> resubmitted`
  2. confirmer que la prod repond bien sur ce lot
  3. seulement apres cela, reprendre les chantiers visuels et de contenu restants
