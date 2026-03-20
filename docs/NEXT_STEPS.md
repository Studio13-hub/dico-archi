# Prochaines etapes (reprise)

Reference centrale:
- [PLAN_MAITRE_DICOARCHI.md](/Users/awat/workspace/projects/dico-archi/docs/PLAN_MAITRE_DICOARCHI.md)

## Priorite immediate - Reactiver Supabase

1. garder comme unique reference Supabase:
   - `iuvjmctrzgztelrsuquc`
   - nom actuel: `dico-archi-clean`
2. verifier juste apres controle:
   - `https://dico-archi.vercel.app/admin.html`
   - `https://dico-archi.vercel.app/admin.html?section=stats`
   - `https://dico-archi.vercel.app/compte.html`
   - `https://dico-archi.vercel.app/contribuer.html`
3. seulement ensuite reprendre les validations UX et staff

## Priorite immediate - Recette finale prod du lot 2026-03-19

1. verifier sur `https://dico-archi.vercel.app`:
   - `index.html`
   - `admin.html?section=corpus`
   - `term.html?slug=bois-lamelle-colle`
2. confirmer en priorite:
   - que `Ecouter / Traduire` est visible au-dessus de l’assistant
   - que le dock s’ouvre / se ferme proprement
   - que la traduction repond sur des selections courtes reelles
   - que le hamburger reste bien au premier plan
   - que `Bois lamellé-collé` est trouvable dans `Corpus`
   - que la fiche canonique peut etre importee puis enrichie
3. garder comme preuves techniques de sortie:
   - `npm run test:ui:public`
   - resultat: `27 passed`
   - prod alignee sur:
     - `d774d05`
     - `0e6eeb1`
     - `a915149`

## Priorite immediate - Validation staff du lot produit 2026-03-19

1. faire la recette manuelle sur la prod ou sur un vrai runtime Vercel authentifie:
   - `https://dico-archi.vercel.app/compte.html`
   - `https://dico-archi.vercel.app/contribuer.html`
   - `https://dico-archi.vercel.app/admin.html`
   - `https://dico-archi.vercel.app/admin.html?section=stats`
2. confirmer:
   - que `Contribuer` est plus lisible avec `Essentiel / Medias / Approfondir`
   - que `Mon compte` oriente vraiment mieux selon le role reel
   - que `Administration` aide a reprendre le travail sans chercher ou cliquer d’abord
3. garder comme preuves techniques de cette passe:
   - `npm run test:ui:public`
   - resultat: `25 passed`
   - runtime local E2E durable maintenant base sur `vercel dev`
4. point d’attention a conserver:
   - ne plus utiliser `python3 -m http.server` comme reference pour les routes `POST /api/...`
   - pour les checks integrationels locaux, repartir de `vercel dev`

## Priorite immediate - Structure durable

1. verrouiller l’architecture des pages pour eviter les doublons
2. garder partout les memes roles visibles:
   - `Public`
   - `Apprenti`
   - `Formateur`
   - `Administration`
3. separer clairement:
   - consultation
   - contribution
   - espace personnel
   - validation formateur
   - administration
4. conserver le corpus public canonique aligne entre machines, navigateurs et prod
5. reprendre ensuite les nouveaux besoins fonctionnels demandes par l’utilisateur

## Priorite 1 - Finalisation produit
1. une fois la recette staff confirmee:
   - commit propre du lot local
   - redeploiement prod
2. reprendre ensuite la densification du contenu:
   - categories fortes
   - fiches de reference
   - termes lies
3. garder la direction actuelle:
   - preuve avant discours
   - orientation avant densite
   - lisibilite avant effet

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
  - `compte.html`
  - `contribuer.html`
  - `admin.html`
  - `admin.html?section=stats`
- confirmer la perception staff et apprenti des nouveaux blocs de priorite
- ensuite:
  - commit / deploy du lot
  - puis reprise contenu / corpus

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
