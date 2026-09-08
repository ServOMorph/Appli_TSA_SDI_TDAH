# Roadmap — Accueil et accès des testeurs additionnels

Zone : ONBOARD · Branche : `agent/onboard` · Coordinateur : TESTS

Objectif : définir le parcours, les critères d'acceptation et le plan de test permettant
d'accueillir d'autres testeurs que Marie, sans modifier l'application.

## Constat d'entrée (analyse du 2026-09-04)

Le dispositif de test actuel est câblé pour une seule testeuse. Trois points de rupture,
constatés dans le code, empêchent l'accueil d'un second testeur :

| # | Point de rupture | Source constatée | Effet avec N testeurs |
|---|---|---|---|
| R1 | Le dépouillement ne retient qu'un appareil : `select_target` = `max(rows, key=len(manual_test_results))` | `scripts/backup_marie_snapshot.py` | Les snapshots des autres testeurs ne sont jamais archivés ni lus. Perte silencieuse. |
| R2 | L'identité d'un appareil est un UUID opaque sans nom | `src/data/sync/deviceIdentity.ts` | Un retour arrive sans auteur : ni relance, ni contexte d'appareil. |
| R3 | Un résultat de test ne porte aucune identité | `src/domain/entities/manualTestResult.ts` | Impossible de calculer une couverture par testeur. |

Points secondaires, à traiter mais non bloquants :

