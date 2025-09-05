# Guide de Migration Firebase vers Supabase - Phase 3

## Fonctions Edge Migrées

### ✅ Fonctions Stripe

#### 1. `stripe-setup-intent`
**Ancienne fonction:** `functions/src/stripeCreateSetup.ts`
**Nouvelle fonction:** `supabase/functions/stripe-setup-intent/index.ts`

- Crée des Setup Intents Stripe pour configurer les méthodes de paiement
- Gère automatiquement les clients Stripe
- Met à jour les campagnes avec les informations Stripe
- **Authentification requise:** ✅

#### 2. `stripe-webhook`
**Ancienne fonction:** `functions/src/processStripeWebhook.ts`
**Nouvelle fonction:** `supabase/functions/stripe-webhook/index.ts`

- Traite tous les webhooks Stripe (checkout, setup_intent, etc.)
- Met à jour automatiquement les campagnes dans Supabase
- Gère l'attachement des méthodes de paiement
- **Authentification requise:** ❌ (webhook public)
- **Secret requis:** `STRIPE_WEBHOOK_SECRET`

#### 3. `stripe-payment-methods`
**Ancienne fonction:** `functions/src/stripeGetPaymentMethods.ts` + autres
**Nouvelle fonction:** `supabase/functions/stripe-payment-methods/index.ts`

- GET: Récupère les méthodes de paiement d'un utilisateur
- POST: Attache ou définit une méthode par défaut
- DELETE: Supprime une méthode de paiement
- **Authentification requise:** ✅

### ✅ Fonctions de Validation

#### 4. `validate-campaign`
**Ancienne fonction:** `functions/src/validateCampaignData.ts`
**Nouvelle fonction:** `supabase/functions/validate-campaign/index.ts`

- Valide les données de campagne avant création
- Vérifie les URLs, domaines suspects, limites
- Retourne des données nettoyées
- **Authentification requise:** ✅

### ✅ Fonctions de Gestion

#### 5. `manage-affiliates`
**Ancienne fonction:** Logique dispersée dans Firebase
**Nouvelle fonction:** `supabase/functions/manage-affiliates/index.ts`

- CRUD complet pour les affiliés
- Génération automatique de codes de tracking
- Validation des données d'affiliés
- **Authentification requise:** ✅

#### 6. `track-conversion`
**Ancienne fonction:** Logique Firebase de tracking
**Nouvelle fonction:** `supabase/functions/track-conversion/index.ts`

- POST: Enregistre de nouvelles conversions
- GET: Récupère les conversions avec filtres
- Calcul automatique des commissions
- Système d'audit et de vérification
- **Authentification requise:** ❌ (tracking public)

#### 7. `calculate-commissions`
**Ancienne fonction:** `functions/src/calculateCommissions.ts`
**Nouvelle fonction:** `supabase/functions/calculate-commissions/index.ts`

- Calcule les commissions par période
- Génère des rapports détaillés
- Groupage par affilié et campagne
- **Authentification requise:** ✅

### ✅ Fonctions Shopify

#### 8. `shopify-oauth`
**Ancienne fonction:** `functions/src/shopifyOAuth.ts`
**Nouvelle fonction:** `supabase/functions/shopify-oauth/index.ts`

- POST: Génère des URLs d'autorisation Shopify
- PUT: Échange les codes d'autorisation contre des tokens
- Gestion sécurisée des états OAuth
- **Authentification requise:** ✅

## Configuration des Secrets

Les secrets suivants ont été configurés dans Supabase :

- ✅ `STRIPE_SECRET_KEY` - Clé secrète Stripe
- ✅ `STRIPE_WEBHOOK_SECRET` - Secret pour vérifier les webhooks Stripe
- ✅ `SHOPIFY_API_KEY` - Clé API Shopify
- ✅ `SHOPIFY_API_SECRET` - Secret API Shopify
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Pour les opérations de service

## Fonctions Publiques (sans JWT)

Ces fonctions sont configurées pour être accessibles sans authentification :

- `stripe-webhook` - Pour recevoir les webhooks de Stripe
- `track-conversion` - Pour permettre le tracking depuis des sites externes
- Toutes les fonctions Shopify existantes

## Tests Recommandés

### 1. Test des Setup Intents Stripe
```javascript
const { data } = await supabase.functions.invoke('stripe-setup-intent', {
  body: {
    userEmail: 'test@example.com',
    campaignName: 'Test Campaign',
    campaignId: 'uuid-here'
  }
});
```

### 2. Test de Validation de Campagne
```javascript
const { data } = await supabase.functions.invoke('validate-campaign', {
  body: {
    name: 'Ma Campagne',
    description: 'Description test',
    target_url: 'https://example.com',
    is_active: true,
    default_commission_rate: 15
  }
});
```

### 3. Test de Gestion d'Affiliés
```javascript
// Créer un affilié
const { data } = await supabase.functions.invoke('manage-affiliates', {
  body: {
    name: 'John Doe',
    email: 'john@example.com',
    campaignId: 'uuid-here',
    commissionRate: 20
  }
});
```

### 4. Test de Tracking de Conversion
```javascript
// Enregistrer une conversion (sans auth)
const response = await fetch(`${SUPABASE_URL}/functions/v1/track-conversion`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    campaignId: 'uuid-here',
    affiliateId: 'uuid-here',
    amount: 99.99,
    orderId: 'order-123'
  })
});
```

## Prochaines Étapes

### Phase 4 - Migration des Hooks et Services Frontend
1. Mettre à jour `useCampaigns` pour utiliser Supabase
2. Migrer `useAffiliates` vers les nouvelles Edge Functions
3. Adapter les services Stripe pour utiliser les nouvelles fonctions
4. Mettre à jour les composants de tracking

### Phase 5 - Nettoyage
1. Supprimer les anciens fichiers Firebase
2. Nettoyer les dépendances Firebase inutilisées
3. Mettre à jour la documentation

## Points d'Attention

1. **Webhooks Stripe** - Mettre à jour l'URL du webhook dans Stripe Dashboard vers :
   `https://wsvhmozduyiftmuuynpi.supabase.co/functions/v1/stripe-webhook`

2. **CORS** - Toutes les fonctions sont configurées avec CORS ouvert

3. **Logs** - Utiliser les logs Supabase pour le debugging :
   - Dashboard > Functions > [nom-fonction] > Logs

4. **RLS** - Les fonctions utilisent soit l'auth utilisateur soit le service role key selon les besoins

## Avantages de la Migration

- ✅ **Performance** - Edge Functions plus rapides que Cloud Functions
- ✅ **Coûts** - Pricing plus avantageux que Firebase Functions
- ✅ **Intégration** - Native avec la base de données Supabase
- ✅ **Développement** - Développement et déploiement simplifiés
- ✅ **Monitoring** - Logs et monitoring intégrés au dashboard Supabase