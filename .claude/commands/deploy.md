---
description: Build la dist versionnée et la déploie en prod sur Netlify
argument-hint: [version]
model: sonnet
allowed-tools: Bash(npx tsc -b:*), Bash(VITE_APP_VERSION=* npx vite build:*), Bash(npx netlify deploy:*), Bash(python scripts/backup_marie_snapshot.py:*), Bash(python scripts/ingest_manual_tests.py:*), Bash(python DISCORD/discord_com/gateway.py:*), Bash(grep -m1:*), Bash(grep -q:*), Bash(grep -qE:*), Bash(test -f:*), Bash(test -d:*), Bash(ls -A:*), Bash(git status:*), Bash(git branch --show-current:*), Bash(git rev-parse:*), Bash(git rev-list:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(npx vitest run:*), Bash(npm run lint:*), Bash(curl:*), Bash(pandoc:*), Bash(rclone:*), Bash(node scripts/check_bundle_budget.mjs:*)
---

# /deploy [version]

## Procédure

0. Traiter les données synchronisées de Marie et revoir le Google Doc avant toute chose.
   Depuis la bascule du 2026-09-01 (`roadmap_sync_marie.md` Phase 5), les données de Marie
   arrivent par synchronisation automatique (Supabase) : plus aucun export ni envoi manuel à
   réclamer. `/start` archive déjà le dernier snapshot daté dans `donnees_marie/`
   (`scripts/backup_marie_snapshot.py`). `/traiter_export_marie` ne subsiste que comme repli
   manuel (voir son en-tête) et ne fait pas partie de ce flux.
   1. Rafraîchir la sauvegarde locale du dernier snapshot Supabase de Marie (idempotent — ne
      réécrit rien si `/start` l'a déjà produite cette session), en chargeant `.env` dans le seul
      environnement de la commande :
      ```
      set -a; source .env; set +a; python scripts/backup_marie_snapshot.py
      ```
      Échec (hors ligne, Supabase indisponible) : le signaler en une ligne et poursuivre avec le
      snapshot le plus récent déjà présent dans `donnees_marie/`. Ne jamais copier ni modifier un
      fichier de `donnees_marie/` à la main (donnée sensible listée dans `CLAUDE.md`).
   2. Analyser le dernier snapshot de `donnees_marie/` dans son intégralité (toutes les tables du
      payload JSON, pas seulement `manual_test_results`) :
      - pertes ou incohérences de données par rapport au dernier état connu (journal
        `_contexte/marie_tests_journal.json` pour l'historique des tests, comparaison structurelle du
        reste du payload avec le snapshot précédent analysé) ;
      - frictions signalées par Marie elle-même (commentaires des résultats `nok` dans
        `manual_test_results`).
   3. Ingérer les résultats de tests via `python scripts/ingest_manual_tests.py <dernier snapshot>`
      (dédoublonnage par `id`, jamais d'écrasement d'une entrée existante).
   4. Revue du Google Doc de Marie : exécuter la procédure `.claude/revue_googledoc.md`. Elle
      réconcilie `_contexte/marie_modifications_suivi.md` et pose le jalon daté « Dernière exécution
      de la revue » dans l'en-tête du registre (contrôlé à l'étape 3.9). Présenter ensuite à
      l'utilisateur le compte-rendu qu'elle rend (différentiel d'états du registre, ou « Doc
      inchangé depuis <date> » avec la date comparée) : ne jamais enchaîner à l'étape 1 sans l'avoir
      affiché. Si elle rapporte que le Google Doc est plus récent que la dernière revue du registre :
      s'arrêter après la réconciliation et demander à l'utilisateur de lancer `/analyser_googledoc`
      avant de reprendre `/deploy`.
   5. Si l'analyse (snapshot + revue du Doc) ne révèle ni perte, ni incohérence, ni friction
      bloquante, ni changement non revu du Google Doc : continuer normalement à l'étape 1.
   6. Sinon : s'arrêter, exposer précisément les problèmes trouvés à l'utilisateur et lui proposer de
      les traiter avant de poursuivre le déploiement. Ne jamais supprimer, écraser ni modifier les
      snapshots ou fichiers d'export de `donnees_marie/` pour « résoudre » un problème constaté —
      toute correction porte sur le code ou le journal projet, jamais sur les données sources de Marie.

1. Exécuter intégralement `/close` (sans argument — zone implicite : dossier courant) avant de
   poursuivre. Le code à déployer doit être clôturé et commité, pas laissé en session ouverte.
   Si `/close` signale des résidus non commités à son étape 12, les traiter comme un échec de
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
   2. **`.env` présent avec les clés attendues, valeurs non vides** : `test -f .env`, puis
      `grep -qE '^NETLIFY_AUTH_TOKEN=.+' .env` et `grep -qE '^NETLIFY_SITE_ID=.+' .env` (le `.+` exige une
      valeur après le `=`, pas seulement la clé). Si absent ou incomplet : dire à l'utilisateur de le
      créer/compléter depuis `.env.example` et s'arrêter. Ne jamais lire ni afficher le contenu de `.env`.
   3. **Cohérence CHANGELOG.md / version cible** : `grep -q "^## <version> " CHANGELOG.md`. Si aucune entrée
      ne correspond à la version déterminée à l'étape 2, s'arrêter — ajouter une entrée CHANGELOG décrivant
      les changements à déployer avant de relancer `/deploy`.
   4. **Tests unitaires verts** : `npx vitest run`.
   5. **Compilation TypeScript clean** : `npx tsc -b`.
   6. **Lint clean** : `npm run lint`.
   7. **Communication prête** : vérifier l'existence de `COMMUNICATION/Marie/a_transmettre.md` et de
      `.claude/rclone.conf`, puis vérifier que `pandoc` et `rclone` sont disponibles. Vérifier enfin l'accès
      en lecture au dossier Drive cible, sans afficher son contenu :
      ```
      test -f COMMUNICATION/Marie/a_transmettre.md && test -f .claude/rclone.conf
      pandoc --version
      rclone version
      rclone lsd tsa_gdrive:Projets/Appli --config .claude/rclone.conf > /dev/null
      ```
      Si l'un de ces contrôles échoue, s'arrêter avant le build : la livraison ne peut pas être communiquée
      correctement à Marie.
   8. **Branche de production** : `git branch --show-current` doit retourner `main`. Sinon, s'arrêter : un
      déploiement de production depuis une autre branche n'est pas autorisé.
   9. **Revue du Google Doc exécutée cette session** :
      `grep -m1 '^- Dernière exécution de la revue :' _contexte/marie_modifications_suivi.md`. La date
      qui suit doit être celle du jour. Sinon, s'arrêter — l'étape 0.4 a été sautée : exécuter
      `.claude/revue_googledoc.md` (et présenter son compte-rendu) avant de reprendre.

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
   4. **Catalogue des tests manuels pour Marie à jour** : `test -f src/domain/data/manualTestsCatalog.ts`
      (cf. `roadmap_tests_marie.md`). Si absent, ignorer silencieusement — fonctionnalité pas encore livrée.
      S'il existe, lire son contenu et le comparer aux changements de la version en cours de déploiement
      (`CHANGELOG.md`) : si une fonctionnalité soumise à Marie a changé sans que le catalogue n'ait été mis à
      jour, le signaler. Ne pas modifier le catalogue automatiquement.
   5. **Demandes Marie en attente non planifiées** : lire `_contexte/marie_modifications_suivi.md`. Si absent,
      ignorer silencieusement. S'il existe, lister toute demande à l'état `en attente` qui n'est rattachée ni à
      une roadmap active (fichier `roadmap_*.md` à la racine avec une phase la couvrant) ni à une décision
      tracée. S'il y en a, les signaler et demander une confirmation explicite avant de poursuivre. Ne pas
      modifier le registre automatiquement.

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

7. Déployer en prod sur Netlify, en chargeant `.env` dans l'environnement de la seule commande (jamais affiché,
   jamais passé en argument visible) :
   ```
   set -a; source .env; set +a; npx netlify deploy --prod --dir=dist/<version>
   ```

