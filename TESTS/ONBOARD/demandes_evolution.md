# Demandes d'évolution — Dispositif d'accueil multi-testeurs

Zone : ONBOARD · Phase 4 de `roadmap_accueil_testeurs.md` (partie rédactionnelle) · Rédigé le
2026-09-05 · Révisé le 2026-09-06 (chiffrage S/M/L, scission de l'ancienne D5, tableau réordonné
par séquence d'exécution) · Destinataire : TESTS (coordinateur), pour transmission à la zone
détenant le code concerné.

Chaque demande est rédigée pour être exécutable sans reformulation. Elle relève de `src/`,
`supabase/` ou `scripts/`, hors du périmètre d'écriture de la zone ONBOARD.

**Effort** : donné en ordre de grandeur — S (changement localisé), M (plusieurs points de
contact), L (chantier transverse ou à risque de régression) — jamais en jours-homme. Ces
estimations sont posées par une zone documentaire : toute valeur incertaine est marquée
« estimation non validée par la zone code » et doit être re-chiffrée par la zone qui détient le
code avant planification.

---

## D1 — Identification du testeur (résout R2)

**Problème** : l'identité d'un appareil est un UUID opaque sans nom
(`src/data/sync/deviceIdentity.ts`). Un retour arrive sans auteur exploitable : ni relance, ni
contexte d'appareil.

**Solution retenue (décision 1, `decisions_dispositif.md`)** : ajouter un champ « code testeur »
dans Paramètres, saisi une fois par le testeur, propagé dans le payload de synchronisation aux
côtés de l'UUID existant (l'UUID n'est pas supprimé, le code testeur devient l'identifiant humain
de référence).

**Fichiers concernés** : `src/data/sync/deviceIdentity.ts`, écran Paramètres (entité Profil), le
payload de synchronisation.

**Critère d'acceptation vérifiable** : un snapshot Supabase porte le code testeur saisi, lisible
sans recoupement avec l'UUID. Ressaisir le code sur un nouvel appareil restaure le rattachement à
la même identité testeur.

**Effort : M.** Plusieurs points de contact — champ dans l'écran Paramètres, entité Profil,
payload de synchronisation — pour une logique simple. Estimation non validée par la zone code.

**Écart analyse 2026-09-08 (zone code, `main`)** : re-chiffré **S**. Aucune migration Dexie — le
store `settings: 'id, user_id'` (`src/data/db.ts:397`, version 19) n'indexe pas un champ optionnel
ajouté à `Settings`, au même titre que `ambiance_color?` ou `energy_max?` ; `buildSnapshot.ts`
sérialise déjà `settings`, donc aucune modification du payload ni de la signature RPC. Points de
contact réels réduits à l'entité `Settings` et à la saisie dans l'écran Paramètres.

**Priorité : P0.** Prérequis de D3, D4 et D7. Exécuté au rang 2, après D2.

---

## D2 — Consentement et activation conditionnelle de la synchronisation

**Problème** : les données synchronisées sont personnelles (tâches, budget, énergie). L'accord
tacite en place avec Marie est insuffisant pour un testeur externe qui n'a pas cette relation de
confiance préalable.

**Solution retenue (décision 2)** : écran de consentement affiché au premier lancement, texte
présentant la nature des données collectées, leur usage, leur durée de conservation et le droit à
l'effacement. Un flag local, posé uniquement après acceptation, conditionne l'activation de la
synchronisation.

