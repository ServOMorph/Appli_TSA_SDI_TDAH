# Roadmap — Demandes Marie (analyse du 2026-09-10)

Source : Google Doc « Modifications » de Marie, modifié le 2026-09-06 18:48 UTC. Détecté par
`/deploy` étape 0.4 (compte-rendu « analyse requise »), analysé par `/analyser_googledoc`.

## Analyse du Google Doc

| N° | Catégorie | État constaté | Traitement |
| --- | --- | --- | --- |
| #35 | Paramètres / Profil | Fonctionnalité livrée v5.92 (`taskCategory`, `ColorPicker` mode catégories, `E112Accessibility`). Régression confirmée : sélection d'une couleur par catégorie dans E22 (édition de tâche) sans retour visuel immédiat — `E22TaskDetail.tsx:399-407` (`saveField`, `setExpandedField(null)` synchrone avant la fin de `updateTaskFields` + `refreshFetchedTask`) | Phase 1 |
| #36 | Paramètres / Profil | Livrée v5.92, reconfirmée `ok` par Marie le 2026-09-10 (`couleur-de-fond-par-outil`) | Aucun — déjà livrée |
| #37 | Tâches | Réécrit dans le Doc le 2026-09-06 (« je veux que E21 soit comme E22 »), remplace l'énoncé détaillé du 2026-09-04 (refonte de la fiche, déjà livrée v5.92). E21CreateTaskV2 et E22TaskDetail partagent déjà `TaskCardLayout`, bandeau titre coloré et cellules teintées depuis cette livraison ; l'écart restant qui gêne Marie n'est pas déductible du texte seul | Décision produit — clarification demandée |
| #38 | Accueil / Planning | Livrée v5.92, reconfirmée `ok` par Marie le 2026-09-10 (`defilement-des-jours-dans-la-case`) | Aucun — déjà livrée |

## Phase 1 — Correctif sélection de couleur par catégorie (#35) [FAIT]

- **Constat** : `E22TaskDetail.tsx` fonction `saveField` (lignes 399-407) appelle
  `setExpandedField(null)` de façon synchrone dès le clic sur une catégorie, avant la résolution de
  `updateTaskFields` (`usePlanningState.ts:240-260`) puis de `refreshFetchedTask`. Le champ
  « Couleur » se replie donc immédiatement : le bouton catégorie cliqué n'affiche jamais son état
  sélectionné (`ColorPicker.tsx:76-78`, `aria-pressed` / bordure `2px solid`). La couleur réellement
  appliquée n'est visible qu'au prochain remontage de l'écran (retour accueil, ré-ouverture de la
  tâche), d'où le retour de Marie : « ça apparaît sélectionné mais que quand on revient sur
  l'accueil et qu'on reclique dessus, pas quand on clique directement sur la categorie ».
- **Fichiers pressentis** : `src/ui/screens/tasks/E22TaskDetail.tsx` (`saveField`) ; vérifier aussi
  `E21CreateTaskV2.tsx` (sélection locale via `setColor`, a priori non affectée — pas de repli
  synchrone d'un champ dépliable côté création).
- **Décision d'implémentation** (non bloquante, au choix du développeur) : soit conserver le champ
  ouvert le temps de la sauvegarde et ne le replier qu'après confirmation, soit répercuter la
  couleur choisie immédiatement sur la ligne résumé (`E22TaskDetail.tsx:587-588`) sans attendre le
  cycle async complet.
- **Tests** : couvrir dans `E22TaskDetail.test.tsx` l'affichage immédiat de la sélection de
  catégorie ; suite existante verte (`tsc -b`, lint, `vitest run`).
- **Test manuel** : mettre à jour le parcours `choisir-une-couleur-de-tache-par-categorie` du
  catalogue in-app (nouvelle `revision`) au moment du déploiement du correctif.
- **Critère de sortie** : tests verts, `tsc -b` + lint clean, parcours revalidé `ok` par Marie sur
  une prochaine livraison.
- **Réalisé (2026-09-12)** : `setExpandedField(null)` déplacé après `await updateTaskFields` +
  `await refreshFetchedTask` dans la branche non récurrente de `saveField` (choix retenu : champ
  ouvert le temps de la sauvegarde), avec un identifiant de champ (`field?: FieldKey`) et un jeton
  de sauvegarde (`saveTokenRef`) pour ne refermer que le champ réellement concerné par la
  sauvegarde qui vient d'aboutir — trouvé par `code-review medium` (repli intempestif d'un champ
  fraîchement rouvert si l'utilisateur en change pendant qu'une sauvegarde précédente est encore en
  vol, ou si deux sauvegardes se chevauchent sur le même champ). Tests `E22TaskDetail.test.tsx`
  mis à jour (3 tests de régression + `waitFor`/`aria-expanded` sur les assertions asynchrones
  affectées) ; suite complète 847 tests verts, `tsc -b` + lint clean. Parcours
  `choisir-une-couleur-de-tache-par-categorie` passé en `revision: 1`.
  Reste dû, hors code : déploiement et validation `ok` de Marie.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Décisions produit non tranchées

