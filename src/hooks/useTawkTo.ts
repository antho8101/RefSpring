
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

    // Fonction pour forcer le positionnement avec !important
    const forceWidgetPosition = () => {
      // Chercher tous les éléments possibles du widget Tawk.to
      const selectors = [
        '#tawkchat-iframe-container',
        '.tawk-messenger-container', 
        '[id*="tawk"]',
        'iframe[src*="tawk.to"]'
      ];
      
      selectors.forEach(selector => {
        const widgets = document.querySelectorAll(selector);
        widgets.forEach(widget => {
          if (widget instanceof HTMLElement) {
            // Forcer le positionnement avec !important
            widget.style.setProperty('bottom', '160px', 'important');
            widget.style.setProperty('right', '20px', 'important');
            widget.style.setProperty('z-index', '998', 'important');
            console.log('🗨️ Tawk.to widget repositioned with !important');
          }
        });
      });

      // Ajouter des styles CSS globaux pour être sûr
      const styleElement = document.createElement('style');
      styleElement.innerHTML = `
        #tawkchat-iframe-container,
        .tawk-messenger-container,
        [id*="tawk"] {
          bottom: 160px !important;
          right: 20px !important;
          z-index: 998 !important;
        }
      `;
      
      if (!document.head.querySelector('style[data-tawk-position]')) {
        styleElement.setAttribute('data-tawk-position', 'true');
        document.head.appendChild(styleElement);
      }
    };

    // Observer pour détecter les changements dans le DOM
    const observer = new MutationObserver(() => {
      forceWidgetPosition();
    });

    // Surveiller les changements dans le body
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    // Attendre que le widget soit chargé et le repositionner
    const checkAndPositionWidget = () => {
      if (window.Tawk_API) {
        // Utiliser onLoad si disponible
        if (window.Tawk_API.onLoad) {
          window.Tawk_API.onLoad = function() {
            setTimeout(forceWidgetPosition, 500);
            setTimeout(forceWidgetPosition, 1000);
            // Repositionner également lors du redimensionnement
            window.addEventListener('resize', forceWidgetPosition);
          };
        }
        
        // Repositionner aussi quand le widget change d'état
        if (window.Tawk_API.onChatMaximized) {
          window.Tawk_API.onChatMaximized = function() {
            setTimeout(forceWidgetPosition, 100);
          };
        }
        
        if (window.Tawk_API.onChatMinimized) {
          window.Tawk_API.onChatMinimized = function() {
            setTimeout(forceWidgetPosition, 100);
          };
        }
      }
      
      // Fallback: repositionner après plusieurs délais
      setTimeout(forceWidgetPosition, 1000);
      setTimeout(forceWidgetPosition, 2000);
      setTimeout(forceWidgetPosition, 4000);
    };

    // Vérifier périodiquement que le widget est chargé
    const checkWidget = setInterval(() => {
      if (window.Tawk_API) {
        checkAndPositionWidget();
        clearInterval(checkWidget);
      }
      // Forcer le positionnement même si l'API n'est pas encore prête
      forceWidgetPosition();
    }, 500);

    // Cleanup function
    return () => {
      clearInterval(checkWidget);
      observer.disconnect();
      window.removeEventListener('resize', forceWidgetPosition);
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
