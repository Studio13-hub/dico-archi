# Product Roadmap

## Vision

DicoArchi doit devenir un dictionnaire d'architecture pedagogique, clair,
serieux et engageant pour les non-francophones, les apprentis, les etudiants
et les jeunes professionnels.

Le produit final doit combiner :
- un dictionnaire solide et fiable
- une navigation par categories et sous-categories
- des fiches riches et faciles a comprendre
- des mecanismes ludiques utiles
- une administration editoriale propre

## V1.1 - Finition du socle public

Objectif : rendre le site public credibile, homogène et sans friction.

Priorites :
- remplacer les medias temporaires par de vrais schemas
- completer ou masquer les categories encore vides
- tester le workflow admin de bout en bout
- continuer la correction fine des textes visibles
- verifier mobile et desktop sur les pages principales

Livrables :
- home plus demonstrative
- fiches terme stables avec medias reels
- categories sans impasse visible
- admin testee en situation reelle

## V1.2 - Densification editoriale

Objectif : augmenter la valeur pedagogique du dictionnaire.

Priorites :
- enrichir les fiches avec plus de contexte
- densifier les familles Normes, Ouvertures, Construction
- ouvrir les familles Techniques du batiment, Facades, Escaliers
- rendre les sous-categories plus visibles
- faire apparaitre davantage les termes lies

Structure recommandee des fiches :
- definition courte
- explication simple
- exemple
- termes lies
- normes liees si pertinent
- illustration

## V1.3 - Quiz

Objectif : ajouter une mecanique ludique utile, coherent avec le dictionnaire.

Quiz cible :
- route dediee `quiz.html`
- questions basees sur le corpus publie
- modes simples et rejouables

Modes recommandes :
- terme -> bonne definition
- definition -> bon terme
- categorie -> bon terme
- image/schema -> bon terme

Contraintes :
- reutiliser uniquement le contenu canonique deja publie
- pas de gamification artificielle lourde au debut
- garder une experience tres simple sur mobile

Succes attendu :
- engagement plus fort
- memorisation reelle
- valeur pedagogique visible sans nuire au ton serieux du site

## V1.4 - Jeux educatifs

Objectif : attirer les jeunes sans casser la credibilite du projet.

Jeu 1 :
- Memory Architecture
- cartes terme / definition
- parties courtes
- progression rapide

Jeu 2 :
- Match Express
- associer en temps limite :
  - terme -> definition
  - terme -> categorie
  - terme -> image

Principes :
- parties rapides
- gameplay lisible
- aucune dependance forte a un compte utilisateur
- reutilisation maximale du corpus existant

## V2 - Plateforme pedagogique mature

Objectif : faire de DicoArchi une vraie base de reference et d'apprentissage.

Extensions possibles :
- niveaux de difficulte
- badges pedagogiques
- historique de progression
- parcours thematiques
- quiz filtres par categorie
- jeux filtres par sous-categorie
- fiches riches avec applications, normes et variantes

## Ordre recommande

1. finir V1.1
2. densifier V1.2
3. sortir un vrai V1.3 Quiz
4. ajouter les 2 jeux en V1.4
5. seulement ensuite ouvrir les fonctions V2

## Regles produit

- le dictionnaire reste la colonne vertebrale du produit
- le quiz et les jeux doivent toujours servir l'apprentissage
- aucune fonctionnalite ludique ne doit faire descendre la credibilite editoriale
- le contenu canonique doit rester la source unique de verite
