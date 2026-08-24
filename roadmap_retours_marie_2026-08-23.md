# Roadmap — Retours Marie, export du 23 août 2026

Sources : `donnees_marie/export-audhd-2026-08-23-18h53.json` et `C:\Users\raph6\Downloads\Modifications.pdf`, analysés le 24 août 2026.

Légende : `[ ]` non démarrée · `[~]` en cours · `[x]` terminée.

## Périmètre

Traiter les retours encore pertinents de l’export, sans modifier les comportements validés ultérieurement et sans supprimer le dépliage du planning sans décision explicite.

## Analyse du PDF « Modifications »

| Pages | Demande | État au 24 août | Traitement dans cette roadmap |
| --- | --- | --- | --- |
| 1 | Hauteur des tâches selon leur durée | Livré par le rendu proportionnel du planning | Aucun correctif | 
| 1 | Cadre et glissement fluide du bandeau de jours | Livré en v5.51 | Aucun correctif |
| 1 | Différencier les outils par leur couleur | Livré en v5.51, mais le contrôle est difficile à repérer | Phase 4 |
| 2 | Débordement Date/Heure ; actions de tâche à simplifier | L’interface illustrée a été remplacée ; l’édition dédiée existe | Reproduction seulement si le défaut persiste |
| 3 | Fond neutre pour une tâche sans couleur | Écart confirmé entre le catalogue et `PlanningBoard.tsx` | Phase 1 |
| 4-5 | Refonte du Budget et séparation Budget/Comptes | Demandée sur un modèle d’écran antérieur ; refonte v5.49 déjà livrée | Hors périmètre, ne pas réintroduire l’ancien modèle |
| 6 | Suppression d’une seule catégorie ; détail avec description et sous-tâches | Livré en v5.51 ; retour du détail signalé en échec | Phase 2 |
| 6 | Formulaire « Ajouter une catégorie » masqué par le clavier | L’ancien écran n’existe plus ; formulaire inline actuel | Reproduction seulement si le défaut persiste |
| 7 | Accès direct à la modification de l’énergie | Livré en v5.51 | Aucun correctif |

Le PDF ne justifie donc pas de réimplémenter les demandes Budget : cela réintroduirait un modèle explicitement remplacé. Les seules modifications à engager restent celles classées dans les phases ci-dessous, après reproduction lorsque nécessaire.

## Ordre et dépendances

```
Phase 0 — Reproduire et qualifier
    ├── Phase 1 — Couleur neutre des tâches
    ├── Phase 2 — Retour du détail d’un élément de liste
    ├── Phase 3 — Affichage des tests déjà validés
    └── Phase 4 — Sélecteur de couleur des outils
Phase 5 — Validation et préparation de livraison
```

Les phases 1 à 4 sont indépendantes après la qualification initiale.

## Phase 0 — Reproduire et qualifier [x]

- [ ] Rejouer sur la version de développement les parcours signalés : tâche sans couleur, retour depuis le détail d’un élément de liste, tests déjà validés, couleur d’un outil, dépassement Date/Heure et formulaire « Ajouter une catégorie » avec clavier mobile.
- [ ] Pour chaque constat, enregistrer le chemin de navigation, le résultat observé et le résultat attendu du catalogue.
- [ ] Ne retenir comme correctif que les écarts reproductibles. En particulier, les deux retours « test déjà validé » datent du 18 août mais ces tests ont été validés ensuite dans l’export ; vérifier l’état actuel avant toute modification.

Résultat : fond neutre et retour de catégorie confirmés comme bugs ; sélecteur de couleur classé ergonomie ; les tests validés sont déjà masqués sur leur dernier résultat ; les écrans Date/Heure et ajout de catégorie décrits dans le PDF ont été remplacés.

Critère de sortie : chaque point est classé en bug reproductible, problème d’ergonomie ou absence de correctif nécessaire.

## Phase 1 — Tâche sans couleur [x]

- [ ] Corriger `PlanningBoard.tsx` afin qu’une tâche sans couleur utilise un fond neutre, et non `ambianceColor`.
- [ ] Préserver la couleur d’ambiance pour les autres éléments du planning qui l’emploient volontairement.
- [ ] Ajouter ou ajuster le test unitaire couvrant les deux cas : tâche sans couleur et tâche avec couleur explicite.
- [ ] Rejouer le test manuel `couleur-tache-sans-couleur-choisie`.

Critère de sortie : une tâche « Aucune couleur » a un fond neutre ; une tâche colorée conserve strictement sa couleur choisie.

## Phase 2 — Retour du détail d’un élément de liste [x]

- [ ] Reproduire le chemin catégorie → élément → retour, y compris après une navigation depuis l’accueil.
- [ ] Si le retour dépend de la pile de navigation, corriger le chemin pour retrouver la catégorie précédemment ouverte, sans réinitialiser la sélection de liste.
- [ ] Ajouter un test d’écran couvrant le retour vers `list-detail` et la catégorie attendue.
- [ ] Rejouer le test manuel `detail-element-de-liste`.

Critère de sortie : le bouton Retour du détail ramène systématiquement à la catégorie d’origine de la liste.

## Phase 3 — Tests déjà validés réaffichés [x]

- [ ] Vérifier le calcul du dernier résultat par `test_id` dans `E121ManualTests.tsx`, avec un historique mêlant `nok` puis `ok`.
- [ ] Si le défaut est reproductible, corriger le tri ou le chargement des résultats, puis ajouter un test de régression pour cet historique.
- [ ] Si le dernier résultat `ok` masque déjà le test, consigner l’absence de correctif : le signalement aura été résolu par la validation ultérieure, pas par une modification non justifiée.

Critère de sortie : un test dont le dernier résultat chronologique est `ok` n’apparaît plus dans « Tests à faire ».

Résultat : aucun correctif applicatif. Le calcul existant prend bien le dernier résultat chronologique ; un test de régression couvrant `nok` puis `ok` a été ajouté.

## Phase 4 — Sélecteur de couleur d’un outil [x]

- [ ] Rendre le contrôle de couleur identifiable visuellement sur les cartes d’outils, sans déclencher l’ouverture de l’outil.
- [ ] Choisir une présentation accessible et compacte : libellé visible ou bouton explicite, en conservant le sélecteur natif et le retrait de couleur.
- [ ] Mettre à jour les tests de `ToolWidgetCard` pour le nouveau contrôle et l’absence d’ouverture accidentelle.
- [ ] Ajuster le test manuel `couleur-de-fond-par-outil` pour désigner précisément le contrôle visible.

Critère de sortie : le contrôle de couleur est trouvable sans ambiguïté et son interaction n’ouvre pas l’outil.

## Décision hors périmètre — Dépliage du planning

Marie demande la suppression de cette fonctionnalité, mais l’export contient aussi une validation ultérieure du même test. Aucun changement ne doit être engagé sans décision explicite de l’utilisateur sur le comportement cible.

## Phase 5 — Validation et préparation de livraison [~]

- [ ] Exécuter les tests ciblés, puis la suite complète, `tsc -b` et le lint.
- [ ] Mettre à jour `manualTestsCatalog.ts` uniquement pour les tests dont l’interface ou l’attendu change réellement.
- [ ] Ajouter une entrée de changelog décrivant seulement les correctifs effectivement livrés.
- [ ] Demander l’autorisation avant tout déploiement.

Critère de sortie : contrôles automatisés verts, tests manuels rejoués, documentation alignée et aucune régression de navigation.

État : build, lint et suite complète verts. Les tests manuels restent à rejouer avant déploiement ; aucun déploiement n’est engagé.
