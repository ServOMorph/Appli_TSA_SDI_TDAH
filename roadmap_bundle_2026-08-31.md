# Roadmap — Réduction du bundle JavaScript

Créée le 2026-08-31. Objectif : ramener le chunk JS initial sous le seuil d'alerte Vite
(500 kB) sans perte fonctionnelle, et empêcher toute régression future par un garde-fou
automatisé.

Légende : `[TODO]` · `[EN COURS]` · `[FAIT]`. Une seule phase `[EN COURS]` à la fois.
Gate commun à chaque phase : tests avant écrits · refacto · tests après verts ·
`npm test` + `npm run lint` + `npm run build` verts · mesure consignée dans cette roadmap.

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

## Décisions à trancher en ouverture de Phase 1

1. **Abandon de `@supabase/supabase-js` côté navigateur.** Conséquence assumée : perte du client
   typé et des fonctionnalités Supabase « gratuites » (auth, realtime) côté app. Si une
   authentification réelle est envisagée à moyen terme, ce retrait est à reconsidérer.
   *Recommandation : retirer.* `roadmap_sync_marie.md` ne prévoit aucune auth (décision actée du
   2026-08-15 : « pas d'écran de connexion »). Le script développeur
   `scripts/read_device_snapshots.py` est en Python et n'est pas concerné. Détail complet de
   l'impact sur les données de Marie : section « Ce que devient la synchronisation des données de
   Marie » ci-dessus.
2. **Seuil du garde-fou.** Proposition : 450 kB pour le chunk initial (marge de 50 kB sous le
   seuil Vite), à ajuster après la Phase 2.
3. **Écrans d'onboarding en chargement différé ou non.** Ils ne concernent qu'une première
   ouverture. *Recommandation : différés* (3.4 kB, gain marginal mais cohérence du découpage).

---

## Phase 0 — Harnais de mesure et baseline [TODO]

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

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 1 — Retrait de `@supabase/supabase-js` du navigateur [TODO]

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

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 2 — Chargement différé des écrans [TODO]

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

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 3 — Découpler le catalogue de tests manuels du démarrage [TODO]

> Gain estimé : −13 à −15 kB. Phase optionnelle : à ne lancer que si la Phase 2 laisse le chunk
> initial au-dessus de la cible, ou si le confort de maintenance le justifie.

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

## Phase 4 — Garde-fou permanent et documentation [TODO]

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

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Hors périmètre (assumé)

- `react-dom` (185 kB) et `dexie` (93 kB) : socle de l'application, non négociable ici.
- Preact ou remplacement de Dexie : changement de socle, disproportionné pour un objectif de taille.
- `build.outDir: 'dist/v5.1'` codé en dur dans `vite.config.ts` alors que la version courante est
  v5.69 : sans effet sur la **taille** du bundle, donc hors périmètre de l'objectif.
  **Mais cette anomalie casse le harnais de la Phase 0** (`npm run build` écrit dans `dist/v5.1`,
  parmi 23 dossiers de build). Elle est donc traitée comme contrainte de conception du script
  (Phase 0) et sa correction est proposée en Phase 4 — pas ignorée.
