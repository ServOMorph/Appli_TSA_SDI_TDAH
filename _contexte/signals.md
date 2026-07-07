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
- **Phase V3-4 CLOSE (2026-07-07)** : gate intégral (tests 367/367, `tsc -b` clean, eslint 0 erreur, test manuel `plan_test_manuel_v3-4.md` passé intégralement, doc `README.md` à jour).
- Couleur d'ambiance configurable (`Settings.ambiance_color`, sélecteur dans Accessibilité) : pilote la couleur pastel (case placée) et flashy (case terminée) du planning et du dashboard — `src/ui/styles/ambiance.ts` (`pastelBackground`/`mutedBackground`/`flashyBackground`, défaut `DEFAULT_AMBIANCE_COLOR`).
- Récurrence (P6) : bouton « Répéter demain » sur chaque tâche planifiée (Planning + Dashboard), duplique la tâche au lendemain même créneau et ouvre directement le jour du duplicata (`planningTargetDate`/`setPlanningTargetDate` dans `AppContext`, consommé puis réinitialisé par `E40Planning.tsx`). Voir action ouverte P2 ci-dessus pour la reconfirmation avec Marie.
- Navigation en surcharge : `BottomNav.tsx` masque intentionnellement Todo/Planning/Listes/Ajouter une tâche (seuls Dashboard et Centre récupération restent accessibles) — confirmé voulu par l'utilisateur, pas un bug.
- `plan_test_manuel_v3-3.md` supprimé (nettoyage, phase close) ; seul `plan_test_manuel_v3-4.md` reste sur le disque parmi les plans V3.
- Serveur de test téléphone (dev V3) : `npm run dev -- --host`, adresse réseau affichée dans le terminal (même Wi-Fi). Bouton "Reset DB" (dev) pour repartir d'une base propre avant test.

## Dernière session (2026-07-07, Phase V3-4 — codée, testée, close)

## Décisions prises
- Phase V3-4 codée intégralement (E7, E8, P1-P4b, D5, P6) : cuillères (`SpoonIcon`/`SpoonCost`), couleur d'ambiance configurable (pastel/flashy), bouton « Terminer » ajouté au Planning, cartes pastel sur « Planning du jour » du Dashboard.
- P6 (récurrence) : l'avance automatique au jour suivant après chaque tâche planifiée a été codée puis **rejetée après test manuel** (elle masquait la tâche qu'on venait de placer, lue comme un bug) — remplacée par un bouton explicite « Répéter demain » qui duplique la tâche au lendemain et ouvre directement ce jour-là (Planning : avance sur place ; Dashboard : navigue vers Planning sur ce jour).
- Phase V3-4 close : gate intégralement validé (test manuel confirmé "tout ok" par l'utilisateur).

## Livrables produits ou modifiés
- `src/ui/components/SpoonIcon.tsx`, `SpoonCost.tsx` : composant cuillères (créés)
- `src/ui/styles/ambiance.ts` : helpers couleur pastel/flashy (créé)
- `src/domain/rules/taskRulesV2.ts` : `duplicateTaskV2ToNextDay`
- `src/app/AppContext.tsx` : `repeatTaskTomorrow`, `planningTargetDate`/`setPlanningTargetDate`
- `src/ui/screens/planning/E40Planning.tsx`, `src/ui/screens/dashboard/E10Dashboard.tsx` : cuillères, pastel/flashy, boutons Terminer + Répéter demain
- `src/ui/screens/settings/E112Accessibility.tsx` : sélecteur couleur d'ambiance
- Tests : `taskRulesV2.test.ts`, `E40Planning.test.tsx`, `E10Dashboard.test.tsx`, `E112Accessibility.test.tsx`, `src/test/testUtils.tsx` — 367/367 verts
- `plan_test_manuel_v3-4.md` : créé (5 sections), passé intégralement le 2026-07-07
- `roadmap_v3.md` : Phase V3-4 close (gate complet)
- `README.md` : état actuel et prochaine étape mis à jour
- `plan_test_manuel_v3-3.md` : supprimé (nettoyage, phase close)

## Hypothèses validées / invalidées
- VALIDE : cuillères, couleur d'ambiance pastel/flashy, bouton Terminer sur le Planning — conformes au test manuel, aucun ajustement nécessaire.
- INVALIDE : avance automatique au jour suivant après chaque tâche planifiée (lecture littérale de la transcription) -> pivot vers bouton explicite « Répéter demain » avec ouverture directe du jour du duplicata.
- EN ATTENTE : confirmation de Marie sur le rythme « 1 clic par jour » du bouton « Répéter demain » (voir action ouverte P2), sur le mécanisme de « Reporter » (V3-3) et sur la fréquence du check-in énergie (V3-3).

## Prochaine étape exacte
Démarrer la Phase V3-5 (Listes) ou V3-6 (nav persistante), indépendantes entre elles — au choix de l'utilisateur en début de prochaine session.

## Question bloquante pour la session suivante
Aucune.
