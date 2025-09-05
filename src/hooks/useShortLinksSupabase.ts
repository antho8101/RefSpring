import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ShortLink {
  id: string;
  shortCode: string;
  campaignId: string;
  affiliateId: string;
  targetUrl: string;
  createdAt: Date;
  clickCount: number;
}

export const useShortLinksSupabase = () => {
  const [loading, setLoading] = useState(false);

  // Créer un lien court
  const createShortLink = useCallback(async (
    campaignId: string,
    affiliateId: string,
    targetUrl: string
  ): Promise<string | null> => {
    try {
      setLoading(true);
      console.log('🔗 SHORT LINK - Création pour:', { campaignId, affiliateId, targetUrl });

      // Vérifier s'il existe déjà un lien pour cette combinaison campagne/affilié
      const { data: existingLinks } = await supabase
        .from('short_links')
        .select('short_code')
        .eq('campaign_id', campaignId)
        .eq('affiliate_id', affiliateId)
        .eq('target_url', targetUrl)
        .limit(1);

      if (existingLinks && existingLinks.length > 0) {
        console.log('✅ SHORT LINK - Lien existant trouvé:', existingLinks[0].short_code);
        return existingLinks[0].short_code;
      }

      // Générer un code court unique
      let shortCode: string;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        shortCode = Math.random().toString(36).substring(2, 8);
        attempts++;

        const { data: existing } = await supabase
          .from('short_links')
          .select('id')
          .eq('short_code', shortCode)
          .limit(1);

        isUnique = !existing || existing.length === 0;

        if (attempts >= maxAttempts) {
          console.error('❌ SHORT LINK - Impossible de générer un code unique');
          return null;
        }
      } while (!isUnique);

      // Créer le nouveau lien court
      const { data, error } = await supabase
        .from('short_links')
        .insert({
          short_code: shortCode,
          campaign_id: campaignId,
          affiliate_id: affiliateId,
          target_url: targetUrl,
          click_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ SHORT LINK - Créé avec succès:', shortCode);
      return shortCode;

    } catch (error) {
      console.error('❌ SHORT LINK - Erreur création:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer les données d'un lien court
  const getShortLinkData = useCallback(async (shortCode: string): Promise<ShortLink | null> => {
    try {
      console.log('🔍 SHORT LINK - Récupération pour code:', shortCode);

      const { data, error } = await supabase
        .from('short_links')
        .select('*')
        .eq('short_code', shortCode)
        .single();

      if (error || !data) {
        console.log('❌ SHORT LINK - Aucune donnée trouvée pour:', shortCode);
        return null;
      }

      // Incrémenter le compteur de clics
      await supabase
        .from('short_links')
        .update({ click_count: data.click_count + 1 })
        .eq('id', data.id);

      const shortLink: ShortLink = {
        id: data.id,
        shortCode: data.short_code,
        campaignId: data.campaign_id,
        affiliateId: data.affiliate_id,
        targetUrl: data.target_url,
        createdAt: new Date(data.created_at),
        clickCount: data.click_count + 1,
      };

      console.log('✅ SHORT LINK - Données récupérées:', shortLink);
      return shortLink;

    } catch (error) {
      console.error('❌ SHORT LINK - Erreur récupération:', error);
      return null;
    }
  }, []);

  return {
    createShortLink,
    getShortLinkData,
    loading,
  };
};