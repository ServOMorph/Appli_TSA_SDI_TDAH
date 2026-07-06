# Roadmap — V2 (refonte UX post-test Marie)

Version : 2.1 — MAJ 2026-06-29 (reset données accepté par Marie)
Source : `Note de réunion/` (synthèse + note_marie + maquettes dessinées + analyse visio)

## Clarification de vocabulaire (prioritaire)

Ce document redéfinit les termes par rapport à `roadmap.md` :

- **V1** = le MVP actuellement déployé sur Netlify, testé par Marie (Phases 0-6 closes). Reste la base de retour arrière.
- **V2** = la refonte UX décrite ici, pilotée par les retours utilisateurs réels (Phase 7).

> Les anciennes phases 8-12 de `roadmap.md` (Routines, Social, Modèles sociaux, Event/notifications, Consolidation V1) sont **réordonnées et partiellement absorbées** par cette roadmap. Les Routines remontent en priorité (demande forte de Marie). Le Module social et les modèles sociaux restent reportés après la stabilisation V2.

## Légende statut
- `[ ]` non démarrée · `[~]` en cours · `[x]` terminée (gate validé)

## Gate commun (rappel)
1. Livrables fonctionnels · 2. Tests ≥ 85 % code ajouté · 3. Refacto fin de phase · 4. Doc à jour · 5. Test manuel parcours · 6. Critère de sortie atteint · 7. Aucun écran livré dans une phase antérieure n'a perdu son point d'entrée navigable (vérifier les chemins de navigation réels, pas seulement les tests)

---

## Stratégie de retour arrière

**Marie a explicitement accepté un reset des données** : la contrainte de migration additive est levée. Le rollback ne concerne que le code.

**Côté code** :
- Taguer le commit V1 actuel : `git tag v1.0-mvp` (snapshot immuable).
- Développer la V2 sur une branche dédiée `v2` ; `main` reste la V1 déployable jusqu'au basculement.
- Conserver le `dist/` V1 (build Netlify) archivé pour redéploiement immédiat.
- En cas de rollback : `git checkout v1.0-mvp` + redéployer le `dist/` archivé.

**Côté données** :
- Schéma Dexie v2 **réécrit proprement** (pas de migration de compatibilité v1).
- L'utilisateur repart de zéro à la première ouverture de la V2 (onboarding rejoué).
- Informer explicitement Marie avant le déploiement V2 : ses données V1 ne seront pas conservées.

---

## Phase V2-0 — Nettoyage racine & socle de bascule

- [x] Créer `Archives/` à la racine
- [x] Déplacer `roadmap.md` → `Archives/roadmap_v1.md`
- [x] Tag `v1.0-mvp` sur le commit actuel
- [x] Archive du `dist/` V1 (dossier `dist/v1/`)
- [x] Branche `v2` créée depuis `main`
- [x] **Sortie** : V1 restaurable en une commande (`git checkout v1.0-mvp` + redéploiement `dist/v1/`)

> **[2026-07-05] Réorganisation** : `dist_v1/` déplacé vers `dist/v1/` (regroupement des builds sous un seul dossier racine). `dist/v2/` (build V2, régénérable via `npm run build`) reste ignoré Git ; `dist/v1/` reste versionné.

## Phase V2-1 — Vocabulaire & quick wins

Faible risque, fort impact perçu. À livrer et déployer tôt.

- [x] "Souffle" → "Énergie" (libellés UI uniquement)
- [x] "Inbox" → "Todo"
- [x] "Plus tard" → "À faire plus tard" (reformulation)
- [x] **Tests** : composants impactés mis à jour (259/259)
- [x] **Test manuel** : aucun terme "souffle/inbox/plus tard" résiduel dans l'UI (vérifié 2026-06-29)
- [x] **Sortie** : vocabulaire aligné sur le public TSA

