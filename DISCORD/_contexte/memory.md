# Mémoire discord
<!-- Fichier géré via /create_memory. Ne pas modifier manuellement sauf pour supprimer des entrées. -->

## 2026-09-06 — Pièces jointes ≠ messages isolés pour Marie
Toujours analyser les images/vidéos/fichiers en conjonction avec le message texte de Marie — ils se complètent, ne se suffisent pas isolément. Quand Marie envoie un message à la gateway, vérifier systématiquement `inbox/orchestrateur/` pour les pièces jointes associées, surtout si le texte est vague ou elliptique (ex: « ça ne d'envoi pas »). Incident du 2026-09-06 : message textuel ambigu reçu en commande Discord, pièce jointe PNG en attente en inbox/orchestrateur, analyse conjointe a clarifié le retour utilisateur E10 (layout sous-tâches + problème d'envoi).
