# Surveillance des retours testeur — Arrêt

Arrête la surveillance lancée par `/surveiller_retours`.

## Utilisation

```
/surveiller_retours_stop
```

## Processus

### Étape 1 : Détecter et arrêter le processus

```powershell
$procs = Get-CimInstance Win32_Process -Filter "Name like 'python%'" |
  Where-Object { $_.CommandLine -like '*watch_feedback_reports.py*' }
if ($procs) {
  $procs | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  Write-Output "Arrete : PID $(($procs | ForEach-Object { $_.ProcessId }) -join ', ')"
} else {
  Write-Output "Aucune surveillance en cours."
}
```

L'arrêt du processus déclenche une notification de fin de tâche de fond : c'est la conséquence de
cet arrêt volontaire, rien à traiter ni à signaler.

### Étape 2 : Confirmation utilisateur

Afficher : « Surveillance des retours arrêtée. » ou « Aucune surveillance n'était en cours. »

## Pour relancer

Utiliser `/surveiller_retours`.
