# Roadmap — Fiabilisation de la sauvegarde locale du snapshot de Marie

Créée le 2026-09-01, à la suite du test du script `scripts/backup_marie_snapshot.py` livré la
veille (`roadmap_sync_marie.md` Phase 5). Le script fonctionne sur le chemin nominal ; cette
roadmap traite les défauts relevés au test, par ordre de gravité.

Légende : `[TODO]` non démarrée · `[EN COURS]` en cours · `[FAIT]` terminée.
Gate commun : auto-tests verts · vérification manuelle de la phase · doc à jour · critère de sortie.

## Enjeu

Le schéma Supabase fait un `upsert` d'une ligne unique par `device_id` (`on conflict do update`) :
il n'existe **aucun historique côté serveur**. La sauvegarde locale dans `donnees_marie/` est le
seul filet contre une perte de données chez Marie suivie d'une resynchronisation qui écraserait le
dernier bon snapshot. Sa fiabilité est donc critique, même si le script est court.

## Constats du test du 2026-09-01 (mesurés, non supposés)

| # | Constat | Preuve |
| --- | --- | --- |
| 1 | Erreur réseau non gérée : `URLError` remonte en traceback brut (~20 lignes), exit 1 | Exécution avec `SUPABASE_URL` invalide |
| 2 | Doublons parfaits : 2 fichiers de sauvegarde au md5 identique | `1641h41.json` et `1837h37.json` = `af7399029c31b2ffa10f1560af8cb21c` |
| 3 | Nom de fichier : minutes dupliquées (`-1837h37` = HHMM + `h` + MM) | `synced_at[:16]` puis `+ "h" + synced_at[14:16]` |
| 4 | Horodatage en UTC, jamais signalé comme tel | `synced_at` = `2026-09-01T18:37:52.246694+00:00` |
| 5 | Heuristique `max()` sans tie-break ni ordre de requête déterministe | 49 snapshots, 1 seul avec `manual_test_results > 0` |
| 6 | Pas de `timeout` sur `urlopen` | Lecture du code |
| 7 | `created_at` sélectionné, jamais utilisé | Lecture du code |
| 8 | `fetch_snapshots` dupliqué depuis `read_device_snapshots.py`, lequel référence `urllib.error` sans l'importer | Lecture des deux fichiers |
| 9 | Aucune garde sur un `payload` vide : écrirait `null` en annonçant `tasks=0` | Lecture du code |
| 10 | Aucune rétention : `donnees_marie/` croît indéfiniment | 3 snapshots pour la seule journée du 2026-09-01 |

Cause commune de #2 : le nom de fichier est indexé sur `synced_at`, qui bouge à chaque relance de
l'app par Marie (sync au démarrage + retour premier plan). L'idempotence annoncée ne couvre donc
que deux exécutions sans synchronisation intercalée.

## Décision de cadrage (2026-09-01)

