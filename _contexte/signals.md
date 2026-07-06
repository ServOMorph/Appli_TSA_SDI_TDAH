# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-06)

## Actions ouvertes

### Phase 7 — Tests utilisateurs (1/5–10 sessions)
- [P2|ouvert] Sessions test 2 à 5+ avec Marie et autres testeurs AuDHD
  - fait quand: 5 à 10 sessions réalisées, retours consolidés dans fichier dédié
  - réf: `Note de réunion/2026-06-29/synthese_reunion_marie_2026-06-29.md` + `Note de réunion/2026-06-29/analyse_conduite_visio_marie.md`

### V2 — En cours (clôture)
- [P2|ouvert] Phase V2-10 (Consolidation V2 & 2e vague de tests) — reste : mode offline (13.2), doc V2, déploiement Netlify
  - fait quand: mode offline retesté, doc V2 rédigée, déployé sur Netlify
  - réf: `roadmap_v2.md` Phase V2-10 et § "Constats test manuel V2-10 (session 2026-07-06)"
- [P3|ouvert] Ajouter un champ nom de profil à l'onboarding (`E02Profile` : choix de type de profil seulement, aucune saisie de nom)
  - fait quand: décision produit prise (implémenter ou explicitement abandonner)
  - réf: `roadmap_v2.md` § "Constats test manuel V2-10" sous-section "Fonctionnalités manquantes / à implémenter"

### V3 — Démarrage (post-visio Marie 2026-07-06)
- [P1|ouvert] Roadmap V3 créée (`Note de réunion/2026-06-07/roadmap_v3.md`), aucune phase démarrée
  - Contenu : refonte énergie/cuillères + tâches obligatoires + surcharge automatique (câble enfin `essential`, ferme le trou fonctionnel `toggleEssentialV2`), bugs planning, nettoyage dashboard/listes, nav persistante. Détail complet dans `constats_2026-07-06.md`, `analyse_code_2026-07-06.md`, `plan_implementation_2026-07-06.md` (même dossier).
  - fait quand: Phase V3-0 (refacto préalable) démarrée
  - réf: `Note de réunion/2026-06-07/roadmap_v3.md`
- [P1|ouvert] Décisions produit à valider avec Marie avant d'implémenter V3-1 : Q1 (limite 3 tâches/jour) et surtout Q2 (ambiguïté "Aujourd'hui" vs "Tâche du jour" — transcription contradictoire, bloque D3/D4)
  - fait quand: réponses de Marie obtenues et actées dans `roadmap_v3.md`
  - réf: `Note de réunion/2026-06-07/constats_2026-07-06.md` § 7
- [P2|ouvert] Confirmer la stratégie de reset/migration des données V2 existantes de Marie avant le bump Dexie v3
  - fait quand: stratégie actée (reset accepté ou migration) et consignée dans `roadmap_v3.md` Phase V3-0
  - réf: `analyse_code_2026-07-06.md` § 5
- [P3|ouvert] Planification indépendante des sous-tâches (chaque `SubTask` planifiable à son propre horaire) — décision explicitement reportée
  - fait quand: décision produit prise sur l'implémentation (piste retenue si besoin confirmé : chaque sous-tâche devient sa propre `TaskV2` avec `parent_task_id` optionnel)
  - réf: `roadmap_v2.md` § "Fonctionnalité reportée (décision 2026-07-06)"

## Questions ouvertes

## Échéances

## Blocages
Aucun.

## Contexte chaud
- Décision énergie obtenue de Marie lors de la visio du 2026-07-06 : usage réel = coût d'énergie par tâche (1-12, "cuillères"), tâches obligatoires (`essential`), surcharge automatique dérivée de l'énergie du jour vs coûts planifiés. Détaillé et planifié dans `roadmap_v3.md`.
- Nouvelle commande `/analyse_visio <dossier-réunion>` créée (`.claude/commands/analyse_visio.md`) : automatise transcription + captures + code → constats/analyse_code/plan/roadmap versionnée (bump auto du numéro de version). Nécessite Opus (vérifié en étape 0).
- `dist/v2/` à jour (export corrigé + créneaux 30 min inclus) ; `vite.config.ts` fixe désormais `build.outDir: 'dist/v2'`
- Serveur de test téléphone : `npx vite preview --host --outDir dist/v2`, adresse réseau `http://192.168.1.180:4173` (même Wi-Fi). Penser à vider le cache du site / désinstaller la PWA sur le téléphone après chaque nouveau build
- 339/339 tests unitaires, `tsc -b` clean (aucun changement de code cette session, uniquement docs + commande)

## Dernière session (2026-07-06)

## Décisions prises
- Commande `/analyse_visio` créée pour automatiser l'analyse des futures visios testeurs (transcription + code + captures → constats/plan/roadmap).
- Roadmap V3 créée et priorisée à partir de la visio Marie du 2026-07-06 : succède à `roadmap_v2.md`, ordonnée pour que chaque phase soit testable sans dépendre d'une phase future.

## Livrables produits ou modifiés
- `.claude/commands/analyse_visio.md` : nouvelle commande (analyse transcription + code, bump auto de version, roadmap à cases à cocher)
- `Note de réunion/2026-06-07/constats_2026-07-06.md` : constats détaillés de la visio (bugs, refonte énergie, nettoyage UI, décisions à trancher)
- `Note de réunion/2026-06-07/analyse_code_2026-07-06.md` : état du code impacté, dettes techniques, refacto préalable proposée
- `Note de réunion/2026-06-07/plan_implementation_2026-07-06.md` : ordre d'implémentation justifié
- `Note de réunion/2026-06-07/roadmap_v3.md` : roadmap V3, 10 phases (V3-0 à V3-9), gate commun par phase

## Hypothèses validées / invalidées
- VALIDE : le check-in énergie à chaque connexion n'existe pas dans le code (`init()` route directement vers le dashboard) — à construire en V3-4
- VALIDE : le champ `essential` (`TaskV2`) existe mais n'est câblé à aucune UI — correspond exactement au "obligatoire" demandé par Marie, réutilisable en V3-3
- EN ATTENTE : Q2 (ambiguïté "Aujourd'hui" vs "Tâche du jour") à trancher avec Marie avant V3-1

## Prochaine étape exacte
Valider Q1/Q2/stratégie de reset avec Marie, puis démarrer Phase V3-0 (refacto préalable) de `roadmap_v3.md`.

## Question bloquante pour la session suivante
Q2 : faut-il retirer le segment de nav "Aujourd'hui" du dashboard ET renommer la destination de création en "Tâche du jour" ? La transcription se contredit (l.254-273 vs l.383-397) — à confirmer explicitement avec Marie avant d'implémenter D3/D4.
