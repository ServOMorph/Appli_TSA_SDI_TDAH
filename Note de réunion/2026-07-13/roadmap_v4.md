# Roadmap — V4 (post-visio Marie 2026-07-13)

Version : 4.0 — créée 2026-07-13. Succède à `roadmap_v3.md` (V3 close).
Source : `constats_2026-07-13.md` (dossier `Note de réunion/2026-07-13/`). Les IDs (B1, E1, D2…) renvoient à ce fichier. Ne couvre que les évolutions issues de cette visio.

Légende : `[ ]` non démarrée · `[~]` en cours · `[x]` terminée.
Gate commun : tests créés et verts · test manuel de la phase · doc à jour · aucun écran ne perd son point d'entrée · critère de sortie.

## Ordre & dépendances

```
V4-0 Refacto préalable ──► V4-1 (accent), V4-2 (span créneaux)
V4-1 Quick wins UI (B1, D1, D2)      dépend de V4-0 (R2)
V4-2 Tâche multi-créneaux (E2)       dépend de V4-0 (R1)
V4-3 Déplacement tactile (E1)        après V4-2 (même fichier, éviter le churn)
```

E1 et E2 sont techniquement indépendants mais touchent tous deux `E40Planning.tsx` : E2 avant E1 pour ne pas réécrire deux fois la logique de créneaux.

---

## Phase V4-0 — Refacto préalable

> Basculer sur le modèle Opus (/model opus) avant de démarrer cette phase.

Aucun changement de comportement visible.

- [ ] R1 — Helper de plage de créneaux `taskSlotRange(task)` (start/end → indices de slots) + rendu d'occupation par plage dans `E40Planning.tsx` (aujourd'hui toute tâche occupe 1 créneau → rendu identique) — prépare E2
- [ ] R2 — Variable d'accent d'ambiance `--color-accent` (défaut `= --color-primary`, alimentée par `Settings.ambiance_color` via `ambiance.ts`/injection racine) sans changer l'apparence des boutons — prépare B1

Gate : [ ] tests verts · [ ] test manuel · [ ] doc · [ ] sortie : `tsc -b` clean, planning et boutons visuellement identiques à la V3

---

## Phase V4-1 — Quick wins UI (B1, D1, D2)

- [ ] B1 — Boutons « Ajouter une tâche » et « Nouvelle liste » suivent la couleur d'ambiance via `--color-accent` (`ui/components/Button.tsx`, `BottomNav.tsx`, `E60Lists.tsx`)
- [ ] D1 — Libellé « Todo » → « To Do » (`BottomNav.tsx:99`, `E20Inbox.tsx:135`)
- [ ] D2 — Reformuler les libellés du check-in énergie « aujourd'hui » → « maintenant » (`E31EnergyCheckIn.tsx:56,58` ; aligner `E30EnergyView.tsx`, `E03Energy.tsx`, aria-label `energyRules.ts` selon décision Q)

Gate : [ ] tests verts · [ ] test manuel · [ ] doc · [ ] sortie : couleur d'ambiance appliquée aux boutons cités, libellés conformes

---

## Phase V4-2 — Tâche multi-créneaux (E2)

- [ ] E2a — Flux de sélection début→fin à la planification : 1er clic = case de début, 2e clic = case de fin, même case cliquée deux fois = 1 créneau (`E40Planning.tsx`, picker/flux d'assignation)
- [ ] E2b — Écriture de `scheduled_end` sur l'intervalle + détection de conflit sur toute la plage (pas seulement le créneau de début) (`taskRulesV2.ts`, `E40Planning.tsx`)
- [ ] E2c — Rendu : une tâche longue occupe et masque visuellement tous ses créneaux ; coût énergétique compté une seule fois par tâche (vérifier `getRemainingPlannedCost`, `taskRulesV2.ts`)

Gate : [ ] tests verts · [ ] test manuel · [ ] doc · [ ] sortie : une tâche > 30 min occupe visuellement ses créneaux, surcharge inchangée pour un coût donné

---

## Phase V4-3 — Déplacement tactile des tâches (E1)

- [ ] E1a — Interaction appui long + glisser sur une case du planning (pointer events, `E40Planning.tsx`)
- [ ] E1b — Glisser haut/bas → change le créneau le même jour (réutilise `handleMove`) (`E40Planning.tsx`, `AppContext.tsx`)
- [ ] E1c — Glisser gauche/droite → jour précédent/suivant, replanification sur autre date (réutilise la logique de replanification de `postponeTaskV2`) (`taskRulesV2.ts`, `AppContext.tsx`, `E40Planning.tsx`)

Gate : [ ] tests verts · [ ] test manuel · [ ] doc · [ ] sortie : déplacement d'une tâche par glisser dans les 4 directions fonctionnel au doigt sur mobile

---

## Q à trancher

- **B1** : accent d'ambiance sur tous les boutons primaires ou seulement les deux cités — bloque le périmètre de V4-1/R2.
- **D2** : formulation exacte des deux textes — bloque V4-1 (D2).
- **E1** : glisser à gauche autorise-t-il une date passée — bloque V4-3 (E1c).
- **E2** : gestion du chevauchement + comptage du coût (une fois vs. par créneau) — bloque V4-2 (E2b/E2c).
- **Q1** : sort de « Répéter demain » (garder/retirer/remplacer) + idée alternative de Marie non captée — à récupérer à la prochaine visio.

## Reporté hors V4

- E3
