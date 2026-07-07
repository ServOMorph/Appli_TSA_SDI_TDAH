# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-07)



## Actions ouvertes

### V3 — En cours (branche `v3`)
- [P2|ouvert] Reconfirmer avec Marie le comportement de l'action « Reporter » (E6) — implémenté à titre provisoire (replanification au lendemain, même créneau), non validée par elle sur ce mécanisme précis
  - fait quand: réponse de Marie obtenue et, si besoin, comportement ajusté en conséquence
  - réf: `Note de réunion/a demander a Marie.md` ; `postponeTaskV2` (`taskRulesV2.ts`), `postponeTask` (`AppContext.tsx`)
- [P2|ouvert] Reconfirmer avec Marie la fréquence du check-in énergie (une fois/jour vs à chaque ouverture de l'app) — Marie a dit « à chaque connexion » mais hésite elle-même dans la transcription
  - fait quand: réponse de Marie obtenue, comportement ajusté si besoin (actuellement : une fois par jour calendaire, re-saisie libre via bouton "Modifier")
  - réf: `Note de réunion/a demander a Marie.md` ; `AppContext.tsx` `init()`, `todayDate()`
- [P3|ouvert] Bug mineur : `E03Energy.tsx` (onboarding) utilise encore une échelle d'énergie 1-10 au lieu de 1-12 (contrairement à `E31EnergyCheckIn.tsx` déjà corrigé)
  - fait quand: `SPOON_OPTIONS` remplacé par `ENERGY_MIN`/`ENERGY_MAX` (`energyRules.ts`) dans `E03Energy.tsx`
  - réf: `roadmap_v3.md` § Notes diverses
- [P3|ouvert] Afficher les valeurs d'énergie (1-12) sur deux lignes fixes de 6 (1-6 puis 7-12) au lieu du `flexWrap` actuel
  - fait quand: mise en page appliquée dans `E31EnergyCheckIn.tsx` et `E03Energy.tsx`
  - réf: `roadmap_v3.md` § Notes diverses
- [P3|ouvert] Décider s'il faut supprimer le bouton « Mode surcharge désactivé » de la TopBar hors surcharge — **attention, contredit la demande explicite de Marie** (elle voulait ce bouton visible, grisé, informatif hors surcharge)
  - fait quand: décision actée avec Marie ou assumée explicitement comme écart
  - réf: `roadmap_v3.md` § Notes diverses ; `TopBar.tsx`
- [P3|ouvert] Planification indépendante des sous-tâches (chaque `SubTask` planifiable à son propre horaire) — décision explicitement reportée
  - fait quand: décision produit prise sur l'implémentation (piste retenue si besoin confirmé : chaque sous-tâche devient sa propre `TaskV2` avec `parent_task_id` optionnel)
  - réf: `Archives/roadmap_v2.md` § "Fonctionnalité reportée (décision 2026-07-06)"

## Questions ouvertes

## Échéances

## Blocages
Aucun.

## Contexte chaud
- **Phase V3-3 CLOSE (2026-07-07)** : gate intégral (tests 353/353, `tsc -b` clean, eslint 0 erreur, test manuel `plan_test_manuel_v3-3.md` passé intégralement, doc `README.md` à jour).
- Action « Reporter » (E6) : implémentée comme replanification automatique au lendemain, même créneau (`postponeTaskV2`/`postponeTask`), bouton visible sur tâches non-obligatoires du jour, non terminées, en surcharge — **décision provisoire**, voir actions ouvertes.
- Navigation en surcharge : `BottomNav.tsx` masque intentionnellement Todo/Planning/Listes/Ajouter une tâche (seuls Dashboard et Centre récupération restent accessibles) — confirmé voulu par l'utilisateur en test manuel, pas un bug (une hypothèse de bug avait été soulevée à tort avant vérification).
- `overloadMode` (AppContext) 100% dérivé : `isOverloaded(todayEnergy, getRemainingPlannedCost(todayPlannedTasks))`, recalculé via `refreshTodayPlanned()` après chaque mutation de planning. Mathématiquement, la surcharge ne peut jamais s'activer sans au moins une tâche planifiée coûteuse (coût 0 ne peut pas dépasser une énergie ≥ 1).
- Check-in énergie routé automatiquement à l'ouverture (`init()` → `energy-checkin`) si aucune entrée pour la date du jour — y compris si l'entrée du jour est seulement "ignorée" (skip), le check-in ne se redemande pas avant le lendemain.
- `dev_fake_date` (localStorage, bouton dev rouge "Reset DB") permet de simuler une autre date pour retester le check-in sans reset complet de la base.
- `plan_test_manuel_v3-1.md` et `plan_test_manuel_v3-2.md` supprimés (nettoyage intentionnel, confirmé par l'utilisateur) ; seul `plan_test_manuel_v3-3.md` reste sur le disque parmi les plans V3.
- `dist/v2/` à jour (export corrigé + créneaux 30 min inclus) ; `vite.config.ts` fixe `build.outDir: 'dist/v2'` — reste sur la branche `v2`.
- Serveur de test téléphone (dev V3) : `npm run dev -- --host`, adresse réseau affichée dans le terminal (même Wi-Fi). Bouton "Reset DB" (dev) pour repartir d'une base propre avant test.

## Dernière session (2026-07-07, close V3-3 suite — clôture de phase)

## Décisions prises
- Action « Reporter » (E6) implémentée : replanification automatique au lendemain, même créneau horaire — seule piste ne créant ni nouveau statut ni orphelin ; provisoire, à reconfirmer avec Marie.
- Fréquence du check-in énergie maintenue à une fois par jour (pas à chaque ouverture) — écart assumé avec la demande littérale de Marie, pour limiter la charge mentale ; à reconfirmer avec elle.
- Navigation restreinte (Todo/Planning/Listes masqués) en mode surcharge : confirmée intentionnelle par l'utilisateur après vérification — pas un bug.
- Phase V3-3 close : gate intégralement validé.

## Livrables produits ou modifiés
- `src/domain/rules/taskRulesV2.ts` : `postponeTaskV2` (+ helper `addOneDay`)
- `src/app/AppContext.tsx` : `postponeTask`
- `src/ui/screens/dashboard/E10Dashboard.tsx`, `src/ui/screens/planning/E40Planning.tsx` : bouton « Reporter »
- Tests : `taskRulesV2.test.ts`, `AppContext.test.tsx`, `E10Dashboard.test.tsx`, `E40Planning.test.tsx`, `src/test/testUtils.tsx` — 353/353 verts
- `plan_test_manuel_v3-3.md` : créé (5 sections), passé intégralement le 2026-07-07
- `roadmap_v3.md` : Phase V3-3 close (gate complet) ; notes ajoutées (bouton surcharge à discuter, échelle énergie onboarding, affichage 2x6)
- `README.md` : état actuel et prochaine étape mis à jour
- `Note de réunion/a demander a Marie.md` : créé, 2 questions consignées (Reporter, fréquence check-in)
- `plan_test_manuel_v3-1.md`, `plan_test_manuel_v3-2.md` : supprimés (nettoyage intentionnel)

## Hypothèses validées / invalidées
- VALIDE : navigation restreinte en surcharge est un choix intentionnel de l'utilisateur, pas un bug.
- INVALIDE : hypothèse initiale que ce masquage de nav violait le gate "aucun écran ne perd son point d'entrée" -> pivot vers "comportement voulu", roadmap et plan de test corrigés en conséquence.
- EN ATTENTE : confirmation de Marie sur le mécanisme de « Reporter » et sur la fréquence du check-in énergie.

## Prochaine étape exacte
Démarrer la Phase V3-4 (cuillères, couleurs, récurrence planning) ou V3-5 (Listes), indépendantes de V3-3 — au choix de l'utilisateur en début de prochaine session.

## Question bloquante pour la session suivante
Aucune.
