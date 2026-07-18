# Roadmap — V4 (post-visio Marie 2026-07-16)

Version : 4.0 — créée 2026-07-18. Succède à `roadmap_v3.md` (V3 close).
Supersède le brouillon `Note de réunion/2026-07-13/roadmap_v4.md` (jamais promu à la racine) : cette visio en révise plusieurs items (E1 sans la veille, D1 rendu caduc par E3, Q1 tranchée).
Source : `constats_2026-07-18.md` (même dossier). Les IDs renvoient à ce fichier.

Légende : `[ ]` non démarrée · `[~]` en cours · `[x]` terminée.
Gate commun : tests créés et verts · test manuel de la phase · doc à jour · aucun écran ne perd son point d'entrée · critère de sortie.

## Ordre & dépendances

```
V4-0 Refacto préalable ──┬──► V4-1 Quick wins UI (B1 ← R2)
                         └──► V4-2 Rendu planning (P1 ← R1)
                                   │
                                   └──► V4-3 Multi-créneaux + récurrence (E2, E5 ← R1+P1)
                                              │
                                              ├──► V4-4 Interactions tâche (E6, E1, E8)
                                              └──► V4-5 Sous-tâches planifiables
```

V4-2 avant V4-3 : la case pleine (P1) est le support visuel du span (E2).
V4-3 avant V4-4 : E1/E6/E8 déplacent ou reportent une tâche dont le modèle passe d'un créneau unique à une plage (E2) — les coder avant reviendrait à réécrire `handleMove` deux fois.
D3/B2 rattachés à V4-3 (et non V4-1) : retirer « Répéter demain » sans que son remplaçant (E5) soit codé laisserait Marie sans mécanisme de récurrence entre les deux phases.
V4-5 en dernier : seul item touchant le modèle de données, à ne pas mêler au churn de `E40Planning.tsx`.

---

## Phase V4-0 — Refacto préalable

> Basculer sur le modèle Opus (/model opus) avant de démarrer cette phase.

Aucun changement de comportement visible.

- [x] R1 — Helper `taskSlotRange(task)` (`scheduled_start`/`scheduled_end` → indices de slots) + rendu d'occupation par plage dans `E40Planning.tsx` (aujourd'hui `taskSlot()` ne lit que le début → rendu identique) (`src/domain/rules/taskRulesV2.ts`, `E40Planning.tsx:41-45,454-489`)
- [x] R2 — Injecter `--color-accent` sur `documentElement` depuis `Settings.ambiance_color` (défaut `= --color-primary`) dans le `useEffect` settings, sans changer l'apparence (`src/app/AppContext.tsx:193-200`, `src/ui/styles/ambiance.ts`)

Gate : [x] tests verts · [x] test manuel · [x] doc · [x] sortie : `tsc -b` clean, planning et boutons visuellement identiques à la V3

---

## Phase V4-1 — Quick wins UI

- [x] B1 — Boutons primaires sur `--color-accent` (`src/ui/components/Button.tsx:11-15` ; vérifier `BottomNav.tsx:74`, `E60Lists.tsx:231`, `E20Inbox.tsx:192`, `E24Today.tsx:100`) — périmètre tranché par Marie : tous les boutons utilisant le bleu clair de base (`Button`, `BottomNav`, `E120Resources`, `E31EnergyCheckIn`, `E03Energy`, `E21CreateTaskV2`, `E40Planning`)
- [x] D2 — « aujourd'hui » → « maintenant » (`E31EnergyCheckIn.tsx:56,58` ; aligné `E30EnergyView.tsx`, `E03Energy.tsx`)
- [x] E7 — Indicateur surcharge affiché aussi hors surcharge, grisé et cliquable (explication du mode) ; coloré quand actif (`src/ui/components/TopBar.tsx`)
- [x] D4 — Ne pas proposer « planifier » à l'ajout depuis Todo (`E20Inbox.tsx`, `E21CreateTaskV2.tsx`, `taskCreateOrigin` dans `AppContext.tsx`)
- [x] B3 — Retour depuis l'écran de création de tâche (`E21CreateTaskV2.tsx`) vers l'écran d'origine (ex. accueil) via `taskCreateOrigin`
- [x] B4 — Bouton « Mode surcharge » (E7) : ouvre une modale d'explication détaillée avec bouton Fermer, dans les deux états (actif/inactif) (`src/ui/components/TopBar.tsx`)

Gate : [x] tests verts (384/384) · [x] test manuel (validé le 2026-07-19) · [x] doc · [x] sortie : couleur d'ambiance suivie par les boutons, indicateur surcharge présent dans les deux états

---

## Phase V4-2 — Rendu du planning

- [x] P1 — Couleur appliquée à toute la case du créneau, nom écrit dedans, suppression du chip interne (`E40Planning.tsx`)
- [x] P2 — Case à cocher réversible sur la tâche planifiée : teinte claire par défaut, intensifiée une fois cochée ; remplace le bouton « Terminer » (`E40Planning.tsx`, `E10Dashboard.tsx`, `ambiance.ts`)
- [x] P3 — Tâches du jour terminées conservées à l'écran en teinte intensifiée au lieu de disparaître (`E24Today.tsx`, `E10Dashboard.tsx`, `taskRepository.getTodayTasks`)