**Fichiers concernés** : premier lancement de l'application (flux d'onboarding existant), module
de synchronisation (point d'activation conditionné au flag).

**Critère d'acceptation vérifiable** : sur un appareil neuf, aucune requête de synchronisation
n'est émise avant validation de l'écran de consentement. Après validation, la synchronisation
s'active sans action supplémentaire du testeur.

**Effort : M.** Nouvel écran dans le flux d'onboarding existant, point d'activation de la
synchronisation conditionné à un flag local, plus un texte de consentement à rédiger et faire
relire. Estimation non validée par la zone code.

**Écart analyse 2026-09-08 (zone code, `main`)** : risque de régression sur la synchronisation
existante (décision d'intégration DI5). Conditionner `syncNow()` (`src/data/sync/syncClient.ts`) à
un flag de consentement couperait la synchronisation de l'appareil de Marie au prochain
déploiement. Mitigation retenue : poser le flag d'office sur tout appareil portant déjà
`sync_last_success_at` en `localStorage` (aucun écran imposé, aucune interruption), et corriger en
parallèle `src/ui/screens/settings/E116Privacy.tsx` — la mention « Aucune donnée n'est envoyée à un
serveur externe » est factuellement fausse depuis la synchronisation Supabase.

**Priorité : P0 — bloquant supérieur, rang 1.** Prérequis légal/éthique à toute invitation d'un
testeur externe : aucune donnée personnelle (tâches, budget, énergie) ne doit remonter sans
consentement recueilli. Prime sur D1 — même un pilote unique, sans code testeur, ne peut être
invité tant que cet écran n'est pas en place.

---

## D3 — Dépouillement multi-appareils (résout R1)

**Problème** : `select_target = max(rows, key=len(manual_test_results))` dans
`scripts/backup_marie_snapshot.py` ne retient qu'un seul appareil — celui au plus grand nombre de
résultats. Avec plusieurs testeurs, les snapshots des autres ne sont jamais archivés ni lus :
perte silencieuse, pas une gêne de confort.

**Solution retenue** : remplacer la sélection d'un appareil unique par une itération sur un
snapshot par testeur actif (identifié via D1), chacun archivé et lu individuellement.

**Fichiers concernés** : `scripts/backup_marie_snapshot.py`.

**Critère d'acceptation vérifiable** : avec 2 testeurs actifs simulés, les résultats des deux
apparaissent dans l'archive après exécution du script, sans procédure manuelle. Coût de la
procédure de repli actuelle chiffré (hypothèse non mesurée) dans `plan_de_test.md` § 3.

**Effort : S à M.** Modification localisée à un script Python, mais la logique d'archivage et de
lecture par testeur peut ramifier (nommage des archives, idempotence d'un cycle rejoué).
Estimation non validée par la zone code.

**Écart analyse 2026-09-08 (zone code, `main`)** : re-chiffré **S**. `scripts/backup_marie_snapshot.py`
accepte déjà `--device-id` et sa rétention `plan_retention()` regroupe déjà par appareil
(`by_device`) ; le manque se réduit à remplacer `select_target()` (sélection d'une ligne unique)
par une itération sur les appareils actifs du cycle. Idempotence par contenu (`find_duplicate`)
déjà en place.

**Priorité : P0.** Sans elle, les retours de tout testeur secondaire au plus actif sont perdus.
Exécuté au rang 4, après D1.

---

## D4 — Identité sur les résultats de test (résout R3)

**Problème** : un résultat de test (`src/domain/entities/manualTestResult.ts`) ne porte aucune
identité. Impossible de calculer une couverture par testeur ou d'appliquer la règle de
réconciliation de `plan_de_test.md` § 4 sans recoupement manuel supplémentaire.

**Solution retenue** : propager l'identifiant testeur (D1) sur chaque `manualTestResult` au
moment de son enregistrement.

**Fichiers concernés** : `src/domain/entities/manualTestResult.ts`, point d'enregistrement du
résultat dans l'écran « Tests à faire ».

**Critère d'acceptation vérifiable** : deux testeurs distincts enregistrant un résultat sur le
même parcours produisent deux entrées distinctes, chacune identifiable par testeur, sans
ambiguïté au dépouillement.

**Effort : S.** Ajout d'un champ sur une entité et propagation à un point d'enregistrement, une
fois D1 livrée. Estimation non validée par la zone code.

**Priorité : P0.** Prérequis direct du plan de test (Phase 3, § 1, § 4, § 5). Exécuté au rang 3,
juste après D1.

---

## D5 — Canaux Discord et routage gateway pour les testeurs

**Problème** : le canal Discord est câblé sur une seule personne (tag Marie dans la gateway).
Avec plusieurs testeurs, un canal partagé sans cloisonnement romprait la contrainte de visibilité
asymétrique actée en décision 5 (Marie voit et commente en privé, aucun testeur ne voit son
avis).

**Solution retenue (décision 5)** : créer un ou plusieurs canaux/agents supplémentaires dans le
registre de la gateway (`DISCORD/discord_com/gateway/agents.json`) — canal testeurs distinct du
canal de supervision privé de Marie — et les règles de routage associées.

**Fichiers concernés** : `DISCORD/discord_com/gateway/agents.json`, règles de routage de la
gateway.

**Critère d'acceptation vérifiable** : un message posté sur le canal testeurs n'est jamais visible
depuis le canal de supervision de Marie, et réciproquement ; un commentaire de Marie sur un
retour testeur reste invisible du testeur concerné.

**Effort : M.** Configuration du registre gateway plus règles de routage ; la garantie de
visibilité asymétrique demande un test dédié. Estimation non validée par la zone code.

**Écart analyse 2026-09-08 (zone code, `main`)** : re-chiffré **L**. Le chantier dépasse le
registre `agents.json` : `curate()` de la gateway insère aujourd'hui le tag de Marie sur tout
message `to=marie` — il faut un destinataire « testeur » qui ne déclenche pas cette règle — et
`DISCORD/discord_com/bot.py` route l'entrant avec `has_pending_reply(author_id)`, qui suppose un
auteur connu. Chantier transverse touchant la zone `discord` : coordination via son gardien de
sortie, jamais de contournement.

**Priorité : P1.** Nécessaire avant toute invitation réelle pour respecter la contrainte de
visibilité asymétrique, mais un contournement manuel encadré (canal unique, accès restreint
temporaire) peut couvrir un tout premier pilote isolé si nécessaire. Exécuté au rang 5.

*(La généralisation du nommage mono-personne, initialement incluse ici, est isolée dans D7 :
chantier de nature, d'effort et de risque distincts.)*

---

## D6 — Perte du `localStorage` (limite connue, non résolue)

**Problème** : un vidage du navigateur ou un changement d'appareil génère un nouvel UUID ;
l'historique associé à l'ancien UUID devient orphelin.

**Atténuation déjà apportée par D1** : le testeur ressaisit son code testeur sur le nouvel
appareil, ce qui restaure le rattachement pour les *nouveaux* résultats. L'historique déjà
enregistré sous l'ancien UUID, lui, reste orphelin — D1 n'y remédie pas rétroactivement.

**Solution non retenue à ce stade** : lier le code testeur à un compte plutôt qu'au seul
`localStorage` relèverait de l'authentification (zone `sync-marie`, hors périmètre de cette
demande).

**Critère d'acceptation vérifiable** : sans objet — documentée comme limite connue, pas comme
correctif à livrer dans ce lot.

**Effort : sans objet.** Aucun développement dans ce lot ; documentation seule. Un correctif
futur (lier le code testeur à un compte) relèverait de l'authentification, hors périmètre.

**Priorité : P2.** À rouvrir si la fréquence de perte de `localStorage` observée en usage réel le
justifie.

---

## D7 — Généralisation du nommage mono-personne

**Problème** : plusieurs fichiers et dossiers du dispositif sont nommés pour une seule testeuse
(`donnees_marie/`, `scripts/backup_marie_snapshot.py`, `marie_tests_journal.json`, et les
références en dur qui les pointent). Ce nommage n'empêche pas techniquement d'ajouter des
testeurs, mais rend l'exploitation multi-testeurs illisible et fragile (chemins spécifiques,
journal unique).

**Solution retenue** : généraliser le nommage pour qu'aucune référence fonctionnelle ne dépende
d'une identité de testeur particulière — dossier et scripts de dépouillement paramétrés par
identifiant testeur (issu de D1), journal par testeur ou journal unique indexé par testeur.

**Fichiers concernés** : `donnees_marie/`, `scripts/backup_marie_snapshot.py`,
`marie_tests_journal.json`, et toute référence en dur à ces chemins dans `scripts/` et la
configuration.

**Critère d'acceptation vérifiable** : le dépouillement et les scripts fonctionnent pour un
testeur au nom arbitraire, sans chemin spécifique à Marie ; l'historique déjà enregistré pour
Marie reste lisible après renommage (aucune perte de données existantes).

**Effort : L.** Chantier transverse touchant des chemins en dur et un format de journal ; risque
de régression sur l'historique existant et sur les scripts de sauvegarde en place. Estimation non
validée par la zone code.

**Priorité : P2.** Aucun blocage fonctionnel pour un premier groupe pilote restreint (le
contournement de D5 et l'identification par D1 suffisent) ; à planifier avant une montée en
charge du groupe. Exécuté au rang 6.

---

## Synthèse — séquence d'exécution

Le tableau est ordonné par **rang d'exécution réel**, pas seulement par graphe de dépendances :
la priorité P0 seule n'ordonnait pas D1-D4. D2 est isolée en tête comme bloquant supérieur
(préalable éthique/légal). D4 passe avant D3 : il est prérequis direct du plan de test (Phase 3
§ 1, § 4, § 5) et plus petit, alors que D3 ne devient critique qu'avec plusieurs testeurs
produisant en parallèle.

| Rang | # | Demande | Priorité | Dépend de | Effort |
|---|---|---|---|---|---|
| 1 | D2 | Écran de consentement | P0 — bloquant supérieur | — | M |
| 2 | D1 | Code testeur (Paramètres + payload) | P0 | — | S \* |
| 3 | D4 | Identité sur les résultats de test | P0 | D1 | S |
| 4 | D3 | Dépouillement multi-appareils | P0 | D1 | S \* |
| 5 | D5 | Canaux Discord et routage gateway | P1 | décision 5 | L \* |
| 6 | D7 | Généralisation du nommage mono-personne | P2 | D1 | L |
| — | D6 | Perte du `localStorage` (limite documentée) | P2 | D1 | sans objet |

\* Effort re-chiffré à l'analyse de la zone code du 2026-09-08 (détail dans la note « Écart analyse
2026-09-08 » de chaque demande). Valeurs ONBOARD d'origine : D1 M, D3 S–M, D5 M.

**Gate de sortie de la partie rédactionnelle de la Phase 4** : les demandes reprennent R1 à R3 et
les points secondaires retenus, chacune avec problème, solution retenue en Phase 1, fichiers
concernés, critère d'acceptation vérifiable, effort en ordre de grandeur et priorité. Gate
documentaire satisfait le 2026-09-06. La répétition à blanc avec un testeur pilote réel est
requalifiée en validation portée par TESTS (cf. `roadmap_accueil_testeurs.md`, « Gates humains
délégués à TESTS »), non en gate bloquant de cette zone.
