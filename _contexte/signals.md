# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-14)

## Contexte chaud
- `donnees_marie/export-audhd-2026-08-13.json` : export réel de Marie, stocké en local, gitignoré et déclaré donnée sensible dans `CLAUDE.md` — ne pas lire/écrire sans instruction explicite.
- `_contexte/dernier_deploiement.md` créé : `/deploy` y consigne désormais lui-même version/date/URL du dernier déploiement, indépendamment de `/close`. Avant l'exécution de `/deploy` demandée en fin de cette session : v5.22, 2026-08-14, `https://appli-audhd.netlify.app`.
- `src/ui/screens/onboarding/E01Welcome.tsx` : liste `WHATS_NEW` codée en dur, à mettre à jour manuellement à chaque nouvelle dist prod (pas d'automatisation depuis `/deploy` pour l'instant).
- Site de test `appli-audhd-dev.netlify.app` (`NETLIFY_SITE_ID_DEV` dans `.env`) : déployable via `/deploy_dev`, pour tester hors réseau local sans toucher la prod.

## Questions ouvertes
- [P1] Valider les 5 points de `tests_manuels.md` (création d'outil sans dossier, suppression de liste, retrait sur livret, dialogue d'ajout d'élément, import de sauvegarde JSON) sur appareil réel, puis clore la Phase V5.1-0 (les 4 premiers points seulement conditionnent la phase, le 5ᵉ — import — est hors périmètre de V5.1-0). — fait quand : les 5 points validés, `tests_manuels.md` vidé — réf : `tests_manuels.md`, `roadmap_v5.1.md` Phase V5.1-0
- [P1] Informer Marie que l'adresse de test a changé : `delightful-sunflower-836720.netlify.app` (qu'elle a utilisée) n'est plus à jour, le site officiel est désormais `https://appli-audhd.netlify.app` (déployé en v5.22). — fait quand : nouvelle adresse communiquée à Marie — réf : `.claude/commands/deploy.md`, `_contexte/dernier_deploiement.md`
- [P1] Communiquer à Marie les points de `a_communiquer_v5.md` maintenant que la V5.0 complète est livrée (V5-0 à V5-3 close), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P1] Demander à Marie un test réel du Budget refondu (E71/E73/E74) — jamais vu par elle, l'écran a changé depuis sa dernière utilisation. — fait quand : retour de Marie recueilli sur le Budget — réf : `E71Budget.tsx`, `roadmap_v5.1.md`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `roadmap_v5.1.md` § Q à trancher
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold toujours visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`

## Dernière session (2026-08-14, suite 4 — modale Nouveautés, site de test dev, /close intégré aux déploiements)

## Décisions prises
- Modale « Nouveautés » sur l'écran d'accueil : contenu limité au delta réel entre la dernière dist prod précédente (v5.20) et l'actuelle (v5.22), plutôt qu'au dernier vrai test de Marie (plus large mais moins objectif) — tranché avec l'utilisateur.
- Tentative de couper l'image d'accueil en deux annulée sur demande explicite ; retour à l'image entière.
- `/deploy` et `/deploy_dev` exécutent désormais `/close` en étape 0 — décision explicite de l'utilisateur.

## Livrables produits ou modifiés
- `src/ui/components/WhatsNewModal.tsx` (nouveau) : overlay sur l'image, opacité réduite, liste alignée à gauche, fermable.
- `src/ui/screens/onboarding/E01Welcome.tsx` : modale intégrée, contenu réel (import de sauvegarde, export complet).
- `.claude/commands/deploy_dev.md` (nouveau) : build + déploiement sur `appli-audhd-dev.netlify.app`, sans version ni check bloquant lourd, `/close` en étape 0.
- `.claude/commands/deploy.md` : étape 0 `/close` ajoutée, permissions `git add`/`commit`/`push`/`diff` fusionnées.
- `.env`/`.env.example` : `NETLIFY_SITE_ID_DEV` ajouté (site déjà existant sur le compte Netlify).
- `a_communiquer_v5.md` : restauré après corruption accidentelle d'un caractère (non liée à cette session).
- Déploiement de test effectué sur `appli-audhd-dev.netlify.app`, vérifié HTTP 200.
- Tests existants de `E01Welcome` toujours verts (3/3), `tsc -b` clean. Aucun test unitaire nouveau (composants UI simples).

## Hypothèses validées / invalidées
- VALIDE : le site Netlify `appli-audhd-dev` existait déjà sur le compte (`netlify sites:list`) — pas de création nécessaire, juste son ID à brancher.

## Prochaine étape exacte
`/deploy` en cours d'exécution (demandé par l'utilisateur juste après cette clôture) : build versionné + déploiement prod sur `appli-audhd.netlify.app`.

## Question bloquante pour la session suivante
Aucune.
