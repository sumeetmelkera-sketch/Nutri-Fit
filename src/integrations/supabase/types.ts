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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      nf_achievements: {
        Row: {
          code: string
          earned_at: string
          id: string
          profile_id: string
        }
        Insert: {
          code: string
          earned_at?: string
          id?: string
          profile_id: string
        }
        Update: {
          code?: string
          earned_at?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nf_achievements_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "nf_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nf_meals: {
        Row: {
          created_at: string
          description: string
          id: string
          log_date: string
          meal_type: string
          nutrition: Json
          profile_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          log_date?: string
          meal_type?: string
          nutrition?: Json
          profile_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          log_date?: string
          meal_type?: string
          nutrition?: Json
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nf_meals_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "nf_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nf_measurements: {
        Row: {
          created_at: string
          id: string
          log_date: string
          metrics: Json
          photo_url: string | null
          profile_id: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          log_date?: string
          metrics?: Json
          photo_url?: string | null
          profile_id: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          log_date?: string
          metrics?: Json
          photo_url?: string | null
          profile_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nf_measurements_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "nf_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nf_plans: {
        Row: {
          days: Json
          profile_id: string
          updated_at: string
        }
        Insert: {
          days?: Json
          profile_id: string
          updated_at?: string
        }
        Update: {
          days?: Json
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nf_plans_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "nf_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nf_profiles: {
        Row: {
          activity: string
          age: number
          avatar_id: string
          created_at: string
          experience: string
          gender: string
          goal: string
          height_cm: number
          id: string
          keypass: string
          name: string
          targets: Json
          trainer_id: string
          weight_kg: number
          workout_days: string[]
        }
        Insert: {
          activity?: string
          age?: number
          avatar_id?: string
          created_at?: string
          experience?: string
          gender?: string
          goal?: string
          height_cm?: number
          id?: string
          keypass: string
          name: string
          targets?: Json
          trainer_id?: string
          weight_kg?: number
          workout_days?: string[]
        }
        Update: {
          activity?: string
          age?: number
          avatar_id?: string
          created_at?: string
          experience?: string
          gender?: string
          goal?: string
          height_cm?: number
          id?: string
          keypass?: string
          name?: string
          targets?: Json
          trainer_id?: string
          weight_kg?: number
          workout_days?: string[]
        }
        Relationships: []
      }
      nf_records: {
        Row: {
          achieved_on: string
          created_at: string
          est_1rm: number
          exercise: string
          id: string
          profile_id: string
          reps: number
          weight_kg: number
        }
        Insert: {
          achieved_on?: string
          created_at?: string
          est_1rm?: number
          exercise: string
          id?: string
          profile_id: string
          reps?: number
          weight_kg?: number
        }
        Update: {
          achieved_on?: string
          created_at?: string
          est_1rm?: number
          exercise?: string
          id?: string
          profile_id?: string
          reps?: number
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "nf_records_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "nf_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nf_sessions: {
        Row: {
          created_at: string
          day_key: string
          duration_sec: number
          entries: Json
          id: string
          log_date: string
          profile_id: string
          title: string
          total_volume: number
        }
        Insert: {
          created_at?: string
          day_key?: string
          duration_sec?: number
          entries?: Json
          id?: string
          log_date?: string
          profile_id: string
          title?: string
          total_volume?: number
        }
        Update: {
          created_at?: string
          day_key?: string
          duration_sec?: number
          entries?: Json
          id?: string
          log_date?: string
          profile_id?: string
          title?: string
          total_volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "nf_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "nf_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
