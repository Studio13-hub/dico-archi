# TODO — RunShadowRun (Python/Pygame)

## 0) Setup
- [x] Créer venv + installer pygame
- [x] Implémenter bootstrap pygame (fenêtre 60 FPS + fermeture propre)
- [x] Boucle de jeu + états: Menu / Run / GameOver

## 1) MVP Runner
- [x] Monde 3 voies (lane = -1,0,1) + déplacement avant simulé
- [x] Player (Shadow13 placeholder) + changement de voie
- [x] Saut (physique simple) + gravité
- [x] Obstacles spawn + défilement + collision -> GameOver
- [x] Pièces spawn + collecte -> score
- [x] UI score + best score + restart
- [x] Action dash/glissade (touche DOWN/SHIFT) + hitbox adaptée

## 2) Progression
- [x] Vitesse augmente avec le temps
- [x] Patterns d'obstacles variés
- [x] Power-up invincibilité (shield)

## 3) Habillage
- [x] Feedback visuel/sonore prototype (flash, popup, beep)
- [x] Sprites/anim placeholder procéduraux (sans assets externes)
- [x] Direction artistique chat noir + obstacles du quotidien
- [x] Upgrade rendu procédural (chat/objets plus détaillés)
- [x] Menu/gameover enrichis (narratif + détails de run)
- [x] Monde vivant (ciel nuit + skyline parallax + lune/étoiles)
- [x] Menus noir + logo tête de chat procédural
- [ ] Sprites/anim finals + SFX polish
- [x] UI finalisée (menu/gameover version art)

## 4) Quality
- [x] Persister le best score en local (fichier save)
- [x] Pause runtime + mute/unmute SFX
- [x] Centraliser les paramètres de tuning dans `src/settings.py`
- [x] Overlay debug runtime (F1)
- [x] Préparer plan de commit (fichiers + message)
