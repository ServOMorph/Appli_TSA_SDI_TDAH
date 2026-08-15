# Roadmap — Synchronisation automatique des données de Marie

Version créée 2026-08-15. Remplace le flux manuel export JSON -> envoi -> ingestion par une synchronisation automatique en arrière-plan. Branche : `sync-marie`.

Légende : `[ ]` non démarrée · `[~]` en cours · `[x]` terminée.
Gate commun : tests créés et verts · test manuel de la phase · doc à jour · aucun écran ne perd son point d'entrée · critère de sortie.

## Décisions actées (2026-08-15)

- Toutes les données applicatives de Marie sont concernées (pas seulement les résultats de tests manuels).
- Pas d'écran de connexion : un identifiant/secret généré automatiquement par appareil sécurise l'envoi, aucune saisie pour Marie.
- Statut visible dans Paramètres : « vos données de test sont partagées avec le développeur » — pas de sync silencieuse invisible, en rupture assumée avec le flux d'export actuel où l'envoi était un geste explicite.
- Sauvegarde régulière (fréquence à trancher Phase 2, proposition par défaut : au démarrage de l'app + au retour au premier plan, throttlé à au plus une fois par heure).
- Ajout des nouveautés (`WHATS_NEW`) et du catalogue de tests manuels reste sur l'édition de fichiers actuelle — hors périmètre de cette roadmap.

## Prérequis externe [FAIT — 2026-08-15]

Backend Supabase (région UE, cf. `contexte.md`) — projet créé par l'utilisateur (`aslxfetpkuytrqwidxig`, région Frankfurt), API de données activée, RLS automatique activé, clés (URL + clé publiable) ajoutées à `.env` et aux variables d'environnement du site Netlify de prod. Site de test (dev) pas encore confirmé. Aucune dépendance Supabase présente dans `package.json` à ce jour — à ajouter en Phase 1.

---

## Phase 1 — Backend : schéma et projet Supabase [TODO]

> Basculer sur le modèle Opus (/model opus) avant de démarrer cette phase (migration structurelle).

- Projet Supabase créé par l'utilisateur, région UE, clés (URL + clé anonyme) ajoutées à `.env` (jamais commitées).
- Schéma de tables miroir des 15 tables Dexie actuelles (`db.ts`), une ligne par appareil identifié par son secret.
- Politique d'accès : écriture seule depuis l'appareil avec son propre secret, pas de lecture croisée entre appareils.
- Client Supabase ajouté aux dépendances (`@supabase/supabase-js`).

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 2 — Client de synchronisation [TODO]

- Génération et stockage local (`localStorage`) d'un secret d'appareil unique à la première ouverture.
- Fonction de sync : sérialise les tables Dexie, pousse vers Supabase avec le secret en en-tête.
- Déclenchement : au démarrage de l'app + retour au premier plan, throttlé (fréquence à confirmer avec l'utilisateur en ouverture de phase).
- Gestion hors-ligne : échec silencieux, nouvelle tentative au prochain déclenchement, jamais de blocage de l'usage de l'app.
- Tests : fonction de sync testée en isolation (mock réseau), throttle testé.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 3 — Statut visible côté Marie [TODO]

- Nouvel indicateur dans Paramètres (zone à définir, cohérente avec l'écran existant) : « vos données de test sont partagées avec le développeur », avec date/heure de dernière synchronisation réussie.
- Pas de bascule marche/arrêt dans le périmètre de cette phase (à signaler si l'utilisateur en veut une).
- Tests : affichage du statut et de la date, composant testé.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.

---

## Phase 4 — Bascule et retrait du flux manuel [TODO]

- Accès côté développeur pour lire les données remontées (script ou requête Supabase), en remplacement de l'ingestion des fichiers d'export (`scripts/ingest_manual_tests.py`, `_contexte/marie_tests_journal.json`).
- Retrait des bannières urgentes demandant réimport/réexport (`E01Welcome.tsx`, `E121ManualTests.tsx`) une fois la sync confirmée fonctionnelle en conditions réelles avec Marie.
- `.claude/commands/deploy.md` étape 0 (traitement des exports de Marie) à réviser ou retirer en conséquence.
- Test manuel : sync réelle depuis l'appareil de Marie confirmée reçue côté Supabase.

**⏸ Checkpoint** — Demander à l'utilisateur de faire `/compact` avant de continuer.
Attendre sa réponse écrite. Ne pas commencer la phase suivante sans confirmation.