- Sauvegarde branchée **aussi en fin de session** : étape 2 de `.claude/commands/close.md`
  (bloc Spécificités projet), symétrique de l'étape 4 de `/start`. Réduit la fenêtre entre deux
  sauvegardes sans introduire de tâche planifiée Windows (option explicitement écartée par
  l'utilisateur lors de la conception du script). **Fait dans la session du 2026-09-01.**
- Harnais de test : `unittest` de la bibliothèque standard, aucune dépendance nouvelle (le projet
  n'a ni `pytest`, ni `requirements.txt`, ni aucun test Python à ce jour). Les fonctions pures sont
  testées ; le chemin réseau reste vérifié à la main.

## Phase 1 — Robustesse : réseau et doublons [FAIT]

Traite les constats 1, 2, 6, 9 — les seuls qui peuvent faire perdre une sauvegarde ou en écrire une
fausse.

- [x] Attraper `urllib.error.URLError` et `TimeoutError` en plus de `HTTPError` : message d'une
  ligne sur `stderr`, `return 1`. Plus aucun traceback sur le chemin hors-ligne.
- [x] Ajouter `timeout=15` à `urlopen` (un `/start` ne doit jamais pendre sur Supabase).
- [x] Dédupliquer par **contenu** et non par `synced_at` : avant écriture, comparer le `payload`
  sérialisé à la sauvegarde la plus récente du même appareil (`snapshot-supabase-<device>-*.json`,
  tri décroissant). Identique → ne rien écrire, afficher `inchangé depuis <nom>`.
- [x] Refuser d'écrire un `payload` absent, `None`, ou dépourvu à la fois de `tasks` et de
  `manual_test_results` : message explicite, `return 1`.
- [x] Créer `scripts/test_backup_marie_snapshot.py` (`unittest`) couvrant : sélection de cible,
  détection de doublon par contenu, refus d'un payload vide, génération du nom de fichier.
- [x] Vérification manuelle : relancer avec `SUPABASE_URL` invalide (message d'une ligne attendu),
  puis relancer normalement deux fois de suite (aucun fichier neuf attendu).

Critère de sortie : hors-ligne, le script affiche une ligne et sort en 1 ; deux exécutions
successives sans changement réel des données de Marie ne produisent qu'un seul fichier.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 2 — Lisibilité et traçabilité [FAIT]

Traite les constats 3, 4, 5, 7.

- [x] Générer le stamp via `datetime.fromisoformat(synced_at)` plutôt que par index de chaîne :
  format `%Y%m%d-%H%Mz` (UTC explicite, minutes non dupliquées, robuste à un changement de format
  côté Supabase). Ne pas renommer les fichiers déjà écrits.
- [x] Chemin nominal : afficher le `device_id` complet, le `synced_at` retenu et le nombre de
  `manual_test_results` ayant motivé la sélection.
- [x] Requête PostgREST : ajouter `&order=synced_at.desc` (ordre déterministe, tie-break implicite
  de `max()`), retirer `created_at` du `select`.
- [x] Tests : format du nom de fichier sur plusieurs formes de `synced_at` (avec/sans microsecondes,
  `Z` vs `+00:00`) ; départage de deux appareils à égalité de `manual_test_results`.
- [x] Vérification manuelle : une exécution réelle, contrôler que la ligne affichée nomme bien
  l'appareil `192f2411` et son horodatage UTC.

Critère de sortie : le nom de fichier est sans ambiguïté et marqué UTC ; la sortie permet de voir
quel appareil a été retenu et pourquoi, sans relire le code.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Phase 3 — Dette et rétention [FAIT]

Traite les constats 8 et 10. Phase de nettoyage : à faire seulement après que les Phases 1-2 ont
stabilisé le comportement, pour ne pas refactoriser une cible mouvante.

- [x] Extraire dans `scripts/_supabase.py` la garde d'environnement et la requête HTTP partagées ;
  `backup_marie_snapshot.py` et `read_device_snapshots.py` la consomment.
- [x] Corriger `read_device_snapshots.py` : `import urllib.error` manquant (fonctionne aujourd'hui
  par import transitif de `urllib.request`, non garanti par la spécification).
- [x] Rétention dans `donnees_marie/` : conserver les N derniers snapshots par appareil (défaut
  proposé : 30) plus le premier de chaque mois, purger le reste. Les exports historiques
  `export-audhd-*.json` ne sont jamais touchés.
- [x] Purge sous `--prune` explicite, jamais automatique : une suppression de données de Marie ne
  doit pas être un effet de bord silencieux de `/start` ou `/close`.
- [x] Tests : sélection des fichiers à conserver sur un jeu de noms synthétiques (aucun accès au
  contenu réel).
- [x] Vérification manuelle : `--prune` à blanc (`--dry-run`) sur le dossier réel, contrôler la
  liste avant toute suppression effective.

Critère de sortie : une seule implémentation de l'accès Supabase ; `donnees_marie/` ne croît plus
sans borne, et aucune purge ne s'exécute sans demande explicite.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

## Hors périmètre

- Ajout d'un historique côté Supabase (table append-only au lieu de l'`upsert`) : traiterait la
  cause racine plutôt que le symptôme, mais touche le schéma, la RLS et le client de synchronisation
  déployé chez Marie. À rouvrir seulement si la sauvegarde locale se révèle insuffisante.
- Tâche planifiée Windows : option déjà écartée par l'utilisateur au profit du branchement dans
  `/start`, désormais complété par `/close`.