Gate : [x] tests verts (388/388) · [x] test manuel (validé le 2026-07-19) · [x] doc · [x] e2e mis à jour (45/45) · [x] sortie : case pleine colorée, cochage visible et réversible sur planning, dashboard et tâches du jour, aucune tâche terminée ne disparaît

---

## Phase V4-3 — Multi-créneaux et récurrence

- [x] E2a — Sélection début→fin : 1er clic = début, 2e clic = fin, même case deux fois = 1 créneau (`E40Planning.tsx`)
- [x] E2b — Écriture de `scheduled_end` sur l'intervalle + détection de conflit sur toute la plage (`taskRulesV2.ts`, `E40Planning.tsx`)
- [x] E2c — Rendu unifié : un seul rectangle couvrant la plage, nom affiché une fois, lignes intermédiaires masquées ; coût énergétique compté une seule fois par tâche (`E40Planning.tsx`, `getRemainingPlannedCost` dans `taskRulesV2.ts`)
- [x] E5 — La tâche saisie reste « en main » après placement : chaque clic sur une case la replace, y compris après changement de jour, jusqu'à sortie explicite (`pendingPlanTask`/`clearPendingPlanTask` dans `AppContext.tsx`, `E40Planning.tsx`)
- [x] D3 — Retirer le bouton « Répéter demain » et le câblage associé, une fois E5 en place (`E40Planning.tsx`, `AppContext.tsx`, `taskRulesV2.ts`, `E10Dashboard.tsx`)
- [ ] B2 — Vérifier le cadre « Planning du jour » de l'accueil après D3, corriger le débordement s'il subsiste (`E10Dashboard.tsx:307+`)
- [x] D5 — Fusionner l'étape « Obligatoire ? » avec l'étape énergie dans la modale (`E40Planning.tsx`)

Gate : [x] tests verts (386/386) · [ ] test manuel · [x] doc · [x] e2e mis à jour (47/47 : retrait « Répéter demain », flux de sélection en 2 clics) · [ ] sortie : une tâche > 30 min occupe visuellement ses créneaux en un bloc, ajout de la même tâche sur plusieurs créneaux/jours sans quitter le planning, plus de « Répéter demain », surcharge inchangée pour un coût donné

---

## Phase V4-4 — Interactions sur une tâche planifiée

- [ ] E6 — Clic sur une tâche → menu déplacer / renommer / supprimer (`E40Planning.tsx:494-515,699-713` ; ajouter `renameV2Task`/`deleteV2Task` dans `AppContext.tsx`)
- [ ] E1 — Appui long + glisser (pointer events) : haut/bas = autre créneau du même jour (réutilise `handleMove`), droite = lendemain ; pas de glisser vers la veille (`E40Planning.tsx:362-374`)
- [ ] E8 — « Reporter » ouvre le choix d'un créneau vide au lieu d'avancer au lendemain — réutilise le flux de sélection de créneau d'E6, pas un mécanisme dédié ; badge « Reporté » coloré (`E40Planning.tsx:343-346,537-557` ; revoir `postponeTaskV2` dans `taskRulesV2.ts:90-97`)

Gate : [ ] tests verts · [ ] test manuel · [ ] doc · [ ] e2e mis à jour (report automatique remplacé par choix de créneau) · [ ] sortie : déplacement au doigt fonctionnel sur mobile, tâche renommable/supprimable, report avec choix de créneau

---

## Phase V4-5 — Sous-tâches planifiables

- [ ] E9a — Rendre une sous-tâche planifiable (`src/domain/entities/taskV2.ts` : `parent_task_id` optionnel, ou promotion de `SubTask` en `TaskV2` rattachée ; migration Dexie)
- [ ] E9b — Affichage hiérarchique dans le planning et sur l'accueil : titre parent en taille normale, sous-tâche en dessous, plus petite, préfixée d'un tiret (`E40Planning.tsx`, `E10Dashboard.tsx`, `E24Today.tsx`)
- [ ] E9c — Point d'entrée depuis l'écran de décomposition (`E23Decompose.tsx`, `E22TaskDetail.tsx`)

Gate : [ ] tests verts · [ ] test manuel · [ ] doc · [ ] sortie : une sous-étape se planifie à son propre créneau et reste lisible comme sous-tâche de son parent, base V3 migrée sans perte

---

## Q tranchées (2026-07-18, suite)

- **E2** — chevauchement de plage : sélection bloquée si un créneau intermédiaire est déjà occupé. Coût énergétique : compté une seule fois par tâche (pas par créneau).
- **E8** — confirmé : « Reporter » ouvre le choix d'un créneau vide dans le planning (réutilise le flux E6), remplace l'avance automatique au lendemain.
- **E9** — sous-tâche planifiée reste rattachée au parent (une seule entité, pas de promotion en `TaskV2` indépendante avec `parent_task_id`).

## Q à trancher

- **E3** — cadrage produit complet requis : bloque toute mise en chantier.

## Divers (hors phases)

- [ ] Faire le ménage à la racine du projet.

## Reporté hors V4

- E3
