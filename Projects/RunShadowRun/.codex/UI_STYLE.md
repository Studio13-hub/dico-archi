# UI STYLE — RunShadowRun (Cyber-néon / Glass)

## Direction
- Univers: night city runner, premium, lisible, nerveux.
- Style: cyber-néon subtil + verre dépoli (glass) propre.
- Priorité: lisibilité et hiérarchie typographique avant les effets.

## Palette
- Fond: bleu nuit/noir (`BG_TOP`, `BG_BOTTOM`)
- Texte principal: blanc cassé (`TEXT_PRIMARY`)
- Texte secondaire: bleu gris clair (`TEXT_SECONDARY`)
- Texte discret: gris bleuté (`TEXT_MUTED`)
- Accent principal: cyan néon (`ACCENT_CYAN`)
- Accent secondaire: magenta néon (`ACCENT_MAGENTA`)
- Danger/Game Over: rouge rosé (`ACCENT_DANGER`)

## Typographie
- Hero: taille large, gras fort (`SIZE_HERO`)
- Titres section: `SIZE_H2`, gras
- Sous-titres et corps: `SIZE_SUBTITLE`, `SIZE_BODY`
- Microcopy: `SIZE_MICRO`
- Règle: ombre légère autorisée, pas d’outline épais sur texte.

## Composants
- `ui_panel`: panel glass alpha + bordure 1-2 px + glow doux.
- `ui_text`: texte avec shadow/glow léger optionnel, alignements stricts.
- `ui_keybadge`: capsule touche clavier arrondie.
- `ui_button`: bouton cyber (primaire/secondaire), badges de touches.
- `ui_chip`: pill de stats (menu hero).
- `ui_statrow`: ligne label/valeur alignée (game over résumé).

## Layout
- Menu: 2 colonnes asymétriques, gauche ~60%, droite ~40%.
- Marges/padding généreux, grille stable, alignements nets.
- Pas de surcharge visuelle: effets localisés, contrastes maîtrisés.

## Animations
- Menu: fade-in + slide-in léger des colonnes (100-200 ms).
- Game Over: fade-in + micro-scale (1.02 -> 1.00).
- CTA menu: pulse discret (“Appuie sur ENTRÉE”).

## Microcopy FR
- FR 100% dans menus.
- Exemples validés:
  - "Pièces collectées"
  - "Obstacles évités"
  - "Dash : prêt" / "Dash : recharge 1.2 s"
  - "Son : ACTIVÉ (M)"

## Checklist QA UI
- [ ] Contraste texte/panels suffisant sur écran clair/sombre.
- [ ] Alignements colonnes/boutons/badges propres (pas d’effet “décalé”).
- [ ] Hiérarchie visuelle claire (titre > score > actions > microcopy).
- [ ] FR cohérent (accents, casse, pluriels).
- [ ] Aucune gêne gameplay: modifications limitées à l’affichage menu/game over.
