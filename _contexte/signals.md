# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-14)

## Contexte chaud
- `donnees_marie/export-audhd-2026-08-13.json` : export réel de Marie, stocké en local, gitignoré et déclaré donnée sensible dans `CLAUDE.md` — ne pas lire/écrire sans instruction explicite.
- `_contexte/dernier_deploiement.md` : consigné par `/deploy` lui-même (version/date/URL), indépendamment de `/close`. Dernier déploiement prod : v5.24, 2026-08-14, `https://appli-audhd.netlify.app`.
- `src/ui/screens/onboarding/E01Welcome.tsx` : liste `WHATS_NEW` codée en dur, à mettre à jour manuellement à chaque nouvelle dist prod (pas d'automatisation depuis `/deploy` pour l'instant).
- Site de test `appli-audhd-dev.netlify.app` (`NETLIFY_SITE_ID_DEV` dans `.env`) : déployable via `/deploy_dev`, pour tester hors réseau local sans toucher la prod.
- Panneau dev (haut à droite, visible uniquement en `npm run dev`) affiche la version courante, lue automatiquement dans `CHANGELOG.md` au build (`__APP_DEV_VERSION__`, `vite.config.ts`) — se met à jour seule à chaque bump de version, rien à maintenir à la main.
- `roadmap_tests_marie.md` : les phases 1 et 2 sont `[FAIT]` — catalogue in-app de sept tests Marie, validation commentée, historique et export/import v3.2. La phase 3 archivera les résultats reçus côté projet.
- `/deploy` et `/deploy_dev` vérifient la fraîcheur de `src/domain/data/manualTestsCatalog.ts` avant le déploiement.

## Questions ouvertes
- [P1] Valider les 5 points de `tests_manuels.md` (création d'outil sans dossier, suppression de liste, retrait sur livret, dialogue d'ajout d'élément, import de sauvegarde JSON) sur appareil réel, puis clore la Phase V5.1-0 (les 4 premiers points seulement conditionnent la phase, le 5ᵉ — import — est hors périmètre de V5.1-0). — fait quand : les 5 points validés, `tests_manuels.md` vidé — réf : `tests_manuels.md`, `roadmap_v5.1.md` Phase V5.1-0
- [P1] Informer Marie que l'adresse de test a changé : `delightful-sunflower-836720.netlify.app` (qu'elle a utilisée) n'est plus à jour, le site officiel est désormais `https://appli-audhd.netlify.app` (déployé en v5.22). — fait quand : nouvelle adresse communiquée à Marie — réf : `.claude/commands/deploy.md`, `_contexte/dernier_deploiement.md`
- [P1] Communiquer à Marie les points de `a_communiquer_v5.md` maintenant que la V5.0 complète est livrée (V5-0 à V5-3 close), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P1] Demander à Marie un test réel du Budget refondu (E71/E73/E74) — jamais vu par elle, l'écran a changé depuis sa dernière utilisation. — fait quand : retour de Marie recueilli sur le Budget — réf : `E71Budget.tsx`, `roadmap_v5.1.md`
- [P2] Démarrer la Phase 3 de `roadmap_tests_marie.md` après le checkpoint demandé : script d'ingestion et journal versionné des résultats reçus de Marie. — fait quand : Phase 3 `[FAIT]`, journal projet alimenté sans écrasement — réf : `roadmap_tests_marie.md` Phase 3
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `roadmap_v5.1.md` § Q à trancher
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold toujours visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`

## Dernière session (2026-08-14 — tests manuels Marie, phases 1 et 2)

## Décisions prises
- Le catalogue en code est la référence de tous les tests destinés à Marie ; il contient sept scénarios actuels, dont la validation et restauration d’un résultat.
- Les résultats sont append-only dans Dexie, le dernier fixe le statut affiché et l’historique complet reste visible.
- L’export/import JSON v3.2 conserve désormais les 15 tables, dont `manual_test_results`.

## Livrables produits ou modifiés
- `src/domain/data/manualTestsCatalog.ts`, `E121ManualTests.tsx`, `TopBar.tsx` : catalogue, écran, accès et pastilles.
- `manualTestResultRepository.ts`, `useManualTestsState.ts`, `db.ts` : stockage append-only et migration v11.
- `useSettingsState.ts` : export/import de l’historique (payload v3.2).
- `roadmap_tests_marie.md`, `tests_manuels.md`, `.claude/commands/close.md` : règles de suivi et de maintien des tests Marie.

## Hypothèses validées / invalidées
- VALIDE : la validation manuelle de la phase 2 a confirmé la saisie d’un résultat et sa conservation après export/import.
- EN ATTENTE : la référence durable de l’historique sera le journal versionné prévu en phase 3, car un import remplace la base de l’appareil.

## Prochaine étape exacte
Faire le checkpoint `/compact`, puis obtenir confirmation écrite avant de démarrer la phase 3 de `roadmap_tests_marie.md`.

## Question bloquante pour la session suivante
Aucune.
