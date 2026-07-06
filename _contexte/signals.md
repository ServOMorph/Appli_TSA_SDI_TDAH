# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-06)

## Actions ouvertes

### Phase 7 — Tests utilisateurs (1/5–10 sessions)
- [P2|ouvert] Sessions test 2 à 5+ avec Marie et autres testeurs AuDHD
  - fait quand: 5 à 10 sessions réalisées, retours consolidés dans fichier dédié
  - réf: `Note de réunion/2026-06-29/synthese_reunion_marie_2026-06-29.md` + `Note de réunion/2026-06-29/analyse_conduite_visio_marie.md`

### V2 — En cours
- [P1|ouvert] Phase V2-10 (Consolidation V2 & 2e vague de tests) — EN COURS
  - Décisions profil/énergie traitées, e2e relancés (45/45), export JSON corrigé et testé, créneaux Planning en demi-heure faits, `dist/v2/` à jour. Reste : mode offline (13.2), doc V2, déploiement Netlify, sessions test 2-5.
  - fait quand: mode offline retesté, doc V2 rédigée, déployé sur Netlify, 5-10 sessions test réalisées
  - réf: `roadmap_v2.md` Phase V2-10 et § "Constats test manuel V2-10 (session 2026-07-06)"
- [P2|ouvert] Décision produit énergie : usage réel de l'énergie dans l'appli (actuellement affichage seul, une valeur/jour écrasée, sans autre effet dans l'app) — question remontée à Marie pour la prochaine réunion, décision en attente de son retour
  - fait quand: retour de Marie obtenu et décision actée (implémentée si nécessaire)
  - réf: `Note de réunion/a traiter prochaine reunion.txt`
- [P3|ouvert] Planification indépendante des sous-tâches (chaque `SubTask` planifiable à son propre horaire) — décision explicitement reportée
  - fait quand: décision produit prise sur l'implémentation (piste retenue si besoin confirmé : chaque sous-tâche devient sa propre `TaskV2` avec `parent_task_id` optionnel)
  - réf: `roadmap_v2.md` § "Fonctionnalité reportée (décision 2026-07-06)"
- [P2|ouvert] Ajouter un champ nom de profil à l'onboarding (`E02Profile` : choix de type de profil seulement, aucune saisie de nom)
  - fait quand: décision produit prise (implémenter ou explicitement abandonner)
  - réf: `roadmap_v2.md` § "Constats test manuel V2-10" sous-section "Fonctionnalités manquantes / à implémenter"
- [P2|ouvert] Points à (re)tester avant déploiement, restants : mode offline (test manuel 13.2). Export iOS (11.5) validé ; bug export JSON incomplet (tables V2 manquantes) trouvé et corrigé le 2026-07-06.
  - fait quand: chaque point retesté et résultat consigné dans `plan_test_manuel_v2.md`
  - réf: `roadmap_v2.md` § "À (re)tester avant déploiement"
- [P3|ouvert] Trou fonctionnel TaskV2 : aucune interaction UI pour toggle `essential` une tâche planifiée (le "Terminer" ajouté session précédente couvre la complétion, pas le statut essentiel)
  - fait quand: décision produit prise (implémenter ou explicitement abandonner) sur `toggleEssentialV2` (`src/domain/rules/taskRulesV2.ts`)
  - réf: constat session V2-10 2026-07-01, vérifié dans `E10Dashboard.tsx` et `E40Planning.tsx`

## Questions ouvertes

## Échéances

## Blocages
Aucun.

## Contexte chaud
- Décision profil actée (lecture seule) ; décision énergie remontée à Marie, contexte consigné dans `Note de réunion/a traiter prochaine reunion.txt`
- `dist/v2/` à jour (export corrigé + créneaux 30 min inclus) ; `vite.config.ts` fixe désormais `build.outDir: 'dist/v2'` — `npm run build` régénère directement au bon endroit
- Serveur de test téléphone : `npx vite preview --host --outDir dist/v2`, adresse réseau `http://192.168.1.180:4173` (même Wi-Fi). Penser à vider le cache du site / désinstaller la PWA sur le téléphone après chaque nouveau build (service worker sert l'ancienne version sinon)
- 339/339 tests unitaires, `tsc -b` clean après tous les changements de la session
- `npm run test` sous `--pool=vmThreads --poolOptions.vmThreads.maxThreads=1` fait échouer les tests liés à `crypto.subtle` (faux négatif d'environnement documenté) — utiliser le pool par défaut (`npx vitest run`)

## Dernière session (2026-07-06)

## Décisions prises
- Bug export JSON confirmé et corrigé — `exportData` (AppContext.tsx) omettait les tables V2 (`tasksV2`, `lists`, `listItems`), en contradiction avec la mention RGPD "intégralité de vos données".
- Planning : granularité des créneaux passée d'1h à 30 min (demande utilisateur), durée par défaut à l'assignation ramenée à 30 min.

## Livrables produits ou modifiés
- `src/app/AppContext.tsx` : `exportData` inclut désormais `tasksV2`/`lists`/`listItems`, version export passée à `2.0`
- `src/ui/screens/planning/E40Planning.tsx` + test : 48 créneaux de 30 min (au lieu de 24 d'1h)
- `vite.config.ts` : `build.outDir` fixé à `dist/v2`
- `roadmap_v2.md` : e2e relancés (45/45), export iOS validé, bug export corrigé, créneaux demi-heure faits

## Hypothèses validées / invalidées
- VALIDE : e2e 45/45 après changements onboarding, aucune régression
- VALIDE : export iOS (test manuel 11.5) fonctionne
- INVALIDE : export JSON complet → corrigé (tables V2 manquantes)
- VALIDE : "groseille"/"pasteque" dans le picker Planning n'étaient pas un bug — données de test résiduelles, confirmées absentes après reset de l'app
- EN ATTENTE : mode offline (test manuel 13.2)

## Prochaine étape exacte
Retester le mode offline (13.2), rédiger la doc V2, déployer sur Netlify.

## Question bloquante pour la session suivante
Aucune.
