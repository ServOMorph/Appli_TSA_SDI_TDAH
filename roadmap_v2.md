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
- [x] Archive du `dist/` V1 (dossier `dist_v1/`)
- [x] Branche `v2` créée depuis `main`
- [x] **Sortie** : V1 restaurable en une commande (`git checkout v1.0-mvp` + redéploiement `dist_v1/`)

## Phase V2-1 — Vocabulaire & quick wins

Faible risque, fort impact perçu. À livrer et déployer tôt.

- [x] "Souffle" → "Énergie" (libellés UI uniquement)
- [x] "Inbox" → "Todo"
- [x] "Plus tard" → "À faire plus tard" (reformulation)
- [x] **Tests** : composants impactés mis à jour (259/259)
- [x] **Test manuel** : aucun terme "souffle/inbox/plus tard" résiduel dans l'UI (vérifié 2026-06-29)
- [x] **Sortie** : vocabulaire aligné sur le public TSA

## Phase V2-2 — Modèle de données v2 (schéma propre)

Fondation des phases suivantes. Aucune UI ici, domaine + data. Schéma réécrit depuis zéro.

- [x] `TaskV2` : `status: 'todo' | 'planned' | 'to_plan' | 'completed'` ; `essential: boolean` ; `scheduled_date`, `scheduled_start`, `scheduled_end` (nullable)
- [x] Nouvelles tables : `List`, `ListItem`, `Routine`, `RoutineStep` (squelettes — détails en phases dédiées)
- [x] `db.ts` : `version(2)` avec tables v2 en parallèle de v1 (sans migration)
- [x] Règles domaine : taskRulesV2 (createTaskV2, scheduleTaskV2, completeTaskV2, moveTaskToLaterV2, toggleEssentialV2)
- [x] **Tests** : 301/301 ✓ (42 fichiers test)
- [x] **Sortie** : schéma v2 propre, parallèle à v1 ; modèle prêt pour toutes les phases suivantes

## Phase V2-3 — Flux d'ajout de tâche refondu