> **[2026-07-02] "À faire plus tard" (V1, statut `later`) retiré intégralement** — collision de nommage avec "À planifier plus tard" (V2, statut `to_plan`) résolue en supprimant le système V1 (écran `E25Later`, statut `TaskStatus.later`, bouton nav dashboard). Le système V2 (`to_plan`, pastille rouge, `E50ToPlanQueue`) est l'unique mécanisme de report désormais.

## Phase V2-2 — Modèle de données v2 (schéma propre)

Fondation des phases suivantes. Aucune UI ici, domaine + data. Schéma réécrit depuis zéro.

- [x] `TaskV2` : `status: 'todo' | 'planned' | 'to_plan' | 'completed'` ; `essential: boolean` ; `scheduled_date`, `scheduled_start`, `scheduled_end` (nullable)
- [x] Nouvelles tables : `List`, `ListItem`, `Routine`, `RoutineStep` (squelettes — détails en phases dédiées)
- [x] `db.ts` : `version(2)` avec tables v2 en parallèle de v1 (sans migration)
- [x] Règles domaine : taskRulesV2 (createTaskV2, scheduleTaskV2, completeTaskV2, moveTaskToLaterV2, toggleEssentialV2)
- [x] **Tests** : 301/301 ✓ (42 fichiers test)
- [x] **Sortie** : schéma v2 propre, parallèle à v1 ; modèle prêt pour toutes les phases suivantes

## Phase V2-3 — Flux d'ajout de tâche refondu

