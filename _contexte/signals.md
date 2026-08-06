# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-06)

## Questions ouvertes
- [P1] Continuer la Phase V5-2b (planning et tâches refondus) : M5 quasi close (reste le point 3.2 en validation manuelle tactile), reste M6 (audit E7), M7 (gate). — fait quand : phase codée, testée, validée manuellement, passée à `[FAIT]` — réf : `roadmap_v5.0.md` Phase V5-2b
- [P1] Valider manuellement le point 3.2 de `tests_manuels.md` (sous-tâches dépliables, tactile réel sur téléphone) — seul point encore en attente de M5. — fait quand : `tests_manuels.md` § 3.2 purgé — réf : `tests_manuels.md`
- [P1] Reproduire précisément le bug « suppression d'une tâche récurrente sans effet » (la boîte de dialogue cette-occurrence/toutes-les-occurrences s'affiche mais rien n'est supprimé) : non reproduit ni par lecture de code (`E22TaskDetail.handleDelete`/`confirmScope`, `usePlanningState.deleteTaskScoped`, `TaskRepository.deleteWithChildren`) ni par test automatisé Playwright rejouant le même scénario (suppression simple, suppression après édition, scope série). — fait quand : séquence exacte fournie ou erreur console relevée au moment du bug — réf : `tests_manuels.md`
- [P1] Reproduire précisément le bug « impossible d'ajouter une sous-tâche » depuis « Décomposer » sur une tâche existante récurrente : non reproduit ni par lecture de code (`E23Decompose.handleAdd`, `useTasksState.addSubTask`) ni par test automatisé Playwright. — fait quand : séquence exacte fournie ou erreur console relevée au moment du bug — réf : `tests_manuels.md`
- [P2] Communiquer à Marie les points de `a_communiquer_v5.md` **au moment de la livraison de la V5.0 complète** (pas avant), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `Archives/roadmap_v4.1.md` § Q à trancher
- [P2] Recueillir le retour utilisateur sur le rendu visuel réel du Budget (refonte de lisibilité, session 2026-07-25) — le Budget est rebranché tel quel comme outil en Phase V5-3, Marie ne l'a toujours pas vu. — fait quand : retour utilisateur recueilli — réf : `roadmap_v5.0.md` Phase V5-3, `E71Budget.tsx`
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold toujours visible dans l'onglet du navigateur (confirmé à nouveau via captures utilisateur cette session). — fait quand : titre corrigé — réf : `index.html`

## Dernière session (2026-08-06 — retours de tests manuels M5 traités, corrections UI planning, 2 bugs restent non reproduits)

## Décisions prises
- Toutes les corrections UI demandées suite aux tests manuels de `tests_manuels.md` traitées et validées (tests + build) : contour parasite des lignes du planning retiré, nom du mois affiché en permanence et rendu cliquable (ouvre le sélecteur de date natif, remplace l'icône calendrier illisible/non tactile), bouton « Aujourd'hui » ajouté, date affichée du planning préservée au retour depuis la fiche tâche (au lieu de revenir à aujourd'hui), dates de la fiche tâche au format français, icône Paramètres retirée du bandeau supérieur (doublon avec la nav basse).
- Bug « taille du planning change quand il est vide » : investigué avec un navigateur automatisé (Playwright) plutôt que deviné — confirmé non reproductible sur build reconstruit (captures pixel-identiques). La première tentative de repro était faussée par un serveur de prévisualisation Playwright resté sur un `dist/` figé (piège déjà rencontré par le passé sur ce projet, cf. historique V5-1) — décidé de rebuild systématiquement avant toute mesure comparative.
- Les deux bugs fonctionnels signalés (suppression tâche récurrente sans effet, ajout de sous-tâche impossible depuis une tâche existante) ne sont pas corrigés : non reproduits malgré lecture de code ET tests automatisés Playwright rejouant les scénarios décrits. Décidé de ne pas fabriquer de correctif sans cause identifiée — laissés en attente d'une reproduction plus précise côté utilisateur (séquence exacte ou erreur console).

## Livrables produits ou modifiés
- `src/ui/screens/dashboard/PlanningBoard.tsx` : bandeau réécrit (mois cliquable + bouton Aujourd'hui remplaçant l'ancien input date minuscule), `rowStyle` corrigé (fond/appearance/outline réinitialisés), état vide avec hauteur minimale réservée, date affichée synchronisée sur la route (`replace({name:'planning', date})`) pour survivre à la navigation.
- `src/app/AppContext.tsx` : nouvelle fonction `replace` exposée dans le contexte de navigation (remplace la route courante sans empiler).
- `src/domain/rules/planningSlotRules.ts` : `formatFrenchDate`, `formatMonthYear` ajoutés.
- `src/ui/components/TopBar.tsx`, `E10Dashboard.tsx` : icône/prop Paramètres retirées.
- `src/ui/screens/tasks/E22TaskDetail.tsx`, `E23Decompose.tsx` : affichage des dates au format français.
- `src/test/testUtils.tsx` : mock `replace` ajouté ; `E10Dashboard.test.tsx` : test obsolète (bouton Paramètres du TopBar) supprimé.
- `tests_manuels.md` : purgé des points validés (1, 2, 2b, 3.1, 3.3, 3.4, 3.5, 3.7) ; ne reste que 3.2 (tactile réel) et les deux bugs non reproduits, documentés avec ce qu'il faut relever à la reproduction.

## Hypothèses validées / invalidées
- VALIDE : 488/488 tests unitaires, `tsc -b`/lint clean après l'ensemble des corrections UI.
- VALIDE : le bug de taille du planning vide ne se reproduit pas sur un build à jour — confirmé par mesure automatisée (captures identiques), pas par simple relecture visuelle.
- EN ATTENTE : bug de suppression de tâche récurrente et bug d'ajout de sous-tâche — ni confirmés ni infirmés définitivement, faute de reproduction assez précise ; testés sans succès en Playwright (suppression simple, suppression après édition d'un champ, scope série, ajout de sous-tâche sur tâche récurrente).

## Prochaine étape exacte
Reprendre la validation manuelle du point 3.2 sur téléphone. Pour les deux bugs non reproduits, obtenir de l'utilisateur soit la séquence exacte d'actions au moment de l'échec, soit une erreur relevée dans la console navigateur (F12 ou outils de dev à distance). Une fois ces trois points clos, enchaîner sur M6 (audit E7) et M7 (gate de la Phase V5-2b).

## Question bloquante pour la session suivante
Aucune.
