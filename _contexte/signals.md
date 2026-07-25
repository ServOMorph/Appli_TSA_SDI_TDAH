# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-07-25)

## Questions ouvertes
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `roadmap_v4.1.md` § Q à trancher
- [P2] Reste hors périmètre V4.1 : liste courses spécialisée, intégration accueil du budget, date butoir Todo, retraits/virements livrets et chiffrement global. — fait quand : cadrage repris explicitement par l'utilisateur — réf : `roadmap_v4.1.md` § Reporté hors V4.1
- [P2] Recueillir le retour utilisateur sur le rendu visuel réel de la refonte Budget (points 2-7, session 2026-07-25) — non vérifié en navigateur, uniquement tests auto + lecture du code. — fait quand : retour utilisateur recueilli — réf : `roadmap_v4.1.md` Phase V4.1-3/4, `E71Budget.tsx`

## Dernière session (2026-07-25, codage + clôture Phase V4.1-5)

## Décisions prises
- Phase V4.1-5 codée et close : nav « + » contextuel selon l'écran d'origine, `effectiveDestination` généralisé dans `E21CreateTaskV2.tsx`, accent visuel sur liste épinglée dans `E60Lists.tsx`.
- Décision prise au fil du codage (hors cadrage initial) : depuis l'onglet Listes, le « + » force directement la destination `list` (ouvre le sélecteur de liste, création de liste incluse) plutôt que d'afficher le sélecteur générique à 4 choix.

## Livrables produits ou modifiés
- `App.tsx` : le bouton « + » de `BottomNav` passe l'écran courant (`screen`) comme `taskCreateOrigin` au lieu de `'dashboard'` codé en dur.
- `E21CreateTaskV2.tsx` : nouvelle table `FORCED_DESTINATION_BY_ORIGIN` (`inbox`/`tools` → `todo`, `today` → `today`, `planning` → `planned`, `lists` → `list`) remplaçant l'ancien `isFromInbox` ; section « Que faire de cette tâche ? » masquée dès qu'une destination est forcée.
- `E60Lists.tsx` : `li` d'une liste épinglée avec bordure gauche + fond teinté (`color-mix` sur `--color-primary`) pour la distinguer visuellement, en plus du libellé du bouton.
- `tests_manuels.md` : points 74 à 82 ajoutés puis validés par l'utilisateur en navigateur (retirés du fichier).
- `App.test.tsx`, `E21CreateTaskV2.test.tsx`, `E60Lists.test.tsx` : tests ajoutés/mis à jour pour la nouvelle logique.
- `roadmap_v4.1.md` : Phase V4.1-5 passée à `[FAIT]`, gate cochée.

## Hypothèses validées / invalidées
- VALIDE : le mapping origin→destination forcée couvre tous les points d'entrée existants du « + » (dashboard, inbox/tools, today, planning, lists) sans casser de flux ; validation manuelle intégrale confirmée par l'utilisateur.

## Prochaine étape exacte
[P1] Démarrer la Phase V4.1-6 (`roadmap_v4.1.md`) : auto-scroll vertical de la grille `E40Planning` pendant un drag (dwell haut/bas symétrique au dwell latéral existant). — réf : `roadmap_v4.1.md` Phase V4.1-6

## Question bloquante pour la session suivante
Aucune.

## Contexte chaud
- `bug et ameliorations.txt` (racine, non versionné) peut être vidé/supprimé une fois V4.1-6 close — son contenu est désormais intégralement repris dans `roadmap_v4.1.md`.
