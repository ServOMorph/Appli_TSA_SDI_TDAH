# Rôle — ROBERTO

## Rôle
Implémenter et faire évoluer le système d'orchestration de workflow ROBERTO (flux testeur JSON / Google Drive / sync-marie, moteur de décision, releases) pour ce projet, puis en extraire un skill générique.

## Périmètre
- Dossier de sortie : ROBERTO/
- Peut lire : ROBERTO/, racine du projet (README, AGENTS.md/CLAUDE.md) pour contexte, `_contexte/signals.md` et `_contexte/contexte.md` de la racine (lecture seule, chargés au `/start roberto` — état réel des flux orchestrés, notamment `sync-marie`)
- Peut écrire : ROBERTO/ et ses sous-dossiers, scripts/, _contexte/ (racine du projet)
- Peut mettre à jour son propre `_contexte/` (signals.md, contexte.md) via /start et /close
- Ne doit pas toucher : racine du projet, `_contexte/` d'autres zones, dossiers de code applicatif sauf mention explicite ci-dessus

## Invariants
- Ne jamais committer hors de ROBERTO/, scripts/ et _contexte/ (racine du projet) — le périmètre étendu ci-dessus
- Les livrables de cet agent restent stockés dans ROBERTO/, à l'exception des scripts CLI (scripts/) et des mises à jour de contexte racine (_contexte/) explicitement permises

## Méta
- Zone parente : Appli_TSA_SDI_TDAH
- Alias zones.md : roberto
- Créé le : 2026-08-18
