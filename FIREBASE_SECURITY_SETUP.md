
# 🔒 Guide d'implémentation sécurité Firebase

## 📋 Checklist de sécurité critique

### ✅ 1. Appliquer les règles Firestore (URGENT)

**Dans la console Firebase :**
1. Va sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionne ton projet `refspring-8c3ac`
3. Dans le menu gauche : **Firestore Database**
4. Onglet **Règles**
5. Copie-colle le contenu du fichier `firestore.rules` 
6. Clique **Publier**

⚠️ **ATTENTION** : Cela va immédiatement sécuriser ta base de données !

### ✅ 2. Configurer les variables d'environnement

**Créer un fichier `.env.local` (NON committé) :**
```bash
# Firebase Configuration (Production)
VITE_FIREBASE_API_KEY=AIzaSyAlHsC-w7Sx18XKJ6dIcxvqj-AUdqkjqSE
VITE_FIREBASE_AUTH_DOMAIN=refspring-8c3ac.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://refspring-8c3ac-default-rtdb.europe-west1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=refspring-8c3ac
VITE_FIREBASE_STORAGE_BUCKET=refspring-8c3ac.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=519439687826
VITE_FIREBASE_APP_ID=1:519439687826:web:c0644e224f4ca23b57864b
VITE_FIREBASE_MEASUREMENT_ID=G-QNK35Y7EE4

# App Configuration
VITE_APP_URL=https://refspring.com
VITE_SHORT_LINK_BASE=https://refspring.com/s
VITE_API_BASE_URL=https://api.refspring.com
VITE_DASHBOARD_URL=https://dashboard.refspring.com

# Feature Flags
VITE_ENABLE_FRAUD_DETECTION=true
VITE_ENABLE_REAL_TIME_UPDATES=true
VITE_DEBUG_MODE=false
```

### ✅ 3. Activer l'authentification Firebase

**Dans Firebase Console :**
1. **Authentication** → **Sign-in method**
2. Activer **Email/Password**
3. Activer **Google** (optionnel)
4. Dans **Settings** → **Authorized domains**, ajouter :
   - `refspring.com`
   - `dashboard.refspring.com`
   - `localhost` (pour dev)

### ✅ 4. Configurer les index Firestore

**Dans Firestore → Index :**
Créer ces index composites :

```
campaigns:
- userId (Ascending) + createdAt (Descending)

affiliates:
- userId (Ascending) + createdAt (Descending)
- campaignId (Ascending) + createdAt (Descending)

clicks:
- campaignId (Ascending) + timestamp (Descending)
- affiliateId (Ascending) + timestamp (Descending)

conversions:
- campaignId (Ascending) + timestamp (Descending)
- affiliateId (Ascending) + timestamp (Descending)

shortLinks:
- campaignId (Ascending) + createdAt (Descending)
```

## 🚨 Actions immédiates requises

### 1. Règles Firestore (CRITIQUE - À faire MAINTENANT)
- [ ] Copier le fichier `firestore.rules` dans Firebase Console
- [ ] Publier les règles
- [ ] Tester que l'app fonctionne toujours

### 2. Tests de sécurité
- [ ] Tester la création de campagne
- [ ] Tester l'accès aux données d'un autre utilisateur (doit échouer)
- [ ] Vérifier que les clics sont bien enregistrés

### 3. Monitoring
- [ ] Configurer les alertes Firebase
- [ ] Vérifier les logs d'erreurs

## 🔧 Prochaines étapes (Phase 2)

1. **Cloud Functions pour la sécurité** (tracking sécurisé)
2. **Protection anti-fraude** (détection patterns suspects)
3. **Monitoring avancé** (alertes temps réel)
4. **API sécurisée** (webhooks partenaires)

## ⚠️ Points d'attention

- **Backup** : Firebase fait des backups automatiques, mais configure des exports réguliers
- **Monitoring** : Surveille les tentatives d'accès non autorisées
- **Performance** : Les nouvelles règles peuvent ralentir certaines requêtes
- **Tests** : Teste toutes les fonctionnalités après application des règles

## 🆘 En cas de problème

Si l'app ne fonctionne plus après application des règles :
1. Vérifie les logs de la console Firebase
2. Vérifie que tous les utilisateurs sont bien authentifiés
3. Contacte-moi avec les messages d'erreur exacts

**Remember** : Ces règles bloquent TOUT accès non autorisé. C'est le but ! 🛡️
