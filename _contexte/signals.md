# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-07-21)

## Actions ouvertes

### Roadmap V4 close (archivée `Archives/roadmap_v4.md`) — aucune roadmap active à la racine
- [P3|ouvert] E3 — module budget/comptes + rubrique « Outil » remplaçant « Todo » : cadrage produit complet requis (gros chantier, reporté)
  - fait quand: cadrage fait avec Marie (périmètre, structure des données comptes, arborescence Outil).
  - réf: `Note de réunion/2026-07-16/constats_2026-07-18.md` E3 ; `Archives/roadmap_v4.md` § Reporté hors V4

## Questions ouvertes
- E3 seule question restante (`Archives/roadmap_v4.md` § Q à trancher) : cadrage produit complet requis, gros chantier reporté.
- Objet de la branche `v4.1` non précisé par l'utilisateur — à clarifier en prochaine session.

## Échéances

## Blocages
Aucun.

## Contexte chaud
- Aucune roadmap active à la racine (`roadmap_v4.md` archivé). Branche `v4.1` créée depuis `v4` et active, sans travail de fond engagé dessus pour l'instant (session consacrée au ménage de la racine).
- Ménage de la racine du projet exécuté intégralement (8 points validés par l'utilisateur) : `docs/adr/` fusionné dans `_docs/adr/`, scripts regroupés dans `scripts/`, `SERVEURS.md` fusionné dans `README.md`, `validation_manuelle.md` archivé (`Archives/validation_manuelle_v4-5.md`), `Retours/` fusionné dans `Note de réunion/`, `dist/v1` et `dist/v2` supprimés (`dist/v3` conservée — build de prod actuel), `.gitignore` ignore désormais `dist/` entier. Références à `ollama_call.sh` corrigées dans `.claude/CLAUDE.md` et `AGENTS.md` (nouveau chemin `scripts/ollama_call.sh`).
- Décision E9 (2026-07-18) appliquée à la lettre : la sous-tâche planifiable reste une `SubTask` rattachée à sa `Task` parente (champs `scheduled_date`/`scheduled_start`/`scheduled_end`/`postponed` ajoutés directement dessus), jamais promue en `TaskV2` indépendante avec `parent_task_id`.
- Périmètre étendu sur demande explicite de l'utilisateur au-delà du gate initial (V4-5) : parité complète d'interactions (E1 glisser, E6 menu déplacer/renommer/supprimer, E8 reporter) entre une tâche planifiée et une sous-tâche planifiée. `E40Planning.tsx` a été réécrit autour d'un type union `PlanBlock` (`{kind:'task'}` | `{kind:'subtask'}`) pour porter cette parité sans dupliquer la logique de glisser/menu/report — pattern à réutiliser si un 3e type d'élément planifiable apparaît.
- `taskSlotRange`/`taskOccupiesSlot` (`taskRulesV2.ts`) généralisés pour accepter tout objet `{scheduled_start, scheduled_end}` (pas seulement `TaskV2`) — réutilisés tels quels pour les sous-tâches, pas de duplication de la logique de créneaux.
- Le flux E6 « Déplacer » et E8 « Reporter » restent unifiés sur le bandeau « "X" est en cours de déplacement. » (flux « tâche en main » d'E5) — pas de modale de liste de créneaux, y compris pour les sous-tâches.
- `--bottomnav-h` mesuré dynamiquement via `ResizeObserver` (`BottomNav.tsx`). Effet de bord non vérifié visuellement : en mode surcharge la nav est vide donc plus courte, `--bottomnav-h` rétrécit en conséquence sur les écrans qui en dépendent.

## Dernière session (2026-07-21, suite 2)

## Décisions prises
- Branche `v4.1` créée depuis `v4` et activée (branche vide de travail, sans objet précisé).
- `roadmap_v4.md` archivé (`Archives/roadmap_v4.md`) : plus aucune roadmap active à la racine.
- Ménage de la racine du projet validé et exécuté intégralement (8 points proposés, tous acceptés par l'utilisateur).

## Livrables produits ou modifiés
- Branche git `v4.1` : créée depuis `v4`.
- `Archives/roadmap_v4.md` : renommé depuis la racine.
- `Archives/validation_manuelle_v4-5.md` : renommé depuis `validation_manuelle.md`.
- `Note de réunion/Marie-2026-06-28.txt` : déplacé depuis `Retours/` (dossier supprimé).
- `_docs/adr/` : fusion de `docs/adr/` (dossier `docs/` supprimé).
- `scripts/` : nouveau dossier regroupant `run_dev.py`, `run_prod.py`, `ollama_call.py`, `ollama_call.sh`.
- `SERVEURS.md` : supprimé, contenu fusionné dans `README.md` (section « Liens locaux »).
- `dist/v1/`, `dist/v2/` : supprimés et retirés du suivi git (`dist/v3` conservée, build de prod actuel).
- `.gitignore` : `dist/` entier ignoré (au lieu de `dist/v2/`/`dist/v3/` seuls).
- `README.md` : liens locaux ajoutés, structure et chemins ADR mis à jour.
- `.claude/CLAUDE.md`, `AGENTS.md` : référence `./ollama_call.sh` corrigée en `./scripts/ollama_call.sh`.
- Action « ménage de la racine » retirée des actions ouvertes (close).

## Hypothèses validées / invalidées
- VALIDE : les 8 points de refacto racine proposés ont été validés et exécutés sans modification du périmètre.

## Prochaine étape exacte
Aucune roadmap active. Reste ouvert hors phases : E3 (cadrage produit budget/comptes, à faire avec Marie). Objet de la branche `v4.1` à clarifier avec l'utilisateur.

## Question bloquante pour la session suivante
Aucune.
