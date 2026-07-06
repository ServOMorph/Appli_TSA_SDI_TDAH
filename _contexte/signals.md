# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-06)

## Actions ouvertes

### Phase 7 — Tests utilisateurs (1/5–10 sessions)
- [P2|ouvert] Sessions test 2 à 5+ avec Marie et autres testeurs AuDHD
  - fait quand: 5 à 10 sessions réalisées, retours consolidés dans fichier dédié
  - réf: `Note de réunion/synthese_reunion_marie_2026-06-29.md` + `Note de réunion/analyse_conduite_visio_marie.md`

### V2 — En cours
- [P1|ouvert] Phase V2-10 (Consolidation V2 & 2e vague de tests) — EN COURS
  - Tous les bugs confirmés du plan de test manuel sont corrigés et retestés en app réelle (13 points de confirmation validés par l'utilisateur le 2026-07-06). Reste : 2 décisions produit, relance e2e, build V2, doc V2, déploiement Netlify, sessions test 2-5.
  - fait quand: décisions produit tranchées, e2e relancés, doc V2 rédigée, `dist/v2/` régénéré et déployé sur Netlify, 5-10 sessions test réalisées
  - réf: `roadmap_v2.md` Phase V2-10 et § "Constats test manuel V2-10 (session 2026-07-06)"
- [P2|ouvert] Décisions produit restantes : usage réel de l'énergie dans l'appli (actuellement affichage seul, une valeur/jour écrasée, sans autre effet dans l'app — aucune décision prise) ; modification du profil après onboarding (`E111Profile` toujours en lecture seule — décision non prise, seul le bug de libellé a été corrigé)
  - fait quand: décisions actées et implémentées si nécessaire
  - réf: `roadmap_v2.md` § "Constats test manuel V2-10" sous-sections "Décisions produit à prendre" et "Fonctionnalités manquantes / à implémenter"
- [P3|ouvert] Planification indépendante des sous-tâches (chaque `SubTask` planifiable à son propre horaire) — décision explicitement reportée
  - fait quand: décision produit prise sur l'implémentation (piste retenue si besoin confirmé : chaque sous-tâche devient sa propre `TaskV2` avec `parent_task_id` optionnel)
  - réf: `roadmap_v2.md` § "Fonctionnalité reportée (décision 2026-07-06)"
- [P2|ouvert] Ajouter un champ nom de profil à l'onboarding (`E02Profile` : choix de type de profil seulement, aucune saisie de nom)
  - fait quand: décision produit prise (implémenter ou explicitement abandonner)
  - réf: `roadmap_v2.md` § "Constats test manuel V2-10" sous-section "Fonctionnalités manquantes / à implémenter"
- [P3|ouvert] Planning : gérer les créneaux par demi-heure plutôt que par heure pleine (demande utilisateur 2026-07-06, grille actuelle 24 créneaux d'1h dans `E40Planning.tsx`)
  - fait quand: grille Planning affiche des créneaux de 30 min
  - réf: `roadmap_v2.md` Phase V2-10
- [P2|ouvert] Points à (re)tester avant déploiement, non couverts par les 13 tests de cette session : badge X/Y Dashboard, Dashboard vide, scroll Planning à l'heure courante, horaires limites Planning (00h/23h — durée du dernier créneau à vérifier), état vide Aujourd'hui, mode sombre, accessibilité/stimulation, export iOS + viabilité JSON, mode offline
  - fait quand: chaque point retesté et résultat consigné dans `plan_test_manuel_v2.md`
  - réf: `plan_test_manuel_v2.md` (lignes annotées "à tester"/"à retester")
- [P3|ouvert] Trou fonctionnel TaskV2 : aucune interaction UI pour toggle `essential` une tâche planifiée (le "Terminer" ajouté cette session couvre la complétion, pas le statut essentiel)
  - fait quand: décision produit prise (implémenter ou explicitement abandonner) sur `toggleEssentialV2` (`src/domain/rules/taskRulesV2.ts`)
  - réf: constat session V2-10 2026-07-01, vérifié dans `E10Dashboard.tsx` et `E40Planning.tsx`

## Questions ouvertes

## Échéances

## Blocages
Aucun.

## Contexte chaud
- **Tous les bugs et demandes de la session sont corrigés, testés et confirmés par l'utilisateur (2026-07-06)** : conflit de créneau (2e correctif, clic sur créneau occupé), actions Aujourd'hui/Planifier/Liste sur `E22TaskDetail`, navigation directe vers le détail de liste après ajout, bouton "Ajouter une tâche" sur Aujourd'hui, bouton "Terminer" sur Planning du jour (Dashboard), retrait icône Planning TopBar, grille Planning 0h-23h, message "Rien à faire aujourd'hui", renommer/supprimer une liste, section Organisation supprimée, libellé profil corrigé.
- Branche `v2` active ; tag `v1.0-mvp` posé ; `dist/v1/` versionné pour rollback, `dist/v2/` ignoré Git/régénérable via `npm run build` (toujours périmé, généré le 2026-07-02)
- 344/344 tests unitaires, `tsc -b` clean après tous les changements de la session
- e2e non relancés depuis les changements onboarding du 2026-07-06 (dernière confirmation 45/45 le 2026-07-05) — à revalider avant déploiement
- `npm run test` sous `--pool=vmThreads --poolOptions.vmThreads.maxThreads=1` fait échouer les tests liés à `crypto.subtle` (faux négatif d'environnement documenté) — utiliser le pool par défaut (`npx vitest run`)

## Dernière session (2026-07-06)

## Décisions prises
- Conflit de créneau Planning : bug persistant corrigé (le clic sur un créneau occupé ouvrait à tort le déplacement de l'autre tâche au lieu de refuser) ; message de refus affiché en modale plutôt qu'en bannière discrète.
- Planning sans tâche planifiable : garder le comportement actuel tel quel (décision actée).
- Ajout d'une tâche à une liste (Todo, création, détail tâche) : naviguer directement vers le détail de la liste après validation.
- Listes : ajouter le renommage et la suppression (avec confirmation).
- Section "Organisation" des Paramètres supprimée intégralement (code mort retiré, pas seulement masquée).
- Icône Planning de la TopBar supprimée (redondante avec la nav segmentée du Dashboard).

## Livrables produits ou modifiés
- `src/ui/screens/tasks/E22TaskDetail.tsx` : actions "Aujourd'hui", "Planifier", "Liste" ajoutées (cohérentes avec Todo)
- `src/ui/screens/planning/E40Planning.tsx` : conflit de créneau corrigé avec modale de refus ; grille horaire étendue à 24h (0h-23h)
- `src/ui/screens/lists/E60Lists.tsx` : renommer/supprimer une liste (avec confirmation)
- `src/ui/screens/tasks/E20Inbox.tsx`, `E21CreateTaskV2.tsx`, `E22TaskDetail.tsx` : navigation vers le détail de liste après ajout d'une tâche
- `src/ui/screens/tasks/E24Today.tsx` : bouton "Ajouter une tâche" ajouté
- `src/ui/screens/dashboard/E10Dashboard.tsx` : bouton "Terminer" sur Planning du jour, message "Rien à faire aujourd'hui" si Aujourd'hui vide
- `src/ui/components/TopBar.tsx`, `DevResetButton.tsx`, `src/App.tsx`, `src/app/AppContext.tsx` : retrait icône Planning, ajout `renameList`/`completeV2Task`, filtrage des tâches `completed` dans `getPlannedTasksForDate`
- `src/ui/screens/settings/E111Profile.tsx` : bug de libellés profil corrigé (teenager/student/adult)
- `src/ui/screens/settings/E114Organisation.tsx` + test : supprimés intégralement
- `roadmap_v2.md` : tous les points ci-dessus marqués corrigés/retestés

## Hypothèses validées / invalidées
- VALIDE : 344/344 tests unitaires, `tsc -b` clean après tous les changements
- VALIDE : 13 tests manuels de confirmation tous passés par l'utilisateur en app réelle
- EN ATTENTE : décision usage énergie, décision modification profil
- EN ATTENTE : e2e non relancés depuis les changements onboarding du 2026-07-06
- EN ATTENTE : build `dist/v2/` toujours périmé (généré le 2026-07-02)

## Prochaine étape exacte
Trancher les 2 décisions produit restantes (énergie, modification du profil), relancer les e2e, puis reprendre V2-10 : build `dist/v2/`, doc V2, déploiement Netlify.

## Question bloquante pour la session suivante
Aucune.
