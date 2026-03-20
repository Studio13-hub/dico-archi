# Prochaines etapes (reprise)

Reference centrale:
- [PLAN_MAITRE_DICOARCHI.md](/Users/awat/workspace/projects/dico-archi/docs/PLAN_MAITRE_DICOARCHI.md)

## Priorite immediate - Apres clarification des surfaces de travail

1. garder comme base de sortie:
   - `main` = `origin/main`
   - worktree propre
   - suite publique de reference:
     - `npm run test:ui:public`
     - resultat de sortie:
       - `31 passed`
2. prochain chantier principal:
   - simplifier plus profondement `admin.js`
   - rendre chaque panneau encore plus strict dans sa responsabilite
3. ordre recommande:
   - `Vue d’ensemble`:
     - tri / reprise
   - `Corpus`:
     - correction / publication
   - `Suivi`:
     - lecture des signaux
   - `Comptes`:
     - administration pure
4. garder ensuite comme chantier editorial:
   - enrichir les medias publics des fiches prioritaires
   - commencer par `Bois lamellé-collé`
5. ne pas rouvrir le workflow prod sans besoin precis:
   - le cycle complet est deja referme
   - le script de recette est deja valide

## Priorite immediate - Apres fermeture reelle du workflow prod

1. garder [scripts/e2e_prod_editorial_workflow.js](/Users/awat/workspace/projects/dico-archi/scripts/e2e_prod_editorial_workflow.js) comme recette de reference
2. ne plus considerer le cycle `rejected -> message -> correction -> resubmitted` comme dette ouverte:
   - il est maintenant valide en prod
3. si une nouvelle verification est utile:
   - rejouer le script avec les comptes dedies
   - utiliser `DICO_E2E_HEADLESS=false` seulement en cas de debug visuel
4. reprendre maintenant les vrais chantiers produit:
   - simplification admin
   - clarification finale des roles visibles
   - attractivite produit / simplification visuelle globale

## Priorite immediate - Fermer la recette workflow reelle

1. reprendre [scripts/e2e_prod_editorial_workflow.js](/Users/awat/workspace/projects/dico-archi/scripts/e2e_prod_editorial_workflow.js)
2. ajouter des logs d’etapes explicites:
   - login apprenti
   - depot contribution
   - login formateur
   - ouverture admin
   - refus + message
   - login apprenti 2
   - correction + resoumission
   - verification finale formateur
3. relancer la recette prod complete avec les comptes dedies:
   - `dico.apprenti.workflow.20260319@proton.me`
   - `dico.formateur.workflow.20260319@proton.me`
4. committer ce script seulement quand le cycle complet ressort soit:
   - vert
   - soit bloque sur un vrai point produit documente

## Priorite immediate - Base propre confirmee

1. garder comme references uniques:
   - Vercel: `dico-archi`
   - Supabase: `iuvjmctrzgztelrsuquc` (`dico-archi-clean`)
2. ne plus recreer de projet parallele tant qu’un besoin technique clair ne l’impose pas
3. reprendre maintenant seulement les chantiers produit

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

## Priorite immediate - Produit

1. reprendre la simplification admin
2. clarifier encore les roles visibles:
   - `Public`
   - `Apprenti`
   - `Formateur`
   - `Administration`
3. reprendre ensuite l’attractivite produit et la simplification visuelle globale

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

- ne pas reouvrir le chantier workflow sans raison concrete:
  - la recette complete est maintenant refermee en prod
- inutile de refaire un nettoyage infra immediat
- garder comme reference de verification:
  - `https://dico-archi.vercel.app/admin.html`
  - `https://dico-archi.vercel.app/admin.html?section=stats`
  - `https://dico-archi.vercel.app/compte.html`
  - `https://dico-archi.vercel.app/contribuer.html`
- reprendre maintenant:
  - simplification plus profonde d’admin
  - separation stricte des panneaux staff
  - enrichissement medias / contenu des fiches prioritaires
- garder ensuite comme sidecar:
  - contenu editorial des fiches les plus vues
  - eventuelle recette staff plus large

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
