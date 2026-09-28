# Roadmap — Retours testeur (analyse du 2026-09-22)

Source : fil de discussion E122→E123→E124, device `103c9b92-81ab-42f3-b141-e1c6869e3e84` (Marie),
19 retours déposés les 19-21/09/2026, listés par `python scripts/reply_feedback_report.py` (le
chiffre de 7 retours dans `_contexte/signals.md` était daté). Détail et captures récupérés via
`python scripts/read_feedback_reports.py --device-id 103c9b92... --output-dir scratchpad/`
(gitignoré, images jamais copiées ailleurs dans le dépôt).

Décisions actées avec l'utilisateur avant planification (2026-09-22) :
- Mode surcharge (#245fa5d3) : lever le masquage du bloc Outils, actuellement volontaire dans le code.
- Les 6 demandes de fonctionnalités nouvelles/refontes UI significatives : toutes incluses dans
  cette roadmap (pas de report à une roadmap séparée).
- Outil « Routine » (#229113cc) : sorti de cette roadmap, chantier séparé (déjà annoncé
  « bientôt disponible » dans le menu Ajouter, spec fournie par Marie à plusieurs jours de dev).

## Retours analysés

| id | écran | constat | traitement |
| --- | --- | --- | --- |
| `34ba6474` | E10 | Sous-tâches saisies à la création d'une tâche récurrente : ajoutées uniquement à l'occurrence racine (`E21CreateTaskV2.tsx:179-194`, `usePlanningState.ts:158-168`) | Phase 1 |
| `4e3042e1` | E21 | Tâche récurrente configurée mardi+vendredi planifiée tous les jours — domaine (`taskRecurrenceRules.ts`) et câblage UI relus sans anomalie trouvée, déjà couvert par des tests (`weekdays: [1,3,5]`) ; root cause non confirmée par simple lecture | Phase 1 — reproduction avant correctif |
| `47db30e8` | E21/E22 | Champ « Icône » affiche la valeur brute (`meal`) au lieu de l'icône rendue (`E22TaskDetail.tsx:581-589`) | Phase 2 |
| `7e1383fe` | E21/E22 | Champ « Couleur » affiche le hex brut (`#ee719e`) au lieu de la catégorie + pastille (`E22TaskDetail.tsx:591-599`) | Phase 2 |
| `909b8a67` | E22 | Durée non enregistrée à la création (0 min affiché), seule une modification manuelle la sauvegarde | Phase 2 |
| `2c3af15b` | E22 | « Obligatoire » déjà présent sur cet écran (probablement non vu par Marie) ; l'accès à la récurrence, lui, est réellement absent | Phase 2 |
| `a89bf7a0` | E21 | « Annuler » hardcodé vers `goTo('inbox')` (Réception) au lieu de suivre l'origine comme « Retour » (`E21CreateTaskV2.tsx:410` vs `159-161`) | Phase 3 |
| `1f202a5e` | E123 | Après envoi d'un retour, `goTo('feedback-list')` empile un doublon d'écran au lieu de `replace()` → « Retour » dépile vers « Nouveau retour » (`E122FeedbackCapture.tsx:122`) | Phase 3 |
| `9a8f67a9` | E123 | Bouton « Nouveau retour » à remonter en haut de la page | Phase 3 |
| `245fa5d3` | E10 | Outils masqués en mode surcharge — intentionnel dans le code (`E10Dashboard.tsx:123`) ; décision : lever le masquage | Phase 4 |
| `37f9f912` | E10 | Colonne « nombre de sous-tâches » mal alignée quand pas d'énergie affichée | Phase 4 |
| `cd7529b6` | E10 | Coche automatique de la tâche parente quand toutes les sous-tâches sont cochées | Phase 4 |
| `8573bf55` | E10 | Logo d'énergie totale planifiée par jour (nouvelle fonctionnalité d'affichage) | Phase 4 |
| `6f90c375` | E10 | Bandeau des jours façon carrousel centré fixe (refonte du sélecteur de date) | Phase 5 |
| `ed6ab7df` | E31 | Jauge d'énergie affichée systématiquement à l'ouverture + logique dynamique de déclenchement du mode surcharge | Phase 6 |
| `9d73bbdc` | E12 | Planning semaine : noms de tâches + couleur + agrandissement | Phase 7 |
| `a1317d93` | E77 | Sous-catégories de livret avec somme roulante dans le total | Phase 8 |
| `229113cc` | E10 | Outil « Routine » — spec complète, déjà « bientôt disponible » | Hors roadmap — chantier séparé |
| `58787b8f` | E10 | Badge « Powered by Netlify » visible partout | Hors code — paramètre du compte Netlify migré le 2026-09-21, à vérifier manuellement (Project configuration > General du nouveau compte) |

