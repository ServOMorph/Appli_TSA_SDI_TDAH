# MODÈLE DE DONNÉES & ARCHITECTURE BACKEND

# Application AuDHD — Organisation, routines, énergie et social

Version : 1.0

---

# 1. Objectif

Définir :

* les entités métier
* leurs relations
* les états possibles
* les structures de stockage
* les contraintes techniques

Ce document constitue la référence backend de la V1.

---

# 2. Principes d'architecture

## Offline First

Toutes les fonctionnalités principales doivent fonctionner :

* sans Internet
* sans serveur
* sans compte

---

## Synchronisation optionnelle

Le cloud n'est pas requis.

Le stockage local reste la source de vérité.

---

## Privacy by Design

Les données sont considérées comme sensibles.

---

# 3. Vue d'ensemble des entités

User
│
├── Tasks
│ └── SubTasks
│
├── EnergyEntries
│
├── Routines
│ └── RoutineSteps
│
├── Contacts
│ └── ContactInteractions
│
├── SocialTemplates
│
├── InteractionPreparations
│ └── InteractionNotes
│
├── Events              ← hors MVP, à introduire en V1 après validation
│
├── Settings
│
└── NotificationPreference

---

# 4. Entité User

## Description

Profil principal.

---

```json
{
  "id": "uuid",
  "profile_type": "adult",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

## profile_type

Valeurs :

* teenager
* student
* adult

---

## Effet du profile_type

Le profil ne modifie ni l'architecture, ni les fonctionnalités, ni la navigation (cf. cahier Phase 13).

Il agit uniquement sur les **contenus préchargés et les exemples affichés** :

* jeux d'exemples de tâches proposés (placeholder du champ, suggestions d'onboarding)
* libellés d'exemples dans les états vides
* sélection de modèles sociaux mis en avant

Aucune donnée utilisateur n'est filtrée ou masquée selon le profil. Le profil est modifiable à tout moment sans perte de données.

---

# 5. Entité Task

## Description

Tâche utilisateur.

---

```json
{
  "id": "uuid",
  "title": "Appeler dentiste",
  "status": "inbox",
  "position": 0,
  "created_at": "datetime",
  "updated_at": "datetime",
  "completed_at": null
}
```

---

## Statuts

* inbox
* today
* later
* completed

---

## position

Entier d'ordre au sein d'un même statut.

Nécessaire pour le réordonnancement dans Aujourd'hui (E24) et l'ordre d'affichage de Plus tard (E25).

---

## Contraintes

Titre obligatoire.

Pas de priorité.

Pas de catégorie obligatoire.

---

# 6. Entité SubTask

## Description

Décomposition d'une tâche.

---

```json
{
  "id": "uuid",
  "task_id": "uuid",
  "title": "Chercher numéro",
  "is_completed": false,
  "position": 1
}
```

---

# 7. Entité EnergyEntry

## Description

Historique énergie.

---

```json
{
  "id": "uuid",
  "value": 5,
  "status": "filled",
  "entry_date": "2026-06-23"
}
```

---

## status

* filled : valeur renseignée par l'utilisateur
* skipped : check-in proposé puis ignoré ce jour-là (value = null)

---

## Contraintes

Valeurs :

1 à 10 (ou null si skipped)

Une entrée par jour.

---

## Règle de proposition

Le check-in est proposé une seule fois par jour, au premier lancement.

Si l'utilisateur ignore (status = skipped), la question n'est pas reproposée automatiquement le même jour, mais reste accessible manuellement via l'écran Énergie (E30).

La valeur par défaut proposée provient de la dernière entrée `filled`.

---

# 8. Entité Routine

## Description

Routine utilisateur.

---

```json
{
  "id": "uuid",
  "name": "Routine matin",
  "anchor": "after_wakeup",
  "created_at": "datetime"
}
```

---

## Anchors

* after_wakeup
* after_meal
* before_leaving
* before_sleep
* custom

---

# 9. Entité RoutineStep

```json
{
  "id": "uuid",
  "routine_id": "uuid",
  "title": "Boire de l'eau",
  "position": 1
}
```

---

# 10. Entité Contact

## Description

Contact social.

---

```json
{
  "id": "uuid",
  "name": "Marie",
  "desired_frequency_days": 14,
  "last_contact_date": "2026-06-01",
  "notes": ""
}
```

---

# 11. Entité ContactInteraction

```json
{
  "id": "uuid",
  "contact_id": "uuid",
  "date": "2026-06-01",
  "notes": ""
}
```

---

# 12. Entité SocialTemplate

## Description

Modèle de communication.

---

```json
{
  "id": "uuid",
  "category": "reconnect",
  "title": "Reprendre contact",
  "content": "Bonjour..."
}
```

---

## Catégories

* reconnect
* thank_you
* postpone
* decline
* confirm
* follow_up

---

# 13. Entité InteractionPreparation

## Description

Préparation d'un rendez-vous.

---

```json
{
  "id": "uuid",
  "title": "Appel CAF",
  "goal": "",
  "important_points": "",
  "information_needed": "",
  "created_at": "datetime"
}
```

---

# 14. Entité InteractionNote

```json
{
  "id": "uuid",
  "preparation_id": "uuid",
  "content": "",
  "created_at": "datetime"
}
```

---

# 14b. Entité Event — HORS MVP

## Statut

Non implémentée en MVP. À introduire en V1 après validation du MVP, une fois les fonctionnalités de base (tâches, énergie, routines) testées.

## Raison du report

Demander à l'utilisateur de saisir ses événements dans l'app en plus de son agenda existant crée une friction inutile. Le MVP peut être entièrement validé sans gestion d'événements datés.

## Description prévue

Événement futur daté, support de la gestion du temps (E80, barre temporelle, alerte de transition — cf. cahier Phase 17b).

---

```json
{
  "id": "uuid",
  "title": "Rendez-vous dentiste",
  "starts_at": "datetime",
  "transition_alert_minutes": 15,
  "created_at": "datetime"
}
```

---

## Contraintes prévues

* starts_at obligatoire
* transition_alert_minutes : délai avant l'événement déclenchant l'alerte de transition, configurable par l'utilisateur
* le temps restant est représenté visuellement (barre), jamais comme horloge absolue dominante

---

# 15. Entité NotificationPreference

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "daily_checkin": true,
  "social_reminders": true,
  "critical_reminders": true
}
```

