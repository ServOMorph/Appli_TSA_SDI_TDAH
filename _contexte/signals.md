# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-07)



## Actions ouvertes

### V3 — En cours (branche `v3`, post-visio Marie 2026-07-06)
- [P1|ouvert] Trancher le comportement de l'action « Reporter » sur les tâches non-obligatoires grisées en mode surcharge (E6) — décision explicitement reportée par l'utilisateur en fin de session V3-3
  - fait quand: décision actée avec l'utilisateur, action implémentée, testée
  - réf: `roadmap_v3.md` Phase V3-3, note E6 ; piste « statut todo » écartée (aucun écran ne l'affiche, créerait un orphelin comme B1) ; piste « replanifier au lendemain même créneau » envisagée non actée
- [P3|ouvert] Planification indépendante des sous-tâches (chaque `SubTask` planifiable à son propre horaire) — décision explicitement reportée
  - fait quand: décision produit prise sur l'implémentation (piste retenue si besoin confirmé : chaque sous-tâche devient sa propre `TaskV2` avec `parent_task_id` optionnel)
  - réf: `Archives/roadmap_v2.md` § "Fonctionnalité reportée (décision 2026-07-06)"

## Questions ouvertes

## Échéances

## Blocages
Aucun.

## Contexte chaud
- Phase V3-3 (check-in + surcharge automatique) codée hors action « Reporter » : gate non clos (tests 341/341 verts, `tsc -b` clean, eslint 0 erreur, mais test manuel et doc restants, et l'action « Reporter » non implémentée).
- `overloadMode` (AppContext) est désormais 100% dérivé : `isOverloaded(todayEnergy, getRemainingPlannedCost(todayPlannedTasks))`, recalculé via `refreshTodayPlanned()` après chaque mutation de planning. `Settings.overload_mode`/`setOverloadMode` supprimés du code (champ mort retiré).
- Check-in énergie routé automatiquement à l'ouverture (`init()` → `energy-checkin`) si aucune saisie du jour ; re-saisie libre via bouton "Modifier" (`E30EnergyView.tsx`). Échelle corrigée 1-10 → 1-12 dans `E31EnergyCheckIn.tsx`.
- Effet de bord D1 (mode surcharge sans tâche visible, en attente depuis V3-1) résolu par E6 : "Planning du jour" reste visible en surcharge, obligatoires en pastel / non-obligatoires grisées (`E10Dashboard.tsx`, `E40Planning.tsx` — jour courant uniquement pour le Planning).
- Phase V3-2 (énergie : domaine + saisie) close : gate intégralement validé (tests 342/342, test manuel tous cas OK le 2026-07-07, doc à jour, sortie).
- Phase V3-1 (bugs + nettoyage UI) close : gate intégralement validé (tests 330/330, test manuel 27/27 OK, doc à jour, sortie).
- `dist/v2/` à jour (export corrigé + créneaux 30 min inclus) ; `vite.config.ts` fixe `build.outDir: 'dist/v2'` — reste sur la branche `v2`.
- Serveur de test téléphone (dev V3) : `npm run dev -- --host`, adresse réseau affichée dans le terminal (même Wi-Fi). Bouton "Reset DB" (dev) pour repartir d'une base propre avant test.

## Dernière session (2026-07-07, close V3-3)

## Décisions prises
- E4 : re-saisie de l'énergie autorisée à tout moment dans la journée (bouton "Modifier" existant conservé).
- E5 : surcharge entièrement automatique (`isOverloaded` sur énergie vs coût planifié restant) — `overload_mode`/`setOverloadMode` supprimés, plus de toggle manuel.
- E5 : bouton TopBar devient informatif (grisé/non cliquable si inactif, coloré/cliquable pour afficher le détail chiffré si actif).
- E6 : "Planning du jour" reste visible en surcharge (Dashboard + jour courant du Planning), obligatoires en pastel, non-obligatoires grisées — résout l'effet de bord D1/P2 en attente depuis V3-1.
- Action "Reporter" (E6) : décision explicitement reportée à la demande de l'utilisateur, à trancher en session suivante.

## Livrables produits ou modifiés
- `src/app/AppContext.tsx` : `overloadMode` dérivé (`todayPlannedTasks` + `refreshTodayPlanned`), `init()` route vers `energy-checkin` si pas de saisie du jour, `setOverloadMode`/`overload_mode` retirés
- `src/domain/entities/settings.ts` : champ `overload_mode` retiré (mort)
- `src/ui/components/TopBar.tsx` : bouton surcharge informatif (détail chiffré au clic)
- `src/ui/components/BottomNav.tsx` : bouton "Sortir du mode surcharge" retiré (devenu invalide)
- `src/ui/screens/dashboard/E10Dashboard.tsx`, `src/ui/screens/planning/E40Planning.tsx` : styles pastel/grisé en surcharge sur les tâches essentielles/non-essentielles
- `src/ui/screens/energy/E31EnergyCheckIn.tsx` : échelle corrigée 1-10 → 1-12
- `src/ui/screens/overload/E90OverloadRecovery.tsx` : bouton "Désactiver" → "Retour au tableau de bord"
- Tests associés mis à jour (`AppContext.test.tsx`, `E10Dashboard.test.tsx`, `E90OverloadRecovery.test.tsx`, `E31EnergyCheckIn.test.tsx`, `testUtils.tsx`, `db.test.ts`, `settingsRepository.test.ts`, `E112Accessibility.test.tsx`)
- `roadmap_v3.md` : Phase V3-3 cochée (E4, E5, E6 visuel) hors action "Reporter", test manuel et doc
- 341/341 tests unitaires, `tsc -b` clean, `eslint` 0 erreur

## Hypothèses validées / invalidées
- VALIDE : le statut `todo` de `TaskV2` n'est affiché nulle part dans l'UI — y renvoyer une tâche créerait un orphelin (même classe de bug que B1) ; écarté comme piste pour "Reporter".
- EN ATTENTE : test manuel utilisateur de la Phase V3-3 pas encore passé.
- EN ATTENTE : décision sur le comportement de l'action "Reporter" en surcharge.

## Prochaine étape exacte
Trancher le comportement de l'action "Reporter" (E6) avec l'utilisateur, l'implémenter, puis passer le test manuel de la Phase V3-3 pour clore le gate.

## Question bloquante pour la session suivante
Aucune (point à trancher identifié, pas bloquant pour démarrer la discussion).
