# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-02)

## Questions ouvertes
- [P1] Démarrer la Phase V5-2 (planning et tâches refondus) de `roadmap_v5.0.md`. — fait quand : phase codée, testée, validée manuellement, passée à `[FAIT]` — réf : `roadmap_v5.0.md` Phase V5-2
- [P2] Corriger `exportData()` (`useSettingsState.ts:66`) qui lit `db.energyEntries.toArray()` brut au lieu de passer par `EnergyEntryRepository` — `energy_entries[].value` sort non déchiffré si `local_encryption` est activé. — fait quand : `exportData` passe par le repository, export vérifié avec chiffrement activé — réf : `roadmap_v5.0.md` § Bugs constatés
- [P2] Communiquer à Marie les points de `a_communiquer_v5.md` **au moment de la livraison de la V5.0 complète** (pas avant), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `Archives/roadmap_v4.1.md` § Q à trancher
- [P2] Recueillir le retour utilisateur sur le rendu visuel réel du Budget (refonte de lisibilité, session 2026-07-25) — le Budget est rebranché tel quel comme outil en Phase V5-3, Marie ne l'a toujours pas vu. — fait quand : retour utilisateur recueilli — réf : `roadmap_v5.0.md` Phase V5-3, `E71Budget.tsx`
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts:21`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts:21`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`

## Dernière session (2026-08-02 — Phase V5-1 close, 3 bugs trouvés et corrigés en validation manuelle)

## Décisions prises
- Points 101-109 de `tests_manuels.md` tous validés sur appareil tactile après correctifs ; Phase V5-1 close.
- Cause racine unique de deux anomalies (103, 104) identifiée : `index.html` déclarait `lang="en"` alors que l'UI est en français, ce qui déclenchait la traduction automatique de Chrome — celle-ci corrompt les nœuds texte du DOM (« Replier » affiché « Répondeur », « Mode surcharge » affiché « Surcharge de mode », « planifié / dispo » affiché « plan / dispo ») et casse la réconciliation React, d'où une pastille d'énergie figée jusqu'au remontage du composant (changement d'écran).
- Diagnostic initial de 103/104 par lecture de code seule (sans reproduction) s'est révélé insuffisant et partiellement erroné (hypothèse d'un bug `usePlanningState.ts` écartée) — confirmé après reproduction en Chromium desktop (pas de bug) puis sur indication de l'utilisateur (Chrome desktop, capture d'écran) que la cause était la traduction automatique.

## Livrables produits ou modifiés
- `src/ui/screens/tasks/E20Inbox.tsx` : titre `<h1>` « Todo » → « Réception » (résidu du renommage nav Todo→Outils de la Phase V4.1-0, jamais corrigé sur cet écran).
- `index.html` : `lang="en"` → `lang="fr"`.
- `e2e/02-tasks.spec.ts` : assertion de titre `heading` mise à jour (« Todo » → « Réception »).
- `tests_manuels.md` : purgé intégralement (101-109 validés).
- `roadmap_v5.0.md` : Phase V5-1 → `[FAIT]`.

## Hypothèses validées / invalidées
- VALIDE : `E20Inbox.tsx` conservait le titre `Todo` d'avant le renommage V4.1-0.
- INVALIDE : hypothèse initiale d'un bug de rafraîchissement du contexte (`usePlanningState.ts`) pour le point 104 → pivot : conflit React / traduction automatique Chrome causé par `lang="en"`.
- VALIDE (après correctif `lang="fr"`) : 514/515 tests unitaires (flaky pré-existant `AppContext.test.tsx`, sans lien), 53/53 e2e, build/lint clean.
- Rappel opérationnel retenu : le service worker PWA met `index.html` en cache — un rechargement forcé est nécessaire pour qu'un changement de ce fichier soit visible en test manuel.

## Prochaine étape exacte
Démarrer la Phase V5-2 (`roadmap_v5.0.md`) : planning et tâches refondus.

## Question bloquante pour la session suivante
Aucune.