- Perte du `localStorage` (vidage navigateur, changement d'appareil) = nouvel UUID = historique orphelin.
- Canal Discord câblé sur le tag de Marie ; nommage mono-personne (`donnees_marie/`,
  `backup_marie_snapshot.py`, `marie_tests_journal.json`).
- Les données synchronisées sont personnelles (tâches, budget, énergie). Accord tacite avec
  Marie, insuffisant pour un testeur externe.

R1 à R3 relèvent de `src/`, `supabase/` et `scripts/`, tous hors du périmètre d'écriture de
cette zone. Ils sortent d'ici en **demandes d'évolution chiffrées** remises à TESTS, jamais en
code écrit par cet agent.

---

## Phase 1 — Décisions structurantes [FAIT]

Aucun parcours d'accueil ne peut être figé avant que ces arbitrages soient rendus. Livrable :
`decisions_dispositif.md`, chaque décision présentée avec ses options, leur coût et une
recommandation argumentée.

Décisions à trancher :

1. **Identification d'un testeur** — comment relier un snapshot à une personne.
   - Option A : code testeur saisi dans Paramètres, remonté dans le snapshot. Petite évolution
     produit ; survit à la perte du `localStorage` (le testeur ressaisit son code). *Recommandée.*
   - Option B : registre manuel `device_id` → personne, l'UUID étant affiché dans l'app.
     Évolution plus petite, mais fragile à la perte du `localStorage` et dépendante de la
     discipline de chacun.
   - Option C : un déploiement par testeur. Écartée : coût d'exploitation disproportionné.
2. **Consentement et données personnelles** — texte présenté avant le premier usage, nature de
   ce qui est collecté, procédure d'effacement à la demande.
3. **Profil et volume des testeurs** — combien, recrutés où, avec ou sans profil AuDHD, sur quel
   type d'appareil.
4. **Canal de retour** — Discord partagé, canal par testeur, ou retour in-app uniquement.
5. **Position de Marie** — testeuse de référence conservée à part, ou fondue dans le groupe.

Gate de sortie : les cinq décisions sont tranchées par écrit par le coordinateur. Une décision
non rendue bloque la phase 2 ; elle n'est pas contournée par une hypothèse de travail.

**Décisions actées le 2026-09-04** (détail et justification dans `decisions_dispositif.md`) :

1. Identification : code testeur saisi dans Paramètres, remonté dans le snapshot.
2. Consentement : écran de consentement explicite au premier lancement, avant toute synchronisation.
3. Profil/volume : petit groupe (2 à 5 testeurs), profil AuDHD proche de Marie.
4. Position de Marie : référente/validatrice ; les nouveaux testeurs sont contributeurs.
5. Canal de retour : Discord via la gateway existante — canal testeurs distinct du canal de
   supervision de Marie (visibilité strictement asymétrique : Marie voit et commente en privé,
   aucun testeur ne voit son avis).

Gate satisfait.

---

## Phase 2 — Parcours d'accueil et critères d'acceptation [FAIT]

Livrables : `parcours_accueil.md` et `criteres_acceptation.md`.

Le parcours couvre la chaîne complète, de l'invitation au premier retour exploitable :
recrutement et cadrage de l'engagement · message d'invitation · installation de la PWA sur
téléphone · consentement · saisie de l'identifiant testeur (selon décision 1) · premier
parcours guidé · émission du premier retour · accusé de réception.

Chaque étape est décrite avec : ce que fait le testeur, ce qu'il voit, ce qui est attendu de
l'équipe, et le délai visé.

Critères d'acceptation, formulés pour être vérifiables :

- Un testeur va de l'invitation au premier retour sans aide humaine hors des documents fournis.
- Son premier retour est rattaché à son identité sans intervention manuelle.
- Le temps entre l'invitation et le premier retour tient dans la cible fixée en phase 2.
- Aucune donnée personnelle ne remonte avant le consentement.
- Un abandon en cours de parcours est détecté par l'équipe, et non découvert par hasard.

Gate de sortie documentaire (périmètre ONBOARD) : les deux livrables sont produits, chaque étape
du parcours est décrite avec ce que fait le testeur, ce qu'il voit, ce qui est attendu de
l'équipe et le délai visé, et les prérequis techniques implicites sont listés explicitement
(section « Prérequis techniques à confirmer par TESTS » de `parcours_accueil.md`).

Relecture à blanc par une personne extérieure au projet : requalifiée en action de validation
portée par TESTS avant la première invitation réelle (cf. « Gates humains délégués à TESTS »
ci-dessous), et non en gate bloquant de phase — un agent sandbox ne peut ni la réaliser ni la
commander.

**Réalisé le 2026-09-05, requalifié le 2026-09-06** : livrables produits (`parcours_accueil.md`,
`criteres_acceptation.md`). Gate documentaire satisfait. Écart signalé dans
`criteres_acceptation.md` § 3 : la cible de délai que ce critère attribuait à la Phase 1 n'y
avait pas été chiffrée ; elle est fixée en Phase 2.

---

## Phase 3 — Plan de test et dépouillement multi-testeurs [FAIT]

Livrable : `plan_de_test.md`.

Contenu : répartition des parcours du catalogue entre testeurs (couverture visée, redondance
volontaire sur les parcours sensibles) · rythme attendu · procédure de dépouillement de N
snapshots · règle de réconciliation quand deux testeurs divergent sur le même parcours ·
critère de promotion d'un retour en demande produit · traitement d'un testeur inactif.

Ce plan tient compte de R1 : tant que le dépouillement ne lit qu'un appareil, il décrit la
procédure de repli manuelle et en chiffre le coût par cycle, ce qui justifie la demande
d'évolution.

Gate de sortie : le plan couvre l'intégralité des catégories du catalogue existant, et chaque
retour y est traçable depuis son émission jusqu'à sa décision produit. Gate entièrement
documentaire, dans le périmètre de l'agent — aucune validation humaine externe requise.

**Réalisé le 2026-09-05** : livrable produit (`plan_de_test.md`). Gate satisfait, y compris pour
la catégorie « Outils : autres », vide au 2026-09-05 mais couverte par la règle de répartition.

---

## Phase 4 — Demandes d'évolution et répétition à blanc [FAIT] (rédactionnel)

Livrables : `demandes_evolution.md` et `_contexte/statut.md` à destination de TESTS.

Les demandes reprennent R1 à R3 et les points secondaires retenus, chacune avec son problème,
la solution retenue en phase 1, le critère d'acceptation vérifiable et l'ordre de priorité.
Elles sont rédigées pour être exécutables par la zone qui détient le code, sans reformulation.

La répétition à blanc fait parcourir le dispositif complet à un testeur pilote, sur son propre
téléphone, en n'utilisant que les documents produits. Tout blocage, toute question posée hors
protocole et tout écart de délai sont relevés et corrigés avant remise.

Gate de sortie documentaire (périmètre ONBOARD) : les demandes d'évolution sont rédigées,
priorisées, chiffrées en ordre de grandeur (S/M/L) et remises au coordinateur.

Répétition à blanc avec un testeur pilote réel : requalifiée en action de validation portée par
TESTS (cf. « Gates humains délégués à TESTS » ci-dessous), et non en gate bloquant de phase —
même raisonnement que pour la relecture à blanc de la Phase 2.

**Réalisé le 2026-09-05, requalifié le 2026-09-06** : partie rédactionnelle close, livrable
produit (`demandes_evolution.md`). Au 2026-09-06 : 7 demandes (D1-D7 après scission de l'ancienne
D5), chiffrées S/M/L, tableau de synthèse réordonné par séquence d'exécution. Gate documentaire
satisfait.

---

## Gates humains délégués à TESTS [EN ATTENTE]

Ces deux validations conditionnent la mise en service (première invitation réelle) mais sortent
du périmètre d'un agent sandbox : ONBOARD ne peut ni les exécuter ni les commander. Elles ne
bloquent pas la clôture documentaire des phases ci-dessus ; elles sont suivies ici jusqu'à
réalisation par TESTS.

1. **Relecture à blanc de `parcours_accueil.md`** par une personne extérieure au projet — aucune
   étape ambiguë, aucun prérequis implicite non listé. (Ex-gate Phase 2.)
2. **Répétition à blanc** avec un testeur pilote réel sur son propre téléphone, documents produits
   seuls : le pilote atteint son premier retour exploitable sans intervention hors protocole.
   (Ex-gate Phase 4.)

---

## Invariants de la zone

- Aucune écriture hors de `TESTS/ONBOARD/`. `src/`, `supabase/`, `scripts/`, `.env`,
  `donnees_marie/` et les artefacts de release restent en lecture seule.
- Aucun commit hors de `agent/onboard`. Ni fusion, ni rebase, ni déploiement.
- Remontée à TESTS par `_contexte/statut.md` uniquement, à chaque `/close`.
