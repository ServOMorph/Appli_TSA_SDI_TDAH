# Signals — Appli_TSA_SDI_TDAH   (MAJ 2026-07-19)



## Actions ouvertes

### V4 — Roadmap active (racine `roadmap_v4.md`), issue de la visio Marie 2026-07-16
- [P1|ouvert] Corriger B3 (retour depuis `E21CreateTaskV2` toujours vers Todo au lieu de l'écran d'origine) et B4 (bouton « Mode surcharge » doit ouvrir une modale d'explication avec bouton Fermer, pas un texte inline), puis repasser le test manuel V4-1 et clore le gate
  - fait quand: B3/B4 codés, `validation_manuelle.md` repassé intégralement, doc à jour
  - réf: `roadmap_v4.md` Phase V4-1 ; `src/ui/screens/tasks/E21CreateTaskV2.tsx` (retour) ; `src/ui/components/TopBar.tsx` (modale)
- [P3|ouvert] E3 — module budget/comptes + rubrique « Outil » remplaçant « Todo » : cadrage produit complet requis (gros chantier, reporté)
  - fait quand: cadrage fait avec Marie (périmètre, structure des données comptes, arborescence Outil)
  - réf: `Note de réunion/2026-07-16/constats_2026-07-18.md` E3 ; `roadmap_v4.md` § Reporté hors V4
- [P3|ouvert] Faire le ménage à la racine du projet
  - fait quand: fichiers/dossiers non pertinents à la racine identifiés et supprimés ou déplacés
  - réf: `roadmap_v4.md` § Divers (hors phases)

### V2 — reste en parallèle (branche `v2`)
- [P2|ouvert] Finaliser V2-10 : doc V2, déploiement Netlify — en suspens depuis le début du développement V3
  - fait quand: doc V2 à jour, déploiement Netlify effectué
  - réf: `Archives/roadmap_v2.md`

### Tests e2e
Aucune action ouverte. 44/44 tests e2e verts (état V3, code inchangé depuis le 2026-07-09). **À surveiller dès le codage de V4-2/V4-3/V4-4** : ces phases suppriment ou modifient des éléments ciblés par les specs (bouton « Terminer », « Répéter demain », mécanisme de « Reporter ») — gates e2e explicitées dans `roadmap_v4.md`.

## Questions ouvertes
- E3 seule question restante (`roadmap_v4.md` § Q à trancher) : cadrage produit complet requis, gros chantier reporté.

## Échéances

## Blocages
Aucun.

## Contexte chaud
- **Phase V4-1 codée mais gate non clos** : D2, E7 (déclenchement grisé/coloré), D4 validés au test manuel du 2026-07-19. Deux écarts trouvés lors du test manuel, à corriger avant de cocher le gate : B3 (nav retour) et B4 (E7 doit être une modale, pas un paragraphe inline).
- `taskCreateOrigin`/`setTaskCreateOrigin` ajoutés à `AppContext.tsx` pour D4 (filtrage de la destination « Planifier » selon l'écran d'origine) — réutilisable pour corriger B3 (le bouton Retour de `E21CreateTaskV2.tsx` doit s'appuyer dessus au lieu de toujours viser `inbox`).
- `validation_manuelle.md` (racine) : réécrit pour la Phase V4-1 (remplace la version V4-0, qui était déjà close) — checklist B3/B4 à ajouter avant le prochain passage.
- Nav persistante : `BottomNav` rend une nav vide quand `overloadMode` est actif — toujours vrai en V4, piège pour les tests e2e.
- Serveur de test téléphone (dev) : `npm run dev -- --host`, adresse réseau affichée dans le terminal. Bouton « Reset DB » (dev) pour repartir d'une base propre avant test.

## Dernière session (2026-07-19)

## Décisions prises
- Phase V4-1 (D2, E7, D4) codée intégralement, 383/383 tests verts, `tsc -b` clean.
- Test manuel V4-1 partiellement passé par l'utilisateur : D2, D4 et le déclenchement visuel d'E7 validés.
- Écart constaté sur E7 : le clic sur le bouton « Mode surcharge » (actif ou inactif) doit ouvrir une **modale** d'explication détaillée avec un bouton pour la fermer, au lieu du paragraphe inline actuellement codé — noté B4, à corriger avant de clore le gate V4-1.
- Bug de navigation signalé par l'utilisateur : depuis le Dashboard, « Ajouter une tâche » ouvre `E21CreateTaskV2` (E21v2) ; le bouton Retour ramène vers Todo (`E20Inbox`) au lieu du Dashboard — noté B3, intégré à la Phase V4-1 (mécanisme `taskCreateOrigin` déjà en place, réutilisable pour la correction).
- Tâche de nettoyage de la racine du projet ajoutée à la roadmap (section « Divers (hors phases) »), non bloquante pour V4.

## Livrables produits ou modifiés
- `src/ui/screens/energy/E31EnergyCheckIn.tsx`, `onboarding/E03Energy.tsx`, `energy/E30EnergyView.tsx` : D2, « aujourd'hui » → « maintenant »
- `src/ui/components/TopBar.tsx` : E7, bouton surcharge permanent (grisé/coloré), explication dans les deux états (inline — à remplacer par une modale, voir B4)
- `src/app/AppContext.tsx` : ajout `taskCreateOrigin`/`setTaskCreateOrigin`
- `src/ui/screens/tasks/E20Inbox.tsx`, `E24Today.tsx`, `E21CreateTaskV2.tsx`, `src/App.tsx` : D4, filtrage de la destination « Planifier » selon l'origine
- `src/test/testUtils.tsx`, `src/ui/screens/dashboard/E10Dashboard.test.tsx` : mocks et tests mis à jour pour E7/D4
- `validation_manuelle.md` (racine) : réécrit pour la Phase V4-1 (D2/E7/D4 + non-régression)
- `roadmap_v4.md` : Phase V4-1 — D2/E7/D4 cochés, B3/B4 ajoutés en items ouverts, gate partiellement coché ; section « Divers (hors phases) » ajoutée (ménage racine)
- `a faire.txt` (racine) : intégré à la roadmap (B3, B4, ménage racine) puis supprimé

## Hypothèses validées / invalidées
- VALIDE : D2 (libellés « maintenant »), D4 (pas de « Planifier » depuis Todo), E7 dans son principe (bouton permanent, grisé/coloré)
- INVALIDE : E7 sous forme de texte inline au clic -> pivot vers une modale dédiée (B4)
- EN ATTENTE : cadrage du module budget (E3)

## Prochaine étape exacte
Corriger B3 (retour `E21CreateTaskV2` vers l'écran d'origine) et B4 (modale d'explication E7), repasser `validation_manuelle.md`, puis clore le gate V4-1 et démarrer la Phase V4-2.

## Question bloquante pour la session suivante
Aucune — E3 reste ouverte (gros chantier reporté, sans impact sur V4-1 à V4-5) ; B3/B4 sont des corrections à faire, pas des questions.
