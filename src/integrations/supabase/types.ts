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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          category: string
          created_at: string
          date: string
          description: string
          id: string
          image_url: string | null
          location: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          date: string
          description: string
          id?: string
          image_url?: string | null
          location: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          image_url?: string | null
          location?: string
          title?: string
        }
        Relationships: []
      }
      admin_activity_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_label: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_label?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_label?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      aid_projects: {
        Row: {
          budget: number | null
          category: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          category: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          category?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
        }
        Relationships: []
      }
      distribution_slips: {
        Row: {
          app_code: string | null
          applicant_id: string
          applicant_name: string
          application_id: string
          batch_number: string | null
          created_at: string
          distribution_date: string
          distribution_day: string | null
          distribution_location: string | null
          distribution_time: string | null
          father_name: string | null
          id: string
          nid: string | null
          pdf_url: string | null
          phone: string | null
          project_id: string | null
          project_name: string | null
          updated_at: string
        }
        Insert: {
          app_code?: string | null
          applicant_id: string
          applicant_name: string
          application_id: string
          batch_number?: string | null
          created_at?: string
          distribution_date: string
          distribution_day?: string | null
          distribution_location?: string | null
          distribution_time?: string | null
          father_name?: string | null
          id?: string
          nid?: string | null
          pdf_url?: string | null
          phone?: string | null
          project_id?: string | null
          project_name?: string | null
          updated_at?: string
        }
        Update: {
          app_code?: string | null
          applicant_id?: string
          applicant_name?: string
          application_id?: string
          batch_number?: string | null
          created_at?: string
          distribution_date?: string
          distribution_day?: string | null
          distribution_location?: string | null
          distribution_time?: string | null
          father_name?: string | null
          id?: string
          nid?: string | null
          pdf_url?: string | null
          phone?: string | null
          project_id?: string | null
          project_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "distribution_slips_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "help_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_slips_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "aid_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          donated_at: string
          donor_name: string
          donor_phone: string | null
          id: string
          method: string
          purpose: string | null
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          donated_at?: string
          donor_name: string
          donor_phone?: string | null
          id?: string
          method?: string
          purpose?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          donated_at?: string
          donor_name?: string
          donor_phone?: string | null
          id?: string
          method?: string
          purpose?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          banner_url: string | null
          created_at: string
          description: string | null
          event_date: string
          id: string
          location: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          event_date: string
          id?: string
          location?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          event_date?: string
          id?: string
          location?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      foundation_settings: {
        Row: {
          about_short: string | null
          address: string | null
          allowed_thanas: string[]
          allowed_unions: string[]
          allowed_wards: string[]
          bkash_number: string | null
          created_at: string
          email: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          is_singleton: boolean
          islami_bank_account: string | null
          logo_url: string | null
          nagad_number: string | null
          name: string
          phone: string | null
          rocket_number: string | null
          tagline: string | null
          twitter_url: string | null
          union_ward_map: Json
          updated_at: string
          website_url: string | null
          whatsapp_url: string | null
          youtube_url: string | null
        }
        Insert: {
          about_short?: string | null
          address?: string | null
          allowed_thanas?: string[]
          allowed_unions?: string[]
          allowed_wards?: string[]
          bkash_number?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          is_singleton?: boolean
          islami_bank_account?: string | null
          logo_url?: string | null
          nagad_number?: string | null
          name?: string
          phone?: string | null
          rocket_number?: string | null
          tagline?: string | null
          twitter_url?: string | null
          union_ward_map?: Json
          updated_at?: string
          website_url?: string | null
          whatsapp_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          about_short?: string | null
          address?: string | null
          allowed_thanas?: string[]
          allowed_unions?: string[]
          allowed_wards?: string[]
          bkash_number?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          is_singleton?: boolean
          islami_bank_account?: string | null
          logo_url?: string | null
          nagad_number?: string | null
          name?: string
          phone?: string | null
          rocket_number?: string | null
          tagline?: string | null
          twitter_url?: string | null
          union_ward_map?: Json
          updated_at?: string
          website_url?: string | null
          whatsapp_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          album: string | null
          created_at: string
          event_id: string | null
          id: string
          media_url: string
          title: string | null
          type: string
        }
        Insert: {
          album?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          media_url: string
          title?: string | null
          type?: string
        }
        Update: {
          album?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          media_url?: string
          title?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      help_applications: {
        Row: {
          additional_notes: string | null
          address: string | null
          admin_notes: string | null
          amount: string | null
          app_code: string | null
          created_at: string
          dob: string | null
          family_count: number | null
          father_name: string | null
          file_count: number
          financial_condition: string | null
          gender: string | null
          id: string
          monthly_income: number | null
          mother_name: string | null
          name: string
          nid: string
          nid_back_url: string | null
          nid_front_url: string | null
          occupation: string | null
          pdf_url: string | null
          permanent_address: string | null
          phone: string
          photo_url: string | null
          present_address: string | null
          project_id: string | null
          reason: string
          requested_amount: number | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          additional_notes?: string | null
          address?: string | null
          admin_notes?: string | null
          amount?: string | null
          app_code?: string | null
          created_at?: string
          dob?: string | null
          family_count?: number | null
          father_name?: string | null
          file_count?: number
          financial_condition?: string | null
          gender?: string | null
          id?: string
          monthly_income?: number | null
          mother_name?: string | null
          name: string
          nid: string
          nid_back_url?: string | null
          nid_front_url?: string | null
          occupation?: string | null
          pdf_url?: string | null
          permanent_address?: string | null
          phone: string
          photo_url?: string | null
          present_address?: string | null
          project_id?: string | null
          reason: string
          requested_amount?: number | null
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          additional_notes?: string | null
          address?: string | null
          admin_notes?: string | null
          amount?: string | null
          app_code?: string | null
          created_at?: string
          dob?: string | null
          family_count?: number | null
          father_name?: string | null
          file_count?: number
          financial_condition?: string | null
          gender?: string | null
          id?: string
          monthly_income?: number | null
          mother_name?: string | null
          name?: string
          nid?: string
          nid_back_url?: string | null
          nid_front_url?: string | null
          occupation?: string | null
          pdf_url?: string | null
          permanent_address?: string | null
          phone?: string
          photo_url?: string | null
          present_address?: string | null
          project_id?: string | null
          reason?: string
          requested_amount?: number | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "help_applications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "aid_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          area: string | null
          created_at: string
          email: string | null
          id: string
          join_date: string | null
          member_code: string | null
          name: string
          name_en: string | null
          nid: string | null
          notes: string | null
          phone: string | null
          photo_url: string | null
          role: string | null
          status: string
          updated_at: string
        }
        Insert: {
          area?: string | null
          created_at?: string
          email?: string | null
          id?: string
          join_date?: string | null
          member_code?: string | null
          name: string
          name_en?: string | null
          nid?: string | null
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          role?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          area?: string | null
          created_at?: string
          email?: string | null
          id?: string
          join_date?: string | null
          member_code?: string | null
          name?: string
          name_en?: string | null
          nid?: string | null
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          role?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      notices: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_published: boolean
          published_at: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      volunteers: {
        Row: {
          area: string | null
          assigned_task: string | null
          blood_group: string | null
          created_at: string
          education: string | null
          expires_at: string | null
          id: string
          joined_at: string | null
          name: string
          nid: string | null
          phone: string | null
          photo_url: string | null
          previous_experience: string | null
          role: string | null
          skills: string | null
          status: string
          updated_at: string
          volunteer_code: string | null
        }
        Insert: {
          area?: string | null
          assigned_task?: string | null
          blood_group?: string | null
          created_at?: string
          education?: string | null
          expires_at?: string | null
          id?: string
          joined_at?: string | null
          name: string
          nid?: string | null
          phone?: string | null
          photo_url?: string | null
          previous_experience?: string | null
          role?: string | null
          skills?: string | null
          status?: string
          updated_at?: string
          volunteer_code?: string | null
        }
        Update: {
          area?: string | null
          assigned_task?: string | null
          blood_group?: string | null
          created_at?: string
          education?: string | null
          expires_at?: string | null
          id?: string
          joined_at?: string | null
          name?: string
          nid?: string | null
          phone?: string | null
          photo_url?: string | null
          previous_experience?: string | null
          role?: string | null
          skills?: string | null
          status?: string
          updated_at?: string
          volunteer_code?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      foundation_public_settings: {
        Row: {
          about_short: string | null
          address: string | null
          allowed_thanas: string[] | null
          allowed_unions: string[] | null
          allowed_wards: string[] | null
          email: string | null
          facebook_url: string | null
          id: string | null
          instagram_url: string | null
          logo_url: string | null
          name: string | null
          phone: string | null
          tagline: string | null
          twitter_url: string | null
          union_ward_map: Json | null
          website_url: string | null
          whatsapp_url: string | null
          youtube_url: string | null
        }
        Insert: {
          about_short?: string | null
          address?: string | null
          allowed_thanas?: string[] | null
          allowed_unions?: string[] | null
          allowed_wards?: string[] | null
          email?: string | null
          facebook_url?: string | null
          id?: string | null
          instagram_url?: string | null
          logo_url?: string | null
          name?: string | null
          phone?: string | null
          tagline?: string | null
          twitter_url?: string | null
          union_ward_map?: Json | null
          website_url?: string | null
          whatsapp_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          about_short?: string | null
          address?: string | null
          allowed_thanas?: string[] | null
          allowed_unions?: string[] | null
          allowed_wards?: string[] | null
          email?: string | null
          facebook_url?: string | null
          id?: string | null
          instagram_url?: string | null
          logo_url?: string | null
          name?: string | null
          phone?: string | null
          tagline?: string | null
          twitter_url?: string | null
          union_ward_map?: Json | null
          website_url?: string | null
          whatsapp_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      member_public_card: {
        Row: {
          area: string | null
          join_date: string | null
          member_code: string | null
          name: string | null
          photo_url: string | null
          role: string | null
          status: string | null
        }
        Insert: {
          area?: string | null
          join_date?: string | null
          member_code?: string | null
          name?: string | null
          photo_url?: string | null
          role?: string | null
          status?: string | null
        }
        Update: {
          area?: string | null
          join_date?: string | null
          member_code?: string | null
          name?: string | null
          photo_url?: string | null
          role?: string | null
          status?: string | null
        }
        Relationships: []
      }
      volunteer_public_card: {
        Row: {
          area: string | null
          assigned_task: string | null
          blood_group: string | null
          expires_at: string | null
          joined_at: string | null
          name: string | null
          photo_url: string | null
          role: string | null
          skills: string | null
          status: string | null
          volunteer_code: string | null
        }
        Insert: {
          area?: string | null
          assigned_task?: string | null
          blood_group?: string | null
          expires_at?: string | null
          joined_at?: string | null
          name?: string | null
          photo_url?: string | null
          role?: string | null
          skills?: string | null
          status?: string | null
          volunteer_code?: string | null
        }
        Update: {
          area?: string | null
          assigned_task?: string | null
          blood_group?: string | null
          expires_at?: string | null
          joined_at?: string | null
          name?: string | null
          photo_url?: string | null
          role?: string | null
          skills?: string | null
          status?: string | null
          volunteer_code?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user" | "moderator"
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
    Enums: {
      app_role: ["admin", "user", "moderator"],
    },
  },
} as const
