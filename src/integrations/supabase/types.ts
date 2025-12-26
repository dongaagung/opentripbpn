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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      addon_experiences: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_free: boolean | null
          name: string
          package_ids: string[] | null
          price: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_free?: boolean | null
          name: string
          package_ids?: string[] | null
          price?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_free?: boolean | null
          name?: string
          package_ids?: string[] | null
          price?: number | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          applies_to_packages: string[] | null
          badge_color: string | null
          badge_text: string | null
          campaign_type: string
          copywriting: string | null
          created_at: string
          description: string | null
          discount_type: string | null
          discount_value: number | null
          end_date: string | null
          id: string
          is_active: boolean | null
          max_participants: number | null
          metadata: Json | null
          min_participants: number | null
          name: string
          priority: number | null
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          applies_to_packages?: string[] | null
          badge_color?: string | null
          badge_text?: string | null
          campaign_type: string
          copywriting?: string | null
          created_at?: string
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          metadata?: Json | null
          min_participants?: number | null
          name: string
          priority?: number | null
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          applies_to_packages?: string[] | null
          badge_color?: string | null
          badge_text?: string | null
          campaign_type?: string
          copywriting?: string | null
          created_at?: string
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          metadata?: Json | null
          min_participants?: number | null
          name?: string
          priority?: number | null
          start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      comparison_items: {
        Row: {
          category: string
          created_at: string
          display_order: number | null
          id: string
          is_published: boolean | null
          other_way_description: string
          other_way_icon: string | null
          other_way_title: string
          our_way_description: string
          our_way_icon: string | null
          our_way_title: string
        }
        Insert: {
          category: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_published?: boolean | null
          other_way_description: string
          other_way_icon?: string | null
          other_way_title: string
          our_way_description: string
          our_way_icon?: string | null
          our_way_title: string
        }
        Update: {
          category?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_published?: boolean | null
          other_way_description?: string
          other_way_icon?: string | null
          other_way_title?: string
          our_way_description?: string
          our_way_icon?: string | null
          our_way_title?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          display_order: number | null
          id: string
          is_published: boolean | null
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_published?: boolean | null
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_published?: boolean | null
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          display_order: number | null
          file_type: string
          file_url: string
          id: string
          is_published: boolean | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          file_type?: string
          file_url: string
          id?: string
          is_published?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_published?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      hero_stats: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          label: string
          value: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          label: string
          value: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          label?: string
          value?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          must_change_password: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          must_change_password?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          must_change_password?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          discount_for_referee: number | null
          discount_for_referrer: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_usage: number | null
          referrer_email: string | null
          referrer_name: string
          referrer_phone: string | null
          usage_count: number | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_for_referee?: number | null
          discount_for_referrer?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_usage?: number | null
          referrer_email?: string | null
          referrer_name: string
          referrer_phone?: string | null
          usage_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_for_referee?: number | null
          discount_for_referrer?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_usage?: number | null
          referrer_email?: string | null
          referrer_name?: string
          referrer_phone?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          customer_name: string
          customer_photo_url: string | null
          id: string
          is_published: boolean | null
          rating: number
          testimonial_text: string
          trip_destination: string | null
        }
        Insert: {
          created_at?: string
          customer_name: string
          customer_photo_url?: string | null
          id?: string
          is_published?: boolean | null
          rating?: number
          testimonial_text: string
          trip_destination?: string | null
        }
        Update: {
          created_at?: string
          customer_name?: string
          customer_photo_url?: string | null
          id?: string
          is_published?: boolean | null
          rating?: number
          testimonial_text?: string
          trip_destination?: string | null
        }
        Relationships: []
      }
      trip_leaders: {
        Row: {
          bio: string
          created_at: string
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          languages: string[] | null
          name: string
          philosophy: string | null
          photo_url: string | null
          role: string
          specialties: string[] | null
          updated_at: string
          visited_cities: string[] | null
        }
        Insert: {
          bio: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          languages?: string[] | null
          name: string
          philosophy?: string | null
          photo_url?: string | null
          role: string
          specialties?: string[] | null
          updated_at?: string
          visited_cities?: string[] | null
        }
        Update: {
          bio?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          languages?: string[] | null
          name?: string
          philosophy?: string | null
          photo_url?: string | null
          role?: string
          specialties?: string[] | null
          updated_at?: string
          visited_cities?: string[] | null
        }
        Relationships: []
      }
      trip_packages: {
        Row: {
          available_seats: number | null
          booked_seats: number | null
          cover_image_url: string | null
          created_at: string
          departure_time: string | null
          description: string | null
          destination: string
          duration_days: number
          early_bird_deadline: string | null
          early_bird_price: number | null
          early_bird_seats: number | null
          exclusions: string[] | null
          highlights: string[] | null
          id: string
          inclusions: string[] | null
          is_active: boolean | null
          itinerary: Json | null
          last_call_price: number | null
          last_call_start_date: string | null
          meeting_point: string | null
          price: number
          regular_price: number | null
          start_date: string | null
          target_participants: string | null
          title: string
          total_seats: number | null
          updated_at: string
        }
        Insert: {
          available_seats?: number | null
          booked_seats?: number | null
          cover_image_url?: string | null
          created_at?: string
          departure_time?: string | null
          description?: string | null
          destination: string
          duration_days?: number
          early_bird_deadline?: string | null
          early_bird_price?: number | null
          early_bird_seats?: number | null
          exclusions?: string[] | null
          highlights?: string[] | null
          id?: string
          inclusions?: string[] | null
          is_active?: boolean | null
          itinerary?: Json | null
          last_call_price?: number | null
          last_call_start_date?: string | null
          meeting_point?: string | null
          price: number
          regular_price?: number | null
          start_date?: string | null
          target_participants?: string | null
          title: string
          total_seats?: number | null
          updated_at?: string
        }
        Update: {
          available_seats?: number | null
          booked_seats?: number | null
          cover_image_url?: string | null
          created_at?: string
          departure_time?: string | null
          description?: string | null
          destination?: string
          duration_days?: number
          early_bird_deadline?: string | null
          early_bird_price?: number | null
          early_bird_seats?: number | null
          exclusions?: string[] | null
          highlights?: string[] | null
          id?: string
          inclusions?: string[] | null
          is_active?: boolean | null
          itinerary?: Json | null
          last_call_price?: number | null
          last_call_start_date?: string | null
          meeting_point?: string | null
          price?: number
          regular_price?: number | null
          start_date?: string | null
          target_participants?: string | null
          title?: string
          total_seats?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      trust_proofs: {
        Row: {
          created_at: string
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          label: string
          proof_type: string
          value: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          proof_type: string
          value: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          proof_type?: string
          value?: string
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
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
