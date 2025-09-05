export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      affiliates: {
        Row: {
          campaign_id: string
          commission_rate: number
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
          stripe_account_id: string | null
          stripe_account_status: string | null
          tracking_code: string
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          commission_rate?: number
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name: string
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          tracking_code: string
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          commission_rate?: number
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          tracking_code?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliates_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_records: {
        Row: {
          campaign_id: string
          commission_amount: number
          created_at: string
          fee_amount: number
          id: string
          period: string
          processed_at: string | null
          status: string
          stripe_charge_id: string | null
          total_revenue: number
          user_id: string
        }
        Insert: {
          campaign_id: string
          commission_amount?: number
          created_at?: string
          fee_amount?: number
          id?: string
          period: string
          processed_at?: string | null
          status?: string
          stripe_charge_id?: string | null
          total_revenue?: number
          user_id: string
        }
        Update: {
          campaign_id?: string
          commission_amount?: number
          created_at?: string
          fee_amount?: number
          id?: string
          period?: string
          processed_at?: string | null
          status?: string
          stripe_charge_id?: string | null
          total_revenue?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_records_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          default_commission_rate: number
          description: string | null
          id: string
          is_active: boolean
          is_draft: boolean
          name: string
          payment_configured: boolean
          stripe_customer_id: string | null
          stripe_payment_method_id: string | null
          stripe_setup_intent_id: string | null
          target_url: string
          tracking_script: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_commission_rate?: number
          description?: string | null
          id?: string
          is_active?: boolean
          is_draft?: boolean
          name: string
          payment_configured?: boolean
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          stripe_setup_intent_id?: string | null
          target_url: string
          tracking_script?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_commission_rate?: number
          description?: string | null
          id?: string
          is_active?: boolean
          is_draft?: boolean
          name?: string
          payment_configured?: boolean
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          stripe_setup_intent_id?: string | null
          target_url?: string
          tracking_script?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clicks: {
        Row: {
          affiliate_id: string
          campaign_id: string
          created_at: string
          id: string
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          affiliate_id: string
          campaign_id: string
          created_at?: string
          id?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          affiliate_id?: string
          campaign_id?: string
          created_at?: string
          id?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clicks_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clicks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      conversion_audit_logs: {
        Row: {
          action: string
          conversion_id: string
          created_at: string
          id: string
          metadata: Json | null
          new_value: Json | null
          notes: string | null
          old_value: Json | null
          performed_by: string
        }
        Insert: {
          action: string
          conversion_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_value?: Json | null
          notes?: string | null
          old_value?: Json | null
          performed_by: string
        }
        Update: {
          action?: string
          conversion_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_value?: Json | null
          notes?: string | null
          old_value?: Json | null
          performed_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversion_audit_logs_conversion_id_fkey"
            columns: ["conversion_id"]
            isOneToOne: false
            referencedRelation: "conversions"
            referencedColumns: ["id"]
          },
        ]
      }
      conversion_verification_queue: {
        Row: {
          affiliate_id: string
          assigned_to: string | null
          campaign_id: string
          conversion_id: string
          created_at: string
          id: string
          metadata: Json | null
          next_retry_at: string | null
          priority: string
          processed_at: string | null
          retry_count: number
          status: string
        }
        Insert: {
          affiliate_id: string
          assigned_to?: string | null
          campaign_id: string
          conversion_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          next_retry_at?: string | null
          priority?: string
          processed_at?: string | null
          retry_count?: number
          status?: string
        }
        Update: {
          affiliate_id?: string
          assigned_to?: string | null
          campaign_id?: string
          conversion_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          next_retry_at?: string | null
          priority?: string
          processed_at?: string | null
          retry_count?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversion_verification_queue_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversion_verification_queue_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversion_verification_queue_conversion_id_fkey"
            columns: ["conversion_id"]
            isOneToOne: false
            referencedRelation: "conversions"
            referencedColumns: ["id"]
          },
        ]
      }
      conversion_webhooks: {
        Row: {
          conversion_id: string
          created_at: string
          id: string
          max_retries: number
          received_at: string | null
          response_body: string | null
          response_code: number | null
          retry_count: number
          sent_at: string | null
          status: string
          webhook_url: string
        }
        Insert: {
          conversion_id: string
          created_at?: string
          id?: string
          max_retries?: number
          received_at?: string | null
          response_body?: string | null
          response_code?: number | null
          retry_count?: number
          sent_at?: string | null
          status?: string
          webhook_url: string
        }
        Update: {
          conversion_id?: string
          created_at?: string
          id?: string
          max_retries?: number
          received_at?: string | null
          response_body?: string | null
          response_code?: number | null
          retry_count?: number
          sent_at?: string | null
          status?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversion_webhooks_conversion_id_fkey"
            columns: ["conversion_id"]
            isOneToOne: false
            referencedRelation: "conversions"
            referencedColumns: ["id"]
          },
        ]
      }
      conversions: {
        Row: {
          affiliate_id: string
          amount: number
          campaign_id: string
          commission: number
          created_at: string
          id: string
          risk_score: number | null
          status: string
          updated_at: string
          verification_notes: string | null
          verified: boolean
          verified_at: string | null
          verified_by: string | null
          webhook_validated: boolean | null
        }
        Insert: {
          affiliate_id: string
          amount: number
          campaign_id: string
          commission: number
          created_at?: string
          id?: string
          risk_score?: number | null
          status?: string
          updated_at?: string
          verification_notes?: string | null
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          webhook_validated?: boolean | null
        }
        Update: {
          affiliate_id?: string
          amount?: number
          campaign_id?: string
          commission?: number
          created_at?: string
          id?: string
          risk_score?: number | null
          status?: string
          updated_at?: string
          verification_notes?: string | null
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          webhook_validated?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "conversions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_distributions: {
        Row: {
          affiliate_payments: Json
          campaign_id: string
          created_at: string
          id: string
          platform_fee: number
          processed_at: string | null
          reason: string
          status: string
          stripe_payment_links: Json | null
          total_commissions: number
          total_revenue: number
          user_id: string
        }
        Insert: {
          affiliate_payments?: Json
          campaign_id: string
          created_at?: string
          id?: string
          platform_fee?: number
          processed_at?: string | null
          reason: string
          status?: string
          stripe_payment_links?: Json | null
          total_commissions?: number
          total_revenue?: number
          user_id: string
        }
        Update: {
          affiliate_payments?: Json
          campaign_id?: string
          created_at?: string
          id?: string
          platform_fee?: number
          processed_at?: string | null
          reason?: string
          status?: string
          stripe_payment_links?: Json | null
          total_commissions?: number
          total_revenue?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_distributions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      shopify_integrations: {
        Row: {
          access_token: string
          active: boolean | null
          campaign_id: string
          created_at: string
          id: string
          settings: Json | null
          shop_domain: string
          shop_info: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          active?: boolean | null
          campaign_id: string
          created_at?: string
          id?: string
          settings?: Json | null
          shop_domain: string
          shop_info?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          active?: boolean | null
          campaign_id?: string
          created_at?: string
          id?: string
          settings?: Json | null
          shop_domain?: string
          shop_info?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shopify_oauth_states: {
        Row: {
          campaign_id: string
          created_at: string
          expires_at: string
          id: string
          shop_domain: string
          state_token: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          expires_at?: string
          id?: string
          shop_domain: string
          state_token: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          shop_domain?: string
          state_token?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_suspicious_activity: {
        Args: { activity_type?: string; user_id?: string }
        Returns: boolean
      }
      log_security_event: {
        Args: { details?: Json; event_type: string; user_id?: string }
        Returns: undefined
      }
      validate_affiliate_access: {
        Args: { campaign_id: string; requesting_user_id?: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
