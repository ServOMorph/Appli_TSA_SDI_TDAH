# Roadmap — Expérience d'accueil des testeurs

Origine : demande explicite de l'utilisateur, 2026-09-16. Objectif : construire un workflow
d'accueil complet pour les nouveaux testeurs, travaillé en profondeur et **fait évoluer au fil des
sessions**, en priorisant leur confort — mettre le testeur à l'aise au mieux, du premier contact au
premier retour exploitable.

Distincte de `Archives/roadmap_integration_onboard.md` (intégration technique — consentement, code
testeur, dépouillement multi-appareils, canaux Discord — 6 phases livrées et vérifiées, roadmap
close). Cette roadmap-ci porte sur le **contenu et le déroulé humain** du parcours, pas sur le code
qui le supporte. Sa checklist « Mise en service » (10 points, encore ouverte, trackée `[P2]` dans
`_contexte/signals.md`) reste le tracker des prérequis techniques/process, indépendant de ce
qui se construit ici.

## Correction actée (2026-09-16)

`TESTS/ONBOARD/decisions_dispositif.md` § 3 : la décision initiale du 2026-09-04 (« profil AuDHD
proche de celui de Marie ») est levée. Les testeurs additionnels ne sont pas nécessairement AuDHD —
volontaire, confirmé par l'utilisateur (lui-même et Satine ne le sont pas). Document source corrigé
en conséquence.

## Document de référence

`TESTS/ONBOARD/parcours_accueil.md` (7 étapes, rédigé le 2026-09-05) reste la base à faire évoluer
— pas à réécrire de zéro. Les phases ci-dessous le font évoluer par itérations, pas en un seul lot.

---

## Phase 1 — Pilote RaphTest : rejouer le parcours actuel, consigner les frictions [EN COURS]

- L'utilisateur rejoue `parcours_accueil.md` sur le site de préprod
  (`https://appli-audhd-dev.netlify.app`), en tant que nouveau testeur, sans aide développeur en
  direct, `tester_code = RaphTest`.
- Chaque friction, ambiguïté, étape manquante ou moment d'inconfort rencontré est consigné ici au
  fil du test — pas seulement ressenti.
- Vérifications techniques associées : `python scripts/backup_testeur_snapshots.py` (le dossier
  `donnees_testeurs/RaphTest/` doit apparaître) ; si un retour est déposé pendant le test,
  `python scripts/reply_feedback_report.py` doit le lister.

### Frictions relevées
*(à compléter au fil du pilote)*

**Gate de sortie** : parcours rejoué intégralement, liste de frictions consignée ci-dessus (même
vide si aucune trouvée).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 2 — à définir selon les frictions relevées [TODO]

Contenu à construire à partir des résultats de la Phase 1 et des ajouts explicitement demandés par
l'utilisateur (ex. étape de visio d'accueil). Pas de contenu pré-rempli ici pour éviter de figer
des choix non discutés — cette roadmap se construit au fur et à mesure, comme demandé.
