
import { useEffect } from 'react';

interface TawkToConfig {
  enabled?: boolean;
  propertyId?: string;
  widgetId?: string;
}

export const useTawkTo = (config: TawkToConfig = {}) => {
  const { 
    enabled = true, 
    propertyId = '68495cd58148b31910f7fb54', 
    widgetId = '1itf958p9' 
  } = config;

  useEffect(() => {
    if (!enabled) return;

    // Éviter de charger plusieurs fois le script
    if (window.Tawk_API) {
      console.log('🗨️ Tawk.to already loaded');
      return;
    }

    console.log('🗨️ Loading Tawk.to chat widget');

    // Script Tawk.to exact
    const script = `
      var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
      (function(){
      var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
      s1.async=true;
      s1.src='https://embed.tawk.to/${propertyId}/${widgetId}';
      s1.charset='UTF-8';
      s1.setAttribute('crossorigin','*');
      s0.parentNode.insertBefore(s1,s0);
      })();
    `;

    // Exécuter le script
    const scriptElement = document.createElement('script');
    scriptElement.innerHTML = script;
    document.head.appendChild(scriptElement);

    // Personnaliser la position une fois le widget chargé
    const positionWidget = () => {
      const widget = document.querySelector('#tawkchat-iframe-container, .tawk-messenger-container, [id*="tawk"]');
      if (widget && widget instanceof HTMLElement) {
        // Positionner le chat au-dessus du footer
        widget.style.bottom = '120px'; // Espace pour le footer
        widget.style.right = '20px';
        widget.style.zIndex = '1000'; // En dessous du footer
        console.log('🗨️ Tawk.to widget positioned above footer');
      }
    };

    // Attendre que le widget soit chargé
    const checkWidget = setInterval(() => {
      if (window.Tawk_API && window.Tawk_API.onLoad) {
        window.Tawk_API.onLoad = function() {
          setTimeout(positionWidget, 500);
        };
        clearInterval(checkWidget);
      } else {
        // Fallback si onLoad n'est pas disponible
        setTimeout(positionWidget, 2000);
      }
    }, 500);

    // Cleanup function
    return () => {
      clearInterval(checkWidget);
      if (window.Tawk_API && window.Tawk_API.onLoaded) {
        console.log('🗨️ Tawk.to cleanup');
      }
    };
  }, [enabled, propertyId, widgetId]);
};

// Types pour TypeScript
declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}
