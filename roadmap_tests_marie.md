# Roadmap — Tests manuels soumis à Marie (in-app + archivage projet)

Version : créée 2026-08-14. Branche à créer au démarrage de la Phase 1.

Légende : `[ ]` non démarrée · `[~]` en cours · `[x]` terminée.
Gate commun : tests créés et verts · test manuel de la phase · doc à jour · aucun écran ne perd son point d'entrée · critère de sortie.

Origine : demande utilisateur du 2026-08-14 — ajouter une icône dans le bandeau du haut (à droite de « Ressources ») ouvrant un écran listant les tests manuels demandés à Marie, rédigés en langage clair et pédagogique. Chaque test s'ouvre en modale : coche « validé » / coche « non validé » avec commentaire obligatoire dans ce cas. Historique complet conservé au fil du développement.

### Arbitrages validés avec l'utilisateur (2026-08-14)

- **A1** — Catalogue des tests soumis à Marie : fichier de code dédié, versionné dans le repo, alimenté par nous au fil du dev (pas un écran d'administration in-app).
- **A2** — L'import JSON existant (E117) fait un remplacement total de la base ; l'historique des tests ne peut donc pas reposer uniquement sur l'IndexedDB de Marie sans risque de perte. Archive de référence côté projet, alimentée par un script d'ingestion exécuté manuellement à chaque réception d'un export de Marie.
- **A3** — Système distinct de `tests_manuels.md` : celui-ci reste la file d'attente technique de nos propres validations manuelles de dev, inchangée. Le nouveau catalogue est un contenu séparé, en langage clair, alimenté par nous en parallèle quand un test doit être soumis à Marie.
- **A4** — Un test est « nouveau » (jamais vu par Marie) tant qu'aucune entrée `manualTestResults` n'existe pour son `test_id`. Repère visuel rouge sur la ligne du test dans la liste, et pastille rouge sur l'icône du bandeau du haut tant qu'au moins un test du catalogue est dans cet état.
- **A5** — Le catalogue in-app est la liste de référence de tous les tests demandés à Marie. Avant sa première livraison, auditer `tests_manuels.md` et y reprendre chaque scénario encore actuel, réécrit en langage clair. Ensuite, ajouter au catalogue tout scénario destiné à Marie à la fin de l'évolution qui le crée ; `tests_manuels.md` reste la file technique de validation interne.

---

## Phase 1 — Modèle de données et écran de consultation [FAIT]

- [x] `T1` — entité `src/domain/entities/manualTestResult.ts` : `{ id, test_id, status: 'ok' | 'nok', comment: string | null, created_at }`. Append-only : aucune mise à jour ni suppression après création, un nouveau test = une nouvelle ligne horodatée (historique complet, y compris les tests refaits plusieurs fois).
- [x] `T2` — table Dexie `manualTestResults` (migration `db.ts` version 11, index `test_id`), repository dédié dans `repositories.ts`.
- [x] `T3` — catalogue statique `src/domain/data/manualTestsCatalog.ts` : tableau `{ id, title, description }` en langage clair et pédagogique, sans vocabulaire technique. Contenu initial, après audit : les cinq scénarios encore ouverts de `tests_manuels.md` (création de liste sans dossier, suppression de liste, retrait sur livret, dialogue d'ajout d'élément, import JSON) et le test du Budget refondu (E71/E73/E74). Le scénario d'import doit être reformulé pour l'appareil de Marie : il ne peut pas citer le chemin local `donnees_marie/` et doit rappeler qu'il remplace les données présentes.
- [x] `T4` — écran `src/ui/screens/tests/E121ManualTests.tsx` : liste des tests du catalogue, statut visuel déduit du dernier résultat connu par `test_id` (jamais testé / validé / non validé — le plus récent l'emporte s'il y a plusieurs soumissions).
- [x] `T4b` — repère visuel rouge (pastille) sur chaque ligne de test « nouveau » (`A4` : aucune entrée `manualTestResults` pour son `test_id`), distinct des statuts validé/non validé.
- [x] `T5` — icône ajoutée dans `TopBar.tsx`, à droite de l'icône Ressources, ouvrant la nouvelle route ; masquée en mode surcharge (même règle que Ressources).
- [x] `T5b` — pastille rouge sur cette icône tant qu'au moins un test du catalogue est « nouveau » (`A4`), recalculée à chaque changement de `manualTestResults` ou du catalogue.
- [x] Tests : repository, catalogue (au moins un test présent), écran (statuts affichés correctement, pastille rouge sur test nouveau), icône (pastille présente/absente selon l'état).

Gate : [x] tests verts · [x] test manuel (écran accessible, contenu lisible sans jargon, pastille rouge visible sur un test jamais soumis et sur l'icône) · [x] doc (`CHANGELOG.md`) · [x] sortie — Marie peut ouvrir l'écran et voir la liste des tests en attente, en langage clair, avec un repère clair sur ce qui est nouveau.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 2 — Modale de validation et intégration export/import [FAIT]

- [x] `T6` — modale ouverte au tap sur un test : coche « Validé » / coche « Non validé », champ commentaire obligatoire uniquement si « Non validé » (bouton Enregistrer désactivé tant que le commentaire est vide dans ce cas).
- [x] `T7` — enregistrement dans `manualTestResults` (jamais d'écrasement, toujours un ajout).
- [x] `T8` — historique visible pour un test donné (soumissions précédentes, date, statut, commentaire), pour transparence côté Marie et côté dev. Le catalogue inclut le scénario Marie de validation et de restauration de cet historique.
- [x] `T9` — intégration à `useSettingsState.ts` (`exportData`/`clearDatabase`/`importData`) et à `db.ts` : `manual_test_results` ajouté au payload JSON d'export (15ᵉ table), à la purge et à la restauration, cohérent avec les autres tables.
- [x] Tests : modale (validation, commentaire obligatoire), export/import incluant la nouvelle table.

Gate : [x] tests verts · [x] test manuel (validation d'un test réelle, export puis import vérifiés) · [x] doc · [x] sortie — un test peut être validé ou refusé avec commentaire, l'historique survit à un export/import.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 3 — Archivage côté projet [EN COURS]

- [x] `T10` — script `scripts/ingest_manual_tests.py` : prend en argument un export JSON reçu de Marie, en extrait `manual_test_results`, fusionne dans un journal versionné du repo (dédoublonnage par `id`, jamais d'écrasement d'une entrée existante). Testé avec un export factice hors dépôt (ajout puis re-exécution idempotente vérifiés).
- [x] `T11` — format tranché avec l'utilisateur : JSON structuré (`{ "entries": [...] }`, entrées = objets `ManualTestResult` tels quels), emplacement `_contexte/marie_tests_journal.json` (hors `donnees_marie/`, qui reste réservé aux exports bruts sensibles).
- [x] `T12` — rappel ajouté à `_contexte/signals.md` du flux : réception d'un export de Marie → `python scripts/ingest_manual_tests.py <export>` → journal projet à jour.
- [ ] Test manuel : ingestion d'un export réel de Marie, vérification du journal.

Gate : [x] script fonctionnel (vérifié avec un export factice) · [ ] test manuel (ingestion réelle d'un export de Marie) · [x] doc (`signals.md`) · [ ] sortie — l'historique des tests de Marie survit à un remplacement total de sa base locale, la référence est le journal du repo.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Q à trancher

- Format exact du journal projet (Markdown vs JSON) — à décider en Phase 3, une fois la structure des données de la Phase 1 stabilisée.
