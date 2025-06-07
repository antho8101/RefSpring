
import { useState } from 'react';

export type StatsPeriod = 'all-time' | 'current-month';

export const useStatsFilters = () => {
  const [period, setPeriod] = useState<StatsPeriod>('all-time');

  const getDateFilter = () => {
    if (period === 'current-month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return startOfMonth;
    }
    return null; // null = pas de filtre, toutes les données
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'current-month':
        return 'Ce mois-ci';
      case 'all-time':
      default:
        return 'Depuis le début';
    }
  };

  return {
    period,
    setPeriod,
    getDateFilter,
    getPeriodLabel,
  };
};
