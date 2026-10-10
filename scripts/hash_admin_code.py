"""Calcule l'empreinte d'un mot de passe administrateur pour src/domain/rules/adminCredentials.ts.

Usage : python scripts/hash_admin_code.py <identite>
Le mot de passe est saisi avec écho (visible à l'écran) et n'est jamais écrit dans un fichier.
Coller la ligne produite dans ADMIN_CREDENTIAL_HASHES.
"""

import hashlib
import sys

ITERATIONS = 210_000


def derive(identity: str, secret: str) -> str:
    salt = f"appli-audhd:{identity.strip().lower()}".encode("utf-8")
    return hashlib.pbkdf2_hmac("sha256", secret.encode("utf-8"), salt, ITERATIONS, 32).hex()


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage : python scripts/hash_admin_code.py <identite>")
        return 1
    identity = sys.argv[1]
    secret = input(f"Mot de passe pour « {identity} » : ")
    if input("Confirmer : ") != secret or not secret:
        print("ERREUR : saisies différentes ou vides.")
        return 1
    print(f"  {identity.strip().lower()}: '{derive(identity, secret)}',")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
