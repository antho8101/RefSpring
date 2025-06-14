
import { useTawkTo } from '@/hooks/useTawkTo';

export const TawkToWidget = () => {
  useTawkTo({
    enabled: true,
    propertyId: '68495cd58148b31910f7fb54',
    widgetId: '1itf958p9'
  });

  // Ce composant n'a pas besoin de rendu visuel,
  // il charge simplement le widget Tawk.to
  return null;
};
