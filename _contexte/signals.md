# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-14)

## Contexte chaud
- `donnees_marie/export-audhd-2026-08-13.json` : export réel de Marie, stocké en local, gitignoré et déclaré donnée sensible dans `CLAUDE.md` — ne pas lire/écrire sans instruction explicite.
- `_contexte/dernier_deploiement.md` créé : `/deploy` y consigne désormais lui-même version/date/URL du dernier déploiement, indépendamment de `/close`. Actuellement : v5.22, 2026-08-14, `https://appli-audhd.netlify.app`.

## Questions ouvertes
- [P1] Valider les 5 points de `tests_manuels.md` (création d'outil sans dossier, suppression de liste, retrait sur livret, dialogue d'ajout d'élément, import de sauvegarde JSON) sur appareil réel, puis clore la Phase V5.1-0 (les 4 premiers points seulement conditionnent la phase, le 5ᵉ — import — est hors périmètre de V5.1-0). — fait quand : les 5 points validés, `tests_manuels.md` vidé — réf : `tests_manuels.md`, `roadmap_v5.1.md` Phase V5.1-0
- [P1] Informer Marie que l'adresse de test a changé : `delightful-sunflower-836720.netlify.app` (qu'elle a utilisée) n'est plus à jour, le site officiel est désormais `https://appli-audhd.netlify.app` (déployé en v5.22). — fait quand : nouvelle adresse communiquée à Marie — réf : `.claude/commands/deploy.md`, `_contexte/dernier_deploiement.md`
- [P1] Communiquer à Marie les points de `a_communiquer_v5.md` maintenant que la V5.0 complète est livrée (V5-0 à V5-3 close), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P1] Demander à Marie un test réel du Budget refondu (E71/E73/E74) — jamais vu par elle, l'écran a changé depuis sa dernière utilisation. — fait quand : retour de Marie recueilli sur le Budget — réf : `E71Budget.tsx`, `roadmap_v5.1.md`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `roadmap_v5.1.md` § Q à trancher
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold toujours visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`

## Dernière session (2026-08-14, suite 3 — import de données, durcissement de /deploy, déploiement v5.22)

## Décisions prises
- Export de Marie (`export-audhd-2026-08-13.json`) déplacé dans `donnees_marie/` (gitignoré, déclaré donnée sensible).
- Import de sauvegarde JSON ajouté aux Paramètres : comportement **remplacement total** (pas de fusion), réparation automatique des entrées `tools` manquantes pour les exports v3.0 — décisions actées avec l'utilisateur.
- `/deploy` renforcé de 10 vérifications (7 bloquantes, 3 avertissements avec confirmation utilisateur unique) après analyse des points de friction, puis d'améliorations supplémentaires après un premier passage réel.
- Déploiement v5.22 validé et exécuté après confirmation explicite des deux avertissements (branche `main` vs `v5.1` mentionnée dans le contexte — écart réel, `v5.1` est fusionnée dans `main` depuis longtemps ; tests manuels en attente).

## Livrables produits ou modifiés
- `useSettingsState.ts` : `exportData()`/`clearDatabase()` corrigés (couvraient 10/14 tables, désormais 14/14, payload v3.1) ; `importData()` ajouté (validation, remplacement intégral, réparation `tools`).
- `AppContext.tsx` : `importData` exposé, recharge tout l'état et navigue vers `dashboard`/`energy-checkin` après import réussi.
- `E110Settings.tsx`/`E117Export.tsx` : écran renommé « Export et import », UI d'import (sélection fichier, modale de confirmation destructive, gestion d'erreur).
- Tests : `AppContext.test.tsx`, `E117Export.test.tsx`, `E110Settings.test.tsx`, `testUtils.tsx` étendus — 533/533 tests unitaires verts, `tsc -b`/lint clean.
- `tests_manuels.md` : point 5 ajouté (import d'une sauvegarde JSON avec le fichier de Marie).
- `.claude/commands/deploy.md` : 10 vérifications ajoutées (arbre propre, `.env` avec clés non vides, cohérence CHANGELOG/version, tests, `tsc -b`, lint — bloquantes ; branche attendue, commits non poussés, version déjà présente dans `dist/`, tests manuels en attente — avertissements) ; vérification de fumée `curl` post-déploiement ; `_contexte/dernier_deploiement.md` créé et mis à jour par `/deploy` lui-même.
- `_contexte/contexte.md` : mention de branche corrigée (`main`, `v5.1` fusionnée).
- `roadmap_v5.1.md` : compteur de tests unitaires et nombre de points `tests_manuels.md` mis à jour dans le gate de la Phase V5.1-0.
- `CHANGELOG.md` : entrée v5.22 ajoutée.
- Commits `6553a0b`, `15b9fa6`. Déploiement prod v5.22 effectué (`https://appli-audhd.netlify.app`).

## Hypothèses validées / invalidées
- VALIDE : l'export existant (`useSettingsState.exportData`) n'écrivait que 10 des 14 tables Dexie réelles — confirmé par lecture directe du code, pas seulement par le fichier de Marie.
- VALIDE : `v5.1` est bien fusionnée dans `main` (`git merge-base --is-ancestor`) — la mention « branche `v5.1` active » dans `contexte.md` était obsolète, corrigée.
- EN ATTENTE : validation manuelle des 5 points de `tests_manuels.md`, dont le nouveau point import (à tester avec le fichier réel de Marie) — non traitée cette session.

## Prochaine étape exacte
Valider les 5 points de `tests_manuels.md` sur appareil réel (dont l'import du fichier de Marie), puis clore la Phase V5.1-0. Informer Marie de la nouvelle adresse du site et lui transmettre `a_communiquer_v5.md` + demande de test du Budget.

## Question bloquante pour la session suivante
Aucune.
