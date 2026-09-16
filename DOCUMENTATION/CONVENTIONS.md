# Conventions documentaires

## Organisation

- `10_concepts/` : vocabulaire, objets métier et relations durables.
- `20_guides/` : procédures exécutables par un développeur ou un exploitant.
- `30_decisions/` : décisions structurantes, contexte, options et conséquences.
- `40_specs/` : comportements fonctionnels, parcours et critères d'acceptation.

Chaque document publié est référencé par une ligne descriptive dans `INDEX.md`.

## En-tête minimal

Tout nouveau document commence par les champs suivants :

```text
# Titre

Statut : brouillon | actuel | historique | obsolète
Dernier contrôle : AAAA-MM-JJ
Sources : chemins précis vers les sources consultées
```

Le champ « Dernier contrôle » date le recoupement des informations ; il ne garantit pas leur
actualité après cette date.

## Contenu minimal par type

### Concept

- définition ;
- règles et invariants ;
- relations avec les autres concepts ;
- limites ou questions ouvertes.

### Guide

- objectif et prérequis ;
- procédure ;
- résultat attendu ;
- erreurs connues et retour arrière ;
- contrôles réellement exécutés.

### Décision

- contexte ;
- décision ;
- options écartées ;
- conséquences ;
- date et source de l'arbitrage.

### Spécification

- objectif du parcours ;
- écrans et acteurs ;
- données lues ou modifiées ;
- règles nominales et erreurs ;
- critères d'acceptation ;
- tests ou preuves existantes.

## Hiérarchie des sources

La priorité dépend de la nature de l'information :

1. Pour un comportement implémenté : code actuel et tests associés.
2. Pour une décision produit ou organisationnelle : décision explicite la plus récente dans les
   instructions du projet, les échanges conservés ou une roadmap active.
3. Pour l'historique d'une évolution : changelog, roadmaps terminées et archives.
4. Pour orienter une recherche : fichiers `_contexte/`, dont les états sont datés et doivent être
   recoupés avant toute formulation au présent.

Une source historique ne prouve pas à elle seule le comportement actuel. Une absence
d'information n'est jamais transformée en règle implicite.

## Contradictions

- Ne pas choisir silencieusement une version.
- Citer les sources contradictoires et leur date.
- Contrôler le code lorsque la contradiction concerne un comportement implémenté.
- Demander un arbitrage lorsque la contradiction concerne une intention produit ou une règle
  d'organisation.
- Conserver la contradiction comme question ouverte tant qu'elle n'est pas tranchée.

## Données sensibles

Ne jamais lire, copier ni documenter le contenu de `.env` ou de `donnees_testeurs/` sans instruction
explicite. Les guides utilisent uniquement des noms de variables et des exemples fictifs.

## Contrôle avant publication

- Le document est référencé dans `INDEX.md`.
- Tous les liens relatifs pointent vers un fichier existant.
- Les affirmations importantes ont une source précise.
- Les états historiques sont présentés au passé ou datés.
- Les commandes annoncées comme fonctionnelles ont été exécutées dans la session ; sinon, elles
  sont signalées comme non testées.
- Aucun secret ni aucune donnée personnelle n'est présent.