---

# 16. Entité Settings

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "stimulation_mode": "standard",
  "dark_mode": true,
  "font_size": "medium",
  "reduced_motion": false,
  "overload_mode": false,
  "local_encryption": false
}
```

---

# 17. Stimulation Mode

Valeurs :

* calm
* standard
* dynamic

---

# 18. États du système

## Task

```text
inbox
today
later
completed
```

---

## Overload

```text
enabled
disabled
```

---

## Sync

```text
offline
pending
synced
error
```

---

# 19. Règles Métier

## Tâches Aujourd'hui

Maximum :

3

---

Si ajout d'une quatrième :

demande de remplacement.

---

## Check-in énergie

Maximum :

1 entrée par jour.

---

## Rappel social

Condition :

today - last_contact_date >
desired_frequency_days

---

## Notifications

Maximum :

2 notifications par jour.

---

# 20. Relations

## User → Task

1:N

---

## Task → SubTask

1:N

---

## User → EnergyEntry

1:N

---

## User → Routine

1:N

---

## Routine → RoutineStep

1:N

---

## User → Contact

1:N

---

## Contact → ContactInteraction

1:N

---

## User → InteractionPreparation

1:N

---

## InteractionPreparation → InteractionNote

1:N

---

## User → Event

1:N

---

# 21. Synchronisation

## Statut

Reportée post-MVP. Non implémentée en V1.

---

## Principe

Local First.

---

## Source de vérité

Base locale (IndexedDB).

---

## Cloud

Sauvegarde secondaire, optionnelle, post-MVP (Supabase région UE).

---

## Résolution conflits (à l'introduction de la sync)

Dernière modification gagne.

```text
last_write_wins
```

Stratégie initiale uniquement, réévaluée si la sync révèle des conflits réels.

---

# 22. Export JSON

Exemple :

```json
{
  "user": {},
  "tasks": [],
  "routines": [],
  "contacts": [],
  "energy": [],
  "preparations": [],
  "events": [],
  "settings": {},
  "notification_preference": {}
}
```

---

# 23. Architecture recommandée

## Frontend

React + TypeScript

Application livrée en PWA (Progressive Web App) :

* installable sur l'écran d'accueil
* plein écran
* fonctionnement hors ligne via service worker

Web d'abord, responsive mobile via navigateur.

---

## Portage mobile (Android / iOS)

Capacitor

La même PWA est empaquetée en application native pour les stores, sans réécriture ni codebase séparé.

Raison du choix : React Native imposerait un codebase distinct du web. Capacitor réutilise intégralement le code web.

---

## Base de données locale

IndexedDB via Dexie.js

Source de vérité en V1.

SQLite WASM écarté : surcoût de poids et de complexité injustifié pour ce périmètre.

---

## Chiffrement local

Web Crypto API

* algorithme AES-GCM
* clé dérivée d'un code ou mot de passe utilisateur (PBKDF2)

---

## Synchronisation (post-MVP)

Reportée après le MVP.

La V1 fonctionne en local uniquement. La sauvegarde se fait par export (JSON / PDF / CSV).

Quand le besoin multi-appareils apparaît :

* Supabase, région UE (Postgres + Auth + Storage gérés)
* RGPD-compatible
* Supabase étant open source, migration ultérieure vers un hébergement self-hosted (ex : Scaleway, OVH) possible sans refonte

Firebase écarté : hébergement US, transparence RGPD moindre, lock-in fort, contradictoire avec la Phase 19 (confidentialité renforcée).

---

## Backend

Aucun en V1 (offline-first, pas de serveur requis).

API REST introduite uniquement avec la synchronisation post-MVP.

---

# 24. Endpoints API (post-MVP)

Non utilisés en V1 (pas de serveur). Réservés à l'introduction de la synchronisation. Toutes les opérations V1 s'effectuent localement via la couche d'accès IndexedDB.

## Tasks

```http
GET /tasks