---

## Phase 1 — Tâches récurrentes : sous-tâches non dupliquées + bug de génération d'occurrences [FAIT]

**Constat**
- `34ba6474` : `E21CreateTaskV2.tsx:179-194` (`createFullTask`) crée la tâche via `createDetailedTask`
  (qui matérialise les occurrences futures sans sous-tâches, `usePlanningState.ts:134-168`) puis
  boucle `addSubTask(taskId, ...)` uniquement sur l'id de la tâche racine retourné. Les occurrences
  matérialisées pour les jours suivants n'ont donc jamais les sous-tâches saisies à la création.
- `4e3042e1` : comportement rapporté (récurrence mardi+vendredi planifiée tous les jours) non
  reproduit par simple lecture de `taskRecurrenceRules.ts` (`matchesFrequency` cas `weekly`) ni de
  `RecurrenceEditor.tsx`/`usePlanningState.ts` — logique et câblage semblent corrects, couverts par
  `taskRecurrenceRules.test.ts` (weekdays `[1,3,5]`, `[1]`). Avant tout correctif : écrire un test
  de reproduction avec les paramètres exacts du retour (weekly, interval 1, weekdays mardi+vendredi,
  end_type never) pour confirmer si le bug est dans le domaine, dans le câblage UI→domaine, ou déjà
  résolu/non reproductible (auquel cas le signaler comme tel dans la réponse à Marie, sans deviner).

**Fichiers pressentis** : `src/app/contexts/usePlanningState.ts` (`createDetailedTask`,
`addSubTask`), `src/ui/screens/tasks/E21CreateTaskV2.tsx` (`createFullTask`),
`src/domain/rules/taskRecurrenceRules.ts`, `src/domain/rules/taskRecurrenceRules.test.ts`.

**Tests** : test de reproduction pour `4e3042e1` (weekdays mardi+vendredi) dans
`taskRecurrenceRules.test.ts` ; couverture de la duplication de sous-tâches sur occurrences
matérialisées dans un test de `usePlanningState`/`E21CreateTaskV2.test.tsx`.

**Critère de sortie** : les deux points corrigés (ou `4e3042e1` explicitement non reproductible,
documenté ici avec la preuve), suite verte, `tsc -b` + lint clean.

**Réalisé (2026-09-22)** :
- `4e3042e1` reproduit puis corrigé : root cause trouvée dans `usePlanningState.ts`
  (`createDetailedTask`) — la tâche racine était planifiée à `input.date` (date de création)
  inconditionnellement, même quand ce jour ne fait pas partie du motif hebdomadaire choisi. La
  logique de génération d'occurrences elle-même (`taskRecurrenceRules.ts`) était correcte et déjà
  testée. Correctif : la date racine devient la première date de `generateOccurrenceDates` (celle-ci
  exclut déjà les jours hors motif), au lieu de forcer `input.date`. Test de reproduction ajouté
  (`AppContext.test.tsx`, ancre lundi hors motif mardi/vendredi) — échouait avant correctif,
  passe après.
- `34ba6474` corrigé : `createDetailedTask` accepte désormais `subTaskTitles` et crée les
  sous-tâches pour la tâche racine **et** toutes les occurrences matérialisées dans le même lot
  persisté (`persistSeriesBatch`), au lieu que `E21CreateTaskV2.tsx` les ajoute après coup
  uniquement sur l'id racine retourné. Test de reproduction ajouté (`AppContext.test.tsx`, série
  quotidienne avec 2 sous-tâches, vérifie leur présence sur 2 jours distincts).
- Suite complète 888/888 (dont 1 test existant adapté au nouveau contrat `subTaskTitles`,
  remplaçant l'ancien test sur `addSubTask` post-création), `tsc -b` + `eslint` clean.
- Reste dû, hors code : déploiement et vérification par Marie sur sa prochaine tâche récurrente.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 2 — Écran détail de tâche (E22) : affichage brut, durée, récurrence [FAIT]

**Constat**
- `47db30e8`/`7e1383fe` : `TaskFieldCard label="Icône" value={task.icon ?? 'Aucune'}` et
  `label="Couleur" value={task.color ?? 'Aucune couleur'}` (`E22TaskDetail.tsx:581-599`) affichent
  la donnée brute au lieu d'un rendu résolu (icône graphique, nom de catégorie via `taskCategories`
  + pastille de couleur).
