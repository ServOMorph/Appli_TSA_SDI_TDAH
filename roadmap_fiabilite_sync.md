# Roadmap — Fiabilité de la synchronisation (gardes défensives)

Origine : incident v5.124 du 2026-09-13, Marie signale « j'ai plus mes données ». Diagnostic
(code) : aucune perte réelle — deux installations distinctes sur son téléphone, dont une vide.
Mais le diagnostic a révélé des défauts structurels qui auraient pu transformer cet incident en
perte réelle, et peuvent la causer dans un cas futur. Périmètre retenu (décision explicite du
2026-09-13) : gardes défensives ciblées, aucun nouveau RPC serveur, aucune nouvelle UI de
restauration.

Contexte technique complet : `COMMUNICATION/Marie/historique_conversation_marie.md`
§ 2026-09-12/13 (incident v5.124).

## Phase 1 — Garde serveur anti-écrasement d'un snapshot par un payload vide [FAIT]

**Problème.** `sync_device_snapshot` (`supabase/schema.sql`) accepte et écrase sans condition
tout nouveau payload pour un `device_id` donné. Un client qui pousse un payload vide (base locale
neuve après suppression d'app, réinstallation, ou un futur `wipeAllData`) écrase silencieusement
la dernière sauvegarde non vide du même appareil — seule copie serveur des données de
l'utilisateur.

**Correctif.** Durcir la fonction SQL existante : refuser la mise à jour (retourner `false` sans
écrire, comme un échec silencieux ordinaire déjà géré par `syncClient.ts`) si le nouveau payload
est vide (`tasks`, `list_items`, `budget_entries` tous à 0 élément) alors que le payload existant
en base ne l'est pas. Ne touche pas à l'insertion initiale (payload vide accepté si aucune ligne
n'existe encore pour ce `device_id`).

**Application.** Modification SQL à appliquer manuellement dans le SQL Editor Supabase (pas de
migration automatisée dans ce projet — même pattern que le `GRANT` en attente sur
`feedback_reports`, tracé [P2] `signals.md`).

**Gate.** Comportement critique côté serveur, aucune suite de tests SQL dans ce dépôt : gate =
script Python ad hoc (scratch, non committé) avec un `device_id` de test fictif (clé anon, comme
l'app réelle — le RPC n'a de grant `EXECUTE` que pour `anon`). **Vérifié en conditions réelles le
2026-09-13**, 4 cas : insertion initiale vide (accepté), vide→vide (accepté), non-vide écrase vide
(accepté), vide tente d'écraser non-vide (bloqué, `payload` inchangé en base). Ligne de test
laissée en base (`service_role` n'a pas de `GRANT DELETE` sur `device_snapshots` — même
limitation que `feedback_reports` [P2] `signals.md`) ; aucune donnée réelle, nettoyage manuel
proposé à l'utilisateur.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 2 — Erreur d'initialisation visible côté client [FAIT]

**Problème.** `AppContext.tsx` (`useEffect` d'init) : le `catch` se limite à
`console.error(...)`, invisible pour l'utilisateur. Toute erreur pendant l'init (ouverture
IndexedDB, migration Dexie, quota dépassé) laisse le stack de navigation sur `welcome` — l'écran
d'un compte neuf. Un utilisateur avec un problème technique voit l'onboarding et croit avoir tout
perdu, alors que sa base locale est intacte mais inaccessible à cet instant. C'est l'hypothèse la
plus probable derrière le ressenti de Marie sur Safari.

**Correctif.** Distinguer explicitement le cas « aucun utilisateur trouvé » (compte neuf,
comportement actuel correct) du cas « erreur levée pendant l'init » (nouvel écran ou état dédié,
ex. `init-error`, avec un bouton réessayer). Ne jamais présenter l'onboarding suite à une
exception.

**Tests.** Vitest : mock de `userRepo.getFirst` (ou d'une étape suivante de `init()`) qui rejette
→ vérifier que le stack de navigation n'est pas `welcome` mais l'écran d'erreur dédié. Cas
nominal (aucun utilisateur, pas d'exception) inchangé, testé en non-régression.

**Fait le 2026-09-13.** Nouvel écran racine `init-error` (`Route`/`Screen` dans `navigation.ts`,
composant `src/ui/screens/system/InitError.tsx`, import statique dans `App.tsx` — pas de lazy
loading, pour ne pas dépendre d'un chunk supplémentaire en cas d'échec précoce). Le `catch` de
l'`useEffect` d'init dans `AppContext.tsx` bascule désormais `setStack([{ name: 'init-error' }])`
en plus du `console.error` existant ; le cas « aucun utilisateur » (`if (user)` non déclenché)
reste inchangé sur `welcome`. Écran : message rassurant (données locales non perdues) + bouton
« Réessayer » qui recharge la page. Test Vitest ajouté (`AppContext.test.tsx`) : `userRepo.getFirst`
mocké en rejet → écran final `init-error`, pas `welcome`. Effet de bord découvert en testant :
`SCREEN_CODES` (`screenCodes.ts`, `Record<Route['name'], ScreenCode>`) et sa liste de test
(`screenCodes.test.ts`) sont un registre exhaustif des écrans navigables, non détecté par `tsc`
faute d'erreur de type sur l'objet littéral — complétés pour `init-error` (code `E00`). Suite
complète : 848/848 tests passent.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 3 — Filet de sécurité sur `wipeAllData` [FAIT]

**Problème, réévalué le 2026-09-13.** `AppContext.tsx` efface toute la base locale si un
utilisateur existe avec `onboarding_completed: false`. Vérifié : ce champ n'est écrit à `false`
qu'à la création du profil (`useSettingsState.ts`, `createUser`) et n'est jamais remis à `false`
ensuite — ce chemin ne peut donc se déclencher que sur un tout premier onboarding abandonné avant
le dashboard, jamais sur un compte établi. Risque réel aujourd'hui : quasi nul. Priorité basse,
défense en profondeur à faible coût plutôt qu'un correctif urgent.

**Correctif.** Avant d'appeler `wipeAllData()`, vérifier qu'aucune donnée significative n'existe
(`tasks`, `listItems`, `budgetEntries` tous vides). Si des données existent malgré
`onboarding_completed: false` (état incohérent, quelle qu'en soit la cause), compléter
l'onboarding silencieusement au lieu de tout effacer.

**Tests.** Vitest : onboarding incomplet + base vide → wipe inchangé. Onboarding incomplet +
données présentes → pas de wipe, `onboarding_completed` passe à `true`.

**Fait le 2026-09-13.** `AppContext.tsx` : dans le `useEffect` d'init, quand
`user.onboarding_completed` est `false`, une nouvelle fonction `hasSignificantData()` vérifie
`db.tasks`, `db.listItems`, `db.budgetEntries` (compte Dexie direct). Base vide → comportement
inchangé (`wipeAllData()`). Données présentes → l'utilisateur est mis à jour
(`onboarding_completed: true`, `userRepo.update`) et le flux continu normalement comme un
utilisateur avec onboarding déjà complété (chargement des données, navigation
dashboard/energy-checkin, sync). Deux tests Vitest ajoutés (`AppContext.test.tsx`), tous deux
isolés du reste de la suite par un nettoyage explicite de `db.users`/`db.energyEntries` en début
de test (plusieurs tests antérieurs du fichier laissent des utilisateurs et des entrées d'énergie
en base, non nettoyés par l'`afterEach` global — source d'ambiguïté sur `userRepo.getFirst()`,
qui retourne `toArray()[0]`, pas le dernier utilisateur créé). Suite complète : 850/850 tests
passent, `tsc --noEmit` propre.

Toutes les phases de la roadmap sont achevées. Archivage proposé à l'utilisateur.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Une fois cette phase achevée, proposer l'archivage de la roadmap
(accord explicite requis).
