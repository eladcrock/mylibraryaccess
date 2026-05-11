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
      applicant_profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          last_name: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      benefits: {
        Row: {
          category: Database["public"]["Enums"]["benefit_category"]
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          category: Database["public"]["Enums"]["benefit_category"]
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          category?: Database["public"]["Enums"]["benefit_category"]
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      counties: {
        Row: {
          fips: string | null
          id: string
          name: string
          state_id: string
        }
        Insert: {
          fips?: string | null
          id?: string
          name: string
          state_id: string
        }
        Update: {
          fips?: string | null
          id?: string
          name?: string
          state_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "counties_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      eligibility_rules: {
        Row: {
          fee_cents: number
          id: string
          library_system_id: string
          notes: string | null
          paid: boolean
          priority: number
          requires_in_person: boolean
          rule_type: Database["public"]["Enums"]["rule_type"]
          scope_city: string | null
          scope_county_id: string | null
          scope_state_id: string | null
        }
        Insert: {
          fee_cents?: number
          id?: string
          library_system_id: string
          notes?: string | null
          paid?: boolean
          priority?: number
          requires_in_person?: boolean
          rule_type: Database["public"]["Enums"]["rule_type"]
          scope_city?: string | null
          scope_county_id?: string | null
          scope_state_id?: string | null
        }
        Update: {
          fee_cents?: number
          id?: string
          library_system_id?: string
          notes?: string | null
          paid?: boolean
          priority?: number
          requires_in_person?: boolean
          rule_type?: Database["public"]["Enums"]["rule_type"]
          scope_city?: string | null
          scope_county_id?: string | null
          scope_state_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eligibility_rules_library_system_id_fkey"
            columns: ["library_system_id"]
            isOneToOne: false
            referencedRelation: "library_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eligibility_rules_scope_county_id_fkey"
            columns: ["scope_county_id"]
            isOneToOne: false
            referencedRelation: "counties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eligibility_rules_scope_state_id_fkey"
            columns: ["scope_state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          library_system_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          library_system_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          library_system_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_library_system_id_fkey"
            columns: ["library_system_id"]
            isOneToOne: false
            referencedRelation: "library_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      library_benefits: {
        Row: {
          benefit_id: string
          library_system_id: string
          limit_text: string | null
          notes: string | null
        }
        Insert: {
          benefit_id: string
          library_system_id: string
          limit_text?: string | null
          notes?: string | null
        }
        Update: {
          benefit_id?: string
          library_system_id?: string
          limit_text?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_benefits_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_benefits_library_system_id_fkey"
            columns: ["library_system_id"]
            isOneToOne: false
            referencedRelation: "library_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      library_systems: {
        Row: {
          apply_url: string | null
          confidence_score: number
          created_at: string
          description: string | null
          fee_cents: number
          fee_notes: string | null
          highlights: string | null
          id: string
          jurisdiction_type: Database["public"]["Enums"]["jurisdiction_type"]
          last_verified_at: string | null
          name: string
          online_signup: boolean
          primary_city: string | null
          primary_county_id: string | null
          primary_state_id: string | null
          slug: string
          updated_at: string
          website: string | null
        }
        Insert: {
          apply_url?: string | null
          confidence_score?: number
          created_at?: string
          description?: string | null
          fee_cents?: number
          fee_notes?: string | null
          highlights?: string | null
          id?: string
          jurisdiction_type: Database["public"]["Enums"]["jurisdiction_type"]
          last_verified_at?: string | null
          name: string
          online_signup?: boolean
          primary_city?: string | null
          primary_county_id?: string | null
          primary_state_id?: string | null
          slug: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          apply_url?: string | null
          confidence_score?: number
          created_at?: string
          description?: string | null
          fee_cents?: number
          fee_notes?: string | null
          highlights?: string | null
          id?: string
          jurisdiction_type?: Database["public"]["Enums"]["jurisdiction_type"]
          last_verified_at?: string | null
          name?: string
          online_signup?: boolean
          primary_city?: string | null
          primary_county_id?: string | null
          primary_state_id?: string | null
          slug?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_systems_primary_county_id_fkey"
            columns: ["primary_county_id"]
            isOneToOne: false
            referencedRelation: "counties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_systems_primary_state_id_fkey"
            columns: ["primary_state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      reciprocity: {
        Row: {
          library_system_id: string
          notes: string | null
          reciprocal_with_id: string
        }
        Insert: {
          library_system_id: string
          notes?: string | null
          reciprocal_with_id: string
        }
        Update: {
          library_system_id?: string
          notes?: string | null
          reciprocal_with_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reciprocity_library_system_id_fkey"
            columns: ["library_system_id"]
            isOneToOne: false
            referencedRelation: "library_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reciprocity_reciprocal_with_id_fkey"
            columns: ["reciprocal_with_id"]
            isOneToOne: false
            referencedRelation: "library_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      region_requests: {
        Row: {
          created_at: string
          email: string | null
          id: string
          notes: string | null
          region: string
          source_ip_hash: string | null
          status: Database["public"]["Enums"]["region_request_status"]
          system_name: string | null
          system_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          notes?: string | null
          region: string
          source_ip_hash?: string | null
          status?: Database["public"]["Enums"]["region_request_status"]
          system_name?: string | null
          system_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          notes?: string | null
          region?: string
          source_ip_hash?: string | null
          status?: Database["public"]["Enums"]["region_request_status"]
          system_name?: string | null
          system_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      scrape_jobs: {
        Row: {
          created_at: string
          diff_json: Json | null
          error: string | null
          finished_at: string | null
          id: string
          library_system_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["scrape_status"]
        }
        Insert: {
          created_at?: string
          diff_json?: Json | null
          error?: string | null
          finished_at?: string | null
          id?: string
          library_system_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["scrape_status"]
        }
        Update: {
          created_at?: string
          diff_json?: Json | null
          error?: string | null
          finished_at?: string | null
          id?: string
          library_system_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["scrape_status"]
        }
        Relationships: [
          {
            foreignKeyName: "scrape_jobs_library_system_id_fkey"
            columns: ["library_system_id"]
            isOneToOne: false
            referencedRelation: "library_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      states: {
        Row: {
          code: string
          id: string
          name: string
        }
        Insert: {
          code: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      suggested_corrections: {
        Row: {
          created_at: string
          field: string
          id: string
          library_system_id: string
          notes: string | null
          status: Database["public"]["Enums"]["correction_status"]
          submitter_email: string | null
          submitter_user_id: string | null
          suggested_value: string
        }
        Insert: {
          created_at?: string
          field: string
          id?: string
          library_system_id: string
          notes?: string | null
          status?: Database["public"]["Enums"]["correction_status"]
          submitter_email?: string | null
          submitter_user_id?: string | null
          suggested_value: string
        }
        Update: {
          created_at?: string
          field?: string
          id?: string
          library_system_id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["correction_status"]
          submitter_email?: string | null
          submitter_user_id?: string | null
          suggested_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggested_corrections_library_system_id_fkey"
            columns: ["library_system_id"]
            isOneToOne: false
            referencedRelation: "library_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      benefit_category:
        | "streaming"
        | "ebooks"
        | "audiobooks"
        | "learning"
        | "news"
        | "museum"
        | "languages"
        | "career"
        | "makerspace"
        | "research"
        | "music"
      correction_status: "pending" | "accepted" | "rejected"
      jurisdiction_type: "city" | "county" | "consortium" | "state"
      region_request_status: "new" | "reviewed" | "added" | "rejected"
      rule_type:
        | "resident_of_county"
        | "resident_of_city"
        | "resident_of_state"
        | "us_resident"
        | "property_owner"
        | "student"
        | "educator"
        | "employee"
        | "reciprocal"
        | "paid_nonresident"
      scrape_status: "queued" | "running" | "succeeded" | "failed"
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
      app_role: ["admin", "user"],
      benefit_category: [
        "streaming",
        "ebooks",
        "audiobooks",
        "learning",
        "news",
        "museum",
        "languages",
        "career",
        "makerspace",
        "research",
        "music",
      ],
      correction_status: ["pending", "accepted", "rejected"],
      jurisdiction_type: ["city", "county", "consortium", "state"],
      region_request_status: ["new", "reviewed", "added", "rejected"],
      rule_type: [
        "resident_of_county",
        "resident_of_city",
        "resident_of_state",
        "us_resident",
        "property_owner",
        "student",
        "educator",
        "employee",
        "reciprocal",
        "paid_nonresident",
      ],
      scrape_status: ["queued", "running", "succeeded", "failed"],
    },
  },
} as const
