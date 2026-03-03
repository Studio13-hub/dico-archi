# JOURNAL — RunShadowRun

## 2026-03-03
### Fait
- Création du projet dans Studio13
- Mise en place de la mémoire locale (.codex) + TODO

### Décisions
- Mode B: Codex propose des PATCH, validation humaine

### Prochaine étape
- TECH DECISION: choisir la stack et lancer "Hello Run"

### Risques / blocages
- Stack non confirmée

## 2026-03-03
### Fait
- Relecture complète BRIEF/CONTEXT/TODO/DECISIONS/RULES/JOURNAL
- Priorités de session clarifiées

### Décisions
- Aucune nouvelle décision technique

### Prochaine étape
- Valider la TECH DECISION (stack)

### Risques / blocages
- Sans stack validée, l'implémentation MVP ne démarre pas

## 2026-03-03 (suite)
### Fait
- Décision stack V1: Python + Pygame
- Mise en place structure src/ + main placeholder

### Décisions
- MVP d'abord en 2D (3 voies) pour verrouiller le gameplay

### Prochaine étape
- Setup venv + installer pygame + première fenêtre 60 FPS

### Risques / blocages
- pygame non installé / python version

## 2026-03-03 (setup Python)
### Fait
- Relecture session + préparation du bootstrap Pygame 60 FPS
- venv créé + pygame installé (2.6.1)
- Bootstrap `src/main.py` en boucle 60 FPS implémenté et compilé

### Décisions
- Démarrer par une fenêtre Pygame minimale stable avant la logique runner

### Prochaine étape
- Implémenter les états de jeu: Menu / Run / GameOver

### Risques / blocages
- Aucun blocage setup identifié

## 2026-03-03 (états + player)
### Fait
- États actifs: Menu / Run / GameOver avec transitions clavier
- Player placeholder ajouté (3 voies + changement gauche/droite)
- Saut avec gravité implémenté

### Décisions
- Garder `G` comme déclencheur temporaire de GameOver (en attendant collisions)

### Prochaine étape
- Ajouter obstacles + collision pour GameOver réel

### Risques / blocages
- GameOver encore manuel (touche `G`)

## 2026-03-03 (obstacles + collision)
### Fait
- Spawn d'obstacles par voie avec défilement
- Collision player/obstacle -> GameOver automatique
- Suppression du déclencheur manuel `G`

### Décisions
- Garder un obstacle rectangle placeholder pour accélérer l'itération gameplay

### Prochaine étape
- Ajouter score + best score + restart direct

### Risques / blocages
- Fréquence/vitesse d'obstacles à équilibrer après tests

## 2026-03-03 (score + restart)
### Fait
- Score temps réel ajouté pendant le run
- Best score en mémoire de session affiché
- Restart direct depuis GameOver (`R`) sans repasser par le menu

### Décisions
- Score temporaire basé sur le temps de survie (collectibles viendront ensuite)

### Prochaine étape
- Ajouter pièces collectables qui incrémentent le score

### Risques / blocages
- Best score non persisté disque pour l'instant

## 2026-03-03 (coins)
### Fait
- Spawn de pièces par voie
- Collecte par collision player/pièce
- Bonus score à la collecte

### Décisions
- Valeur pièce initiale fixée à +25 points

### Prochaine étape
- Ajouter montée progressive de vitesse

### Risques / blocages
- Densité de pièces à équilibrer avec les obstacles

## 2026-03-03 (progression vitesse + patterns)
### Fait
- Vitesse qui augmente progressivement pendant la partie
- Spawn obstacles dynamique selon la vitesse
- Patterns d'obstacles single/double voies

### Décisions
- Garder toujours 1 voie libre dans les patterns doubles pour rester lisible

### Prochaine étape
- Ajuster le balancing (spawn coins vs obstacles) après playtests

### Risques / blocages
- Difficulté peut monter trop vite sans tuning fin

## 2026-03-03 (best score persistant)
### Fait
- Chargement/sauvegarde du best score en local
- Affichage best score au menu

### Décisions
- Fichier de save minimal: `data/save.json`

### Prochaine étape
- Ajouter feedback visuel/sonore (collecte pièce, collision)

