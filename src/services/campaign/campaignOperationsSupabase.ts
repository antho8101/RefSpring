import { supabase } from '@/integrations/supabase/client';

export const createCampaignInSupabase = async (
  campaignData: {
    name: string;
    description?: string;
    target_url: string;
    is_active: boolean;
    default_commission_rate?: number;
  },
  userId: string
) => {
  console.log('🆕 Création de campagne dans Supabase pour:', userId);
  
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .insert({
      ...campaignData,
      user_id: userId,
      is_draft: false,
      payment_configured: true,
      default_commission_rate: campaignData.default_commission_rate || 0.10
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Erreur création campagne Supabase:', error);
    throw error;
  }
  
  console.log('✅ Campagne créée avec ID:', campaign.id);
  return campaign;
};

export const updateCampaignInSupabase = async (
  campaignId: string,
  updates: Record<string, any>
) => {
  console.log('📝 Mise à jour de campagne:', campaignId);
  
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', campaignId)
    .select()
    .single();

  if (error) {
    console.error('❌ Erreur mise à jour campagne Supabase:', error);
    throw error;
  }
  
  console.log('✅ Campagne mise à jour');
  return campaign;
};

export const finalizeCampaignInSupabase = async (
  campaignId: string, 
  stripeData: { customerId: string; setupIntentId: string; paymentMethodId?: string }
) => {
  console.log('🔥 FINALIZE: Finalisation de la campagne:', campaignId);
  console.log('🔥 FINALIZE: Données Stripe:', stripeData);
  
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .update({
      is_draft: false,
      payment_configured: true,
      stripe_customer_id: stripeData.customerId,
      stripe_setup_intent_id: stripeData.setupIntentId,
      stripe_payment_method_id: stripeData.paymentMethodId,
      updated_at: new Date().toISOString()
    })
    .eq('id', campaignId)
    .select()
    .single();

  if (error) {
    console.error('❌ Erreur finalisation campagne Supabase:', error);
    throw error;
  }
  
  console.log('✅ FINALIZE: Campagne finalisée avec succès');
  return campaign;
};

export const deleteCampaignFromSupabase = async (campaignId: string, userId: string) => {
  console.log('🗑️ Suppression de campagne:', campaignId);
  
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', campaignId)
    .eq('user_id', userId);

  if (error) {
    console.error('❌ Erreur suppression campagne Supabase:', error);
    throw error;
  }
  
  console.log('✅ Campagne supprimée');
};