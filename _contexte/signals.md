# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-07)

## Questions ouvertes
- [P1] Communiquer à Marie les points de `a_communiquer_v5.md` maintenant que la V5.0 complète est livrée (V5-0 à V5-3 close), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `Archives/roadmap_v4.1.md` § Q à trancher
- [P2] Recueillir le retour utilisateur sur le rendu visuel réel du Budget et sur sa nouvelle porte d'entrée (carte outil au lieu du bouton dédié) — Marie ne l'a toujours pas vu. — fait quand : retour utilisateur recueilli — réf : `roadmap_v5.0.md` Phase V5-3, `E71Budget.tsx`
- [P2] Décider de la suite après V5.0 : démarrer V5.1 (outils reportés, Comptage en premier) ou attendre le retour de Marie avant de prioriser. — fait quand : décision actée avec l'utilisateur — réf : `roadmap_v5.0.md` § Reporté en V5.1+
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold toujours visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`

## Dernière session (2026-08-07, clôture Phase V5-3 / roadmap V5.0)

## Décisions prises
- Point 5 de `tests_manuels.md` (widget Comptes, message affiché sans catégorie de dépense) validé par l'utilisateur avec le correctif de la session précédente. Aucun autre point en attente.
- Gate de sortie de la Phase V5-3 atteinte : phase passée à `[FAIT]`, roadmap `roadmap_v5.0.md` (V5-0 à V5-3) intégralement terminée.

## Livrables produits ou modifiés
- `tests_manuels.md` : vidé intégralement (dernier point validé).
- `roadmap_v5.0.md` : Phase V5-3 passée à `[FAIT]`, gate cochée intégralement, note de clôture ajoutée.

## Hypothèses validées / invalidées
- VALIDE : le correctif du widget Comptes (message dédié quand aucune catégorie de dépense n'existe) fonctionne comme attendu, confirmé par l'utilisateur.

## Prochaine étape exacte
La roadmap V5.0 est close. Reste à communiquer à Marie les points de `a_communiquer_v5.md` (livraison complète atteinte) et décider de la priorité de la suite (V5.1 ou retour utilisateur d'abord).

## Question bloquante pour la session suivante
Aucune.
