
export interface Campaign {
  id: string;
  name: string;
  description: string;
  targetUrl: string;
  trackingScript?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  isActive: boolean;
}

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  commissionRate: number; // Pourcentage (ex: 10 pour 10%)
  campaignId: string;
  userId: string;
  trackingCode: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Conversion {
  id: string;
  affiliateId: string;
  campaignId: string;
  amount: number; // Montant de la vente
  commission: number; // Commission calculée
  timestamp: Date;
  verified: boolean;
}

export interface Click {
  id: string;
  affiliateId: string;
  campaignId: string;
  timestamp: Date;
  userAgent?: string;
  referrer?: string;
}
