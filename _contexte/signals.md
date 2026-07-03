# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-03)

## Actions ouvertes

### Phase 7 — Tests utilisateurs (1/5–10 sessions)
- [P2|ouvert] Sessions test 2 à 5+ avec Marie et autres testeurs AuDHD
  - fait quand: 5 à 10 sessions réalisées, retours consolidés dans fichier dédié
  - réf: `Note de réunion/synthese_reunion_marie_2026-06-29.md` + `Note de réunion/analyse_conduite_visio_marie.md`

### V2 — En cours
- [P1|ouvert] Phase V2-10 (Consolidation V2 & 2e vague de tests) — EN COURS
  - dead code : nettoyé ; couverture ≥85% : atteinte (mesure 2026-07-01, non réévaluée après les changements récents) ; reste : doc V2, build+déploiement Netlify, sessions test 2-5
  - réf: `roadmap_v2.md` Phase V2-10
- [P3|ouvert] Trou fonctionnel TaskV2 : aucune interaction UI pour compléter/toggle `essential` une tâche planifiée
  - fait quand: décision produit prise (implémenter ou explicitement abandonner) sur `completeTaskV2`/`toggleEssentialV2` (`src/domain/rules/taskRulesV2.ts`), actuellement non appelées nulle part dans l'UI.
  - réf: constat session V2-10 2026-07-01, vérifié dans `E10Dashboard.tsx` et `E40Planning.tsx`
- [P2|ouvert] e2e T40/T44/T45 (`05-overload.spec.ts`) cassés — décalage test/UI préexistant
  - constat : les tests attendent un `heading` "Mode surcharge" sur le dashboard ; le bandeau surcharge est un `<p>` depuis la refonte V2-6 (toggle inline sans navigation).
  - fait quand: soit le bandeau devient un `<h2>`/`<h3>`, soit les 3 tests sont réécrits pour matcher le texte réel ("Mode surcharge actif")
  - réf: `e2e/05-overload.spec.ts` lignes 9-13, 36-51 ; `src/ui/screens/dashboard/E10Dashboard.tsx` (`<p>Mode surcharge actif</p>`)
