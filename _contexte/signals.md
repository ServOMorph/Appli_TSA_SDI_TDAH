# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-06)

## Actions ouvertes

### Phase 7 — Tests utilisateurs (1/5–10 sessions)
- [P2|ouvert] Sessions test 2 à 5+ avec Marie et autres testeurs AuDHD
  - fait quand: 5 à 10 sessions réalisées, retours consolidés dans fichier dédié
  - réf: `Note de réunion/2026-06-29/synthese_reunion_marie_2026-06-29.md` + `Note de réunion/2026-06-29/analyse_conduite_visio_marie.md`

### V2 — En cours
- [P1|ouvert] Phase V2-10 (Consolidation V2 & 2e vague de tests) — EN COURS
  - Décisions profil/énergie traitées (profil tranché, énergie remontée à Marie). Tests manuels 1-7 validés cette session. Reste : relance e2e, build V2, doc V2, déploiement Netlify, sessions test 2-5.
  - fait quand: e2e relancés, doc V2 rédigée, `dist/v2/` régénéré et déployé sur Netlify, 5-10 sessions test réalisées
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
- [P3|ouvert] Planning : gérer les créneaux par demi-heure plutôt que par heure pleine (demande utilisateur 2026-07-06, grille actuelle 24 créneaux d'1h dans `E40Planning.tsx`)
  - fait quand: grille Planning affiche des créneaux de 30 min
  - réf: `roadmap_v2.md` Phase V2-10
- [P2|ouvert] Points à (re)tester avant déploiement, restants après validation des 7 premiers cette session : export iOS (test manuel 11.5), viabilité du JSON exporté, mode offline (test manuel 13.2)
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
- Section "Stimulation cognitive" des Paramètres supprimée intégralement (écran, entrée menu, champ `Settings.stimulation_mode`, CSS `data-stimulation`)
- Branche `v2` active ; tag `v1.0-mvp` posé ; `dist/v1/` versionné pour rollback, `dist/v2/` ignoré Git/régénérable via `npm run build` (toujours périmé, généré le 2026-07-02)
- 339/339 tests unitaires, `tsc -b` clean après tous les changements de la session
- e2e non relancés depuis les changements onboarding du 2026-07-06 (dernière confirmation 45/45 le 2026-07-05) — à revalider avant déploiement
- `npm run test` sous `--pool=vmThreads --poolOptions.vmThreads.maxThreads=1` fait échouer les tests liés à `crypto.subtle` (faux négatif d'environnement documenté) — utiliser le pool par défaut (`npx vitest run`)
- Dossier `Note de réunion/` réorganisé : fichiers de la réunion du 2026-06-29 déplacés dans `Note de réunion/2026-06-29/`

## Dernière session (2026-07-06)

## Décisions prises
- Profil : `E111Profile` reste en lecture seule, aucune modification à implémenter (décision actée).
- Énergie : décision reportée — question consignée pour Marie (`Note de réunion/a traiter prochaine reunion.txt`).
- Section "Stimulation cognitive" des Paramètres supprimée intégralement (code mort retiré, pas seulement masquée).

## Livrables produits ou modifiés
- `Note de réunion/a traiter prochaine reunion.txt` : contexte complet de la question énergie pour Marie
- `roadmap_v2.md` : décisions profil/énergie actées, tests manuels 1 à 7 marqués validés, section stimulation retirée
- `src/ui/screens/settings/E113Stimulation.tsx` + test : supprimés intégralement
- `src/ui/screens/settings/E110Settings.tsx` + test : entrée "Stimulation cognitive" retirée
- `src/App.tsx`, `src/app/AppContext.tsx` : route `settings-stimulation` et champ `Settings.stimulation_mode` retirés
- `src/domain/entities/settings.ts`, `src/index.css` : type `StimulationMode` et CSS `data-stimulation` retirés
- `src/ui/components/DevResetButton.tsx`, `src/ui/screens/resources/E120Resources.tsx` : références résiduelles nettoyées

## Hypothèses validées / invalidées
- VALIDE : 339/339 tests unitaires, `tsc -b` clean après suppression stimulation
- VALIDE : tests manuels 2.4, 2.6, 6.7, 6.10, 7.3, mode sombre, 11.2 — tous passés
- EN ATTENTE : retour de Marie sur l'usage énergie
- EN ATTENTE : e2e non relancés depuis les changements onboarding du 2026-07-06
- EN ATTENTE : build `dist/v2/` toujours périmé (généré le 2026-07-02)

## Prochaine étape exacte
Relancer les e2e, régénérer `dist/v2/`, rédiger doc V2, déployer sur Netlify. Reste à tester avant déploiement : export iOS (11.5), viabilité JSON, mode offline (13.2).

## Question bloquante pour la session suivante
Aucune.
