export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          locale: string;
          specialty: "naturopathe" | "sophrologue" | "hypnotherapeute" | "multi" | null;
          brand_name: string | null;
          brand_logo_url: string | null;
          brand_color: string | null;
          slogan: string | null;
          siret: string | null;
          rpps_or_adeli: string | null;
          address_json: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          locale?: string;
          specialty?: "naturopathe" | "sophrologue" | "hypnotherapeute" | "multi" | null;
          brand_name?: string | null;
          brand_logo_url?: string | null;
          brand_color?: string | null;
          slogan?: string | null;
          siret?: string | null;
          rpps_or_adeli?: string | null;
          address_json?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          locale?: string;
          specialty?: "naturopathe" | "sophrologue" | "hypnotherapeute" | "multi" | null;
          brand_name?: string | null;
          brand_logo_url?: string | null;
          brand_color?: string | null;
          slogan?: string | null;
          siret?: string | null;
          rpps_or_adeli?: string | null;
          address_json?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: "free" | "cabinet" | "cabinet_plus";
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          status: string;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan?: "free" | "cabinet" | "cabinet_plus";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          status?: string;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan?: "free" | "cabinet" | "cabinet_plus";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          status?: string;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      usage_quotas: {
        Row: {
          id: string;
          user_id: string;
          year_month: string;
          protocols_count: number;
          audios_count: number;
          company_programs_count: number;
          summaries_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          year_month: string;
          protocols_count?: number;
          audios_count?: number;
          company_programs_count?: number;
          summaries_count?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          year_month?: string;
          protocols_count?: number;
          audios_count?: number;
          company_programs_count?: number;
          summaries_count?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };

      stripe_events: {
        Row: {
          id: string;
          processed_at: string;
        };
        Insert: {
          id: string;
          processed_at?: string;
        };
        Update: {
          id?: string;
          processed_at?: string;
        };
        Relationships: [];
      };

      consent_records: {
        Row: {
          id: string;
          user_id: string | null;
          client_id: string | null;
          document_version: string;
          signed_at: string;
          ip: string | null;
          signature_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          client_id?: string | null;
          document_version: string;
          signed_at: string;
          ip?: string | null;
          signature_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          client_id?: string | null;
          document_version?: string;
          signed_at?: string;
          ip?: string | null;
          signature_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      clients: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          photo_url: string | null;
          birth_date: string | null;
          primary_concern: string | null;
          tags: string[];
          status: "active" | "inactive" | "archived";
          client_portal_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          photo_url?: string | null;
          birth_date?: string | null;
          primary_concern?: string | null;
          tags?: string[];
          status?: "active" | "inactive" | "archived";
          client_portal_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          photo_url?: string | null;
          birth_date?: string | null;
          primary_concern?: string | null;
          tags?: string[];
          status?: "active" | "inactive" | "archived";
          client_portal_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      anamneses: {
        Row: {
          id: string;
          client_id: string;
          version: number;
          data: Json;
          signed_consent_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          version?: number;
          data: Json;
          signed_consent_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          version?: number;
          data?: Json;
          signed_consent_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      protocols: {
        Row: {
          id: string;
          client_id: string;
          practitioner_id: string;
          title: string;
          inputs: Json;
          output: Json;
          duration_weeks: number;
          status: "draft" | "active" | "completed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          practitioner_id: string;
          title: string;
          inputs?: Json;
          output?: Json;
          duration_weeks?: number;
          status?: "draft" | "active" | "completed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          practitioner_id?: string;
          title?: string;
          inputs?: Json;
          output?: Json;
          duration_weeks?: number;
          status?: "draft" | "active" | "completed";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      sessions: {
        Row: {
          id: string;
          client_id: string;
          practitioner_id: string;
          date: string;
          duration_min: number | null;
          type: "presentiel" | "visio";
          notes_practitioner: string | null;
          summary_client: string | null;
          next_steps: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          practitioner_id: string;
          date: string;
          duration_min?: number | null;
          type?: "presentiel" | "visio";
          notes_practitioner?: string | null;
          summary_client?: string | null;
          next_steps?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          practitioner_id?: string;
          date?: string;
          duration_min?: number | null;
          type?: "presentiel" | "visio";
          notes_practitioner?: string | null;
          summary_client?: string | null;
          next_steps?: Json;
          created_at?: string;
        };
        Relationships: [];
      };

      session_audios: {
        Row: {
          id: string;
          session_id: string;
          title: string;
          audio_url: string;
          duration_sec: number | null;
          transcript: string | null;
          generated_by: "upload" | "elevenlabs";
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          title: string;
          audio_url: string;
          duration_sec?: number | null;
          transcript?: string | null;
          generated_by?: "upload" | "elevenlabs";
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          title?: string;
          audio_url?: string;
          duration_sec?: number | null;
          transcript?: string | null;
          generated_by?: "upload" | "elevenlabs";
          created_at?: string;
        };
        Relationships: [];
      };

      client_check_ins: {
        Row: {
          id: string;
          client_id: string;
          date: string;
          mood: number | null;
          sleep_quality: number | null;
          energy: number | null;
          notes: string | null;
          custom_metrics: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          date: string;
          mood?: number | null;
          sleep_quality?: number | null;
          energy?: number | null;
          notes?: string | null;
          custom_metrics?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          date?: string;
          mood?: number | null;
          sleep_quality?: number | null;
          energy?: number | null;
          notes?: string | null;
          custom_metrics?: Json;
          created_at?: string;
        };
        Relationships: [];
      };

      products: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string | null;
          brand: string | null;
          dosage: string | null;
          retail_price: number | null;
          practitioner_margin: number | null;
          image_url: string | null;
          dropship_supplier: string | null;
          stripe_product_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category?: string | null;
          brand?: string | null;
          dosage?: string | null;
          retail_price?: number | null;
          practitioner_margin?: number | null;
          image_url?: string | null;
          dropship_supplier?: string | null;
          stripe_product_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: string | null;
          brand?: string | null;
          dosage?: string | null;
          retail_price?: number | null;
          practitioner_margin?: number | null;
          image_url?: string | null;
          dropship_supplier?: string | null;
          stripe_product_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      product_recommendations: {
        Row: {
          id: string;
          protocol_id: string;
          product_id: string;
          quantity: number;
          posology: string | null;
          duration_days: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          protocol_id: string;
          product_id: string;
          quantity?: number;
          posology?: string | null;
          duration_days?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          protocol_id?: string;
          product_id?: string;
          quantity?: number;
          posology?: string | null;
          duration_days?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };

      companies: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          contact_name: string | null;
          contact_email: string | null;
          siret: string | null;
          employee_count: number | null;
          sector: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          contact_name?: string | null;
          contact_email?: string | null;
          siret?: string | null;
          employee_count?: number | null;
          sector?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          contact_name?: string | null;
          contact_email?: string | null;
          siret?: string | null;
          employee_count?: number | null;
          sector?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      company_programs: {
        Row: {
          id: string;
          company_id: string;
          practitioner_id: string;
          title: string;
          format: "workshop" | "individual_session" | "subscription";
          sessions_count: number;
          price_total: number | null;
          status: "draft" | "proposal" | "signed" | "in_progress" | "completed";
          start_date: string | null;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          practitioner_id: string;
          title: string;
          format?: "workshop" | "individual_session" | "subscription";
          sessions_count?: number;
          price_total?: number | null;
          status?: "draft" | "proposal" | "signed" | "in_progress" | "completed";
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          practitioner_id?: string;
          title?: string;
          format?: "workshop" | "individual_session" | "subscription";
          sessions_count?: number;
          price_total?: number | null;
          status?: "draft" | "proposal" | "signed" | "in_progress" | "completed";
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      company_attendees: {
        Row: {
          id: string;
          program_id: string;
          full_name: string;
          email: string | null;
          attended_sessions: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          program_id: string;
          full_name: string;
          email?: string | null;
          attended_sessions?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          program_id?: string;
          full_name?: string;
          email?: string | null;
          attended_sessions?: Json;
          created_at?: string;
        };
        Relationships: [];
      };

      invoices: {
        Row: {
          id: string;
          user_id: string;
          client_id: string | null;
          company_id: string | null;
          amount: number;
          vat: number;
          items: Json;
          pdf_url: string | null;
          status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
          paid_at: string | null;
          stripe_payment_intent_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id?: string | null;
          company_id?: string | null;
          amount: number;
          vat?: number;
          items?: Json;
          pdf_url?: string | null;
          status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
          paid_at?: string | null;
          stripe_payment_intent_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_id?: string | null;
          company_id?: string | null;
          amount?: number;
          vat?: number;
          items?: Json;
          pdf_url?: string | null;
          status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
          paid_at?: string | null;
          stripe_payment_intent_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      share_tokens: {
        Row: {
          token: string;
          resource_type: string;
          resource_id: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          token: string;
          resource_type: string;
          resource_id: string;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          token?: string;
          resource_type?: string;
          resource_id?: string;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };

      ai_usage_log: {
        Row: {
          id: string;
          user_id: string;
          model: string;
          prompt_tokens: number;
          completion_tokens: number;
          cost_eur: number;
          feature: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          model: string;
          prompt_tokens?: number;
          completion_tokens?: number;
          cost_eur?: number;
          feature: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          model?: string;
          prompt_tokens?: number;
          completion_tokens?: number;
          cost_eur?: number;
          feature?: string;
          created_at?: string;
        };
        Relationships: [];
      };

      protocol_cache: {
        Row: {
          id: string;
          cache_key: string;
          protocol_output: Json;
          created_at: string;
          expires_at: string;
          hit_count: number;
        };
        Insert: {
          id?: string;
          cache_key: string;
          protocol_output: Json;
          created_at?: string;
          expires_at?: string;
          hit_count?: number;
        };
        Update: {
          id?: string;
          cache_key?: string;
          protocol_output?: Json;
          created_at?: string;
          expires_at?: string;
          hit_count?: number;
        };
        Relationships: [];
      };

      push_subscriptions: {
        Row: {
          id: string;
          client_id: string;
          endpoint: string;
          keys_p256dh: string;
          keys_auth: string;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          endpoint: string;
          keys_p256dh: string;
          keys_auth: string;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          endpoint?: string;
          keys_p256dh?: string;
          keys_auth?: string;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      client_points: {
        Row: {
          id: string;
          client_id: string;
          total_points: number;
          level: "graine" | "pousse" | "fleur" | "arbre";
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          total_points?: number;
          level?: "graine" | "pousse" | "fleur" | "arbre";
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          total_points?: number;
          level?: "graine" | "pousse" | "fleur" | "arbre";
          updated_at?: string;
        };
        Relationships: [];
      };

      client_point_events: {
        Row: {
          id: string;
          client_id: string;
          event_type: string;
          points: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          event_type: string;
          points: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          event_type?: string;
          points?: number;
          created_at?: string;
        };
        Relationships: [];
      };

      onboarding_sessions: {
        Row: {
          id: string;
          client_id: string;
          token: string;
          step: number;
          completed: boolean;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          token?: string;
          step?: number;
          completed?: boolean;
          created_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          token?: string;
          step?: number;
          completed?: boolean;
          created_at?: string;
          expires_at?: string;
        };
        Relationships: [];
      };

      referral_codes: {
        Row: {
          id: string;
          user_id: string;
          code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          code: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          code?: string;
          created_at?: string;
        };
        Relationships: [];
      };

      referrals: {
        Row: {
          id: string;
          referrer_id: string;
          referred_id: string;
          code: string;
          status: "pending" | "converted" | "rewarded";
          converted_at: string | null;
          rewarded_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          referrer_id: string;
          referred_id: string;
          code: string;
          status?: "pending" | "converted" | "rewarded";
          converted_at?: string | null;
          rewarded_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          referrer_id?: string;
          referred_id?: string;
          code?: string;
          status?: "pending" | "converted" | "rewarded";
          converted_at?: string | null;
          rewarded_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      nps_responses: {
        Row: {
          id: string;
          user_id: string;
          score: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          score: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          score?: number;
          comment?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      feature_requests: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: "backlog" | "in_progress" | "done" | "cancelled";
          priority: number;
          votes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: "backlog" | "in_progress" | "done" | "cancelled";
          priority?: number;
          votes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          status?: "backlog" | "in_progress" | "done" | "cancelled";
          priority?: number;
          votes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      lead_magnet_subscribers: {
        Row: { id: string; email: string; source: string; created_at: string };
        Insert: { id?: string; email: string; source?: string; created_at?: string };
        Update: { id?: string; email?: string; source?: string; created_at?: string };
        Relationships: [];
      };

      client_consents: {
        Row: {
          id: string;
          client_id: string;
          practitioner_id: string;
          consent_type: "data_processing" | "health_data" | "photo" | "marketing";
          granted: boolean;
          ip_address: string | null;
          signed_at: string | null;
          revoked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          practitioner_id: string;
          consent_type: "data_processing" | "health_data" | "photo" | "marketing";
          granted?: boolean;
          ip_address?: string | null;
          signed_at?: string | null;
          revoked_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          practitioner_id?: string;
          consent_type?: "data_processing" | "health_data" | "photo" | "marketing";
          granted?: boolean;
          ip_address?: string | null;
          signed_at?: string | null;
          revoked_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      deletion_requests: {
        Row: {
          id: string;
          client_id: string;
          practitioner_id: string;
          requested_at: string;
          processed_at: string | null;
          status: "pending" | "processed";
        };
        Insert: {
          id?: string;
          client_id: string;
          practitioner_id: string;
          requested_at?: string;
          processed_at?: string | null;
          status?: "pending" | "processed";
        };
        Update: {
          id?: string;
          client_id?: string;
          practitioner_id?: string;
          requested_at?: string;
          processed_at?: string | null;
          status?: "pending" | "processed";
        };
        Relationships: [];
      };
    };

    Views: {
      revenue_dashboard: {
        Row: {
          practitioner_id: string;
          full_name: string | null;
          brand_name: string | null;
          total_clients: number;
          active_protocols: number;
          monthly_revenue: number;
          total_revenue: number;
        };
        Relationships: [];
      };
    };

    Functions: {
      refresh_revenue_dashboard: {
        Args: Record<string, never>;
        Returns: void;
      };
    };

    Enums: Record<string, never>;
  };
}