- `909b8a67` : à confirmer précisément dans `taskRules.ts` (`scheduleTaskRule`) — la durée semble ne
  pas être persistée séparément à la création, seule `saveTime()` (E22, modification manuelle) la
  sauvegarde explicitement via `updateTaskFields`.
- `2c3af15b` : « Obligatoire » déjà présent (`E22TaskDetail.tsx:658-667`) — aucune action requise sur
  ce point, à mentionner tel quel dans la réponse à Marie. La récurrence, elle, n'a aucun
  `TaskFieldCard` sur cet écran ; l'ajouter suit le pattern déjà en place (`requiresScopeChoice`,
  modale « cette occurrence / toutes les occurrences », `pendingFieldEdit`).

**Fichiers pressentis** : `src/ui/screens/tasks/E22TaskDetail.tsx`, `src/domain/rules/taskRules.ts`,
`src/ui/components/TaskCardLayout.tsx`, `src/ui/components/RecurrenceEditor.tsx` (réutilisation
possible côté E22).

**Tests** : `E22TaskDetail.test.tsx` — rendu résolu icône/couleur, persistance de la durée à la
création, présence et fonctionnement du champ récurrence (scope occurrence/série).

**Critère de sortie** : les 3 points corrigés, suite verte, `tsc -b` + lint clean.

**Réalisé (2026-09-22)** :
- `47db30e8`/`7e1383fe` : `TaskFieldCard` accepte un `ReactNode` en valeur (déjà le cas). Ajout de deux
  composants de rendu partagés (`IconFieldValue`, `ColorFieldValue` dans `TaskCardLayout.tsx`) qui
  résolvent l'icône en pictogramme + libellé français et la couleur en pastille + nom de catégorie
  (repli sur le hex si aucune catégorie ne correspond). Corrigé sur E22 **et** sur E21 (même bug,
  même composant `TaskFieldCard`, retours déposés depuis l'écran E21 d'après le détail du fil).
- `909b8a67` : root cause trouvée dans `taskRules.ts` (`scheduleTask`) — la durée n'était jamais
  déduite du créneau lors de la planification, seule une modification manuelle via `updateTaskFields`
  la renseignait. `scheduleTask` calcule maintenant `duration_minutes` à partir de l'écart
  début/fin, ce qui corrige la création (E21) et la planification d'une sous-étape (E22/E23) en un
  seul endroit.
- `2c3af15b` : confirmé que « Obligatoire » existe déjà sur E22 (à mentionner tel quel à Marie).
  Ajout d'un champ « Récurrence » sur E22, suivant le pattern des autres champs : une tâche sans
  récurrence propose de cocher « Tâche récurrente » puis d'en définir le motif ; une tâche déjà
  récurrente propose directement l'éditeur pour modifier son motif. Dans les deux cas, la tâche
  affichée garde sa propre date : seules les occurrences futures (hors occurrences déjà détachées)
  sont régénérées selon la nouvelle règle. Nouvelle fonction `setTaskRecurrence` dans
  `usePlanningState.ts`, appuyée sur une extension de `persistSeriesBatch` (`recurrenceToUpdate`)
  pour réécrire la règle dans la même transaction que la régénération des occurrences.
- Suite complète 908/908, `tsc -b` + `eslint` clean.
- Reste dû, hors code : déploiement et vérification par Marie.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 3 — Navigation : Annuler, double-stack retour, bouton Nouveau retour [FAIT]

**Constat**
- `a89bf7a0` : bouton « Annuler » (`E21CreateTaskV2.tsx:410-412`) appelle `goTo('inbox')` en dur,
  contrairement au bouton « Retour » juste au-dessus qui fait `back('inbox')` (suit l'origine réelle
  de navigation, `returnToOrigin`, ligne 159-161).
- `1f202a5e` : après envoi d'un retour, `E122FeedbackCapture.tsx:122` fait `goTo('feedback-list')`
  (empile) au lieu de `replace('feedback-list')` — le stack contient alors deux fois E123, et
  « Retour » dépile vers E122 (Nouveau retour) au lieu de l'écran d'origine.
