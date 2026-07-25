#!/usr/bin/env python3
import subprocess
import sys

try:
    print("▶️  Mode DEV — Vite dev server")
    subprocess.run("npm run dev -- --host", shell=True, check=True)
except KeyboardInterrupt:
    print("\n❌ Interrompu")
    sys.exit(0)
