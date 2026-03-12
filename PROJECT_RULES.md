# PROJECT_RULES

## But

Ce document définit les règles de gouvernance et de travail du projet Dico-archi.

Il sert de référence pour toute session de travail, humaine ou assistée par Codex.

## Règle fondamentale

### RÈGLE B

Aucune modification effective du projet ne doit être exécutée sans validation explicite du responsable du projet.

Cela inclut notamment :
- déplacement de fichiers
- suppression
- renommage
- fusion
- refactor
- exécution SQL
- modification structurelle
- changement de rôles ou de policies
- nettoyage irréversible
- déploiement sensible si non demandé explicitement

Sans validation explicite, le travail autorisé se limite à :
- analyser
- proposer
- structurer
- préparer
- lister
- documenter
- planifier
- comparer

## Principes de gouvernance

- garder une structure simple, lisible et durable
- distinguer clairement l’actif, l’historique, le brouillon, la référence et l’archive
- éviter les doublons documentaires
- éviter les scripts SQL redondants ou mal identifiés
- toujours expliciter la source de vérité
- privilégier des changements progressifs et traçables

## Sources de vérité

- structure du projet : `TREE.md`
- règles du projet : `PROJECT_RULES.md`
- entrée générale : `README.md`
- documentation active et de référence : `docs/README.md`
- SQL et structure Supabase : `supabase/README.md`

## Règles documentaires

- `docs/current/` = état opérationnel actuel
- `docs/reference/` = documentation stable
- `docs/history/` = mémoire structurée du projet
- `docs/drafts/` = brouillons non stabilisés
- `docs/archive/` = éléments sortis du flux actif

## Règles Supabase

- chaque script SQL doit avoir un rôle clair
- l’ordre d’exécution doit être documenté
- le statut de chaque script doit être explicite
- aucun script ne doit être considéré comme actif uniquement par habitude

## Règles de continuité

Chaque session structurante doit idéalement mettre à jour :
- l’état actuel
- les prochaines étapes
- les décisions importantes si elles changent la structure du projet

Après un changement structurant validé, il faut mettre à jour au minimum :
- l’état actuel
- les prochaines étapes si elles changent
- l’historique ou les décisions si le changement modifie durablement le projet

## Règle de prudence

En cas de doute :
- ne rien exécuter
- documenter l’incertitude
- proposer un plan
- attendre validation
