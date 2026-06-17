# Configuration de Google Sheets (OAuth — une seule fois)

Pour rendre en **Google Sheet en direct**, Sheetsmith a besoin d'un accès OAuth aux API Google
Sheets + Drive. Configuration unique ; ensuite `scripts/token.json` est réutilisé.

> Pas envie de configurer maintenant ? Choisissez la sortie **.xlsx** en Phase 0 — elle
> fonctionne immédiatement, sans configuration — et passez à Google plus tard.

## 1. Créer un projet Google Cloud + identifiants

1. Ouvrez https://console.cloud.google.com/ et créez (ou sélectionnez) un projet.
2. **APIs & Services → Library** : activez **Google Sheets API** et **Google Drive API**.
3. **APIs & Services → OAuth consent screen** : type "External", ajoutez votre email comme
   utilisateur de test.
4. **APIs & Services → Credentials → Create credentials → OAuth client ID** : type
   **Desktop app**. Téléchargez le JSON.
5. Enregistrez-le sous `scripts/credentials.json` (à côté de ce fichier).

## 2. Installer les dépendances Python

```bash
pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib openpyxl
```

## 3. Générer le jeton

Lancez le flux d'autorisation une fois :

```bash
python scripts/auth.py
```

Cela ouvre un navigateur, vous vous connectez, accordez l'accès, et `scripts/token.json` est
écrit. Les exécutions suivantes le rafraîchissent automatiquement.

## Portées (scopes) requises

- `https://www.googleapis.com/auth/spreadsheets`
- `https://www.googleapis.com/auth/drive.file`

## Sécurité

- `credentials.json` et `token.json` sont des **secrets** — ne les commitez jamais.
  Ajoutez-les à `.gitignore`.
- `drive.file` limite l'accès aux seuls fichiers créés par cette application.
