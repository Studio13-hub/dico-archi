# Operations light

Repere minimal pour garder le projet propre quand le corpus grossit.

## Avant un lot important

- relire `docs/PLAN_MAITRE_DICOARCHI.md`
- verifier `git status --short`
- relire `docs/RESUME_NOW.md`

## Verifications contenu utiles

- validation structure:
  - `npm run content:validate`
- synthese rapide du corpus:
  - `npm run content:stats`
- audit de priorisation contenu:
  - `npm run content:audit`
- controle editorial FR:
  - `npm run content:lint:fr`
- checklist avant publication:
  - [EDITORIAL_PUBLISH_CHECKLIST.md](/Users/awat/workspace/projects/dico-archi/docs/EDITORIAL_PUBLISH_CHECKLIST.md)

## Verifications UI utiles

- serveur local:
  - `python3 -m http.server 4173`
- smoke tests navigateur:
  - `npm run test:ui`

## Hygiene recommandee

- ne pas melanger gros patch visuel, roles et acces dans le meme lot
- garder les sorties de test hors git
- mettre a jour `docs/JOURNAL.md` et `docs/RESUME_NOW.md` apres une session structurante
- utiliser les tests Playwright avant de considerer une page publique comme stable

## Signal faible a surveiller

- categories trop desequilibrees
- trop de termes sans exemple
- trop de brouillons
- relations cassees ou peu utiles
- medias insuffisants ou faibles
