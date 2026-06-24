# Roadmap — Appli_TSA_SDI_TDAH

Version : 1.0 — MAJ 2026-06-23

## Légende statut
- `[ ]` non démarrée
- `[~]` en cours
- `[x]` terminée (gate validé)

## Principes de pilotage

- **Vibecoding optimal** : code clair, fortement découpé (domaine pur isolé de l'infra/UI), petites unités testables. Chaque phase laisse le code dans un état propre avant de passer à la suivante.
- **Couverture cible 85 %** : gate par phase. Aucune phase n'est close si la couverture du code qu'elle ajoute passe sous 85 %. Un audit global de couverture est fait en fin de MVP.
- **Tests manuels obligatoires** : aucune phase à UI n'est close sans validation manuelle du parcours réel dans l'app.
- **Refacto planifiée** : phases de consolidation dédiées + refacto continue en fin de chaque phase fonctionnelle.
- **Documentation continue** : chaque phase met à jour la doc concernée (README, ADR, schéma données).
- **Offline-first strict** : tout doit fonctionner sans serveur ni compte jusqu'à la V2.

### Définition de fait (gate commun à chaque phase)
1. Livrables fonctionnels produits
2. Tests unitaires/composants écrits, couverture ≥ 85 % sur le code ajouté
3. Refacto de fin de phase appliquée (code découpé, sans dead code, sans duplication)
4. Documentation mise à jour
5. Test manuel du parcours validé (si UI)
6. Critère de sortie de la phase atteint

---

# MVP

Entités : User, Task, SubTask, EnergyEntry, Settings.
Réf : `_docs/docs de dev/6- MODÈLE DE DONNÉES & ARCHITECTURE BACKEND.md` §26.

## [x] Phase 0 — Initialisation & socle technique

- [x] Init Vite + React + TypeScript
- [x] Outillage : ESLint, Prettier, Vitest + coverage (seuil 85 % configuré), Testing Library
- [x] Structure de dossiers découplée : `domain/` (logique pure), `data/` (Dexie/repositories), `ui/` (composants/écrans), `crypto/`, `app/`
- [x] Config PWA (manifest, service worker Vite)
- [x] Wrapper chiffrement Web Crypto (AES-GCM, dérivation PBKDF2)
- [x] **Doc** : README (lancement local), ADR-001 (stack), ADR-002 (architecture en couches)
- [x] **Tests** : smoke test du harness, test unitaire du wrapper crypto
- [x] **Test manuel** : `npm run dev` lance l'app ; PWA installable ; build prod OK
- [x] **Sortie** : `package.json` créé, app se lance, Dexie initialisée avec les 5 entités MVP

## [ ] Phase 1 — Couche données & domaine

- [ ] Schéma Dexie des 5 entités + migrations
- [ ] Repositories CRUD (un par entité), chiffrement transparent des champs sensibles
- [ ] Domaine pur (sans dépendance Dexie/UI) :
  - [ ] cascade "Action immédiate" (déterministe, 4 étapes — réf User Flows / Doc 2)
  - [ ] calcul cuillères / énergie (réf Doc 3, calcul E10)
  - [ ] règle limite 3 tâches/jour, état `skipped` énergie
- [ ] **Refacto** : garantir l'isolement domaine ↔ infra (aucun import Dexie dans `domain/`)
- [ ] **Doc** : ADR sur la séparation domaine/infra, doc des règles métier
- [ ] **Tests** : couverture du domaine ≥ 85 % (priorité absolue — c'est le cœur logique)
- [ ] **Test manuel** : script/console de vérification des règles métier (pas d'UI)
- [ ] **Sortie** : CRUD des 5 entités opérationnel + persistance chiffrée vérifiée

## [ ] Phase 2 — Onboarding + Dashboard

- [ ] Écrans E01–E04 (bienvenue, profil, estimation énergie, première tâche)
- [ ] Écran E10 (dashboard) + affichage Action immédiate + cuillères + tâches du jour
- [ ] États D10A (vide) / D10B (surcharge)
- [ ] **Refacto** : extraction des composants UI réutilisables (boutons, cartes, layout)
- [ ] **Doc** : doc des composants partagés
- [ ] **Tests** : tests composants + parcours onboarding (couverture ≥ 85 %)
- [ ] **Test manuel** : parcours onboarding complet jusqu'au dashboard peuplé
- [ ] **Sortie** : un nouvel utilisateur arrive sur un dashboard fonctionnel

## [ ] Phase 3 — Gestion des tâches

- [ ] Écrans E20 (inbox) → E25 (plus tard) : création, détail, décomposition en SubTasks, "Aujourd'hui", "Plus tard"
- [ ] États inbox vide, limite 3 tâches atteinte
- [ ] Modale M01 (suppression) / M04 (remplacement Aujourd'hui)
- [ ] **Refacto** : factoriser la logique de liste/filtre tâches
- [ ] **Doc** : mise à jour doc parcours tâches
- [ ] **Tests** : couverture ≥ 85 %
- [ ] **Test manuel** : créer, décomposer, planifier, supprimer une tâche
- [ ] **Sortie** : cycle de vie complet d'une tâche utilisable

## [ ] Phase 4 — Gestion de l'énergie

- [ ] Écrans E30 (énergie) + E31 (check-in quotidien) + skip énergie
- [ ] Intégration énergie ↔ Action immédiate
- [ ] **Refacto** : n/a (module court — inclus dans Phase 6 si besoin)
- [ ] **Tests** : couverture ≥ 85 %
- [ ] **Test manuel** : check-in, skip, impact sur le dashboard
- [ ] **Sortie** : suivi énergie quotidien fonctionnel

## [ ] Phase 5 — Paramètres, accessibilité, surcharge, export

- [ ] Paramètres MVP : E111 (profil), E112 (accessibilité), E113 (stimulation cognitive), E114 (organisation), E116 (confidentialité), E117 (export)
- [ ] E90 (centre récupération / mode surcharge)
- [ ] Export JSON intégral (conformité RGPD), M05/M06
- [ ] **Refacto** : centraliser l'état Settings et son application (thème, accessibilité)
- [ ] **Doc** : doc accessibilité + procédure export/suppression données
- [ ] **Tests** : couverture ≥ 85 %, dont test de l'export intégral
- [ ] **Test manuel** : changer réglages d'accessibilité, activer surcharge, exporter et supprimer les données
- [ ] **Sortie** : app paramétrable, export RGPD vérifié

## [ ] Phase 6 — Consolidation MVP (refacto + couverture globale + offline)

- [ ] **Refacto d'architecture** : audit du découpage global, suppression dead code/duplication, normalisation du nommage, revue des limites de couches
- [ ] **Couverture** : atteindre **85 % global** (et non plus seulement par phase)
- [ ] **PWA / offline-first** : tests offline complets (coupure réseau, rechargement, persistance)
- [ ] **Doc** : documentation MVP finale (README à jour, schéma données consolidé, guide contributeur)
- [ ] **Test manuel** : parcours bout-en-bout hors ligne, sur navigateur desktop + mobile
- [ ] **Sortie** : MVP stable, couvert à 85 %, fonctionnel hors ligne

## [ ] Phase 7 — Tests utilisateurs AuDHD

Réf : `_docs/docs de dev/4- WIREFRAMES BASSE FIDÉLITÉ.md` §23.

- [ ] 5 à 10 sessions de test avec utilisateurs AuDHD réels
- [ ] Documentation des résultats, friction, ajustements prioritaires
- [ ] **Sortie** : retours consolidés, backlog d'ajustements pré-V1 priorisé

---

# V1 — post-validation MVP

Ajout progressif des entités restantes sans refonte de base (réf Doc 6 §27).
Chaque module ci-dessous reprend le gate commun (tests 85 %, refacto, doc, test manuel).

## [ ] Phase 8 — Routines

- [ ] Entités Routine, RoutineStep
- [ ] Écrans E40–E44 (liste, création, détail, active, ancre)
- [ ] **Sortie** : création et exécution d'une routine fonctionnelles

## [ ] Phase 9 — Module social

- [ ] Entités Contact, ContactInteraction
- [ ] Écrans E50–E54 + suggestion de reconnexion
- [ ] **Sortie** : gestion des contacts et historique d'interactions fonctionnels

## [ ] Phase 10 — Modèles sociaux & préparation d'interactions

- [ ] Entités SocialTemplate, InteractionPreparation, InteractionNote
- [ ] Écrans E60–E61, E70–E73
- [ ] **Sortie** : préparation et clôture d'une interaction fonctionnelles

## [ ] Phase 11 — Gestion du temps (Event) + notifications

- [ ] Entité Event (réf Doc 6 §14b) ; écrans E80–E81
- [ ] NotificationPreference + centre notifications E100 (push max 2/j vs suggestion in-app)
- [ ] **Sortie** : gestion des événements et notifications fonctionnelles

## [ ] Phase 12 — Consolidation V1

- [ ] Refacto d'architecture globale, couverture 85 % global sur le périmètre V1
- [ ] Doc V1 complète
- [ ] **Test manuel** : parcours bout-en-bout de l'app complète hors ligne
- [ ] **Sortie** : V1 stable, couverte à 85 %, prête pour validation utilisateurs

---

# V2 — sync & mobile

## [ ] Phase 13 — Synchronisation cloud

- [ ] API REST + sync optionnelle (Supabase région UE — réf Doc 6 §21, §24)
- [ ] Stockage local reste source de vérité ; gestion conflits/états sync
- [ ] Sécurité : TLS, chiffrement en transit (Doc 6 §25)
- [ ] Tests 85 %, doc sync
- [ ] **Test manuel** : scénarios en ligne / hors ligne / conflit
- [ ] **Sortie** : sync optionnelle fonctionnelle sans perte de données

## [ ] Phase 14 — Portage mobile Capacitor

- [ ] Build Android/iOS sur la même base web
- [ ] Tests sur appareils réels
- [ ] **Sortie** : app installable sur Android et iOS
