
import { useTawkTo } from '@/hooks/useTawkTo';

export const TawkToWidget = () => {
  useTawkTo({
    enabled: true,
    propertyId: '68495cd58148b31910f7fb54',
    widgetId: '1itf958p9'
  });

  // This component doesn't render anything visible - it just loads the Tawk.to widget
  return null;
};
