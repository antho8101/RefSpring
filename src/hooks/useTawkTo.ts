
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
        // Positionner le chat bien au-dessus du footer
        widget.style.bottom = '140px'; // Plus d'espace pour éviter le chevauchement
        widget.style.right = '20px';
        widget.style.zIndex = '999'; // En dessous du footer mais visible
        console.log('🗨️ Tawk.to widget positioned above footer with proper spacing');
      }
    };

    // Attendre que le widget soit chargé et le repositionner
    const checkAndPositionWidget = () => {
      if (window.Tawk_API) {
        // Utiliser onLoad si disponible
        if (window.Tawk_API.onLoad) {
          window.Tawk_API.onLoad = function() {
            setTimeout(positionWidget, 500);
            // Repositionner également lors du redimensionnement
            window.addEventListener('resize', positionWidget);
          };
        }
        
        // Repositionner aussi quand le widget change d'état
        if (window.Tawk_API.onChatMaximized) {
          window.Tawk_API.onChatMaximized = function() {
            setTimeout(positionWidget, 100);
          };
        }
        
        if (window.Tawk_API.onChatMinimized) {
          window.Tawk_API.onChatMinimized = function() {
            setTimeout(positionWidget, 100);
          };
        }
      }
      
      // Fallback: repositionner après un délai
      setTimeout(positionWidget, 2000);
      setTimeout(positionWidget, 4000); // Double vérification
    };

    // Vérifier périodiquement que le widget est chargé
    const checkWidget = setInterval(() => {
      if (window.Tawk_API) {
        checkAndPositionWidget();
        clearInterval(checkWidget);
      }
    }, 500);

    // Cleanup function
    return () => {
      clearInterval(checkWidget);
      window.removeEventListener('resize', positionWidget);
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
