# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-14)

## Questions ouvertes
- [P1] Valider les 4 points de `tests_manuels.md` (création d'outil sans dossier, suppression de liste, retrait sur livret, dialogue d'ajout d'élément) sur appareil réel, puis clore la Phase V5.1-0. — fait quand : les 4 points validés, `tests_manuels.md` vidé — réf : `tests_manuels.md`, `roadmap_v5.1.md` Phase V5.1-0
- [P1] Informer Marie que l'adresse de test a changé : `delightful-sunflower-836720.netlify.app` (qu'elle a utilisée) n'est plus à jour, le site officiel est désormais `https://appli-audhd.netlify.app` (déployé en v5.20). — fait quand : nouvelle adresse communiquée à Marie — réf : `.claude/commands/deploy.md`, `CHANGELOG.md` v5.19/v5.20
- [P1] Communiquer à Marie les points de `a_communiquer_v5.md` maintenant que la V5.0 complète est livrée (V5-0 à V5-3 close), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P1] Demander à Marie un test réel du Budget refondu (E71/E73/E74) — jamais vu par elle, l'écran a changé depuis sa dernière utilisation. — fait quand : retour de Marie recueilli sur le Budget — réf : `E71Budget.tsx`, `roadmap_v5.1.md`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `roadmap_v5.1.md` § Q à trancher
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold toujours visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`

## Dernière session (2026-08-13/14, retour vidéo de Marie + mise en place du déploiement Netlify)

## Décisions prises
- Bug signalé par Marie (vidéo WhatsApp du 2026-08-13) diagnostiqué par transcription audio (`whisper`) + extraction d'images (`ffmpeg`) corrélées seconde par seconde : la barre de nav basse (`position: fixed`) se superposait transitoirement au formulaire « Ajouter un élément » d'une liste (`E61ListDetail.tsx`) à l'ouverture du clavier, celui-ci étant rendu en flux normal plutôt qu'en dialogue.
- Corrigé en convertissant le formulaire en boîte de dialogue plein écran (`position: fixed`, `z-index: 1000`), même pattern déjà utilisé dans le même fichier pour « Planifier » et « Supprimer cette liste ».
- Déploiement Netlify automatisé : commande `/deploy` créée (`.claude/commands/deploy.md`), lit la version dans `CHANGELOG.md`, build vers `dist/<version>` (`--outDir`, sans toucher `vite.config.ts`), déploie en prod via token dans `.env` (jamais lu ni affiché en session).
- Premier déploiement a créé un **nouveau site Netlify** (`.env` lié à un compte différent de celui vu dans la vidéo de Marie) au lieu de mettre à jour `delightful-sunflower-836720.netlify.app` qu'elle a testé — accepté par l'utilisateur, qui a renommé le site en `appli-audhd` (https://appli-audhd.netlify.app) plutôt que de chercher à récupérer l'ancien site.
- Bouton d'accueil (`E01Welcome.tsx`) affiche désormais « Entrer dans la vX.Y » en production, via `VITE_APP_VERSION` injectée au build par `/deploy` (absente en dev/tests, reste « Entrer »).
- `.env` déclaré donnée sensible dans `.claude/CLAUDE.md` (interdiction de lecture/écriture sans instruction explicite) — fait par l'utilisateur en cours de session.

## Livrables produits ou modifiés
- `Note de réunion/2026-08-13/constats_2026-08-13.md` + `captures/` (3 images) : analyse de la vidéo de Marie, transcript horodaté, corrélation image/son, bug identifié avec pointeur de code.
- `src/ui/screens/lists/E61ListDetail.tsx` : formulaire d'ajout d'élément converti en dialogue plein écran ; import `Card` devenu inutile, retiré.
- `src/ui/screens/onboarding/E01Welcome.tsx` : bouton affiche la version via `import.meta.env.VITE_APP_VERSION`.
- `.claude/commands/deploy.md` (nouveau) : commande `/deploy [version]`, build versionné + déploiement Netlify.
- `.env.example` (nouveau, valeurs vides) ; `.env` créé par l'utilisateur (non lu en session, ignoré par git).
- `.gitignore` : `.netlify/` (état local du CLI) ajouté.
- `tests_manuels.md` : point 4 ajouté (dialogue d'ajout d'élément, superposition nav).
- `CHANGELOG.md` : v5.19 (correctif superposition nav), v5.20 (version affichée sur le bouton d'accueil).
- `roadmap_v5.1.md` : ligne Gate de la Phase V5.1-0 actualisée (527 tests, 4 points `tests_manuels.md`, doc v5.20).
- Déployé en prod : `dist/v5.19` puis `dist/v5.20` sur https://appli-audhd.netlify.app.

## Hypothèses validées / invalidées
- VALIDE : 527/527 tests unitaires, `tsc -b` clean à chaque étape de la session.
- VALIDE : la transcription audio locale (`whisper`) et l'extraction d'images (`ffmpeg`) sans appel cloud suffisent à documenter un retour vidéo court et exploitable pour le dev.
- INVALIDE : l'hypothèse implicite que le token/Site ID Netlify fournis pointaient vers le site déjà utilisé par Marie (`delightful-sunflower-836720`) -> pivot : nouveau site adopté comme site officiel (`appli-audhd`), Marie à prévenir du changement d'adresse.
- EN ATTENTE : e2e non relancé depuis la session v5.17 (528+ tests unitaires seuls exécutés) ; validation manuelle sur appareil réel des 4 points de `tests_manuels.md` non faite cette session.

## Prochaine étape exacte
Valider les 4 points de `tests_manuels.md` sur appareil réel, puis clore la Phase V5.1-0. En parallèle, informer Marie de la nouvelle adresse du site (`appli-audhd.netlify.app`) et lui transmettre `a_communiquer_v5.md` + demande de test du Budget.

## Question bloquante pour la session suivante
Aucune.