- **#37** — Le Doc a remplacé le 2026-09-06 l'énoncé détaillé de refonte de la fiche de tâche
  (livrée v5.92) par « je veux que E21 soit comme E22 ». E21 et E22 partagent déjà la mise en page
  (`TaskCardLayout`, bandeau titre coloré, cellules teintées) depuis cette livraison. Question posée
  à Marie via la gateway le 2026-09-10 (`--expect-reply`) : ce qui, concrètement, diffère encore
  entre les deux écrans et la gêne. Aucune phase de code tant que la réponse n'est pas reçue.
  **2026-09-11** — réponse partielle « Quelques un pas beaucoup » (rien de nommé), puis message
  Discord (@-mention du bot, hors gateway) : **« non ce ne sont pas les mêmes »**, contredisant le
  constat ci-dessus — Marie annonce un enregistrement d'écran d'E21 et un screen d'E22 à l'appui.
  Les deux pièces jointes n'ont jamais atteint la gateway (bug de routage `bot.py` — un message qui
  @-mentionne le bot après consommation d'un `--expect-reply` tombait en mode commande au lieu
  d'être routé, cf. `_contexte/marie_modifications_suivi.md` #37 ; corrigé commit `94962bb`, bot
  redémarré). **Irrécupérables** depuis nos fichiers : redemandées à Marie (gateway, id
  `20260912T061449_057883`), transmises directement par l'utilisateur (fichiers locaux).
  **2026-09-12** — pièces jointes visionnées (`IMG_3440.png` = E22, `ScreenRecording_09-11-2026
  19-09-38_1.mov` = E21, extraction d'images ffmpeg). Écart réel confirmé, distinct de ce qui avait
  été vérifié le 2026-09-10 : le partage de style (`TaskCardLayout`, teinte de couleur) est bien
  réel, mais **le mode d'interaction des champs diffère totalement** :
  - E22 : champs repliés en pastilles compactes (« Icône : Aucune », « Couleur : Aucune couleur »,
    etc.), grille 2 colonnes, dépliées seulement au tap (`expandedField`/`toggleField`,
    `E22TaskDetail.tsx`).
  - E21 : champs **toujours dépliés en plein** — bloc « Icône » occupant tout l'écran avec sa
    grille de 15 icônes visible en permanence, idem « Couleur », « Coût en énergie » (grille 1-12
    toujours ouverte) — long scroll de sections jamais repliées (`E21CreateTaskV2.tsx`).
  #37 sous sa formulation actuelle signifie vraisemblablement : reprendre sur E21 le mode compact
  replié/dépliable au tap d'E22, plutôt que la liste de sections toujours ouvertes. Confirmation de
  compréhension envoyée le 2026-09-12 (gateway id `20260912T061902_354912`).
  **2026-09-12 (suite)** — Marie répond « oui » (gateway id `20260912T095110_830980`, non `ack`),
  mais dans la foulée signale un incident sur v5.124 (« j'ai plus mes données », « il fait de la
  merde »). Message de diagnostic envoyé en mode urgent (id `20260912T103859_204601`) pour clarifier
  l'incident avant d'agir. **Aucune phase de code sur #37 tant que la réponse à ce diagnostic n'est
  pas reçue** (décision explicite de l'utilisateur, cf. `signals.md`) — le « oui » seul n'est pas
  traité comme un feu vert isolé, à recouper avec sa réponse.
  **2026-09-13** — Incident v5.124 élucidé et clos (deux installations distinctes sur son
  téléphone, aucune perte de données ni côté serveur ni côté local ; détail dans
  `COMMUNICATION/Marie/historique_conversation_marie.md` § 2026-09-13). Marie répond « ok » au
  message de correction (11h46 UTC) — **le blocage est levé**. Sa confirmation « oui » du
  2026-09-12 sur l'architecture #37 (E21 reprend le mode replié/dépliable d'E22) reste donc valable
  et peut être recoupée sans réserve. **Décision (2026-09-13, utilisateur) : Phase 2 dédiée ouverte
  ci-dessous.**

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 2 — E21 reprend le mode compact replié/dépliable d'E22 (#37) [FAIT]

- **Constat** : `E21CreateTaskV2.tsx` affiche les champs Icône, Couleur, Date, Heure de début
  (+Durée) et Coût en énergie en blocs `fieldCellStyle` toujours dépliés — grille de 15 icônes,
  palette de couleurs et grille d'énergie 1-12 visibles en permanence, long scroll de sections
  jamais repliées. `E22TaskDetail.tsx` a le même jeu de champs, mais via `TaskFieldCard`
  (`src/ui/components/TaskCardLayout.tsx`) : replié en pastille compacte (`label` + `value`),
  dépliage au tap (`expandedField`/`toggleField`), un seul champ ouvert à la fois. Écart confirmé
  par Marie (captures E21/E22 du 2026-09-12, cf. § Décisions produit ci-dessus).
- **Fichiers pressentis** : `src/ui/screens/tasks/E21CreateTaskV2.tsx` (remplacer les blocs
  `fieldCellStyle` par `TaskFieldCard`, ajouter l'état `expandedField`/`toggleField`) ;
  `src/ui/components/TaskCardLayout.tsx` réutilisé tel quel (déjà partagé par E22).
- **Périmètre** : Icône, Couleur, Date, Horaire (heure + durée réunies sous un seul champ, comme
  dans E22), Coût en énergie. Sous-tâches, Description, Obligatoire et Récurrence restent hors
  périmètre — non visés par le constat (blocs de saisie simples, pas des sélecteurs en grille) et
  non repliés dans E22 lui-même pour Sous-tâches/Obligatoire/Récurrence.
- **Comportement** : un seul champ ouvert à la fois. Icône/Couleur/Date/Énergie se referment dès la
  sélection d'une valeur (pas de sauvegarde asynchrone à attendre côté création, contrairement à
  E22). Horaire se referme sur une action explicite (bouton, par symétrie avec le bouton
  « Enregistrer » d'E22) car deux champs (heure, durée) s'y saisissent successivement.
- **Tests** : `E21CreateTaskV2.test.tsx` — mettre à jour les tests qui interagissaient directement
  avec les champs désormais repliés (couleur, énergie, date, heure/durée) pour déplier au préalable
  (`Modifier <Label>`), ajouter la couverture repliement/dépliement (`aria-expanded`) et un seul
  champ ouvert à la fois, à l'image de `E22TaskDetail.test.tsx`.
- **Test manuel** : mettre à jour le parcours concerné du catalogue in-app
  (`src/domain/data/manualTestsCatalog.ts`) pour couvrir le mode replié/dépliable d'E21.
- **Critère de sortie** : suite complète verte, `tsc -b` + lint clean, parcours revalidé `ok` par
  Marie sur une prochaine livraison.
- **Réalisé (2026-09-13)** : les 5 blocs `fieldCellStyle` d'`E21CreateTaskV2.tsx` (Icône, Couleur,
  Date, Heure de début, Coût en énergie) remplacés par `TaskFieldCard` (déjà utilisé par E22),
  avec un état `expandedField`/`toggleField` répliquant le comportement d'E22 : un seul champ
  ouvert à la fois. Icône/Couleur/Date/Énergie se referment dès la sélection d'une valeur (pas de
  sauvegarde asynchrone côté création, contrairement à E22) ; Heure de début et Durée réunies sous
  un champ « Horaire » unique, qui ne se referme que sur un bouton « Fermer » explicite. Fonction
  `fieldCellStyle` devenue inutile, supprimée. Tests `E21CreateTaskV2.test.tsx` mis à jour (champs
  désormais dépliés avant interaction) + 4 tests ajoutés (un seul champ ouvert à la fois, fermeture
  après sélection pour Icône/Énergie, Horaire qui reste ouvert jusqu'à « Fermer »). 3 fichiers e2e
  (`01-onboarding.spec.ts`, `05-overload.spec.ts`, `07-planning-v4.spec.ts`) mis à jour pour ouvrir
  Horaire/Énergie avant d'y interagir. Suite complète 855 tests verts (+4), `tsc -b` + lint clean,
  e2e 58/59 verts (`10-feedback.spec.ts` T58 en échec, **préexistant et confirmé indépendant de ce
  changement** — reproduit à l'identique sur `main` avant ce correctif, hors périmètre #37,
  non traité ici). Parcours in-app `creer-une-tache-bandeau-colore` mis à jour (`revision: 1`) pour
  décrire le mode replié/dépliable.
  Reste dû, hors code : déploiement (bump `CHANGELOG.md`/version, à la charge de `/deploy`) et
  validation `ok` de Marie.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.
