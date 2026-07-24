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
      daily_metrics: {
        Row: {
          active_minutes: number
          calories: number
          client_session_id: string
          created_at: string
          date: string
          distance_km: number
          id: string
          steps: number
          updated_at: string
          water_liters: number
        }
        Insert: {
          active_minutes?: number
          calories?: number
          client_session_id: string
          created_at?: string
          date: string
          distance_km?: number
          id?: string
          steps?: number
          updated_at?: string
          water_liters?: number
        }
        Update: {
          active_minutes?: number
          calories?: number
          client_session_id?: string
          created_at?: string
          date?: string
          distance_km?: number
          id?: string
          steps?: number
          updated_at?: string
          water_liters?: number
        }
        Relationships: []
      }
      exercise_catalog: {
        Row: {
          allowed_camera_angles: string[]
          animation_id: string
          breathing: string | null
          category: string
          common_mistakes: string[]
          created_at: string
          default_duration_s: number | null
          default_reps: string
          default_rest_s: number
          default_sets: number
          default_voice_instruction: string | null
          easier_variation: string | null
          equipment: string[]
          execution_steps: string[]
          harder_variation: string | null
          id: string
          initial_position: string[]
          level: string
          muscle_group: string
          name: string
          safety_warnings: string[]
          substitute_exercise_ids: string[]
        }
        Insert: {
          allowed_camera_angles?: string[]
          animation_id: string
          breathing?: string | null
          category: string
          common_mistakes?: string[]
          created_at?: string
          default_duration_s?: number | null
          default_reps?: string
          default_rest_s?: number
          default_sets?: number
          default_voice_instruction?: string | null
          easier_variation?: string | null
          equipment?: string[]
          execution_steps?: string[]
          harder_variation?: string | null
          id: string
          initial_position?: string[]
          level: string
          muscle_group: string
          name: string
          safety_warnings?: string[]
          substitute_exercise_ids?: string[]
        }
        Update: {
          allowed_camera_angles?: string[]
          animation_id?: string
          breathing?: string | null
          category?: string
          common_mistakes?: string[]
          created_at?: string
          default_duration_s?: number | null
          default_reps?: string
          default_rest_s?: number
          default_sets?: number
          default_voice_instruction?: string | null
          easier_variation?: string | null
          equipment?: string[]
          execution_steps?: string[]
          harder_variation?: string | null
          id?: string
          initial_position?: string[]
          level?: string
          muscle_group?: string
          name?: string
          safety_warnings?: string[]
          substitute_exercise_ids?: string[]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          available_equipment: string[]
          avatar_url: string | null
          client_session_id: string
          created_at: string
          fitness_goal: string | null
          fitness_level: string | null
          full_name: string | null
          id: string
          onboarded: boolean
          preferences: Json
          updated_at: string
          weekly_frequency: number | null
        }
        Insert: {
          available_equipment?: string[]
          avatar_url?: string | null
          client_session_id: string
          created_at?: string
          fitness_goal?: string | null
          fitness_level?: string | null
          full_name?: string | null
          id?: string
          onboarded?: boolean
          preferences?: Json
          updated_at?: string
          weekly_frequency?: number | null
        }
        Update: {
          available_equipment?: string[]
          avatar_url?: string | null
          client_session_id?: string
          created_at?: string
          fitness_goal?: string | null
          fitness_level?: string | null
          full_name?: string | null
          id?: string
          onboarded?: boolean
          preferences?: Json
          updated_at?: string
          weekly_frequency?: number | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_key: string
          client_session_id: string
          id: string
          metadata: Json
          unlocked_at: string
        }
        Insert: {
          achievement_key: string
          client_session_id: string
          id?: string
          metadata?: Json
          unlocked_at?: string
        }
        Update: {
          achievement_key?: string
          client_session_id?: string
          id?: string
          metadata?: Json
          unlocked_at?: string
        }
        Relationships: []
      }
      whatsapp_config: {
        Row: {
          api_url: string | null
          id: string
          instance_name: string | null
          singleton: boolean
          updated_at: string
          webhook_token: string | null
        }
        Insert: {
          api_url?: string | null
          id?: string
          instance_name?: string | null
          singleton?: boolean
          updated_at?: string
          webhook_token?: string | null
        }
        Update: {
          api_url?: string | null
          id?: string
          instance_name?: string | null
          singleton?: boolean
          updated_at?: string
          webhook_token?: string | null
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          content: string | null
          created_at: string
          direction: string
          error: string | null
          id: string
          media_type: string | null
          media_url: string | null
          message_id: string | null
          raw: Json | null
          remote_jid: string
          status: string
          template_name: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          direction: string
          error?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          message_id?: string | null
          raw?: Json | null
          remote_jid: string
          status?: string
          template_name?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          direction?: string
          error?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          message_id?: string | null
          raw?: Json | null
          remote_jid?: string
          status?: string
          template_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_sessions: {
        Row: {
          context: Json
          created_at: string
          display_name: string | null
          id: string
          last_message_at: string | null
          remote_jid: string
          updated_at: string
        }
        Insert: {
          context?: Json
          created_at?: string
          display_name?: string | null
          id?: string
          last_message_at?: string | null
          remote_jid: string
          updated_at?: string
        }
        Update: {
          context?: Json
          created_at?: string
          display_name?: string | null
          id?: string
          last_message_at?: string | null
          remote_jid?: string
          updated_at?: string
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          calories_estimate: number
          client_session_id: string
          context: Json
          created_at: string
          duration_seconds: number
          effort_level: number | null
          ended_at: string | null
          feedback: Json
          id: string
          plan: Json
          started_at: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          calories_estimate?: number
          client_session_id: string
          context?: Json
          created_at?: string
          duration_seconds?: number
          effort_level?: number | null
          ended_at?: string | null
          feedback?: Json
          id?: string
          plan?: Json
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          calories_estimate?: number
          client_session_id?: string
          context?: Json
          created_at?: string
          duration_seconds?: number
          effort_level?: number | null
          ended_at?: string | null
          feedback?: Json
          id?: string
          plan?: Json
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