8. Vérification de fumée post-déploiement : lire l'URL de production annoncée par la commande précédente,
   puis `curl -sf -o /dev/null -w '%{http_code}' <url>`. Un code différent de 200 est signalé dans le rapport
   final mais n'invalide pas le déploiement déjà effectué (Netlify l'a déjà confirmé) — c'est une vérification
   indépendante supplémentaire, pas une nouvelle porte bloquante.

   Mettre à jour `_contexte/dernier_deploiement.md` (le créer s'il n'existe pas) avec la version, la date et
   l'URL de production déployées, pour que cette information reste à jour indépendamment de `/close`.

   Vider intégralement le tableau `WHATS_NEW` de `src/ui/screens/onboarding/E01Welcome.tsx` (`[]`) : son
   contenu vient d'être publié dans cette version et la modale Nouveautés de l'écran d'accueil ne doit pas
   le réafficher aux versions suivantes. Committer ce vidage séparément après le déploiement (le build
   `dist/<version>` a déjà embarqué le contenu avant le vidage).

9. Préparer les éléments du rapport final : version déployée, dossier `dist/` utilisé, URL renvoyée par Netlify,
   résultat de la vérification de fumée et résultat du contrôle de budget bundle (étape 6). Le rapport est
   envoyé après les étapes de communication ci-dessous.

