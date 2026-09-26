---
description: Build la dist versionnée et la déploie en prod sur Netlify
argument-hint: [version]
model: sonnet
allowed-tools: Bash(npx tsc -b:*), Bash(VITE_APP_VERSION=* npx vite build:*), Bash(npx netlify deploy:*), Bash(python scripts/backup_testeur_snapshots.py:*), Bash(python scripts/republish_pending_feedback_replies.py:*), Bash(python scripts/count_netlify_deploys.py:*), Bash(python DISCORD/discord_com/gateway.py:*), Bash(grep -m1:*), Bash(grep -q:*), Bash(grep -qE:*), Bash(test -f:*), Bash(test -d:*), Bash(ls -A:*), Bash(git status:*), Bash(git branch --show-current:*), Bash(git rev-parse:*), Bash(git rev-list:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(npx vitest run:*), Bash(npm run lint:*), Bash(curl:*), Bash(node scripts/check_bundle_budget.mjs:*)
---

# /deploy [version]

## Procédure

0. Traiter les données synchronisées de Marie avant toute chose.
   Depuis la bascule du 2026-09-01 (`Archives/roadmap_sync_marie.md` Phase 5), les données de
   Marie arrivent par synchronisation automatique (Supabase) : plus aucun export ni envoi manuel à
   réclamer. `/start` archive déjà le dernier snapshot daté de chaque testeur dans
   `donnees_testeurs/<tester_code>/` (`scripts/backup_testeur_snapshots.py`) — cette étape ne
   porte que sur celui de Marie (`donnees_testeurs/marie/`), seule testeuse dont les retours
   conditionnent le déploiement (`Archives/roadmap_integration_onboard.md` § Phase 6). `/traiter_export_marie`
   ne subsiste que comme repli manuel (voir son en-tête) et ne fait pas partie de ce flux.
   1. Alerter Marie en urgence, avant toute autre analyse : lui demander d'exporter ses données
      maintenant (Paramètres > Export et import > Exporter en JSON), avant qu'une nouvelle version
      ne soit disponible. Objectif : lui laisser le temps de sauvegarder son état courant avant
      que la suite de `/deploy` ne rende une nouvelle version accessible (cf. incident du
      2026-09-13 — import d'un ancien fichier sans export préalable, perte de données locales,
      `COMMUNICATION/Marie/historique_conversation_marie.md`). Rédiger le corps (gabarit CLAUDE.md
      § Messages pour Marie, fond seul, sans `💻🤖` ni tag) et déposer en urgence :
      ```
      python DISCORD/discord_com/gateway.py enqueue --source orchestrateur --to marie \
        --kind question --expect-reply --urgent --file <corps.txt>
      ```
      Mode urgent justifié : fenêtre de risque réelle, le reste de `/deploy` ne doit pas attendre
      la relecture normale du gardien de sortie (cf. CLAUDE.md § Communication Discord, « mode
      urgent »). Consigner immédiatement le message dans
      `COMMUNICATION/Marie/historique_conversation_marie.md` et committer cette mise à jour
      séparément, sujet `chore(orchestrateur): /deploy étape 0.1 — alerte export Marie` (pied
      `Co-Authored-By` habituel). Ne pas attendre sa réponse ici : sa confirmation est
      recontrôlée juste avant le build, à l'étape 4ter.
   2. Rafraîchir la sauvegarde locale du dernier snapshot Supabase de Marie (idempotent — ne
      réécrit rien si `/start` l'a déjà produite cette session), en chargeant `.env` dans le seul
      environnement de la commande :
      ```
      set -a; source .env; set +a; python scripts/backup_testeur_snapshots.py
      ```
      Échec (hors ligne, Supabase indisponible) : le signaler en une ligne et poursuivre avec le
      snapshot le plus récent déjà présent dans `donnees_testeurs/marie/`. Ne jamais copier ni
      modifier un fichier de `donnees_testeurs/` à la main (donnée sensible listée dans `CLAUDE.md`).
   3. Analyser le dernier snapshot de `donnees_testeurs/marie/` dans son intégralité (toutes les
      tables du payload JSON). La lecture de ce snapshot est explicitement autorisée ici —
      dérogation bornée à cette étape de `/deploy` de l'interdiction `CLAUDE.md` § Données
      sensibles. Ne jamais afficher son contenu brut ni recopier de données personnelles : n'en
      restituer que l'analyse.
      - pertes ou incohérences de données par rapport au dernier état connu (comparaison
        structurelle du payload avec le snapshot précédent analysé) ;
      - frictions signalées par Marie : voir désormais ses retours (`scripts/reply_feedback_report.py`),
        plus dans ce snapshot depuis le retrait du catalogue de tests in-app (`manual_test_results`
        n'existe plus dans les exports, roadmap_retours_conversationnels.md Phase 6).
   4. Vérifier les échanges Discord avec Marie en lien avec les modifications de cette version :
      relire les dernières entrées de `COMMUNICATION/Marie/historique_conversation_marie.md` et
      les messages non traités de `gateway/inbox/orchestrateur/`
      (`python DISCORD/discord_com/gateway.py poll --agent orchestrateur`, sans `ack` — relevé de
      lecture seule, cf. CLAUDE.md § Inbox gateway). Confronter au contenu de `CHANGELOG.md` pour
      la version cible : signaler toute demande, remarque ou confirmation de Marie touchant ces
      changements qui ne serait couverte ni par le code livré, ni par l'inventaire de communication
      à venir (étape 10).
   5. Si l'analyse (snapshot + échanges Discord) ne révèle ni perte, ni incohérence, ni friction
      bloquante, ni sujet Discord oublié : continuer normalement à l'étape 1.
   6. Sinon : s'arrêter, exposer précisément les problèmes trouvés à l'utilisateur et lui proposer de
      les traiter avant de poursuivre le déploiement. Ne jamais supprimer, écraser ni modifier les
      snapshots ou fichiers d'export de `donnees_testeurs/marie/` pour « résoudre » un problème
      constaté — toute correction porte sur le code ou le journal projet, jamais sur les données
      sources de Marie.

1. Exécuter intégralement `/close` (sans argument — zone implicite : dossier courant) avant de
   poursuivre. Le code à déployer doit être clôturé et commité, pas laissé en session ouverte.
   Si `/close` signale des résidus non commités à son étape 15, les traiter comme un échec de
   l'étape 3.1 ci-dessous plutôt que de continuer.

2. Déterminer la version.
   - Si $ARGUMENTS est fourni (ex: `v5.19`) : l'utiliser.
   - Sinon : la lire dans `CHANGELOG.md`, première ligne `## vX.Y — AAAA-MM-JJ` (grep -m1 '^## v').
   - Annoncer la version retenue avant de continuer.

3. Vérifications bloquantes — dans l'ordre, s'arrêter et rapporter l'erreur précise au premier échec.
   Ne jamais tenter de corriger automatiquement (committer, modifier le code, etc.) : rapporter et attendre
   une instruction explicite de l'utilisateur.

   1. **Arbre de travail propre** : `git status --short`. Si la sortie n'est pas vide, s'arrêter — le code
      déployé doit être traçable dans un commit.
   2. **`.env` présent** : `test -f .env`. Si absent : dire à l'utilisateur de le créer depuis
      `.env.example` et s'arrêter. Ne jamais lire ni afficher le contenu de `.env`. Le contrôle des
      clés Netlify (`NETLIFY_AUTH_TOKEN`/`NETLIFY_SITE_ID`) est fait à l'étape 7.1.
   3. **Cohérence CHANGELOG.md / version cible** : `grep -q "^## <version> " CHANGELOG.md`. Si aucune entrée
      ne correspond à la version déterminée à l'étape 2, s'arrêter — ajouter une entrée CHANGELOG décrivant
      les changements à déployer avant de relancer `/deploy`.
   4. **Tests unitaires verts** : `npx vitest run`.
   5. **Compilation TypeScript clean** : `npx tsc -b`.
   6. **Lint clean** : `npm run lint`.
   7. **Branche de production** : `git branch --show-current` doit retourner `main`. Sinon, s'arrêter : un
      déploiement de production depuis une autre branche n'est pas autorisé.
   8. **Aucune roadmap avec une phase en cours** : lister les `roadmap_*.md` à la racine du projet
      (`ls roadmap_*.md`). Pour chacune, relever les statuts de phase (`[EN COURS]`, `[TODO]`,
      `[TODO — BLOQUÉ]`, `[FAIT]`). Si une phase est `[EN COURS]`, s'arrêter — du travail est en
      cours et ne doit pas être déployé : demander à l'utilisateur de terminer la phase (ou de la
      repasser `[TODO]`) avant de relancer `/deploy`. Une roadmap dont les phases sont uniquement
      `[FAIT]` et/ou `[TODO]`/`[TODO — BLOQUÉ]` ne bloque pas ici (déploiement partiel assumé —
      voir l'avertissement 4.5).

4. Avertissements — signaler chacun s'il est détecté, puis demander une confirmation explicite unique
   avant de poursuivre (ne pas bloquer seul, ne pas continuer sans réponse de l'utilisateur).

   1. **Commits locaux non poussés** : si un remote de suivi existe
      (`git rev-parse --abbrev-ref --symbolic-full-name @{u}` réussit), compter
      `git rev-list --count @{u}..HEAD`. Si > 0, signaler que le déploiement embarquerait du code qui
      n'existe pas encore sur le remote (le déploiement Netlify envoie `dist/` directement, indépendamment
      de git). Ne jamais pousser automatiquement.
   2. **Version déjà présente dans `dist/`** : `test -d dist/<version>`. Si le dossier existe déjà, signaler
      qu'il sera écrasé par ce build.
   3. **Tests manuels en attente** : lire `tests_manuels.md`. S'il contient autre chose que le fichier vide,
      lister les points en attente et signaler qu'un déploiement prod interviendrait avant leur validation.
   4. **Catalogue des tests manuels pour Marie** : retiré le 2026-09-15
      (roadmap_retours_conversationnels.md, Phase 6) — `src/domain/data/manualTestsCatalog.ts`
      n'existe plus, ce gate est désormais sans objet. La validation par Marie passe par ses retours
      (cf. `CLAUDE.md` § Spécificités projet, « Validation des retours par Marie »).
   5. **Roadmap active incomplète (déploiement partiel)** : pour chaque `roadmap_*.md` à la racine ayant
      encore des phases `[TODO]` ou `[TODO — BLOQUÉ]` (la vérification bloquante 3.8 a déjà écarté le cas
      `[EN COURS]`), lister les phases restantes et signaler que le déploiement livrera une roadmap
      partiellement réalisée. Demander une confirmation explicite avant de poursuivre. Ne pas modifier la
      roadmap automatiquement.

4bis. Revue de code de la livraison — gate en lecture seule sur le diff cumulé depuis le dernier
   déploiement. Aucune modification de code n'est faite à cette étape.

   1. Déterminer la base de comparaison : lire le champ `Commit :` de
      `_contexte/dernier_deploiement.md` (renseigné par l'étape 8 des déploiements suivants). S'il
      est absent (premier `/deploy` après l'ajout de cette étape) : demander le SHA de référence à
      l'utilisateur — ne pas deviner, ne pas prendre un point arbitraire.
   2. Invoquer le skill `code-review` au niveau `high` en lui passant `<base>` comme cible
      (revue du diff `<base>..HEAD`).
   3. Findings de correction (`correctness`) confirmés et de forte sévérité : **bloquant**.
      S'arrêter, présenter chaque finding (`fichier:ligne`, scénario d'échec) et attendre une
      instruction explicite. Ne jamais corriger automatiquement — la correction se fait dans un
      nouveau cycle de développement puis `/close`, pas dans `/deploy`.
   4. Autres findings (correction incertaine, simplification, efficacité) : les lister et demander
      une confirmation explicite unique avant de poursuivre (même régime que le bloc 4). Ne pas
      les corriger ici.
   5. La redondance avec les revues de session (`/close`) est assumée : cette passe cumulée à
      `high` couvre le lot complet et les interactions entre sessions, qu'aucune revue de session
      n'a examinés ensemble.

4ter. Confirmation de l'export de Marie — gate bloquant côté humain, avant de lancer la dist.
   Demander explicitement à l'utilisateur si Marie a confirmé avoir exporté ses données
   (`Paramètres > Export et import > Exporter en JSON`) depuis l'alerte envoyée à l'étape 0.1.
   - Confirmé par l'utilisateur : poursuivre à l'étape 5.
   - Pas confirmé, ou pas de réponse : s'arrêter avant le build. Ne jamais lancer `npx vite build`
     ni le déploiement Netlify tant que cette confirmation n'a pas été donnée explicitement par
     l'utilisateur.
   Ne pas trancher seul en consultant `inbox/orchestrateur/` à la place de l'utilisateur : côté
   zone racine, ce relevé reste une décision explicite de l'utilisateur (CLAUDE.md § Inbox
   gateway) — la confirmation vient de lui, pas d'un poll automatique.

5. Build :
   ```
   npx tsc -b && VITE_APP_VERSION=<version> npx vite build --outDir dist/<version>
   ```
   `--outDir` prime sur `outDir` de `vite.config.ts` : chaque version obtient son propre dossier sous `dist/`,
   sans toucher `vite.config.ts`. `VITE_APP_VERSION` alimente le bouton « Entrer dans la <version> » de l'écran
   d'accueil (`E01Welcome.tsx`) — absente en dev/tests, le bouton reste « Entrer ». Le contrôle de
   taille du bundle est fait à l'étape 6 (gate bloquant), pas ici.

6. Vérifier que `dist/<version>` a été créé et n'est pas vide avant de déployer, puis contrôler son
   budget de taille (`bundle.budget.json`, seuils resserrés par `roadmap_bundle_2026-08-31.md`
   Phase 4 — mesure sur le build déjà produit, sans rebuild) :
   ```
   test -d dist/<version> && test -n "$(ls -A dist/<version>)"
   node scripts/check_bundle_budget.mjs dist/<version>
   ```
   Un code de sortie 1 est bloquant : s'arrêter, rapporter le dépassement précis (chunk concerné,
   écart au seuil) et attendre une instruction explicite avant de déployer.

7. Déployer. Par défaut, sans poser de question : déploiement automatique sur le compte Netlify
   principal, dont les credentials sont dans `.env` (jamais affichés, jamais passés en argument
   visible). Le second compte n'est proposé qu'en repli, dans les cas ci-dessous.
   1. Vérifier les clés : `grep -qE '^NETLIFY_AUTH_TOKEN=.+' .env` et
      `grep -qE '^NETLIFY_SITE_ID=.+' .env`. Si l'une est absente ou vide : signaler, proposer de
      compléter `.env` ou de déployer manuellement sur le second compte (7.3), et attendre une
      décision explicite.
   2. Contrôler le plafond mensuel de déploiements de production du compte principal (10 par
      période de facturation Netlify, pour préserver les crédits du plan gratuit) :
      ```
      set -a; source .env; set +a; python scripts/count_netlify_deploys.py --max 10
      ```
      - Code 0 : annoncer le compte (`N/10`) puis déployer :
        ```
        set -a; source .env; set +a; npx netlify deploy --prod --dir=dist/<version>
        ```
        Retenir l'URL de production renvoyée par la commande.
      - Code 1 (plafond atteint) : ne pas déployer sur le compte principal. Rapporter le compte et
        la date de fin de période, puis proposer le déploiement manuel sur le second compte (7.3)
        en signalant que son adresse diffère : les données locales de Marie sont liées à l'adresse,
        elle devra importer son export sur la nouvelle et mettre à jour son raccourci. Attendre une
        décision explicite (second compte, ou report du déploiement).
      - Code 2 ou erreur réseau : signaler et attendre une décision explicite.
   3. **Manuel sur le second compte** (uniquement sur décision explicite de l'utilisateur à l'une
      des propositions ci-dessus) : signaler que `dist/<version>` est prêt à être uploadé. Attendre
      la confirmation explicite que l'upload est terminé, ainsi que l'URL de production effective.
      Ne jamais deviner cette URL ni poursuivre sans confirmation explicite.

   L'URL retenue (automatique ou confirmée manuellement) alimente la vérification de fumée de
   l'étape 8 et le rapport final de l'étape 12.

   Comparer l'URL retenue au champ `URL de production` de `_contexte/dernier_deploiement.md`,
   **avant** sa mise à jour à l'étape 8. Si elles diffèrent : **changement d'adresse** — le signaler
   à l'utilisateur et le retenir pour l'étape 11 (guidage de Marie). Les données locales de Marie
   (IndexedDB, `localStorage`) sont liées à l'adresse : sur la nouvelle, l'application est vide
   tant qu'elle n'a pas importé son export.

8. Vérification de fumée post-déploiement : utiliser l'URL de production retenue à l'étape 7,
   puis `curl -sf -o /dev/null -w '%{http_code}' <url>`. Un code différent de 200 est signalé dans le rapport
   final mais n'invalide pas le déploiement déjà effectué (Netlify l'a déjà confirmé) — c'est une vérification
   indépendante supplémentaire, pas une nouvelle porte bloquante.

   Republier les réponses aux retours testeur laissées en attente de cette livraison :
   ```
   python scripts/republish_pending_feedback_replies.py
   ```
   `_contexte/reponses_retours_en_attente_deploiement.json` contient les réponses dont le
   correctif n'était pas encore réellement en production au moment où elles ont été rédigées —
   déposées ici, maintenant que le smoke test ci-dessus confirme le code en ligne, plutôt qu'au
   moment de la correction, pour que le testeur ne lise jamais « corrigé » sur une version qui ne
   l'embarque pas encore. Fichier absent ou vide : rien à faire. Échec partiel : les entrées non
   publiées restent dans le fichier (nouvelle tentative au prochain `/deploy`), à signaler dans le
   rapport final sans bloquer la suite.

   Mettre à jour `_contexte/dernier_deploiement.md` (le créer s'il n'existe pas) avec la version, la date et
   l'URL de production déployées, pour que cette information reste à jour indépendamment de `/close`. Y
   consigner aussi le SHA déployé sous un champ `Commit :` (`git rev-parse HEAD`) : il sert de base à la
   revue de code cumulée (étape 4bis) du déploiement suivant.

   Vider intégralement le tableau `WHATS_NEW` de `src/domain/data/whatsNew.ts` (`[]`) : son
   contenu vient d'être publié dans cette version et la fonctionnalité Nouveautés (accessible depuis
   `E123FeedbackList.tsx`) ne doit pas le réafficher aux versions suivantes. Committer ce vidage
   séparément après le déploiement (le build `dist/<version>` a déjà embarqué le contenu avant le vidage).

