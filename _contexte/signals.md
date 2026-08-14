# Signals — Appli_TSA_SDI_TDAH (MAJ 2026-08-14)

## Contexte chaud
- `roadmap_v5.0.md` a été déplacé vers `Archives/roadmap_v5.0.md` le 2026-08-14 (ménage racine) — corriger toute référence à l'ancien chemin racine si elle apparaît.

## Questions ouvertes
- [P1] Valider les 4 points de `tests_manuels.md` (création d'outil sans dossier, suppression de liste, retrait sur livret, dialogue d'ajout d'élément) sur appareil réel, puis clore la Phase V5.1-0. — fait quand : les 4 points validés, `tests_manuels.md` vidé — réf : `tests_manuels.md`, `roadmap_v5.1.md` Phase V5.1-0
- [P1] Informer Marie que l'adresse de test a changé : `delightful-sunflower-836720.netlify.app` (qu'elle a utilisée) n'est plus à jour, le site officiel est désormais `https://appli-audhd.netlify.app` (déployé en v5.20). — fait quand : nouvelle adresse communiquée à Marie — réf : `.claude/commands/deploy.md`, `CHANGELOG.md` v5.19/v5.20
- [P1] Communiquer à Marie les points de `a_communiquer_v5.md` maintenant que la V5.0 complète est livrée (V5-0 à V5-3 close), puis recueillir son retour sur les 3 écarts assumés et sur la priorité « Comptage en premier » parmi les outils reportés. — fait quand : retour de Marie recueilli après livraison — réf : `a_communiquer_v5.md`
- [P1] Demander à Marie un test réel du Budget refondu (E71/E73/E74) — jamais vu par elle, l'écran a changé depuis sa dernière utilisation. — fait quand : retour de Marie recueilli sur le Budget — réf : `E71Budget.tsx`, `roadmap_v5.1.md`
- [P2] Décider si une catégorie de dépense peut changer de périodicité après sa création, compte tenu de l'impact sur l'historique. — fait quand : décision actée avec l'utilisateur — réf : `roadmap_v5.1.md` § Q à trancher
- [P3] Réglage « Réduire les animations » quasi sans effet visible faute d'animations à réduire dans l'interface actuelle — angle mort produit, pas une régression. — fait quand : décision prise (enrichir l'UI d'animations ou accepter l'état actuel) — réf : `roadmap_v5.0.md` § Reporté hors V5, `E112Accessibility.tsx`
- [P3] `todayStr()` (`planningSlotRules.ts`) ignore `dev_fake_date` alors que `todayDate()` (`repositories.ts:29`) le respecte — en dev avec date simulée active, le planning peut afficher un jour différent de celui utilisé pour l'énergie. — fait quand : décision prise (harmoniser ou accepter, outil dev uniquement) — réf : `planningSlotRules.ts`, `repositories.ts:29`
- [P3] `index.html:7` : `<title>tsa-scaffold</title>`, résidu de scaffold toujours visible dans l'onglet du navigateur. — fait quand : titre corrigé — réf : `index.html`

## Dernière session (2026-08-14, ménage de la racine)

## Décisions prises
- Ménage de la racine exécuté après analyse et validation utilisateur : doublon `ollama_call.py`, `llms.txt` obsolète, `roadmap_v5.0.md` close non archivée, vieux builds `dist/`.
- `AGENTS.md` conservé sans modification — sert au développement avec Codex, hors périmètre.

## Livrables produits ou modifiés
- `ollama_call.py` (racine) : supprimé, doublon exact de `scripts/ollama_call.py`.
- `.claude/CLAUDE.md` : référence Ollama corrigée vers `scripts/ollama_call.py`.
- `llms.txt` : mentions du chiffrement local/`src/crypto/` (retiré le 2026-08-05) supprimées.
- `Archives/roadmap_v5.0.md` : déplacé depuis la racine (roadmap close, V5-0 à V5-3 `[FAIT]`).
- `dist/v3`, `v4.1`, `v5.0`, `v5.1` : purgés (dossier gitignoré, régénérables via `/deploy`).
- `README.md`, `_contexte/contexte.md`, `_contexte/archive_decisions.md` : mis à jour (nouveau chemin de roadmap_v5.0.md, décision archivée pour rester sous 10 entrées).
- Commit `9aafa7f`.

## Hypothèses validées / invalidées
- VALIDE : `ollama_call.py` racine et `scripts/ollama_call.py` strictement identiques avant suppression (`diff` vide).
- EN ATTENTE : validation manuelle des 4 points de `tests_manuels.md` — non traitée cette session, reste ouverte.

## Prochaine étape exacte
Reprendre la file ouverte : valider les 4 points de `tests_manuels.md` sur appareil réel pour clore la Phase V5.1-0. En parallèle, informer Marie de la nouvelle adresse du site (`appli-audhd.netlify.app`) et lui transmettre `a_communiquer_v5.md` + demande de test du Budget.

## Question bloquante pour la session suivante
Aucune.
