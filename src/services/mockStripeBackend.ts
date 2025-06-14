
// Service complètement désactivé - Toutes les opérations passent par les vraies API Vercel Edge Functions
class MockStripeBackend {
  async handleCreateSetupEndpoint(request: Request): Promise<Response> {
    console.log('❌ SERVICE DÉSACTIVÉ: MockStripeBackend.handleCreateSetupEndpoint');
    throw new Error('Service désactivé - Utiliser les vraies API Vercel Edge Functions');
  }

  async handleCheckSetupEndpoint(setupIntentId: string): Promise<Response> {
    console.log('❌ SERVICE DÉSACTIVÉ: MockStripeBackend.handleCheckSetupEndpoint');
    throw new Error('Service désactivé - Utiliser les vraies API Vercel Edge Functions');
  }

  install() {
    console.log('❌ Mock Stripe Backend DÉSACTIVÉ - Utilisation des vraies API uniquement');
    // Ne plus intercepter les appels fetch
  }
}

export const mockStripeBackend = new MockStripeBackend();
