# Configuration Application Shopify

## Étape 1: Créer l'app Shopify avec le CLI

Dans le répertoire racine du projet, exécutez :

```bash
# Créer l'app Shopify dans un sous-dossier
mkdir shopify-app
cd shopify-app
npm init @shopify/app@latest
```

## Étape 2: Configuration de l'app

Lors de l'initialisation, choisissez :
- **App name**: RefSpring Affiliate Tracker
- **Template**: Remix (recommended)
- **Language**: TypeScript
- **Package manager**: npm

## Étape 3: Configuration des URLs

Dans le fichier `shopify.app.toml` de l'app Shopify, configurez :

```toml
name = "refspring-affiliate-tracker"
client_id = "YOUR_CLIENT_ID"
webhooks.api_version = "2023-10"

[application_url]
redirect_url = "https://refspring.com/auth/shopify/callback"

[webhooks]
api_version = "2023-10"

[[webhooks.subscriptions]]
topics = ["orders/create", "orders/paid", "app/uninstalled"]
uri = "https://refspring.com/api/shopify-webhooks"
```

## Étape 4: Intégration avec Firebase Functions

L'app Shopify utilisera nos Firebase Functions comme backend :
- OAuth: `https://refspring.com/api/shopify-auth-callback`
- Webhooks: `https://refspring.com/api/shopify-webhooks`
- Configuration: `https://refspring.com/api/shopify-config`

## Étape 5: Déploiement

1. Déployez d'abord les Firebase Functions : `firebase deploy --only functions`
2. Déployez l'app Shopify : `cd shopify-app && npm run deploy`

## URLs importantes

- App URL: L'URL générée par Shopify CLI
- Redirect URL: `https://refspring.com/auth/shopify/callback`
- Webhooks URL: `https://refspring.com/api/shopify-webhooks`