# Roadmap — Intégration du dispositif d'accueil des testeurs (ONBOARD)

## Origine

La zone `ONBOARD` (branche `agent/onboard`, worktree dédié) a produit entre le 2026-09-04 et le
2026-09-06 un cadrage complet du dispositif d'accueil de testeurs additionnels : 5 décisions
structurantes, un parcours d'accueil en 8 étapes, 5 critères d'acceptation, un plan de
dépouillement multi-testeurs et 7 demandes d'évolution (D1-D7). Zéro ligne applicative, conforme
à son `agent_role.md` (sandbox, `src/` en lecture seule).

Ses 4 phases sont `[FAIT]` mais **rédactionnel** : rien n'est exécutable. Cette roadmap couvre le
passage du cadrage au code, sur `main`.

Source : `TESTS/ONBOARD/demandes_evolution.md` (D1-D7),
`TESTS/ONBOARD/roadmap_accueil_testeurs.md` (constat d'entrée R1-R3).

## État constaté dans le code (2026-09-08)

**Branche `agent/onboard`**
- `git rev-list --left-right --count main...agent/onboard` = **69 / 8**. La branche est très en
  retard sur `main`.
- Ses modifications de `.claude/zones.md`, `.claude/commands/start.md` et
  `.claude/commands/close.md` (renommage `EVOLUTIONS_TESTS` → `TESTS`, alias `ONBOARD`/`RETOURS`,
  casse ignorée) sont **déjà présentes sur `main`**. Une fusion de branche rejouerait ces
  changements pour rien.
- `TESTS/ONBOARD/` sur `main` ne contient que `agent_role.md` et `_contexte/`. Les 6 documents
  livrables n'existent que sur la branche.

**Synchronisation**
- `src/data/sync/syncClient.ts` : `syncNow()` n'a qu'un seul garde-fou, `isSyncEnabled()`
  (`src/data/sync/syncConfig.ts` : présence de `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`).
  Aucune notion de consentement. Throttle 1 h, échec toujours silencieux.
- L'appel part en `callRpc('sync_device_snapshot', { p_device_id, p_device_secret, p_payload,
  p_schema_version, p_app_version })`. Identité et payload sont deux canaux distincts.
- `src/data/sync/deviceIdentity.ts` : `deviceId` + `deviceSecret` générés une fois et persistés en
  `localStorage` (`sync_device_id`, `sync_device_secret`). UUID opaque, aucun nom — **R2 confirmé**.
- `syncClient.ts` pose `sync_last_success_at` en `localStorage` après chaque envoi réussi. C'est le
  marqueur exploitable pour distinguer un appareil déjà synchronisant d'un appareil neuf.

**Payload et stockage**
- `src/data/sync/buildSnapshot.ts` sérialise 19 tables Dexie, dont `settings`
  (`settingsRepo.getByUserId`) et `manual_test_results` (tableau plat, sans identité).
- `src/data/db.ts:397` : version Dexie **19**. Store `settings: 'id, user_id'` — seuls `id` et
  `user_id` sont indexés. **Ajouter un champ optionnel à `Settings` ne demande aucune migration.**
- `src/domain/entities/settings.ts` : `Settings` porte déjà des champs optionnels non indexés
  (`ambiance_color?`, `energy_max?`, `mon_compte_color?`).
- `src/domain/entities/user.ts` : `User` porte déjà `onboarding_completed: boolean` — précédent
  direct pour un flag de consentement.
- `src/domain/entities/manualTestResult.ts` : aucun champ d'identité — **R3 confirmé**.

**Écrans**
- `src/app/navigation.ts:2-3` : `welcome` → `profile`. `src/domain/data/screenCodes.ts:9-11` :
  `E01` Bienvenue, `E02` Profil initial, `E03` Énergie initiale. Le flux de premier lancement
  existe : l'écran de consentement s'y insère, il ne crée pas un flux.
- `src/ui/screens/settings/E116Privacy.tsx` (`E116`, « Vie privée ») affiche aujourd'hui :
  « Toutes vos données sont stockées uniquement sur votre appareil. **Aucune donnée n'est envoyée
  à un serveur externe.** » — **factuellement faux** depuis la synchronisation Supabase. À
  corriger dans le même lot que le consentement.

**Dépouillement**
- `scripts/backup_marie_snapshot.py` : `select_target(rows)` =
  `max(rows, key=lambda r: len(payload["manual_test_results"]))` — un seul appareil retenu.
  **R1 confirmé.**
- Mais le script accepte déjà `--device-id` (docstring : « plusieurs testeurs, etc. ») et sa
  rétention `plan_retention()` regroupe **déjà par appareil** (`by_device`). Le manque se réduit à
  remplacer la sélection d'une ligne par une itération.

**Contexte de livraison**
- v5.92 en production (2026-09-05), `CHANGELOG.md` à v5.105, `/deploy` gelé en attente des
  réponses de Marie (`_contexte/signals.md` [P1]). Aucun cycle de test testeur ne peut démarrer
  tant que ce blocage tient — sauf environnement de préproduction (DI3).

## Décisions à trancher

- **DI1 — Périmètre du premier lot.** `EN ATTENTE`. Pilote unique ou groupe de 2 à 5 d'emblée ?
  *Reco : viser le pilote unique.* La Phase 2 (consentement) suffit à inviter une personne ; le
  code testeur, le dépouillement multi-appareils et les canaux Discord ne servent qu'à partir du
  2ᵉ testeur. Le jalon « premier pilote invitable » est atteint **fin de Phase 2**, pas fin de
  roadmap. Ne bloque aucune phase — détermine où l'on peut s'arrêter.

- **DI2 — Sort de D4 (identité sur chaque résultat de test).** `EN ATTENTE`.
  *Reco : rétrograder en P2 conditionnel et le sortir de cette roadmap.* Le snapshot est déjà émis
  par appareil ; avec un snapshot archivé par testeur (Phase 4), l'identité **est** le snapshot, et
  le tag par testeur se pose au moment de la fusion dans le journal. Modifier
  `manualTestResult.ts` + le point d'enregistrement n'est nécessaire que si plusieurs testeurs
  partagent un même appareil. **Bloque rien ; si D4 est retenu malgré tout, il s'insère après la
  Phase 3 (dépend du code testeur).**

- **DI3 — Cadence des cycles de test.** `EN ATTENTE`. `TESTS/ONBOARD/plan_de_test.md` § 2 cale un
  cycle sur une version déployée. Avec `/deploy` gelé, les testeurs seraient invités dans un cycle
  vide à partir du 2ᵉ tour. *Reco : exposer `main` sur une préproduction (branch deploy Netlify) et
  déclencher un cycle sur « livraison **ou** lot de correctifs mergés non déployés ».* Repli si
  pas de préprod : cadence plancher de 3-4 semaines avec un sous-ensemble tournant de parcours de
  non-régression. **Ne bloque aucune phase de code ; bloque la mise en service.**

- **DI4 — Rédaction du texte de consentement.** `TRANCHÉE le 2026-09-08`. La relecture externe est
  déléguée à `TESTS` par ONBOARD, mais l'écriture du texte n'est assignée à personne.
  **Décision : rédaction par la zone racine en Phase 2, relecture externe portée par `TESTS` avant
  la première invitation** (gate de mise en service, pas gate de phase — cf. § Mise en service
  point 3). Débloque la Phase 2.

- **DI5 — Traitement de l'appareil de Marie face au consentement.** `TRANCHÉE le 2026-09-08`.
  Conditionner `syncNow()` à un flag couperait sa synchronisation au prochain déploiement.
  **Décision : poser le flag d'office sur tout appareil portant déjà `sync_last_success_at` en
  `localStorage`** (aucune régression, aucun écran imposé à Marie), **et corriger en parallèle le
  texte de `E116Privacy.tsx`** pour qu'elle puisse lire ce qui est réellement envoyé et retirer son
  accord. Alternative écartée : lui présenter l'écran bloquant — un refus accidentel arrêterait sa
  sync en silence. Débloque la Phase 2.

---

## Phase 1 — Intégration documentaire du livrable ONBOARD [TODO]

Rendre la spécification disponible sur `main` avant d'écrire la moindre ligne de code, et clore la
branche sandbox.

**Ne pas fusionner `agent/onboard`** : 69 commits de retard, et ses modifications `.claude/` sont
déjà sur `main`. Extraire uniquement les livrables :

```
git checkout agent/onboard -- TESTS/ONBOARD/decisions_dispositif.md \
  TESTS/ONBOARD/parcours_accueil.md TESTS/ONBOARD/criteres_acceptation.md \
  TESTS/ONBOARD/plan_de_test.md TESTS/ONBOARD/demandes_evolution.md \
  TESTS/ONBOARD/roadmap_accueil_testeurs.md
