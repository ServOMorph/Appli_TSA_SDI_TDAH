# Plan de test et dépouillement multi-testeurs

Zone : ONBOARD · Phase 3 de `roadmap_accueil_testeurs.md` · Rédigé le 2026-09-05.

## 1. Répartition des parcours du catalogue entre testeurs

État du catalogue (`src/domain/data/manualTestsCatalog.ts`) au 2026-09-05 — chiffre daté, à
recompter à chaque cycle, le catalogue évolue :

| Catégorie | Nombre de parcours |
|---|---|
| Accueil / Planning | 9 |
| Tâches | 7 |
| Outils : Budget | 6 |
| Outils : Listes | 8 |
| Outils : autres | 0 (catégorie déclarée, aucun parcours actuellement) |
| Énergie | 2 |
| Paramètres / Profil | 8 |
| **Total** | **40** |

**Principe de répartition** : avec 2 à 5 testeurs et sans outil de suivi automatisé (décision 3),
la répartition est manuelle, décidée par la coordination (TESTS) à chaque cycle, selon deux
règles :

- Un testeur reçoit un **bloc de catégories complet** plutôt que des parcours épars entre
  catégories — limite le changement de contexte, cohérent avec le profil AuDHD visé (décision 3).
- La **catégorie Budget** n'est jamais confiée à un seul testeur isolément : elle touche des
  montants et un usage plus personnel, retenue comme catégorie sensible (cf. redondance
  ci-dessous).

**Redondance volontaire sur les parcours sensibles** : est sensible un parcours de la catégorie
Budget, ou tout parcours modifié récemment (portant un `docRefs` issu d'une livraison des
dernières 2 semaines). Ces parcours sont assignés à au moins 2 testeurs indépendants par cycle,
les autres à un seul.

## 2. Rythme attendu

Le cycle de dépouillement suit le rythme des livraisons (`/deploy`), déjà en place pour Marie :
un cycle = une version déployée. Ce choix évite d'introduire un second rythme calendaire
indépendant du cycle de développement, et garde le nombre de « tests à faire » annoncé à Marie
dans le gabarit de livraison comme référence commune aux deux groupes.

## 3. Procédure de dépouillement de N snapshots

**Bloquant actuel (R1, `roadmap_accueil_testeurs.md`)** : `scripts/backup_marie_snapshot.py` ne
retient qu'un appareil (`select_target = max(rows, key=len(manual_test_results))`). Avec
plusieurs testeurs, les snapshots des autres sont ignorés — perte silencieuse, pas une simple
gêne. Tant que la demande d'évolution D3 (`demandes_evolution.md`) n'est pas livrée, la procédure
de repli suivante s'applique :

1. Récupérer manuellement chaque ligne de snapshot Supabase correspondant à un testeur actif du
   cycle (identification par code testeur une fois D1 livré ; à défaut, par recoupement manuel
   date de dernière activité / device_id).
2. Extraire le tableau `manualTestResults` de chaque ligne.
3. Fusionner les résultats dans le journal de suivi, chaque entrée taguée de l'identifiant du
   testeur d'origine.
4. Signaler les doublons (même parcours, même testeur, deux résultats à des dates différentes) :
   conserver le plus récent, archiver l'historique plutôt que l'écraser.

**Coût de la procédure de repli** : hypothèse non mesurée, à vérifier au premier cycle réel —
de l'ordre de 5 à 10 minutes par testeur et par cycle (identification de la ligne, extraction,
fusion), soit 10 à 50 minutes par cycle pour un groupe de 2 à 5 testeurs, contre un traitement
automatique de quelques secondes pour une seule testeuse aujourd'hui. Ce chiffre justifie la
priorité donnée à D3 dans `demandes_evolution.md`, sans s'y substituer.

## 4. Règle de réconciliation en cas de divergence

Deux testeurs sur le même parcours, résultats différents (l'un Validé, l'autre Non validé) :

- Le retour **Non validé prévaut par défaut** — principe de précaution, un bug rapporté n'est pas
  invalidé par l'absence de reproduction chez un autre testeur.
- Le parcours est classé « à reproduire », pas « clos ».
- Marie, référente/validatrice (décision 4), tranche en dernier ressort si une nouvelle tentative
  de reproduction échoue des deux côtés.

## 5. Critère de promotion d'un retour en demande produit

Un retour « Non validé » devient une demande produit quand les deux conditions sont réunies :

- reproduit par un second testeur, ou confirmé reproductible par Marie ;
- le commentaire du testeur décrit un comportement observable et son écart à l'attendu (pas une
  formulation du type « ça ne marche pas » sans détail).

À défaut, le retour reste enregistré mais non promu, en attente de reproduction à un cycle
suivant.

## 6. Traitement d'un testeur inactif

- **Inactif** : aucune synchronisation détectée sur 2 cycles de dépouillement consécutifs.
- **Action** : une relance individuelle sur le canal Discord testeurs de ce testeur (jamais de
  relance groupée, décision 3).
- **Si l'inactivité persiste** un cycle de plus après relance : ses parcours assignés sont
  retirés de la couverture visée du cycle suivant et réassignés à un autre testeur, pour ne pas
  fausser le calcul de couverture. Le testeur n'est pas retiré du groupe pour autant — suivi
  individuel, pas de sanction automatique (décision 3).

---

## Gate de sortie de la Phase 3

Le plan couvre l'intégralité des 7 catégories du catalogue existant, y compris « Outils : autres »
bien qu'elle ne contienne aucun parcours au 2026-09-05 (règle de répartition et de redondance
applicable dès qu'un parcours y sera ajouté). Chaque retour est traçable depuis son émission
(identifiant testeur, § 1 et § 3) jusqu'à sa décision produit (§ 4 et § 5).
