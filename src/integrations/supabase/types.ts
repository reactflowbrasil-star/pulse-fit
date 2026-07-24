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
      app_users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          updated_at: string
          user_id: string
          whatsapp_code: string | null
          whatsapp_code_expires_at: string | null
          whatsapp_number: string | null
          whatsapp_verified: boolean
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          updated_at?: string
          user_id: string
          whatsapp_code?: string | null
          whatsapp_code_expires_at?: string | null
          whatsapp_number?: string | null
          whatsapp_verified?: boolean
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_code?: string | null
          whatsapp_code_expires_at?: string | null
          whatsapp_number?: string | null
          whatsapp_verified?: boolean
        }
        Relationships: []
      }
      atividades_diarias: {
        Row: {
          agua_ml: number
          calorias: number
          created_at: string
          data: string
          distancia_km: number
          id: string
          meta_agua_ml: number
          meta_calorias: number
          meta_distancia_km: number
          meta_minutos: number
          meta_passos: number
          minutos_ativo: number
          passos: number
          updated_at: string
          user_id: string
        }
        Insert: {
          agua_ml?: number
          calorias?: number
          created_at?: string
          data?: string
          distancia_km?: number
          id?: string
          meta_agua_ml?: number
          meta_calorias?: number
          meta_distancia_km?: number
          meta_minutos?: number
          meta_passos?: number
          minutos_ativo?: number
          passos?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          agua_ml?: number
          calorias?: number
          created_at?: string
          data?: string
          distancia_km?: number
          id?: string
          meta_agua_ml?: number
          meta_calorias?: number
          meta_distancia_km?: number
          meta_minutos?: number
          meta_passos?: number
          minutos_ativo?: number
          passos?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
          nome: string | null
          onboarded: boolean
          preferences: Json
          updated_at: string
          weekly_frequency: number | null
          whatsapp: string | null
          whatsapp_verificado: boolean
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
          nome?: string | null
          onboarded?: boolean
          preferences?: Json
          updated_at?: string
          weekly_frequency?: number | null
          whatsapp?: string | null
          whatsapp_verificado?: boolean
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
          nome?: string | null
          onboarded?: boolean
          preferences?: Json
          updated_at?: string
          weekly_frequency?: number | null
          whatsapp?: string | null
          whatsapp_verificado?: boolean
        }
        Relationships: []
      }
      treinos: {
        Row: {
          created_at: string
          data: string
          distancia_km: number
          id: string
          nome: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: string
          distancia_km?: number
          id?: string
          nome: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          distancia_km?: number
          id?: string
          nome?: string
          user_id?: string
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
      whatsapp_verifications: {
        Row: {
          codigo: string
          created_at: string
          expira_em: string
          id: string
          usado: boolean
          user_id: string
          whatsapp: string
        }
        Insert: {
          codigo: string
          created_at?: string
          expira_em: string
          id?: string
          usado?: boolean
          user_id: string
          whatsapp: string
        }
        Update: {
          codigo?: string
          created_at?: string
          expira_em?: string
          id?: string
          usado?: boolean
          user_id?: string
          whatsapp?: string
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
    },
  },
} as const
