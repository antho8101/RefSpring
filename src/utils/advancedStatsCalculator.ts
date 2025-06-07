
interface ClickData {
  timestamp: any;
  affiliateId: string;
}

interface ConversionData {
  timestamp: any;
  affiliateId: string;
  amount: number;
  commission: number;
}

interface AffiliateData {
  id: string;
  name: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
  commissions: number;
}

const parseTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  return timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
};

export const calculateEvolutionMetrics = (
  currentClicks: ClickData[], 
  currentConversions: ConversionData[],
  previousClicks: ClickData[],
  previousConversions: ConversionData[]
) => {
  const currentRevenue = currentConversions.reduce((sum, conv) => sum + (parseFloat(conv.amount?.toString()) || 0), 0);
  const previousRevenue = previousConversions.reduce((sum, conv) => sum + (parseFloat(conv.amount?.toString()) || 0), 0);
  
  const currentConversionRate = currentClicks.length > 0 ? (currentConversions.length / currentClicks.length) * 100 : 0;
  const previousConversionRate = previousClicks.length > 0 ? (previousConversions.length / previousClicks.length) * 100 : 0;

  return {
    clicks: {
      label: 'Clics',
      current: currentClicks.length,
      previous: previousClicks.length,
      format: 'number' as const
    },
    conversions: {
      label: 'Conversions', 
      current: currentConversions.length,
      previous: previousConversions.length,
      format: 'number' as const
    },
    revenue: {
      label: 'CA Total',
      current: currentRevenue,
      previous: previousRevenue,
      format: 'currency' as const
    },
    conversionRate: {
      label: 'Taux Conversion',
      current: currentConversionRate,
      previous: previousConversionRate,
      format: 'percentage' as const
    }
  };
};

export const calculateTimeAnalysis = (clicks: ClickData[], conversions: ConversionData[]) => {
  // Analyse par heure (0-23)
  const hourlyStats = Array.from({ length: 24 }, (_, hour) => ({ hour, clicks: 0, conversions: 0 }));
  
  clicks.forEach(click => {
    const date = parseTimestamp(click.timestamp);
    const hour = date.getHours();
    hourlyStats[hour].clicks++;
  });

  conversions.forEach(conversion => {
    const date = parseTimestamp(conversion.timestamp);
    const hour = date.getHours();
    hourlyStats[hour].conversions++;
  });

  // Analyse par jour de la semaine (0=dimanche, 6=samedi)
  const dailyStats = Array.from({ length: 7 }, (_, dayIndex) => ({ 
    day: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][dayIndex], 
    dayIndex,
    clicks: 0, 
    conversions: 0 
  }));
  
  clicks.forEach(click => {
    const date = parseTimestamp(click.timestamp);
    const dayIndex = date.getDay();
    dailyStats[dayIndex].clicks++;
  });

  conversions.forEach(conversion => {
    const date = parseTimestamp(conversion.timestamp);
    const dayIndex = date.getDay();
    dailyStats[dayIndex].conversions++;
  });

  // Trouver les meilleures performances
  const bestHour = hourlyStats.reduce((best, current, index) => 
    current.clicks > best.clicks ? { ...current, hour: index } : best, 
    { clicks: 0, hour: 0 }
  );

  const bestDay = dailyStats.reduce((best, current) => 
    current.clicks > best.clicks ? current : best,
    { day: 'Lun', clicks: 0, conversions: 0, dayIndex: 1 }
  );

  return {
    hourlyData: hourlyStats.map(stat => ({ ...stat, hour: `${stat.hour}h` })),
    dailyData: dailyStats,
    bestPerformingHour: bestHour.hour.toString(),
    bestPerformingDay: bestDay.day
  };
};

export const calculateBehavioralMetrics = (
  conversions: ConversionData[],
  affiliates: AffiliateData[]
) => {
  // Valeur moyenne des commandes
  const averageOrderValue = conversions.length > 0 
    ? conversions.reduce((sum, conv) => sum + (parseFloat(conv.amount?.toString()) || 0), 0) / conversions.length
    : 0;

  // Top affilié par taux de conversion
  const topAffiliate = affiliates.reduce((best, current) => 
    current.conversionRate > best.conversionRate ? current : best,
    { name: 'Aucun', conversionRate: 0 }
  );

  // Taux de rétention des affiliés (affiliés avec au moins 1 conversion ce mois vs total)
  const activeAffiliates = affiliates.filter(affiliate => affiliate.conversions > 0).length;
  const retentionRate = affiliates.length > 0 ? (activeAffiliates / affiliates.length) * 100 : 0;

  // Concentration du CA (Pareto 80/20)
  const sortedAffiliates = [...affiliates].sort((a, b) => b.commissions - a.commissions);
  const top20Count = Math.ceil(affiliates.length * 0.2);
  const top20Revenue = sortedAffiliates.slice(0, top20Count).reduce((sum, affiliate) => sum + affiliate.commissions, 0);
  const totalRevenue = affiliates.reduce((sum, affiliate) => sum + affiliate.commissions, 0);
  const revenueConcentration = totalRevenue > 0 ? (top20Revenue / totalRevenue) * 100 : 0;

  return {
    averageOrderValue,
    topPerformingAffiliate: {
      name: topAffiliate.name,
      conversionRate: topAffiliate.conversionRate
    },
    affiliateRetentionRate: retentionRate,
    revenueConcentration
  };
};
