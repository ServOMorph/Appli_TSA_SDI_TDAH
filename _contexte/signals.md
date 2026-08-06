# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-06)

## Questions ouvertes
- [P1] Valider manuellement la Phase V5-3 (`tests_manuels.md`, 6 points) puis clore la gate de phase (roadmap `roadmap_v5.0.md`). — fait quand : phase passée à `[FAIT]` — réf : `roadmap_v5.0.md` Phase V5-3, `tests_manuels.md`
- [P2] Communiquer à Marie les points de `a_communiquer_v5.md` **au moment de la livraison de la V5.0 complète** (pas avant), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `Archives/roadmap_v4.1.md` § Q à trancher
- [P2] Recueillir le retour utilisateur sur le rendu visuel réel du Budget et sur sa nouvelle porte d'entrée (carte outil au lieu du bouton dédié) — Marie ne l'a toujours pas vu. — fait quand : retour utilisateur recueilli — réf : `roadmap_v5.0.md` Phase V5-3, `E71Budget.tsx`
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold toujours visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`

## Dernière session (2026-08-06, suite 2 — M6/M7 de la Phase V5-2b clos, Phase V5-3 codée et testée intégralement en mode plan)

## Décisions prises
- E7 vérifié (aucune donnée préremplie à l'installation) ; Phase V5-2b passée à `[FAIT]`.
- Transcription du 28/07 relue pour lever l'ambiguïté E30 : la To Do reste créée d'office par l'app mais devient une liste normale, sans mécanisme propre — distincte de la Réception (`E20Inbox`), non touchée.
- `E60Lists.tsx` et la route `lists` supprimés (décision architecturale validée avec l'utilisateur en mode plan avant codage), remplacés par le modèle dossiers/outils (`E70Tools.tsx` racine, nouvel `E72FolderDetail.tsx`).
- Réveil sur un item de liste (E29) crée directement une tâche planifiée (récurrente ou ponctuelle) via `createDetailedTask`, sans lien stocké sur le `ListItem`.
- Budget rebranché comme outil sans aucune modification de son code interne (Q5).

## Livrables produits ou modifiés
- Entités `Folder`/`Tool`, migration Dexie **v10** (seed To Do + Budget d'office), repositories `folderRepository.ts`/`toolRepository.ts`, règles `folderRules.ts`/`toolRules.ts`/`listItemSortRules.ts`.
- `E70Tools.tsx` (générique), nouvel `E72FolderDetail.tsx`, nouveaux composants `ToolCreateModal.tsx`/`ToolWidgetCard.tsx`.
- `E61ListDetail.tsx` : coche/tri (E27), rubriques (E28), réveil (E29, avec champ Heure ajouté après bug trouvé en e2e).
- `E10Dashboard.tsx` : widgets outils réels + widget Comptes (Q12).
- `E60Lists.tsx` supprimé ; flux « déplacer une tâche vers une liste » (`E20Inbox`, `E21CreateTaskV2`, `E22TaskDetail`) migré vers `createToolList`.
- `roadmap_v5.0.md`, `_contexte/contexte.md`, `README.md`, `CHANGELOG.md`, `tests_manuels.md` (6 points V5-3 ajoutés) mis à jour.

## Hypothèses validées / invalidées
- VALIDE : aucune donnée n'est préremplie à l'installation (M6, E7).
- INVALIDE : le réveil sans heure suffisait à planifier une tâche visible -> pivot vers un champ Heure requis (`scheduleTask` n'assigne `scheduled_date` que si une heure est fournie).
- EN ATTENTE : validation manuelle intégrale de la Phase V5-3 (aucun test manuel effectué cette session, uniquement automatisé).

## Prochaine étape exacte
Valider manuellement les 6 points de `tests_manuels.md` (Phase V5-3), puis clore la gate de phase (roadmap `roadmap_v5.0.md`, Phase V5-3 `[FAIT]`).

## Question bloquante pour la session suivante
Aucune.
