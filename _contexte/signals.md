# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-09-03)

## Contexte chaud
- **`roadmap_gateway_discord_service.md` : Phases 1 et 2 `[FAIT]` le 2026-09-03, Phase 3 `[TODO]` (au checkpoint `/compact`).** Phase 1 : `bot.py` route tout le canal hors @-mention vers `gateway.route_inbound` ; `gateway/agents.json` (registre agent=zone : `Appli_TSA_SDI_TDAH`→alias `orchestrateur`, `design`, `discord`) ; `state.pending_replies[]` (liste, migration paresseuse depuis l'objet `pending_reply`), appariement par auteur Discord ; écritures atomiques + verrou `state.lock` ; récup orphelin `commands.json` `processing` > 15 min au démarrage du bot ; `attachments` transportés. Phase 2 : statuts outbox `pending`/`approved`/`held`/`bounced`/`failed`, verbes `approve`/`hold`/`bounce`/`merge`, `drain` n'envoie que les `approved` (échec → `failed` + dead-letter `inbox/discord/`, boucle continue), `bot.py` draine toutes les 5 s (verrou `drain.lock`) — **plus aucun `drain` manuel nulle part**. 58 auto-tests verts. Écarts assumés : `expect_reply` pose le pending au `drain` (pas à `enqueue`), heuristique en frontières de mot `\b`, `failed` reste dans l'outbox. Phase 1 éprouvée en réel (réponse de Marie du 17h17 routée seule par `bot.py`). **Reste Phase 3** : hooks `SessionStart`/`Stop` de livraison en direct + `start.md`/`close.md` + `poll --zone` + docs. Décisions de cadrage inchangées : routage mécanique dans `bot.py`, hooks et non boucle de veille, agent = zone, 6 critères de rejet du gardien.
- **Règle Discord `drain` — évoluée le 2026-09-03 (Phase 2)** : `gateway.py drain` n'est plus lancé par personne à la main. `bot.py` draine automatiquement toutes les 5 s, uniquement les demandes `approved` par le gardien (agent DISCORD). Les autres agents s'arrêtent à `enqueue` ; une demande `approved` qui ne part pas = `bot.py` arrêté, à signaler. `.claude/CLAUDE.md` § Communication Discord à jour. (Origine : un `drain` lancé à tort par l'orchestrateur le 2026-09-03, message à Marie non parti après `enqueue` seul.)
- **Captures #3 + #32 reçues le 2026-09-03** (message Discord @bot de Marie du 19h16 ; `bot.py` a perdu les pièces jointes — branche @-mention de `on_message`, angle mort P2 — récupérées depuis le téléphone de l'utilisateur, commit 9f03d5d). Archivées : `COMMUNICATION/Marie/captures/2026-09-03/formulaire-tache_date-heure-deborde.png` et `parametres-accessibilite_deborde.png`. Confirment : formulaire de tâche — grille « Coût en énergie » (6e/12e case) + `<input>` Date/Heure coupés à droite ; Paramètres > Accessibilité — toutes les cartes coupées à droite, débordement limité à cette rubrique. Décision produit 7 tranchée. `roadmap_demandes_marie_2026-09-02.md` Phase 10 `[FAIT]` (correctif `width: 100%` + `minmax(0,1fr)` + `flexWrap: wrap`, 719 tests verts). Gate restant : validation Marie sur son appareil, post-déploiement.
- **`roadmap_demandes_marie_2026-09-02.md` (demandes 23-33 du Google Doc) : les 10 phases `[FAIT]` le 2026-09-03, non déployées. Roadmap complète, à archiver au prochain `/deploy`.** Phase 10 (#3 + #32) faite le 2026-09-03 sur captures de Marie : `width: '100%'` sur les conteneurs `<main>`/`<form>` des 5 écrans Paramètres (`E110Settings`, `E111Profile`, `E112Accessibility`, `E116Privacy`, `E117Export`) + 2 écrans de tâche (`E21CreateTaskV2`, `E24EditTask`) ; `repeat(6, minmax(0, 1fr))` sur `energyGridStyle` ; `flexWrap: 'wrap'` sur la rangée « Petite/Normale/Grande » de `E112Accessibility`. Catalogue : `cadre-date-heure-dans-l-ecran` rev 1 + nouveau `cadres-parametres-tiennent-dans-l-ecran` (`docRefs: [32]`). `tsc -b` + lint + **719 tests** verts. #3/#32 → `livrée` seulement après validation Marie post-déploiement. Détail Phases 1-9 ci-dessous. Phase 1 (#23) : `plannedTaskTintStyle` ne force `#fff` que si couleur effective ≠ surface (`ambiance.ts` + `ambiance.test.ts` créé). Phase 2 (#30) : carte d'outil de l'accueil teintée `pastelBackground(tool.color)` (`E10Dashboard`). Phase 3 (#24+#25) : case planning — nom + heure de début ancrés en haut (`alignItems: flex-start`), heure de fin en bas via colonne `timeColStyle` `justify-content: space-between` ; durée **obligatoire pour une tâche planifiée** (décision 1 Marie = « seulement planning ») dans `E21CreateTaskV2` (`canSubmit` + `hasDuration`) et `E24EditTask` (`!startTime || hasDuration`), message d'aide sous `DurationRoller`. `scheduled_end` déjà dérivé de start+durée dans `usePlanningState` — rien ajouté. Phase 4 (#27) : renommage « Comptes »→« Mon compte » (E75 + carte accueil), E78→« Prévisions » (décision 4), lien d'accès `E71Budget` relabellé. Phase 5 (#28) : `getMonCompteSolde(categories, entries, refDate)` = `getMonComptePrevisions` (semaine ×4) − dépenses du mois ; bloc « Solde du mois » en tête de `E75BudgetAccount` (`<section aria-label="Solde de Mon compte">`). Page Budget inchangée. Phase 6 (#26) : carte « Prévisions » de `E71Budget` en `formatEuro(monComptePrevisions)` positif + `var(--color-success)` (décision 3 : ligne de détail du Montant total laissée négative). Phase 7 (#31) : champ `mon_compte_color?` ajouté à `Settings` (pas de migration Dexie/Supabase — champ libre comme `ambiance_color`, décision 5) ; entrée fixe « Mon compte » dans « Couleur des outils » de `E112Accessibility` (toujours présente, même sans `Tool`) → `updateSettings({ mon_compte_color })` ; carte accueil « Mon compte » teintée. Phase 8 (#29) : `E31EnergyCheckIn` « Retour »/« Ignorer » → `goTo('dashboard')` ; **écran `E30EnergyView` + route `energy-view` supprimés** (décision 6 Marie = « retirer ») — `navigation.ts`, `App.tsx`, `DevResetButton.tsx`, `App.suspense.test.tsx`, e2e `03-energy.spec.ts` nettoyés. Phase 9 (#33) : `E61ListDetail` charge les sous-tâches des `currentItems` (N appels `getListItemSubTasks`, pas de batch), rend un compteur `done/total` + chevron ▸/▾ pliable par élément, cases à cocher → `toggleListItemSubTask`. `tsc -b` + lint + **716 tests** (85 fichiers) verts. Catalogue : `utiliser-le-budget` rev 3, `utiliser-comptes` rev 4, `couleur-de-fond-par-outil` rev 3, `consulter-et-modifier-l-energie` rev 2 + parcours neufs (`nom-de-tache-en-haut-de-case`, `heures-debut-fin-sur-la-case`, `duree-obligatoire-tache-planifiee`, `sous-taches-element-liste-dans-la-categorie`). 8 entrées `WHATS_NEW`. Décisions Marie 1 (« seulement planning ») et 6 (« retirer » E30) obtenues via Discord le 2026-09-02, loggées `historique_whatsapp.md`, ackées gateway.
- **Bot Discord — file d'attente des commandes (2026-09-02, commits `2b75711` + `1670bca`)** : `bot.py` `on_message` empile désormais dans `commands.json` → `queue[]` tout message reçu pendant que Claude est occupé (avant : rejet « Renvoie ce message quand il a répondu »). `boucle_polling` (0,5 s) promeut la 1re commande de la file dès que `status` repasse `idle` — traitement en rafale FIFO à la reprise. Testé en isolation, bot redémarré via `bot_manager.py` (PID courant dans `DISCORD/discord_com/bot.pid`). **Angle mort corrigé le 2026-09-03** (`roadmap_gateway_discord_service.md` Phase 1) : `bot.py recuperer_processing_orphelin()` (appelé dans `on_ready`) repasse `commands.json` en `idle` si `status == "processing"` depuis plus de 15 min — test manuel dev en attente (`tests_manuels.md`). Avant : file bloquée en silence, remise à `idle` manuelle nécessaire. Modèle message Marie : le tag `<@1368654289584656394>` était déjà posé sans condition par `gateway.curate()` (`to=marie`) ; `.claude/CLAUDE.md` + `AGENTS.md` rendent la règle explicite (« tague Marie dans chaque message, sans exception »).
- **Comportement pastille « Tests à faire » modifié le 2026-09-01, non déployé** (commit `2d5c0b8`) : la pastille rouge de l'accueil et la liste E121 suivent « test passé » (tout résultat `ok`/`nok` sur la révision courante) au lieu de « test validé » ; `isManualTestValidated` -> `isManualTestDone`. Parcours `pastille-nouveaux-tests` en `revision: 2`, `WHATS_NEW` complété. 683/683 tests. Répond au retour de Marie du 2026-09-01 (« je l'ai déjà fait hier »). Partira au prochain `/deploy`.
- **`roadmap_sync_marie.md` close le 2026-09-01** : Phase 5 (bascule et retrait du flux manuel) `[FAIT]`. `/deploy` étape 0 ne réclame plus d'export de Marie — elle rafraîchit (`scripts/backup_marie_snapshot.py`, idempotent) puis analyse le dernier snapshot Supabase de `donnees_marie/` (format = exports historiques) et l'ingère (`scripts/ingest_manual_tests.py`) ; étapes 0.4-0.6 (revue Google Doc) inchangées. `/traiter_export_marie` marqué « Repli manuel — hors flux nominal », plus appelé par `/deploy`. Chemin de lecture dév conservé. Roadmap à archiver au prochain `/deploy`.
- **v5.69 déployée en prod le 2026-08-31** (`https://appli-audhd.netlify.app`) : socle Supabase de synchronisation fusionné dans `main` (fast-forward) et déployé. Rattrape v5.65→v5.68 en prod (prod était restée à v5.64). Sync auto des tables Dexie vers Supabase (région UE) via secret d'appareil `localStorage`, au démarrage + retour premier plan, throttle 1 h, échec silencieux hors ligne. Carte `SyncStatusCard` dans Paramètres (« Vos données de test sont partagées avec le développeur » + date). Lecture dév via `scripts/read_device_snapshots.py` (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` dans `.env`).
- **1re sync réelle de Marie sur v5.69 confirmée le 2026-09-01** : device `192f2411-9e09-495c-97ec-6df563f01732` (seul snapshot à usage réel sur 48 : `app_version` v5.69, 45 tâches, 49 `manual_test_results`, énergie/budget quotidiens jusqu'au 2026-09-01, `synced_at` 2026-09-01 10:47 UTC). Identité formelle non prouvée (device_id anonyme par design, recoupement `donnees_marie/` non fait — dossier sensible) mais faisceau d'indices concluant. Question ouverte P1 satisfaite. Aucun nouveau `manual_test_results` depuis le 2026-08-31 20:31 → parcours v5.69 (#3, #18, #20, sauvegarde auto) toujours non validés par Marie.
- **SAV locale du snapshot Supabase de Marie : fiabilisee, `roadmap_sav_snapshot_marie.md` close (2026-09-02)** : les 3 phases `[FAIT]`. `scripts/backup_marie_snapshot.py` gere les erreurs reseau (`URLError`/`TimeoutError`, `timeout=15`) en une ligne + exit 1, deduplique par **contenu** (plus par `synced_at`), refuse un `payload` vide, horodate en UTC explicite (`%Y%m%d-%H%Mz`), requete PostgREST ordonnee `synced_at.desc`, affiche l'appareil retenu. Acces Supabase factorise dans `scripts/_supabase.py` (consomme aussi par `read_device_snapshots.py`, qui referencait `urllib.error` sans l'importer). Retention `donnees_marie/` : `--prune`/`--dry-run`/`--keep-last` (defaut 30 + premier de chaque mois par appareil), jamais automatique — `/start` et `/close` appellent le script sans ces options ; `export-audhd-*.json` jamais touches. 31 auto-tests `unittest` verts (`scripts/test_backup_marie_snapshot.py`). Branchee en etape 4 de `/start` et etape 2 de `/close`. Comble l'absence d'historique cote Supabase (`upsert` d'une ligne unique par `device_id`). 2 doublons md5 du 2026-09-01 (`1641h41`, `1837h37`) encore sur disque : partiront a `--prune` ou une fois > 30 snapshots.
- **`roadmap_planning_accueil_2026-08-29.md` (demandes 18-22) : les 5 phases `[FAIT]` — roadmap close. Phases 1-2 en prod (v5.69) ; Phases 3-4-5 implémentées le 2026-09-02, non déployées. À archiver au prochain `/deploy`.** Phase 1 (#20) : planning accueil hauteur fixe 325 px, poignée + trait gris + drag/expand retirés. Phase 2 (#18) : teinte sur le conteneur de ligne (hauteur ∝ durée), sous-tâches dans le même aplat. **Phase 3 (#19)** : bandeau des jours de l'accueil (`dateStripStyle`→`dateStripBoxStyle`) reçoit un fond `color-mix(<ambiance> 14%, surface)` + `overflow: hidden` en plus de la bordure ; le jour affiché ressort en `var(--color-surface)` + bordure. **Phase 4 (#21)** : bandeau scindé en case fixe (`dateStripBoxStyle`) + piste interne (`dateTrackStyle`, seule à recevoir `translateX(dragOffset)`) ; `dayCellScale` grossit le jour central (`DAY_CELL_MAX_SCALE = 1.18`, dégressif). **Phase 5 (#22)** : route `planning` réaffectée à un écran pleine page `E12WeekPlanning.tsx` (grille 7 colonnes lun→dim, `<section aria-label="Planning de la semaine">`, tâches en boutons icône seule → fiche, glissement ±1 semaine via `weekStrip`, bouton « Aujourd'hui », sélecteur mois/année, Retour) ; bouton logo « Ouvrir le planning de la semaine » à gauche du mois dans `PlanningBoard`. Route `planning` libérée de son double rôle : mémoire du jour de l'accueil → nouveau champ `dashboard.date` ; atterrissage après planification d'une tâche → `dashboard`. `DevResetButton.tsx` non touché (nom d'écran `planning` réutilisé). Pas d'extraction d'un bandeau de jours partagé (roadmap la marquait optionnelle). Décisions Phase 5 (tranchées 2026-08-30/31) : navigation par semaine si les 7 jours tiennent à l'écran, sinon par jour (Marie, décision 4) — gate = test manuel Marie, repli jour-par-jour si illisible ; route `planning` réaffectée sans route dédiée (dév, décision 5) ; cellules icône seule (décision 6). Parcours catalogue : `planning-hauteur-fixe`, `case-de-tache-coloree-en-entier`, `bandeau-des-jours-colore`, `defilement-des-jours-dans-la-case`, `vue-planning-de-la-semaine`, `donnees-synchronisees-automatiquement`.
- **Étape 0.4 de `/deploy` (revue du Doc obligatoire + jalon daté + porte 3.9) exercée pour la première fois en live le 2026-08-31** (déploiement v5.69) : jalon `Dernière exécution de la revue : 2026-08-31` posé, porte 3.9 franchie.
- **Branches Git triées le 2026-08-31** (priorité P1) : 7 branches locales obsolètes supprimées (`integration/supabase-main` fusionnée FF dans `main` en v5.69 ; instantanés `v2`, `v3`, `v4`, `v4.1`, `v5.0`, `v5.1` — toutes ancêtres de `main`, `v2`/`v4`/`v4.1` en `-D` après vérif `merge-base --is-ancestor`), 6 distantes supprimées sur GitHub (`v2`→`v5.1`). Restent `main` et `sync-marie` (branche de recherche, 57 derrière / 28 devant `main` ; son objet Supabase est désormais dans `main`, à réévaluer après `roadmap_sync_marie` Phase 5). `main` vérifié sain : build, lint, tests verts, arbre propre (hors `commentaires_marie_v5.69.docx` non suivi), local == distant à `1311805`.
- **`roadmap_bundle_2026-08-31.md` et `roadmap_e2e_2026-09-01.md` archivées dans `Archives/` le 2026-09-01** (toutes deux closes). Bundle : chunk d'entrée 766,88 → 242,21 kB (−68,4 %), total démarrage (+ `AppContext.tsx` préchargé) 392,54 kB. Phases 0-2 et 4 `[FAIT]`, Phase 3 `[ABANDONNÉE]` (condition de lancement non remplie — Phase 2 avait déjà mesuré 242,21 kB, sous la cible finale de 450 kB ; gain résiduel −14 kB jugé inférieur au coût de duplication d'`id`, décision explicite de l'utilisateur). Phase 1 : retrait `@supabase/supabase-js` → `fetch` PostgREST natif (gain -208 kB, flux de sync inchangé). Phase 2 : 29 écrans en `React.lazy`, error boundary + `vite:preloadError`. Phase 4 : `scripts/check_bundle_budget.mjs` élargi aux chunks `modulepreload` (couvrait mal `AppContext.tsx`), seuils verrouillés (`bundle.budget.json`), contrôle bloquant branché en étape 6 de `/deploy` ; `vite.config.ts` corrigé (`outDir` `dist/v5.1` → `dist/dev`, `chunkSizeWarningLimit` 260). Validé manuellement par l'utilisateur sur téléphone (`vite preview --host`, build de prod servi en LAN). **Pas encore déployé** : prod toujours en v5.69.
- **Suivi des demandes du Google Doc de Marie** : registre durable `_contexte/marie_modifications_suivi.md`, réconcilié par `/analyser_googledoc` et la revue commune `.claude/revue_googledoc.md` (câblée dans `/deploy` étape 0 et `/traiter_export_marie`). « Dernière revue du Doc » = 2026-09-03 17:20 UTC. Demandes 1-17 : 16 livrées, #7 écartée, retirées du Doc (lignes conservées). 18, 20 retirées (livrées Phases 1-2 planning). Doc actuel : 19, 21, 22 (planning Phases 3-5) + 23-33 (`roadmap_demandes_marie_2026-09-02.md`, 10 phases `[FAIT]`). Aucune demande nouvelle au 2026-09-03.
- **Export de Marie du 2026-08-30 20:14 traité** (`export-audhd-2026-08-30-20h14.json`) : aucune perte, structure v3.5 inchangée, +1 tâche / +2 énergie / +2 budget (usage normal), **0 nouveau résultat de test** (identique à l'export du 28/08). `cadre-date-heure-dans-l-ecran` reste `nok` (« ça dépasse toujours ») = #3, corrigé en v5.64, à revalider par Marie.
- **Historique WhatsApp avec Marie** : `COMMUNICATION/Marie/historique_whatsapp.md`, alimenté manuellement (l'utilisateur colle les messages). Mémoire durable des questions/réponses/décisions produit.
- **Règles durables (utilisateur, 28/08) sur les messages pour Marie** (`CLAUDE.md` § Spécificités projet) : prêt à copier-coller, encadré `💻🤖`, hyper synthétique sans formule de politesse, isolé dans son propre `POST /send` (aucun commentaire dans la même bulle). Techniquement, les emoji astraux passés par `ConvertTo-Json` de PowerShell 5.1 provoquent un HTTP 400 sur `/send` — les insérer dans la chaîne JSON après sérialisation, puis encoder en octets UTF-8.
- **v5.58 déployée en prod le 2026-08-25** (`https://appli-audhd.netlify.app`, HTTP 200 vérifié) : `roadmap_retours_marie_2026-08-25.md` livrée : retrait de « Terminer » de la fiche de tâche, réglage de couleur des outils dans Paramètres > Accessibilité et accès direct à la modification de l’énergie depuis l’accueil. Suite complète : 608 tests verts, TypeScript et lint verts. Commentaire de livraison publié sur Drive : `COMMUNICATION/Marie/livraisons/v5.58.md`.
- **v5.60 déployée en prod le 2026-08-27** (`https://appli-audhd.netlify.app`, HTTP 200 vérifié) : le catalogue versionne désormais les tests modifiés. Le test « Menu d’actions simplifié sur la fiche d’une tâche », validé avant le retrait de « Terminer », est de nouveau visible jusqu’à sa validation sur la nouvelle version. Suite complète : 610 tests verts, TypeScript et lint verts. Commentaire publié sur Drive : `COMMUNICATION/Marie/livraisons/v5.60.md`.
- **v5.61 déployée en prod le 2026-08-27** (`https://appli-audhd.netlify.app`, HTTP 200 vérifié) : la modification d’un montant Budget est temporaire sur la catégorie et la période affichées ; le montant habituel reste modifiable. Export Marie du 27/08 analysé sans perte ni friction : 3 tests validés. Suite complète : 612 tests verts, TypeScript et lint verts. Commentaire publié sur Drive : `COMMUNICATION/Marie/livraisons/v5.61.md`.
- **v5.52 déployée en prod le 2026-08-24** (`https://appli-audhd.netlify.app`, HTTP 200 vérifié) : export de Marie du 23 août traité, trois retours corrigés (fond neutre des tâches sans couleur, retour vers la catégorie d’origine d’un élément de liste, contrôle « Couleur » visible sur les outils). Suite complète : 605 tests verts. Les trois parcours sont présents dans le catalogue in-app pour validation par Marie. Aucun redéploiement depuis.
- **Export de Marie du 2026-08-24 11:46 traité** : aucune perte ni incohérence comparé à celui du 23 août ; 3 résultats de tests ajoutés au journal. Le seul retour nouveau (« libellé Couleur introuvable ») correspond au correctif déjà présent dans la version à déployer.
- **v5.51 déployée en prod le 2026-08-20** (HTTP 200 vérifié) : `roadmap_demandes_marie_v1.md` Phases 1-5 — couleur de tâche neutre par défaut, suppression d'une catégorie de liste, accès direct énergie, détail d'élément de liste (description + sous-tâches), encadrement + glissement animé du bandeau de dates, couleur de fond par outil. TA2 et AP1 de cette roadmap non importés : `main` avait déjà, indépendamment, une meilleure implémentation du même besoin.
- **Incident de branche (2026-08-19) clos et corrigé préventivement** : plusieurs sessions de travail sur les demandes de Marie avaient été faites par erreur sur `sync-marie` sans vérifier sa divergence avec `main` (jamais fusionnée depuis le 2026-08-16). `.claude/commands/start.md` vérifie désormais la divergence de branche avant de charger le contexte ; `.claude/memory.md` porte la règle. `.gitignore` complété au passage (`__pycache__/`, captures de calibration ROBERTO — règles déjà sur `sync-marie`, jamais reportées).
- `donnees_marie/` : exports réels de Marie stockés en local, gitignorés, donnée sensible déclarée dans `CLAUDE.md`. Export du 2026-08-19 traité (archivé, ingéré : 10 nouvelles entrées journal) — 3 frictions non bloquantes relevées (test IDs obsolètes en cache client, rejet du geste de glissement planning par Marie avec demande de comportement alternatif, incompréhension retrait livret/catégorie budget qui est par design) : à traiter comme futures demandes, pas corrigées à chaud.
- `.claude/commands/traiter_export_marie.md` : traite l'arrivée d'un export de Marie indépendamment de `/deploy`, et exécute désormais aussi la revue du Google Doc (étape 7). `/deploy` étape 0 fait le même travail en interne, redondance non retirée — à évaluer si gênant.
- Marie a validé un découpage du travail en 7 catégories (Accueil/Planning, Tâches, Outils : Budget, Outils : Listes, Outils : autres, Énergie, Paramètres/Profil) — `COMMUNICATION/message_marie_categories_travail.md`. Le catalogue de tests manuels (`manualTestsCatalog.ts`) applique déjà ce découpage ; les autres roadmaps/communications ne l'appliquent pas encore.
- `roadmap_budget_v3.md` : deuxième refonte complète du concept Budget, intégralement livrée (Phases 1-6 `[FAIT]`), déployée avec v5.49 puis v5.51 — jamais testée par Marie en conditions réelles. Son choix structurant (Montant total/Mon compte basés sur les dépenses réelles) a été explicitement inversé le 2026-08-24 par `roadmap_demandes_marie_2026-08-24.md` (retour aux prévisions), sur confirmation de l'utilisateur — cette roadmap reste un historique valide de ce qui a été livré et pourquoi, pas l'état actuel du calcul.
- `manualTestsCatalog.ts` : les tests demandés à Marie couvrent v5.56 et v5.58, dont le menu simplifié des tâches, Budget/Comptes, l'ajout de catégorie de liste sur mobile, l'énergie et le contrôle « Couleur ».
- `tests_manuels.md` : contrôles dev en attente — SAV Marie dans `/close` (chemin écriture réelle), bot Discord file d'attente en conditions réelles, veille `/discord_loop` `wait 3600`, Gateway Discord Phase 1 (routage mécanique, orphelin `processing`) et Phase 2 (gardien, `drain` auto par `bot.py`, dead-letter). Les tests Marie restent dans le catalogue in-app `manualTestsCatalog.ts`.
- `_contexte/dernier_deploiement.md` : v5.69, 2026-08-31.
- Site de test `appli-audhd-dev.netlify.app` (`NETLIFY_SITE_ID_DEV` dans `.env`) : déployable via `/deploy_dev`.
- `/deploy` et `/deploy_dev` vérifient la fraîcheur de `manualTestsCatalog.ts` avant le déploiement.

## Questions ouvertes
- [P2] **`roadmap_demandes_marie_2026-09-02.md` Phase 10 (#3 + #32) `[FAIT]` le 2026-09-03**, non déployée. Captures de Marie reçues, correctif `width: 100%` + `minmax(0,1fr)` + `flexWrap: wrap`, 719 tests verts. Reste : déployer, puis Marie valide les débordements sur son appareil avant de passer #3/#32 à `livrée`. — fait quand : `/deploy` fait + snapshot postérieur ou message de Marie confirmant `cadre-date-heure-dans-l-ecran` rev 1 et `cadres-parametres-tiennent-dans-l-ecran` en `ok` → registre `livrée vX.Y` — réf : `roadmap_demandes_marie_2026-09-02.md` Phase 10, `_contexte/marie_modifications_suivi.md`, `COMMUNICATION/Marie/captures/2026-09-03/`
- [P2] **`roadmap_gateway_discord_service.md` Phase 3 à lancer** (Phases 1-2 `[FAIT]` le 2026-09-03, au checkpoint `/compact`) : hooks `SessionStart`/`Stop` de livraison en direct, `poll --zone <alias>` (sortie compacte exploitable en hook, `RIEN` si vide), nouvelle étape « identité d'agent » dans `start.md` + `poll --zone` initial, étape symétrique dans `close.md`, `discord_loop.md` (service quasi-permanent), `CLAUDE.md` § Contrôle du contexte, tests `poll --zone`. Les hooks ne bloquent jamais sur erreur. — fait quand : Phase 3 `[FAIT]`, `test_gateway.py` vert, test manuel dev (message routé vers `inbox/orchestrateur/` vu au tour suivant via hook `Stop` sans polling ; `/start` zone `design` affiche l'inbox accumulé) OK — réf : `roadmap_gateway_discord_service.md` Phase 3, `.claude/settings.json`, `.claude/commands/start.md`, `.claude/commands/close.md`
- [P3] **`roadmap_gateway_discord_service.md` Phases 1-2 : 6 écarts à la lettre de la roadmap à valider ou corriger en Phase 3** : (1) `enqueue --expect-reply` ne pose pas le `pending` (posé au `drain`) ; (2) appariement des réponses par auteur Discord (`MARIE_USER_ID`/`MORPHEUS_USER_ID`) ; (3) `attachments` transportés par `route_inbound` ; (4) heuristique en frontières de mot `\b` ; (5) `drain` toutes les 5 s (throttle) et non à chaque tour de `boucle_polling` ; (6) `failed` reste dans l'outbox, ré-`approve` pour retenter. — fait quand : chaque écart validé explicitement avec l'utilisateur ou corrigé — réf : `_contexte/signals.md` § Dernière session, `DISCORD/discord_com/gateway.py`
- [P2] **`drain` automatique de `bot.py` non éprouvé en réel** : `bot.py` redémarré (PID 82188) appelle `gateway.drain()` toutes les 5 s, mais aucun vrai message Discord n'est encore parti par ce chemin. — fait quand : un `enqueue` propre + `approve` → message effectivement posté sur Discord par le bot, archivé dans `outbox/sent/` — réf : `tests_manuels.md` § « Gateway Discord Phase 2 », `DISCORD/discord_com/bot.py` (`drainer_gateway`)
- [P2] **`bot.py` perd les pièces jointes des messages qui @-mentionnent le bot** (option 3, à faire plus tard) : la branche « Mode commande Claude » de `on_message` (`bot.py:214+`) ne lit pas `message.attachments` ; seul le trafic de canal hors @-mention passe par `route_inbound` (`bot.py:202-212`) qui les transporte. Marie tague spontanément le bot pour lui répondre → ses captures sont systématiquement perdues (cas réel du 2026-09-03 19h16, contourné par transmission manuelle via l'utilisateur). Les URLs Discord ne sont pas journalisées (`log_conv` = `content` seul, `bot.py:183`). — fait quand : les `attachments` d'un message @bot sont transportés (entrée `commands.json` ou doublon gateway) et journalisés — réf : `DISCORD/discord_com/bot.py:183`, `bot.py:202-234`, `roadmap_gateway_discord_service.md`
- [P2] **Déployer les 10 phases de `roadmap_demandes_marie_2026-09-02.md`** (demandes 23-33) — toutes `[FAIT]`, non déployées, 719 tests verts. Partiront au prochain `/deploy` (cible v5.84) avec le backlog déjà en attente (pastille `2d5c0b8`, bundle, planning 3-4-5). Marie a demandé le 2026-09-02 « dans combien de temps la nouvelle version » : réponse à formuler au `/deploy`. — fait quand : `/deploy` exécuté, version en prod incluant ces phases, `roadmap_demandes_marie_2026-09-02.md` déplacée dans `Archives/` — réf : `roadmap_demandes_marie_2026-09-02.md`, `COMMUNICATION/Marie/a_transmettre.md`, `COMMUNICATION/Marie/historique_whatsapp.md`
- [P2] **Déployer le travail de `roadmap_bundle_2026-08-31.md`** (close le 2026-09-01, jamais mis en prod) : chunk d'entrée 242,21 kB, garde-fou `bundle:check` branché dans `/deploy`. Pas urgent en soi (aucune régression fonctionnelle, gain invisible pour Marie tant qu'il n'y a pas de nouveau déploiement), mais partira naturellement avec le prochain `/deploy`. — fait quand : `/deploy` exécuté avec succès, nouvelle version en prod incluant ce travail — réf : `roadmap_bundle_2026-08-31.md`, `_contexte/dernier_deploiement.md`
- [P1] **Revalidation des tests v5.69 par Marie après déploiement du correctif pastille** : Marie a répondu le 2026-09-01 (« je l'ai déjà fait hier ») — parcours passés le 2026-08-31 en marquant « Non validé » ceux qui échouent. Le grief (un parcours « non validé » reste compté « à valider ») est corrigé en commit `2d5c0b8` (`isManualTestDone`), non déployé. — fait quand : correctif déployé + snapshot postérieur montrant les parcours #3/#18/#20 sortis de la liste ou re-signalés — réf : `COMMUNICATION/Marie/historique_whatsapp.md`, `src/domain/rules/manualTestRules.ts`, `scripts/backup_marie_snapshot.py`
- [P2] **`roadmap_planning_accueil_2026-08-29.md` close** : les 5 phases `[FAIT]`. Phases 1-2 en prod (v5.69), Phases 3-4-5 implémentées le 2026-09-02 et non déployées. Roadmap à archiver au prochain `/deploy`. — fait quand : `/deploy` exécuté, nouvelle version en prod incluant Phases 3-4-5, roadmap déplacée dans `Archives/` — réf : `roadmap_planning_accueil_2026-08-29.md`, `src/ui/screens/dashboard/PlanningBoard.tsx`, `src/ui/screens/dashboard/E12WeekPlanning.tsx`
- [P1] Retirer du dépôt le lien Google Drive du commentaire de livraison v5.58 et le stocker dans `.env` ; ne jamais versionner ce lien. — fait quand : le lien n’est plus suivi par Git et est lu depuis `.env` — réf : `COMMUNICATION/Marie/livraisons/v5.58.md`, `.env.example`, `.gitignore`
- [P3] Rangement des `commentaires_marie_vX.Y.docx` créés à la racine par `/deploy` étape 11 — **traité le 2026-09-03** : `commentaires_marie_*.docx` ajouté à `.gitignore` (l'historique figé vit dans `COMMUNICATION/Marie/livraisons/vX.Y.md`, publié aussi sur Drive). Les fichiers `.docx` restent à la racine mais ne polluent plus `git status`. — fait quand : plus aucun `.docx` de commentaire n'apparaît dans `git status` — réf : `.gitignore`, `.claude/commands/deploy.md` étape 11
- [P1] Fiabiliser la clôture des roadmaps dans `/deploy` : analyser la roadmap active avant le build et annuler le déploiement si elle n’est pas terminée ; archiver la roadmap après un déploiement réussi. — fait quand : la procédure bloque une roadmap incomplète et archive une roadmap livrée — réf : `.claude/commands/deploy.md`, `Archives/roadmap_retours_marie_2026-08-25.md`, `Archives/`
- [P1] Demander à Marie de tester en conditions réelles les parcours v5.56 signalés dans le catalogue in-app. — fait quand : nouvel export de Marie ingéré avec les tests v5.56 validés — réf : `manualTestsCatalog.ts`, `_contexte/marie_tests_journal.json`
- [P2] #3 (cadre Date/Heure du formulaire de tâche) : correctif v5.64 (`min-width: 0` sur `<form>`) jugé insuffisant par Marie le 2026-08-31, **repris en Phase 10 le 2026-09-03** sur ses captures (`width: 100%` sur `<main>`/`<form>` + `repeat(6, minmax(0, 1fr))` sur la grille énergie). Fusionné avec le suivi Phase 10 ci-dessus. — fait quand : voir l'entrée Phase 10 — réf : `roadmap_demandes_marie_2026-09-02.md` Phase 10
- [P2] Traiter les 3 frictions du 2026-08-19 comme nouvelles demandes lors du prochain `/traiter_demandes_marie` : geste de glissement planning à revoir (pousser le contenu plutôt que superposer — cohérent avec la demande initiale de Marie sur ce point, jamais satisfaite en l'état), clarifier avec Marie le lien retrait de livret/catégorie budget, vérifier la disparition des test IDs obsolètes après le nouveau déploiement. — fait quand : les 3 points tranchés ou intégrés à une roadmap — réf : `_contexte/marie_tests_journal.json` (entrées `44f24c63`, `be0c10ef`, `6e32ace5`)
- [P2] Appliquer le découpage en 7 catégories validé par Marie aux autres communications/roadmaps (pas seulement le catalogue de tests). — fait quand : convention explicite adoptée pour les prochaines roadmaps/communications — réf : `COMMUNICATION/message_marie_categories_travail.md`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `Archives/roadmap_v5.1.md` § Q à trancher
- [P3] `todayStr()` (`planningSlotRules.ts`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold toujours visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`
- [P3] Durcir `/discord_loop` : ~~auto-rattrapage au démarrage si `commands.json` bloqué en `processing`~~ **fait 2026-09-03** (`bot.py recuperer_processing_orphelin()`, seuil `ORPHAN_PROCESSING_MINUTES = 15`, appelé dans `on_ready` — test manuel dev en attente, `tests_manuels.md`). Reste : ajouter un `stop` qui notifie Discord « Claude hors ligne ». — fait quand : la commande `stop` de `/discord_loop` notifie Discord — réf : `.claude/commands/discord_loop.md`, `DISCORD/discord_com/bot.py` (`recuperer_processing_orphelin`), `DISCORD/discord_com/discord_loop.py`
- [P3] `PlanningBoard.tsx` : le bouton « Reporter » (mode surcharge) est imbriqué dans le `<button>` de ligne — HTML invalide, avertissement jsdom au run des tests. Pré-existant, révélé par la Phase 2. Candidat à une phase de refacto entre deux phases fonctionnelles de la roadmap planning. — fait quand : le bouton « Reporter » n'est plus descendant du bouton de ligne — réf : `src/ui/screens/dashboard/PlanningBoard.tsx` (rendu d'une ligne), `roadmap_planning_accueil_2026-08-29.md`
- [P3] Nettoyage arbre de travail pré-`/deploy` (gate 3.1) — **traité le 2026-09-03** : `DESIGN/` ajouté au suivi Git (commit de close), `commentaires_marie_*.docx` gitignorés (`.gitignore`), `bot.pid` déjà gitignoré, `gateway/agents.json` commité. Reste à surveiller : que le prochain `/deploy` passe bien la porte 3.1. — fait quand : `/deploy` franchit la porte 3.1 sans résidu — réf : `.claude/commands/deploy.md` étape 3.1, `.gitignore`
- [P3] Reliquat d'adoption de la gateway Discord v1 (`DISCORD/roadmap_gateway_discord_2026-09-02.md` Phase 3, « hors zone discord ») : MAJ `agent_role.md` orchestrateur + `design`, retrait des appels directs (`message_marie.py`, `claude_bridge`) dans `.claude/commands/deploy.md` et `analyser_googledoc.md`, alignement `.claude/CLAUDE.md`. `discord_loop.md` étape 3b : **réécrit le 2026-09-03** (Phase 2 de la roadmap service — `bot.py` route mécaniquement, plus de `route_inbound` manuel ; étape 3a-bis « gardien de sortie » ajoutée). En partie recouvert par `roadmap_gateway_discord_service.md` — à trancher : traiter isolément ou laisser la roadmap service l'absorber (Phase 3 touche `CLAUDE.md`). — fait quand : plus aucun appel direct à `message_marie.py`/`claude_bridge` dans les commandes de l'orchestrateur, ou décision explicite de le porter dans `roadmap_gateway_discord_service.md` — réf : `DISCORD/roadmap_gateway_discord_2026-09-02.md` (§ Statuts, Phase 3), `roadmap_gateway_discord_service.md`

## Dernière session (2026-09-03 — /analyser_googledoc + Phase 10 roadmap demandes Marie : débordements #3 + #32 corrigés)

## Décisions prises
- **`/deploy` lancé, arrêté à l'étape 0.4** : Google Doc de Marie modifié le 2026-09-03 17:20 UTC (> dernière revue 2026-08-31). `/analyser_googledoc` exécuté avant de reprendre.
- **Aucune demande numérotée nouvelle / retirée / reformulée** dans le Doc : mêmes 14 demandes (19, 21, 22, 23-33). Seul changement matériel : arrivée des **captures #3 + #32** (transmission manuelle, `COMMUNICATION/Marie/captures/2026-09-03/`, commit 9f03d5d) → décision produit 7 de `roadmap_demandes_marie_2026-09-02.md` tranchée.
- **Phase 10 (#3 + #32) `[FAIT]`** : les 10 phases de la roadmap sont faites, non déployées. Roadmap complète — à archiver au prochain `/deploy`. #3 et #32 passeront à `livrée vX.Y` seulement après validation de Marie sur son appareil (post-déploiement).
- Nettoyage pré-`/deploy` fait : `DESIGN/` ajouté au suivi Git, `commentaires_marie_*.docx` gitignorés.

## Livrables produits ou modifiés
- `src/ui/screens/settings/E110Settings.tsx`, `E111Profile.tsx`, `E112Accessibility.tsx`, `E116Privacy.tsx`, `E117Export.tsx` : `width: '100%'` sur le conteneur `<main>` ; E112 `flexWrap: 'wrap'` sur la rangée « Petite/Normale/Grande ». Tests de style : `E110Settings.test.tsx`, `E112Accessibility.test.tsx`.
- `src/ui/screens/tasks/E21CreateTaskV2.tsx`, `E24EditTask.tsx` : `width: '100%'` sur `pageStyle` et sur le `<form>` (`minWidth: 0` conservé) ; `energyGridStyle` → `repeat(6, minmax(0, 1fr))`. Tests : `E21CreateTaskV2.test.tsx`, `E24EditTask.test.tsx`.
- `src/domain/data/manualTestsCatalog.ts` : `cadre-date-heure-dans-l-ecran` → `revision: 1` (étapes élargies) ; nouveau `cadres-parametres-tiennent-dans-l-ecran` (`docRefs: [32]`).
- `src/ui/screens/onboarding/E01Welcome.tsx` : 1 entrée `WHATS_NEW` (#3, #32).
- `COMMUNICATION/Marie/a_transmettre.md` : 1 entrée (#3, #32).
- `roadmap_demandes_marie_2026-09-02.md` : décision 7 tranchée, Phase 10 `[FAIT]`, sous-section « Re-analyse du 2026-09-03 », ligne #32 du tableau, « Après la dernière phase » réécrit.
- `_contexte/marie_modifications_suivi.md` : en-tête (revue Doc → 2026-09-03 17:20 UTC), lignes #3 et #32, précision #3, 2 entrées « Historique des revues ».
- `.gitignore` : `commentaires_marie_*.docx`. `DESIGN/` : `git add`.
- `_contexte/signals.md`, `_contexte/contexte.md`, `_contexte/archive_decisions.md` (entrée 2026-08-31 « tri des branches » archivée), `README.md`, `CHANGELOG.md` (v5.84) : ce `/close`.

## Hypothèses validées / invalidées
- VALIDE : les captures de Marie confirment le débordement sur les 2 écrans — formulaire de tâche (grille énergie 6e/12e case + `<input>` Date/Heure coupés à droite) et Paramètres > Accessibilité (cartes coupées à droite, pastilles/« × » hors champ).
- VALIDE : `tsc -b` + lint + **719 tests** (85 fichiers) verts avec le correctif Phase 10.
- EN ATTENTE : validation du correctif Phase 10 sur l'appareil de Marie (`cadre-date-heure-dans-l-ecran` rev 1 + `cadres-parametres-tiennent-dans-l-ecran`) — nécessite le déploiement d'abord.

## Prochaine étape exacte
Reprendre `/deploy` (cible **v5.84**). Étape 0.4 franchie (revue Doc à jour, jalon 2026-09-03). Le déploiement livre tout le backlog (demandes Marie Phases 1-10, planning 3-5, pastille `2d5c0b8`, bundle) et doit archiver `roadmap_demandes_marie_2026-09-02.md`, `roadmap_planning_accueil_2026-08-29.md`, `roadmap_sync_marie.md`, `roadmap_sav_snapshot_marie.md`.

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-09-03 — roadmap_gateway_discord_service.md Phases 1 et 2 : bot.py transmet tout le canal + gardien de sortie)

## Décisions prises
- **`roadmap_gateway_discord_service.md` Phases 1 et 2 `[FAIT]`** (exécutées par l'orchestrateur, agent DISCORD arrêté par l'utilisateur). Phase 1 : `bot.py` route vers `gateway.route_inbound` tout message du canal qui n'@-mentionne pas le bot (fin du `return` sec) ; `gateway/agents.json` (registre agent=zone, `Appli_TSA_SDI_TDAH`→alias `orchestrateur`, `design`, `discord`) remplace le tuple `AGENTS` en dur ; `state.pending_reply` (objet) → `pending_replies` (liste, migration paresseuse non destructive), appariement d'une réponse entrante à l'entrée la plus récente pour la cible de l'auteur (déduite de `MARIE_USER_ID`/`MORPHEUS_USER_ID`) ; écritures atomiques (`tmp`+`os.replace`) + verrou fichier `state.lock` (O_EXCL, récup périmé 30 s) autour des read-modify-write de `state.json` ; récupération orphelin `commands.json` bloqué en `processing` > 15 min au démarrage du bot. Phase 2 : statut par demande outbox `pending`→`approved`|`held`|`bounced`|`failed` ; verbes `approve`/`hold --reason`/`bounce --id --reason`/`merge --ids` ; `bounce` déplace vers `inbox/<source>/` en `kind:"bounce"` (motif + `original_body`), jamais sur Discord ; `drain` n'envoie que les `approved`, un `send_fn` qui lève → `failed` + dead-letter `inbox/discord/` + la boucle continue ; `bot.py boucle_polling` appelle `gateway.drain()` toutes les 5 s (verrou `drain.lock`) — plus aucun `drain` manuel.
- **Écarts à la lettre de la roadmap assumés** (validés implicitement — pas de retour utilisateur en checkpoint) : (1) `enqueue --expect-reply` ne pose pas le `pending`, il reste posé au `drain` (évite un pending fantôme pour un message tenu en Phase 2) ; (2) appariement des réponses par auteur Discord (hors liste, mais nécessaire pour connaître `to` ; corrige un bug où un tiers consommait le pending) ; (3) `attachments` transportés par `route_inbound` (hors liste, critique : la réponse attendue de Marie est faite de captures) ; (4) heuristique par mots-clés en frontières de mot `\b` et non sous-chaîne (sinon `bot` matchait `bouton`) ; (5) `drain` toutes les 5 s et non « à chaque tour » de `boucle_polling` (0,5 s) ; (6) `failed` reste dans l'outbox, ré-`approve` pour retenter.
- **Phase 1 validée en réel** : Marie a répondu le 2026-09-03 17h17 à la demande de captures — `bot.py` a routé sa réponse seul (`routing:"pending"`, `inbox/orchestrateur/20260903T171703_391686`, `pending_replies` vidé), sans session agent DISCORD. Le chemin `on_message` → gateway est donc éprouvé.

## Livrables produits ou modifiés
- `DISCORD/discord_com/gateway.py` : registre, `pending_replies[]`, verrous/atomicité, statuts outbox + gardien (`approve`/`hold`/`bounce`/`merge`), `drain` durci, CLI étendue.
- `DISCORD/discord_com/bot.py` : `on_message` route tout hors @-mention, `recuperer_processing_orphelin()`, `drainer_gateway()` + throttle 5 s dans `boucle_polling`.
- `DISCORD/discord_com/gateway/agents.json` : **créé** (non suivi — à `git add` dans le commit de close).
- `DISCORD/discord_com/test_gateway.py` : 17 → **58 tests** verts (registre, `pending_replies`, concurrence 12 threads, `attachments`, heuristique `\b`, statuts outbox, `bounce`, `merge`, échec d'envoi → `failed` + dead-letter).
- `DISCORD/discord_com/gateway/README.md`, `gateway/LOOP.md`, `.claude/CLAUDE.md` § Communication Discord, `.claude/commands/discord_loop.md` : gardien de sortie, statuts, `drain` automatique par `bot.py`, `drain` manuel interdit à tous.
- `DISCORD/discord_com/.gitignore` : `gateway/state.lock` → `gateway/*.lock` (couvre `drain.lock`).
- `COMMUNICATION/Marie/historique_whatsapp.md` : réponse partielle de Marie du 2026-09-03 17h17 (point 1 : « rubrique accessibilité des paramètres uniquement », sans capture ; point 2 / #3 sans réponse).
- `tests_manuels.md` : sections dev « Gateway Discord Phase 1 » (bullet `pending` marqué confirmé en réel) et « Gateway Discord Phase 2 ».
- `_contexte/signals.md`, `_contexte/contexte.md`, `CHANGELOG.md` (v5.83), `roadmap_gateway_discord_service.md` (statuts Phases 1-2) : ce `/close`.

## Hypothèses validées / invalidées
- VALIDE : 58 auto-tests `unittest` verts, `py_compile` OK sur `gateway.py` + `bot.py`.
- VALIDE (gateway réelle, zéro trafic Discord) : `enqueue` d'un corps avec `<X.Y>` reste `pending`, `drain` ne l'envoie pas ; `bounce --reason "fond non figé"` → JSON `kind:"bounce"` dans `inbox/orchestrateur/`, outbox vidée, aucun `.lock`/`.tmp` résiduel après `ack`.
- VALIDE (réel) : migration `state.json` non destructive puis consommée par la vraie réponse de Marie ; `pending_replies` désormais vide.
- EN ATTENTE : le `drain` automatique de `bot.py` (redémarré PID 82188) n'a pas encore envoyé de vrai message Discord ; test manuel dev tracé dans `tests_manuels.md`.
- EN ATTENTE : réponse complète de Marie — point 2 (#3, cadre Date/Heure du formulaire de tâche) et les captures d'écran des deux points.

## Prochaine étape exacte
`/compact` (checkpoint roadmap Phase 2), puis Phase 3 : hooks `SessionStart`/`Stop` de livraison en direct, `start.md`/`close.md`, `poll --zone`, docs. En parallèle, toujours en attente : les captures de Marie pour `roadmap_demandes_marie_2026-09-02.md` Phase 10, et `/deploy` v5.80 (backlog complet).

## Question bloquante pour la session suivante
Aucune — les 3 écarts à la roadmap (ci-dessus) sont signalés ; les valider ou les corriger en Phase 3.

---

## Dernière session archivée (2026-09-03 — /deploy tenté puis suspendu : attendre le retour de Marie avant v5.80 ; deux roadmaps Discord distinguées)

## Décisions prises
- **Déploiement de v5.80 suspendu** : attendre les 2 captures de Marie (écran Paramètres + cadre Date/Heure du formulaire de tâche) qui débloquent `roadmap_demandes_marie_2026-09-02.md` Phase 10 (#3 + #32), avant de livrer. Tout le backlog (Phases 1-9, planning 3-5, pastille `2d5c0b8`, bundle) partira avec ce même `/deploy`, une fois la Phase 10 traitée ou une décision de coder à l'aveugle prise avec l'utilisateur.

## Livrables produits ou modifiés
- `_contexte/marie_modifications_suivi.md` : jalon « Dernière exécution de la revue » → 2026-09-03 (revue Google Doc, `/deploy` étape 0.4 ; Doc inchangé depuis 2026-08-31 17:28).
- `_contexte/signals.md`, `_contexte/contexte.md`, `README.md`, `CHANGELOG.md` (v5.81) : ce `/close`.

## Hypothèses validées / invalidées
- VALIDE : `/deploy` étape 0 exécutée — snapshot `20260903-1513z` sans perte (usage normal : `list_items` +1, `energy_entries` +1, `budget_categories` +1), `manual_test_results` toujours à 49 (aucun test rejoué par Marie depuis le 2026-08-31 20:31), 17 `nok` tous anciens (≤ 2026-08-31) et déjà tracés ; ingestion journal 0 ajout ; Google Doc inchangé.
- CONSTAT : deux roadmaps Discord distinctes — `DISCORD/roadmap_gateway_discord_2026-09-02.md` (Phases 1-2-3 `[FAIT]` 2026-09-02 ; reliquat d'adoption côté orchestrateur : MAJ `agent_role.md` orchestrateur+design, retrait des appels directs `message_marie.py`/`claude_bridge` dans `deploy.md`/`analyser_googledoc.md`, alignement `.claude/CLAUDE.md`, câblage `discord_loop.md` étape 3b) ET `roadmap_gateway_discord_service.md` (racine, 3 phases `[TODO]`, non démarrée, la prolonge).
- BLOCAGE À LEVER AVANT `/deploy` : arbre non propre (gate 3.1) — `DESIGN/` (nouvelle zone-agent non suivie : `agent_role.md` + `_contexte/`), `DISCORD/discord_com/bot.pid` (runtime, à gitignorer), `commentaires_marie_v5.69.docx` (reliquat v5.69, question P1 ouverte).

## Prochaine étape exacte
Attendre la réponse de Marie : `python DISCORD/discord_com/gateway.py poll --agent orchestrateur`. À réception : traiter `roadmap_demandes_marie_2026-09-02.md` Phase 10 (#3 + #32), régler les 3 fichiers non suivis, puis `/deploy` v5.80 (backlog complet + archivage `roadmap_planning_accueil`, `roadmap_sync_marie`, `roadmap_sav_snapshot_marie`).

## Question bloquante pour la session suivante
Aucune — attente d'une donnée externe (les captures de Marie).

---

## Dernière session archivée (2026-09-03 — analyse système gateway Discord + roadmap service permanent ; message capture Phase 10 envoyé à Marie)

## Décisions prises
- `gateway.py drain` (envoi réel de l'outbox) réservé à l'agent DISCORD : règle ajoutée à `.claude/CLAUDE.md` § Communication Discord. Les autres agents s'arrêtent à `enqueue`, un outbox bloqué se signale à l'utilisateur. Suite à un `drain` lancé à tort par l'orchestrateur en début de session.
- Conception d'un agent DISCORD en service quasi-permanent actée avec l'utilisateur, figée dans `roadmap_gateway_discord_service.md` (3 phases `[TODO]`, non démarrée) : routage mécanique dans `bot.py` (option 2) ; livraison inter-agents par hooks `SessionStart`/`Stop` (pas de boucle de veille) ; agent = zone (`orchestrateur` = zone principale `Appli_TSA_SDI_TDAH`, futurs agents = nouvelles zones) ; 6 critères de rejet du gardien de sortie arrêtés.
- Roadmap à exécuter par l'orchestrateur, pas par l'agent DISCORD (modifie son propre substrat `bot.py`/`gateway.py`, touche des fichiers hors périmètre, exige checkpoints `/compact` et discipline git). Agent DISCORD à arrêter pendant Phases 1-2.

## Livrables produits ou modifiés
- `roadmap_gateway_discord_service.md` : créé — 3 phases `[TODO]`, 9 enjeux mesurés, décisions de cadrage, critères de rejet.
- `.claude/CLAUDE.md` : règle `drain` réservé à l'agent DISCORD (commité en session).
- `COMMUNICATION/Marie/historique_whatsapp.md` : message du 2026-09-03 demandant à Marie 2 captures (écran Paramètres + cadre Date/Heure du formulaire de tâche) pour débloquer `roadmap_demandes_marie_2026-09-02.md` Phase 10 ; déposé (`enqueue`) puis envoyé (`drain`) sur Discord (id `1545092577982808154`). Commité en session (×2).
- `_contexte/signals.md`, `_contexte/contexte.md`, `_contexte/archive_decisions.md` (décision 2026-08-30 archivée), `README.md`, `CHANGELOG.md` (v5.80) : ce `/close`.

## Hypothèses validées / invalidées
- VALIDE : un message déposé par `enqueue` ne part pas tout seul — `drain` est une étape distincte (assurée normalement par l'agent DISCORD, faite à la main cette fois par erreur).
- CONSTAT (analyse du code, non testé) : `bot.py:177` ne transmet que les messages qui @-mentionnent le bot → `route_inbound` (tag/heuristique) quasi mort ; `state.json.pending_reply` = créneau unique ; aucun verrou sur les écritures gateway ; `drain` sur échec d'envoi s'interrompt sans statut. → traités par la roadmap.
- EN ATTENTE : réponse de Marie aux 2 captures (`pending_reply` gateway `20260903T042325_687674` → `inbox/orchestrateur/`).

## Prochaine étape exacte
Attendre les captures de Marie (`gateway.py poll --agent orchestrateur`) pour débloquer `roadmap_demandes_marie_2026-09-02.md` Phase 10. En parallèle : lancer `roadmap_gateway_discord_service.md` Phase 1 (arrêter l'agent DISCORD d'abord), ou `/deploy` (backlog Phases 1-9 + pastille `2d5c0b8` + bundle + planning 3-5 ; archive `roadmap_planning_accueil`, `roadmap_sync_marie`, `roadmap_sav_snapshot_marie`).

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-09-02 — bot Discord : file d'attente des commandes + tag Marie explicite ; réponses produit de Marie tranchées)

## Décisions prises
- `bot.py` : un message reçu pendant que Claude traite est empilé (`commands.json` → `queue[]`) au lieu d'être rejeté ; `boucle_polling` le promeut en FIFO au retour à `idle`. Un seul promoteur (le bot), pas de verrou fichier (cohérent avec l'existant).
- Modèle message Marie : tag `<@1368654289584656394>` rendu explicite dans `CLAUDE.md`/`AGENTS.md` — le code (`gateway.curate()`) le posait déjà sans condition.
- Décisions produit de `roadmap_demandes_marie_2026-09-02.md` tranchées sur réponses Discord de Marie : #25 = « seulement planning », #29 = « retirer » E30 (déjà intégrées par le `/close` parallèle des Phases 1-9).
- Réponse à Marie sur le délai : envoyée via la gateway, sans date ferme.
- Divergence Git local/remote (deux `/close` le même jour) résolue d'elle-même — le remote a été aligné sur `7205355` ; aucun `reset`/`rebase` fait.

## Livrables produits ou modifiés
- `DISCORD/discord_com/bot.py` : `on_message` (empilement) + `boucle_polling` (promotion FIFO). Commit `2b75711`. Bot redémarré (`bot_manager.py`).
- `.claude/CLAUDE.md`, `AGENTS.md` : règle tag Marie explicite + ligne `<@…>` dans le gabarit de livraison. Commit `1670bca`.
- `roadmap_demandes_marie_2026-09-02.md` : décisions 1 (#25) et 6 (#29) marquées TRANCHÉ, Phases 3 et 8 mises à jour. Commit `d1db72e`.
- `COMMUNICATION/Marie/historique_whatsapp.md` : réponses de Marie aux 2 questions, sa question sur le délai, la réponse envoyée. Commits `2b75711`, `2801432`.
- `tests_manuels.md` : section « Bot Discord — file d'attente en conditions réelles » (test dev en attente).
- `_contexte/signals.md`, `_contexte/contexte.md`, `CHANGELOG.md` (v5.79) : ce `/close`.

## Hypothèses validées / invalidées
- VALIDE : logique de file testée en isolation (empilement quand occupé, promotion FIFO à `idle`, auteur préservé).
- VALIDE : `gateway.curate('marie', …)` rend `💻🤖\n<@1368654289584656394>\n<corps>\n💻🤖` — tag inconditionnel.
- EN ATTENTE : comportement de la file avec le vrai bot + Discord (2-3 messages concurrents) — cf. `tests_manuels.md`.
- ANGLE MORT : session `/discord_loop` tombée en plein traitement → `commands.json` bloqué en `processing`, file non promue en silence, remise à `idle` manuelle nécessaire (faite pour une commande orpheline de Marie cette session).

## Prochaine étape exacte
Demander à Marie (Discord/gateway) une capture de son écran Paramètres pour débloquer `roadmap_demandes_marie_2026-09-02.md` Phase 10. Puis `/deploy` : livre Phases 1-9 + backlog (pastille `2d5c0b8`, bundle, planning 3-4-5) ; archive `roadmap_planning_accueil`, `roadmap_sync_marie`, `roadmap_sav_snapshot_marie`. Optionnel : durcir `/discord_loop` (question P3).

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-09-02 — roadmap_demandes_marie_2026-09-02.md Phases 1 à 9 : demandes 23-31 + 33 — Phase 10 bloquée)

## Décisions prises
- Les 9 phases faisables de `roadmap_demandes_marie_2026-09-02.md` implémentées d'affilée sur demande de l'utilisateur (« go toutes les phases »), sans checkpoint `/compact` intermédiaire. Phases 1, 2, 4 faites en segments antérieurs de la session ; 3, 5, 6, 7, 8, 9 ce segment. **Phases 1-9 `[FAIT]`, non déployées.**
- Phase 10 (#3 + #32, débordements horizontaux) **laissée `[BLOQUÉ]`** : la décision 7 de la roadmap exige une capture récente de l'écran Paramètres de Marie ; pas de code à l'aveugle. Roadmap **non archivée** (reste active tant que Phase 10 n'est pas faite).
- Réponses Marie du 2026-09-02 (Discord, gateway) : décision 1 (#25) = durée obligatoire **uniquement pour une tâche planifiée avec une heure** ; décision 6 (#29) = **retirer** l'écran « Mon énergie » (E30) entièrement. Loggées `historique_whatsapp.md`, ackées.
- Décision 5 (#31) appliquée : `mon_compte_color` est un champ libre de `Settings` (comme `ambiance_color`), écrit par `updateSettings` — **aucune migration Dexie ni colonne Supabase dédiée**.

## Livrables produits ou modifiés
- `src/ui/styles/ambiance.ts` (+ `ambiance.test.ts` créé) : #23 — `plannedTaskTintStyle` ne force `#fff` que si couleur effective ≠ `var(--color-surface)`.
- `src/ui/screens/dashboard/E10Dashboard.tsx`(`.test.tsx`) : #30 carte d'outil teintée `pastelBackground` ; #31 carte « Mon compte » teintée `settings.mon_compte_color`. Libellé « Comptes »→« Mon compte » (#27).
- `src/ui/screens/dashboard/PlanningBoard.tsx`(`.test.tsx`) : #24/#25 — `rowStyle` `alignItems: flex-start`, `timeColStyle` (colonne pleine hauteur `justify-content: space-between`), heure de fin rendue si présente et ≠ début. +3 tests.
- `src/ui/screens/tasks/E21CreateTaskV2.tsx`(`.test.tsx`), `E24EditTask.tsx`(`.test.tsx`) : #25 — durée obligatoire si planifiée (`hasDuration`), message d'aide. Tests ajustés + `+3` (E24 ×2, dont « sans heure = durée facultative »).
- `src/domain/rules/budgetRules.ts`(`.test.ts`) : `getMonCompteSolde()` (#28) + 3 tests.
- `src/ui/screens/tools/E75BudgetAccount.tsx`(`.test.tsx`) : bloc « Solde du mois » en tête (#28), titre « Mon compte » (#27). +1 test.
- `src/ui/screens/tools/E71Budget.tsx`(`.test.tsx`) : carte « Prévisions » positive + verte (#26) ; lien d'accès relabellé « Prévisions » (#27). +1 test.
- `src/ui/screens/tools/E78BudgetPrevisions.tsx`(`.test.tsx`) : titre « Prévisions » (#27, décision 4). +1 test.
- `src/domain/entities/settings.ts` : `mon_compte_color?`. `src/ui/screens/settings/E112Accessibility.tsx`(`.test.tsx`) : entrée fixe « Mon compte » dans « Couleur des outils » (#31). +3 tests.
- `src/ui/screens/energy/E31EnergyCheckIn.tsx`(`.test.tsx`) : « Retour »/« Ignorer » → `dashboard` (#29). `E30EnergyView.tsx`(`.test.tsx`) **supprimés** ; `navigation.ts`, `App.tsx`, `DevResetButton.tsx`, `App.suspense.test.tsx`, `e2e/03-energy.spec.ts` nettoyés de `energy-view`.
- `src/ui/screens/lists/E61ListDetail.tsx`(`.test.tsx`) : sous-tâches d'un élément dépliables/cochables dans la page de catégorie (#33). +3 tests.
- `src/domain/data/manualTestsCatalog.ts` : `utiliser-le-budget` rev 3 (docRefs +26,+27), `utiliser-comptes` rev 4 (+27,+28), `couleur-de-fond-par-outil` rev 3 (+31), `consulter-et-modifier-l-energie` rev 2 (+29) ; parcours neufs `nom-de-tache-en-haut-de-case`, `heures-debut-fin-sur-la-case`, `duree-obligatoire-tache-planifiee`, `sous-taches-element-liste-dans-la-categorie`.
- `src/ui/screens/onboarding/E01Welcome.tsx` : 8 entrées `WHATS_NEW` (23, 30, 27, 24+25, 28, 26, 29, 31, 33).
- `roadmap_demandes_marie_2026-09-02.md` : Phases 1-9 `[FAIT]`, Phase 10 `[BLOQUÉ]`. `COMMUNICATION/Marie/a_transmettre.md` : commentaires de livraison ajoutés. `_contexte/marie_modifications_suivi.md` : 23-31, 33 → `en cours (implémenté, non déployé)` ; 32 → `en cours Phase 10 (bloqué)`.
- `.claude/commands/deploy.md`, `.claude/commands/discord_loop.md`, `.claude/zones.md`, `_contexte/marie_tests_journal.json` : modifiés/ajoutés dans des segments antérieurs de la session (analyse Doc + gateway Discord).

## Hypothèses validées / invalidées
- VALIDE : `tsc -b`, lint, suite complète **716/716** (85 fichiers) verts. Net +9 vs 707 : ~+17 nouveaux tests, −8 de la suppression d'`E30EnergyView.test.tsx`.
- VALIDE (jsdom) : `<section aria-label="Solde de Mon compte">` expose `role="region"` — utilisé pour scoper les assertions du bloc solde.
- EN ATTENTE : rendu mobile / validation Marie — position du nom et des heures sur la case planning (#24/#25), lisibilité du « Solde du mois » (#28), couleur de la carte « Prévisions » (#26), teinte de la carte « Mon compte » (#31), sous-tâches dans la page de catégorie (#33).
- EN ATTENTE : capture de l'écran Paramètres de Marie pour débloquer la Phase 10 (#3 + #32).

## Prochaine étape exacte
Demander à Marie (Discord, via gateway) une capture récente de son écran Paramètres pour la Phase 10. Puis `/deploy` : livre Phases 1-9 + le backlog en attente (pastille `2d5c0b8`, bundle, planning 3-4-5) ; répondre à Marie sur le délai ; archiver `roadmap_planning_accueil`, `roadmap_sync_marie`, `roadmap_sav_snapshot_marie` — garder `roadmap_demandes_marie_2026-09-02.md` active si Phase 10 pas faite.

## Question bloquante pour la session suivante
Aucune (Phase 10 est bloquée par une donnée externe, pas par une décision à prendre).

---

## Dernière session archivée (2026-09-02 — roadmap_planning_accueil Phases 3-4-5 : bandeau des jours coloré, glissement interne, vue semaine pleine page — roadmap close)

## Décisions prises
- `roadmap_planning_accueil_2026-08-29.md` Phases 3 (#19), 4 (#21) et 5 (#22) implémentées ensemble, un seul cycle, checkpoint `/compact` à la fin. **Les 5 phases `[FAIT]` — roadmap close, non déployée, à archiver au prochain `/deploy`.**
- Décision 5 appliquée : route `planning` réaffectée à la vue semaine pleine page, pas de route dédiée. `DevResetButton.tsx` **non touché** (nom d'écran `planning` réutilisé, pas renommé) — écart assumé vs « fichiers pressentis ».
- Ancien double rôle de la route `planning` libéré : mémoire du jour de l'accueil → nouveau champ optionnel `dashboard.date` ; `DESTINATION_SCREEN.planned` de `E21CreateTaskV2` → `dashboard`.
- Décisions 3 et 6 tranchées en implémentation : grossissement `DAY_CELL_MAX_SCALE = 1.18` (dégressif), cellules de la vue semaine en icône seule. Pas d'extraction d'un bandeau de jours partagé (roadmap la marquait optionnelle).

## Livrables produits ou modifiés
- `src/ui/screens/dashboard/PlanningBoard.tsx`(`.test.tsx`) : #19 — `dateStripStyle`→`dateStripBoxStyle` (fond `color-mix(<ambiance> 14%, surface)` + `overflow: hidden`), `dayCellStyle` du jour affiché en `var(--color-surface)` + bordure. #21 — piste interne `dateTrackStyle` (seule à recevoir `translateX`), `dayCellScale`/`DAY_CELL_MAX_SCALE`. #22 — bouton logo « Ouvrir le planning de la semaine » à gauche du mois → `goTo({ name: 'planning', date: displayDate })` ; mémoire du jour repointée sur `dashboard`. +6 tests (#19 ×2, #21 ×2, #22 ×1, + ajustement du test bordure).
- `src/ui/screens/dashboard/E12WeekPlanning.tsx`(`.test.tsx`) : créé — écran pleine page, grille 7 colonnes lun→dim (`<section aria-label="Planning de la semaine">`, bordure + aplat 14 % ambiance), tâches en boutons icône seule → fiche, glissement ±1 semaine, bouton « Aujourd'hui », sélecteur mois/année, Retour. 8 tests.
- `src/domain/rules/planningSlotRules.ts`(`.test.ts`) : `weekStrip(date)` (7 dates lun→dim de la semaine ISO) + 2 tests.
- `src/App.tsx` : route `planning` → `E12WeekPlanning` en `React.lazy`. `src/app/navigation.ts` : `date?` sur la route `dashboard`.
- `src/ui/screens/tasks/E21CreateTaskV2.tsx`(`.test.tsx`) : `DESTINATION_SCREEN.planned` → `dashboard` (2 assertions ajustées).
- `src/App.test.tsx` : test « dashboard vs vue semaine » réécrit.
- `src/ui/screens/onboarding/E01Welcome.tsx` : 3 entrées `WHATS_NEW` (#19, #21, #22). `src/domain/data/manualTestsCatalog.ts` : parcours `bandeau-des-jours-colore` (#19), `defilement-des-jours-dans-la-case` (#21), `vue-planning-de-la-semaine` (#22).
- `roadmap_planning_accueil_2026-08-29.md` : Phases 3, 4, 5 `[FAIT]`. `COMMUNICATION/Marie/a_transmettre.md` : commentaire de livraison ajouté.

## Hypothèses validées / invalidées
- VALIDE : `tsc -b`, lint, suite complète **698/698** (85 fichiers) verts (+11 : 8 `E12WeekPlanning`, 1 `PlanningBoard` #22, 2 `weekStrip` ; les 5 tests #19/#21 remplacent/ajustent des tests existants).
- VALIDE (jsdom) : un conteneur `<section aria-label>` expose `role="region"`, pas un `<div aria-label>` — d'où `<section>` pour la grille semaine (3 tests avaient échoué avant ce correctif).
- EN ATTENTE : rendu réel sur mobile — fond teinté du bandeau et contraste des libellés (#19), intensité du grossissement et fluidité du glissement (#21, décision 3), lisibilité des 7 colonnes et cellules-icônes de la vue semaine (#22, gate décision 4 — repli jour-par-jour si illisible) — validation Marie.

## Prochaine étape exacte
`/deploy` : livre le correctif pastille (`2d5c0b8`) + le travail bundle + `roadmap_planning_accueil` Phases 3-4-5 ; archive `roadmap_planning_accueil`, `roadmap_sync_marie`, `roadmap_sav_snapshot_marie`.

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-09-02 — roadmap_sav_snapshot_marie.md exécutée : Phases 1-2-3)

## Décisions prises
- `roadmap_sav_snapshot_marie.md` exécutée intégralement (Phases 1-2-3), un checkpoint `/compact` entre chaque phase.
- Accès Supabase factorisé dans `scripts/_supabase.py`, consommé par `backup_marie_snapshot.py` et `read_device_snapshots.py`.
- Rétention de `donnees_marie/` sous `--prune` explicite uniquement, jamais depuis `/start` ou `/close` ; défaut `--keep-last 30` + premier de chaque mois par appareil ; `export-audhd-*.json` jamais touchés.

## Livrables produits ou modifiés
- `scripts/backup_marie_snapshot.py` : `URLError`/`TimeoutError` + `timeout=15`, dédup par contenu, refus payload vide, stamp UTC `%Y%m%d-%H%Mz`, `&order=synced_at.desc`, `created_at` retiré, appareil retenu affiché, `--prune`/`--dry-run`/`--keep-last`, `plan_retention`/`run_prune`.
- `scripts/read_device_snapshots.py` : consomme `_supabase.py` (corrige `import urllib.error` manquant).
- `scripts/_supabase.py` : créé (garde d'environnement + requête HTTP partagées, `SupabaseError`).
- `scripts/test_backup_marie_snapshot.py` : créé — 31 tests `unittest` stdlib, tous verts.
- `roadmap_sav_snapshot_marie.md` : 3 phases `[FAIT]`.

## Hypothèses validées / invalidées
- VALIDE : hors-ligne / variables absentes → une ligne sur stderr + exit 1, plus de traceback.
- VALIDE : `--dry-run --keep-last 1` sur le dossier réel cible exactement les 2 doublons md5 (`1641h41`, `1837h37`), garde `2343z` + `1526h26`, ne touche aucun `export-audhd-*.json` ; fichiers sur disque inchangés.
- VALIDE : chemin nominal réel — appareil `192f2411` retenu (49 `manual_test_results`), snapshot inchangé depuis `20260901-2343z` malgré un `synced_at` plus récent (dédup par contenu opérante).
- EN ATTENTE : chemin « écriture réelle » de `/close` étape 2 (pas de contenu neuf de Marie entre `/start` et ce `/close`).

## Prochaine étape exacte
`/deploy` (livre le correctif pastille + le travail bundle + planning Phases 1-2), ou `roadmap_planning_accueil_2026-08-29.md` Phase 3 (#19).

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-09-01 — test de la SAV des données de Marie, SAV branchée dans /close, roadmap de fiabilisation)

## Décisions prises
- Sauvegarde du snapshot Supabase de Marie branchée **aussi en fin de session** : étape 2 de `.claude/commands/close.md` (bloc Spécificités projet), symétrique de l'étape 4 de `/start`. Réduit la fenêtre pendant laquelle une perte de données locale chez Marie suivie d'une resynchronisation écraserait le dernier bon snapshot.
- Les 10 défauts relevés au test sont traités par une roadmap dédiée en 3 phases, pas à chaud : `roadmap_sav_snapshot_marie.md`.
- Harnais de test des scripts Python : `unittest` de la stdlib, aucune dépendance nouvelle (le projet n'a ni pytest ni requirements.txt).
- Historique append-only côté Supabase explicitement hors périmètre : traiterait la cause racine mais touche schéma, RLS et client de sync déployé chez Marie.

## Livrables produits ou modifiés
- `.claude/commands/close.md` : étape 2 (SAV) ajoutée au bloc Spécificités projet.
- `roadmap_sav_snapshot_marie.md` : créée — 3 phases `[TODO]`, 10 constats mesurés, décisions de cadrage.
- `tests_manuels.md` : section `/start` étape 4 close (exercée en réel cette session), section `/close` étape 2 ouverte.

## Hypothèses validées / invalidées
- VALIDE : `/start` étape 4 exercée en conditions réelles — sauvegarde écrite (`...-1837h37.json`), idempotence sur relance, `.env` jamais affiché.
- VALIDE : `--help`, absence de variables d'environnement (exit 1, message clair), `--device-id` inexistant (exit 0).
- INVALIDE : « un échec est signalé en une ligne » — une `URLError` (hors-ligne, URL invalide) produit un traceback brut d'une vingtaine de lignes. Exit 1 correct, sortie illisible. -> pivot vers Phase 1 de la roadmap.
- INVALIDE : l'idempotence annoncée est inopérante en pratique — la déduplication porte sur `synced_at`, qui bouge à chaque relance de l'app par Marie. Mesuré : `1641h41.json` et `1837h37.json` ont le même md5 `af7399029c31b2ffa10f1560af8cb21c`. -> pivot vers déduplication par contenu.
- VALIDE : l'heuristique de sélection est robuste aujourd'hui — 49 snapshots, un seul avec `manual_test_results > 0` (device `192f2411`, 49 résultats / 45 tâches / v5.69).
- EN ATTENTE : chemin « écriture réelle » de la nouvelle étape 2 de `/close` (seul le chemin « déjà sauvegardé » a été exercé, Marie n'ayant pas resynchronisé entre le `/start` et le `/close`).

## Prochaine étape exacte
Phase 1 de `roadmap_sav_snapshot_marie.md` (robustesse : réseau et doublons), ou `/deploy` (livre le correctif pastille + le travail bundle + planning Phases 1-2), ou `roadmap_planning_accueil_2026-08-29.md` Phase 3 (#19).

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-09-01 — comportement pastille « test passé », bascule sync Marie Phase 5, correctif process WhatsApp)

## Décisions prises
- Pastille rouge accueil + liste « Tests à faire » : critère « test validé » -> « test passé » (tout résultat `ok`/`nok` sur la révision courante éteint ; révision incrémentée rallume). E121 suit le même critère que la pastille (un test `nok` en sort).
- Bascule sync Marie (`roadmap_sync_marie.md` Phase 5, dernière phase, `[FAIT]`) : plus d'export manuel dans le flux nominal. `/deploy` étape 0 rafraîchit puis analyse le snapshot Supabase archivé par `/start` ; `/traiter_export_marie` = repli manuel hors flux.
- Process WhatsApp : relecture obligatoire de `COMMUNICATION/Marie/historique_whatsapp.md` (disque) avant toute rédaction / synthèse / attribution de fil pour Marie.

## Livrables produits ou modifiés
- `manualTestRules.ts`, `E10Dashboard.tsx`, `E121ManualTests.tsx`, parcours `pastille-nouveaux-tests` rev 2, `WHATS_NEW` : commit `2d5c0b8`.
- `.claude/commands/deploy.md`, `.claude/commands/traiter_export_marie.md`, `roadmap_sync_marie.md` (Phase 5 `[FAIT]` + § Bascule) : commités par ce `/close`.
- `.claude/CLAUDE.md` : règle relecture WhatsApp (`db0144c`). `COMMUNICATION/Marie/historique_whatsapp.md` : 4 entrées (`f8aa044`, `feadc8b`, `670ce3c`, `c34551c`, `f709ed8`).
- `COMMUNICATION/Marie/a_transmettre.md` : commentaire de livraison pastille ajouté.

## Hypothèses validées / invalidées
- VALIDE : 683/683 tests, `tsc -b`/lint verts après `2d5c0b8` (consigné dans `historique_whatsapp.md`).
- INVALIDE : « je l'ai déjà fait hier » de Marie n'est pas un défaut de synchronisation — parcours passés le 2026-08-31 en « Non validé » ; c'est le grief pastille, corrigé et non déployé.
- EN ATTENTE : revalidation formelle des parcours v5.69 (#3, #18, #20) après déploiement du correctif pastille.

## Prochaine étape exacte
`/deploy` (livre le correctif pastille + le travail bundle + planning Phases 1-2 déjà en attente), ou poursuivre `roadmap_planning_accueil_2026-08-29.md` Phase 3 (#19).

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-09-01 — confirmation sync Marie v5.69, SAV locale des snapshots Supabase, archivage roadmaps closes)

## Décisions prises
- SAV régulière des données de Marie : script tiré des snapshots Supabase, branché en **étape 4 de `/start`** (choix utilisateur : intégration `/start` plutôt que tâche planifiée Windows). Comble l'absence d'historique côté Supabase (schéma = `upsert` d'une ligne unique par `device_id`, chaque sync écrase la précédente).
- Sélection de l'appareil de Marie par heuristique : snapshot au plus de `manual_test_results` (seul signal fiable observé pour distinguer un usage réel prolongé des appareils de test).
- `roadmap_bundle_2026-08-31.md` et `roadmap_e2e_2026-09-01.md` (toutes deux closes) déplacées dans `Archives/`.
- Statuts de roadmap non touchés en session (règle CLAUDE.md) — `roadmap_sync_marie.md` Phase 5 sera à marquer débloquée au prochain travail dessus.

## Livrables produits ou modifiés
- `scripts/backup_marie_snapshot.py` : créé, testé — 1re sauvegarde écrite (`donnees_marie/snapshot-supabase-192f2411-2026-09-01-1526h26.json`, gitignoré, 45 tâches / 49 tests).
- `.claude/commands/start.md` : étape 4, sauvegarde du snapshot Supabase de Marie pour la racine du projet (non bloquant, idempotent).
- `roadmap_bundle_2026-08-31.md`, `roadmap_e2e_2026-09-01.md` → `Archives/` (`git mv`).
- `COMMUNICATION/Marie/historique_whatsapp.md` : entrée relance tests v5.69 (message pas encore envoyé).
- Commits `6d4fd3e` (archivage roadmaps), `cc499a4` (relance WhatsApp), `1c55bc2` (script SAV + `/start`).

## Hypothèses validées / invalidées
- VALIDE : 1re sync réelle de Marie sur v5.69 — device `192f2411`, `synced_at` 2026-09-01 10:47 UTC, `app_version` v5.69, 45 tâches / 49 `manual_test_results` / usage quotidien. Question ouverte P1 satisfaite.
- NON PROUVÉ : identité formelle de l'appareil (device_id anonyme par design ; recoupement avec `donnees_marie/` non fait, dossier sensible). Faisceau d'indices concluant.
- EN ATTENTE : réponse de Marie à la relance (tests v5.69 #3, #18, #20, sauvegarde auto non validés depuis le 2026-08-31 20:31).

## Prochaine étape exacte
Attendre le retour de Marie sur les tests v5.69. En parallèle : poursuivre `roadmap_planning_accueil_2026-08-29.md` Phase 3 (#19, fond du bandeau de dates), ou entamer `roadmap_sync_marie.md` Phase 5 (débloquée par la confirmation de sync).

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-09-01 — clôture roadmap_bundle_2026-08-31.md : Phase 3 abandonnée, Phase 4 garde-fou permanent)

## Décisions prises
- Phase 3 abandonnée sur décision explicite de l'utilisateur, après avoir signalé que sa condition de lancement n'était pas remplie (chunk déjà sous la cible finale après Phase 2) et que son gain résiduel (−14 kB) était inférieur au coût de duplication d'`id` entre deux modules.
- Phase 4 : le point de transparence laissé ouvert en Phase 2 (chunk `AppContext.tsx` non mesuré) traité en élargissant la mesure du garde-fou, pas en la documentant comme simple limite.
- `vite.config.ts` : `outDir` corrigé (`dist/v5.1` → `dist/dev`) et `chunkSizeWarningLimit` abaissé à 260 kB.
- Le contrôle de budget devient un gate bloquant de `/deploy` (étape 6), remplaçant l'ancien avertissement non bloquant.

## Livrables produits ou modifiés
- `scripts/check_bundle_budget.mjs` : mesure aussi les chunks `<link rel="modulepreload">`.
- `bundle.budget.json` : seuils verrouillés (entrée 266,43 kB / total 431,79 kB).
- `vite.config.ts`, `.claude/commands/deploy.md`, `_contexte/contexte.md`, `src/domain/data/manualTestsCatalog.ts` (parcours `navigation-entre-tous-les-ecrans`).
- `roadmap_bundle_2026-08-31.md` : Phase 3 `[ABANDONNÉE]`, Phase 4 `[FAIT]` — roadmap close.
- Commits `882cc58` (abandon Phase 3) et `f91cd75` (Phase 4).

## Hypothèses validées / invalidées
- VALIDE : chargement différé + garde-fou fonctionnent en réel — testé sur téléphone via `vite preview --host` (build de prod servi en LAN).
- VALIDE : 682/682 tests, lint/tsc/build/e2e (57/57) verts après la Phase 4.
- INVALIDE : la condition de lancement de la Phase 3 (chunk au-dessus de la cible après Phase 2) — jamais remplie, phase abandonnée.

## Prochaine étape exacte
`roadmap_bundle_2026-08-31.md` close, rien à reprendre dessus. Reprendre `roadmap_planning_accueil_2026-08-29.md` Phase 3 (#19) ou lancer `/deploy` pour livrer le travail bundle (prod toujours en v5.69).

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-31 — tri des branches Git + roadmap de réduction du bundle)

## Décisions prises
- Le refacto du bundle passe par une roadmap dédiée en 5 phases (harnais de mesure, retrait de `@supabase/supabase-js`, `React.lazy` par écran, découplage catalogue tests, garde-fou) — créée, non lancée.
- Retrait de `@supabase/supabase-js` du navigateur au profit d'appels `fetch` PostgREST : gain mesuré -208 kB (-27 %) ; le flux de sync des données de Marie est inchangé (le SDK n'est qu'un transport HTTP, la lecture dév est déjà en `urllib` brut).
- 6 branches distantes obsolètes (`v2`→`v5.1`) supprimées sur GitHub ; `sync-marie` conservée (branche de recherche).

## Livrables produits ou modifiés
- `roadmap_bundle_2026-08-31.md` : créé (473 lignes), relu par un agent `Plan` puis corrigé (4 défauts bloquants + 1 erreur factuelle de ma part).
- Branches : 7 locales supprimées (`integration/supabase-main`, `v2`, `v3`, `v4`, `v4.1`, `v5.0`, `v5.1`), 6 distantes supprimées sur GitHub (`v2`→`v5.1`).
- `_contexte/signals.md`, `_contexte/contexte.md`, `README.md`, `CHANGELOG.md` (v5.71).

## Hypothèses validées / invalidées
- VALIDE : `main` sain — build, lint, suite de tests verts, arbre propre, local == distant (`1311805`).
- VALIDE : gain -208 kB du retrait de `@supabase/supabase-js`, mesuré par build réel avec stub (766,88 → 558,24 kB).
- INVALIDE : mon constat que 3 fichiers de test cassaient avec `React.lazy` — seul `App.test.tsx` monte `AppScreens`, et aucune de ses assertions n'inspecte un écran devenu lazy (tout est sur `BottomNav` ou `E10Dashboard`, restés statiques). Corrigé dans la roadmap.
- EN ATTENTE : estimations des Phases 2-3 (~400 / ~385 kB) non mesurées.

## Prochaine étape exacte
Arbitrer le séquencement avec `roadmap_planning_accueil` Phase 5 (touche `src/App.tsx`) et `roadmap_sync_marie` Phase 5 (touche `deploy.md`), puis lancer la Phase 0 de `roadmap_bundle_2026-08-31.md` (harnais de mesure : `scripts/analyse_bundle.mjs`, `check_bundle_budget.mjs`, `bundle.budget.json`, baseline e2e).

## Question bloquante pour la session suivante
Décision 1 de la Phase 1 : abandonner définitivement `@supabase/supabase-js` côté navigateur ? (recommandé — aucune auth prévue, cf. `roadmap_sync_marie.md` décision du 2026-08-15).

---

## Dernière session archivée (2026-08-31 — déploiement v5.69 : sync Supabase en prod)

## Décisions prises
- Le test perso de la sync (write mobile + read script, 2026-08-31) vaut validation du mécanisme ; la 1re sync réelle de Marie sur v5.69 sert de confirmation grandeur nature.
- `integration/supabase-main` fusionnée dans `main` (fast-forward) et **déployée en v5.69** (prod HTTP 200), rattrapant v5.65→v5.68 en prod.
- Phase 5 planning : navigation par semaine si les 7 jours tiennent à l'écran, sinon par jour (Marie, décision 4) ; route `planning` réaffectée à la vue semaine, pas de route dédiée (dév, décision 5).
- Règle durable posée par l'utilisateur : tout message WhatsApp avec Marie (rédigé ou transmis) est consigné immédiatement dans `COMMUNICATION/Marie/historique_whatsapp.md` et commité, sans attendre le `/close` (`CLAUDE.md` § Spécificités projet, propagé à `AGENTS.md`).

## Livrables produits ou modifiés
- **v5.69 déployée** : `dist/v5.69`, `_contexte/dernier_deploiement.md`, `WHATS_NEW` vidé, `COMMUNICATION/Marie/livraisons/v5.69.md`, Drive `commentaires_marie_v5.69.docx`.
- Fusion `integration/supabase-main` → `main`. `CHANGELOG.md` : entrées v5.69 puis v5.70.
- `src/domain/data/manualTestsCatalog.ts` : parcours `donnees-synchronisees-automatiquement`. `E01Welcome.tsx` : `WHATS_NEW`.
- `COMMUNICATION/Marie/historique_whatsapp.md` (créé, 3 entrées dont le message de livraison v5.69), `a_transmettre.md` (purgé après livraison).
- `roadmap_planning_accueil_2026-08-29.md` (décisions 4-5), `roadmap_sync_marie.md` (Phase 4 → `[FAIT]`), `_contexte/marie_modifications_suivi.md` (jalon revue 2026-08-31).
- `.claude/CLAUDE.md` + `AGENTS.md` : règle sauvegarde WhatsApp. `_contexte/signals.md` : priorités urgentes prochaine session.
- `donnees_marie/export-audhd-2026-08-30-20h14.json` : export du 30/08 traité (0 nouveau test).

## Hypothèses validées / invalidées
- VALIDE : sync Supabase fonctionnelle write + read, vérifiée en réel (snapshot `app_version` v5.68 + lecture script, 19 snapshots) ; déploiement v5.69 HTTP 200.
- VALIDE : merge du socle sur `main` sans conflit (fast-forward).
- EN ATTENTE : 1re sync réelle de Marie sur v5.69 ; retour de Marie sur planning Phases 1-2 (#20, #18) et sur la carte de sync.

## Prochaine étape exacte
URGENT avant tout : trier les branches Git, vérifier `main` sain, puis traiter la taille du bundle (767 kB / gzip 208 kB depuis `@supabase/supabase-js`). Ensuite : attendre l'export/retour de Marie sur v5.69 ; sync confirmée, entamer `roadmap_sync_marie.md` Phase 5 et poursuivre `roadmap_planning_accueil` Phase 3 (#19).

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-29 — Phases 1-2 roadmap planning accueil : #20 hauteur fixe, #18 case colorée)

## Décisions prises
- Phase 1 (#20) livrée : planning de l'accueil à hauteur fixe 325 px ; poignée, trait gris et logique drag/expand retirés de `E10Dashboard.tsx` ; prop `collapsed`, `COLLAPSED_ROW_LIMIT` et `effectiveDate` retirés de `PlanningBoard.tsx` ; seule la liste des tâches défile (mois + bandeau de jours fixes).
- Décision 5 de la roadmap tranchée : la route `planning` est **conservée** — elle sert d'`originScreen` à la création de tâche (`E21CreateTaskV2.tsx`) et reste l'emplacement de la vue pleine page de la Phase 5 ; elle ne pilote plus d'état déplié. `navigation.ts`, `App.tsx`, `DevResetButton.tsx` inchangés.
- Phase 2 (#18) livrée : le `<div>` teinté interne (hauteur du contenu) est supprimé ; la teinte passe sur le conteneur de ligne, le `<button>` porte `rowStyle(duration_minutes)` — la couleur remplit la hauteur ∝ durée (44-160 px). Sous-tâches dépliées intégrées dans le même aplat (héritent de `tint.color`). Liste des tâches passée en `flex column gap 6px`. Cas « terminé » (fond plein, texte blanc barré) conservé.

## Livrables produits ou modifiés
- `src/ui/screens/dashboard/E10Dashboard.tsx`(`.test.tsx`) : hauteur fixe, `PLANNING_HEIGHT_PX` exporté, retrait poignée/drag.
- `src/ui/screens/dashboard/PlanningBoard.tsx`(`.test.tsx`) : `collapsed` supprimé, teinte sur conteneur de ligne (`rowContainerStyle`), sous-tâches dans l'aplat.
- `src/App.test.tsx` : assertions poignée → région « Planning du jour ».
- `src/domain/data/manualTestsCatalog.ts` : `glisser-pour-ouvrir-le-planning` retiré ; `planning-hauteur-fixe` (#20) et `case-de-tache-coloree-en-entier` (#18) ajoutés.
- `src/ui/screens/onboarding/E01Welcome.tsx` : 2 entrées `WHATS_NEW`.
- `roadmap_planning_accueil_2026-08-29.md` : Phases 1 et 2 `[FAIT]`, Phase 3 `[EN COURS]`.
- `COMMUNICATION/Marie/a_transmettre.md` : 2 commentaires de livraison ajoutés.

## Hypothèses validées / invalidées
- VALIDE : 624 tests (76 fichiers), `tsc -b` et lint verts après les 2 phases.
- EN ATTENTE : rendu visuel des 325 px et contraste du texte des sous-étapes sur couleur saturée — validation Marie via les 2 parcours du catalogue.
- EN ATTENTE : mécanisme anti-contournement étape 0.4 de `/deploy` (posé le 29/08), premier `/deploy` réel à confirmer.
- EN ATTENTE : retour de Marie sur `cadre-date-heure-dans-l-ecran` (#3, v5.64).

## Prochaine étape exacte
Phase 3 de `roadmap_planning_accueil_2026-08-29.md` (#19) : donner au bandeau de dates (`dateStripStyle`) un fond plein d'un aplat de la couleur d'ambiance au lieu de la seule bordure (décisions 1 et 2), garder le jour affiché repérable. Terminer par le checkpoint `/compact`.

## Question bloquante pour la session suivante
Aucune pour les Phases 3-4. Les 2 décisions #22 restent à obtenir de Marie avant la Phase 5.

---

## Dernière session archivée (2026-08-29 — analyse Google Doc 18-22, roadmap planning, anti-contournement étape 0.4 de /deploy)

## Décisions prises
- Demandes 18-22 du Google Doc de Marie (toutes « Accueil / Planning ») analysées via `/analyser_googledoc` contre le code réel (`PlanningBoard.tsx`, `E10Dashboard.tsx`, `ambiance.ts`, `planningSlotRules.ts`, `navigation.ts`) : aucune déjà livrée, toutes des évolutions de la vue planning. Preuves d'écart consignées dans le registre.
- Roadmap créée : `roadmap_planning_accueil_2026-08-29.md`, 5 phases — Phase 1 = #20 (hauteur fixe 325 px, retrait plier/déplier, socle), Phase 2 = #18, Phase 3 = #19, Phase 4 = #21 (dépend 1+3), Phase 5 = #22 (dépend 1). Section « Décisions produit non tranchées » : 4 non bloquantes, 2 bloquantes pour la Phase 5.
- Registre `marie_modifications_suivi.md` réconcilié : lignes 18-22 passées de `à analyser` à `en cours roadmap_planning_accueil_2026-08-29.md (Phase N)` ; en-tête et historique des revues mis à la date de modif du Doc (2026-08-28).
- Contournement de l'étape 0.4 de `/deploy` corrigé : (1) titre étape 0 renommé, (2) compte-rendu de la revue obligatoire en 0.4, (3) `.claude/revue_googledoc.md` pose `- Dernière exécution de la revue : <date>` dans l'en-tête du registre à chaque passage (Doc changé ou non), (4) porte bloquante 3.9 dans `/deploy` = `grep` de ce jalon, doit valoir la date du jour.

## Livrables produits ou modifiés
- `roadmap_planning_accueil_2026-08-29.md` : créé — 5 phases, analyse du Doc, décisions produit isolées.
- `_contexte/marie_modifications_suivi.md` : modifié — états 18-22 recalculés, ligne « Dernière exécution de la revue » ajoutée, en-tête + historique des revues à jour.
- `.claude/commands/deploy.md` : modifié — titre étape 0, étape 0.4 (compte-rendu obligatoire), étape 3.9 (porte bloquante).
- `.claude/revue_googledoc.md` : modifié — étape 2 pose le jalon daté dans les deux branches.

## Hypothèses validées / invalidées
- VALIDE : `grep -m1 '^- Dernière exécution de la revue :'` testé contre le format réel de la ligne du registre.
- EN ATTENTE : mécanisme anti-contournement de l'étape 0.4 non encore exercé en live — premier `/deploy` réel à confirmer.
- EN ATTENTE : retour de Marie sur `cadre-date-heure-dans-l-ecran` (#3) en v5.64.

## Prochaine étape exacte
Démarrer la Phase 1 de `roadmap_planning_accueil_2026-08-29.md` (#20) : retirer le plier/déplier et le trait gris du planning, hauteur fixe 325 px, traiter la route `planning` (décision 5 de la roadmap). Modèle recommandé : Opus (refacto du dashboard). Terminer la phase par son checkpoint `/compact`.

## Question bloquante pour la session suivante
Aucune pour démarrer (Phases 1-4 autonomes). Les 2 décisions #22 sont à obtenir de Marie avant la Phase 5, pas avant.

---

## Dernière session archivée (2026-08-28 — pastille « Tests à faire » alignée sur les tests en attente)

## Décisions prises
- Retour Marie du 27/08 (WhatsApp) : montant temporaire Budget confirmé conforme ; demande « remettre la pastille rouge quand il y a de nouveaux tests » traitée immédiatement.
- La pastille rouge de l'icône « Tests à faire » (accueil) suit désormais exactement la liste de l'écran E121 : un test jamais validé, en échec, ou validé sur une révision antérieure la rallume.

## Livrables produits ou modifiés
- `src/domain/rules/manualTestRules.ts`(`.test.ts`) : créé (logique commune extraite de E121).
- `E10Dashboard.tsx`(`.test.tsx`), `E121ManualTests.tsx`, `manualTestsCatalog.ts` (`pastille-nouveaux-tests`).

## Hypothèses validées / invalidées
- VALIDE : 623 tests, `tsc -b` et lint verts.

## Prochaine étape exacte
Déploiement v5.62.

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-25 — déploiement v5.56 et communication Marie)

## Décisions prises
- v5.56 est déployée en production après contrôles verts ; HTTP 200 vérifié.
- La communication de livraison est publiée sur Drive et complétée pour confirmer la prise en compte des tests de Marie et de son fichier Drive.

## Livrables produits ou modifiés
- `dist/v5.56/` : build de production déployé sur Netlify.
- `COMMUNICATION/Marie/livraisons/v5.56.md` : commentaire de livraison publié sur Drive.
- `_contexte/dernier_deploiement.md` et `E01Welcome.tsx` : version déployée enregistrée ; nouveautés vidées après publication.

## Hypothèses validées / invalidées
- VALIDE : 611 tests, TypeScript et lint verts ; déploiement Netlify confirmé et HTTP 200.
- EN ATTENTE : décisions Marie #7 et #11, ainsi que les tests manuels demandés dans le catalogue in-app.

## Prochaine étape exacte
Attendre les retours de Marie sur v5.56 et ses décisions #7 et #11.

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-24 — standardisation du message de déploiement)

## Décisions prises
- La commande `/deploy` rédige désormais un message WhatsApp pour Marie, contenant systématiquement le lien de production et encadré par `💻🤖`.

## Livrables produits ou modifiés
- `.claude/commands/deploy.md` : étape 10 ajoutée.
- `CHANGELOG.md` : v5.53.

## Hypothèses validées / invalidées
- VALIDE : aucune modification applicative ni test manuel supplémentaire requis.

## Prochaine étape exacte
Utiliser le nouveau format WhatsApp lors du prochain déploiement.

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-24 — retours Marie et préparation v5.52)

## Décisions prises
- L’export de Marie du 23 août a été archivé et analysé ; les demandes encore pertinentes ont été intégrées à `roadmap_retours_marie_2026-08-23.md`.
- Trois corrections sont livrées : fond neutre des tâches sans couleur, conservation de la catégorie de liste au retour du détail et sélecteur de couleur d’outil explicite.
- Le test d’import `E117Export.test.tsx` a été stabilisé ; la suite complète est verte.

## Livrables produits ou modifiés
- `roadmap_retours_marie_2026-08-23.md`, `.claude/commands/analyser_modifications_marie_pdf.md` : analyse et procédure de traitement des demandes PDF de Marie.
- `PlanningBoard.tsx`, `E61ListDetail.tsx`, `ToolWidgetCard.tsx` et leurs tests : corrections v5.52.
- `manualTestsCatalog.ts` : parcours Marie précisés pour les corrections publiées.

## Hypothèses validées / invalidées
- VALIDE : 605/605 tests, TypeScript et lint verts.
- EN ATTENTE : validation des trois parcours par Marie sur son appareil après publication.

## Prochaine étape exacte
Demander à Marie de rejouer les trois tests v5.52 du catalogue, puis traiter son prochain export.

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-21 — correctif préventif branche, déploiement v5.51)

## Décisions prises
- Correctif préventif ajouté suite à l'incident de branche du 2026-08-19 : `.claude/commands/start.md` vérifie désormais la divergence de branche avec `main` avant de charger le contexte ; `.claude/memory.md` recréé sur `main` (absent depuis le report) pour porter la règle durablement.
- `.gitignore` complété (`__pycache__/`, captures de calibration ROBERTO) — résidus non suivis bloquant le gate 3.1 de `/deploy`, règles déjà présentes sur `sync-marie` mais jamais reportées sur `main`.
- `/deploy` v5.51 mené à terme après confirmation utilisateur (push intermédiaire confirmé explicitement) : vérifications bloquantes toutes passées (600/600 tests, `tsc -b`/lint clean), build, déploiement Netlify, HTTP 200 vérifié.
- Bug fonctionnel corrigé pendant les vérifications pré-fusion : `useSettingsState.ts` n'appliquait pas la description par défaut (`''`) aux éléments de liste importés qui avaient déjà un `category_id` (seule la branche de réparation de catégorie manquante le faisait) — corrigé, test dédié ajouté.

## Livrables produits ou modifiés
- `.claude/commands/start.md` : vérification de divergence de branche ajoutée avant l'étape 3.
- `.claude/memory.md` : créé sur `main` (traitement des exports Marie + vérification de branche).
- `.gitignore` : `__pycache__/`, captures de calibration ROBERTO.
- `src/app/contexts/useSettingsState.ts`(`.test.tsx`) : correctif description par défaut à l'import.
- `_contexte/dernier_deploiement.md` : v5.51, 2026-08-20.
- `src/ui/screens/onboarding/E01Welcome.tsx` : `WHATS_NEW` vidé après publication.
- `roadmap_demandes_marie_v1.md` : Phase 5 `[FAIT]`.
- `README.md`, `CHANGELOG.md`, `_contexte/contexte.md` : état actuel mis à jour (v5.51 en prod).

## Hypothèses validées / invalidées
- VALIDE : déploiement v5.51 confirmé HTTP 200 sur `https://appli-audhd.netlify.app`.
- VALIDE : 600/600 tests unitaires, `tsc -b`/lint clean avant déploiement.
- EN ATTENTE : aucun des changements de v5.51 (Budget v3 + demandes Marie) jamais testé par Marie en conditions réelles.

## Prochaine étape exacte
Redemander à Marie de réimporter et retester la v5.51 via le catalogue (voir liste complète en question ouverte P1).

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-19 — incident de branche corrigé, import Flux B demandes Marie sur main, export 19/08 traité)

## Décisions prises
- Divergence critique `sync-marie`/`main` détectée avant tout `/deploy`/push (sessions précédentes menées par erreur sur `sync-marie`). Sur décision explicite de l'utilisateur : rien de `sync-marie` n'est importé, tout le travail Marie est reporté manuellement sur une branche neuve partant de `main`, `sync-marie` reste intacte comme branche de recherche.
- TA2 (menu tâche simplifié) et AP1 (hauteur de case selon durée) de `roadmap_demandes_marie_v1.md` non reportés : `main` avait indépendamment une implémentation plus aboutie du même besoin.
- `db.ts` : migrations v13/v14 de `sync-marie` renumérotées v16/v17 (collision avec les v13/14/15 déjà prises par `roadmap_budget_v3` sur `main`).
- Export Marie du 2026-08-19 traité (étape 0 `/deploy`) : archivé, ingéré, 3 frictions non bloquantes identifiées et reportées comme futures demandes plutôt que traitées à chaud.

## Livrables produits ou modifiés
- `src/domain/entities/tool.ts` (color), `listItem.ts` (description), `listItemSubTask.ts` : entités.
- `src/data/db.ts`(`.test.ts`) : migrations v16 (sous-tâches d'éléments de liste), v17 (couleur d'outil).
- `src/app/contexts/useListsState.ts`, `useToolsState.ts`, `useSettingsState.ts`(`.test.tsx`) : nouvelles fonctions, export/import étendus (`list_item_sub_tasks`, version 3.5) sans perdre `budget_income_entries`.
- `src/ui/screens/lists/E62ListItemDetail.tsx`(`.test.tsx`) : nouvel écran.
- `src/ui/components/ToolWidgetCard.tsx`(`.test.tsx`) : sélecteur de couleur par outil.
- `src/ui/screens/lists/E61ListDetail.tsx`(`.test.tsx`) : suppression de catégorie, navigation vers le détail d'élément.
- `src/ui/screens/dashboard/E10Dashboard.tsx`(`.test.tsx`) : badge énergie -> `energy-checkin` direct.
- `src/ui/screens/dashboard/PlanningBoard.tsx`(`.test.tsx`) : encadrement du bandeau + glissement animé continu.
- `src/domain/data/manualTestsCatalog.ts` : 7 tests ajoutés au format catégorie/étapes de `main`.
- `CHANGELOG.md` (v5.51), `WHATS_NEW`, `roadmap_demandes_marie_v1.md`, `ROBERTO/flux_b_drive/` : importés/mis à jour sur `main`.
- `donnees_marie/export-audhd-2026-08-19.json` : archivé. `_contexte/marie_tests_journal.json` : 10 entrées ajoutées.
- `.claude/memory.md` : créé sur `sync-marie` (perdu au report, recréé sur `main` la session suivante).

## Hypothèses validées / invalidées
- VALIDE : le report manuel fichier par fichier a permis de ne perdre ni le travail Marie ni les fonctionnalités déjà présentes sur `main` (Budget v3, drag continu, sélecteur mois/année) — vérifié par lecture de chaque diff avant application, pas par confiance dans `git apply --check` seul (qui valide le contexte, pas la pertinence).
- EN ATTENTE : suite de tests complète pas encore relancée sur la branche fusionnée au moment de cette synthèse — à confirmer avant tout déploiement.
- EN ATTENTE : aucun des changements de cette session jamais testé par Marie en conditions réelles.

## Prochaine étape exacte
Lancer `tsc -b`/`vitest run`/lint sur la branche fusionnée, corriger les écarts, fusionner dans `main`, puis reprendre `/deploy` (v5.51) en repartant de l'étape des vérifications bloquantes.

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-17 — suite 10, déploiement v5.49)

## Décisions prises
- `/deploy` mené à terme après confirmation utilisateur : v5.49 déployée en production, cumulant `roadmap_budget_v3.md` (Phases 1-6) avec les changements déjà en attente depuis v5.47.
- Étape 0 (exports de Marie) traitée par l'utilisateur lui-même hors session, sur sa confirmation explicite — non analysée par l'agent cette fois.

## Livrables produits ou modifiés
- `dist/v5.49/` : build de production généré et déployé sur Netlify.
- `_contexte/dernier_deploiement.md` : v5.49, 2026-08-17.
- `src/ui/screens/onboarding/E01Welcome.tsx` : `WHATS_NEW` vidé après publication.
- `README.md`, `CHANGELOG.md`, `_contexte/contexte.md` : état actuel mis à jour (v5.49 en prod).

## Hypothèses validées / invalidées
- VALIDE : déploiement v5.49 confirmé HTTP 200 sur `https://appli-audhd.netlify.app`.
- VALIDE : 571/571 tests unitaires, `tsc -b`/lint clean avant déploiement.
- EN ATTENTE : refonte Budget v3 et les autres changements cumulés jamais testés par Marie en conditions réelles.

## Prochaine étape exacte
Redemander à Marie de réimporter et retester la v5.49 via le catalogue (voir liste complète en question ouverte P1).

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-17 — suite 9, Phases 5-6 roadmap_budget_v3, clôture avant /deploy)

## Décisions prises
- `roadmap_budget_v3.md` intégralement livrée (Phases 1-6, `[FAIT]`) : refonte de bout en bout du Budget (Montant total manuel réparti Mon compte/Livrets, drill-down par sous-catégorie et par livret).
- Phase 5 : gestion des mouvements de livret (ajout/modification/suppression) déplacée de `E74BudgetSettings.tsx` vers un nouvel écran `E77BudgetLivretDetail.tsx` dédié, pour éviter deux formulaires incohérents (avec/sans date) — décision au-delà du libellé littéral de la roadmap, non contestée.
- Phase 6 : 5 fonctions mortes supprimées de `budgetRules.ts` (`getCurrentPeriodBounds`, `getRemainingForCategory`, `getTotalBudgeted`, `getTotalSpent`, `getTotalRemaining`) ; aucun écran mort à retirer (E71/E73/E74 tous vivants) ; widget accueil « Comptes » confirmé non affecté.

## Livrables produits ou modifiés
- `src/ui/screens/tools/E77BudgetLivretDetail.tsx`(`.test.tsx`) : créé (fiche détaillée d'un livret, mouvements modifiables).
- `src/app/contexts/useBudgetState.ts` : `updateBudgetDeposit` ajouté.
- `src/ui/screens/tools/E76BudgetLivrets.tsx`(`.test.tsx`) : clic sur un livret ouvre sa fiche, icône ⚙ ajoutée.
- `src/ui/screens/tools/E74BudgetSettings.tsx`(`.test.tsx`) : gestion des mouvements retirée, recentré sur la configuration des livrets.
- `src/app/navigation.ts`, `src/App.tsx`, `src/ui/components/DevResetButton.tsx` : route `budget-livret-detail`.
- `src/domain/rules/budgetRules.ts`(`.test.ts`) : nettoyage des fonctions mortes.
- `src/domain/data/manualTestsCatalog.ts` : test `retirer-de-l-argent-d-un-livret` réécrit, `modifier-un-mouvement-de-livret` ajouté, `utiliser-le-budget` complété.
- `src/ui/screens/onboarding/E01Welcome.tsx` : 2 entrées `WHATS_NEW` ajoutées.
- `roadmap_budget_v3.md` : Phases 5 et 6 `[FAIT]`.

## Hypothèses validées / invalidées
- VALIDE : 571/571 tests unitaires, `tsc -b`/lint clean après Phases 5 et 6.
- EN ATTENTE : refonte Budget v3 jamais testée par Marie en conditions réelles.

## Prochaine étape exacte
`/deploy` en cours (exports de Marie déjà traités par l'utilisateur hors session).

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-17 — suite 8, déploiement v5.47)

## Décisions prises
- `/deploy` mené à terme après confirmation utilisateur : v5.47 déployée en production (cumule v5.45 + regroupement des tests par catégorie).
- Avertissement de build « chunk JS > 500 kB » laissé tel quel sur consigne explicite de l'utilisateur : le refacto (`React.lazy`/`Suspense` par écran) sera proposé seulement si le poids grossit nettement — consigne de veille ajoutée aux questions ouvertes.

## Livrables produits ou modifiés
- `dist/v5.47/` : build de production généré et déployé sur Netlify.
- `_contexte/dernier_deploiement.md` : v5.47, 2026-08-17.
- `src/ui/screens/onboarding/E01Welcome.tsx` : `WHATS_NEW` vidé après publication.
- `README.md`, `CHANGELOG.md` (v5.48), `_contexte/contexte.md` : état actuel mis à jour (v5.47 en prod).

## Hypothèses validées / invalidées
- VALIDE : déploiement v5.47 confirmé HTTP 200 sur `https://appli-audhd.netlify.app`.
- VALIDE : 568/568 tests unitaires, `tsc -b`/lint clean avant déploiement.
- EN ATTENTE : aucun des changements de v5.45/v5.47 (Budget, drag planning, navigation planning, édition de tâche, regroupement des tests) jamais testé par Marie en conditions réelles.

## Prochaine étape exacte
Redemander à Marie de réimporter et retester la v5.47 via le catalogue (voir liste complète en question ouverte P1).

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-17 — suite 7, catégorisation du travail, regroupement du catalogue de tests)

## Décisions prises
- Sur demande de Marie (« je pars dans tous les sens »), découpage du travail validé en 7 catégories (Accueil/Planning, Tâches, Outils : Budget, Outils : Listes, Outils : autres, Énergie, Paramètres/Profil).
- Écran « Tests à faire » restructuré : tests regroupés par catégorie, repliées par défaut (nom en évidence, compteur), pliage à 3 niveaux (catégorie -> tests -> étapes).
- Export de Marie du 17/08 11h13 traité (étape 0 `/deploy`) : ni perte, ni incohérence, ni friction bloquante — usage normal.

## Livrables produits ou modifiés
- `COMMUNICATION/message_marie_categories_travail.md` : créé (proposition de découpage + validation de Marie).
- `src/domain/data/manualTestsCatalog.ts` : type `ManualTestCategory` et champ `category` ajoutés, 13 tests classés, test `grouper-les-tests-par-categorie` ajouté.
- `src/ui/screens/tests/E121ManualTests.tsx`(`.test.tsx`) : regroupement par catégorie, pliage/dépliage à 3 niveaux.
- `src/ui/screens/onboarding/E01Welcome.tsx` : entrée `WHATS_NEW` ajoutée.
- `donnees_marie/export-audhd-2026-08-17-11h13.json` : copié (gitignoré).
- `_contexte/marie_tests_journal.json` : ré-ingestion idempotente (0 ajout, 13 déjà connus).
- `README.md`, `CHANGELOG.md` (v5.47) : mis à jour.

## Hypothèses validées / invalidées
- VALIDE : 568/568 tests unitaires, `tsc -b`/lint clean après la restructuration de l'écran de tests.
- VALIDE : export du 17/08 11h13 sans perte ni incohérence (comparaison structurelle table par table avec le dernier export connu).

## Prochaine étape exacte
Poursuivre `/deploy` en cours (vérifications bloquantes, build, déploiement Netlify de la version cumulant v5.45 + regroupement des tests par catégorie).

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-17 — suite 4, sélecteur mois/année, refonte navigation planning et édition de tâche)

## Décisions prises
- Sur retours utilisateur (captures annotées), 5 correctifs UI cumulés : clic sur le mois/année du planning ouvre désormais une fenêtre dédiée (année + grille des 12 mois) au lieu de l'ancien sélecteur de date natif ; le bandeau de dates garde le jour actuel toujours centré (navigation uniquement par glissement, flèches semaine retirées) ; badge sous-tâches placé avant le logo énergie sur chaque ligne planifiée pour un alignement vertical constant, hauteur de ligne rendue proportionnelle à la durée ; débordement visuel du cadre Durée dans le formulaire de tâche corrigé ; fiche de tâche planifiée passée en lecture seule (fond teinté à la couleur d'ambiance) avec un nouveau bouton « Modifier » ouvrant un écran d'édition dédié pré-rempli, au même gabarit que la création, avec le choix occurrence/série conservé pour les tâches récurrentes.

## Livrables produits ou modifiés
- `src/ui/components/MonthYearPickerModal.tsx` : créé (sélecteur mois/année).
- `src/ui/screens/dashboard/PlanningBoard.tsx`(`.test.tsx`) : sélecteur mois/année câblé, bandeau recentré sur le jour actuel, flèches semaine retirées, ordre badge/énergie inversé, hauteur de ligne proportionnelle à la durée.
- `src/ui/screens/dashboard/E10Dashboard.test.tsx` : tests ajustés (bandeau de dates).
- `src/ui/components/DurationRoller.tsx`, `src/ui/screens/tasks/E21CreateTaskV2.tsx` : correctif débordement visuel du cadre Durée.
- `src/ui/screens/tasks/E22TaskDetail.tsx`(`.test.tsx`) : champs en lecture seule, fond teinté couleur d'ambiance, bouton « Modifier ».
- `src/ui/screens/tasks/E24EditTask.tsx`(`.test.tsx`) : créé (écran d'édition de tâche dédié).
- `src/app/navigation.ts`, `src/App.tsx`, `src/ui/components/DevResetButton.tsx` : nouvelle route `task-edit`.
- `src/domain/data/manualTestsCatalog.ts` : tests `naviguer-dans-le-planning` et `modifier-une-tache-planifiee` ajoutés.
- `src/ui/screens/onboarding/E01Welcome.tsx` : 2 entrées `WHATS_NEW` ajoutées.
- `CHANGELOG.md` : v5.45.

## Hypothèses validées / invalidées
- VALIDE : 566/566 tests unitaires, `tsc -b`/lint clean après l'ensemble des correctifs.
- HYPOTHÈSE NON VÉRIFIÉE : cause du débordement du cadre Durée attribuée aux `<select>` natifs sans largeur contrainte (`minWidth:0` manquant) — corrigé sur cette base mais pas confirmé visuellement par l'utilisateur sur son appareil.
- EN ATTENTE : aucun des changements de cette session (ni des sessions précédentes : Budget, drag planning) jamais testé par Marie en conditions réelles — aucun déploiement cette session.

## Prochaine étape exacte
`/deploy` (cumule Budget + drag planning + sélecteur mois/année + navigation planning + édition de tâche), puis redemander à Marie de tester les nouveaux comportements via le catalogue (`naviguer-dans-le-planning`, `modifier-une-tache-planifiee`, plus les tests Budget/planning déjà en attente).

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-17 — suite 3, drag continu du planning, mise à jour catalogue de tests)

## Décisions prises
- Sur retour utilisateur (capture annotée) : la poignée du planning devient un drag continu façon bottom-sheet — la fenêtre suit le doigt en temps réel (au lieu du seuil binaire précédent qui basculait instantanément), reste à la hauteur relâchée au lieu de forcément s'ouvrir/fermer en entier, et la section Outils / la bannière Mode surcharge restent visibles en permanence (elles disparaissaient auparavant quand le planning était déplié).
- Suite à cette évolution, les tests `utiliser-le-budget` et `glisser-pour-ouvrir-le-planning` du catalogue mis à jour : le premier teste désormais aussi « Ajouter un revenu » (jamais couvert alors que c'est le cœur de la refonte Budget) ; le second décrit le nouveau comportement continu au lieu de l'ancien « occupe l'écran ».

## Livrables produits ou modifiés
- `src/ui/screens/dashboard/E10Dashboard.tsx`(`.test.tsx`) : drag continu du planning (constantes `PLANNING_MIN_HEIGHT_PX`/`PLANNING_MAX_HEIGHT_PX`), Outils/bannière surcharge toujours visibles.
- `src/ui/screens/dashboard/PlanningBoard.tsx` : pollution non committée (caractère parasite ligne 1) corrigée, sans rapport avec la session.
- `src/domain/data/manualTestsCatalog.ts` : steps de `utiliser-le-budget` et `glisser-pour-ouvrir-le-planning` mis à jour.
- `src/ui/screens/onboarding/E01Welcome.tsx` : entrée `WHATS_NEW` ajoutée (drag continu du planning).

## Hypothèses validées / invalidées
- VALIDE : 564/564 tests unitaires, `tsc -b`/lint clean après le changement de drag et la mise à jour du catalogue.
- EN ATTENTE : refonte Budget et drag continu du planning tous deux jamais testés par Marie en conditions réelles — aucun déploiement cette session.

## Prochaine étape exacte
`/deploy` (cumule refonte Budget + drag continu du planning), puis redemander à Marie de tester « Utiliser le budget », « Ouvrir le planning en glissant » et « Vérifier le Montant total après la migration des revenus ».

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-17 — suite 2, clôture refonte Budget Phase 4, nettoyage catégories income)

## Décisions prises
- Phase 4 de `roadmap_budget_v2.md` (dernière phase) livrée et confirmée par l'utilisateur : catégories `income` existantes de Marie converties en revenus historiques ponctuels via migration Dexie v14, puis supprimées. Roadmap intégralement `[FAIT]`.
- Angle mort signalé par l'agent (hors périmètre de la roadmap) : l'écran de configuration permettait encore de créer de nouvelles catégories `income`, contredisant la nouvelle règle « Marie saisit elle-même chaque revenu ». Message rédigé pour trancher avec Marie plutôt que décidé unilatéralement.
- Marie a répondu (relayé par l'utilisateur) : option 1, suppression complète — option « Revenu » du formulaire de catégorie, bloc « Non alloué », section « Revenus » de l'écran Budget et fonctions de calcul mortes associées, tous retirés.
- `WHATS_NEW` mis à jour : la refonte Budget est désormais complète et cohérente de bout en bout, plus de raison de différer l'annonce à Marie (contrairement à la Phase 1 seule).

## Livrables produits ou modifiés
- `src/data/db.ts`(`.test.ts`) : migration Dexie v14 (conversion catégories income → `BudgetIncomeEntry`, suppression des catégories).
- `src/domain/data/manualTestsCatalog.ts` : test `montant-total-apres-migration-revenus` ajouté.
- `roadmap_budget_v2.md` : décision « Devenir des catégories income » actée, Phase 4 `[FAIT]`.
- `src/domain/rules/budgetRules.ts`(`.test.ts`) : `getTotalIncome`, `getUnbudgetedRemainder` supprimées (mortes après le nettoyage).
- `src/ui/screens/tools/E74BudgetSettings.tsx`(`.test.tsx`) : option « Revenu » et bloc « Non alloué » retirés.
- `src/ui/screens/tools/E71Budget.tsx`(`.test.tsx`) : section « Revenus » (catégories income) retirée.
- `src/app/AppContextBudget.test.tsx` : nettoyé des scénarios liés aux fonctions supprimées.
- `src/ui/screens/onboarding/E01Welcome.tsx` : entrée `WHATS_NEW` ajoutée (nouveau système Budget).
- `Archives/message_marie_categories_revenu.md` : message archivé, réponse déjà obtenue.

## Hypothèses validées / invalidées
- VALIDE : 564/564 tests unitaires, `tsc -b`/lint clean après la Phase 4 et le nettoyage des catégories income.
- EN ATTENTE : refonte Budget jamais testée par Marie en conditions réelles — premier `/deploy` de cette feature à venir.

## Prochaine étape exacte
Déployer la refonte Budget (`/deploy`), puis redemander à Marie de tester le nouveau système (« Ajouter un revenu », carte « Montant total », absence des anciennes catégories) via le test `montant-total-apres-migration-revenus` du catalogue.

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-17 — archivage des roadmaps terminées, déploiement v5.40)

## Décisions prises
- Export de Marie du 16/08 reconfirmé comme dernier disponible (étape 0 de `/deploy`) — aucun nouvel élément à ingérer, `/deploy` poursuivi.
- Erreur de lint préexistante `db.ts:308` (`_section` déstructuré jamais utilisé) corrigée à la racine : `eslint.config.js` ne couvrait que les paramètres de fonction (`argsIgnorePattern: '^_'`), pas les variables déstructurées — `varsIgnorePattern: '^_'` ajouté.
- Test `E01Welcome.test.tsx` fragile (dépendait du contenu réel, non vide, du tableau `WHATS_NEW`) reformulé pour vérifier le comportement réel (modale déjà vue pour la version courante via `localStorage`), indépendant du contenu — évite la récurrence à chaque cycle `/deploy`.
- v5.40 déployée en prod après confirmation utilisateur (cumule tous les correctifs/retouches depuis v5.31 : Budget, catégories de listes, nettoyage tests manuels, retouches accueil/E121, archivage roadmaps, correctifs lint/test).

## Livrables produits ou modifiés
- `roadmap_v5.1.md`, `roadmap_tests_marie.md`, `roadmap_categories_listes.md` → `Archives/` (`git mv`).
- `eslint.config.js` : `varsIgnorePattern: '^_'` ajouté.
- `src/ui/screens/onboarding/E01Welcome.test.tsx` : test reformulé (indépendant du contenu de `WHATS_NEW`).
- `src/ui/screens/onboarding/E01Welcome.tsx` : `WHATS_NEW` vidé après déploiement.
- `_contexte/dernier_deploiement.md` : v5.40, 2026-08-17.
- `CHANGELOG.md` : v5.39 (archivage), v5.40 (correctifs lint/test).

## Hypothèses validées / invalidées
- VALIDE : correctifs lint/test confirmés par vérifications bloquantes vertes (555/555 tests, `tsc -b` clean, `npm run lint` clean).
- VALIDE : déploiement v5.40 confirmé HTTP 200 sur `https://appli-audhd.netlify.app`.

## Prochaine étape exacte
Redemander à Marie de réimporter et revalider ses tests en attente (Budget ×3, catégories de listes, glisser planning).

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-16 — suite 2, archivage des roadmaps terminées)

## Décisions prises
- Les 3 roadmaps dont toutes les phases sont `[FAIT]` (`roadmap_v5.1.md`, `roadmap_tests_marie.md`, `roadmap_categories_listes.md`) déplacées vers `Archives/`, suivant le précédent déjà appliqué aux roadmaps V1-V5.0.
- Références actives (hors journal historique) mises à jour dans `_contexte/signals.md` et `_contexte/contexte.md` pour pointer vers `Archives/`.

## Livrables produits ou modifiés
- `Archives/roadmap_v5.1.md`, `Archives/roadmap_tests_marie.md`, `Archives/roadmap_categories_listes.md` : déplacés (`git mv`), contenu inchangé.
- `_contexte/signals.md`, `_contexte/contexte.md` : références mises à jour.

## Hypothèses validées / invalidées
- VALIDE : critère d'archivage (toutes phases `[FAIT]`, aucun `[TODO]`/`[EN COURS]` restant) cohérent avec les roadmaps déjà archivées.
- EN ATTENTE : lint global bloqué par une erreur préexistante dans `db.ts:308`, sans rapport avec cette session. Aucun déploiement depuis v5.31.

## Prochaine étape exacte
Corriger l'erreur de lint préexistante dans `db.ts:308` avant le `/deploy` en cours, puis terminer le déploiement (cumule tous les correctifs/retouches depuis v5.31) et redemander à Marie de réimporter et revalider ses tests en attente.

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-16 — suite, dashboard + refonte E121 tests manuels, clôture Phase V5.1-0)

## Décisions prises
- Dernier point de `tests_manuels.md` (Import JSON) validé par l'utilisateur ; fichier vidé intégralement. Phase V5.1-0 de `Archives/roadmap_v5.1.md` passée `[FAIT]`.
- Accueil retouché sur demande utilisateur : bouton « + » Outils déplacé à côté du titre et réduit, espacement accru avant la grille de widgets, police arrondie sur les widgets (fallback OS `ui-rounded`/`SF Pro Rounded`/`Segoe UI Rounded`, aucun fichier de police chargé — contrainte offline-first préservée).
- Sur E121, un test dont le dernier résultat est « Validé » n'apparaît plus dans la liste affichée à Marie ; le catalogue interne le garde intact comme suite de non-régression (décision explicite de l'utilisateur : ne pas supprimer l'archive, seulement filtrer l'UI).
- Chaque test dispose désormais d'un bouton déplier/replier (validé manuellement par l'utilisateur) ; `ManualTest.description` remplacé par `steps: string[]`, chaque test réécrit en étapes numérotées précises (libellés exacts des boutons/champs/écrans, aucun implicite). Gabarit de rédaction documenté en commentaire en tête de `manualTestsCatalog.ts` pour les prochains ajouts.

## Livrables produits ou modifiés
- `src/ui/screens/dashboard/E10Dashboard.tsx` : bouton « + » Outils repositionné/réduit, espacement grille, police arrondie widgets.
- `src/ui/screens/tests/E121ManualTests.tsx`/`.test.tsx` : filtrage des tests validés, déplier/replier, rendu `steps` en liste numérotée.
- `src/domain/data/manualTestsCatalog.ts` : `steps: string[]` remplace `description`, gabarit en commentaire, 10 tests réécrits.
- `tests_manuels.md` : vidé intégralement (plus aucun point en attente).
- `roadmap_v5.1.md` : Phase V5.1-0 `[FAIT]`.
- `src/ui/screens/onboarding/E01Welcome.tsx` : 2 entrées `WHATS_NEW` ajoutées.
- `CHANGELOG.md` : v5.38. `README.md` : état actuel mis à jour.

## Hypothèses validées / invalidées
- VALIDE : déplier/replier les étapes d'un test, confirmé par l'utilisateur en test manuel réel.
- INVALIDE : hypothèse initiale qu'un test « Validé » pouvait être supprimé du catalogue -> pivot : catalogue conservé comme suite de non-régression, seul l'affichage à Marie est filtré.
- EN ATTENTE : lint global bloqué par une erreur préexistante dans `db.ts:308`, sans rapport avec cette session. Aucun déploiement depuis v5.31.

## Prochaine étape exacte
Corriger l'erreur de lint préexistante dans `db.ts` avant le prochain `/deploy`, puis déployer (v5.38, cumule tous les correctifs/retouches depuis v5.31) et redemander à Marie de réimporter et revalider ses tests en attente.

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-16 — export Marie, nettoyage tests manuels, correctif catégories de listes à l'import)

## Décisions prises
- Suppression de 5 éléments de la liste « À acheter » (export du 16/08 vs 13/08) confirmée volontaire par l'utilisateur — pas un bug.
- `tests_manuels.md` recentré : les 7 points déjà dupliqués dans `manualTestsCatalog.ts` en sont retirés, ne garde que l'import JSON (dev). Point manquant (badge énergie) ajouté au catalogue.
- Bannières urgentes (accueil, Tests à faire) supprimées, devenues obsolètes.
- `.claude/commands/close.md` étape 6 enrichie : analyse de la conversation pour tracer les tests manuels décidés en session.
- Travail de cette session fait sur `main` (basculement depuis `sync-marie`, sans rapport avec ce chantier).

## Livrables produits ou modifiés
- `src/domain/data/manualTestsCatalog.ts` : test `badge-energie-couleur-ambiance` ajouté.
- `tests_manuels.md` : vidé de 7 points, ne garde que l'import JSON.
- `src/ui/screens/onboarding/E01Welcome.tsx`/`.test.tsx`, `src/ui/screens/tests/E121ManualTests.tsx`/`.test.tsx` : bannières urgentes retirées.
- `src/app/contexts/useSettingsState.ts`/`.test.tsx` : bug catégories de listes à l'export/import corrigé, export v3.2 → v3.3.
- `.claude/commands/close.md` : étape 6 enrichie.
- `CHANGELOG.md` : v5.37. `README.md` : état actuel mis à jour.

## Hypothèses validées / invalidées
- VALIDE : bug catégories de listes reproduit et corrigé (nouveau test dédié), 552/553 tests unitaires (échec préexistant sans rapport), `tsc -b` clean, lint clean sur les fichiers modifiés.
- INVALIDE : hypothèse que les 8 points de `tests_manuels.md` étaient tous propres au développeur -> pivot : 7/8 dupliquaient déjà le catalogue Marie.
- EN ATTENTE : lint global bloqué par une erreur préexistante dans `db.ts:308`, sans rapport avec cette session.

## Prochaine étape exacte
Corriger l'erreur de lint préexistante dans `db.ts` avant le prochain `/deploy`. Reprendre la Phase 1 de `roadmap_sync_marie.md` sur la branche `sync-marie` après réconciliation des deux branches.

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-15 — retouches diverses + feature Catégories de listes)

## Décisions prises
- Feature « Catégories de listes » livrée en 4 phases sur roadmap dédiée (demande utilisateur : trop d'informations affichées à plat dans une liste, vouloir choisir une catégorie avant de voir ses éléments). Catégorie obligatoire pour chaque item (pas d'item « sans catégorie »), modifiables après création de la liste, champ « Rubrique » texte libre supprimé au profit du choix de catégorie.
- Navigation par flèches du bandeau de dates passée de ±1 jour à ±1 semaine ; section « Tâche du jour » retirée de l'accueil (redondante avec le planning toujours visible) ; catégories de dépenses du budget regroupées sous « Semaine »/« Mois ».

## Livrables produits ou modifiés
- `roadmap_categories_listes.md` : créé, 4 phases toutes `[FAIT]`.
- `src/domain/entities/listCategory.ts`, `src/data/repositories/listCategoryRepository.ts`(`.test.ts`) : nouvelle entité et repository.
- `src/data/db.ts`(`.test.ts`) : migration Dexie v12.
- `src/domain/rules/listItemSortRules.ts`(`.test.ts`), `listRules.ts`(`.test.ts`) : règles de regroupement par catégorie.
- `src/ui/components/ToolCreateModal.tsx`(`.test.tsx`) : catégories initiales à la création de liste.
- `src/ui/screens/lists/E61ListDetail.tsx`(`.test.tsx`) : écran de sélection de catégorie, formulaire d'ajout scopé.
- `src/ui/screens/dashboard/PlanningBoard.tsx`(`.test.tsx`) : flèches ±1 semaine.
- `src/ui/screens/dashboard/E10Dashboard.tsx`(`.test.tsx`) : retrait « Tâche du jour ».
- `src/ui/components/BudgetExpenseModal.tsx` : regroupement Semaine/Mois.
- `src/ui/screens/tasks/E21CreateTaskV2.tsx` : retrait `autoFocus`, correctif débordement visuel Date/Heure.
- `src/ui/screens/onboarding/E01Welcome.tsx`, `src/domain/data/manualTestsCatalog.ts`, `tests_manuels.md` (point 8 ajouté, point 4 corrigé), `CHANGELOG.md` (v5.36), `README.md`, `_contexte/contexte.md` : mis à jour.

## Hypothèses validées / invalidées
- VALIDE : chaque phase de la feature catégories confirmée par l'utilisateur via `/compact` avant la suivante, conformément au protocole roadmap.
- EN ATTENTE : v5.36 pas encore déployée (build jamais lancé).

## Prochaine étape exacte
Reprendre la séquence en attente : validation par l'utilisateur des 8 points de `tests_manuels.md`, puis `/deploy` (v5.36, appliquera l'étape 0 « exports de Marie »).

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-14 — suite 14, ajout étape 0 « exports de Marie » dans /deploy)

## Décisions prises
- `.claude/commands/deploy.md` modifié sur demande explicite : nouvelle étape 0, avant `/close`, imposant de traiter les derniers exports de Marie avant tout déploiement — rappel à l'utilisateur, analyse complète du payload (pas seulement `manual_test_results`) pour pertes/incohérences/frictions, ingestion via `scripts/ingest_manual_tests.py`, arrêt et proposition de traitement à l'utilisateur si problème détecté, sans jamais toucher aux fichiers d'export bruts ni à `donnees_marie/`. Étapes suivantes renumérotées 1 à 9 (références internes corrigées).

## Livrables produits ou modifiés
- `.claude/commands/deploy.md` : ajout étape 0, renumérotation complète 1-9.

## Hypothèses validées / invalidées
- EN ATTENTE : nouvelle étape 0 pas encore exercée en pratique — le prochain `/deploy` (v5.33/v5.34) sera son premier passage réel.

## Prochaine étape exacte
Reprendre la séquence en attente : validation par l'utilisateur des 6 points de `tests_manuels.md`, puis `/deploy`, qui appliquera désormais la nouvelle étape 0 (exports de Marie) avant `/close`.

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-14 — suite 13, déploiement v5.33 reporté à la demande de l'utilisateur)

## Décisions prises
- Déploiement de v5.33 (correctif Budget) reporté : l'utilisateur préfère valider lui-même les 6 points de `tests_manuels.md` avant de relancer `/deploy`. Toutes les vérifications bloquantes de l'étape 2 étaient déjà passées (tests, `tsc -b`, lint, cohérence CHANGELOG) ; seul l'avertissement 3.4 (tests manuels en attente) restait à trancher.
- Export du 2026-08-14 17h40 reconfirmé comme dernier export disponible de Marie (ré-ingestion idempotente : 0 nouvelle entrée, 7 déjà présentes) — ses 4 tests en échec (Budget) restent à traiter en communication avec elle une fois v5.33 déployée.

## Livrables produits ou modifiés
- `_contexte/signals.md` : mise à jour des questions ouvertes (séquence attendue : validation manuelle utilisateur -> `/deploy` -> retour à Marie).
- Aucun fichier de code applicatif modifié cette session.

## Hypothèses validées / invalidées
- VALIDE : `dist/v5.33` n'a jamais été construit (déploiement arrêté avant l'étape de build) — rien à annuler côté build.

## Prochaine étape exacte
Attendre que l'utilisateur valide les 6 points de `tests_manuels.md`, puis relancer `/deploy` (version v5.33 déjà prête). Une fois déployée, redemander à Marie de réimporter et revalider ses 4 tests en échec.

## Question bloquante pour la session suivante
Aucune.

---

## Dernière session archivée (2026-08-14 — suite 12, correctif Budget, bannières et modale Nouveautés dynamiques, Phase 3 tests Marie close)

## Décisions prises
- Cause du bug « Budget disparu à l'import » identifiée par lecture de code et confirmée par les retours de Marie, puis corrigée : `useSettingsState.ts` recrée désormais aussi l'entrée `tableau_comptage` manquante à l'import, en plus des entrées `liste`.
- Bannières urgentes (accueil + Tests à faire) mises à jour pour demander la réimportation (répare le bug) au lieu d'un nouvel export, avec bouton « Fait » persistant (`localStorage`) et couleur de texte forcée en blanc (le `color` global des `<p>` dans `index.css` écrasait sinon le blanc hérité).
- Modale Nouveautés rendue dynamique : ne s'affiche plus une fois fermée pour une version donnée (`VITE_APP_VERSION` en clé de comparaison). Cycle formalisé dans `close.md` (étape 6 : ajouter une entrée en langage clair si changement visible pour Marie) et `deploy.md` (étape 7 : vider `WHATS_NEW` après publication confirmée). Entrée obsolète (icône « Tests à faire », déjà vue par Marie) retirée du tableau.
- Nouvel export de Marie (17h40) analysé et ingéré : 7 résultats de tests réels, dont 4 échecs confirmant le bug Budget déjà corrigé — Phase 3 de `roadmap_tests_marie.md` close (test manuel d'ingestion réussi avec un export réel).

## Livrables produits ou modifiés
- `src/app/contexts/useSettingsState.ts`/`.test.tsx` : réparation de l'entrée Outil Budget à l'import.
- `src/ui/screens/onboarding/E01Welcome.tsx`/`.test.tsx` : bannière urgente (bouton Fait, couleur), modale Nouveautés dynamique par version, `WHATS_NEW` vidé.
- `src/ui/screens/tests/E121ManualTests.tsx`/`.test.tsx` : bannière urgente identique.
- `.claude/commands/close.md`, `.claude/commands/deploy.md` : cycle d'écriture/vidage de `WHATS_NEW`.
- `_contexte/marie_tests_journal.json` : 7 entrées ajoutées (export du 2026-08-14 17h40).
- `roadmap_tests_marie.md` : Phase 3 `[FAIT]`.

## Hypothèses validées / invalidées
- VALIDE : cause du bug confirmée par les commentaires de Marie (« pas accès au budget » ×2, « il manque le budget ») sur 3 tests distincts du catalogue.
- VALIDE : correctif couvert par un test unitaire dédié (réparation `tableau_comptage` à l'import).
- INVALIDE : l'export vide du midi (15h10) n'était pas un bug de code (chemins `submitManualTestResult`/`exportData` vérifiés sains) — Marie avait rempli les tests après cet export, confirmé par le nouvel export du soir.
- EN ATTENTE : correctif pas encore déployé au moment de ce `/close` — le `/deploy` en cours va le publier.

## Prochaine étape exacte
Terminer le déploiement en cours, puis redemander à Marie de réimporter et revalider les 4 tests en échec (Budget).

## Question bloquante pour la session suivante
Aucune.
