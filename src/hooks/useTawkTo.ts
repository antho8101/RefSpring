
import { useEffect } from 'react';

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

export const useTawkTo = (shouldLoad: boolean = true) => {
  useEffect(() => {
    if (!shouldLoad) return;

    // Vérifier si Tawk.to est déjà chargé
    if (window.Tawk_API) {
      console.log('💬 Tawk.to déjà chargé');
      return;
    }

    console.log('💬 Initialisation de Tawk.to...');

    // Initialiser Tawk.to
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Créer et injecter le script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://embed.tawk.to/68495cd58148b31910f7fb54/1itf958p9';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    }

    // Cleanup function
    return () => {
      // Ne pas supprimer le script au démontage pour éviter les rechargements
      console.log('💬 Tawk.to hook cleanup');
    };
  }, [shouldLoad]);

  return {
    isLoaded: !!window.Tawk_API
  };
};
