# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-07-19)

## Actions ouvertes

### V4 — Roadmap close (racine `roadmap_v4.md`)
- Toutes les phases V4-0 à V4-5 sont closes. Seuls les points ci-dessous restent ouverts, hors phases.
- [P3|ouvert] E3 — module budget/comptes + rubrique « Outil » remplaçant « Todo » : cadrage produit complet requis (gros chantier, reporté)
  - fait quand: cadrage fait avec Marie (périmètre, structure des données comptes, arborescence Outil).
  - réf: `Note de réunion/2026-07-16/constats_2026-07-18.md` E3 ; `roadmap_v4.md` § Reporté hors V4
- [P3|ouvert] Faire le ménage à la racine du projet
  - fait quand: fichiers/dossiers non pertinents à la racine identifiés et supprimés ou déplacés.
  - réf: `roadmap_v4.md` § Divers (hors phases)

### V2 — reste en parallèle (branche `v2`)
- [P2|ouvert] Finaliser V2-10 : doc V2, déploiement Netlify
  - fait quand: doc V2 à jour, déploiement Netlify effectué.
  - réf: `Archives/roadmap_v2.md`

## Questions ouvertes
- E3 seule question restante (`roadmap_v4.md` § Q à trancher) : cadrage produit complet requis, gros chantier reporté.

## Échéances

## Blocages
Aucun.

## Contexte chaud
- **Phase V4-5 close** : validation manuelle intégralement passée (1.1-1.5, 2.1-2.3, 3.1-3.6), y compris le point 1.5 (bouton « Renommer » une sous-étape depuis E22). Roadmap V4 intégralement close (V4-0 à V4-5).
- Décision E9 (2026-07-18) appliquée à la lettre : la sous-tâche planifiable reste une `SubTask` rattachée à sa `Task` parente (champs `scheduled_date`/`scheduled_start`/`scheduled_end`/`postponed` ajoutés directement dessus), jamais promue en `TaskV2` indépendante avec `parent_task_id`.
- Périmètre étendu sur demande explicite de l'utilisateur au-delà du gate initial : parité complète d'interactions (E1 glisser, E6 menu déplacer/renommer/supprimer, E8 reporter) entre une tâche planifiée et une sous-tâche planifiée. `E40Planning.tsx` a été réécrit autour d'un type union `PlanBlock` (`{kind:'task'}` | `{kind:'subtask'}`) pour porter cette parité sans dupliquer la logique de glisser/menu/report — pattern à réutiliser si un 3e type d'élément planifiable apparaît.
- `taskSlotRange`/`taskOccupiesSlot` (`taskRulesV2.ts`) généralisés pour accepter tout objet `{scheduled_start, scheduled_end}` (pas seulement `TaskV2`) — réutilisés tels quels pour les sous-tâches, pas de duplication de la logique de créneaux.
- Migration Dexie v3→v4 : `subTasks` gagne l'index `scheduled_date`. Pas de migration de données nécessaire (nouveaux champs optionnels côté lecture).
- Le flux E6 « Déplacer » et E8 « Reporter » restent unifiés sur le bandeau « "X" est en cours de déplacement. » (flux « tâche en main » d'E5) — pas de modale de liste de créneaux, y compris pour les sous-tâches.
- `--bottomnav-h` mesuré dynamiquement via `ResizeObserver` (`BottomNav.tsx`). Effet de bord non vérifié visuellement : en mode surcharge la nav est vide donc plus courte, `--bottomnav-h` rétrécit en conséquence sur les écrans qui en dépendent.

## Dernière session (2026-07-21)

## Décisions prises
- Point 1.5 de `validation_manuelle.md` (bouton « Renommer » une sous-étape depuis E22) validé par l'utilisateur.
- Phase V4-5 close ; roadmap V4 intégralement terminée (V4-0 à V4-5, toutes phases closes).

## Livrables produits ou modifiés
- `validation_manuelle.md` : point 1.5 coché.
- `roadmap_v4.md` : gate de la Phase V4-5 passé entièrement à `[x]`.

## Hypothèses validées / invalidées
- VALIDE : point 1.5 (« Renommer » une sous-étape depuis E22), dernier point restant de la validation manuelle V4-5.

## Prochaine étape exacte
Roadmap V4 close. Reste hors phases : E3 (cadrage produit budget/comptes, à faire avec Marie) et ménage de la racine du projet. En parallèle, finaliser V2-10 (doc + déploiement Netlify) sur la branche `v2`.

## Question bloquante pour la session suivante
Aucune.
