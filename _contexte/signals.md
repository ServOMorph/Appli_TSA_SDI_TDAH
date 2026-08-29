# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-29)

## Contexte chaud
- **v5.64 déployée en prod le 2026-08-29** (`https://appli-audhd.netlify.app`, HTTP 200 vérifié) : correctif du débordement à droite des cadres « Date » et « Heure de début » du formulaire de tâche (demande #3). Cause : le `<form>`, enfant flex sans `min-width: 0`, ne rétrécissait pas sous la largeur intrinsèque des sélecteurs natifs date/heure. Corrigé sur `E21CreateTaskV2.tsx` et `E24EditTask.tsx`, test de non-régression. Marie doit revalider le parcours `cadre-date-heure-dans-l-ecran`. 624 tests verts. Commentaires v5.62/v5.63/v5.64 publiés sur Drive (`COMMUNICATION/Marie/livraisons/`).
- **`roadmap_planning_accueil_2026-08-29.md` (demandes 18-22, toutes « Accueil / Planning ») : Phases 1 et 2 livrées le 2026-08-29, non déployées.** Phase 1 (#20) : planning de l'accueil à hauteur fixe 325 px, poignée + trait gris + logique drag/expand retirés, prop `collapsed` de `PlanningBoard` supprimée ; décision 5 tranchée = route `planning` **conservée** (originScreen de la création de tâche, emplacement de la future vue semaine, ne pilote plus d'état déplié). Phase 2 (#18) : teinte de la case portée sur le conteneur de ligne (hauteur ∝ durée), sous-tâches dépliées dans le même aplat coloré, cas « terminé » conservé. 624 tests, `tsc -b` et lint verts. Phase 3 (#19) `[EN COURS]`, Phases 4 (#21) et 5 (#22) `[TODO]`. 2 décisions produit bloquantes pour la Phase 5 (voir Questions ouvertes). 2 parcours catalogue ajoutés (`planning-hauteur-fixe`, `case-de-tache-coloree-en-entier`), 2 entrées `WHATS_NEW`.
- **Contournement de l'étape 0.4 de `/deploy` corrigé le 2026-08-29** : titre de l'étape 0 renommé (mentionne la revue du Doc), compte-rendu de la revue rendu obligatoire en 0.4, jalon daté `- Dernière exécution de la revue :` écrit dans l'en-tête de `_contexte/marie_modifications_suivi.md` à chaque passage de `.claude/revue_googledoc.md` (Doc changé ou non), porte bloquante mécanique 3.9 dans `/deploy` (`grep` du jalon, doit être la date du jour). Mécanisme non encore exercé en live.
- **Suivi des demandes du Google Doc de Marie** : registre durable `_contexte/marie_modifications_suivi.md`, réconcilié par `/analyser_googledoc` (étape 6) et par la revue commune `.claude/revue_googledoc.md` câblée dans `/deploy` étape 0 et `/traiter_export_marie`. La revue compare la date de modif du Doc à « Dernière revue du Doc » du registre (2026-08-28). Demandes 1-17 : 16 livrées, #7 écartée, retirées du Doc par Marie le 28/08 (lignes conservées comme historique).
- **Exports de Marie du 2026-08-28 traités** : `utiliser-comptes` rev 2 et `pastille-nouveaux-tests` validés ; `cadre-date-heure-dans-l-ecran` en échec (« ça dépasse toujours ») → corrigé en v5.64, à revalider.
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
- `tests_manuels.md` vide — toutes les vérifications passent par le catalogue in-app `manualTestsCatalog.ts`.
- `_contexte/dernier_deploiement.md` : v5.64, 2026-08-29, prod vérifiée HTTP 200.
- Site de test `appli-audhd-dev.netlify.app` (`NETLIFY_SITE_ID_DEV` dans `.env`) : déployable via `/deploy_dev`.
- `/deploy` et `/deploy_dev` vérifient la fraîcheur de `manualTestsCatalog.ts` avant le déploiement.

## Questions ouvertes
- [P1] **Poursuivre `roadmap_planning_accueil_2026-08-29.md`** : Phases 1-2 `[FAIT]`, Phase 3 (#19, fond du bandeau de dates pleinement coloré) `[EN COURS]`, Phases 4-5 `[TODO]`. Phase par phase avec checkpoint `/compact`. — fait quand : les 5 phases `[FAIT]`, `/deploy` proposé — réf : `roadmap_planning_accueil_2026-08-29.md`, `src/ui/screens/dashboard/PlanningBoard.tsx`, `src/ui/screens/dashboard/E10Dashboard.tsx`
- [P1] **Décisions produit à obtenir de Marie avant la Phase 5 (#22)** : (a) le glissement de la vue semaine défile d'une semaine ou d'un jour ? (b) la route `planning` (dépliage inline, vidée par la Phase 1) est-elle réaffectée à la vue semaine ou faut-il une route `planning-week` distincte ? — fait quand : les deux points tranchés (avec Marie ou en implémentation validée) — réf : `roadmap_planning_accueil_2026-08-29.md` § Décisions produit non tranchées (points 4 et 5)
- [P2] `/deploy` étape 0.4 (revue du Doc) : mécanisme anti-contournement posé le 29/08 (compte-rendu forcé + jalon daté + porte 3.9). Vérifier qu'il fonctionne au premier `/deploy` réel. — fait quand : un `/deploy` exécute 0.4, affiche son compte-rendu et passe la porte 3.9 — réf : `.claude/commands/deploy.md` étapes 0 et 3.9, `.claude/revue_googledoc.md` étape 2
- [P1] Retirer du dépôt le lien Google Drive du commentaire de livraison v5.58 et le stocker dans `.env` ; ne jamais versionner ce lien. — fait quand : le lien n’est plus suivi par Git et est lu depuis `.env` — réf : `COMMUNICATION/Marie/livraisons/v5.58.md`, `.env.example`, `.gitignore`
- [P1] Définir puis appliquer le rangement des fichiers `commentaires_marie_vX.Y.docx` créés à la racine après publication Drive. — fait quand : aucun fichier de commentaire de livraison ne reste à la racine et son emplacement d’archive est documenté — réf : `commentaires_marie_v5.58.docx`, `.claude/commands/deploy.md`
- [P1] Fiabiliser la clôture des roadmaps dans `/deploy` : analyser la roadmap active avant le build et annuler le déploiement si elle n’est pas terminée ; archiver la roadmap après un déploiement réussi. — fait quand : la procédure bloque une roadmap incomplète et archive une roadmap livrée — réf : `.claude/commands/deploy.md`, `Archives/roadmap_retours_marie_2026-08-25.md`, `Archives/`
- [P1] Demander à Marie de tester en conditions réelles les parcours v5.56 signalés dans le catalogue in-app. — fait quand : nouvel export de Marie ingéré avec les tests v5.56 validés — réf : `manualTestsCatalog.ts`, `_contexte/marie_tests_journal.json`
- [P1] Optimiser en urgence le bundle JavaScript principal (553 kB minifié, au-dessus du seuil Vite de 500 kB), notamment par chargement différé des écrans. — fait quand : build sous le seuil ou découpage justifié et validé — réf : `src/App.tsx`, `vite.config.ts`
- [P2] #3 (cadre Date/Heure du formulaire de tâche) : correctif appliqué en v5.64 (`min-width: 0` sur le `<form>`), `en attente` de revalidation par Marie via le parcours `cadre-date-heure-dans-l-ecran`. — fait quand : Marie valide le parcours en `ok` (registre → `livrée v5.64`), ou re-signale un débordement (rouvrir avec capture) — réf : `_contexte/marie_modifications_suivi.md`, `E21CreateTaskV2.tsx:201`, `E24EditTask.tsx:191`
- [P2] Traiter les 3 frictions du 2026-08-19 comme nouvelles demandes lors du prochain `/traiter_demandes_marie` : geste de glissement planning à revoir (pousser le contenu plutôt que superposer — cohérent avec la demande initiale de Marie sur ce point, jamais satisfaite en l'état), clarifier avec Marie le lien retrait de livret/catégorie budget, vérifier la disparition des test IDs obsolètes après le nouveau déploiement. — fait quand : les 3 points tranchés ou intégrés à une roadmap — réf : `_contexte/marie_tests_journal.json` (entrées `44f24c63`, `be0c10ef`, `6e32ace5`)
- [P2] Appliquer le découpage en 7 catégories validé par Marie aux autres communications/roadmaps (pas seulement le catalogue de tests). — fait quand : convention explicite adoptée pour les prochaines roadmaps/communications — réf : `COMMUNICATION/message_marie_categories_travail.md`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `Archives/roadmap_v5.1.md` § Q à trancher
- [P3] `todayStr()` (`planningSlotRules.ts`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold toujours visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`
- [P3] `PlanningBoard.tsx` : le bouton « Reporter » (mode surcharge) est imbriqué dans le `<button>` de ligne — HTML invalide, avertissement jsdom au run des tests. Pré-existant, révélé par la Phase 2. Candidat à une phase de refacto entre deux phases fonctionnelles de la roadmap planning. — fait quand : le bouton « Reporter » n'est plus descendant du bouton de ligne — réf : `src/ui/screens/dashboard/PlanningBoard.tsx` (rendu d'une ligne), `roadmap_planning_accueil_2026-08-29.md`
- [P3] Veille (consigne permanente de l'utilisateur, 2026-08-17) : avertissement de build « chunk JS > 500 kB » (`vite build`) laissé tel quel pour l'instant (531 kB gzip 149 kB, `App.tsx` importe statiquement les ~25 écrans). Si le poids continue de grossir significativement, proposer le refacto (`React.lazy`/`Suspense` par écran) plutôt que de laisser filer silencieusement. — fait quand : avertissement de taille signalé de nouveau en augmentation notable lors d'un futur `/deploy` — réf : `vite.config.ts`, `src/App.tsx`

## Dernière session (2026-08-29 — Phases 1-2 roadmap planning accueil : #20 hauteur fixe, #18 case colorée)

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
