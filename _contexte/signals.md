# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-14)

## Contexte chaud
- `donnees_marie/export-audhd-2026-08-13.json` : export réel de Marie, stocké en local, gitignoré et déclaré donnée sensible dans `CLAUDE.md` — ne pas lire/écrire sans instruction explicite.
- `_contexte/dernier_deploiement.md` : consigné par `/deploy` lui-même (version/date/URL), indépendamment de `/close`. Dernier déploiement prod : v5.29, 2026-08-14, `https://appli-audhd.netlify.app` (HTTP 200 vérifié), inclut la bannière urgence et le catalogue de tests Marie.
- `src/ui/screens/onboarding/E01Welcome.tsx` : liste `WHATS_NEW` codée en dur, à mettre à jour manuellement à chaque nouvelle dist prod (pas d'automatisation depuis `/deploy` pour l'instant).
- Site de test `appli-audhd-dev.netlify.app` (`NETLIFY_SITE_ID_DEV` dans `.env`) : déployable via `/deploy_dev`, pour tester hors réseau local sans toucher la prod.
- Panneau dev (haut à droite, visible uniquement en `npm run dev`) affiche la version courante, lue automatiquement dans `CHANGELOG.md` au build (`__APP_DEV_VERSION__`, `vite.config.ts`) — se met à jour seule à chaque bump de version, rien à maintenir à la main.
- `roadmap_tests_marie.md` : les phases 1 et 2 sont `[FAIT]` — catalogue in-app de sept tests Marie, validation commentée, historique et export/import v3.2.
- `/deploy` et `/deploy_dev` vérifient la fraîcheur de `src/domain/data/manualTestsCatalog.ts` avant le déploiement.
- Flux d'archivage des tests Marie (phase 3) : à réception d'un export JSON de Marie (`donnees_marie/`, donnée sensible), exécuter `python scripts/ingest_manual_tests.py <chemin_export>` — fusionne `manual_test_results` dans `_contexte/marie_tests_journal.json` (dédoublonnage par `id`, jamais d'écrasement).

## Questions ouvertes
- [P1] Valider les 5 points de `tests_manuels.md` (création d'outil sans dossier, suppression de liste, retrait sur livret, dialogue d'ajout d'élément, import de sauvegarde JSON) sur appareil réel, puis clore la Phase V5.1-0 (les 4 premiers points seulement conditionnent la phase, le 5ᵉ — import — est hors périmètre de V5.1-0). — fait quand : les 5 points validés, `tests_manuels.md` vidé — réf : `tests_manuels.md`, `roadmap_v5.1.md` Phase V5.1-0
- [P1] Informer Marie que l'adresse de test a changé : `delightful-sunflower-836720.netlify.app` (qu'elle a utilisée) n'est plus à jour, le site officiel est désormais `https://appli-audhd.netlify.app` (déployé en v5.22). — fait quand : nouvelle adresse communiquée à Marie — réf : `.claude/commands/deploy.md`, `_contexte/dernier_deploiement.md`
- [P1] Communiquer à Marie les points de `a_communiquer_v5.md` maintenant que la V5.0 complète est livrée (V5-0 à V5-3 close), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P1] Demander à Marie un test réel du Budget refondu (E71/E73/E74) — jamais vu par elle, l'écran a changé depuis sa dernière utilisation. — fait quand : retour de Marie recueilli sur le Budget — réf : `E71Budget.tsx`, `roadmap_v5.1.md`
- [P1] v5.29 est en prod (bannière urgence + catalogue de tests Marie). Obtenir l'export de Marie une fois envoyé, puis exécuter `python scripts/ingest_manual_tests.py <export>` pour clore le test manuel de la Phase 3. — fait quand : Phase 3 `[FAIT]`, journal projet alimenté avec un vrai résultat — réf : `roadmap_tests_marie.md` Phase 3, `scripts/ingest_manual_tests.py`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `roadmap_v5.1.md` § Q à trancher
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold toujours visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`

## Dernière session (2026-08-14 — Phase 3 tests manuels Marie, bannière urgence, déploiement v5.29)

## Décisions prises
- Format du journal projet de la Phase 3 tranché avec l'utilisateur : JSON structuré (`{ "entries": [...] }`), emplacement `_contexte/marie_tests_journal.json`.
- Bannière « URGENCE : importe tes données, vérifie-les, puis exporte-les et envoie-les-moi » ajoutée sur l'écran d'accueil et l'écran « Tests à faire », pour obtenir un nouvel export de Marie.
- Déploiement v5.29 confirmé par l'utilisateur malgré `tests_manuels.md` non vide, après vérification que ses 5 points sont déjà couverts par le catalogue in-app soumis à Marie.

## Livrables produits ou modifiés
- `scripts/ingest_manual_tests.py`, `_contexte/marie_tests_journal.json` : script d'ingestion (T10) et journal vide, testés avec un export factice.
- `roadmap_tests_marie.md` : Phase 3 `[EN COURS]`, T10-T12 cochés.
- `src/ui/screens/onboarding/E01Welcome.tsx`, `src/ui/screens/tests/E121ManualTests.tsx` : bannière urgence, `WHATS_NEW` mis à jour.
- `dist/v5.29` : build déployé en prod, `_contexte/dernier_deploiement.md` mis à jour.

## Hypothèses validées / invalidées
- VALIDE : le script d'ingestion fonctionne (ajout puis re-exécution idempotente vérifiés sur un export factice).
- VALIDE : les 5 points de `tests_manuels.md` correspondent chacun à un test du catalogue in-app (vérifié par lecture de `manualTestsCatalog.ts`).
- INVALIDE : l'export existant de Marie (13/08) est antérieur à la fonctionnalité (pas de champ `manual_test_results`) -> pivot vers l'obtention d'un nouvel export post-déploiement.

## Prochaine étape exacte
Attendre l'export de Marie (bannière urgence en prod), puis exécuter `python scripts/ingest_manual_tests.py <export>` pour clore le test manuel de la Phase 3.

## Question bloquante pour la session suivante
Aucune.
