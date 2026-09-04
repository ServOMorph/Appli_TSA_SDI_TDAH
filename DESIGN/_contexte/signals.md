# Signals — design   (MAJ 2026-09-04)

## Actions ouvertes
- [P1|ouvert] Livrer le prompt « image d'accueil » à Marie. La demande gateway `design -> marie`
  a été *bounced* (3461 car. > limite Discord 2000 ; `gateway.py enqueue` n'a pas d'option pièce
  jointe). Trancher le canal : message court gateway + prompt transmis autrement (utilisateur /
  Drive), ou ajouter le support pièce jointe à la gateway. Puis re-déposer.
  fait quand: Marie a reçu le message d'accompagnement ET le bloc prompt complet, copiable en un seul bloc.
  réf: `scratchpad/msg_marie_image_accueil.txt` (message + prompt), `inbox/design/20260904T033440_749547.json` (bounce, non acké), `DISCORD/discord_com/gateway/README.md`
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

## Dernière session (2026-09-04)
<!-- Écrasé intégralement par /close. Synthèse < 25 lignes. -->

## Décisions prises
- Premier chantier design : remplacer l'image d'accueil, conçue par Marie via ChatGPT (version
  gratuite) — 10 concepts écrits, affinage guidé, génération finale.
- Le texte reste dans l'image (« Bienvenue » + « Appli TSA SDI TDAH »).
- `COMMUNICATION/Marie/historique_whatsapp.md` renommé `historique_conversation_marie.md`.

## Livrables produits ou modifiés
- `scratchpad/msg_marie_image_accueil.txt` : message d'accompagnement + prompt ChatGPT (hors dépôt).
- gateway outbox : demande `design -> marie` `20260903T200827_188290` -> *bounced* `20260904T033440_749547`.
- `COMMUNICATION/Marie/historique_conversation_marie.md` : renommé (git mv), entrée 2026-09-03 ajoutée, note de renommage en tête.
- `.claude/CLAUDE.md`, `AGENTS.md` : chemin mis à jour au § Historique.
- Message à l'orchestrateur (renommage à committer, résidus `_contexte/`).

## Hypothèses validées / invalidées
- INVALIDE : un seul message Discord ne peut pas porter message + prompt complet (3461 > 2000 car.).
- EN ATTENTE : canal de livraison du prompt à Marie (gateway sans pièce jointe).

## Prochaine étape exacte
Trancher le canal de livraison du prompt à Marie, re-déposer une demande gateway courte, faire
approuver par la session `discord`. Puis attendre le retour de Marie (image + description).

## Question bloquante pour la session suivante
Comment acheminer le bloc prompt (~2600 car., à copier en un bloc) à Marie, la gateway Discord ne
gérant pas les pièces jointes et Discord coupant à 2000 caractères ?