- `9a8f67a9` : bouton « Nouveau retour » (`E123FeedbackList.tsx:120`) en bas de page, à remonter
  au-dessus de la liste des retours.

**Fichiers pressentis** : `src/ui/screens/tasks/E21CreateTaskV2.tsx`,
`src/ui/screens/feedback/E122FeedbackCapture.tsx`, `src/ui/screens/feedback/E123FeedbackList.tsx`,
`src/app/AppContext.tsx` (`back`/`goTo`/`replace`, vérification du comportement attendu).

**Tests** : `E21CreateTaskV2.test.tsx` (Annuler suit l'origine), test de navigation couvrant le
scénario Nouveau retour → envoi → Retour (pas de double-stack), `E123FeedbackList.test.tsx`
(position du bouton).

**Critère de sortie** : les 3 points corrigés, suite verte, `tsc -b` + lint clean.

**Réalisé (2026-09-23)** :
- `a89bf7a0` : « Annuler » suit désormais l'origine réelle de navigation, exactement comme le fait
  « Retour » juste au-dessus (même fonction `returnToOrigin`), au lieu d'être figé sur Réception.
- `1f202a5e` : après l'envoi d'un retour, l'écran « Mes retours » remplace l'écran d'envoi dans la
  pile de navigation au lieu de s'empiler par-dessus — « Retour » ne repasse plus par la page
  « Nouveau retour ».
- `9a8f67a9` : le bouton « Nouveau retour » est remonté juste sous le titre de la page, au-dessus de
  la liste des retours.
- Suite complète 910/910, `tsc -b` + `eslint` clean.
- Reste dû, hors code : déploiement et vérification par Marie.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 4 — Dashboard (E10) : mode surcharge, alignement, coche auto, logo énergie [FAIT]

**Constat**
- `245fa5d3` : `{!overloadMode && <section aria-label="Outils">...}` (`E10Dashboard.tsx:123-124`) —
  décision actée : lever cette condition, le bloc Outils reste visible en mode surcharge.
- `37f9f912` : alignement de la colonne « nombre de sous-tâches » à corriger dans le rendu du
  planning (composant à identifier, probablement `PlanningBoard.tsx`).
- `cd7529b6` : cocher automatiquement la tâche parente quand toutes ses sous-tâches sont cochées —
  logique à ajouter côté `toggleSubTask`/`toggleTaskCompletionRule`.
- `8573bf55` : nouveau logo affichant l'énergie totale planifiée du jour sélectionné (tâches faites
  et non faites), mis à jour au changement de jour — nouvel élément d'affichage sur `E10Dashboard.tsx`.

**Fichiers pressentis** : `src/ui/screens/dashboard/E10Dashboard.tsx`,
`src/ui/screens/dashboard/PlanningBoard.tsx`, `src/app/contexts/useTasksState.ts`
(`toggleSubTask`/`toggleTaskCompletionRule`), `src/domain/rules/energyRules.ts` (calcul d'énergie
planifiée totale, à réutiliser si existant).

**Tests** : `E10Dashboard.test.tsx`, `PlanningBoard.test.tsx`, tests de règle pour la coche auto et
le calcul d'énergie totale planifiée.

**Critère de sortie** : les 4 points corrigés, suite verte, `tsc -b` + lint clean.

**Réalisé (2026-09-23)** :
- `245fa5d3` : le bloc Outils n'est plus masqué en mode surcharge, condition retirée.
- `37f9f912` : la colonne énergie de chaque ligne du planning réserve désormais toujours sa largeur,
  même sans coût affiché — le compteur de sous-étapes qui la précède garde donc la même position
  d'une ligne à l'autre.
- `cd7529b6` : `toggleSubTask` coche désormais automatiquement la tâche parente dès que toutes ses
  sous-tâches sont cochées (sens unique : cocher une sous-tâche peut compléter le parent, décocher
  ne le rouvre pas — non demandé).
- `8573bf55` : nouveau logo dans le bandeau du planning affichant l'énergie totale planifiée du jour
  affiché (tâches faites et non faites) ; recalculé automatiquement à chaque changement de jour,
  car porté par le même composant que le sélecteur de date (`PlanningBoard.tsx`) plutôt que par
  `E10Dashboard.tsx` qui n'a pas connaissance du jour affiché.
