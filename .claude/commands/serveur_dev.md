# Serveur dev réseau — Démarrage

Démarre le serveur de dev Vite sur un port fixe, accessible depuis le réseau local (téléphone en
Wi-Fi par exemple) — même adresse à chaque lancement. Ferme d'abord toute instance déjà ouverte.

## Utilisation

```
/serveur_dev
```

## Processus

### Étape 1 : Fermer les instances déjà ouvertes

```powershell
Get-NetTCPConnection -LocalPort 5173,5174,5175 -State Listen -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
```

Ports couverts : 5173 (port fixe utilisé par cette commande) + 5174/5175 (dérive possible d'un
`npm run dev` lancé sans passer par cette commande).

### Étape 2 : Lancer le serveur en tâche de fond

```bash
mkdir -p tmp
npm run dev -- --host --port 5173 --strictPort > tmp/serveur_dev.log 2>&1
```

Lancer avec `run_in_background: true`. `--strictPort` fait échouer le démarrage plutôt que de
dériver silencieusement vers un autre port si 5173 est encore occupé — sinon l'adresse ne serait
plus constante.

### Étape 3 : Attendre que le serveur soit prêt

Lire `tmp/serveur_dev.log` jusqu'à y trouver la ligne `Network:` (quelques secondes suffisent). Si
le fichier contient une erreur (`Port 5173 is in use`, `EADDRINUSE`) : l'étape 1 n'a pas libéré le
port, s'arrêter et le signaler plutôt que de relancer en boucle.

### Étape 4 : Récupérer l'adresse réseau locale

```powershell
Get-NetAdapter | Where-Object Status -eq 'Up' |
  Where-Object { $_.InterfaceDescription -notmatch 'VirtualBox|VMware|Hyper-V|Virtual' } |
  Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty IPAddress
```

Ignore les adaptateurs virtuels (VirtualBox, VMware, Hyper-V). Aucun résultat : le signaler à
l'utilisateur (aucune interface réseau physique active) plutôt que d'inventer une adresse.

### Étape 5 : Confirmation utilisateur

Afficher l'URL à ouvrir sur le téléphone (même réseau Wi-Fi/local que ce poste) :

```
http://<IP trouvée à l'étape 4>:5173/
```

Le port reste toujours 5173 ; seule l'IP peut changer si le réseau ou l'attribution DHCP change.

## Pour arrêter

Utiliser `/serveur_dev_stop`.
