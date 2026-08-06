# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-06)

## Questions ouvertes
- [P1] Continuer la Phase V5-2b (planning et tâches refondus) : M5 clos, reste M6 (audit E7), M7 (gate). — fait quand : phase codée, testée, validée manuellement, passée à `[FAIT]` — réf : `roadmap_v5.0.md` Phase V5-2b
- [P2] Communiquer à Marie les points de `a_communiquer_v5.md` **au moment de la livraison de la V5.0 complète** (pas avant), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `Archives/roadmap_v4.1.md` § Q à trancher
- [P2] Recueillir le retour utilisateur sur le rendu visuel réel du Budget (refonte de lisibilité, session 2026-07-25) — le Budget est rebranché tel quel comme outil en Phase V5-3, Marie ne l'a toujours pas vu. — fait quand : retour utilisateur recueilli — réf : `roadmap_v5.0.md` Phase V5-3, `E71Budget.tsx`
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold toujours visible dans l'onglet du navigateur (confirmé à nouveau via captures utilisateur cette session). — fait quand : titre corrigé — réf : `index.html`

## Dernière session (2026-08-06 — clôture M5 de la Phase V5-2b : validation tactile du point 3.2, 2 bugs clos comme non reproductibles)

## Décisions prises
- Serveur dev lancé en mode réseau (`npm run dev -- --host`) pour permettre les tests sur téléphone.
- Point 3.2 de `tests_manuels.md` (sous-tâches dépliables, tactile réel) validé par l'utilisateur.
- Les deux bugs fonctionnels signalés le 2026-08-06 (suppression tâche récurrente sans effet, ajout de sous-tâche impossible) sont clos comme **non reproductibles** : l'utilisateur a retesté sans appliquer de correctif et confirmé que tout fonctionne — mauvaise manipulation lors du signalement initial, pas un défaut réel. Aucun code modifié pour ces deux points.
- `tests_manuels.md` vidé intégralement (tous les tests en attente validés). M5 de la Phase V5-2b clos côté validation manuelle.

## Livrables produits ou modifiés
- `tests_manuels.md` : purgé (point 3.2 et les 2 bugs retirés).
- `roadmap_v5.0.md` : gate de M5 passée à tests manuels validés ; note de clôture M5 mise à jour (bugs clos comme non reproductibles).
- `README.md` : section État actuel et Prochaine étape mises à jour en conséquence.
- Aucun changement de code applicatif cette session.

## Hypothèses validées / invalidées
- VALIDE : point 3.2 (sous-tâches dépliables au tactile) fonctionne correctement sur téléphone réel.
- INVALIDE : les deux bugs fonctionnels signalés le 2026-08-06 ne sont pas des défauts réels -> pivot vers clôture sans correctif, signalement initial attribué à une erreur de manipulation.

## Prochaine étape exacte
Enchaîner M6 (audit E7 — vérifier qu'aucune donnée n'est préremplie à l'installation, `src/ui/screens/onboarding/*`) puis M7 (gate de la Phase V5-2b).

## Question bloquante pour la session suivante
Aucune.