- Suite complète 919/919, `tsc -b` + `eslint` clean.
- Reste dû, hors code : déploiement et vérification par Marie.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 5 — Bandeau des jours : carrousel centré fixe (E10) [FAIT]

**Constat** : le bandeau actuel déplace la case blanche (sélection) sur le jour cliqué ; Marie veut
l'inverse — la case centrale reste fixe au milieu, on fait défiler les jours à l'intérieur du
bandeau. Refonte du composant de sélection de date (probablement dans `E10Dashboard.tsx` ou un
sous-composant dédié à identifier).

**Fichiers pressentis** : `src/ui/screens/dashboard/E10Dashboard.tsx` et son composant de sélection
de jour (à localiser précisément en phase).

**Tests** : tests du nouveau composant (défilement, jour central toujours affiché, sélection).

**Critère de sortie** : comportement carrousel centré fonctionnel, suite verte, `tsc -b` + lint clean.

**Réalisé (2026-09-23)** :
- Root cause trouvée : la case sélectionnée (`isDisplayed`) suit `displayDate`, mise à jour au clic
  sur un jour du bandeau, alors que le centre topologique du bandeau suit `stripCenter`, qui ne
  bougeait que par glissement, bouton « Aujourd'hui » ou sélecteur mois/année — jamais par un clic
  direct sur un jour. D'où le symptôme : la case blanche se déplaçait vers le jour cliqué sans que
  le bandeau ne se recentre.
- Correctif : le clic sur un jour du bandeau recentre désormais le bandeau sur ce jour, au lieu de
  seulement changer le jour sélectionné — même mécanisme que le glissement, le bouton « Aujourd'hui »
  et le sélecteur mois/année, qui recentraient déjà correctement. La case sélectionnée reste ainsi
  toujours à la même position centrale, quel que soit le jour cliqué.
- Suite complète 921/921, `tsc -b` + `eslint` clean.
- Reste dû, hors code : déploiement et vérification par Marie.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 6 — Jauge d'énergie permanente à l'ouverture (E31) [FAIT]

**Constat** : Marie veut que l'écran « Mon énergie maintenant » (E31) s'affiche à chaque ouverture
de l'application (pas seulement à certains moments), avec un taux d'énergie qui varie au fil de la
journée selon les tâches restantes (hors tâches déjà faites), pouvant déclencher le mode surcharge
même pour une seule tâche coûteuse. Changement de logique produit sur le déclenchement actuel
(à documenter précisément en phase — logique actuelle du mode surcharge dans
`src/domain/rules/energyRules.ts`).

**Fichiers pressentis** : `src/domain/rules/energyRules.ts`, `src/ui/screens/energy/E31*.tsx`,
`src/app/AppContext.tsx` (déclenchement à l'ouverture).

**Tests** : `energyRules.test.ts` (nouvelle logique de calcul dynamique), test d'affichage
systématique à l'ouverture.

**Critère de sortie** : comportement conforme à la demande, suite verte, `tsc -b` + lint clean.

**Décisions actées avec l'utilisateur avant codage (2026-09-23)** :
- L'affichage systématique de E31 doit aussi se déclencher au retour au premier plan de l'application
  (pas seulement au lancement initial), pas seulement quand l'app redémarre complètement.
- Ce comportement passe par un réglage dans Paramètres > Accessibilité (un seul interrupteur), pas
  un comportement imposé à tous les utilisateurs.
- Ce réglage est désactivé par défaut, y compris pour Marie : elle doit l'activer elle-même.

**Réalisé (2026-09-23)** :
- Nouveau réglage « Afficher mon énergie à chaque connexion » dans Paramètres > Accessibilité,
  désactivé par défaut. Activé, l'écran E31 s'affiche au lancement de l'application et à chaque
  retour au premier plan, même si l'énergie du jour est déjà renseignée. Désactivé (comportement par
  défaut), rien ne change : E31 ne s'affiche qu'au lancement, et seulement si pas encore renseigné
  aujourd'hui.
- Vérifié que le taux d'énergie restant et le déclenchement du mode surcharge fonctionnaient déjà
  comme demandé : le coût pris en compte exclut déjà les tâches terminées, recalculé en direct après
  chaque changement de planning, et la surcharge se déclenche déjà même pour une seule tâche coûteuse
  (pas de seuil sur le nombre de tâches) — déjà couvert par un test existant, aucun changement de
  logique nécessaire sur ce point.
