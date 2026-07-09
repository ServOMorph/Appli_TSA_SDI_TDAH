# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-09)



## Actions ouvertes

### V3 — Roadmap close (branche `v3`), reste à valider avec Marie
- [P2|ouvert] Reconfirmer avec Marie le comportement de l'action « Reporter » (E6) — implémenté à titre provisoire (replanification au lendemain, même créneau), non validée par elle sur ce mécanisme précis
  - fait quand: réponse de Marie obtenue et, si besoin, comportement ajusté en conséquence
  - réf: `Note de réunion/a demander a Marie.md` ; `postponeTaskV2` (`taskRulesV2.ts`), `postponeTask` (`AppContext.tsx`)
- [P2|ouvert] Reconfirmer avec Marie la fréquence du check-in énergie (une fois/jour vs à chaque ouverture de l'app) — Marie a dit « à chaque connexion » mais hésite elle-même dans la transcription
  - fait quand: réponse de Marie obtenue, comportement ajusté si besoin (actuellement : une fois par jour calendaire, re-saisie libre via bouton "Modifier")
  - réf: `Note de réunion/a demander a Marie.md` ; `AppContext.tsx` `init()`, `todayDate()`
- [P2|ouvert] Reconfirmer avec Marie le mécanisme de récurrence (P6, « Répéter demain ») — implémenté comme bouton explicite (1 clic = 1 jour dupliqué), écart assumé par rapport à la lecture littérale de la transcription qui décrivait un flux plus rapide (« clac, clac, clac » sur plusieurs jours d'affilée sans clic dédié). Le premier essai (avance automatique de jour après chaque tâche planifiée, sans bouton) a été testé et rejeté (masquait la tâche qu'on venait de placer).
  - fait quand: réponse de Marie obtenue sur si le rythme « 1 clic par jour » lui convient pour les tâches récurrentes, ou si un flux plus rapide est nécessaire
  - réf: `Note de réunion/2026-06-07/input_2026-07-06_2043.txt` l.448-467 ; `duplicateTaskV2ToNextDay` (`taskRulesV2.ts`), `repeatTaskTomorrow` (`AppContext.tsx`)
- [P2|ouvert] Reconfirmer avec Marie le masquage du bouton « Mode surcharge » hors surcharge (`TopBar.tsx`) — retiré le 2026-07-07 sur demande de l'utilisateur, **contredit la demande explicite antérieure de Marie** (bouton visible, grisé, informatif hors surcharge)
  - fait quand: décision actée avec Marie (masquage confirmé ou bouton informatif réintroduit)
  - réf: `Note de réunion/a demander a Marie.md` ; `TopBar.tsx`
- [P3|ouvert] Planification indépendante des sous-tâches (chaque `SubTask` planifiable à son propre horaire) — décision explicitement reportée
  - fait quand: décision produit prise sur l'implémentation (piste retenue si besoin confirmé : chaque sous-tâche devient sa propre `TaskV2` avec `parent_task_id` optionnel)
  - réf: `Archives/roadmap_v2.md` § "Fonctionnalité reportée (décision 2026-07-06)"
- [P2|ouvert] Finaliser V2-10 (branche `v2`) : doc V2, déploiement Netlify — resté en suspens pendant tout le développement V3. Test 13.2 (mode offline) validé le 2026-07-09 sur `dist/v3`.
  - fait quand: doc V2 à jour, déploiement Netlify effectué
  - réf: `Archives/roadmap_v2.md`

### Tests e2e
Aucune action ouverte. 44/44 tests e2e verts.

## Questions ouvertes

## Échéances

## Blocages
Aucun.

## Contexte chaud
- **Roadmap V3 intégralement close (2026-07-07)** : 7 phases (V3-0 à V3-6) closes, gate complet sur chacune. Reste uniquement la validation par Marie de 4 mécanismes implémentés à titre provisoire (Reporter, fréquence check-in, rythme récurrence, masquage bouton surcharge — voir Actions ouvertes).
- **Modale de planification (E40Planning.tsx) refaite en flux 3 étapes (2026-07-09)** : (1) nom de la tâche + bouton Valider, (2) grille de sélection d'énergie 1-12 (façon capture d'écran fournie par l'utilisateur) avec option « Passer », (3) choix « Obligatoire ? » via deux boutons Oui/Non qui finalisent directement l'action (plus de bouton de validation séparé sur cette étape). `handleConfirmPending`/`handleCreateAndAssign` acceptent désormais `essentialValue` en paramètre explicite pour éviter un state stale au clic direct.
- **`vite.config.ts` `build.outDir` basculé de `dist/v2` à `dist/v3` (2026-07-09)** — évite d'écraser le build V2 archivé (rollback). `dist/v3/` ajouté au `.gitignore` (régénérable via `npm run build`, même traitement que `dist/v2`).
- Icône batterie ajoutée au pill énergie du Dashboard/TopBar (`EnergyDisplay.tsx`, 2026-07-09) — affichée uniquement quand une valeur d'énergie est saisie (`status === 'filled'`).
- Symbole d'énergie : cuillères (`SpoonIcon`/`SpoonCost`) remplacées par une icône batterie (`BatteryIcon`/`BatteryCost`, `src/ui/components/`) — moins connotée spoon theory. Câblée sur le Dashboard, le Planning, et affichée en plus sur les 3 écrans de check énergie.
- Titre du Dashboard renommé "Appli pour AuDHD" → "AuDHD" (`E10Dashboard.tsx`).
- Planning (`E40Planning.tsx`) : hauteur des créneaux (`slotRowStyle`) ne repose plus sur un `minHeight` fixe de 64px — espace haut/bas symétrique autour de chaque case, créneaux vides alignés via placeholder invisible.
- Nav persistante (Phase V3-6) : `BottomNav` monté une seule fois dans `App.tsx` (position fixe), affiché sur tous les écrans sauf onboarding et check-in énergie. **BottomNav rend une nav vide quand `overloadMode` est actif** — piège pour les tests e2e (naviguer via un bouton d'écran plutôt que la nav du bas pendant une surcharge).
- Couleur d'ambiance configurable (`Settings.ambiance_color`, Accessibilité) — pilote couleur pastel/flashy du planning et du dashboard.
- Navigation en surcharge : `BottomNav.tsx` masque intentionnellement Todo/Planning/Listes/Ajouter une tâche — confirmé voulu, pas un bug.
- **Mode surcharge 100% automatique depuis V3-3** : plus de toggle manuel. Déclenchement via coût énergétique planifié dépassant l'énergie du jour restante.
- Tests e2e Playwright (`e2e/`) : 44/44 verts.
- Serveur de test téléphone (dev V3) : `npm run dev -- --host`, adresse réseau affichée dans le terminal. Bouton "Reset DB" (dev) pour repartir d'une base propre avant test.

## Dernière session (2026-07-09)

## Décisions prises
- T19 (`e2e/02-tasks.spec.ts`) supprimé — feature intentionnellement retirée en V3-1, confirmé non-régression. 44/44 tests e2e verts.
- `vite.config.ts` : `outDir` basculé de `dist/v2` à `dist/v3` avant tout build V3, pour préserver le rollback V2.
- `roadmap_v3.md` : Q3 (couleur à la connexion) et « reset données » cochés — déjà tranchés en amont (couleur d'ambiance dans Accessibilité ; Marie accepte le reset de ses données V2 à l'usage de V3), roadmap seulement pas mise à jour jusqu'ici.
- Test manuel 13.2 (mode offline) validé sur le build `dist/v3` généré en session — coché dans `Archives/roadmap_v2.md`.
- Icône batterie ajoutée au pill énergie (`EnergyDisplay.tsx`) sur demande utilisateur (capture d'écran).
- Modale de planification (E1/E2, `E40Planning.tsx`) refondue en flux 3 étapes séquentielles (nom → énergie → obligatoire), sur demande explicite de l'utilisateur ; étape obligatoire simplifiée en 2 boutons Oui/Non à finalisation directe (itération suite à un premier retour).
- Build `dist/v3` régénéré deux fois (avant et après la refonte de la modale).

## Livrables produits ou modifiés
- `e2e/02-tasks.spec.ts` : T19 supprimé
- `vite.config.ts` : `outDir: 'dist/v3'`
- `roadmap_v3.md` : Q3 et reset données cochés
- `Archives/roadmap_v2.md` : test manuel 13.2 coché
- `src/ui/components/EnergyDisplay.tsx` : icône batterie ajoutée
- `src/ui/screens/planning/E40Planning.tsx`, `E40Planning.test.tsx` : modale 3 étapes (nom/énergie/obligatoire Oui-Non)
- `.gitignore` : `dist/v3/` et artefacts Playwright (`e2e/playwright-report/`, `e2e/screenshots/`, `e2e/test-results/`) ignorés
- `dist/v3/` : build de production généré

## Hypothèses validées / invalidées
- VALIDE : nouveau flux de modale (3 étapes) sans régression — 29/29 tests `E40Planning.test.tsx`, 44/44 e2e, `tsc -b` clean.
- VALIDE : mode offline fonctionnel sur le build `dist/v3` (test manuel utilisateur direct).

## Prochaine étape exacte
Session test avec Marie sur les 4 points provisoires (Reporter, check-in, récurrence, bouton surcharge), ou reprise de V2-10 (doc V2 + déploiement Netlify) sur la branche `v2`.

## Question bloquante pour la session suivante
Aucune.
