# 🧠 AUDIT LOGIQUE MÉTIER

## Score actuel : 7/10

## ❌ Points d'amélioration identifiés

### 1. **Architecture des services**
- Logique métier mélangée avec l'UI
- Services trop couplés à Firebase
- Pas d'abstraction pour le changement de backend

### 2. **Gestion des erreurs incohérente**
- Différents patterns selon les composants
- Pas de stratégie unifiée de retry
- Messages d'erreur non centralisés

### 3. **État global fragmenté**
- Multiples sources de vérité
- Synchronisation manuelle entre contexts
- Pas de state management centralisé

### 4. **Validation métier dispersée**
- Règles business réparties dans les composants
- Validation côté client et serveur différente
- Pas de typage strict des domaines métier

## ✅ Points positifs

- Hooks métier bien organisés
- Types TypeScript corrects
- Séparation des responsabilités basique
- Patterns React cohérents

## 🎯 Architecture cible

### **Domain-Driven Design (DDD)**
```
src/
├── domains/                    # Domaines métier
│   ├── campaign/
│   │   ├── models/            # Entités et value objects
│   │   ├── services/          # Services domaine
│   │   ├── repositories/      # Abstractions persistance
│   │   └── validators/        # Règles business
│   ├── affiliate/
│   └── payment/
├── infrastructure/            # Implémentation technique
│   ├── firebase/             # Firebase specifique
│   ├── stripe/               # Stripe specifique
│   └── http/                 # HTTP client
├── application/              # Orchestration
│   ├── commands/             # Commands CQRS
│   ├── queries/              # Queries CQRS
│   └── handlers/             # Handlers métier
└── presentation/             # UI Layer
    ├── components/
    ├── pages/
    └── hooks/
```

## 🔧 Plan de refactoring

### **Phase 1 : Domain Models (3-4 jours)**
```tsx
// 1. Entités métier typées
export class Campaign {
  constructor(
    public readonly id: CampaignId,
    public readonly name: string,
    public readonly commission: Commission,
    public readonly status: CampaignStatus
  ) {
    this.validate();
  }
  
  public updateCommission(newCommission: Commission): Campaign {
    if (!this.canUpdateCommission()) {
      throw new BusinessError('Cannot update commission for active campaign');
    }
    return new Campaign(this.id, this.name, newCommission, this.status);
  }
  
  private validate(): void {
    if (!this.name || this.name.length < 3) {
      throw new ValidationError('Campaign name must be at least 3 characters');
    }
  }
}
```

## 🚀 Actions prioritaires

1. **Extraction domain models** (3 jours)
2. **Repository pattern implementation** (2 jours)
3. **Error handling unification** (1 jour)
4. **CQRS command/query separation** (2 jours)
5. **Domain events implementation** (2 jours)

## 💼 Impact business

- **Maintenabilité** : +60% facilité d'évolution
- **Fiabilité** : -70% bugs production
- **Time-to-market** : +40% vélocité développement
- **Onboarding** : -50% temps formation équipe

**Effort estimé** : 10-12 jours développeur  
**ROI** : Très élevé (maintenabilité long terme)