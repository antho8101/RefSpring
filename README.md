
<div align="center">
  <h1>🌟 RefSpring</h1>
  <p><strong>La plateforme d'affiliation nouvelle génération</strong></p>
  <p>Gérez vos campagnes d'affiliation avec style et efficacité</p>
  
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Firebase-10.0-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
</div>

---

## ✨ Fonctionnalités

### 🎯 **Gestion de campagnes**
- Création et configuration de campagnes d'affiliation
- Activation/désactivation en temps réel
- URLs de destination personnalisables
- Suivi des performances en direct

### 👥 **Gestion des affiliés**
- Ajout et organisation de vos partenaires
- Génération automatique de liens de tracking
- Liens courts personnalisés pour chaque affilié
- Calcul automatique des commissions

### 📊 **Analytics avancées**
- Dashboard en temps réel avec métriques clés
- Suivi des clics, conversions et revenus
- Taux de conversion par campagne et affilié
- Historique complet des performances

### 🔗 **Liens intelligents**
- Génération automatique de liens courts
- Redirection conditionnelle (campagnes actives/en pause)
- Tracking précis des clics et conversions
- Protection contre la fraude

---

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+ et npm
- Compte Firebase pour la base de données

### Installation

```bash
# Cloner le repository
git clone https://github.com/votre-username/refspring.git
cd refspring

# Installer les dépendances
npm install

# Configurer Firebase
# Créez un fichier .env avec vos clés Firebase :
# VITE_FIREBASE_API_KEY=votre_api_key
# VITE_FIREBASE_AUTH_DOMAIN=votre_auth_domain
# VITE_FIREBASE_PROJECT_ID=votre_project_id
# etc...

# Lancer en mode développement
npm run dev
```

L'application sera accessible sur `http://localhost:8080`

---

## 🏗️ Architecture

### Stack technique
- **Frontend** : React 18 + TypeScript + Vite
- **Styling** : Tailwind CSS + shadcn/ui
- **Backend** : Firebase (Firestore + Auth)
- **State Management** : TanStack Query
- **Routing** : React Router Dom

### Structure du projet
```
src/
├── components/          # Composants UI réutilisables
│   ├── ui/             # Composants shadcn/ui
│   ├── Dashboard.tsx   # Page principale
│   └── Campaign*.tsx   # Gestion des campagnes
├── hooks/              # Hooks personnalisés
│   ├── useAuth.tsx     # Authentification
│   ├── useCampaigns.ts # Gestion des campagnes
│   └── useTracking.ts  # Suivi des liens
├── pages/              # Pages de l'application
│   ├── TrackingPage.tsx    # Redirection des liens
│   └── ShortLinkPage.tsx   # Liens courts
├── lib/                # Configuration et utilitaires
└── types/              # Définitions TypeScript
```

---

## 📈 Fonctionnement du tracking

RefSpring utilise un système de tracking avancé :

1. **Génération de liens** : Chaque affilié reçoit un lien unique
2. **Redirection intelligente** : Les clics sont trackés avant redirection
3. **Campagnes en pause** : Affichage d'une page d'information
4. **Analytics temps réel** : Mise à jour instantanée des métriques

### Exemple de lien généré
```
https://votre-domaine.com/s/ABC123
│                           └── Code court unique
└── Redirection automatique vers l'URL de la campagne
```

---

## 🎨 Interface utilisateur

### Dashboard moderne
- **Design responsive** avec animations fluides
- **Métriques en temps réel** (clics, conversions, revenus)
- **Gestion intuitive** des campagnes et affiliés
- **Thème cohérent** avec Tailwind CSS

### Fonctionnalités UX
- Copie de liens en un clic
- Notifications toast pour les actions
- Cartes extensibles/réductibles
- Badges de statut visuels

---

## 🔧 Configuration Firebase

1. Créez un projet Firebase
2. Activez Firestore et Authentication
3. Configurez les règles de sécurité
4. Ajoutez vos clés dans `.env`

### Structure Firestore
```
campaigns/
├── {campaignId}/
│   ├── name: string
│   ├── isActive: boolean
│   ├── targetUrl: string
│   └── ...

affiliates/
├── {affiliateId}/
│   ├── name: string
│   ├── email: string
│   └── ...

clicks/
├── {clickId}/
│   ├── campaignId: string
│   ├── affiliateId: string
│   ├── timestamp: Date
│   └── ...
```

---

## 🚀 Déploiement

### Avec Lovable (recommandé)
1. Connectez votre projet à GitHub
2. Cliquez sur "Publish" dans l'interface Lovable
3. Votre app est en ligne ! 🎉

### Déploiement manuel
```bash
# Build de production
npm run build

# Déployer sur votre plateforme préférée
# (Vercel, Netlify, Firebase Hosting, etc.)
```

---

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 👨‍💻 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Ouvrir une issue pour signaler un bug
- Proposer de nouvelles fonctionnalités
- Soumettre une pull request

---

## 📞 Support

- 📧 Email : support@refspring.com
- 🐛 Issues : [GitHub Issues](https://github.com/votre-username/refspring/issues)
- 💬 Discord : [Rejoindre la communauté](https://discord.gg/refspring)

---

<div align="center">
  <p>Fait avec ❤️ par l'équipe RefSpring</p>
  <p><strong>Révolutionnez votre affiliation dès aujourd'hui !</strong></p>
</div>