10. Constituer l'inventaire de communication de la livraison. Avant toute rédaction pour Marie, lire et croiser :
    - les changements de la version cible dans `CHANGELOG.md` et `WHATS_NEW` ;
    - les roadmaps terminées ou modifiées par cette livraison, y compris leurs écarts assumés et décisions non tranchées ;
    - `COMMUNICATION/Marie/a_transmettre.md` ;
    - les tests Marie ajoutés ou modifiés dans `manualTestsCatalog.ts` ;
    - les retours nouveaux du dernier export de Marie et les actions encore ouvertes dans la partie active de `_contexte/signals.md`.

    L'inventaire doit distinguer explicitement : ce qui est livré, les choix attendus d'elle, les écarts assumés
    et les retours de ses exports déjà corrigés. Ne pas reprendre les archives ou les signaux historiques clos
    comme des demandes encore actives.

    Les tests que Marie doit refaire ne figurent PAS dans l'inventaire de communication : ils vivent uniquement
    dans le catalogue in-app (`manualTestsCatalog.ts`, écran « Tests à faire »). Vérifier ici que tout nouveau
    comportement à valider par Marie y a bien été ajouté (sinon l'ajouter avant de poursuivre), sans le recopier
    dans les documents Drive (cf. `CLAUDE.md` § Spécificités projet, « Tests à faire pour Marie : uniquement dans l'appli »).

11. Figer puis publier systématiquement le commentaire de livraison sur Google Drive et obtenir un lien partageable.
    - Prendre `COMMUNICATION/Marie/a_transmettre.md`. S'il n'existe pas, créer avant le déploiement un fichier
      avec l'inventaire de l'étape 10, en langage simple.
    - Copier son contenu dans `COMMUNICATION/Marie/livraisons/<version>.md`, précédé de la version et de la date.
      Ce fichier est l'historique immuable de ce qui a été préparé pour Marie à cette livraison.
    - La disponibilité de `pandoc`, `rclone`, de la configuration et du dossier Drive a déjà été validée à l'étape 3.7.
    - Convertir le commentaire en `.docx`, le publier sous un nom versionné, puis produire son lien :
      ```
      pandoc COMMUNICATION/Marie/livraisons/<version>.md -o commentaires_marie_<version>.docx
      rclone copyto commentaires_marie_<version>.docx "tsa_gdrive:Projets/Appli/commentaires_marie_<version>.docx" --config .claude/rclone.conf
      rclone link "tsa_gdrive:Projets/Appli/commentaires_marie_<version>.docx" --config .claude/rclone.conf
      ```
    - Si la publication ou l'obtention du lien échoue, ne pas prétendre que Marie peut consulter le document ;
      signaler précisément l'échec et attendre une instruction.

12. Composer le message de livraison pour Marie à partir de l'inventaire et le **déposer dans la gateway Discord**
    (cf. `CLAUDE.md` § Messages pour Marie). Il doit toujours contenir :
    - une annonce brève de la version disponible ;
    - les changements effectivement livrés ;
    - un renvoi vers l'écran « Tests à faire » de l'appli pour les tests à rejouer — sans les énumérer ;
    - les choix ou questions encore attendus, ainsi que les écarts assumés s'ils la concernent ;
    - le lien de production, sur sa propre ligne : `https://appli-audhd.netlify.app/` ;
    - le lien partageable du commentaire Drive, sur sa propre ligne, introduit par « Détail des changements et questions : ».

    Écrire le corps au fond définitif, **sans** l'encadrement `💻🤖` ni le tag (l'agent DISCORD les pose), puis :
    ```
    python DISCORD/discord_com/gateway.py enqueue --source orchestrateur --to marie --kind delivery --file <corps.txt>
    ```
    Ne jamais appeler `DISCORD/discord_com/message_marie.py`, l'API Discord ou `claude_bridge` en direct.
    L'agent DISCORD ajuste ton, format et moment d'envoi sans changer le fond ; relever l'id de demande renvoyé.

13. Rapporter à l'utilisateur : version déployée, dossier `dist/` utilisé, URL renvoyée par Netlify, résultat de la
    vérification de fumée, résultat du contrôle de budget bundle, nom et lien du document Drive, inventaire
    synthétique et corps du message de livraison déposé dans la gateway (avec son id de demande). Ne jamais
    relancer le déploiement automatiquement en cas d'échec — signaler l'erreur et attendre une confirmation explicite.
