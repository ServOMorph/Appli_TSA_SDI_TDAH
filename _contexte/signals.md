# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-07)

## Questions ouvertes
- [P1] Revalider le point 5 de `tests_manuels.md` (widget Comptes) après le correctif de cette session (message ajouté quand aucune catégorie de dépense n'existe), puis clore la gate de phase V5-3. — fait quand : point 5 validé et phase passée à `[FAIT]` — réf : `roadmap_v5.0.md` Phase V5-3, `tests_manuels.md`, `E10Dashboard.tsx`
- [P2] Communiquer à Marie les points de `a_communiquer_v5.md` **au moment de la livraison de la V5.0 complète** (pas avant), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `Archives/roadmap_v4.1.md` § Q à trancher
- [P2] Recueillir le retour utilisateur sur le rendu visuel réel du Budget et sur sa nouvelle porte d'entrée (carte outil au lieu du bouton dédié) — Marie ne l'a toujours pas vu. — fait quand : retour utilisateur recueilli — réf : `roadmap_v5.0.md` Phase V5-3, `E71Budget.tsx`
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold toujours visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`

## Dernière session (2026-08-07, suite validation manuelle V5-3)

## Décisions prises
- Bug remonté par l'utilisateur : widget « Comptes » de l'accueil ne réagissait pas au clic. Cause identifiée par lecture de code : le bouton était `disabled` tant qu'aucune catégorie budgétaire de type « dépense » n'existait, sans aucun retour visuel expliquant pourquoi. Confirmé par l'utilisateur (une fois une catégorie créée dans le Budget, le clic fonctionnait).
- Correctif décidé avec l'utilisateur : au lieu de désactiver silencieusement le bouton, il reste actif ; un clic sans catégorie de dépense ouvre désormais un message dédié invitant à créer une catégorie de type « dépense » dans le Budget.

## Livrables produits ou modifiés
- `src/ui/screens/dashboard/E10Dashboard.tsx` : bouton « Comptes » non désactivé, ajout de l'état `showNoExpenseCategory` et d'un dialogue d'information affiché quand `budgetCategories` ne contient aucune catégorie de type « dépense ».
- `src/ui/screens/dashboard/E10Dashboard.test.tsx` : test dédié ajouté (message affiché sans catégorie de dépense, dialogue de saisie non ouvert dans ce cas).

## Hypothèses validées / invalidées
- VALIDE : cause du blocage confirmée à la fois par lecture de code (`disabled={!budgetCategories.some(...)}`) et par l'utilisateur (fonctionnement rétabli après création d'une catégorie de dépense).

## Prochaine étape exacte
Revalider manuellement le point 5 de `tests_manuels.md` (message affiché sans catégorie de dépense, saisie toujours fonctionnelle en un tap avec catégorie), puis clore la gate de sortie de la Phase V5-3 (roadmap `roadmap_v5.0.md`).

## Question bloquante pour la session suivante
Aucune.
