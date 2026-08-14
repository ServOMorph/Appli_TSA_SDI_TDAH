# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-14)

## Contexte chaud
- `donnees_marie/export-audhd-2026-08-13.json` : export réel de Marie, stocké en local, gitignoré et déclaré donnée sensible dans `CLAUDE.md` — ne pas lire/écrire sans instruction explicite. Deux exports plus récents reçus hors de ce dossier (Downloads, 2026-08-14 15h10 et 17h40) ont été analysés et ingérés dans la session, non copiés dans `donnees_marie/`.
- `_contexte/dernier_deploiement.md` : consigné par `/deploy` lui-même (version/date/URL), indépendamment de `/close`. Dernier déploiement prod : v5.31, 2026-08-14 — **le correctif Budget de cette session n'y est pas encore inclus**, ce `/deploy` va le publier.
- `src/ui/screens/onboarding/E01Welcome.tsx` : `WHATS_NEW` désormais géré par cycle `/close` (ajoute une entrée en langage clair si changement visible pour Marie) / `/deploy` (vide le tableau après publication). Affichage de la modale conditionné à `VITE_APP_VERSION` (`localStorage`), ne se réaffiche plus une fois fermée pour une version donnée. `WHATS_NEW` est vide en fin de session (rien en attente).
- Site de test `appli-audhd-dev.netlify.app` (`NETLIFY_SITE_ID_DEV` dans `.env`) : déployable via `/deploy_dev`, pour tester hors réseau local sans toucher la prod.
- Panneau dev (haut à droite, visible uniquement en `npm run dev`) affiche la version courante, lue automatiquement dans `CHANGELOG.md` au build (`__APP_DEV_VERSION__`, `vite.config.ts`).
- `/deploy` et `/deploy_dev` vérifient la fraîcheur de `src/domain/data/manualTestsCatalog.ts` avant le déploiement.
- Bug « Budget disparu à l'import » : cause identifiée et corrigée dans `useSettingsState.ts` — la réparation des `tools` à l'import ne recréait que les entrées `liste` manquantes, jamais l'entrée globale `tableau_comptage` (celle qui pilote la carte Budget de `E70Tools.tsx`). Un compte qui en était déjà dépourvu (cas de Marie) ne la récupérait donc jamais. Corrigé : la réparation couvre maintenant aussi cette entrée.

## Questions ouvertes
- [P1] Valider les 6 points de `tests_manuels.md` (création d'outil sans dossier, suppression de liste, retrait sur livret, dialogue d'ajout d'élément, badge énergie fond couleur d'ambiance, import de sauvegarde JSON) sur appareil réel, puis clore la Phase V5.1-0 (les 4 premiers points seulement conditionnent la phase, le badge énergie et l'import sont hors périmètre de V5.1-0). — fait quand : les 6 points validés, `tests_manuels.md` vidé — réf : `tests_manuels.md`, `roadmap_v5.1.md` Phase V5.1-0
- [P1] Une fois ce déploiement effectif, redemander à Marie de réimporter son fichier (Paramètres > Export et import — bannière urgente déjà en place) et de revalider dans « Tests à faire » les 4 tests en échec de son export du 17h40 : « Retirer de l'argent d'un livret », « Utiliser le budget », « Importer une sauvegarde » (tous les trois « pas accès au budget » / « il manque le budget », cause commune corrigée) et confirmer la réapparition du Budget. — fait quand : ces 4 tests validés dans un nouvel export ingéré — réf : `_contexte/marie_tests_journal.json`, `useSettingsState.ts`
- [P1] Informer Marie que l'adresse de test a changé : `delightful-sunflower-836720.netlify.app` (qu'elle a utilisée) n'est plus à jour, le site officiel est désormais `https://appli-audhd.netlify.app` (déployé en v5.22). — fait quand : nouvelle adresse communiquée à Marie — réf : `.claude/commands/deploy.md`, `_contexte/dernier_deploiement.md`
- [P1] Communiquer à Marie les points de `a_communiquer_v5.md` maintenant que la V5.0 complète est livrée (V5-0 à V5-3 close), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `roadmap_v5.1.md` § Q à trancher
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold toujours visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`

## Dernière session (2026-08-14 — suite 12, correctif Budget, bannières et modale Nouveautés dynamiques, Phase 3 tests Marie close)

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

---

## Dernière session archivée (2026-08-14 — suite 11, badge énergie couleur d'ambiance, déploiement v5.31)

## Décisions prises
- Retour de test manuel de Marie (screenshot annoté) traité : badge énergie de la barre du haut allégé (retrait du libellé texte) et fond teinté avec la couleur d'ambiance existante (`Settings.ambiance_color`), après clarification avec l'utilisateur que le rose du screen était cette couleur paramétrable, pas une couleur fixe à coder en dur. `/deploy` exécuté jusqu'au bout après confirmation explicite de l'utilisateur malgré `tests_manuels.md` non vide (6 points).

## Livrables produits ou modifiés
- `src/ui/components/EnergyDisplay.tsx` : retrait du texte « planifié / dispo », fond via `pastelBackground(ambianceColor)`.
- `src/ui/components/TopBar.tsx`, `src/ui/screens/dashboard/E10Dashboard.tsx` : prop `ambianceColor` propagée depuis `settings.ambiance_color`.
- `tests_manuels.md` : point 5 ajouté (vérification visuelle du badge énergie).
- `dist/v5.31` : build déployé en prod, `_contexte/dernier_deploiement.md` mis à jour.

## Hypothèses validées / invalidées
- INVALIDE : première implémentation avec une couleur rose codée en dur (`--color-energy-bg`) -> pivot vers la couleur d'ambiance existante déjà utilisée pour teinter les tâches planifiées (`ambiance.ts`), sur correction explicite de l'utilisateur.
- VALIDE : déploiement v5.31 effectif, HTTP 200 vérifié.
- EN ATTENTE : connecteur MCP Google Drive confirmé actif mais avec des scopes d'authentification insuffisants pour lire le contenu d'un Google Doc ; aucun outil du connecteur ne permet d'écrire dans le corps d'un Doc existant, quel que soit le scope.

## Prochaine étape exacte
Attendre validation manuelle des 6 points de `tests_manuels.md` sur appareil réel.

## Question bloquante pour la session suivante
Aucune.
