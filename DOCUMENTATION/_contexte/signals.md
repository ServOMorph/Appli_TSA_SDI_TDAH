# Signals — documentation   (MAJ 2026-09-25)

## Actions ouvertes
- [P1|ouvert] Démarrer la première session de travail avec /start documentation
- [P2|ouvert] Migrer progressivement le contenu de CLAUDE.md § Spécificités projet vers
  DOCUMENTATION/ (gateway Discord, Marie, retours conversationnels), en le remplaçant par des renvois
  - fait quand: chaque bloc de § Spécificités projet migré a son document DOCUMENTATION/
    correspondant et est remplacé par un renvoi dans CLAUDE.md
  - réf: CLAUDE.md § Spécificités projet, décision utilisateur du 2026-09-16 (migration progressive,
    pas immédiate)
- [P2|ouvert|source=orchestrateur] Mettre à jour la documentation export/import. L'export porte
  désormais `device_id`/`device_secret`/`sync_consent_granted`, restaurés à l'import ; l'import est
  possible dès l'écran de bienvenue (E01) et passe par E04 si le consentement manque ; le fil « Mes
  retours » ne suit pas une migration d'adresse.
  - fait quand: décision documentaire prise (docs mis à jour ou jugés inchangés)
  - réf: 20_guides/stockage_sauvegarde_restauration.md, 40_specs/parametres_donnees_retours.md,
    commit 84472d8, CHANGELOG.md v6.7

## Dernière session (2026-09-16)
<!-- Écrasé intégralement par /close. Synthèse < 25 lignes. -->
Agent créé via /create_agent. Aucune session de travail encore tenue.
