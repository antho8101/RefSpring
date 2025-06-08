
# 🚀 Guide de déploiement des Cloud Functions

## Étapes pour déployer les fonctions depuis Lovable

### 1. Première fois (configuration)
```bash
# Dans le terminal Lovable (si disponible) ou en local
npx firebase login
npx firebase init functions
```

### 2. Installation des dépendances des fonctions
```bash
cd functions && npm install
```

### 3. Déploiement des fonctions
```bash
cd functions && npm run build && npx firebase deploy --only functions
```

### 4. Configuration des secrets Stripe
Après le déploiement, configurer les secrets :
```bash
npx firebase functions:secrets:set STRIPE_SECRET_KEY
npx firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
```

## 🔧 Commands disponibles

- `npx firebase login` - Se connecter à Firebase
- `npx firebase deploy --only functions` - Déployer uniquement les fonctions
- `npx firebase deploy --only hosting` - Déployer uniquement le site
- `npx firebase deploy` - Déployer tout (fonctions + site)
- `npx firebase emulators:start` - Lancer les émulateurs en local

## 📝 Prochaines étapes

1. **Tester en local** : `npx firebase emulators:start`
2. **Déployer** : `cd functions && npm run build && npx firebase deploy --only functions`
3. **Configurer Stripe webhook** avec l'URL des fonctions déployées
4. **Intégrer les fonctions** dans l'app React

## 🌐 URLs des fonctions après déploiement

Les fonctions seront disponibles à :
- `https://us-central1-refspring-8c3ac.cloudfunctions.net/validateCampaignData`
- `https://us-central1-refspring-8c3ac.cloudfunctions.net/processStripeWebhook`
- `https://us-central1-refspring-8c3ac.cloudfunctions.net/validateTracking`
- `https://us-central1-refspring-8c3ac.cloudfunctions.net/calculateCommissions`
- `https://us-central1-refspring-8c3ac.cloudfunctions.net/antifraudCheck`

## ⚠️ Important
Remplacez `refspring-8c3ac` par votre vrai project ID Firebase dans les URLs ci-dessus.

