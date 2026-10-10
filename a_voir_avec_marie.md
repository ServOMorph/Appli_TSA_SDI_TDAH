# À voir avec Marie (rencontre du 2026-10-10)

Points restants après l'échange du 2026-10-10. Supprimer un point une fois traité. Réponses de Marie : `COMMUNICATION/Marie/historique_conversation_marie.md`.

## À lui faire tester

- **Import depuis l'écran de bienvenue sur iPhone** (bouton « Retrouver mes données », jamais testé avec le sélecteur de fichiers de Safari iOS). Sur un navigateur neuf ou en navigation privée :
  1. Exporter ses données depuis la version déployée (Paramètres > Export et import).
  2. Ouvrir l'adresse vierge, toucher « Retrouver mes données », choisir le fichier dans « Fichiers ».
  3. Vérifier l'arrivée sur l'Accueil sans repasser par l'écran d'accueil, et que ses données sont présentes.
  4. Paramètres > Vie privée : le partage doit être actif.
  5. Côté dev : le snapshot Supabase doit se mettre à jour sur le même `device_id` qu'avant.

## À trancher

- **Import des données sans clic (cause inconnue).** Ses données sont apparues directement dans l'appli, sans « Retrouver mes données ». Elle avait exporté avant. Adresse neuve ou habituelle : non précisé. Aucun mécanisme d'import automatique trouvé dans le code.
- **Mot de passe administrateur.** Empreintes `marie` et `dev` posées dans `adminCredentials.ts` (non commitées). Reste : saisie du mot de passe dans Paramètres > Profil sur chaque appareil admin ; défauts a)-c) de `signals.md` ; réparer le test e2e T58 (`e2e/10-feedback.spec.ts`) avec `tester_code: 'dev'` et `admin_key: ADMIN_CREDENTIAL_HASHES.dev`, sans mot de passe dans les tests ; ajouter T58b (un profil non admin ne voit pas « Signaler un retour ») ; retirer la section « T58 en échec » de `tests_manuels.md`.

## Décisions reçues, à implémenter (`roadmap_retours_2026-10-10.md`)

- **Phase 5, Livret `17f8fcae` (E77)** : un ajout à une catégorie d'un livret se prélève sur le solde non réparti du livret (« montant total »).
- **Phase 6, Dépense `c2143fff` (E21)** : décocher la tâche garde la dépense.

## À annoncer dans le message de livraison de la v6.11

- Déjà dit oralement : « Nouveautés » dans Paramètres ; code testeur à ne pas ressaisir. Le message de livraison doit encore le mentionner (`signals.md`, entrée [P1] message Discord).
