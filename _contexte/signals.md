# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-14)

## Contexte chaud
- `donnees_marie/export-audhd-2026-08-13.json` : export réel de Marie, stocké en local, gitignoré et déclaré donnée sensible dans `CLAUDE.md` — ne pas lire/écrire sans instruction explicite.
- `_contexte/dernier_deploiement.md` : consigné par `/deploy` lui-même (version/date/URL), indépendamment de `/close`. Dernier déploiement prod : v5.24, 2026-08-14, `https://appli-audhd.netlify.app`.
- `src/ui/screens/onboarding/E01Welcome.tsx` : liste `WHATS_NEW` codée en dur, à mettre à jour manuellement à chaque nouvelle dist prod (pas d'automatisation depuis `/deploy` pour l'instant).
- Site de test `appli-audhd-dev.netlify.app` (`NETLIFY_SITE_ID_DEV` dans `.env`) : déployable via `/deploy_dev`, pour tester hors réseau local sans toucher la prod.
- Panneau dev (haut à droite, visible uniquement en `npm run dev`) affiche la version courante, lue automatiquement dans `CHANGELOG.md` au build (`__APP_DEV_VERSION__`, `vite.config.ts`) — se met à jour seule à chaque bump de version, rien à maintenir à la main.
- `roadmap_tests_marie.md` (nouvelle, à la racine) : catalogue de tests manuels pédagogiques pour Marie, in-app, avec historique et archivage projet — Phase 1 `[TODO]`, rien de codé.
- `/deploy` et `/deploy_dev` vérifient désormais l'existence et la fraîcheur de `src/domain/data/manualTestsCatalog.ts` (catalogue tests Marie) — no-op tant que ce fichier n'existe pas (fonctionnalité pas encore livrée).

## Questions ouvertes
- [P1] Valider les 5 points de `tests_manuels.md` (création d'outil sans dossier, suppression de liste, retrait sur livret, dialogue d'ajout d'élément, import de sauvegarde JSON) sur appareil réel, puis clore la Phase V5.1-0 (les 4 premiers points seulement conditionnent la phase, le 5ᵉ — import — est hors périmètre de V5.1-0). — fait quand : les 5 points validés, `tests_manuels.md` vidé — réf : `tests_manuels.md`, `roadmap_v5.1.md` Phase V5.1-0
- [P1] Informer Marie que l'adresse de test a changé : `delightful-sunflower-836720.netlify.app` (qu'elle a utilisée) n'est plus à jour, le site officiel est désormais `https://appli-audhd.netlify.app` (déployé en v5.22). — fait quand : nouvelle adresse communiquée à Marie — réf : `.claude/commands/deploy.md`, `_contexte/dernier_deploiement.md`
- [P1] Communiquer à Marie les points de `a_communiquer_v5.md` maintenant que la V5.0 complète est livrée (V5-0 à V5-3 close), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P1] Demander à Marie un test réel du Budget refondu (E71/E73/E74) — jamais vu par elle, l'écran a changé depuis sa dernière utilisation. — fait quand : retour de Marie recueilli sur le Budget — réf : `E71Budget.tsx`, `roadmap_v5.1.md`
- [P2] Démarrer la Phase 1 de `roadmap_tests_marie.md` (modèle de données, catalogue, écran de consultation, icône + pastille rouge « nouveau test ») une fois la Phase V5.1-0 close. — fait quand : Phase 1 `[FAIT]`, checkpoint `/compact` passé — réf : `roadmap_tests_marie.md`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `roadmap_v5.1.md` § Q à trancher
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold toujours visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`

## Dernière session (2026-08-14, suite 6 — roadmap tests manuels Marie, vérification /deploy)

## Décisions prises
- Nouvelle roadmap `roadmap_tests_marie.md` créée : catalogue de tests manuels pour Marie, en langage clair, consultable in-app (icône dans `TopBar.tsx`), avec modale de validation (coche + commentaire obligatoire si refus), historique append-only, et archivage côté projet (import remplaçant tout à chaque fois, l'historique ne peut pas reposer uniquement sur l'appareil de Marie).
- Catalogue des tests alimenté par nous en code (pas d'écran d'admin), distinct de `tests_manuels.md` (file technique de dev, inchangée).
- Repère visuel rouge sur les tests jamais soumis par Marie (aucune entrée `manualTestResults` pour leur `test_id`) et pastille rouge sur l'icône du bandeau tant qu'il en reste au moins un.
- `/deploy` et `/deploy_dev` : nouvelle vérification non bloquante de la fraîcheur du catalogue (`src/domain/data/manualTestsCatalog.ts`), no-op tant que la Phase 1 n'est pas codée.
- Modification résiduelle non liée à cette session (`DevResetButton.tsx`, réordonnancement du bouton Reset DB) incluse dans le commit de clôture sur confirmation explicite de l'utilisateur.

## Livrables produits ou modifiés
- `roadmap_tests_marie.md` (nouveau) : 3 phases (modèle + écran, modale + export/import, archivage projet).
- `.claude/commands/deploy.md` : vérification 3.5 (catalogue tests Marie à jour, avertissement non bloquant, guardée par existence de fichier).
- `.claude/commands/deploy_dev.md` : même vérification en étape 3, renumérotation des étapes suivantes.
- `src/ui/components/DevResetButton.tsx` : réordonnancement visuel (bouton Reset DB déplacé après la case à cocher) — résidu d'une session antérieure, committé sur confirmation.
- Aucun code applicatif de la fonctionnalité tests-Marie écrit (roadmap seule).
- `tsc -b` clean (vérifié cette session, seul changement de code étant un déplacement JSX).

## Hypothèses validées / invalidées
- EN ATTENTE : la fraîcheur du catalogue de tests Marie, une fois codée en Phase 1/`/deploy`, dépendra d'une comparaison `CHANGELOG.md` / contenu du catalogue laissée au jugement de l'assistant au moment du déploiement (pas de règle automatisable stricte) — à observer au premier déploiement réel post-Phase 1.

## Prochaine étape exacte
Valider les 5 points de `tests_manuels.md` sur appareil réel, puis clore la Phase V5.1-0. Informer Marie du changement d'adresse et lui transmettre `a_communiquer_v5.md` + demande de test du Budget. Démarrer `roadmap_tests_marie.md` Phase 1 quand la priorité le permet.

## Question bloquante pour la session suivante
Aucune.
