# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-07)

## Questions ouvertes
- [P1] Coder la Phase V5.1-0 (refonte ergonomique de l'écran Budget) : 10 items de checklist, 3 écrans (`E71Budget` refondu, `E73CategoryDetail`, `E74BudgetSettings`), modèle de données inchangé. — fait quand : gate de la Phase V5.1-0 atteinte (tests verts, test manuel, `CHANGELOG.md`) — réf : `roadmap_v5.1.md` Phase V5.1-0
- [P1] Communiquer à Marie les points de `a_communiquer_v5.md` maintenant que la V5.0 complète est livrée (V5-0 à V5-3 close), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P2] Recueillir le retour utilisateur sur le rendu visuel réel du Budget et sur sa nouvelle porte d'entrée (carte outil au lieu du bouton dédié) — Marie ne l'a toujours pas vu. À recueillir de préférence **après** la Phase V5.1-0, l'écran actuel étant jugé assez confus pour biaiser le retour (arbitrage A5). — fait quand : retour utilisateur recueilli — réf : `roadmap_v5.1.md` § A5, `E71Budget.tsx`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `roadmap_v5.1.md` § Q à trancher
- [P2] Trancher le retrait d'argent d'un livret : impossible aujourd'hui, `BudgetDeposit` ne porte qu'un montant de dépôt. Signalé le 2026-08-07, laissé hors périmètre de la Phase V5.1-0. — fait quand : décision actée avec l'utilisateur — réf : `roadmap_v5.1.md` § Hors périmètre, `budgetDeposit.ts`
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold toujours visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`

## Contexte chaud
- La branche active reste `v5.0` alors que la roadmap ouverte est V5.1 — rebrancher sur `v5.1` au démarrage de la Phase V5.1-0.
- `budgetRules.ts` et les 4 entités budget ne sont pas modifiés par la Phase V5.1-0, hors ajout de deux fonctions de totaux de période. Aucune migration Dexie (schéma reste en v10).

## Dernière session (2026-08-07, analyse UX du Budget et ouverture de la roadmap V5.1)

## Décisions prises
- Refonte ergonomique de l'écran Budget engagée maintenant, sans attendre le retour de Marie (arbitrage A5) : l'écran actuel est jugé assez confus pour biaiser ce retour.
- 5 arbitrages validés par l'utilisateur : chiffre-vedette « Il me reste » remplaçant « Reste non budgétisé » (changement de sens assumé), onglets Semaine/Mois au lieu des deux périodes empilées, configuration sortie dans un écran dédié, trois écrans plutôt que des sections repliables, chantier lancé maintenant.
- Refonte conduite **à modèle de données constant** : ne préempte ni `E32` (colonnes configurables) ni `E34` (livrets reliés), qui exigent un changement de modèle et restent au backlog.
- Nouvelle roadmap `roadmap_v5.1.md` créée plutôt qu'une phase V5-4 greffée sur V5.0 — celle-ci étant déclarée close, y ajouter une phase l'aurait rendue incohérente.

## Livrables produits ou modifiés
- `roadmap_v5.1.md` : créé — Phase V5.1-0 `[TODO]` (8 défauts constatés, 5 arbitrages, 10 items de checklist, gate), backlog outils V5.1+ et Q non tranchées reportés depuis V5.0.
- `roadmap_v5.0.md` : ligne de clôture ajoutée pointant vers le successeur.
- `README.md` : état actuel et prochaine étape mis à jour ; mention « Phase V5-3 en cours » corrigée (contradictoire avec le paragraphe suivant qui la déclarait close).
- Aucun code applicatif modifié.

## Hypothèses validées / invalidées
- VALIDE : les 8 défauts UX listés sont établis par lecture directe de `E71Budget.tsx`, `budgetRules.ts` et `useBudgetState.ts`, pas par supposition.
- VALIDE : `createBudgetEntry` accepte déjà un paramètre `date` (`useBudgetState.ts:122`) que l'UI n'expose pas — la saisie rétroactive ne demande aucun changement de modèle.
- EN ATTENTE : incohérence du bloc Livrets (solde cumulé sur tous les dépôts vs mouvements filtrés sur la période courante) constatée en lecture de code, jamais observée en usage réel.

## Prochaine étape exacte
Passer sous Opus, rebrancher sur `v5.1`, puis coder la Phase V5.1-0 en suivant la checklist B1 à B10 de `roadmap_v5.1.md`.

## Question bloquante pour la session suivante
Aucune.