- Suite complète 925/925, `tsc -b` + `eslint` clean.
- Reste dû, hors code : déploiement et vérification par Marie.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 7 — Planning de la semaine : noms de tâches, couleur, agrandissement (E12) [FAIT]

**Constat** : remplacer les logos par le nom des tâches, reprendre la couleur de la tâche pour la
case, agrandir le planning pour occuper toute la page. Refonte de layout de
`E12WeekPlanning.tsx`.

**Fichiers pressentis** : `src/ui/screens/dashboard/E12WeekPlanning.tsx`.

**Tests** : `E12WeekPlanning.test.tsx` (affichage nom + couleur), vérification visuelle en dev.

**Critère de sortie** : layout conforme, suite verte, `tsc -b` + lint clean.

**Réalisé (2026-09-23)** :
- Chaque case de tâche affiche désormais son nom complet (au lieu du pictogramme illisible), avec
  retour à la ligne aux espaces pour rester lisible même sur les noms longs.
- La case reprend la couleur choisie pour la tâche (fond teinté) ; une tâche sans couleur garde un
  fond neutre avec contour, comme avant.
- Le cadre du planning remplit désormais toute la hauteur disponible de la page, jusqu'à la barre
  de navigation, au lieu de laisser un vide en dessous. Il utilise aussi toute la largeur de
  l'écran plutôt qu'une largeur fixe centrée.
- Vérifié visuellement dans un navigateur (mobile et large écran) avec des tâches réelles, dont une
  colorée et une au nom long : rendu conforme, plus de coupure de mot illisible.
- Suite complète 927/927, `tsc -b` + `eslint` clean.
- Reste dû, hors code : déploiement et vérification par Marie.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 8 — Livret : sous-catégories avec somme roulante (E77) [FAIT]

**Constat** : permettre d'ajouter des catégories à l'intérieur d'un livret, chaque catégorie
totalisant ses propres mouvements et contribuant au total du livret ; conserver la possibilité
d'un mouvement hors catégorie compté seulement dans le total. Nouvelle fonctionnalité budget,
modèle de données à étendre (entité catégorie de livret, lien mouvement→catégorie).

**Fichiers pressentis** : `src/ui/screens/budget/E77*.tsx`, entités et règles budget
(`src/domain/entities/`, `src/domain/rules/` — fichiers exacts à identifier en phase).

**Tests** : couverture des règles de calcul (total livret = somme catégories + mouvements hors
catégorie), tests d'écran E77.

**Critère de sortie** : fonctionnalité livrée, suite verte, `tsc -b` + lint clean.

**Réalisé (2026-09-23)** :
- Nouvelle entité « sous-catégorie de livret » (nom, position, rattachée à un livret) et nouveau
  champ optionnel de catégorie sur chaque mouvement (dépôt/retrait) ; un mouvement sans catégorie
  reste « hors catégorie », compté uniquement dans le total du livret, comme demandé.
- Écran du livret (E77) : nouvelle section « Catégories » listant chaque sous-catégorie avec son
  propre sous-total (somme de ses mouvements) ; création, renommage et suppression directement
  depuis cet écran.
- Les mouvements sont désormais regroupés par sous-catégorie dans la liste, avec un groupe
  « Hors catégorie » séparé ; le solde en tête de page reste la somme de tous les mouvements,
  catégorisés ou non.
- Supprimer une sous-catégorie qui a des mouvements demande confirmation ; les mouvements sont
  alors détachés (repassent hors catégorie) plutôt que supprimés, pour ne jamais perdre
  d'historique financier. Supprimer un livret supprime aussi ses sous-catégories.
- Le formulaire d'ajout/modification d'un mouvement propose un sélecteur de catégorie (« Hors
  catégorie » par défaut) uniquement quand le livret a au moins une sous-catégorie, pour ne pas
  alourdir l'écran des livrets qui n'en ont pas.
- Sous-catégories incluses dans l'export/import de données et la sauvegarde automatique, au même
  titre que le reste des données budget (version d'export 3.6 → 3.7).
- Vérifié visuellement dans un navigateur : création d'une sous-catégorie, mouvement catégorisé et
  mouvement hors catégorie, sous-total et solde corrects, suppression de catégorie avec
  confirmation et mouvement bien détaché (pas supprimé).
- Suite complète 940/940, `tsc -b` + `eslint` clean.
- Reste dû, hors code : déploiement et vérification par Marie.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.
