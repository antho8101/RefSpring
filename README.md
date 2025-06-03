
<div align="center">
  <h1>🌟 RefSpring</h1>
  <p><strong>Next-generation affiliate platform</strong></p>
  <p>Manage your affiliate campaigns with style and efficiency</p>
  
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Firebase-10.0-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <br />
  <img src="https://img.shields.io/github/license/your-username/refspring" alt="License" />
  <img src="https://img.shields.io/github/stars/your-username/refspring" alt="Stars" />
  <img src="https://img.shields.io/github/issues/your-username/refspring" alt="Issues" />
  <img src="https://img.shields.io/github/last-commit/your-username/refspring" alt="Last Commit" />
</div>

---

## ✨ Features

### 🎯 **Campaign Management**
- Create and configure affiliate campaigns
- Real-time activation/deactivation
- Customizable destination URLs
- Live performance tracking

### 👥 **Affiliate Management**
- Add and organize your partners
- Automatic tracking link generation
- Custom short links for each affiliate
- Automatic commission calculation

### 📊 **Advanced Analytics**
- Real-time dashboard with key metrics
- Track clicks, conversions, and revenue
- Conversion rates by campaign and affiliate
- Complete performance history

### 🔗 **Smart Links**
- Automatic short link generation
- Conditional redirection (active/paused campaigns)
- Precise click and conversion tracking
- Fraud protection

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase account for database

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/refspring.git
cd refspring

# Install dependencies
npm install

# Configure Firebase
# Create a .env file with your Firebase keys based on .env.example:
cp .env.example .env
# Then edit .env with your values

# Start development server
npm run dev
```

The application will be accessible at `http://localhost:8080`

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Firebase (Firestore + Auth)
- **State Management**: TanStack Query
- **Routing**: React Router Dom

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Dashboard.tsx   # Main dashboard page
│   └── Campaign*.tsx   # Campaign management
├── hooks/              # Custom hooks
│   ├── useAuth.tsx     # Authentication
│   ├── useCampaigns.ts # Campaign management
│   └── useTracking.ts  # Link tracking
├── pages/              # Application pages
│   ├── TrackingPage.tsx    # Link redirection
│   └── ShortLinkPage.tsx   # Short links
├── lib/                # Configuration and utilities
└── types/              # TypeScript definitions
```

---

## 📈 How Tracking Works

RefSpring uses an advanced tracking system:

1. **Link Generation**: Each affiliate receives a unique link
2. **Smart Redirection**: Clicks are tracked before redirection
3. **Paused Campaigns**: Display information page instead of redirecting
4. **Real-time Analytics**: Instant metrics updates

### Example Generated Link
```
https://your-domain.com/s/ABC123
│                           └── Unique short code
└── Automatic redirection to campaign URL
```

---

## 🎨 User Interface

### Modern Dashboard
- **Responsive design** with smooth animations
- **Real-time metrics** (clicks, conversions, revenue)
- **Intuitive management** of campaigns and affiliates
- **Consistent theme** with Tailwind CSS

### UX Features
- One-click link copying
- Toast notifications for actions
- Expandable/collapsible cards
- Visual status badges

---

## 🔧 Firebase Configuration

1. Create a Firebase project
2. Enable Firestore and Authentication
3. Configure security rules
4. Add your keys to `.env`

### Firestore Structure
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

## 🚀 Deployment

### With Lovable (recommended)
1. Connect your project to GitHub
2. Click "Publish" in the Lovable interface
3. Your app is live! 🎉

### Manual Deployment
```bash
# Production build
npm run build

# Deploy to your preferred platform
# (Vercel, Netlify, Firebase Hosting, etc.)
```

---

## 📝 License

This project is licensed under the MIT License. See the [`LICENSE`](LICENSE) file for more details.

---

## 👨‍💻 Contributing

Contributions are welcome! Please see our [`CONTRIBUTING.md`](CONTRIBUTING.md) guide.

---

## 🔒 Security

For information about reporting vulnerabilities, see [`SECURITY.md`](SECURITY.md).

---

## 📞 Support

- 📧 Email: support@refspring.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/refspring/issues)
- 💬 Discord: [Join the community](https://discord.gg/refspring)

---

<div align="center">
  <p>Made with ❤️ by the RefSpring team</p>
  <p><strong>Revolutionize your affiliate marketing today!</strong></p>
</div>
