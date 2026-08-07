# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-07)

## Questions ouvertes
- [P1] Valider les 3 points de `tests_manuels.md` (création d'outil sans dossier, suppression de liste, retrait sur livret) sur appareil réel, puis clore la Phase V5.1-0. — fait quand : les 3 points validés, `tests_manuels.md` vidé — réf : `tests_manuels.md`, `roadmap_v5.1.md` Phase V5.1-0
- [P1] Communiquer à Marie les points de `a_communiquer_v5.md` maintenant que la V5.0 complète est livrée (V5-0 à V5-3 close), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P1] Demander à Marie un test réel du Budget refondu (E71/E73/E74) — signalé explicitement par l'utilisateur en fin de session, jamais vu par Marie, l'écran a changé depuis sa dernière utilisation. — fait quand : retour de Marie recueilli sur le Budget — réf : `E71Budget.tsx`, `roadmap_v5.1.md`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `roadmap_v5.1.md` § Q à trancher
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold toujours visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`

## Dernière session (2026-08-07, retours de validation manuelle V5.1-0)

## Décisions prises
- Suppression de dossier : retrait complet de la possibilité de créer un dossier depuis le « + » des Outils (accueil et écran Outils) — signalé « pas assez utile » par l'utilisateur en validation manuelle. `createFolder`/`Folder`/`E72FolderDetail` non supprimés (dossiers existants toujours consultables/supprimables), seule la création est retirée.
- Suppression de liste : ajoutée dans la fiche liste (`E61ListDetail`), absente jusqu'ici — `deleteTool` existait déjà côté état mais n'était câblé nulle part pour les listes.
- Retrait d'argent sur un livret : tranché et codé dans la session (item jusque-là « hors périmètre, non tranché » de `roadmap_v5.1.md`) — modèle de données inchangé, `BudgetDeposit.amount` accepte un montant négatif, un retrait qui dépasserait le solde du livret est bloqué côté formulaire.
- Bug initialement signalé (« impossible d'enregistrer une dépense après avoir créé une catégorie ») : non reproduit par lecture de code, question posée à l'utilisateur qui a confirmé une erreur de manipulation de sa part — aucun correctif appliqué, pas de bug réel.

## Livrables produits ou modifiés
- `ToolCreateModal.tsx` : mode « new-folder » et prop `allowFolder` retirés, ne propose plus que « Nouvelle liste ».
- `E10Dashboard.tsx`, `E72FolderDetail.tsx` : appels à `ToolCreateModal` mis à jour ; aria-label du bouton d'accueil renommé « Ajouter un outil » (au lieu de « Ajouter un outil ou un dossier »).
- `E61ListDetail.tsx` : bouton de suppression de liste (×) avec confirmation, appelle `deleteTool` puis `back('tools')`.
- `useBudgetState.ts` : `createBudgetDeposit` accepte désormais un montant négatif (retrait) — seul `amount === 0` est rejeté.
- `E74BudgetSettings.tsx` : formulaire « Ajouter un dépôt » renommé « Ajouter un mouvement », sélecteur Type (Dépôt/Retrait), blocage si le retrait dépasse le solde courant du livret, liste des mouvements affichant « Dépôt »/« Retrait ».
- Tests : `E61ListDetail.test.tsx` (2 tests suppression), `E74BudgetSettings.test.tsx` (3 tests retrait), `E10Dashboard.test.tsx` et `e2e/09-tools-folders-lists.spec.ts` mis à jour pour le nouveau libellé et l'absence de création de dossier.
- `tests_manuels.md` : vidé des 4 points validés (« le reste ok »), 3 nouveaux points ajoutés (création d'outil, suppression de liste, retrait sur livret).
- `roadmap_v5.1.md` : entrée « Hors périmètre » du retrait de livret mise à jour (codé, plus « non tranché »).

## Hypothèses validées / invalidées
- VALIDE : 527/527 tests unitaires, `tsc -b`/lint clean.
- INVALIDE : bug de saisie de dépense après création de catégorie -> pivot vers aucune action (erreur de manipulation utilisateur, confirmée par l'utilisateur).
- EN ATTENTE : e2e complet non relancé cette session (seuls `tsc`/lint/vitest exécutés) ; rendu réel des 3 nouveaux points non vérifié en navigateur.

## Prochaine étape exacte
Valider les 3 points de `tests_manuels.md` sur appareil réel, puis clore la Phase V5.1-0.

## Question bloquante pour la session suivante
Aucune.
