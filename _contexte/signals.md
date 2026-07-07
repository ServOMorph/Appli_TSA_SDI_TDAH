# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-07)



## Actions ouvertes

### V3 — En cours (branche `v3`)
- [P2|ouvert] Reconfirmer avec Marie le comportement de l'action « Reporter » (E6) — implémenté à titre provisoire (replanification au lendemain, même créneau), non validée par elle sur ce mécanisme précis
  - fait quand: réponse de Marie obtenue et, si besoin, comportement ajusté en conséquence
  - réf: `Note de réunion/a demander a Marie.md` ; `postponeTaskV2` (`taskRulesV2.ts`), `postponeTask` (`AppContext.tsx`)
- [P2|ouvert] Reconfirmer avec Marie la fréquence du check-in énergie (une fois/jour vs à chaque ouverture de l'app) — Marie a dit « à chaque connexion » mais hésite elle-même dans la transcription
  - fait quand: réponse de Marie obtenue, comportement ajusté si besoin (actuellement : une fois par jour calendaire, re-saisie libre via bouton "Modifier")
  - réf: `Note de réunion/a demander a Marie.md` ; `AppContext.tsx` `init()`, `todayDate()`
- [P2|ouvert] Reconfirmer avec Marie le mécanisme de récurrence (P6, « Répéter demain ») — implémenté comme bouton explicite (1 clic = 1 jour dupliqué), écart assumé par rapport à la lecture littérale de la transcription qui décrivait un flux plus rapide (« clac, clac, clac » sur plusieurs jours d'affilée sans clic dédié). Le premier essai (avance automatique de jour après chaque tâche planifiée, sans bouton) a été testé et rejeté (masquait la tâche qu'on venait de placer).
  - fait quand: réponse de Marie obtenue sur si le rythme « 1 clic par jour » lui convient pour les tâches récurrentes, ou si un flux plus rapide est nécessaire
  - réf: `Note de réunion/2026-06-07/input_2026-07-06_2043.txt` l.448-467 ; `duplicateTaskV2ToNextDay` (`taskRulesV2.ts`), `repeatTaskTomorrow` (`AppContext.tsx`)
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
- **Phase V3-5 CLOSE (2026-07-07)** : gate intégral (tests 367/367, `tsc -b` clean, eslint 0 erreur, test manuel `plan_test_manuel_v3-5.md` passé intégralement, doc `README.md` à jour).
- Listes : hiérarchie visuelle entre vue globale (`E60Lists.tsx`, grosses cases, inchangé) et intérieur d'une liste (`E61ListDetail.tsx`, cases fines — padding `--spacing-xs`, radius `--radius-sm`) ; titre de liste encadré du même style que les listes en vue globale (L3).
- Bugs P3 corrigés (hors phase, avant V3-5) : `E03Energy.tsx` (onboarding) passé à l'échelle 1-12 (au lieu de 1-10) ; affichage des valeurs d'énergie sur deux lignes fixes de 6 dans `E03Energy.tsx` et `E31EnergyCheckIn.tsx` (au lieu du `flexWrap` libre).
- Seule Phase V3-6 (nav persistante) reste à coder sur la roadmap V3 — dernière phase.
- Couleur d'ambiance configurable (`Settings.ambiance_color`, sélecteur dans Accessibilité) : pilote la couleur pastel (case placée) et flashy (case terminée) du planning et du dashboard — `src/ui/styles/ambiance.ts` (`pastelBackground`/`mutedBackground`/`flashyBackground`, défaut `DEFAULT_AMBIANCE_COLOR`).
- Navigation en surcharge : `BottomNav.tsx` masque intentionnellement Todo/Planning/Listes/Ajouter une tâche (seuls Dashboard et Centre récupération restent accessibles) — confirmé voulu par l'utilisateur, pas un bug.
- `plan_test_manuel_v3-4.md` supprimé (nettoyage, phase close) ; seul `plan_test_manuel_v3-5.md` reste sur le disque parmi les plans V3.
- Serveur de test téléphone (dev V3) : `npm run dev -- --host`, adresse réseau affichée dans le terminal (même Wi-Fi). Bouton "Reset DB" (dev) pour repartir d'une base propre avant test.

## Dernière session (2026-07-07, bugs P3 corrigés + Phase V3-5 — codée, testée, close)

## Décisions prises
- Bugs P3 corrigés : échelle d'énergie 1-12 dans `E03Energy.tsx` (était 1-10) ; affichage des valeurs d'énergie sur deux lignes fixes de 6 dans `E03Energy.tsx` et `E31EnergyCheckIn.tsx` (était `flexWrap` libre).
- Phase V3-5 (Listes) codée intégralement (L1, L2, L3) : éléments d'une liste resserrés (`E61ListDetail.tsx`, padding `--spacing-xs`, radius `--radius-sm`, après un premier resserrement jugé insuffisant et resserré une seconde fois à la demande de l'utilisateur), vue globale des listes inchangée (`E60Lists.tsx`, grosses cases), titre de liste encadré du même style que les lignes de la vue globale.
- Phase V3-5 close : gate intégralement validé (test manuel confirmé "ok" par l'utilisateur).

## Livrables produits ou modifiés
- `src/ui/screens/onboarding/E03Energy.tsx` : échelle 1-12 (`ENERGY_MIN`/`ENERGY_MAX`), affichage sur deux lignes fixes de 6
- `src/ui/screens/energy/E31EnergyCheckIn.tsx` : affichage sur deux lignes fixes de 6
- `src/ui/screens/lists/E61ListDetail.tsx` : éléments resserrés (padding `--spacing-xs`, radius `--radius-sm`), titre encadré (padding `--spacing-md`, border, radius `--radius-md`)
- Tests : 367/367 verts (aucun test nouveau, changements purement visuels/CSS)
- `plan_test_manuel_v3-5.md` : créé (3 sections), passé intégralement le 2026-07-07
- `roadmap_v3.md` : items P3 (Notes diverses) clos ; Phase V3-5 close (gate complet)
- `README.md` : état actuel et prochaine étape mis à jour (V3-6 seule restante)
- `plan_test_manuel_v3-4.md` : supprimé (nettoyage, phase close)

## Hypothèses validées / invalidées
- VALIDE : échelle d'énergie 1-12 et affichage deux lignes (`E03Energy.tsx`, `E31EnergyCheckIn.tsx`) — conformes au test manuel.
- VALIDE : hiérarchie visuelle Listes (grosses cases vs cases fines, titre encadré) — conforme au test manuel, aucun ajustement supplémentaire demandé après le second resserrement.
- EN ATTENTE : confirmation de Marie sur le mécanisme de « Reporter », la fréquence du check-in énergie, et le rythme du bouton « Répéter demain » (inchangé depuis V3-3/V3-4).

## Prochaine étape exacte
Démarrer la Phase V3-6 (nav persistante, N1) — dernière phase de la roadmap V3 : `BottomNav` persistant sur tous les écrans, onglet actif mis en valeur, vérifier qu'aucun écran ne perd son point d'entrée.

## Question bloquante pour la session suivante
Aucune.