8bis. Archivage des roadmaps terminées par cette livraison. Pour chaque `roadmap_*.md` à la racine dont
   toutes les phases sont `[FAIT]` après ce déploiement : le signaler à l'utilisateur et lui proposer de
   déplacer le fichier dans `Archives/` (`git mv roadmap_<sujet>.md Archives/`). Ne jamais archiver sans
   son accord explicite (cf. `CLAUDE.md` § Roadmap, « Clôture »). Une roadmap encore incomplète (phases
   `[TODO]`/`[TODO — BLOQUÉ]` restantes — déploiement partiel confirmé à l'étape 4.6) reste à la racine.
   L'archivage confirmé est inclus dans le commit de l'étape 8 (vidage `WHATS_NEW`) ou dans un commit
   dédié.

9. Préparer les éléments du rapport final : version déployée, dossier `dist/` utilisé, URL de production
   retenue à l'étape 7, résultat de la vérification de fumée et résultat du contrôle de budget bundle
   (étape 6). Le rapport est envoyé après les étapes de communication ci-dessous.

10. Constituer l'inventaire de communication de la livraison. Avant toute rédaction pour Marie, lire et croiser :
    - les changements de la version cible dans `CHANGELOG.md` et `WHATS_NEW` ;
    - les roadmaps terminées ou modifiées par cette livraison, y compris leurs écarts assumés et décisions non tranchées ;
    - les retours ouverts de Marie nécessitant une réponse (`python scripts/reply_feedback_report.py`)
      et les actions encore ouvertes dans la partie active de `_contexte/signals.md`.

    L'inventaire doit distinguer explicitement : ce qui est livré, les choix attendus d'elle, les écarts assumés
    et les retours de ses exports déjà corrigés. Ne pas reprendre les archives ou les signaux historiques clos
    comme des demandes encore actives.

    Il n'existe plus de liste de tests à faire à inclure dans l'inventaire : la validation par Marie passe
    par le fil de discussion de ses retours (cf. `CLAUDE.md` § Spécificités projet, « Validation des retours
    par Marie »), pas par un document de livraison.

11. Composer le message de livraison pour Marie à partir de l'inventaire (cf. `CLAUDE.md` § Messages
    pour Marie). Il doit toujours contenir :
    - une annonce brève de la version disponible ;
    - les changements effectivement livrés ;
    - les choix ou questions encore attendus, ainsi que les écarts assumés s'ils la concernent ;
    - le lien de production, sur sa propre ligne : l'URL de production retenue à l'étape 7 ;
    - la mention que le détail des changements est visible dans l'application via le bouton
      « Nouveautés » — jamais de renvoi vers un document externe.

    En cas de changement d'adresse (étape 7), ajouter un guidage pas à pas, une action par ligne :
    ```
    Nouvelle adresse de l'appli (l'ancienne n'est plus mise à jour) :
    <nouvelle URL>

    Pour retrouver tes données :
    1. Sur l'ancienne adresse, si pas déjà fait : Paramètres > Export et import > Exporter en JSON.
    2. Ouvre la nouvelle adresse. L'appli démarre vide : passe l'accueil rapidement.
    3. Paramètres > Export et import > Importer un fichier JSON. Choisis ton fichier. Confirme.
    4. Supprime l'ancien raccourci de ton écran d'accueil.
    5. Sur la nouvelle adresse : Partager > Sur l'écran d'accueil.

    Réponds « fait » une fois terminé, ou dis-moi où tu bloques.
    ```
    Ce message est alors déposé avec `--expect-reply` (étape 11bis) pour suivre sa réponse.

    Écrire le corps au fond définitif, **sans** l'encadrement `💻🤖` ni le tag (l'agent DISCORD les pose).

