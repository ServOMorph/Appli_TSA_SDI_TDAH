#!/usr/bin/env python3
import subprocess
import sys

try:
    print("▶️  Mode PROD — Build + preview")
    subprocess.run("npm run build", shell=True, check=True)
    print("\n✅ Build complète. Lancement preview...")
    subprocess.run("npm run preview -- --host", shell=True, check=True)
except KeyboardInterrupt:
    print("\n❌ Interrompu")
    sys.exit(0)
