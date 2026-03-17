# Plan maitre DicoArchi

Date de cadrage: 2026-03-15
Projet: `/Users/awat/workspace/projects/dico-archi`

## But

Transformer DicoArchi en produit de reference pour comprendre, apprendre, relire et publier du vocabulaire d’architecture, avec une experience plus desirable, plus claire et plus fiable.

## Ordre directeur retenu

1. Esthetique
2. Fonctionnement
3. Roles
4. Pages
5. Contenus
6. Acces / attribution

## Methode de travail - 2 prochains jours

- travailler surtout sur un seul grand chantier a la fois
- priorite absolue immediate:
  - esthetique des pages publiques principales
- pour chaque lot:
  1. decrire clairement l’intention
  2. patcher un perimetre limite
  3. lancer serveur local
  4. verifier en navigateur avec Playwright
  5. faire un retour avant validation manuelle
- signaler explicitement a chaque fois:
  - ce qui est bien
  - ce qui est utile
  - ce qui est risque
  - ce qu’il vaut mieux eviter
- ne pas melanger dans un meme lot:
  - refonte visuelle
  - logique profonde des roles
  - gros nettoyage contenu
  - changements d’acces

## Autonomie encadree

- principe retenu:
  - autonomie de travail oui
  - toujours sous ton cadre, ta surveillance et ta confirmation pour les points sensibles
- je peux avancer seul sur:
  - lots esthetiques limites
  - nettoyages UI
  - harmonisation CSS / composants
  - tests navigateur / captures visuelles
  - documentation projet
  - corrections locales a faible risque
- je dois te confirmer avant:
  - changements de roles / permissions
  - logique d’acces / attribution
  - modifications Supabase sensibles
  - changements structurels forts du produit
  - installation d’outils nouveaux si ce n’est pas deja cadre
- pendant un slot autonome de 30 minutes:
  - je prends un lot ferme
  - j’evite les paris techniques fragiles
  - je teste avant de conclure
  - je te rends un retour clair a ton retour
- format de retour attendu:
  - fait
  - bien
  - risque
  - reste a faire
  - recommandation suivante

## Planning operationnel - 2 jours

### Ce soir
- objectif:
  - consolider le lot esthetique public deja lance
- focus:
  - `dictionnaire.html`
  - coherence visuelle entre `index`, `category`, `term`, `dictionnaire`
- livrable:
  - socle visuel public coherent
- risque:
  - faible

### Demain matin
- objectif:
  - finir le chantier esthetique public principal
- focus:
  - reprise plus forte du dictionnaire
  - verification desktop + mobile
- livrable:
  - pages publiques principales visuellement solides
- risque:
  - faible a moyen si on change trop la structure en meme temps

### Demain midi
- objectif:
  - slot autonome possible de 30 minutes
- bon lot autonome:
  - nettoyage CSS
  - finitions UI
  - corrections apres captures
  - docs de session
- a eviter:
  - logique roles
  - acces
  - base Supabase sensible

### Demain apres-midi
- objectif:
  - passer du visuel au fonctionnement
- focus:
  - navigation
  - recherche
  - categories
  - fiche terme
  - verification que la refonte n’a rien casse
- livrable:
  - parcours public propres visuellement et fonctionnellement
- risque:
  - moyen

### Demain soir
- objectif:
  - ouvrir le chantier suivant sans se disperser
- choix:
  - si le public est stable: `compte.html` et `contribuer.html`
  - sinon: finir d’abord le fonctionnement
- livrable:
  - soit pages secondaires alignees
  - soit fonctionnement consolide

### Apres-demain matin
- objectif:
  - clarifier les roles et la visibilite des actions
- focus:
  - `Contributeur`
  - `Relecture`
  - `Administration`
- livrable:
  - modele de lecture des roles propre et explicite
- risque:
  - moyen a eleve

### Apres-demain midi
- objectif:
  - second slot autonome possible de 30 minutes
- bon lot autonome:
  - verification
  - correction de bord
  - docs
  - tests

### Apres-demain apres-midi
- objectif:
  - avancer sur contenus ou acces / attribution selon maturite du projet
- ordre recommande:
  - contenus d’abord si les roles restent a clarifier
  - acces / attribution seulement si le modele est net
- risque:
  - eleve si on touche aux permissions trop tot

### Apres-demain soir
- objectif:
  - consolidation et bilan
- focus:
  - ce qui est stabilise
  - ce qui reste risque
  - prochain bloc

## Deja fait

### Produit / socle
- site public multi-pages en place
- corpus V2 deja branche
- auth, compte, contribution et admin fonctionnels
- upload media temporaire et apercus admin en place
- suivi serveur des pages et jeux en place
- feedback assistant visible dans l’admin

### Roles
- roles visibles simplifies:
  - `Contributeur`
  - `Relecture`
  - `Administration`
- logique de roles et permissions deja assainie cote base et front

### Qualite / verification
- smoke tests navigateur et captures visuelles Playwright mis en place
- workflow de verification reutilisable pour les prochaines ameliorations UI

## A faire maintenant

### Chantier 1 - Esthetique
- fixer une direction visuelle forte et stable
- renforcer:
  - `index.html`
  - `dictionnaire.html`
  - `category.html`
  - `term.html`
- garder 2 references d’intention:
  - entree plus visuelle / spatiale par univers ou batiments
  - lecture editoriale plus nette type dictionnaire de reference

### Chantier 2 - Fonctionnement
- revalider apres chaque refonte visuelle:
  - navigation
  - recherche
  - filtres
  - contribution
  - admin
  - suivi
  - feedback assistant

## Ensuite

### Chantier 3 - Roles
- clarifier ce que chaque role voit et peut faire
- verifier:
  - affichage conditionnel
  - permissions reelles
  - promotion / retrogradation
  - activation / desactivation

### Chantier 4 - Pages
- donner une utilite et une personnalite nette a chaque page
- priorites:
  - accueil
  - dictionnaire
  - categorie
  - fiche terme
  - compte
  - contribuer
  - admin

### Chantier 5 - Contenus
- augmenter la valeur editoriale reelle du site
- priorites:
  - categories coherentes
  - fiches riches
  - medias convaincants
  - exemples concrets
  - liens entre termes

### Chantier 6 - Acces / attribution
- finaliser le cycle complet:
  - creation de compte
  - role par defaut
  - attribution des droits
  - relecture / publication
  - lisibilite des statuts

## Plus tard

- enrichir davantage les jeux si cela sert vraiment l’apprentissage
- ajouter des parcours thematiques plus ambitieux
- envisager une experience 3D ou pseudo-3D seulement si elle reste utile, legere et maintenable
- ouvrir davantage de tableaux de bord si les usages le justifient

## A ne pas oublier

- accessibilite
- mobile
- performances
- SEO
- securite Supabase / RLS / API
- qualite editoriale
- coherence des categories et relations
- verification sur navigateur avant validation
- observabilite et suivi post-deploiement

## A eviter

- melanger refonte esthetique, logique des roles et gros changements de contenu dans le meme lot
- ajouter de la complexite visuelle sans clarifier la lecture
- lancer une vraie 3D lourde trop tot
- multiplier les pages ou modules sans utilite nette
- faire passer l’effet visuel avant la comprehension du dictionnaire

## Definition de succes

DicoArchi est considere sur la bonne trajectoire si:

- l’accueil donne envie d’entrer
- le dictionnaire ressemble a un vrai outil de reference
- les categories servent de parcours utiles
- les fiches sont lisibles, reliees et fiables
- les roles sont comprehensibles
- la contribution est simple
- l’admin reste claire
- chaque amelioration est verifiee en navigateur avant validation
