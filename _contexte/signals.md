# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-18)



## Actions ouvertes

### V4 — Roadmap active (racine `roadmap_v4.md`), issue de la visio Marie 2026-07-16
- [P1|ouvert] Démarrer le codage : Phase V4-0 (refacto préalable — R1 span créneaux, R2 `--color-accent`) sur la branche `v4`
  - fait quand: V4-0 codée, gate passé (tests verts, `tsc -b` clean, planning/boutons visuellement identiques à la V3)
  - réf: `roadmap_v4.md` Phase V4-0
- [P2|ouvert] B1 — périmètre de l'accent d'ambiance (tous les boutons primaires vs les 2 boutons cités) à trancher avec Marie
  - fait quand: réponse obtenue, R2/V4-1 ajusté si besoin
  - réf: `roadmap_v4.md` § Q à trancher (B1)
- [P2|ouvert] E2 — gestion du chevauchement de plage + comptage du coût énergétique (une fois par tâche vs par créneau) à trancher avec Marie
  - fait quand: réponse obtenue ; bloque V4-3 (E2b/E2c)
  - réf: `roadmap_v4.md` § Q à trancher (E2)
- [P2|ouvert] E8 — confirmer avec Marie le remplacement du report automatique au lendemain par un choix de créneau vide dans le planning
  - fait quand: réponse obtenue ; bloque V4-4 (E8)
  - réf: `roadmap_v4.md` § Q à trancher (E8)
- [P2|ouvert] E9 — structure de données des sous-tâches planifiables (rattachées au parent vs `parent_task_id` indépendant)
  - fait quand: décision actée ; bloque V4-5 (E9a) et sa migration
  - réf: `roadmap_v4.md` § Q à trancher (E9)
- [P3|ouvert] E3 — module budget/comptes + rubrique « Outil » remplaçant « Todo » : cadrage produit complet requis (gros chantier, reporté)
  - fait quand: cadrage fait avec Marie (périmètre, structure des données comptes, arborescence Outil)
  - réf: `Note de réunion/2026-07-16/constats_2026-07-18.md` E3 ; `roadmap_v4.md` § Reporté hors V4

### V2 — reste en parallèle (branche `v2`)
- [P2|ouvert] Finaliser V2-10 : doc V2, déploiement Netlify — en suspens depuis le début du développement V3
  - fait quand: doc V2 à jour, déploiement Netlify effectué
  - réf: `Archives/roadmap_v2.md`

### Tests e2e
Aucune action ouverte. 44/44 tests e2e verts (état V3, code inchangé depuis le 2026-07-09). **À surveiller dès le codage de V4-2/V4-3/V4-4** : ces phases suppriment ou modifient des éléments ciblés par les specs (bouton « Terminer », « Répéter demain », mécanisme de « Reporter ») — gates e2e explicitées dans `roadmap_v4.md`.

## Questions ouvertes
- Voir section « Q à trancher » de `roadmap_v4.md` (B1, E2, E8, E9, E3) — à valider avec Marie, chacune bloquant sa phase respective (aucune ne bloque le démarrage de V4-0).

## Échéances

## Blocages
Aucun.

## Contexte chaud
- **Branche `v4` créée et active** (depuis `v3`). `roadmap_v3.md` archivé (`Archives/roadmap_v3.md`), `roadmap_v4.md` promu à la racine — roadmap active, aucune phase codée à ce stade.
- **Visio Marie du 2026-07-16** : a répondu aux 4 points V3 en attente (Reporter, fréquence check-in, bouton surcharge, sous-tâches) + apporté de nouveaux constats. Roadmap V4 entièrement reconstruite sur cette base (6 phases, V4-0 à V4-5).
- Écart identifié entre le codé et le voulu : l'action « Reporter » avance aujourd'hui automatiquement au lendemain même créneau (`postponeTaskV2`) ; Marie attend un choix explicite de créneau vide dans le planning (E8, réutilise le flux de déplacement E6).
- Couleur d'ambiance (`Settings.ambiance_color`) toujours non propagée aux boutons primaires (B1) — cause racine identifiée : pas de variable CSS globale injectée, chaque composant relit `settings.ambiance_color` isolément. Refacto prévue en V4-0/R2 (`--color-accent`).
- `TaskV2` porte déjà `scheduled_start`/`scheduled_end` (`taskV2.ts`) mais `E40Planning.tsx` ne raisonne qu'au créneau de début (`taskSlot`) — base de la phase V4-0/R1 (E2).
- Nav persistante : `BottomNav` rend une nav vide quand `overloadMode` est actif — toujours vrai en V4, piège pour les tests e2e.
- Serveur de test téléphone (dev) : `npm run dev -- --host`, adresse réseau affichée dans le terminal. Bouton « Reset DB » (dev) pour repartir d'une base propre avant test.

## Dernière session (2026-07-18)

## Décisions prises
- Roadmap V4 produite à partir de la visio Marie 2026-07-16 (`/analyse_visio`), révisée après relecture critique : ordre des phases multi-créneaux/interactions inversé, retrait de « Répéter demain » regroupé avec son remplaçant (E5) dans la même phase.
- Branche `v4` créée depuis `v3` et activée.
- `roadmap_v3.md` archivé (`Archives/`), `roadmap_v4.md` promu à la racine comme roadmap active.

## Livrables produits ou modifiés
- `Note de réunion/2026-07-16/constats_2026-07-18.md` : créé — 17 constats + retours positifs
- `roadmap_v4.md` (racine) : créé (6 phases V4-0 à V4-5), corrigé (ordre, gates e2e, réutilisation E6/E8), déplacé depuis `Note de réunion/2026-07-16/`
- `Archives/roadmap_v3.md` : archivé (déplacé depuis la racine)
- Branche git `v4` : créée, active

## Hypothèses validées / invalidées
- VALIDE : fréquence du check-in énergie une fois par jour confirmée par Marie (pas à chaque connexion)
- VALIDE : retrait de « Répéter demain » confirmé, remplacé par l'ajout en continu (E5)
- VALIDE : bouton « Mode surcharge » doit être visible/grisé hors surcharge — confirme la demande initiale de Marie, contredite par le retrait du 2026-07-07
- VALIDE : sous-tâches planifiables souhaitées, avec affichage hiérarchique impératif (pas comme tâche autonome)
- INVALIDE : glisser une tâche vers la veille (E1) — Marie s'est reprise en séance, abandonné
- EN ATTENTE : périmètre B1, gestion chevauchement/comptage E2, confirmation du nouveau mécanisme de Reporter (E8), structure de données des sous-tâches (E9), cadrage du module budget (E3)

## Prochaine étape exacte
Démarrer le codage de la Phase V4-0 (refacto préalable : R1 span créneaux, R2 `--color-accent`) sur la branche `v4`, en basculant sur Opus (`/model opus`) comme l'exige la phase.

## Question bloquante pour la session suivante
Aucune — les 5 questions ouvertes bloquent chacune leur phase spécifique, aucune ne bloque le démarrage de V4-0.
