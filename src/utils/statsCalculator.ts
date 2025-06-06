
interface DailyStats {
  date: string;
  clicks: number;
  conversions: number;
  revenue: number;
  commissions: number;
}

interface AffiliatePerformance {
  id: string;
  name: string;
  email: string;
  clicks: number;
  conversions: number;
  commissions: number;
  conversionRate: number;
}

export const calculateDailyStats = (clicks: any[], conversions: any[]): DailyStats[] => {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  return last30Days.map(date => {
    const dayClicks = clicks.filter(click => {
      if (!click.timestamp) return false;
      try {
        const clickDate = click.timestamp.toDate ? 
          click.timestamp.toDate().toISOString().split('T')[0] : 
          new Date(click.timestamp).toISOString().split('T')[0];
        return clickDate === date;
      } catch (error) {
        return false;
      }
    });
    
    const dayConversions = conversions.filter(conversion => {
      if (!conversion.timestamp) return false;
      try {
        const conversionDate = conversion.timestamp.toDate ? 
          conversion.timestamp.toDate().toISOString().split('T')[0] : 
          new Date(conversion.timestamp).toISOString().split('T')[0];
        return conversionDate === date;
      } catch (error) {
        return false;
      }
    });

    const dayRevenue = dayConversions.reduce((sum, conv) => sum + (parseFloat(conv.amount) || 0), 0);
    
    // UTILISER DIRECTEMENT les commissions stockées - PAS DE RECALCUL
    const dayCommissions = dayConversions.reduce((sum, conv) => {
      return sum + (parseFloat(conv.commission) || 0);
    }, 0);

    return {
      date,
      clicks: dayClicks.length,
      conversions: dayConversions.length,
      revenue: dayRevenue,
      commissions: dayCommissions,
    };
  });
};

export const calculateAffiliatePerformance = (affiliates: any[], clicks: any[], conversions: any[]): AffiliatePerformance[] => {
  return affiliates.map(affiliate => {
    const affiliateClicks = clicks.filter(click => click.affiliateId === affiliate.id);
    const affiliateConversions = conversions.filter(conv => conv.affiliateId === affiliate.id);
    
    // UTILISER DIRECTEMENT les commissions stockées - PAS DE RECALCUL
    const affiliateCommissions = affiliateConversions.reduce((sum, conv) => {
      return sum + (parseFloat(conv.commission) || 0);
    }, 0);
    
    const conversionRate = affiliateClicks.length > 0 ? (affiliateConversions.length / affiliateClicks.length) * 100 : 0;

    return {
      id: affiliate.id,
      name: affiliate.name || 'Affilié anonyme',
      email: affiliate.email || 'Email non renseigné',
      clicks: affiliateClicks.length,
      conversions: affiliateConversions.length,
      commissions: affiliateCommissions,
      conversionRate,
    };
  }).sort((a, b) => b.commissions - a.commissions);
};

export const calculateGlobalMetrics = (clicks: any[], conversions: any[]) => {
  const totalClicks = clicks.length;
  const totalConversions = conversions.length;
  const totalRevenue = conversions.reduce((sum, conv) => sum + (parseFloat(conv.amount) || 0), 0);
  
  // UTILISER DIRECTEMENT les commissions stockées - PAS DE RECALCUL
  const totalCommissions = conversions.reduce((sum, conv) => {
    return sum + (parseFloat(conv.commission) || 0);
  }, 0);
  
  const netRevenue = totalRevenue - totalCommissions;
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const averageCPA = totalConversions > 0 ? totalCommissions / totalConversions : 0;
  const averageROAS = totalCommissions > 0 ? totalRevenue / totalCommissions : 0;

  console.log('📊 MÉTRIQUES GLOBALES - COMMISSIONS DIRECTES:', {
    totalCommissions,
    totalRevenue,
    netRevenue,
    conversions: conversions.map(c => ({ id: c.id, commission: c.commission, amount: c.amount }))
  });

  return {
    totalClicks,
    totalConversions,
    totalRevenue,
    totalCommissions,
    netRevenue,
    conversionRate,
    averageCPA,
    averageROAS,
  };
};
