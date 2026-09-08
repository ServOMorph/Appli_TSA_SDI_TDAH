# Décisions structurantes — Dispositif d'accueil des testeurs

Zone : ONBOARD · Phase 1 de `roadmap_accueil_testeurs.md` · Décisions rendues le 2026-09-04.

## 1. Identification d'un testeur

**Décision : code testeur saisi dans Paramètres, remonté dans le snapshot.**

Options considérées :
- Code testeur dans Paramètres (retenue) — petite évolution produit, survit à la perte du
  `localStorage` (le testeur ressaisit son code sur un nouvel appareil).
- Registre manuel `device_id` → personne — aucune évolution produit, mais fragile à la perte du
  `localStorage` et dépendant de la discipline de chacun.
- Un déploiement par testeur — écartée, coût d'exploitation disproportionné.

Conséquence pour le produit (hors périmètre ONBOARD, à remonter en demande d'évolution) : ajout
d'un champ « code testeur » dans Paramètres, propagé dans le payload de synchronisation.

## 2. Consentement et données personnelles

**Décision : écran de consentement explicite au premier lancement.**

Le testeur voit, avant toute synchronisation, un texte présentant la nature des données
collectées (tâches, budget, énergie), leur usage, leur durée de conservation et le droit à
l'effacement. Il doit accepter avant que la synchronisation ne s'active.

Conséquence pour le produit (hors périmètre) : un flag local conditionnant l'activation de la
synchronisation, posé après acceptation de l'écran.

## 3. Profil et volume des testeurs

**Décision : petit groupe (2 à 5 testeurs), profil AuDHD proche de celui de Marie.**

Le dispositif reste dimensionné pour un suivi individuel : pas de tableau de bord de suivi
automatisé ni de relance de masse. Si le volume augmente significativement, ce point est à
rouvrir avant la phase 3 (plan de test).

## 4. Position de Marie

**Décision : Marie reste référente/validatrice ; les nouveaux testeurs sont contributeurs.**

Marie conserve son rôle actuel (valider les parcours, trancher les demandes produit) et devient
en plus lectrice des retours des nouveaux testeurs, avec un espace de commentaire privé
invisible d'eux. Les nouveaux testeurs remontent des retours mais ne valident rien pour le
produit — leurs retours nourrissent l'avis de Marie plutôt que de le concurrencer.

## 5. Canal de retour

**Décision : Discord, via la gateway existante — canal testeurs distinct du canal de supervision
de Marie.**

- Les testeurs remontent leurs retours dans un canal Discord dédié (commun ou par testeur, à
  affiner en phase 2), via la gateway déjà en place pour Marie.
- Un canal Discord séparé, visible uniquement de Marie et de l'équipe, porte l'avis de Marie sur
  ces retours. Les testeurs n'y ont pas accès.
- Contrainte actée : visibilité strictement asymétrique — Marie voit les retours des testeurs et
  peut les commenter en privé ; aucun testeur ne voit l'avis de Marie.

Conséquence pour le produit / l'infrastructure Discord (hors périmètre ONBOARD, à remonter) :
création d'un ou plusieurs canaux/agents supplémentaires dans le registre de la gateway
(`DISCORD/discord_com/gateway/agents.json`), et règles de routage associées.

---

## Synthèse des demandes d'évolution induites (à détailler en phase 4)

Ces décisions confirment et précisent les demandes déjà pressenties au constat d'entrée de la
roadmap (R1, R2) et en ajoutent deux :

- Champ « code testeur » dans Paramètres + propagation dans le snapshot (décision 1).
- Écran de consentement conditionnant l'activation de la synchronisation (décision 2).
- Dépouillement multi-appareils, un snapshot par testeur au lieu du seul appareil le plus actif
  (R1, confirmé par la décision 3 — même un petit groupe de 2 à 5 testeurs perd des retours avec
  la logique actuelle).
- Canaux Discord et routage gateway pour les testeurs et pour la supervision privée de Marie
  (décision 5).

Gate de la phase 1 : les cinq décisions sont rendues. La phase 2 (parcours d'accueil et critères
d'acceptation) peut s'appuyer dessus sans hypothèse de travail restante.
