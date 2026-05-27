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
          updated_at: string
          website_url: string | null
          whatsapp_url: string | null
          youtube_url: string | null
        }
        Insert: {
          about_short?: string | null
          address?: string | null
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
          updated_at?: string
          website_url?: string | null
          whatsapp_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          about_short?: string | null
          address?: string | null
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
          address: string | null
          admin_notes: string | null
          amount: string | null
          app_code: string | null
          created_at: string
          file_count: number
          id: string
          name: string
          nid: string
          phone: string
          reason: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          amount?: string | null
          app_code?: string | null
          created_at?: string
          file_count?: number
          id?: string
          name: string
          nid: string
          phone: string
          reason: string
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          amount?: string | null
          app_code?: string | null
          created_at?: string
          file_count?: number
          id?: string
          name?: string
          nid?: string
          phone?: string
          reason?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
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
          created_at: string
          id: string
          joined_at: string | null
          name: string
          phone: string | null
          skills: string | null
          status: string
          updated_at: string
        }
        Insert: {
          area?: string | null
          assigned_task?: string | null
          created_at?: string
          id?: string
          joined_at?: string | null
          name: string
          phone?: string | null
          skills?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          area?: string | null
          assigned_task?: string | null
          created_at?: string
          id?: string
          joined_at?: string | null
          name?: string
          phone?: string | null
          skills?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      grant_role_by_email: {
        Args: { _email: string; _role: Database["public"]["Enums"]["app_role"] }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      lookup_help_application: {
        Args: { _code: string }
        Returns: {
          amount: string
          app_code: string
          created_at: string
          file_count: number
          name: string
          status: string
          type: string
        }[]
      }
      verify_member_card: {
        Args: { _code: string }
        Returns: {
          area: string
          join_date: string
          member_code: string
          name: string
          photo_url: string
          role: string
          status: string
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
