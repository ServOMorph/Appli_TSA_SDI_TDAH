# Étape 12 — Ajouter la commande CLI `corriger`

Étendre **uniquement** `scripts/test_process_manual.py` et son test pour couvrir le second parcours réel du Flux A : `RECU → ANALYSE → CORRECTIONS` avec `action='corriger'`.

**Critère de fin :** le CLI retourne `0`, affiche `état final = CORRECTIONS`, le journal contient `etat="CORRECTIONS"`, et le test existant `integrer` reste vert.