### Risques / blocages
- Fichier save ignoré en cas d'erreur I/O (fallback best score = 0)

## 2026-03-03 (feedback + UI + tuning)
### Fait
- Feedback visuel ajouté: flash collecte, flash impact, popup `+score`
- Feedback sonore ajouté: beep collecte + beep impact
- UI menu/gameover polie (panels + lisibilité)
- Tuning difficulté ajusté (courbe vitesse/spawn/coins)

### Décisions
- Sons synthétiques générés en code (pas d'assets audio externes)

### Prochaine étape
- Playtests et réglage fin des paramètres difficulté

### Risques / blocages
- Le mixer audio peut être indisponible sur certaines machines (fallback silencieux)

## 2026-03-03 (pause + mute)
### Fait
- Pause en cours de run (`P`)
- Mute/unmute SFX (`M`) pendant la session

### Décisions
- Pause garde l'image du run figée avec overlay

### Prochaine étape
- Extraire les constantes de tuning dans un fichier dédié

### Risques / blocages
- Le mute agit sur la session courante uniquement (non persisté)

## 2026-03-03 (settings centralisés)
### Fait
- Extraction des constantes de gameplay/UI vers `src/settings.py`
- `main.py` simplifié avec import des paramètres

### Décisions
- Garder la logique dans `main.py` et réserver `settings.py` au tuning

### Prochaine étape
- Ajuster difficulté via `settings.py` sans toucher la logique

### Risques / blocages
- Aucun

## 2026-03-03 (dash + shield + debug)
### Fait
- Dash/glissade ajouté (DOWN/SHIFT) avec cooldown et hitbox réduite
- Power-up shield ajouté (spawn/collecte/invincibilité temporaire)
- Overlay debug F1 ajouté (runtime + paramètres clés)

### Décisions
- Obstacles "high/low" pour donner un vrai intérêt au dash

### Prochaine étape
- Playtest intensif et tuning fin (durée dash, fréquence shield, difficulté)

### Risques / blocages
- Équilibrage difficulté encore sensible aux paramètres

## 2026-03-03 (tuning + sprites placeholder + commit prep)
### Fait
- Tuning difficulté affiné dans `settings.py` (accel/spawn/coin/shield)
- Sprites/anim placeholders procéduraux ajoutés (`src/visuals.py`)
- Préparation commit clarifiée (scope gameplay+visuals)

### Décisions
- Garder les assets générés en code pour itérer vite sans pipeline art

### Prochaine étape
- Finaliser un commit propre du lot complet

### Risques / blocages
- Balancing à confirmer après 3-5 runs réels

## 2026-03-03 (UI finale menu/gameover)
### Fait
- Refonte visuelle du menu (panel, hints clavier, hiérarchie claire)
- Refonte visuelle du gameover (actions lisibles restart/quit)

### Décisions
- Garder une UI stylisée sans dépendre d’assets externes

### Prochaine étape
- Passer sur sprites/anim finals et polish audio

### Risques / blocages
- Ajustements mineurs possibles sur la lisibilité selon écran

## 2026-03-03 (theme chat noir + objets quotidiens)
### Fait
- Joueur visuel remplacé par un chat noir (Shadow13)
- Obstacles remplacés par objets du quotidien (carton, sac poubelle, plante, chaise)
- Menu et gameover enrichis avec détails thématiques

### Décisions
- Garder les assets procéduraux pour itérer rapidement sans pipeline externe

### Prochaine étape
- Ajuster tailles/hitboxes des nouveaux obstacles selon playtest

### Risques / blocages
- Certaines silhouettes d'obstacles peuvent nécessiter plus de contraste

## 2026-03-03 (upgrade visuel realiste)
### Fait
- Chat noir rendu plus détaillé (silhouette, oreilles, queue, yeux, moustaches)
- Obstacles quotidiens enrichis (textures/ombres/formes)
- Menus ouverture/gameover rendus plus riches et lisibles

### Décisions
- Rester en procédural pour garder un workflow rapide sans assets externes

### Prochaine étape
- Remplacer progressivement par assets artistiques finaux (sprites/sons)

### Risques / blocages
- Rendu encore stylisé (pas photo-réaliste) tant qu'on reste 100% procédural
