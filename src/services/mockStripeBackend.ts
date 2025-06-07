
import { stripeExpressService } from './stripeExpressService';

// Service pour simuler les endpoints backend en développement
class MockStripeBackend {
  // Simuler l'endpoint /api/stripe/create-setup
  async handleCreateSetupEndpoint(request: Request): Promise<Response> {
    try {
      const data = await request.json();
      const result = await stripeExpressService.handleCreateSetup(data);
      
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error: any) {
      console.error('❌ Erreur endpoint create-setup:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Simuler l'endpoint /api/stripe/check-setup/:id
  async handleCheckSetupEndpoint(setupIntentId: string): Promise<Response> {
    try {
      const result = await stripeExpressService.handleCheckSetup(setupIntentId);
      
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error: any) {
      console.error('❌ Erreur endpoint check-setup:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Installer les intercepteurs de fetch pour simuler les endpoints
  install() {
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input.toString();
      
      // Intercepter les appels à nos endpoints simulés
      if (url.includes('/api/stripe/create-setup')) {
        console.log('🔄 Intercepted: create-setup endpoint');
        const request = new Request(input, init);
        return this.handleCreateSetupEndpoint(request);
      }
      
      if (url.includes('/api/stripe/check-setup/')) {
        console.log('🔄 Intercepted: check-setup endpoint');
        const setupIntentId = url.split('/api/stripe/check-setup/')[1];
        return this.handleCheckSetupEndpoint(setupIntentId);
      }
      
      // Pour tous les autres appels, utiliser fetch normal
      return originalFetch(input, init);
    };
    
    console.log('✅ Mock Stripe Backend installé');
  }
}

export const mockStripeBackend = new MockStripeBackend();
