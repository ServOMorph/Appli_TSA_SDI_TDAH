# Signals — design   (MAJ 2026-09-05)

## Actions ouvertes
- [P1|en attente d'approbation discord] Livrer le prompt « image d'accueil » à Marie. Support
  pièce jointe ajouté à `gateway.py enqueue`/`bot.py` par l'orchestrateur (77 tests verts, non
  committé côté DISCORD) ; `bot.py` redémarré. Demande redéposée avec `--attachment` :
  `20260905T213244_730443` (message court + pièce jointe `prompt_image_accueil.txt`). Ancien
  bounce acquitté.
  fait quand: Marie a reçu le message d'accompagnement ET le fichier prompt complet en pièce jointe.
  réf: `DISCORD/discord_com/gateway/outbox/20260905T213244_730443.json`, `DISCORD/discord_com/gateway/README.md`
- [P2|ouvert] Après retour de Marie (image + description finale retenues) : intégrer la nouvelle
  image d'accueil. Remplacer `public/images/welcome-hero.png` ; `E01Welcome.tsx` référence déjà
  `/images/welcome-hero.png` — aucun code à changer si le nom de fichier est conservé.
  fait quand: la nouvelle image est en place dans `public/images/` et s'affiche correctement à l'ouverture (format vertical, `object-fit: contain`).
  réf: `src/ui/screens/onboarding/E01Welcome.tsx`, `public/images/welcome-hero.png`
- [P3|ouvert] Résidus du renommage `historique_whatsapp.md` -> `historique_conversation_marie.md`
  à nettoyer hors zone design : `.claude/CLAUDE.md` (hunk non commité, entrelacé avec le travail
  de la session `discord`), `_contexte/signals.md` / `_contexte/contexte.md` (notes de session
  datées). Message déjà transmis à l'orchestrateur.
  fait quand: l'orchestrateur a commité le hunk CLAUDE.md et nettoyé / laissé sciemment les notes `_contexte/`.
  réf: message orchestrateur (relayé par l'utilisateur), `git diff .claude/CLAUDE.md`

## Contexte chaud
- Image d'accueil actuelle : `public/images/welcome-hero.png`, format vertical, contient déjà le
  texte « Bienvenue » (grand) + « Appli TSA SDI TDAH » (orange). Le nouveau brief conserve ce
  texte (décision utilisateur : ChatGPT gère bien le texte incrusté).
- Brief ChatGPT verrouillé : 10 concepts décrits à l'écrit -> choix de Marie -> questions une par
  une pour affiner -> génération seulement après « c'est bon ». Éviter pièce de puzzle, cerveau,
  ampoule, engrenage, visuel enfantin, couleurs criardes.
- Envoi Discord : `gateway.enqueue("design", "marie", ...)` uniquement ; le gardien (session
  `discord`) approuve. `bot.py` draine les `approved` toutes les 5 s.
- `scratchpad/` à la racine : zone de dépôt transitoire hors dépôt git (`msg_marie_image_accueil.txt`,
  `prompt_image_accueil.txt` recréés le 2026-09-05, l'original du 2026-09-04 avait disparu — contenu
  récupéré depuis le bounce `original_body`). Ne jamais committer ce dossier.
- Répertoire de travail partagé avec la session orchestrateur (même dépôt, pas de worktree) :
  `signals.md` de design a été réécrasé une fois pendant la session du 2026-09-05 par une action
  externe non identifiée. Rester vigilant en cas de perte de mise à jour similaire.
- `COMMUNICATION/Marie/historique_conversation_marie.md` a été mis à jour ce 2026-09-05 (message
  envoyé à Marie) mais **non committé par design** (hors périmètre d'écriture/commit de
  `agent_role.md`) : à committer par l'orchestrateur avec le reste de ses changements DISCORD/.

## Dernière session (2026-09-05)

## Décisions prises
- Canal retenu pour le prompt trop long : ajout du support pièce jointe à la gateway (demandé à
  l'orchestrateur), plutôt qu'un Artifact ou un relais par l'utilisateur.

## Livrables produits ou modifiés
- `scratchpad/msg_marie_image_accueil.txt`, `scratchpad/prompt_image_accueil.txt` : recréés (hors dépôt).
- gateway outbox : demande `design -> marie` `20260905T213244_730443` avec `--attachment`, `pending`.
- `COMMUNICATION/Marie/historique_conversation_marie.md` : entrée 2026-09-05 ajoutée (non committée).
- `DESIGN/_contexte/signals.md`, `DESIGN/_contexte/contexte.md` : mis à jour.
- Ancien bounce `20260904T033440_749547` : acquitté.
- Demande transmise à l'orchestrateur (support pièce jointe gateway) : traitée pendant la session.

## Hypothèses validées / invalidées
- VALIDE : le bounce `original_body` conserve le contenu intégral, aucune perte malgré la
  disparition du fichier scratchpad d'origine.
- EN ATTENTE : approbation de la demande `20260905T213244_730443` par le gardien (session discord).

## Prochaine étape exacte
Attendre l'approbation/envoi de la demande `20260905T213244_730443`, puis le retour de Marie
(image + description finale) pour lancer le P2 (intégration de l'image).

## Question bloquante pour la session suivante
Aucune.