POST /tasks

PATCH /tasks/{id}

DELETE /tasks/{id}
```

---

## Routines

```http
GET /routines

POST /routines

PATCH /routines/{id}

DELETE /routines/{id}
```

---

## Contacts

```http
GET /contacts

POST /contacts

PATCH /contacts/{id}

DELETE /contacts/{id}
```

---

## Energy

```http
GET /energy

POST /energy
```

---

# 25. Sécurité

## Local

Chiffrement de la base locale via Web Crypto API.

* algorithme : AES-GCM
* dérivation de clé : PBKDF2 à partir d'un code ou mot de passe utilisateur
* la clé n'est jamais stockée en clair

Le chiffrement local est activable par l'utilisateur ; il n'est pas imposé à l'onboarding (cohérent avec la personnalisation progressive).

---

## Réseau

TLS obligatoire (uniquement pertinent à l'introduction de la sync post-MVP).

---

## Données

Aucune publicité.

Aucun tracking tiers.

Aucune revente.

---

# 26. Schéma MVP

Pour lancer un MVP il suffit de :

* User
* Task
* SubTask
* EnergyEntry
* Settings

Toutes les autres entités peuvent être ajoutées progressivement sans casser l'architecture.

---

# 27. Schéma V1 complet

User

Task

SubTask

EnergyEntry

Routine

RoutineStep

Contact

ContactInteraction

SocialTemplate

InteractionPreparation

InteractionNote

Event

Settings

NotificationPreference

---

# 28. Définition de la réussite technique

Le modèle doit permettre :

* fonctionnement hors ligne complet
* synchronisation optionnelle
* export intégral RGPD
* ajout futur des fonctionnalités V2
* aucune refonte majeure de base de données avant V2
