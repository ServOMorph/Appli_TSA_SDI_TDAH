# Roadmap — V3 (post-visio Marie 2026-07-06)

Version : 3.0 — créée 2026-07-06. Succède à `roadmap_v2.md` (V2-10 close).
Source : `constats_2026-07-06.md` (dossier `Note de réunion/2026-06-07/`). Les IDs (B1, E1, D3…) renvoient à ce fichier. Ne couvre que les évolutions issues de cette visio.

Légende : `[ ]` non démarrée · `[~]` en cours · `[x]` terminée.
Gate commun : tests créés et verts · test manuel de la phase · doc à jour · aucun écran ne perd son point d'entrée · critère de sortie.

## Ordre & dépendances

```
V3-0 Refacto ──────────► toutes les phases
V3-1 Bugs + nettoyage UI      indépendant
V3-2 Énergie domaine + saisie ──► V3-3, V3-4
V3-3 Check-in + surcharge auto    dépend de V3-2
V3-4 Planning : cuillères, couleurs, récurrence   dépend de V3-2
V3-5 Listes                   indépendant
V3-6 Nav persistante (N1)     en dernier
```

- V3-1 avant la chaîne énergie : corrige B1 (état fantôme) avant que les phases suivantes manipulent le planning.
- V3-6 en dernier : transversal (touche tous les écrans), à faire une fois les écrans stabilisés.

---

## Phase V3-0 — Refacto préalable

> Basculer sur le modèle Opus (/model opus) avant de démarrer cette phase.

Aucun changement de comportement visible.

- [x] R1 — Constantes d'échelle d'énergie `ENERGY_MIN=1`, `ENERGY_MAX=12` + helper de barème (domaine) — `energyRules.ts` : `isValidEnergyValue`, `getEnergyLabel`
- [x] R2 — Schéma Dexie v3 : `TaskV2.energy_cost?: number | null`, `Settings.ambiance_color?`, `Settings.energy_max?` (`taskV2.ts`, `settings.ts`, `db.ts` version 3)
- [x] R3 — Composant `EnergyDisplay` réutilisable, dé-duplique le rendu énergie (label/aria-label centralisés dans `energyRules.ts`, utilisés par `TopBar` via `EnergyDisplay.tsx`)
- [x] R4 — Extraction `AppShell` (`src/ui/components/AppShell.tsx`) + `BottomNav` (`src/ui/components/BottomNav.tsx`) depuis `E10Dashboard.tsx`, non montés ailleurs (pas persistants)
- [x] R5 — Sélecteur pur `isOverloaded(energyToday, plannedCost)` + tests (`energyRules.ts`), non branché à l'UI

