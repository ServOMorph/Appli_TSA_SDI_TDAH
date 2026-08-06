# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-06)

## Questions ouvertes
- [P1] Reprendre les 6 points de `tests_manuels.md` (Phase V5-3) sur les écrans corrigés cette session (dashboard, Outils, Budget), puis clore la gate de phase. — fait quand : phase passée à `[FAIT]` — réf : `roadmap_v5.0.md` Phase V5-3, `tests_manuels.md`
- [P2] Communiquer à Marie les points de `a_communiquer_v5.md` **au moment de la livraison de la V5.0 complète** (pas avant), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `Archives/roadmap_v4.1.md` § Q à trancher
- [P2] Recueillir le retour utilisateur sur le rendu visuel réel du Budget et sur sa nouvelle porte d'entrée (carte outil au lieu du bouton dédié) — Marie ne l'a toujours pas vu. — fait quand : retour utilisateur recueilli — réf : `roadmap_v5.0.md` Phase V5-3, `E71Budget.tsx`
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold toujours visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`

## Dernière session (2026-08-06, suite 3 — bugs de validation manuelle Phase V5-3 trouvés et corrigés)

## Décisions prises
- Blocage bloquant à l'ouverture (« Chargement... » indéfini) diagnostiqué via message d'erreur exact fourni par l'utilisateur : `crypto.randomUUID()` indisponible hors contexte sécurisé (accès HTTP par IP réseau), appelé directement dans la migration Dexie v10 au lieu du repli déjà présent dans `newId()`.
- `try/catch/finally` ajouté autour de `init()` (`AppContext.tsx`) à la demande de l'utilisateur, pour qu'une erreur future ne bloque plus silencieusement l'écran de chargement.
- Carte « Outils » redondante retirée de l'accueil, bouton « + » de création déplacé de l'écran Outils vers l'accueil, zone Outils passée en grille 3 colonnes — 3 défauts remontés lors du test manuel réel du point 1-2 de `tests_manuels.md`.
- Clarification actée avec l'utilisateur après relecture de `constats_2026-07-28.md` : le widget « Comptes » de l'accueil reste inchangé (rattaché au budget, E33/E34), distinct de l'outil « Comptage » (E31, reporté V5.1) — non renommé malgré la demande initiale, l'hypothèse de l'utilisateur étant infirmée par la transcription.
- `E71Budget.tsx` : bouton « Retour » forçait `goTo('tools')` au lieu de dépiler la pile réelle — corrigé en `back('dashboard')`.

## Livrables produits ou modifiés
- `src/data/db.ts` : repli local `migrationId()` remplaçant `crypto.randomUUID()` direct dans la migration v10.
- `src/app/AppContext.tsx` : `try/catch/finally` autour de `init()`.
- `src/ui/screens/dashboard/E10Dashboard.tsx`/`.test.tsx` : grille 3 colonnes, retrait carte « Outils », libellé de liste réel (`toolLabel`), bouton « + » de création.
- `src/ui/screens/tools/E70Tools.tsx`/`.test.tsx` : retrait du bouton « + » (déplacé sur l'accueil).
- `src/ui/screens/tools/E71Budget.tsx`/`.test.tsx` : `back('dashboard')` au lieu de `goTo('tools')`, test dédié ajouté.
- `roadmap_v5.0.md`, `_contexte/contexte.md`, `README.md`, `CHANGELOG.md` mis à jour.

## Hypothèses validées / invalidées
- VALIDE : cause du blocage au chargement confirmée par le message d'erreur exact (`DexieError` / `TypeError crypto.randomUUID is not a function`) fourni par l'utilisateur, pas une hypothèse non vérifiée.
- INVALIDE : l'hypothèse de l'utilisateur selon laquelle « Comptes » n'aurait rien à voir avec le budget — infirmée par relecture de `constats_2026-07-28.md` (E33/E34 lient explicitement « comptes » au domaine budget/livrets).
- EN ATTENTE : revalidation manuelle des points 1-2 de `tests_manuels.md` sur les écrans corrigés ; points 3-6 jamais testés à ce jour.

## Prochaine étape exacte
Reprendre la validation manuelle des 6 points de `tests_manuels.md` (Phase V5-3) sur les écrans corrigés cette session, puis clore la gate de phase (roadmap `roadmap_v5.0.md`, Phase V5-3 `[FAIT]`).

## Question bloquante pour la session suivante
Aucune.