```

`TESTS/ONBOARD/_contexte/` reste sur la branche : c'est le contexte de la zone, qui vit dans son
worktree (`.claude/zones.md` pointe `ONBOARD` vers
`D:\ServOMorph\Appli_TSA_SDI_TDAH.worktrees\ONBOARD\TESTS\ONBOARD`). Le dupliquer sur `main`
créerait deux sources de vérité.

Consigner dans les documents importés les écarts relevés à l'analyse du 2026-09-08, sans réécrire
le fond produit par ONBOARD :
- `demandes_evolution.md` : D1 re-chiffré **S** (aucune migration Dexie, `settings` déjà dans le
  payload) ; D3 re-chiffré **S** (`--device-id` et rétention par appareil déjà en place) ; D5
  re-chiffré **L** (touche `bot.py` et `curate()`, pas seulement `agents.json`) ; D2 complété du
  risque de régression sur la synchronisation existante (DI5).
- `roadmap_accueil_testeurs.md` ligne 88 : « la cible fixée en phase 1 » — la Phase 1 n'a jamais
  chiffré cette cible, `criteres_acceptation.md` § 3 l'acte. Corriger en « la cible fixée en
  phase 2 ».

Entrée `CHANGELOG.md`.

**Gate de sortie** : les 6 documents sont sur `main` sous `TESTS/ONBOARD/` ; `git diff` ne montre
aucune modification de `.claude/` ; aucun fichier de `src/`, `supabase/` ou `scripts/` touché ; la
suite complète reste verte (100 fichiers / 817 tests au 2026-09-08, référence à recompter).

  **⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
  Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 2 — Consentement et activation conditionnelle de la synchronisation (D2) [TODO]

Pré-requis : **DI4 tranchée** (qui rédige le texte) et **DI5 tranchée** (sort de l'appareil de
Marie).

Prérequis éthique et légal à toute invitation d'un testeur externe : aucune donnée personnelle
(tâches, budget, énergie) ne doit remonter sans accord recueilli. C'est le **seul** bloquant du
jalon « premier pilote invitable » (DI1).

Contenu :
- Écran de consentement inséré dans le flux de premier lancement (`navigation.ts`, entre `welcome`
  et `profile`), nouveau code écran dans `screenCodes.ts`. Texte : nature des données collectées,
  usage, durée de conservation, droit à l'effacement.
- Flag de consentement persistant. Précédent à suivre : `User.onboarding_completed`.
- `syncNow()` (`src/data/sync/syncClient.ts`) conditionné à ce flag **en plus** de
  `isSyncEnabled()`. Aucun appel `callRpc` ne doit partir avant acceptation.
- **Reprise sans régression** : flag posé d'office si `localStorage` porte déjà
  `sync_last_success_at` (appareil ayant synchronisé au moins une fois). Voir DI5.
- Correction de `src/ui/screens/settings/E116Privacy.tsx` : la mention « Aucune donnée n'est
  envoyée à un serveur externe » est fausse. Décrire ce qui part réellement et donner le moyen de
  retirer son accord.

Tests attendus dans cette phase :
- appareil neuf, consentement non donné → aucun appel RPC émis ;
- consentement donné → la synchronisation reprend son comportement actuel (throttle inclus) ;
- `localStorage` portant `sync_last_success_at` → flag posé d'office, aucun écran, aucune
  interruption de synchronisation ;
- retrait de l'accord → la synchronisation s'arrête.

**Gate de sortie** : les 4 tests ci-dessus passent, la suite complète est verte, `tsc -b` exit 0,
lint 0. Le texte de consentement est rédigé (sa relecture externe est un gate humain de mise en
service, pas un gate de phase — cf. § Mise en service). Un parcours de validation est ajouté à
`src/domain/data/manualTestsCatalog.ts` pour Marie (vérifier que sa synchronisation n'a pas été
interrompue), conformément à la règle « tous les tests de Marie vivent dans le catalogue in-app ».

  **⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
  Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 3 — Code testeur (D1, résout R2) [TODO]

Rattacher un retour à une personne sans recoupement manuel. Ne sert qu'à partir du 2ᵉ testeur
(cf. DI1).

Contenu :
- Champ optionnel `tester_code?: string` sur `Settings`
  (`src/domain/entities/settings.ts`). **Aucune migration Dexie attendue** : le store est
  `settings: 'id, user_id'` (`src/data/db.ts:397`, version 19), le champ n'est pas indexé — au
  même titre que `ambiance_color?` ou `energy_max?`. À confirmer à l'exécution ; si une bascule de
  version s'avère nécessaire, elle entre dans cette phase.
- Saisie dans l'écran Paramètres, avec confirmation visuelle que le code est enregistré
  (`parcours_accueil.md` étape 4 : « le champ n'est pas laissé sans retour »).
- **Aucune modification du payload ni de la signature RPC** : `buildSnapshotPayload()` sérialise
  déjà `settings`. Le code remonte seul. L'UUID d'appareil n'est pas supprimé — le code testeur
  devient l'identifiant humain de référence à côté.

Tests attendus : un snapshot construit porte le code saisi ; la ressaisie du même code sur un
appareil neuf produit un snapshot rattachable à la même identité testeur.

**Gate de sortie** : tests ci-dessus verts, suite complète verte, `tsc -b` exit 0, lint 0. Un
snapshot réel (ou simulé en test) porte le code testeur, lisible sans recoupement avec l'UUID.

  **⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
  Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 4 — Dépouillement multi-appareils (D3, résout R1) [TODO]

Pré-requis : Phase 3 (identification des appareils actifs par code testeur).

Aujourd'hui, `select_target()` ne retient que l'appareil au plus grand nombre de résultats de test
— les snapshots des autres testeurs ne sont **jamais archivés ni lus**. Perte silencieuse.

Contenu :
- Remplacer la sélection d'une ligne unique par une itération sur les appareils actifs du cycle,
  chacun archivé individuellement dans `donnees_marie/`.
- Conserver `--device-id` (ciblage d'un appareil précis) et l'idempotence par contenu
  (`find_duplicate`) — un cycle rejoué ne doit rien réécrire.
- La rétention (`plan_retention`) regroupe déjà par appareil : vérifier qu'elle tient avec N
  appareils, ne pas la réécrire sans besoin constaté.

Tests attendus (tests Python du script) : deux appareils actifs simulés → deux archives produites,
aucune perte ; exécution rejouée → aucune réécriture ; `--device-id` cible toujours un seul
appareil.

**Gate de sortie** : tests ci-dessus verts. Le coût de la procédure de repli manuelle décrite dans
`TESTS/ONBOARD/plan_de_test.md` § 3 (hypothèse non mesurée de 5 à 10 min par testeur et par cycle)
tombe à zéro — le constater plutôt que le supposer.

  **⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
  Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 5 — Canaux Discord testeurs et routage gateway (D5) [TODO]

Pré-requis : Phase 3 (un testeur est identifiable).

Décision 5 de `decisions_dispositif.md` : visibilité **strictement asymétrique** — Marie voit les
retours des testeurs et les commente dans un canal privé ; aucun testeur ne voit son avis.

Chantier plus large que ce qu'estimait ONBOARD (« configuration du registre ») : la gateway est
câblée sur une seule personne. Points de contact réels :
- `DISCORD/discord_com/gateway/agents.json` — nouveaux agents / canaux.
- `curate()` de la gateway — insère aujourd'hui le tag de Marie sur tout message `to=marie`. Il
  faut un destinataire « testeur » qui ne déclenche pas cette règle.
- `DISCORD/discord_com/bot.py` — routage entrant, y compris `has_pending_reply(author_id)` qui
  suppose un auteur connu.

Contenu : créer le canal testeurs et le canal de supervision privé de Marie, et les règles de
routage associées. Le gardien de sortie (session `discord`) reste le seul à approuver les envois.

Tests attendus : un message posté sur le canal testeurs n'apparaît jamais sur le canal de
supervision et réciproquement ; un commentaire de Marie sur un retour testeur reste invisible du
testeur concerné.

**Gate de sortie** : le test de visibilité asymétrique passe dans les deux sens. Cette phase touche
la zone `discord` : la coordination passe par elle, cette roadmap ne contourne pas son gardien de
sortie.

  **⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
  Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 6 — Généralisation du nommage mono-personne (D7) [TODO]

Phase de refacto assumée, à ne lancer qu'une fois les phases 2 à 5 livrées : elle touche des
chemins en dur et un format de journal utilisés par toutes les phases précédentes, et son seul
risque réel est la régression sur l'historique existant.

Pré-requis : Phase 4 (le dépouillement itère déjà sur N appareils — inutile de renommer avant que
la logique soit bonne).

Contenu : `donnees_marie/`, `scripts/backup_marie_snapshot.py`,
`_contexte/marie_tests_journal.json` et toute référence en dur dans `scripts/` et la configuration
sont paramétrés par identifiant testeur (issu de la Phase 3), plus aucune référence fonctionnelle
ne dépend d'une identité particulière.

Tests attendus : le dépouillement fonctionne pour un testeur au nom arbitraire ; l'historique déjà
enregistré pour Marie reste lisible après renommage, sans perte.

**Gate de sortie** : tests ci-dessus verts, et relecture explicite du `.gitignore` — `donnees_marie/`
est un dossier de données sensibles (`.claude/CLAUDE.md` § Données sensibles) ; son remplacement ne
doit pas exposer de données au versionnage.

  **⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
  Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Mise en service — gates humains et process [EN ATTENTE]

Hors phases de code. Ces points conditionnent la **première invitation réelle**, pas la clôture des
phases. Repris de `TESTS/ONBOARD/roadmap_accueil_testeurs.md` § « Gates humains délégués à TESTS »,
complétés des recommandations du 2026-09-08.

1. **Relecture à blanc de `parcours_accueil.md`** par une personne extérieure au projet : aucune
   étape ambiguë, aucun prérequis implicite non listé. Porté par `TESTS`.
2. **Répétition à blanc** avec un testeur pilote réel, sur son propre téléphone, documents produits
   seuls. Porté par `TESTS`.
3. **Relecture externe du texte de consentement** rédigé en Phase 2 (DI4).
4. **Confirmation des prérequis techniques** listés par `parcours_accueil.md` : manifest PWA
   installable sur les navigateurs cibles, déploiement multi-utilisateurs sur URL unique sans
   collision d'état.
5. **Cadence des cycles** (DI3) : préproduction en place, ou cadence plancher calendaire arrêtée.
   Ne pas inviter de testeur tant que `/deploy` est gelé **et** qu'aucune préprod n'existe — le
   premier cycle est couvert par les 12 parcours v5.92 déjà non validés, mais le 2ᵉ tomberait à vide.
6. **Registre `code testeur → [device_id connus]`**, tenu par `TESTS` à chaque cycle. Traite D6
   (perte du `localStorage`, changement d'appareil) sans une ligne de code : les anciens retours ne
   sont pas perdus, ils sont sous l'ancien `device_id` — le seul enjeu est l'attribution. Consigne
   d'usage correspondante à inclure dans le message d'invitation (ne pas vider le navigateur, ne
   pas changer d'appareil en cours de cycle).
7. **Mesure de D6** : compter les changements de `device_id` par testeur sur les 2-3 premiers
   cycles. Si le phénomène est rare, clore D6 définitivement comme limite assumée plutôt que de
   développer une restauration depuis le serveur (authentification déguisée, hors périmètre).

## Hors périmètre de cette roadmap

- **D4 — identité sur chaque résultat de test** : voir DI2. À réintroduire après la Phase 3
  seulement si DI2 est tranchée en sa faveur.
- **D6 — perte du `localStorage`** : limite documentée, traitée par le process (point 6 ci-dessus),
  pas par du code.
- **Authentification / comptes** : hors périmètre, relève de la branche `sync-marie`.

## Invariants

- Tout le travail de cette roadmap se fait sur `main` : elle touche `src/`, `scripts/`,
  `CHANGELOG.md` et `manualTestsCatalog.ts`, tous réservés à `main` par `.claude/commands/start.md`
  § Politique des branches.
- La branche `agent/onboard` n'est **ni fusionnée ni rebasée** : la Phase 1 extrait ses fichiers.
- La Phase 5 touche la zone `discord` : passer par elle, ne jamais contourner le gardien de sortie
  de la gateway.
- Aucun test destiné à Marie ou à un testeur n'est listé hors de
  `src/domain/data/manualTestsCatalog.ts`.
- `donnees_marie/` et `.env` restent hors lecture et hors écriture sans instruction explicite.