- [P3|ouvert] Sous-tâches perdues silencieusement lors de conversion Todo → Planifier/Liste
  - constat : `planTodoTask`/`moveTodoTaskToList` (`AppContext.tsx`) suppriment les `SubTask` liées sans les recréer côté `TaskV2`/`ListItem` (pas de mécanisme cross-modèle). Cas rare mais silencieux — pas de confirmation utilisateur avant perte.
  - fait quand: décision produit prise (avertir l'utilisateur avant conversion si sous-tâches existent, ou accepter la perte silencieuse comme comportement définitif)
  - réf: `src/app/AppContext.tsx` fonctions `planTodoTask`/`moveTodoTaskToList`
- [P3|ouvert] e2e non relancés après les changements de flux Planning (bouton Valider, transport de tâche via `selectedTaskId`, libellé "Planning")
  - constat : aucun `.spec.ts` ne référence les libellés "Planifier"/"Placer à" (vérifié par recherche), mais le flux réel n'a pas été rejoué en e2e — seuls les tests unitaires (348/348) ont validé le nouveau comportement.
  - fait quand: `npx playwright test` relancé et 42/45 (ou mieux) confirmé après ces changements
  - réf: `e2e/*.spec.ts`, `src/ui/screens/planning/E40Planning.tsx`

## Questions ouvertes

## Échéances

## Blocages
Aucun.

## Contexte chaud
- Branche `v2` active ; tag `v1.0-mvp` posé ; `dist_v1/` archivé (rollback V1 opérationnel)
- **Flux de planification revu (retour utilisateur direct sur capture d'écran)** : l'ancien comportement où taper un créneau vide affichait la liste de toutes les tâches non planifiées, et cliquer sur une tâche validait immédiatement, n'était pas intuitif. Nouveau flux :
  - `planTodoTask` (Todo → Planifier) et `createTaskV2Dest` (création directe, destination "Planifier") retournent désormais l'id de la `TaskV2` créée.
  - `E20Inbox`/`E21CreateTaskV2` appellent `selectTask(id)` avant `goTo('planning')` pour porter cette tâche comme "tâche en attente" (`selectedTaskId` du contexte).
  - `E40Planning` : si une tâche en attente correspond à une tâche non planifiée, taper un créneau vide affiche directement "Placer « titre » à Xh00" + bouton **Valider** unique (pas de liste). Sinon (pas de tâche en attente), fallback sur l'ancien comportement : liste des tâches non planifiées, sélection (surlignage) puis bouton Valider (désactivé tant qu'aucune sélection).
  - Le déplacement d'une tâche déjà planifiée (`mode: 'move'`) est inchangé.
- **Nav segmentée dashboard** : bouton "Planifier" renommé en "Planning" (`E10Dashboard.tsx` ligne ~423). Ne pas confondre avec l'icône agenda de la TopBar qui porte déjà `aria-label="Planning"` (collision d'aria-label résolue dans les tests via `within(header)`/`within(group)`).
- **Fonctionnalité Routines retirée intégralement** (session 2026-07-02) : réintroduction possible comme type de liste si Marie l'exprime.
- **Collision de nommage V1/V2 "plus tard" résolue** (session 2026-07-02) : seul `to_plan` (V2, pastille rouge, `E50ToPlanQueue`) subsiste comme mécanisme de report.
- **Écran Todo (`E20Inbox`) enrichi** : 3 actions par tâche — "Aujourd'hui" (V1), "Planifier" (convertit en `TaskV2` statut `planned`, transporte l'id vers Planning), "Liste" (crée un `ListItem`).
- Nav segmentée dashboard actuelle : 4 boutons (Todo/Aujourd'hui/Planning/Listes)
- 348/348 tests unitaires, `tsc -b` passent (build complet et e2e non relancés cette session, voir action P3 ci-dessus)
- `npm run test` sous `--pool=vmThreads --poolOptions.vmThreads.maxThreads=1` fait échouer les tests liés à `crypto.subtle` (faux négatif d'environnement documenté) — utiliser le pool par défaut (`npx vitest run`)

## Dernière session (2026-07-03)

## Décisions prises
- Écran Planning (`E40Planning`) : ajout d'un bouton "Valider" explicite — un clic sur une tâche ne valide plus immédiatement le placement (retour utilisateur : comportement non intuitif)
- Flux "Planifier" (depuis Todo ou création directe) transporte désormais l'id de la tâche créée jusqu'à l'écran Planning, pour afficher directement la confirmation de placement de cette tâche précise, sans lister toutes les tâches non planifiées
- Bouton "Planifier" de la nav segmentée du dashboard renommé en "Planning"

## Livrables produits ou modifiés
- `AppContext.tsx` : `planTodoTask` et `createTaskV2Dest` retournent désormais l'id de la tâche créée
- `E20Inbox.tsx` / `E21CreateTaskV2.tsx` : appel `selectTask(id)` avant `goTo('planning')`
- `E40Planning.tsx` : bouton Valider (liste classique) + flux "tâche en attente" (confirmation directe sans liste)
- `E10Dashboard.tsx` : libellé "Planifier" → "Planning" (nav segmentée)
- Tests mis à jour/ajoutés : `E20Inbox.test.tsx`, `E21CreateTaskV2.test.tsx`, `E40Planning.test.tsx`, `E10Dashboard.test.tsx`

## Hypothèses validées / invalidées
- VALIDE : le flux "un clic = validation" du picker Planning n'était pas intuitif (constat direct sur capture d'écran utilisateur) → ajout d'un bouton Valider explicite
- VALIDE : afficher toutes les tâches non planifiées dans la modale de confirmation créait de la confusion quand une tâche précise venait d'être choisie pour être planifiée → transport de l'id via `selectedTaskId` existant (réutilisé, pas de nouveau champ)
- EN ATTENTE : e2e non rejoués après ces changements (aucun `.spec.ts` ne référence les libellés impactés, mais à confirmer par exécution réelle)

## Prochaine étape exacte
Relancer `npx playwright test` pour confirmer l'absence de régression e2e sur le nouveau flux Planning, puis poursuivre V2-10 : doc V2, build + déploiement Netlify, sessions test 2-5 avec Marie.

## Question bloquante pour la session suivante
Aucune.
