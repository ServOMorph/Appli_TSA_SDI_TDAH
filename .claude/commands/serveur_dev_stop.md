# Serveur dev réseau — Arrêt

Arrête le serveur de dev Vite lancé par `/serveur_dev`.

## Utilisation

```
/serveur_dev_stop
```

## Processus

### Étape 1 : Détecter et arrêter le(s) processus en écoute

```powershell
$procs = Get-NetTCPConnection -LocalPort 5173,5174,5175 -State Listen -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique
if ($procs) {
  $procs | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
  Write-Output "Arrete : PID $($procs -join ', ')"
} else {
  Write-Output "Aucun serveur en ecoute sur ces ports."
}
```

### Étape 2 : Confirmation utilisateur

Afficher : « Serveur dev arrêté. » ou « Aucun serveur dev n'était en cours. »

## Pour relancer

Utiliser `/serveur_dev`.
