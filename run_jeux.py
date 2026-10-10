#!/usr/bin/env python3
import subprocess
import sys
import webbrowser

URL = "http://localhost:5180/"

try:
    print("Mode JEUX - banc de test hors application : " + URL)
    webbrowser.open(URL)
    subprocess.run(
        "npx vite --config JEUX/harness/vite.config.ts --host",
        shell=True,
        check=True,
    )
except KeyboardInterrupt:
    print("\nInterrompu")
    sys.exit(0)
