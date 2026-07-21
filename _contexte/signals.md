# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-07-21)

## Actions ouvertes

### Roadmap V4.1 active (`roadmap_v4.1.md`, phase V4.1-0 à démarrer)
- [P2|ouvert] Phase V4.1-0 — Nav + hub « Outils » : renommer l'onglet Todo en Outils, créer `E70Tools.tsx`
  - fait quand: onglet « Outils » ouvre le hub, Todo accessible et fonctionnel à l'identique depuis le hub, gate de phase coché.
  - réf: `roadmap_v4.1.md` § Phase V4.1-0

## Questions ouvertes
- Reste hors périmètre V4.1 (voir `roadmap_v4.1.md` § Reporté hors V4.1) : liste courses « particulière » (besoin jamais précisé par Marie), intégration accueil du budget, date butoir Todo, retraits/virements livrets, câblage global du chiffrement.

## Échéances

## Blocages
Aucun.

## Contexte chaud
- Roadmap `roadmap_v4.1.md` active à la racine (créée 2026-07-21, branche `v4.1`) : objet E3 tranché — rubrique nav « Outils » remplaçant « Todo » (Todo déplacé tel quel en sous-partie), listes épinglables depuis l'onglet Listes existant, module Budget complet (catégories semaine/mois, revenus multiples, livrets version simple, reste non budgétisé). 5 phases (V4.1-0 à V4.1-4), aucune codée. Décisions de cadrage détaillées en tête du fichier roadmap.
- Cadrage Budget acté avec l'utilisateur (pas encore avec Marie) : périodicités semaine+mois uniquement, reset auto par période avec historique conservé, pas d'intégration accueil en V4.1, livrets simples (dépôt seul, pas de retrait/virement), données en clair (pas de chiffrement, cohérent avec le reste du modèle actuel qui n'a jamais câblé le mécanisme AES-GCM existant).
- Analyse du code existant faite avant d'écrire la roadmap (agent Explore) : bottom nav plat sans sous-navigation (`BottomNav.tsx`), système de Listes actuel non réutilisable tel quel pour une liste de courses (pas de champ coché/quantité), `AppContext.tsx` déjà volumineux (751 lignes, ~85 propriétés) — vigilance à avoir en V4.1-3 pour ne pas l'alourdir sans extraction. Bloc d'écrans E7x libre dans la numérotation, réutilisé pour Outils/Budget.
- Décision E9 (2026-07-18) appliquée à la lettre : la sous-tâche planifiable reste une `SubTask` rattachée à sa `Task` parente (champs `scheduled_date`/`scheduled_start`/`scheduled_end`/`postponed` ajoutés directement dessus), jamais promue en `TaskV2` indépendante avec `parent_task_id`.
- Périmètre étendu sur demande explicite de l'utilisateur au-delà du gate initial (V4-5) : parité complète d'interactions (E1 glisser, E6 menu déplacer/renommer/supprimer, E8 reporter) entre une tâche planifiée et une sous-tâche planifiée. `E40Planning.tsx` a été réécrit autour d'un type union `PlanBlock` (`{kind:'task'}` | `{kind:'subtask'}`) pour porter cette parité sans dupliquer la logique de glisser/menu/report — pattern à réutiliser si un 3e type d'élément planifiable apparaît.
- `taskSlotRange`/`taskOccupiesSlot` (`taskRulesV2.ts`) généralisés pour accepter tout objet `{scheduled_start, scheduled_end}` (pas seulement `TaskV2`) — réutilisés tels quels pour les sous-tâches, pas de duplication de la logique de créneaux.
- Le flux E6 « Déplacer » et E8 « Reporter » restent unifiés sur le bandeau « "X" est en cours de déplacement. » (flux « tâche en main » d'E5) — pas de modale de liste de créneaux, y compris pour les sous-tâches.
- `--bottomnav-h` mesuré dynamiquement via `ResizeObserver` (`BottomNav.tsx`). Effet de bord non vérifié visuellement : en mode surcharge la nav est vide donc plus courte, `--bottomnav-h` rétrécit en conséquence sur les écrans qui en dépendent.

## Dernière session (2026-07-21, suite 3)

## Décisions prises
- Objet de la branche `v4.1` tranché : traitement d'E3 (rubrique « Outils » remplaçant « Todo » : Todo + Listes épinglées + Budget).
- Cadrage produit Budget entièrement tranché avec l'utilisateur (périodicités, revenus, reset de période, livrets, reste non budgétisé, chiffrement, périmètre exclu) — voir `roadmap_v4.1.md` § Décisions de cadrage.
- Nav : « Outils » (pluriel) remplace « Todo » ; Listes reste un onglet séparé, les listes s'épinglent dans Outils plutôt que d'être dupliquées.

## Livrables produits ou modifiés
- `roadmap_v4.1.md` : créée à la racine (5 phases V4.1-0 à V4.1-4), aucune codée.

## Hypothèses validées / invalidées
- VALIDE : le système de Listes actuel n'est pas réutilisable tel quel pour une liste de courses (pas de coché/quantité) — confirmé par lecture de `list.ts`/`listItem.ts`/`E61ListDetail.tsx`.
- EN ATTENTE : contenu exact de la « liste de courses particulière » évoquée par Marie en visio (transcription coupée par des appels, jamais reprise) — reporté hors V4.1.

## Prochaine étape exacte
Démarrer la Phase V4.1-0 (nav + hub `E70Tools.tsx`) sur demande de l'utilisateur ; checkpoint `/compact` prévu en fin de phase.

## Question bloquante pour la session suivante
Aucune.
