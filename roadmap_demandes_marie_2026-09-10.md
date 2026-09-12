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

## Phase 1 — Correctif sélection de couleur par catégorie (#35) [TODO]

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
  replié/dépliable au tap d'E22, plutôt que la liste de sections toujours ouvertes. À confirmer
  auprès de Marie avant de créer une phase de code (reformulation proposée, pas encore envoyée).