11bis. Validation du message de livraison — gate bloquant côté humain, avant tout dépôt en gateway.
    Afficher à l'utilisateur le corps intégral composé à l'étape 11 et attendre sa confirmation explicite.
    - Confirmé : déposer le message tel quel dans la gateway Discord :
      ```
      python DISCORD/discord_com/gateway.py enqueue --source orchestrateur --to marie --kind delivery --file <corps.txt>
      ```
      Ajouter `--expect-reply` en cas de changement d'adresse (étape 7).
      Ne jamais appeler `DISCORD/discord_com/message_marie.py`, l'API Discord ou `claude_bridge` en direct.
      L'agent DISCORD ajuste ensuite ton, format et moment d'envoi sans changer le fond ; relever l'id de
      demande renvoyé.
    - Demande de modification du fond : réécrire le corps en conséquence et le représenter à l'utilisateur
      avant tout dépôt. Ne jamais déposer un corps non validé.

11ter. Vérifier que le message est effectivement sorti de l'outbox. Le dépôt en gateway (étape 11bis) ne
    garantit pas l'envoi : le gardien Discord peut `bounce`, ou `bot.py` peut échouer à drainer. Depuis le
    réveil synthétique de la gateway (`_wake_gardien`), la demande est en général jugée en quelques secondes
    à quelques minutes plutôt que d'attendre jusqu'à 1h — recontrôler à ce rythme, sans `sleep` bloquant.
    - `python DISCORD/discord_com/gateway.py list` : si l'id n'apparaît plus, vérifier sa présence dans
      `DISCORD/discord_com/gateway/outbox/sent/<id>.json` (champ `sent_at` renseigné) → envoi confirmé,
      consigner l'id dans le rapport final (étape 12).
    - Si un fichier `kind: "bounce"` référant cet id apparaît dans `gateway/inbox/orchestrateur/`
      (`gateway.py poll --agent orchestrateur`) : lire le motif, corriger le corps du message en conséquence
      (gabarit CLAUDE.md), re-`enqueue`, `ack` le bounce, consigner la correction dans
      `COMMUNICATION/Marie/historique_conversation_marie.md`, puis reprendre cette vérification sur le
      nouvel id.
    - Si la demande reste `pending` au-delà d'un délai raisonnable, ou passe `failed` (dead-letter dans
      `inbox/discord/`) : diagnostiquer avant de conclure quoi que ce soit (process `bot.py` actif ? session
      `discord` en veille ? erreur lisible dans la dead-letter ?). Corriger seul uniquement si la cause est
      un bug de code identifiable et non ambigu — **jamais** modifier `gateway.py`, `bot.py` ou
      `discord_loop.md` sans confirmation explicite de l'utilisateur (code partagé, session live). Si la
      cause n'est pas clairement un bug de code (gardien apparemment arrêté, panne Discord, ambiguïté sur le
      fond du message) : s'arrêter et demander à l'utilisateur de vérifier lui-même plutôt que de deviner.
    - Ne jamais appeler `drain` manuellement (cf. CLAUDE.md § Communication Discord) : seul `bot.py` draine
      les demandes `approved`.

12. Rapporter à l'utilisateur : version déployée, dossier `dist/` utilisé, URL de production retenue à l'étape 7, résultat de la
    vérification de fumée, résultat du contrôle de budget bundle, inventaire
    synthétique, corps du message de livraison déposé dans la gateway (avec son id de demande) et résultat de sa
    vérification d'envoi (étape 11ter) — confirmé sorti, corrigé après bounce, ou en attente signalée à
    l'utilisateur. Ne jamais relancer le déploiement automatiquement en cas d'échec — signaler l'erreur et
    attendre une confirmation explicite.