Gate : [x] tests verts (353/353) · [ ] test manuel (à valider par l'utilisateur) · [ ] doc · [x] sortie : `tsc -b` clean, schéma v3 en place, comportement identique V2

---

## Phase V3-1 — Bugs + nettoyage UI

- [x] B1 — Abandonner la planification ne persiste plus de tâche `planned` non schedulée : créer la tâche au moment de l'assignation (`AppContext.tsx`, `E21CreateTaskV2.tsx`, `E40Planning.tsx`) — refonte : la tâche en attente (`pendingPlanTask`) n'est plus écrite en base tant que l'utilisateur n'a pas choisi un créneau (`schedulePendingTask`) ; retour arrière = `clearPendingPlanTask`
- [x] B2 — Cases du planning visibles en mode clair mobile : contraste/bordure (`E40Planning.tsx`) — bordures des créneaux passées de `--color-border` à `--color-text-muted` (contraste insuffisant en clair)
- [x] B3 — Reproduire « ajouter depuis Todo re-propose de faire la tâche » ; corriger si confirmé (`E20Inbox.tsx`, `E21CreateTaskV2.tsx`) — non reproduit : le flux de création propose déjà les 4 destinations (dont Todo) sans imposer « faire la tâche », aucun changement nécessaire
- [x] D1 — Supprimer le bloc « Que faire maintenant ? » (`E10Dashboard.tsx`) — supprimé avec `actionImmediateRules.ts` (devenu mort, seul appelant)
- [x] D2 — Supprimer la question « chose la plus importante » à la connexion (`E04FirstTask.tsx`, `actionImmediateRules.ts`) — écran `E04FirstTask` retiré, `E03Energy` termine directement l'onboarding
- [x] D3 — « Tâche du jour » (renommé) au-dessus, « Planning du jour » en dessous, police agrandie (`E10Dashboard.tsx`)
- [x] D4 — Supprimer le segment de nav « Aujourd'hui » du dashboard, sans remplacement (`E10Dashboard.tsx`, `BottomNav.tsx`)
- [x] D4b — Renommer la destination de création « Aujourd'hui » en « Tâche du jour » (même comportement, statut `today`) (`E21CreateTaskV2.tsx`, `E20Inbox.tsx`, `E22TaskDetail.tsx`)
- [x] P4a — Tâche terminée reste affichée (`E40Planning.tsx`, `E10Dashboard.tsx`) — `getPlannedTasksForDate` n'exclut plus les tâches `completed`
- [x] P5 — Case vide du planning → proposer d'ajouter une tâche directement planifiée à ce créneau (`E40Planning.tsx`)
- [x] Q1 — Supprimer la limite de 3 tâches du jour (garde-fou, modale M04, messages associés) : `E10Dashboard.tsx`, `E20Inbox.tsx`, `E21CreateTaskV2.tsx`, `E22TaskDetail.tsx`, `E24Today.tsx`

Gate : [x] tests verts (330/330) · [x] test manuel (27/27 cas OK, 2026-07-07) · [x] doc · [x] sortie : app nettoyée, planning sans état fantôme

> **Effet de bord D1 :** en mode surcharge, le dashboard n'affichait déjà plus la section « Tâches du jour », mais gardait le bloc « Que faire maintenant ? » comme seule tâche visible (décision du 2026-07-05). En supprimant ce bloc sans condition (D1, demande explicite Marie du 2026-07-06), le mode surcharge n'affiche plus aucune tâche — seuls restent le bandeau d'état et le Centre récupération. Décision reportée : à trancher pendant la Phase V3-3 (travail spécifique sur la surcharge automatique), pas avant.

---

## Phase V3-2 — Énergie : domaine + saisie (E1, E2, E3)

- [x] Helper domaine : coût total planifié restant d'une journée (somme `energy_cost` des `planned` non `completed`) — `getRemainingPlannedCost` (`taskRulesV2.ts`), pur, non branché à l'UI (préparatoire V3-3)
- [x] E3 — Règle de barème personnel : validation 1-12, aucune valeur imposée + tests unitaires purs — réutilise `isValidEnergyValue` (existant, V3-0) via le nouveau setter pur `setEnergyCostV2` (`taskRulesV2.ts`)
- [x] E1/E2 — Fenêtre à deux carrés à la planification : sélecteur d'énergie 1-12 + case « obligatoire » (`E40Planning.tsx`) — implémentée au moment de l'assignation à un créneau (seul point où une tâche `planned` est réellement créée/persistée), pas dans `E21CreateTaskV2.tsx` qui ne fait qu'amorcer le flux (`startPlanTask`)
- [x] E2 — Câbler `essential` via `toggleEssentialV2` existant (ferme le trou fonctionnel V2-10) — `schedulePendingTask` (AppContext) applique `toggleEssentialV2Rule` si la case est cochée
- [x] Affichage minimal du coût/obligatoire sur la tâche planifiée (habillage cuillères en V3-4) — coût affiché en texte (` · {n}`) sur la case du planning et sur « Planning du jour » du dashboard

Gate : [x] tests verts (342/342) · [x] test manuel (2026-07-07, tous cas OK) · [x] doc · [x] sortie : coût et obligatoire saisissables et persistés

---

## Phase V3-3 — Check-in + surcharge automatique (E4, E5, E6)

- [ ] E4 — Router le check-in énergie existant à chaque ouverture, échelle 1-12 (`AppContext.tsx` `init()`, `E31EnergyCheckIn.tsx`) ; pas de re-demande si déjà saisie le jour même (re-saisie autorisée : à décider)
- [ ] E5 — Surcharge dérivée : brancher `isOverloaded()` sur énergie du jour vs coût planifié restant ; retirer l'ancien `overload_mode` manuel (`AppContext.tsx`)
- [ ] E5 — Bouton TopBar informatif : descriptif au clic, case « Désactivé » grisée non activable / « Activé » colorée (`TopBar.tsx`)
- [ ] E6 — En surcharge : non-obligatoires grisées mais visibles avec option « Reporter » ; obligatoires en couleur pastel (`E40Planning.tsx`, `E10Dashboard.tsx`)

Gate : [ ] tests verts · [ ] test manuel : énergie basse + tâches coûteuses → surcharge auto, obligatoires en couleur · [ ] doc · [ ] sortie : surcharge pilotée par l'énergie, plus de toggle manuel

---

## Phase V3-4 — Planning : cuillères, couleurs, récurrence (E7, E8, P1-P4, P6, D5)

- [ ] E7 — Composant cuillères réutilisable, sobre/clean, pas d'étoiles ni style enfantin
- [ ] E8 — Coût d'énergie (cuillères) affiché sur les cases du planning (`E40Planning.tsx`)
- [ ] P1 — Texte des cases plus gros et centré (`E40Planning.tsx`)
- [ ] P2 — Case pastel claire quand une tâche est placée + case « Terminé » (`E40Planning.tsx`)
- [ ] P3 — Couleur pastel configurable (`Settings.ambiance_color`, écran paramètres)
- [ ] P4b — Tâche terminée : même teinte en version flashy (`E40Planning.tsx`)
- [ ] D5 — « Planning du jour » du dashboard en cases pastel comme « Tâche du jour » (`E10Dashboard.tsx`)
- [ ] P6 — Rester dans le planning après validation : re-proposer la même tâche sur clic d'une autre case + passage auto au jour suivant (`E40Planning.tsx`, `AppContext.tsx`)

Gate : [ ] tests verts · [ ] test manuel : planifier → cuillères + pastel, terminer → flashy, changer couleur, poser une récurrence sur plusieurs jours · [ ] doc · [ ] sortie : planning conforme au retour Marie

---

## Phase V3-5 — Listes (L1, L2, L3)

- [ ] L1 — Encadrement des éléments d'une liste plus fin/serré (`E61ListDetail.tsx`)
- [ ] L2 — Différencier « toutes les listes » (grosses cases) vs intérieur d'une liste (cases fines) (`E60Lists.tsx`, `E61ListDetail.tsx`)
- [ ] L3 — Encadrement du titre de liste identique à celui des listes en vue globale (`E61ListDetail.tsx`)

Gate : [ ] tests verts · [ ] test manuel · [ ] doc · [ ] sortie : hiérarchie visuelle des listes lisible

---

## Phase V3-6 — Navigation persistante (N1)

- [ ] N1 — `BottomNav` (extrait en R4) persistant sur tous les écrans, onglet actif mis en valeur, pastille rouge Todo conservée (`App.tsx`, tous les écrans)
- [ ] Vérifier qu'aucun écran ne perd son point d'entrée

Gate : [ ] tests verts · [ ] test manuel : parcourir tous les écrans, nav toujours présente · [ ] doc · [ ] sortie : navigation unifiée façon app native

---

## Notes diverses

- [ ] Titre affiché dans le Dashboard : renommer "Appli pour AuDHD" en "AuDHD" (`E10Dashboard.tsx:204`)

## Q à trancher

- [x] Q2 — TRANCHÉ (transcription l.202-274 + l.383-398) : retirer le segment nav « Aujourd'hui » sans remplacement (Todo/Planning/Listes inchangés) ET renommer l'option de création « Aujourd'hui » en « Tâche du jour » (même statut `today`, cohérence avec la section renommée en D3)
- [x] Q1 — Limite de 3 tâches du jour : TRANCHÉ — supprimer la limite (2026-07-06)
- [ ] Q3 — Choix de couleur à la connexion — à confirmer
- [ ] Reset données — stratégie au bump Dexie v3 (Marie a des données V2) — bloque le déploiement de V3-0

## Reporté hors V3

- N2 (swipe, réserve technique PWA) · N3 (dictée vocale) · E9 (stock de cuillères configurable)

## Sortie V3

- [ ] V3 stable, tests verts, validée par test manuel complet
- [ ] Session test suivante avec Marie sur énergie/surcharge
- [ ] V2 toujours restaurable (stratégie de rollback inchangée)
