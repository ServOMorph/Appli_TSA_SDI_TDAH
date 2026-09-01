# Roadmap — Réduction du bundle JavaScript

Créée le 2026-08-31. Objectif : ramener le chunk JS initial sous le seuil d'alerte Vite
(500 kB) sans perte fonctionnelle, et empêcher toute régression future par un garde-fou
automatisé.

Légende : `[TODO]` · `[EN COURS]` · `[FAIT]`. Une seule phase `[EN COURS]` à la fois.
Gate commun à chaque phase : tests avant écrits · refacto · tests après verts ·
`npm test` + `npm run lint` + `npm run build` verts · mesure consignée dans cette roadmap.

> **Suspension levée le 2026-09-01.** La Phase 0 avait révélé 26 tests e2e en échec, préexistants
> et sans lien avec ce chantier. Corrigés en 3 phases via `roadmap_e2e_2026-09-01.md` (triage
> intégral : spec obsolètes, un bug réel confirmé et corrigé sur validation utilisateur) — voir ce
> fichier pour le détail. `npm run test:e2e` est de nouveau intégralement vert (57/57) : filet de
> régression fiable restauré, Phase 1 peut s'ouvrir.

---

## Constat mesuré (2026-08-31, `main` @ 1311805)

Build de référence : `766.88 kB` / gzip `207.47 kB`, **un seul chunk**, 167 modules.

Composition obtenue par attribution des octets minifiés via la sourcemap
(`vite build --sourcemap`, parseur VLQ) — 747.31 kB attribués sur 766.88 kB, l'écart étant
le runtime non mappé.

| Groupe | kB min. | % | Chargé au démarrage ? |
|---|---:|---:|---|
| `react-dom` + `react` + `scheduler` | 185.4 | 24.8 % | oui — incompressible |
| `@supabase/*` (7 paquets) + `iceberg-js` | 202.8 | 27.1 % | oui — **pour un unique appel RPC** |
| `dexie` | 93.1 | 12.5 % | oui — incompressible |
| `@dnd-kit/*` (3 paquets) | 42.7 | 5.7 % | oui — utilisé par **2 écrans sur 30** |
| `src/ui/screens/*` (10 dossiers) | 124.1 | 16.6 % | oui — 1 seul écran est visible à la fois |
| `src/domain/data/manualTestsCatalog.ts` | 18.4 | 2.5 % | oui — via `E10Dashboard` |
| `src/ui/components` | 27.7 | 3.7 % | partiellement |
| reste (`src/app`, `src/data`, `src/domain/rules`) | 53.1 | 7.1 % | oui |

Détail Supabase : `auth-js` 93.9 · `realtime-js` 29.7 · `phoenix` 25.1 · `storage-js` 21.1 ·
`postgrest-js` 14.9 · `supabase-js` 10.1 · `iceberg-js` 5.2 · `functions-js` 2.8.

### Fait décisif

`@supabase/supabase-js` n'est importé qu'à un seul endroit du code applicatif
(`src/data/sync/supabaseClient.ts`) et ne sert qu'à **un appel** :
`client.rpc('sync_device_snapshot', { ... })` dans `src/data/sync/syncClient.ts`.
Ni l'auth, ni le realtime, ni le storage, ni les edge functions ne sont utilisés.

Un appel RPC PostgREST est un `POST {url}/rest/v1/rpc/sync_device_snapshot` avec les en-têtes
`apikey` et `Authorization: Bearer <anon>` et un corps JSON. Il est reproductible en `fetch`
natif en une trentaine de lignes.

**Gain mesuré** (build réel avec `@supabase/supabase-js` remplacé par un stub, 2026-08-31) :
`766.88 kB → 558.24 kB` soit **−208.64 kB (−27.2 %)**, gzip `207.47 → 153.81 kB` (−25.9 %).

### Ce que devient la synchronisation des données de Marie

Question posée en ouverture de ce chantier. Réponse vérifiée sur les fichiers le 2026-08-31 :
**le flux de bout en bout est inchangé**. Le SDK n'est qu'un transport HTTP ; ce qui porte la
synchronisation est ailleurs et n'est pas touché.

| Maillon | Fichier | Impact du retrait |
|---|---|---|
| Table `device_snapshots` + RLS | `supabase/schema.sql` | aucun |
| Fonction `sync_device_snapshot()` (`security definer`, `grant execute to anon`) | `supabase/schema.sql` | aucun |
| Secret d'appareil en `localStorage` | `src/data/sync/deviceIdentity.ts` | aucun |
| Payload complet (`user` + 17 `toArray()`) | `src/data/sync/buildSnapshot.ts` | aucun |
| Throttle 1 h + échec silencieux | `src/data/sync/syncClient.ts` | aucun |
| Lecture des snapshots côté développeur | `scripts/read_device_snapshots.py` | aucun |

Le SDK n'intervient qu'entre `syncClient` et la fonction Postgres, pour émettre un
`POST /rest/v1/rpc/sync_device_snapshot`.

**Argument décisif : la lecture des données de Marie n'utilise déjà pas le SDK.**
`scripts/read_device_snapshots.py` fait un `urllib.request` brut sur
`{url}/rest/v1/device_snapshots` avec les en-têtes `apikey` et `Authorization: Bearer` — exactement
le pattern proposé pour l'écriture. Et il fonctionne : 19 snapshots lus le 2026-08-31
(`roadmap_sync_marie.md`, Phase 4). Le retrait du SDK n'est donc pas un pari technique, c'est
l'alignement de la moitié écriture sur la moitié lecture, déjà en HTTP brut dans ce projet.

**Sécurité : inchangée.** La clé anon est déjà publique dans le bundle, c'est son rôle. RLS refuse
tout accès direct à la table, `anon` n'a que le droit d'exécuter la fonction, et la fonction vérifie
le secret d'appareil dans le `where` de son `on conflict do update`. Le SDK n'ajoute aucune couche
de sécurité ici.

**Ce qui est réellement perdu :**

1. Le client typé — `client.rpc()` est typé, un `fetch` maison exige d'écrire le type de retour à
   la main. Coût : quelques lignes, une fois.
