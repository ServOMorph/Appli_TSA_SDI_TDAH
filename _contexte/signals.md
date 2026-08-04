# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-04)

## Questions ouvertes
- [P1] Démarrer la Phase V5-2b (planning et tâches refondus) de `roadmap_v5.0.md`. — fait quand : phase codée, testée, validée manuellement, passée à `[FAIT]` — réf : `roadmap_v5.0.md` Phase V5-2b
- [P2] Corriger `exportData()` (`useSettingsState.ts`) qui lit `db.energyEntries.toArray()` brut au lieu de passer par `EnergyEntryRepository` — `energy_entries[].value` sort non déchiffré si `local_encryption` est activé. — fait quand : `exportData` passe par le repository, export vérifié avec chiffrement activé — réf : `roadmap_v5.0.md` § Bugs constatés
- [P2] Communiquer à Marie les points de `a_communiquer_v5.md` **au moment de la livraison de la V5.0 complète** (pas avant), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `Archives/roadmap_v4.1.md` § Q à trancher
- [P2] Recueillir le retour utilisateur sur le rendu visuel réel du Budget (refonte de lisibilité, session 2026-07-25) — le Budget est rebranché tel quel comme outil en Phase V5-3, Marie ne l'a toujours pas vu. — fait quand : retour utilisateur recueilli — réf : `roadmap_v5.0.md` Phase V5-3, `E71Budget.tsx`
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts:21`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts:21`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`

## Dernière session (2026-08-04 — Phase V5-2a close : validation manuelle intégrale, 1 régression trouvée et corrigée)

## Décisions prises
- Point 110 (tâches manquantes à l'ouverture) tranché comme faux positif après lecture de l'export (`export-audhd-2026-08-04.json`) : les tâches antérieures au 2026-07-31 y sont toutes présentes. Pas de perte de données en base, affichage transitoire vide résolu par rechargement complet de l'UI.
- Point 111 : régression réelle, corrigée dans la session plutôt que reportée — le « + » de l'accueil rouvrait l'écran de choix de destination au lieu de créer directement la tâche.

## Livrables produits ou modifiés
- `src/ui/screens/tasks/E21CreateTaskV2.tsx` : ajout de `dashboard: 'planned'` dans `FORCED_DESTINATION_BY_ORIGIN`, absente depuis la fusion V5-1 (écran d'accueil renommé `planning` → `dashboard`), ce qui cassait la création directe de tâche (`Q12`) depuis le « + » de l'accueil.
- `src/ui/screens/tasks/E21CreateTaskV2.test.tsx` : test dédié « depuis Accueil (originScreen 'dashboard') ».
- `tests_manuels.md` : purgé intégralement, points 110-117 validés.
- `roadmap_v5.0.md` : Phase V5-2a passée à `[FAIT]`, gate manuel coché, note de clôture ajoutée.

## Hypothèses validées / invalidées
- VALIDE : la migration Dexie v7/v8 ne perd pas de données — confirmé par lecture de l'export réel de l'utilisateur, tâches du 2026-07-31 présentes aux côtés des tâches créées le 2026-08-04.
- INVALIDE : le point 111 initialement considéré comme un comportement normal par l'utilisateur — c'est une régression de la fusion V5-1 (mapping d'origine incomplet), corrigée.
- VALIDE : 509/509 tests unitaires, 53/53 e2e (hérité, non rejoué cette session au-delà du fichier modifié), `tsc -b`/lint clean après correctif.

## Prochaine étape exacte
Démarrer la Phase V5-2b (planning et tâches refondus, `roadmap_v5.0.md`) : suppression du quadrillage, logos/couleurs de tâche, durée en jours/heures/minutes, récurrence Google Agenda, fiche tâche cliquable.

## Question bloquante pour la session suivante
Aucune.