- [x] Écran ajout : nom + **choix obligatoire** entre destinations (Todo / Planifier / À planifier plus tard)
- [x] Pas de destination par défaut (validation bloquée tant que non choisie)
- [x] "Planifier" → crée status 'planned' (navigue inbox, placeholder jusqu'à V2-4)
- [x] "À planifier plus tard" → crée status 'to_plan'
- [x] Option : associer la tâche à une liste (livrée V2-7, câblée dans l'écran de création 2026-07-05)
- [x] **Tests** + **Test manuel** : 3 chemins (313/313 — TM-01 à TM-12 validés)
- [x] **Sortie** : plus de tâche perdue dans un inbox ambigu

> **[2026-07-05] Destinations revues** — "À planifier plus tard" (`to_plan`) remplacée par "Mettre dans une liste" (crée un `ListItem` directement, réutilise le sélecteur de liste de V2-7) ; ajout d'une destination "Aujourd'hui" (crée une `Task` V1 en `today`, avec la même règle de remplacement à 3 tâches que sur l'écran Todo). Le statut `to_plan` étant devenu inatteignable (aucune autre voie de création), il est retiré du domaine — voir note Phase V2-5.

## Phase V2-4 — Vue Planning (calendrier en cases)

Maquette : capture 183750 (cases AUJOURD'HUI) + capture 184709 (planning hebdo réel de Marie).

- [x] Vue **par jour**, cases par heure (1 colonne jour, lignes heures)
- [x] Scroll vertical sur les heures ; ouverture **à l'heure courante**
- [x] Navigation jour précédent / suivant (flèches)
- [ ] Icône agenda dans la barre du haut (accès direct) — reporté V2-9 (page d'accueil)
- [x] Placement / déplacement d'une tâche dans une case
- [x] **Tests** : 11 tests (324/324 total) · **Test manuel** : validé
- [x] **Sortie** : planning visuel utilisable (2026-06-30)

## Phase V2-5 — File "À planifier" séquentielle — RETIRÉE

- [x] Pastille rouge sur le tableau de bord si ≥ 1 tâche en attente (signal visuel, sans nombre)
- [x] Au clic : affichage de la 1re tâche → choix date/heure → tâche suivante
- [x] Arrêt possible à tout moment ; reste de la file conservé
- [x] **Tests** : 12 tests (336/336 total) · **Test manuel** : 7/7 TM validés
- [x] **Sortie** : traitement fluide du backlog de planification (2026-06-30)

**[2026-07-05] Retirée** — la destination "À planifier plus tard" a été remplacée par "Mettre dans une liste" sur l'écran de création (demande utilisateur). Le statut `to_plan` n'avait aucune autre voie de création (`moveTaskToLaterV2` jamais câblée à l'UI) ; il devenait donc totalement inatteignable. Code retiré : écran `E50ToPlanQueue`, bouton pastille du dashboard, statut `to_plan` (`TaskStatusV2`), fonction `moveTaskToLaterV2`, `getToPlantasks` (repository). 343/343 tests, build OK.

## Phase V2-6 — Mode surcharge repensé

En attente : Marie doit décrire son ressenti de surcharge (question ouverte) pour affiner le filtrage.

- [x] Bouton **isolé en haut** de la TopBar, séparé du chip énergie, état visuel actif/inactif (aria-pressed)
- [x] Toggle **instantané** de l'interface (même page, pas de navigation) : bandeau "Mode surcharge actif" + accès Centre récupération
- [x] En surcharge : masquer les sections non essentielles du Dashboard — **[2026-07-05] résolu différemment** que prévu : plutôt que de filtrer sur `essential` (jamais câblé à l'UI, cf. trou fonctionnel `toggleEssentialV2` toujours ouvert), masquage direct des sections entières en mode surcharge (icônes TopBar Planning/Ressources/Paramètres, chip énergie, bouton "Ajouter une tâche", nav segmentée, "Planning du jour", "Tâches du jour"). Ajout d'un bouton "Sortir du mode surcharge" en bas de page (même couleur que le bouton actif en haut).
- [x] **Tests** : 36/36 (E10Dashboard.test.tsx mis à jour)
- [x] **Sortie** : mode surcharge minimaliste — ne reste que le bandeau d'état, le Centre récupération, l'action immédiate, et la sortie du mode (2026-07-05)

## Phase V2-7 — Listes (référentiel personnel)

Nouvelle entité. Exemples Marie : habits, musiques, livres, routines.

- [x] Entités `List` + `ListItem` (squelettes définis en V2-2, implémentés ici)
- [x] Page Listes : toutes les listes de l'utilisateur (`E60Lists.tsx`)
- [x] Écran détail liste avec ajout/suppression d'élément (`E61ListDetail.tsx`)
- [x] Création d'une nouvelle liste à la volée
- [x] Les listes ne sont **pas** planifiables (référentiel, pas tâches)
- [x] Bouton "Ajouter" : suggestion de liste depuis le flux d'ajout de tâche — résolu différemment (2026-07-02) : action "Liste" ajoutée sur chaque tâche Todo existante (`E20Inbox`), plutôt qu'une suggestion au moment de la création
- [x] **Tests** : 28 tests (365/365 total)
- [x] **Test manuel** : TM-01 à TM-12 validés par l'utilisateur (2026-07-01, débloqué par la nav "Listes" de V2-9)
  - TM-01 à TM-12 : OK
- [x] **Sortie** : référentiel personnel fonctionnel (2026-06-30), test manuel validé 2026-07-01

## Phase V2-8 — Routines (matin / soir) — RETIRÉE

Maquette : capture 184750 (routines détaillées de Marie). Absorbait l'ancienne Phase 8.

**[2026-07-02] Retirée** — Marie n'a jamais demandé d'onglet "Routines" dédié (note_marie.txt, synthèse §4 : les routines sont des **listes**, pas une entité séparée ; sa maquette dessinée ne comporte que 3 items de nav : Todo / Planifier / Listes). L'implémentation V2-8 (onglet dédié + entités `Routine`/`RoutineStep`) était une extension non sollicitée. Code intégralement retiré : écrans `E70Routines`/`E71RoutineDetail`, `routineRules.ts`, `routineRepository`/`routineStepRepository`, entités `routine.ts`/`routineStep.ts`, tables Dexie `routines`/`routineSteps`, intégrations dans `E10Dashboard`/`E40Planning`/`AppContext`/`App.tsx`. 355/355 tests, build OK.

Fonctionnalité non abandonnée sur le fond : si Marie exprime le besoin, les routines pourront être réintroduites comme un type de **liste** (cohérent avec sa demande initiale), pas comme onglet séparé.

## Phase V2-9 — Refonte page d'accueil

Maquette : capture 183750. Dépend des phases planning + listes.

- [x] Haut : "Mon énergie" + bouton mode surcharge isolé + icône agenda (accès direct `planning`)
- [x] Centre : nouvelle section "Planning du jour" (mini, `TaskV2` du jour, tri par heure) — masque les tâches `essential=false` en mode surcharge. Le planning en cases complet (grille horaire scrollable) reste dans `E40Planning`, accessible via l'icône agenda ou le bouton "Planifier" ; pas dupliqué en miniature dans le dashboard (risque de double UI, écarté)
- [x] Bas : bouton "Ajouter une tâche" repointé vers `task-create-v2` (3 destinations, résout la navigation orpheline) ; nav segmentée étendue avec "Planifier" et "Listes" (segment "Routines" retiré 2026-07-02 ; segment "À faire plus tard" (V1 `later`) retiré 2026-07-02, résolution de la collision de nommage avec "À planifier plus tard" (V2 `to_plan`) — un seul système conservé)
- [x] **Tests** : 8 tests ajoutés (396/396 total) — nav planning/lists, icône agenda, section planning du jour, masquage essential
- [x] **Test manuel** : TM-01 à TM-06 validés par l'utilisateur (2026-07-01)
  - TM-01 à TM-06 : OK
- [x] **Sortie** : page d'accueil conforme à l'esprit de la maquette de Marie ; navigation orpheline (`task-create-v2`, planning, listes) résolue ; test manuel validé 2026-07-01

## Phase V2-10 — Consolidation V2 & 2e vague de tests

- [x] Refacto d'architecture, dead code, couverture globale ≥ 85 % — config coverage corrigée (exclusion `dist`/`e2e`), couverture réelle 95.48% (mesure 2026-07-01) ; `TASK_TODAY_MAX`/`canAddToToday` (V1) supprimés. `completeTaskV2`/`toggleEssentialV2` (V2) conservés : trou fonctionnel (non code mort), décision produit différée (signals.md)
- [x] E2E Playwright mis à jour (flux V2) — 42/45 passent (2026-07-02, après retrait Routines/Later et adaptation du flux de création) ; 3 échecs préexistants sans lien (`05-overload.spec.ts`, voir signals.md)
- [x] **[2026-07-02]** Fonctionnalité Routines (V2-8) retirée intégralement — non demandée par Marie (voir Phase V2-8 ci-dessus)
- [x] **[2026-07-02]** Collision de nommage V1/V2 "plus tard" résolue — système V1 `later` retiré, `to_plan` (V2) seul mécanisme de report
- [x] **[2026-07-02]** Écran Todo enrichi : actions "Planifier" et "Liste" par tâche (conversion à l'action vers `TaskV2`/`ListItem`), bug orphelin corrigé (destination "Todo" de `E21CreateTaskV2` créait des `TaskV2` jamais affichées), bug `deleteAllData` (tasksV2 non vidé) corrigé
- [x] **[2026-07-03]** Écran Planning (`E40Planning`) revu suite à retour utilisateur direct : bouton "Valider" explicite (fin du "un clic = validation"), transport de la tâche active via `selectedTaskId` pour confirmer sa planification sans lister tout le backlog. Bouton "Planifier" du dashboard renommé "Planning". 348/348 tests unitaires, `tsc -b` clean ; **e2e non rejoués** (voir signals.md action P2)
- [x] **[2026-07-03]** Bug racine SubTask corrigé : `toggleSubTask` n'était appelée nulle part dans l'UI (aucune sous-tâche jamais marquable terminée). Checkbox ajoutée dans `E22TaskDetail`/`E23Decompose` ; badge "X/Y" harmonisé sur Dashboard/`E20Inbox`/`E24Today` ; "Prochaine étape" ajoutée sur `E24Today` ; bouton "Voir le Todo" retiré de `E24Today`. 356/356 tests unitaires, `tsc -b` clean
- [x] **[2026-07-05]** E2E relancés (`npx playwright test`) après accumulation de plusieurs sessions de changements non testés (Planning, SubTask, destinations de création, retrait `to_plan`) — **45/45 passent**, aucune régression. Les 3 échecs préexistants (`05-overload.spec.ts` T40/T44/T45, décalage heading/`<p>`) corrigés en réécrivant les assertions pour matcher le texte réel ("Mode surcharge actif")
- [x] **[2026-07-06]** Comportement onboarding corrigé (reprise interrompue) : `User.onboarding_completed` ajouté, `completeOnboarding` (`AppContext.tsx`) appelée en fin d'onboarding ; un utilisateur incomplet au démarrage entraîne un reset complet vers `welcome`. Bouton "Ignorer" retiré de l'écran choix de profil (`E02Profile`) : sélection obligatoire. 345/345 tests unitaires, `tsc -b` clean.
- [x] **[2026-07-06]** Plan de test manuel V2 (`plan_test_manuel_v2.md`) rédigé et passé intégralement — écarts consolidés ci-dessus (§ "Constats test manuel V2-10")
- [x] Corriger les 4 bugs confirmés issus du test manuel (2026-07-06) : tri "Planning du jour" par `scheduled_start` (`AppContext.getPlannedTasksForDate`) ; rattachement de la tâche à une liste créée à la volée (`createList` retourne l'id, création inline dans le sélecteur `E20Inbox`/`E21CreateTaskV2`) ; détection de conflit de créneau dans Planning (`E40Planning.handleAssign` refuse + message, décision produit actée : refuser plutôt que remplacer ou superposer) ; avertissement avant perte de sous-tâches lors de conversion Todo → Planifier/Liste (modale de confirmation `E20Inbox`, pas de migration du modèle de données — item séparé ajouté ci-dessous pour la planification indépendante des sous-tâches). 346/346 tests unitaires, `tsc -b` clean.
- [x] **[2026-07-06]** Retest manuel intégral des corrections et ajouts de la session (13 points) : modale de conflit de créneau, navigation directe vers le détail de liste après ajout (Todo/création/détail tâche), bouton "Ajouter une tâche" sur Aujourd'hui, bouton "Terminer" sur Planning du jour (Dashboard), retrait icône Planning TopBar, grille Planning 0h-23h, message "Rien à faire aujourd'hui", renommer/supprimer une liste, section Organisation retirée, libellé profil corrigé — tous validés par l'utilisateur
- [x] **[2026-07-06]** Décision profil actée : `E111Profile` reste en lecture seule. Décision énergie remontée à Marie (`Note de réunion/a traiter prochaine reunion.txt`), en attente de son retour.
- [ ] Planning : gérer les créneaux par demi-heure plutôt que par heure pleine (grille horaire `E40Planning.tsx`, actuellement 1 créneau = 1 heure)
- [ ] Doc V2 : README, schéma données v2, ADR migration
- [ ] Build + déploiement Netlify V2 ; bascule `main`
- [ ] **Sessions test 2 à 5** avec Marie et autres testeurs AuDHD
  - Méthodo (réf `analyse_conduite_visio_marie.md`) : maquettes envoyées avant, partage d'écran cadré en début, **1-2 sujets approfondis** par session (pas 6), laisser finir les phrases (silence 2-3 s), clôture par les 3 points retenus dictés par le testeur
  - Premier sujet récurrent : ressenti de surcharge de Marie
- [ ] **Sortie** : V2 stable, couverte, validée par tests utilisateurs ; V1 toujours restaurable

---

## Constats test manuel V2-10 (session 2026-07-06)

Issus du passage du plan de test manuel (`plan_test_manuel_v2.md`) avant déploiement. Classés par nature d'action.

### Bugs confirmés à corriger — tous corrigés et retestés (2026-07-06)

- [x] Section "Planning du jour" du Dashboard non triée par heure — corrigé (`getPlannedTasksForDate`), retesté OK.
- [x] Action "Liste" sans liste existante (4.3/4.5) — corrigé (rattachement à la liste créée), retesté OK.
- [x] Sous-tâches perdues lors d'une conversion Todo → Planifier/Liste (4.6) — corrigé (avertissement de confirmation), retesté OK.
- [x] Conflit de créneau dans Planning (6.8) — corrigé une 2e fois (le clic sur un créneau occupé ouvrait le déplacement de l'autre tâche au lieu de refuser ; modale de refus ajoutée), retesté OK.

### Décisions produit à prendre

- Revoir à quoi sert l'énergie dans l'appli (test manuel 10.2) — actuellement une seule valeur par jour (`todayEnergy`/`todayEnergyStatus`), écrasée à chaque nouvelle saisie (`saveTodayEnergy`, `AppContext.tsx`), affichée uniquement dans le chip de la TopBar, sans historique ni aucun autre effet dans l'app (pas de lien avec le mode surcharge, pas de filtrage). **[2026-07-06]** Question posée à Marie pour la prochaine réunion (contexte consigné dans `Note de réunion/a traiter prochaine reunion.txt`) — décision toujours en attente de son retour.
- [x] **[2026-07-06]** Planning sans tâche planifiable (test manuel 6.3) — décision actée : garder le comportement actuel tel quel ("Placer à Xh00" + "Aucune tâche à planifier. Ajoutez une tâche et choisissez 'Planifier'.").

### Fonctionnalités manquantes / à implémenter

- Ajouter un champ nom de profil à l'onboarding — l'écran `E02Profile` ne propose actuellement qu'un choix de type de profil (Adolescent/Étudiant/Adulte), aucune saisie de nom.
- [x] **[2026-07-06]** Écran détail tâche (`E22TaskDetail`) : actions "Aujourd'hui" (masquée si déjà aujourd'hui, avec règle de remplacement à 3 tâches), "Planifier" et "Liste" (avec avertissement de perte de sous-tâches) ajoutées, cohérentes avec l'écran Todo.
- [x] **[2026-07-06]** Suppression d'une liste entière — `deleteList` câblée dans `E60Lists.tsx` avec confirmation modale. Renommage d'une liste également ajouté (`renameList`, nouveau dans `AppContext.tsx`).
- [x] **[2026-07-06]** Modification du profil (test manuel 11.1) — décision actée : `E111Profile` reste en lecture seule (écran informatif), aucune modification à implémenter. Bug de libellé corrigé dans tous les cas (`profileLabels` alignés sur les vraies valeurs `ProfileType` : teenager/student/adult).
- [x] **[2026-07-06]** Ajout d'une liste depuis une tâche (Todo, création, détail tâche) : navigue désormais directement vers le détail de la liste après validation, au lieu de rester sur l'écran d'origine.
- [x] **[2026-07-06]** Écran Aujourd'hui (`E24Today`) : bouton "Ajouter une tâche" ajouté (absent auparavant, seul point d'entrée manquant pour créer une tâche depuis cet écran).
- [x] **[2026-07-06]** Dashboard, section "Planning du jour" : bouton "Terminer" par tâche ajouté (`completeV2Task`, nouveau dans `AppContext.tsx`) — la tâche terminée sort de la liste (`getPlannedTasksForDate` exclut désormais les tâches `completed`).
- [ ] Planning : gérer les créneaux par demi-heure plutôt que par heure pleine (ajouté 2026-07-06)

### Nettoyage UI demandé

- [x] **[2026-07-06]** Section "Organisation" supprimée des Paramètres (`E110Settings.tsx`, écran `E114Organisation.tsx` retiré intégralement du code).
- [x] **[2026-07-06]** Icône agenda (Planning) supprimée de la `TopBar` — redondante avec le bouton "Planning" de la nav segmentée du Dashboard.
- [x] **[2026-07-06]** Dashboard : message d'état vide de l'action immédiate remplacé par "Rien à faire aujourd'hui" quand Aujourd'hui est vide (au lieu de "Que souhaitez-vous ajouter ?").
- [x] **[2026-07-06]** Planning : grille horaire étendue de 6h-22h à 0h-23h (24h complètes).

### À (re)tester avant déploiement

- [x] **[2026-07-06]** Test manuel 2.4 : badge "X/Y" du Dashboard sur une tâche décomposée en sous-tâches — validé.
- [x] **[2026-07-06]** Test manuel 2.6 : Dashboard sans aucune tâche — validé.
- [x] **[2026-07-06]** Test manuel 6.7 : ouverture du Planning à l'heure courante — validé.
- [x] **[2026-07-06]** Test manuel 6.10 : placer une tâche à un horaire limite (00h00, 23h00) — validé.
- [x] **[2026-07-06]** Test manuel 7.3 : écran Aujourd'hui (`E24Today`) sans aucune tâche prévue — validé.
- [x] **[2026-07-06]** Mode sombre de l'UI (`settings.dark_mode`, activable via `E112Accessibility.tsx`) — validé.
- [x] **[2026-07-06]** Test manuel 11.2 : réglages d'accessibilité (`E112Accessibility`) — validé. Section "Stimulation cognitive" (`E113Stimulation`) supprimée intégralement des Paramètres (décision utilisateur) : écran, entrée menu, champ `Settings.stimulation_mode`, CSS `data-stimulation` retirés du code (339/339 tests, `tsc -b` clean).
- Test manuel 11.5 : export des données (`E117Export.tsx`) sur iPhone — comportement du téléchargement/partage en environnement iOS (Safari/PWA).
- Viabilité du fichier JSON généré par l'export de données (`E117Export.tsx`/`exportData`) — JSON valide, structure cohérente avec les données réelles.
- Test manuel 13.2 : utilisation de l'app en coupant la connexion réseau — fonctionnement normal (offline-first).

## Fonctionnalité reportée (décision 2026-07-06)

- Planification indépendante des sous-tâches (chaque `SubTask` planifiable à son propre horaire) — non traitée dans le fix immédiat du bug "sous-tâches perdues" (qui se limite à un avertissement avant conversion). Piste retenue si le besoin se confirme : chaque sous-tâche devient sa propre `TaskV2` (statut `planned`) avec un `parent_task_id` optionnel pour le regroupement visuel, plutôt que d'étendre `SubTask` avec ses propres champs de planification (évite de dupliquer la logique déjà présente sur `TaskV2`/Planning).

## Reporté après V2

- Module social (ancienne Phase 9) : Contact, ContactInteraction
- Modèles sociaux & préparation d'interactions (ancienne Phase 10)
- Event dédié + notifications push (ancienne Phase 11) — partiellement couvert par le planning V2
- Sync cloud Supabase (ancienne Phase 13) et portage Capacitor (ancienne Phase 14) : inchangés, post-V2

## Risques / angles morts

- **Navigation orpheline (constat 2026-07-01, résolu en V2-9)** : le revert e2e du 2026-06-30 (dashboard/Todo repointés vers `task-create` V1 pour stabiliser T11-T13) avait rendu `task-create-v2` — et donc l'écran planning (`E40Planning`) — inaccessible par toute navigation réelle. Résolu en V2-9 : bouton "Ajouter une tâche" du dashboard repointé vers `task-create-v2`, icône agenda + bouton "Planifier" donnent un accès direct au planning, bouton "Listes" donne accès à `E60Lists`. Vérifié : aucun e2e cassé (T11-T19 passent par le bouton d'ajout propre à `E20Inbox`, indépendant de celui du dashboard). Gate commun complété (point 7) pour prévenir la récidive.
- **Maquettes manquantes** : les dessins de Marie sont des photos basse-déf ; valider l'interprétation avant de coder le planning et la page d'accueil.
- **Définition "essentiel"** : le filtrage surcharge dépend d'un marquage `essential` dont le critère n'est pas encore défini par l'usage réel (Phase V2-6 en attente du retour de Marie).
- **Rollback données** : Marie accepte le reset. Informer explicitement avant tout déploiement V2.
- **Charge des sessions test** : 1 testeuse à ce jour. Le gate Phase 7 vise 5-10 sessions ; recruter d'autres profils AuDHD.