2. Auth, realtime et storage à portée de main. Si Marie devait un jour avoir un vrai compte, il
   faudrait réintroduire le SDK. Seul vrai coût d'option, rendu improbable à court terme par la
   décision du 2026-08-15 (« pas d'écran de connexion »).
3. La traduction des erreurs HTTP en `{ data, error }`, à réécrire.

Le rafraîchissement de session, autre service du SDK, ne s'applique pas : `persistSession: false`
et clé statique.

**Risque à ne pas sous-estimer** : le contrat PostgREST exact (en-tête `Accept`, forme de la
réponse pour une fonction retournant un scalaire `boolean`, en-tête `X-Client-Info`). Du détail,
mais du détail qui casse silencieusement. D'où le double garde-fou de la Phase 1 : capture avant /
comparaison après, **et** synchronisation réelle vérifiée via `read_device_snapshots.py` avant de
marquer la phase `[FAIT]`. Un mock ne prouve pas le contrat serveur.

### Valeur réelle du chantier, et ses limites

- L'app est une PWA avec `registerType: 'autoUpdate'` et précache Workbox. **Un chunk unique
  signifie que chaque déploiement fait re-télécharger 766 kB à Marie**, sur mobile. À la cadence
  actuelle (v5.69), c'est le vrai coût, davantage que le premier chargement.
- Après découpage, une livraison ne modifiant qu'un écran ne fait re-télécharger que son chunk.
- Limite honnête : `react-dom` (185 kB) + `dexie` (93 kB) forment un **plancher d'environ
  280 kB** de chunk initial. Aucune phase ci-dessous n'y touche, et il ne faut pas y toucher.
- La Phase 1 seule ne suffit pas à passer sous 500 kB (558 kB). **Phase 1 + Phase 2 sont toutes
  les deux nécessaires** pour éteindre l'avertissement Vite.

### Cible

| Étape | Chunk initial | Statut du chiffre |
|---|---:|---|
| Aujourd'hui | 766.88 kB | mesuré |
| Après Phase 1 | 558.24 kB | **mesuré** |
| Après Phase 2 | ~400 kB | estimé |
| Après Phase 3 | ~385 kB (gzip ~105 kB) | estimé |

Les estimations des Phases 2 et 3 sont dérivées des octets attribués par la sourcemap, minorées
d'un surcoût de découpage d'environ 8 kB. Elles seront remplacées par des mesures à l'exécution.

---

## Séquencement avec les autres roadmaps actives

Trois roadmaps sont ouvertes simultanément et touchent les mêmes fichiers. À arbitrer **avant** de
lancer la Phase 0, sinon collision garantie.

| Roadmap | Phase | Fichier partagé | Conflit |
|---|---|---|---|
| `roadmap_planning_accueil_2026-08-29.md` | Phase 3 `[EN COURS]` | `PlanningBoard.tsx` | aucun |
| `roadmap_planning_accueil_2026-08-29.md` | Phase 5 `[TODO]` | **`src/App.tsx`**, `navigation.ts`, `DevResetButton.tsx` | **direct** avec Phase 2 bundle |
| `roadmap_sync_marie.md` | Phase 5 `[TODO]` | **`.claude/commands/deploy.md`** | **direct** avec Phase 4 bundle |

- **`roadmap_planning_accueil` Phase 5 vs Phase 2 bundle.** Cette phase ajoute un écran
  `EXXWeekPlanning` et modifie le câblage de `src/App.tsx` — le fichier que la Phase 2 réécrit
  intégralement. *Recommandation : faire la Phase 2 bundle **avant**.* Le nouvel écran naîtra
  alors directement en `lazy`, conformément à la règle posée en Phase 4. L'inverse impose de
  refaire le câblage deux fois.
- **`roadmap_sync_marie` Phase 5 vs Phase 4 bundle.** Les deux modifient `deploy.md` :
  sync_marie révise l'étape 0 (exports de Marie), bundle modifie l'étape 5 (contrôle de taille).
  Zones distinctes du fichier, mais à ne pas mener en parallèle.
- **Dépendance assumée sur la Phase 1.** `@supabase/supabase-js` vient d'être fusionné dans `main`
  et validé en réel le 2026-08-31 (`roadmap_sync_marie.md` Phase 4). La Phase 1 bundle le retire
  avant que `roadmap_sync_marie` Phase 5 ne soit close. C'est défendable — rien dans la Phase 5
  sync ne dépend du SDK — mais **le gate de la Phase 1 reprend à son compte la validation de
  synchronisation réelle** que sync_marie Phase 4 vient tout juste d'obtenir. C'est la raison pour
  laquelle cette vérification est non négociable.

---

## Décisions tranchées en ouverture de Phase 1 (2026-09-01)

1. **Abandon de `@supabase/supabase-js` côté navigateur.** **Tranché : retiré.** Conséquence
   assumée : perte du client typé et des fonctionnalités Supabase « gratuites » (auth, realtime)
   côté app. `roadmap_sync_marie.md` ne prévoit aucune auth (décision actée du 2026-08-15 : « pas
   d'écran de connexion »). Le script développeur `scripts/read_device_snapshots.py` est en Python
   et n'est pas concerné. Détail complet de l'impact sur les données de Marie : section « Ce que
   devient la synchronisation des données de Marie » ci-dessus.
2. **Seuil du garde-fou.** **Tranché : 450 kB** pour le chunk initial (marge de 50 kB sous le
   seuil Vite), à ajuster après la Phase 2.
3. **Écrans d'onboarding en chargement différé ou non.** **Tranché : différés** (3.4 kB, gain
   marginal mais cohérence du découpage). Ils ne concernent qu'une première ouverture.

---

## Phase 0 — Harnais de mesure et baseline [FAIT]

Rien n'est refactoré dans cette phase. Elle produit les outils qui prouveront le refacto.

- Créer `scripts/analyse_bundle.mjs` : build avec sourcemap **dans un dossier dédié** (`--outDir`
  + `--emptyOutDir` forcés), attribution des octets par fichier source et par groupe, sortie
  tableau + `--json`. Portage du script jetable qui a produit le tableau ci-dessus.
- Créer `scripts/check_bundle_budget.mjs` **prenant le dossier de build en argument**
  (`node scripts/check_bundle_budget.mjs dist/v5.70`) : lit `<dossier>/index.html` pour identifier
  le chunk d'entrée, mesure sa taille brute et gzip, compare aux seuils de `bundle.budget.json`,
  sort en code 1 si dépassement, affiche l'écart avec la baseline.

  > **Contrainte impérative, vérifiée le 2026-08-31.** Un glob `dist/**/assets/*.js` est
  > inutilisable : `dist/` contient **23 dossiers de build versionnés** (`dev`, `sync-preview`,
  > `v5.1` … `v5.69`). Et `npm run build` écrit dans `dist/v5.1` — `build.outDir` est codé en dur
  > et périmé dans `vite.config.ts`. Le script ne doit donc **jamais** deviner son dossier : soit
  > il le reçoit en argument (usage `/deploy`), soit il déclenche son propre build isolé (usage
  > local). C'est un prérequis de livraison de cette phase, pas un détail.

- Créer `bundle.budget.json` versionné à la racine, initialisé à la **baseline actuelle**
  (`entry: 766.88 kB`, `gzip: 207.47 kB`) — donc vert au départ, il sera resserré à chaque phase.
- Ajouter les scripts npm `bundle:analyse` et `bundle:check` (build isolé dans un dossier dédié
  puis appel du script sur ce dossier — **pas** `npm run build`, qui viserait `dist/v5.1`).
- Mesurer et consigner ici le **nombre réel de tests** (`npm test`) : le chiffre de 640 provient de
  `roadmap_sync_marie.md` et est daté, il ne doit pas servir de référence sans re-mesure.

**Tests — avant**

- Aucun (phase d'outillage).

**Tests — après**

- `npm run bundle:check` sur le build courant : vert.
- Test de l'outil lui-même : abaisser temporairement le seuil de `bundle.budget.json` à 100 kB,
  vérifier l'échec avec un message lisible, restaurer.
- Test du choix de dossier : lancer le script sur `dist/v5.69` et sur un build frais, vérifier que
  les deux mesures sont distinctes et correctes — c'est le piège des 23 dossiers.
- Baseline e2e : `npm run test:e2e` (9 specs Playwright) exécuté et **résultat consigné dans cette
  roadmap**. C'est le filet fonctionnel de référence des Phases 1 à 3.
- `npm test` et `npm run lint` verts, **compte de tests consigné**.
- `npm run lint` sur les nouveaux `scripts/*.mjs` : `eslint.config.js` ne cible que
  `**/*.{ts,tsx}` et `--max-warnings 0` est intransigeant — vérifier qu'aucun avertissement
  n'apparaît, sinon étendre l'`ignores`.

**Critère de sortie** : `npm run bundle:check` opérationnel, baseline chiffrée dans
`bundle.budget.json`, résultat e2e consigné ici.

### Résultats mesurés (2026-08-31)

**Livré**

- `scripts/analyse_bundle.mjs` — build isolé `dist/_bundle-analyse` (`--sourcemap --emptyOutDir`),
  décodage VLQ, attribution par source puis par groupe, sortie tableau ou `--json`, mode
  `--dir <d>` pour analyser un build existant portant ses `.map`.
- `scripts/check_bundle_budget.mjs` — **dossier de build en argument obligatoire** (refus explicite
  sans argument, code 1) ; chunk d'entrée identifié en lisant le `<script type="module">` pointant
  vers `/assets/*.js` dans `<dossier>/index.html` (le `registerSW.js` du plugin PWA est donc
  écarté) ; mesure brute + gzip, comparaison aux seuils, écart affiché vs baseline, code 1 si
  dépassement.
- `bundle.budget.json` à la racine.
- Scripts npm : `bundle:build` (build isolé dans `dist/_bundle-check`), `bundle:check`
  (`bundle:build` puis contrôle sur ce dossier), `bundle:analyse`. Aucun n'appelle `npm run build`.

**Baseline mesurée** (`main` @ `1311805`, build isolé du 2026-08-31)

| Mesure | Valeur | Source |
|---|---:|---|
| Chunk d'entrée, brut | **766 844 o — 766.84 kB** | `check_bundle_budget.mjs` |
| Chunk d'entrée, gzip | **205 686 o — 205.69 kB** | `check_bundle_budget.mjs` (`zlib.gzipSync`) |
| Chunk d'entrée, brut (rapport Vite) | 766.84 kB | `vite build` |
| Chunk d'entrée, gzip (rapport Vite) | 207.42 kB | `vite build` |
| Chunks JS | 1 | — |
| Modules sources dans la sourcemap | 160 | `analyse_bundle.mjs` |

> **Écart de gzip assumé.** `zlib.gzipSync` au niveau par défaut donne 205.69 kB là où Vite
> rapporte 207.42 kB (−1.73 kB). Les deux chiffres sont justes, les réglages diffèrent. Le
> garde-fou n'utilise que sa propre mesure, pour rester comparable dans le temps ; c'est celle-ci
> qui est inscrite en baseline, pas le 207.47 kB estimé à la création de la roadmap.

**Composition re-mesurée** (`npm run bundle:analyse`, 763.52 kB attribués sur 766.89, soit 99.6 %)

| Groupe | kB | % | Roadmap (script jetable) |
|---|---:|---:|---:|
| `@supabase/*` + `iceberg-js` | 207.70 | 27.1 % | 208.0 |
| `react` + `react-dom` + `scheduler` | 189.80 | 24.7 % | 185.4 |
| `src/ui/screens/*` | 127.06 | 16.6 % | 124.1 |
| `dexie` | 95.35 | 12.4 % | 93.1 |
| `@dnd-kit/*` | 44.22 | 5.8 % | 42.7 |
| `src/ui/components` | 28.41 | 3.7 % | 27.7 |
| `src/app` | 23.52 | 3.1 % | — |
| `src/domain/data/manualTestsCatalog.ts` | 18.82 | 2.5 % | 18.4 |
| `src/data` | 17.54 | 2.3 % | — |
| `src/domain/rules` | 6.67 | 0.9 % | — |
| reste (`App.tsx`, styles, `tslib`, entités, `main.tsx`) | 4.42 | 0.6 % | — |

Le constat initial est confirmé sur tous les postes. Les valeurs sont uniformément un peu
supérieures parce que ce script attribue 99.6 % des octets contre 97.4 % au script jetable :
le non-mappé tombe de 19.6 kB à 1.73 kB, et ces octets se répartissent sur les groupes.

**Tests — après**

| Contrôle | Résultat |
|---|---|
| `npm run bundle:check` sur build courant | vert, code 0 |
| Seuil abaissé à 100 kB | échec attendu, code 1, 2 seuils signalés, message lisible ; seuils restaurés |
| Choix de dossier — `dist/v5.69` | 767 380 o, chunk `index-DbRgLjnu.js` |
| Choix de dossier — build frais | 766 844 o, chunk `index-_cz3v0AP.js` |
| Choix de dossier — sans argument | refus explicite + rappel d'usage, code 1 |
| `npm test` | **640 tests / 80 fichiers, verts** |
| `npm run lint` | vert, code 0 |
| Lint des `scripts/*.mjs` | aucun avertissement — `eslint.config.js` ne les sélectionne pas (`files: **/*.{ts,tsx}`) ; `ignores` **non modifié**, inutile |
| Baseline e2e (`npm run test:e2e`) | **57 tests / 9 fichiers de specs — 57/57 verts** (chromium, 2026-09-01, après correction via `roadmap_e2e_2026-09-01.md`) |

Le chiffre de 640 tests, jusqu'ici hérité de `roadmap_sync_marie.md`, est donc **confirmé par
re-mesure** et non plus daté. La roadmap annonçait « 9 specs Playwright » : ce sont bien 9
fichiers de specs, 57 tests.

> **Historique.** La mesure initiale du 2026-08-31 avait révélé 26 échecs sur 57 tests, tous
> préexistants et sans lien avec ce chantier (aucun fichier applicatif touché par la Phase 0).
> Corrigés en 3 phases via `roadmap_e2e_2026-09-01.md` : désynchronisations spec/app confirmées
> obsolètes par comparaison aux tests unitaires à jour, plus un bug réel identifié et corrigé sur
> validation utilisateur explicite (`useTasksState.ts`, `moveTask`). Filet de régression désormais
> intégralement fiable pour les Phases 1 à 3 ci-dessous.

**Point relevé, hors périmètre de cette phase** : `build.outDir` de `vite.config.ts` vaut toujours
`dist/v5.1`. Sans danger pour les déploiements — `/deploy` passe `--outDir dist/<version>`, qui
prime — mais `npm run build` et `npm run test:e2e` écrasent silencieusement le build versionné
`dist/v5.1`. À corriger dans une phase ultérieure ou hors roadmap ; les scripts `bundle:*`
contournent le problème en imposant leur propre `--outDir`.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 1 — Retrait de `@supabase/supabase-js` du navigateur [FAIT]

> Gain **mesuré** : −208.64 kB (−27.2 %). Meilleur rapport gain/risque de la roadmap.

- Remplacer `src/data/sync/supabaseClient.ts` par un module sans dépendance externe exposant
  `getSyncConfig(): { url, anonKey } | null` et `isSyncEnabled()`.
- Créer `src/data/sync/rpc.ts` : `callRpc(name, params)` en `fetch` natif, reproduisant le contrat
  PostgREST (méthode, URL `{url}/rest/v1/rpc/{name}`, en-têtes `apikey` + `Authorization: Bearer`
  + `Content-Type: application/json`, corps JSON, lecture du corps de réponse, mapping des erreurs
  HTTP vers la forme `{ data, error }` déjà attendue par `syncClient`).
- Adapter `src/data/sync/syncClient.ts` : la signature de `syncNow()` et son comportement
  (throttle 1 h, échec silencieux, `getLastSyncSuccessAt`) **ne changent pas**.
- Retirer `@supabase/supabase-js` de `package.json`, régénérer `package-lock.json`.
- Ne pas toucher à `supabase/schema.sql` ni à `scripts/read_device_snapshots.py`.

**Tests — avant** (écrits sur le code actuel, pour figer le contrat)

- Nouveau `src/data/sync/rpc.contract.test.ts` : monter le **client Supabase réel** contre un
  `fetch` moqué, appeler `sync_device_snapshot` et **capturer** l'URL, la méthode, les en-têtes et
  le corps émis. Ce test doit être vert sur le code actuel, avant tout refacto.

  > **Deux précisions techniques, sans lesquelles le test ne marchera pas.**
  > 1. `postgrest-js` résout `fetch` via `globalThis.fetch`, dont la présence en jsdom dépend de
  >    la version de Node. Injecter explicitement le mock :
  >    `createClient(url, key, { global: { fetch: mock } })`. Le mock doit renvoyer un objet de
  >    type `Response` avec `.text()` et `headers.get()`, pas un simple littéral.
  > 2. **La comparaison doit porter sur un sous-ensemble choisi, pas sur une égalité stricte.**
  >    Le SDK émet `X-Client-Info: supabase-js-web/<version>` qu'un `fetch` maison ne reproduira
  >    pas, et la casse comme l'ordre des en-têtes diffèrent. Comparer : méthode, URL complète,
  >    `apikey`, `Authorization`, `Content-Type`, et le corps JSON désérialisé. Ignorer le reste.

- Conserver `src/data/sync/syncClient.test.ts` tel quel : ses 6 cas (pas de client, succès, secret
  refusé, erreur réseau, throttle, `force`) sont le contrat comportemental et doivent rester verts
  après le refacto, au mock près.

**Tests — après**

- `rpc.contract.test.ts` rejoué contre l'implémentation `fetch` : la requête émise doit
  correspondre à la capture de référence **sur le sous-ensemble défini ci-dessus**.
- `supabaseClient.test.ts` réécrit en `syncConfig.test.ts` : 4 cas (aucune variable, URL seule,
  clé seule, les deux) → `null` ou configuration valide. Cible, pas description de l'existant :
  le fichier actuel couvre absent / URL seule / les deux / mise en cache.
- Conserver un équivalent de `resetSupabaseClient()` si le nouveau module garde un cache — les
  tests actuels l'appellent en teardown ; sinon supprimer le cache et adapter le teardown.
- Nouveaux cas sur `rpc.ts` : réponse 200, 4xx, 5xx, `fetch` qui rejette (hors-ligne) → aucune
  exception ne remonte, `syncNow()` renvoie `false`.
- **Couverture** : `vitest.config.ts` impose 85 % sur lignes, fonctions, branches et instructions.
  `src/App.tsx` est exclu, mais `src/data/sync/rpc.ts` ne l'est pas — ses branches de mapping
  d'erreurs HTTP doivent être couvertes sous peine de casser `npm run test:coverage`.
- `npm test` complet vert · `npm run lint` vert · `npm run build` vert.
- `npm run bundle:check` avec seuil resserré à **570 kB** : vert. Mesure réelle consignée ici.
- **Vérification réelle obligatoire** (un mock ne prouve pas le contrat serveur) : lancer l'app en
  local avec les variables `.env`, déclencher une synchronisation, puis lire les snapshots avec
  `python scripts/read_device_snapshots.py` et vérifier qu'une nouvelle ligne datée est arrivée.
  Sans cette vérification, la phase n'est pas `[FAIT]`.
- `npm run test:e2e` : identique à la baseline Phase 0.

**Critère de sortie** : chunk initial ≤ 570 kB, synchronisation réelle vérifiée de bout en bout,
`@supabase/supabase-js` absent de `package.json`.

### Résultats mesurés (2026-09-01)

**Livré**

- `src/data/sync/syncConfig.ts` (ex-`supabaseClient.ts`) : `getSyncConfig()` / `isSyncEnabled()`,
  sans dépendance externe.
- `src/data/sync/rpc.ts` : `callRpc(name, params)` en `fetch` natif, reproduisant le contrat
  PostgREST (méthode, URL, en-têtes `apikey`/`Authorization`/`Content-Type`, mapping des erreurs
  HTTP et réseau vers `{ data, error }`).
- `src/data/sync/syncClient.ts` adapté (`isSyncEnabled()` + `callRpc()`), signature et
  comportement de `syncNow()` inchangés.
- `@supabase/supabase-js` retiré de `package.json`, `package-lock.json` régénéré (16 paquets
  supprimés).
- `bundle.budget.json` : seuils resserrés à 570 000 o / 160 000 o gzip (décision 2 actée).

**Tests — après**

| Contrôle | Résultat |
|---|---|
| `rpc.contract.test.ts` (référence SDK capturée avant refacto, rejouée contre `callRpc`) | vert |
| `syncConfig.test.ts` (4 cas cible + cache) | vert |
| `rpc.test.ts` (200 / 4xx / 5xx / fetch rejeté) | vert |
| `syncClient.test.ts` (6 cas comportementaux, inchangés) | vert |
| `npm test` | **648/648 verts**, 82 fichiers |
| `npm run lint` | vert |
| `npm run test:coverage` | seuils 85 % respectés (`src/data/sync` : 98.81 % lignes / 88.37 % branches) |
| `npm run bundle:check` (seuil 570 kB / 160 kB gzip) | **558.64 kB / 152.70 kB gzip — vert** (−208.20 kB soit −27.2 % vs baseline) |
| Vérification réelle (`callRpc` en direct contre Supabase, snapshot de test lu via `read_device_snapshots.py`) | **confirmée** — ligne `device_id a2245b57…` retrouvée avec le marqueur émis |
| `npm run test:e2e` | **57/57 verts** (14.2 s) — identique à la baseline Phase 0 |

**Note.** La ligne de test écrite lors de la vérification réelle n'a pas pu être supprimée du
backend (suppression bloquée par le mode auto, action destructrice sur Supabase). Elle est
inoffensive — `device_id` de test sans lien avec un appareil de Marie — et peut être supprimée
manuellement (`device_id: a2245b57-15f0-429d-8a6e-77f0b6769117`) si souhaité.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 2 — Chargement différé des écrans [FAIT]

> Gain estimé : **−130 à −150 kB** sur le chunk initial. Arithmétique : 124.1 kB d'écrans
> + 42.7 kB de `@dnd-kit` = 166.8 kB différables bruts, moins `E10Dashboard` + `PlanningBoard`
> gardés statiques (~19.4 kB) et ~8 kB de surcoût de découpage.

`src/App.tsx` importe statiquement **30 écrans** alors qu'un seul est rendu à la fois.

- Convertir les imports d'écrans de `src/App.tsx` en `React.lazy(() => import(...))`, sauf ceux du
  chemin de démarrage : `E10Dashboard` reste statique (écran d'atterrissage de Marie).

  > **Interop à ne pas sous-estimer.** `React.lazy` exige un export `default`, or les 30 écrans
  > sont tous en **exports nommés** (`import { E01Welcome } from ...`). Chaque déclaration devient
  > `lazy(() => import('...').then((m) => ({ default: m.E01Welcome })))`. Ce sont ~29 déclarations
  > d'interop à écrire, pas une simple substitution d'`import`. Aucun `lazy` ni `Suspense`
  > n'existe aujourd'hui dans `src/` : le pattern est entièrement nouveau pour ce projet.
  > Alternative à évaluer en ouverture de phase : ajouter un `export default` à chaque écran
  > (30 fichiers touchés, mais déclarations `lazy` triviales).

- Envelopper `renderScreen()` dans un `<Suspense>` dont le `fallback` réutilise **exactement** le
  bloc « Chargement... » déjà présent pour `loading` (même `role="status"`, même
  `aria-live="polite"`), extrait en composant partagé pour éviter la duplication. Contrainte
  d'accessibilité : pas de flash de contenu vide non annoncé.
- **Traiter le cas du chunk périmé — c'est LE risque de régression de cette phase.** Avec
  `registerType: 'autoUpdate'`, un client dont l'onglet est resté ouvert conserve l'ancien
  `index.html` en mémoire. Après un déploiement, le nouveau service worker purge les anciens
  chunks hashés ; un `import()` dynamique vers un chunk disparu est alors **rejeté**, et le
  `<Suspense>` reste bloqué indéfiniment sur « Chargement... ». Aujourd'hui, avec un chunk unique,
  ce scénario n'existe pas — le découpage le crée.
  Parade à implémenter dans la même phase : error boundary autour du `<Suspense>` + écoute de
  l'événement `vite:preloadError` déclenchant un `location.reload()`.
- `@dnd-kit` (42.7 kB) sort automatiquement du chunk initial en suivant `E22TaskDetail` et
  `E23Decompose`, seuls écrans qui l'importent. Aucune action spécifique, mais à **vérifier** via
  `bundle:analyse`.
- Précache Workbox : `globPatterns` couvre déjà `**/*.js`, donc tous les chunks sont précachés et
  la navigation hors-ligne reste possible — point favorable, à confirmer par
  `e2e/06-offline.spec.ts`. Ne pas confondre avec le cas du chunk périmé ci-dessus, qui est un
  problème de **version**, pas de disponibilité hors-ligne.

**Tests — avant**

> **Correction du 2026-08-31.** Une version antérieure de cette roadmap affirmait que
> `src/App.test.tsx`, `src/app/AppContext.test.tsx` et `src/app/AppContextBudget.test.tsx`
> montaient tous l'arbre complet et allaient casser. **C'est faux**, vérifié dans le code :
> `AppContext.test.tsx` et `AppContextBudget.test.tsx` importent `AppProvider` (pas `App` ni
> `AppScreens`), montent des composants sondes ad hoc, et sont **déjà entièrement asynchrones**.
> Seul `src/App.test.tsx` rend `AppScreens`. L'erreur venait d'un motif de recherche trop large
> (`render(<App`), qui capturait `render(<AppProvider`.

- Constat réel, à acter : **la suite existante ne devrait pas casser.** Seul `src/App.test.tsx`
  rend `AppScreens`, et toutes ses assertions portent soit sur `BottomNav` (« Accueil »,
  « Ajouter une tâche », rôle `navigation`) — rendu **hors** du `renderScreen()` qu'on enveloppe
  dans `<Suspense>` — soit sur `E10Dashboard` (`heading 'AuDHD'`, `region 'Planning du jour'`),
  qui reste statique. Aucune assertion n'inspecte le contenu d'un écran devenu `lazy`.
  Si un cas casse malgré tout, le migrer en `findBy*` — mais ne pas budgéter cette migration
  comme le coût principal de la phase : **le coût réel est dans le test neuf ci-dessous.**
- Écrire, avant le refacto, `src/App.suspense.test.tsx` : pour chaque écran différé, monter
  `AppScreens` et vérifier que l'écran finit par apparaître (`findByRole` / `findByText`).

  > **Vrai coût de la phase.** `makeAppContext()` renvoie par défaut `route: { name: 'welcome' }`.
  > Monter les 30 écrans réels avec ce contexte fera planter tous ceux qui lisent un paramètre de
  > route ou une entité sélectionnée : `folder-detail`, `list-detail`, `list-item-detail`,
  > `budget-livret-detail`, `budget-category-detail`, `task-detail`, `task-edit`… Il faut une
  > **fixture de contexte et de route par écran**. C'est le poste de travail principal de la
  > Phase 2, pas la conversion des `import`.

**Tests — après**

- `src/App.test.tsx` vert **sans modification**. S'il a fallu le modifier, documenter ici pourquoi
  — ce serait le signe que le périmètre du `<Suspense>` déborde sur `BottomNav`.
- `src/App.suspense.test.tsx` vert sur les 30 écrans, avec ses fixtures de route.
- Non-régression d'accessibilité : le fallback expose `role="status"` et `aria-live="polite"`.
- **Test du chunk périmé** : simuler le rejet d'un `import()` dynamique et vérifier que l'error
  boundary rattrape et déclenche le rechargement, plutôt qu'un « Chargement... » infini.
- `npm test` : compte de tests **au moins égal à la baseline Phase 0**, aucun cas supprimé.
- `npm run test:e2e` complet, attention particulière sur `06-offline.spec.ts`.
- `npm run bundle:analyse` : confirmer que `@dnd-kit`, `src/ui/screens/tools`, `lists`, `settings`,
  `tests` et `resources` ne sont plus dans le chunk d'entrée.
- `npm run bundle:check` avec seuil resserré à **430 kB**.

**Critère de sortie** : chunk initial ≤ 430 kB, avertissement Vite « chunks larger than 500 kB »
disparu du build, e2e verts dont le parcours hors-ligne, aucun test perdu.

### Résultats mesurés (2026-09-01)

**Écart avec le plan.** L'alternative « ajouter un `export default` aux 30 écrans » (évoquée en
ouverture de phase) n'a pas été retenue : le wrapper `lazy(() => import(...).then((m) => ({
default: m.X })))` isole l'interop dans `App.tsx` seul, sans toucher aux exports nommés utilisés
par ailleurs (tests, autres imports). 29 déclarations, un seul fichier modifié.

**Constat empirique qui simplifie le plan.** La partie annoncée comme le vrai coût de la phase —
une fixture de contexte et de route par écran pour éviter un crash sur paramètre manquant — ne
s'est pas matérialisée : les 30 écrans, montés avec `makeAppContext()` et une route minimale
(uniquement le paramètre `id` pertinent quand il existe), se résolvent tous sans erreur. Le code
des écrans gère déjà l'absence de sélection (recherches `.find()` retournant `undefined`,
`route.name === '…' ? route.param : null`). `src/App.suspense.test.tsx` (31 cas : 30 écrans +
`planning`) en est la preuve, pas une supposition.

**Livré**

- Tous les écrans sauf `E10Dashboard` convertis en `React.lazy`, wrappers d'interop dans `App.tsx`.
- `src/ui/components/ScreenLoading.tsx` : fallback extrait, réutilisé par le `loading` applicatif
  et par le `<Suspense>` (même `role="status"`, même `aria-live="polite"` — accessibilité inchangée).
- `src/ui/components/LazyScreenBoundary.tsx` : error boundary autour du `<Suspense>`, double
  déclencheur de rechargement (erreur de rendu attrapée **et** événement `vite:preloadError`).
- `src/App.suspense.test.tsx` (31 cas) et `src/ui/components/LazyScreenBoundary.test.tsx` (3 cas,
  dont le rejet simulé d'un chunk et la vérification de `location.reload()`).

**Tests — après**

| Contrôle | Résultat |
|---|---|
| `src/App.test.tsx` | vert **sans modification** — confirme que le périmètre du `<Suspense>` ne déborde pas sur `BottomNav` |
| `src/App.suspense.test.tsx` (30 écrans + `planning`) | vert |
| `src/ui/components/LazyScreenBoundary.test.tsx` (chunk périmé, `vite:preloadError`, cas nominal) | vert |
| Accessibilité du fallback (`role="status"`, `aria-live="polite"`) | vert |
| `npm test` | **682/682 verts**, 84 fichiers (+34 vs Phase 1) |
| `npm run lint` | vert |
| `npm run test:coverage` | seuils 85 % respectés (93.23 % lignes / 86.86 % branches global) |
| `npm run build` (`tsc -b && vite build`) | vert |
| `npm run test:e2e` | **57/57 verts** (34.4 s), dont `06-offline.spec.ts` (5 cas) |

**Mesure du bundle** (`npm run bundle:check`, seuil resserré à **430 kB**)

| Mesure | Valeur |
|---|---:|
| Chunk d'entrée (`index-*.js`), brut | **242.21 kB** — seuil 430 kB, marge 187.79 kB |
| Chunk d'entrée, gzip | **74.15 kB** |
| vs baseline (766.84 kB) | **−524.63 kB (−68.4 %)** |
| vs Phase 1 (558.64 kB) | −316.43 kB (−56.6 %) |

> **Point de transparence, au-delà de ce que mesure `bundle:check`.** `AppContext.tsx` (150.38 kB,
> dépendance statique incontournable de `AppScreens` — l'état applicatif doit exister avant tout
> écran) forme un second chunk que Vite fait précharger par le navigateur via
> `<link rel="modulepreload">` dans `index.html`, donc téléchargé en parallèle de l'entrée, pas à
> la demande. Le script de budget, dont la méthode (lire le `<script type="module">` de
> `index.html`) date de la Phase 0 — un seul chunk à l'époque — ne mesure pas ce second fichier.
> Total réellement chargé au démarrage : **242.21 + 150.38 = 392.59 kB** brut, **~120.5 kB** gzip
> (somme des gzip individuels rapportés par Vite, légère surestimation par rapport à un flux
> combiné). Ce total reste sous la cible finale de 450 kB — donc sans impact sur la suite de la
> roadmap — mais le seuil `bundle.budget.json` ne le couvre pas : à traiter en Phase 4 (`garde-fou
> permanent`), soit en élargissant la mesure aux chunks `modulepreload`, soit en documentant
> explicitement la limite. `@dnd-kit` (44.35 kB), lui, est correctement différé et absent de tout
> préchargement — confirmé par `bundle:analyse` et par l'absence d'un second `modulepreload` dans
> `index.html`.

L'avertissement Vite « chunks larger than 500 kB » a disparu du build (242 kB < 500 kB).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 3 — Découpler le catalogue de tests manuels du démarrage [ABANDONNÉE]

> Gain estimé : −13 à −15 kB. Phase optionnelle : à ne lancer que si la Phase 2 laisse le chunk
> initial au-dessus de la cible, ou si le confort de maintenance le justifie.

### Décision d'abandon (2026-09-01)

Condition de lancement non remplie : la Phase 2 a mesuré **242.21 kB**, sous le seuil 430 kB et
sous la cible finale de 450 kB (y compris le second chunk `AppContext.tsx`, total ~392.59 kB —
voir le point de transparence en fin de Phase 2). Le gain résiduel de cette phase (−13 à −15 kB)
a été jugé inférieur à son coût : la scission duplique l'`id` de chaque test entre
`manualTestsIndex.ts` et `manualTestsSteps.ts`, ce qui va à l'encontre de la règle projet
« ajout de test = édition simple, dans l'appli uniquement ». Décision utilisateur explicite,
prise en ouverture de phase conformément à la consigne posée par la roadmap elle-même.
Aucun fichier de cette phase n'a été créé ni modifié.

`src/domain/data/manualTestsCatalog.ts` (18.4 kB, 367 lignes) est tiré dans le chunk initial par
`E10Dashboard.tsx`, qui n'en a besoin que pour `hasPendingManualTests(manualTestsCatalog, results)`
— c'est-à-dire les seuls champs `id` et `revision`. Les `steps`, l'essentiel du volume, ne servent
qu'à `E121ManualTests`.

> **Piste écartée, ne pas la réexplorer.** Une version antérieure proposait de calculer
> l'indicateur du Dashboard à partir des seuls `manualTestResults` et d'un compteur de révision
> global, pour supprimer entièrement l'import du catalogue. **C'est impossible** :
> `hasPendingManualTests` délègue à `pendingManualTests`, qui **itère la liste des tests du
> catalogue** pour détecter un test jamais joué. « Il existe un test jamais joué » n'est pas
> dérivable des seuls résultats — il faut la liste des `id` et `revision`, c'est-à-dire exactement
> `manualTestsIndex`. La scission est la seule option qui tienne.

- Scinder en deux modules, sans duplication de données et **sans étape de génération** :
  - `manualTestsIndex.ts` : `id`, `revision`, `title`, `category`, `docRefs` — importé par le
    Dashboard et par `manualTestRules`.
  - `manualTestsSteps.ts` : `Record<id, string[]>` — importé par `E121ManualTests` seul.
  - `manualTestsCatalog.ts` conservé comme point d'entrée composant les deux, pour ne casser ni les
    imports existants ni les tests.
- **Contrainte du projet** : la règle « tests à faire pour Marie uniquement dans l'appli » impose
  que l'ajout d'un test reste une édition manuelle simple. La scission met l'`id` à deux endroits.
  *Si ce coût est jugé supérieur au gain de 14 kB, abandonner la phase et le noter ici* — décision
  à prendre en ouverture de phase, pas à subir.

**Tests — avant**

- Figer le comportement de l'indicateur : `src/ui/screens/dashboard/E10Dashboard.test.tsx` contient
  déjà les cas (catalogue tout validé / une révision en attente). Les conserver **inchangés** — ils
  constituent le test avant/après de cette phase.
- Ajouter un test d'intégrité : chaque `id` de `manualTestsIndex` a une entrée dans
  `manualTestsSteps` et réciproquement.

**Tests — après**

- Test d'intégrité vert.
- `E10Dashboard.test.tsx` et `E121ManualTests.test.tsx` verts **sans modification**.
- `npm run bundle:analyse` : `manualTestsSteps` absent du chunk d'entrée.
- `npm run bundle:check` avec seuil resserré à **410 kB**.

**Critère de sortie** : gain confirmé par la mesure, ou phase explicitement abandonnée et motivée
ici.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 4 — Garde-fou permanent et documentation [FAIT]

- Verrouiller `bundle.budget.json` sur la mesure finale plus 10 % de marge.
- Intégrer le contrôle de budget à `.claude/commands/deploy.md`. **Trois contraintes vérifiées le
  2026-08-31, à respecter sous peine d'une intégration non fonctionnelle :**
  1. L'étape 5 de `/deploy` builde avec
     `npx tsc -b && VITE_APP_VERSION=<version> npx vite build --outDir dist/<version>` et
     **n'appelle jamais `npm run build`**. Le contrôle doit donc s'exécuter **sur
     `dist/<version>` déjà produit, sans rebuild** — d'où l'argument de dossier spécifié en
     Phase 0. Brancher `npm run bundle:check` tel quel provoquerait un second build complet,
     vers le mauvais dossier (`dist/v5.1`).
  2. Le frontmatter `allowed-tools` de `deploy.md` n'autorise ni `npm run build` ni `node`. Il
     faut y **ajouter l'invocation du script** (`Bash(node scripts/check_bundle_budget.mjs:*)`),
     sinon la commande échouera au moment de l'exécution.
  3. L'étape 5 **gère déjà** l'avertissement de taille de chunk « > 500 kB », de façon **non
     bloquante**, reporté à l'étape 9. Il faut réécrire cette phrase : garder deux mécanismes
     divergents (un avertissement informatif périmé + un gate bloquant) est une source de
     confusion garantie, et le chiffre « 500 kB » y devient un seuil mort.
- Abaisser `build.chunkSizeWarningLimit` à la valeur atteinte plutôt que de la relever : un
  avertissement doit signaler une régression, pas devenir du bruit permanent.
- Corriger `build.outDir: 'dist/v5.1'` dans `vite.config.ts` (codé en dur, périmé) ou documenter
  explicitement que `npm run build` ne doit pas servir de référence de mesure.
- Consigner dans `_contexte/contexte.md` : l'abandon de `@supabase/supabase-js` côté navigateur, le
  plancher structurel (`react-dom` + `dexie` ≈ 280 kB) et la règle « tout nouvel écran est chargé
  en différé ».
- Ajouter au catalogue in-app un parcours de test pour Marie couvrant la navigation entre écrans
  après découpage (aucun écran ne doit rester bloqué sur « Chargement... »), conformément à la
  règle « tests à faire pour Marie uniquement dans l'appli ».

**Tests — après**

- `npm run bundle:check` vert et branché dans `/deploy`.
- `npm test`, `npm run lint`, `npm run build`, `npm run test:e2e` verts.

**Critère de sortie** : une régression de taille de bundle est détectée automatiquement.

### Résultats mesurés (2026-09-01)

**Écart avec le plan.** Le point de transparence laissé ouvert en fin de Phase 2 (le chunk
`AppContext.tsx`, chargé via `<link rel="modulepreload">`, échappait à la mesure de
`check_bundle_budget.mjs`) a été traité par la première option proposée — **élargir la mesure**,
plutôt que la documenter comme simple limite : le script lit désormais aussi les balises
`modulepreload` de `index.html` et somme leurs octets à ceux du chunk d'entrée. Un garde-fou qui ne
couvre pas 38 % du poids réel au démarrage (150.38 kB sur 392.59 kB) n'aurait pas rempli son rôle.

**Livré**

- `scripts/check_bundle_budget.mjs` : parse les `<link rel="modulepreload">` de `index.html` en plus
  du `<script type="module">` d'entrée ; nouveaux contrôles `totalEntryBytes` / `totalGzipBytes`
  (entrée + preload), rétrocompatibles (ignorés si absents de `bundle.budget.json`) ; sortie `--json`
  enrichie (`preloadFiles`, `totalBytes`, `totalGzipBytes`).
- `bundle.budget.json` : `limits` verrouillé sur la mesure finale + 10 % de marge de bruit de build
  (`entryBytes` 266 428 o, `gzipBytes` 81 568 o, `totalEntryBytes` 431 790 o, `totalGzipBytes`
  131 317 o) ; `cible` réécrite avec les chiffres finaux au lieu de l'estimation initiale à 450 kB.
- `vite.config.ts` : `build.chunkSizeWarningLimit` abaissé à `260` (défaut Vite : 500) — la valeur
  atteinte, avec une petite marge, plutôt qu'un plafond générique qui ne dirait plus rien.
  `build.outDir` corrigé de `dist/v5.1` (build versionné réel, écrasé silencieusement à chaque
  `npm run build`) vers `dist/dev`, dossier scratch déjà conventionnel dans ce dépôt et sans risque
  d'écrasement.
- `.claude/commands/deploy.md` : `Bash(node scripts/check_bundle_budget.mjs:*)` ajouté aux
  `allowed-tools` ; étape 6 exécute désormais `node scripts/check_bundle_budget.mjs dist/<version>`
  sur le build déjà produit à l'étape 5 (pas de rebuild, pas de dérive vers `dist/v5.1`), code 1
  bloquant. L'ancien mécanisme non bloquant de l'étape 5 (« avertissement > 500 kB à noter pour le
  rapport ») retiré — un seul mécanisme de contrôle de taille, celui-ci bloquant ; étapes 9 et 13
  mises à jour en conséquence.
- `_contexte/contexte.md` (section « Stack / contraintes techniques ») : consigné l'abandon de
  `@supabase/supabase-js` côté navigateur, le plancher structurel `react-dom` + `dexie` ≈ 280 kB, et
  la règle durable « tout nouvel écran de `AppScreens` est chargé en différé ».
- `src/domain/data/manualTestsCatalog.ts` : parcours `navigation-entre-tous-les-ecrans` ajouté
  (catégorie « Paramètres / Profil », hors Doc) — navigation entre écrans différés, aucun blocage sur
  « Chargement... » attendu, avec parade (fermer/rouvrir l'appli) si le cas se présentait malgré tout.

**Tests — après**

| Contrôle | Résultat |
|---|---|
| `npm test` | **682/682 verts**, 84 fichiers (inchangé — nouvelle entrée de catalogue, pas un nouveau cas de test) |
| `npm run lint` | vert |
| `npx tsc -b` | vert |
| `npm run build` (défaut, sans `--outDir`) | écrit dans `dist/dev` (plus `dist/v5.1`), aucun avertissement de taille de chunk (243.01 kB < 260 kB) |
| `npm run bundle:check` | vert — chunk d'entrée 243.01 kB / seuil 266.43 kB ; total démarrage (+ preload) 393.34 kB / seuil 431.79 kB |
| `npm run test:e2e` | **57/57 verts** (35.2 s) |

**Critère de sortie atteint** : une régression du chunk d'entrée **et** du chunk `AppContext.tsx`
préchargé est désormais détectée automatiquement, en local (`bundle:check`) comme dans `/deploy`
(étape 6, bloquant).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Hors périmètre (assumé)

- `react-dom` (185 kB) et `dexie` (93 kB) : socle de l'application, non négociable ici.
- Preact ou remplacement de Dexie : changement de socle, disproportionné pour un objectif de taille.
- `build.outDir: 'dist/v5.1'` codé en dur dans `vite.config.ts` alors que la version courante est
  v5.69 : sans effet sur la **taille** du bundle, donc hors périmètre de l'objectif.
  **Mais cette anomalie cassait le harnais de la Phase 0** (`npm run build` écrivait dans
  `dist/v5.1`, parmi 23 dossiers de build). Traitée comme contrainte de conception du script
  (Phase 0), puis **corrigée en Phase 4** : `outDir` pointe désormais vers `dist/dev`.
