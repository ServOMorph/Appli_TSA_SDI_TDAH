# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-07-30)

## Questions ouvertes
- [P1] Valider manuellement la Phase V5-1 sur appareil tactile (points 101 à 109 de `tests_manuels.md`), puis démarrer la Phase V5-2 (planning et tâches refondus) de `roadmap_v5.0.md`. — fait quand : points 101-109 validés par l'utilisateur, `tests_manuels.md` purgé, Phase V5-1 passée à `[FAIT]` — réf : `roadmap_v5.0.md` Phase V5-1, `tests_manuels.md`
- [P2] Corriger `exportData()` (`useSettingsState.ts:66`) qui lit `db.energyEntries.toArray()` brut au lieu de passer par `EnergyEntryRepository` — `energy_entries[].value` sort non déchiffré si `local_encryption` est activé. — fait quand : `exportData` passe par le repository, export vérifié avec chiffrement activé — réf : `roadmap_v5.0.md` § Bugs constatés
- [P2] Communiquer à Marie les points de `a_communiquer_v5.md` **au moment de la livraison de la V5.0 complète** (pas avant), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `Archives/roadmap_v4.1.md` § Q à trancher
- [P2] Recueillir le retour utilisateur sur le rendu visuel réel du Budget (refonte de lisibilité, session 2026-07-25) — le Budget est rebranché tel quel comme outil en Phase V5-3, Marie ne l'a toujours pas vu. — fait quand : retour utilisateur recueilli — réf : `roadmap_v5.0.md` Phase V5-3, `E71Budget.tsx`
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`

## Dernière session (2026-07-30 (suite) — Phase V5-1 codée et testée, validation manuelle en attente)

## Décisions prises
- Phase V5-1 codée intégralement sous Opus : nav basse ramenée à 4 éléments (Boîte de réception, Accueil, Paramètres, +), `E40Planning` absorbé par `E10Dashboard` (écran unique à deux états, replié/déplié), énergie planifiée/disponible affichée côte à côte, pastille de surcharge cliquable vers le centre de récupération.
- Absorption complète de la route `planning` dans l'accueil fusionné plutôt que de garder un écran séparé (arbitré avec l'utilisateur avant codage) : `E40Planning.tsx` supprimé, son corps extrait dans `PlanningBoard.tsx`.
- Glisser-déposer du planning (~250 lignes, prévu supprimé en V5-2 par `Q10`) retiré par anticipation pendant la fusion plutôt que porté puis supprimé à la phase suivante (arbitré avec l'utilisateur).
- Zone de widgets accueil dotée de deux entrées provisoires « Outils »/« Listes » (arbitré avec l'utilisateur) : sans elles, le retrait des onglets rendait `tools`/`budget`/`lists`/`list-detail` inatteignables et violait le gate de la phase.
- Défaut trouvé en e2e et corrigé au fil de la session : la poignée de dépliement placée sous le planning était recouverte par la bannière de planification et la nav (toutes deux fixes) ; déplacée au-dessus du planning en état déplié.
- Phase V5-1 reste `[EN COURS]` dans `roadmap_v5.0.md` : codée et testée automatiquement, mais gate non atteint faute de validation manuelle sur appareil tactile.

## Livrables produits ou modifiés
- `src/ui/screens/dashboard/PlanningBoard.tsx` + test (créés, 37 tests) : corps de l'ex-`E40Planning`, sans drag, piloté par un état `collapsed`.
- `visibleSlotWindow()` (`planningSlotRules.ts`, 4 tests) et `getEnergyPairLabel()` (`energyRules.ts`, 4 tests) : nouvelles règles pures.
- `src/ui/screens/dashboard/E10Dashboard.tsx` : écran unique à deux états (replié/déplié), poignée, zone widgets provisoire.
- `src/ui/components/BottomNav.tsx` : 4 éléments au lieu de 5, pastille déplacée sur Réception.
- `src/App.tsx` : route `planning` → accueil déplié ; `activeTabFor` simplifié.
- `src/ui/components/EnergyDisplay.tsx`, `src/ui/components/TopBar.tsx` : énergie double, pastille de surcharge cliquable.
- `src/ui/screens/planning/` (`E40Planning.tsx` + test) : supprimé.
- `vite.config.ts` : `outDir` `dist/v4.1` → `dist/v5.0`.
- `e2e/03-energy.spec.ts`, `e2e/04-settings.spec.ts`, `e2e/05-overload.spec.ts`, `e2e/07-planning-v4.spec.ts` : sélecteurs adaptés à la nouvelle nav et à la fusion ; T44 réaffecté à la pastille de surcharge.
- `tests_manuels.md` : 9 points ajoutés (101 à 109), à valider sur appareil tactile.
- `roadmap_v5.0.md` : Phase V5-1 → `[EN COURS]` (codée, gate technique atteint, validation manuelle en attente), arbitrages tracés.
- `CHANGELOG.md` : entrée `v5.2` ajoutée.

## Hypothèses validées / invalidées
- VALIDE : la fusion accueil/planning est strictement fonctionnelle côté automatisé — 514/515 tests unitaires (flaky pré-existant `AppContext.test.tsx` confirmé identique sur le code d'avant V5-1 via `git stash`, 3 runs), 53/53 e2e sur un build régénéré, `tsc -b`/lint/build clean.
- INVALIDE : le premier run e2e « 53/53 vert » de la session ne prouvait rien — le serveur `preview` servait un `dist/` figé sur l'ancien code (résidu `outDir: dist/v4.1`), masquant les régressions de nav. Pivot : rebuild systématique avant tout run e2e après un changement de nav/écran.
- EN ATTENTE : validation manuelle tactile de la Phase V5-1 (P1 ci-dessus).

## Prochaine étape exacte
Demander `/compact`, puis faire valider par l'utilisateur les points 101 à 109 de `tests_manuels.md` sur appareil tactile avant de démarrer la Phase V5-2.

## Question bloquante pour la session suivante
Aucune.