- [x] Écran ajout : nom + **choix obligatoire** entre 3 destinations (Todo / Planifier / À planifier plus tard)
- [x] Pas de destination par défaut (validation bloquée tant que non choisie)
- [x] "Planifier" → crée status 'planned' (navigue inbox, placeholder jusqu'à V2-4)
- [x] "À planifier plus tard" → crée status 'to_plan'
- [ ] Option : associer la tâche à une liste (reporté V2-7)
- [x] **Tests** + **Test manuel** : 3 chemins (313/313 — TM-01 à TM-12 validés)
- [x] **Sortie** : plus de tâche perdue dans un inbox ambigu

## Phase V2-4 — Vue Planning (calendrier en cases)

Maquette : capture 183750 (cases AUJOURD'HUI) + capture 184709 (planning hebdo réel de Marie).

- [x] Vue **par jour**, cases par heure (1 colonne jour, lignes heures)
- [x] Scroll vertical sur les heures ; ouverture **à l'heure courante**
- [x] Navigation jour précédent / suivant (flèches)
- [ ] Icône agenda dans la barre du haut (accès direct) — reporté V2-9 (page d'accueil)
- [x] Placement / déplacement d'une tâche dans une case
- [x] **Tests** : 11 tests (324/324 total) · **Test manuel** : validé
- [x] **Sortie** : planning visuel utilisable (2026-06-30)

## Phase V2-5 — File "À planifier" séquentielle

- [x] Pastille rouge sur le tableau de bord si ≥ 1 tâche en attente (signal visuel, sans nombre)
- [x] Au clic : affichage de la 1re tâche → choix date/heure → tâche suivante
- [x] Arrêt possible à tout moment ; reste de la file conservé
- [x] **Tests** : 12 tests (336/336 total) · **Test manuel** : 7/7 TM validés
- [x] **Sortie** : traitement fluide du backlog de planification (2026-06-30)

## Phase V2-6 — Mode surcharge repensé

En attente : Marie doit décrire son ressenti de surcharge (question ouverte) pour affiner le filtrage.

- [x] Bouton **isolé en haut** de la TopBar, séparé du chip énergie, état visuel actif/inactif (aria-pressed)
- [x] Toggle **instantané** de l'interface (même page, pas de navigation) : bandeau "Mode surcharge actif" + accès Centre récupération
- [ ] En surcharge : masquer les tâches `essential = false` — **bloqué** : `todayTasks` (dashboard) est composé d'entités `Task` V1 qui n'ont pas de champ `essential` (seul `TaskV2` l'a, cf. V2-2). Aucune tâche `essential=false` n'atteint le dashboard aujourd'hui. Ce point sera traité avec le branchement `TaskV2` au dashboard (V2-9).
- [x] **Tests** : 337/337 (E10Dashboard.test.tsx mis à jour)
- [x] **Sortie** : mode surcharge reconnaissable et actionnable en un geste (mécanique livrée 2026-06-30 ; masquage réel différé à V2-9)

## Phase V2-7 — Listes (référentiel personnel)

Nouvelle entité. Exemples Marie : habits, musiques, livres, routines.

- [x] Entités `List` + `ListItem` (squelettes définis en V2-2, implémentés ici)
- [x] Page Listes : toutes les listes de l'utilisateur (`E60Lists.tsx`)
- [x] Écran détail liste avec ajout/suppression d'élément (`E61ListDetail.tsx`)
- [x] Création d'une nouvelle liste à la volée
- [x] Les listes ne sont **pas** planifiables (référentiel, pas tâches)
- [ ] Bouton "Ajouter" : suggestion de liste depuis le flux d'ajout de tâche — reporté (non couvert par cette itération, à raccorder en V2-9)
- [x] **Tests** : 28 tests (365/365 total)
- [x] **Test manuel** : TM-01 à TM-12 validés par l'utilisateur (2026-07-01, débloqué par la nav "Listes" de V2-9)
  - TM-01 à TM-12 : OK
- [x] **Sortie** : référentiel personnel fonctionnel (2026-06-30), test manuel validé 2026-07-01

## Phase V2-8 — Routines (matin / soir)

Maquette : capture 184750 (routines détaillées de Marie). Absorbe l'ancienne Phase 8.

- [x] Routines = listes spéciales avec **bloc de temps réservé** (ex. RM = 1h30), pas étape minutée dans le planning
- [x] Routine matin (RM) / routine soir (RS) — pas de variantes semaine/week-end (non couvert, à raccorder si besoin exprimé)
- [x] Intégration au planning comme **bloc** unique (chip dans la case de l'heure de début, avec durée affichée)
- [x] Cases à cocher des étapes au sein de la routine
- [x] Point d'entrée dashboard : segment "Routines" ajouté à la nav (Todo/Aujourd'hui/À faire plus tard/Routines)
- [x] **Tests** : 25 tests (390/390 total)
- [x] **Test manuel** : TM-01 à TM-08 validés par l'utilisateur (2026-07-01)
  - TM-01 : Depuis le tableau de bord, cliquer "Routines" → page "Mes routines" s'affiche — OK
  - TM-02 : Créer une routine (nom, type matin/soir, durée) → apparaît dans la liste — OK
  - TM-03 : Ouvrir une routine, ajouter une étape → apparaît dans la liste des étapes — OK
  - TM-04 : Cocher une étape → coché visuellement (barré) — OK
  - TM-05 : Supprimer une étape → disparaît de la liste — OK
  - TM-06 : Réserver un créneau (date + heure) → message "Prévue le … à …" affiché — OK
  - TM-07 : Ouvrir le planning à la date choisie → bloc routine visible dans la case horaire correspondante — OK (débloqué par l'icône agenda de V2-9)
  - TM-08 : Cliquer sur le bloc routine dans le planning → navigue vers le détail de la routine — OK
- [x] **Sortie** : routines centralisées (besoin n°1 exprimé par Marie) — mécanique livrée et test manuel TM-01 à TM-08 validés 2026-07-01

## Phase V2-9 — Refonte page d'accueil

Maquette : capture 183750. Dépend des phases planning + listes.

- [x] Haut : "Mon énergie" + bouton mode surcharge isolé + icône agenda (accès direct `planning`)
- [x] Centre : nouvelle section "Planning du jour" (mini, `TaskV2`/`Routine` du jour, tri par heure) — masque les tâches `essential=false` en mode surcharge. Le planning en cases complet (grille horaire scrollable) reste dans `E40Planning`, accessible via l'icône agenda ou le bouton "Planifier" ; pas dupliqué en miniature dans le dashboard (risque de double UI, écarté)
- [x] Bas : bouton "Ajouter une tâche" repointé vers `task-create-v2` (3 destinations, résout la navigation orpheline) ; nav segmentée étendue avec "Planifier" et "Listes" (les 4 segments existants Todo/Aujourd'hui/À faire plus tard/Routines sont conservés — testés par e2e T14/T15 — plutôt que remplacés strictement par les 3 items de la maquette)
- [x] **Tests** : 8 tests ajoutés (396/396 total) — nav planning/lists, icône agenda, section planning du jour, masquage essential
- [x] **Test manuel** : TM-01 à TM-06 validés par l'utilisateur (2026-07-01)
  - TM-01 à TM-06 : OK
- [x] **Sortie** : page d'accueil conforme à l'esprit de la maquette de Marie ; navigation orpheline (`task-create-v2`, planning, listes) résolue ; test manuel validé 2026-07-01

## Phase V2-10 — Consolidation V2 & 2e vague de tests

- [ ] Refacto d'architecture, dead code, couverture globale ≥ 85 %
- [x] E2E Playwright mis à jour (flux V2) — 46/46 passent depuis 2026-06-30 (soldé en avance de V2-10)
- [ ] Doc V2 : README, schéma données v2, ADR migration
- [ ] Build + déploiement Netlify V2 ; bascule `main`
- [ ] **Sessions test 2 à 5** avec Marie et autres testeurs AuDHD
  - Méthodo (réf `analyse_conduite_visio_marie.md`) : maquettes envoyées avant, partage d'écran cadré en début, **1-2 sujets approfondis** par session (pas 6), laisser finir les phrases (silence 2-3 s), clôture par les 3 points retenus dictés par le testeur
  - Premier sujet récurrent : ressenti de surcharge de Marie
- [ ] **Sortie** : V2 stable, couverte, validée par tests utilisateurs ; V1 toujours restaurable

---

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
