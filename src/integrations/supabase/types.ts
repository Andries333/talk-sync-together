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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      calendar_events: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          event_date: string
          event_time: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          check_in_date: string
          created_at: string
          id: string
          mood_label: string
          mood_rating: number
          questions_suggestions: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          check_in_date?: string
          created_at?: string
          id?: string
          mood_label: string
          mood_rating: number
          questions_suggestions?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          check_in_date?: string
          created_at?: string
          id?: string
          mood_label?: string
          mood_rating?: number
          questions_suggestions?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      honorarium_reports: {
        Row: {
          achievements: string | null
          admin_comments: string | null
          challenges: string | null
          created_at: string
          id: string
          improvement_areas: string | null
          q1_leadership_vision: number | null
          q10_mentorship_support: number | null
          q2_team_motivation: number | null
          q3_conflict_resolution: number | null
          q4_communication_skills: number | null
          q5_project_management: number | null
          q6_student_engagement: number | null
          q7_problem_solving: number | null
          q8_time_management: number | null
          q9_innovation_creativity: number | null
          report_month: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
          suggested_honorarium: number | null
          total_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          achievements?: string | null
          admin_comments?: string | null
          challenges?: string | null
          created_at?: string
          id?: string
          improvement_areas?: string | null
          q1_leadership_vision?: number | null
          q10_mentorship_support?: number | null
          q2_team_motivation?: number | null
          q3_conflict_resolution?: number | null
          q4_communication_skills?: number | null
          q5_project_management?: number | null
          q6_student_engagement?: number | null
          q7_problem_solving?: number | null
          q8_time_management?: number | null
          q9_innovation_creativity?: number | null
          report_month: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          suggested_honorarium?: number | null
          total_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          achievements?: string | null
          admin_comments?: string | null
          challenges?: string | null
          created_at?: string
          id?: string
          improvement_areas?: string | null
          q1_leadership_vision?: number | null
          q10_mentorship_support?: number | null
          q2_team_motivation?: number | null
          q3_conflict_resolution?: number | null
          q4_communication_skills?: number | null
          q5_project_management?: number | null
          q6_student_engagement?: number | null
          q7_problem_solving?: number | null
          q8_time_management?: number | null
          q9_innovation_creativity?: number | null
          report_month?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          suggested_honorarium?: number | null
          total_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      koshuis_options: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      learning_questions: {
        Row: {
          correct_answer: string
          created_at: string
          id: string
          learning_unit_id: string
          options: Json | null
          order_index: number
          points: number
          question_text: string
          question_type: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          id?: string
          learning_unit_id: string
          options?: Json | null
          order_index?: number
          points?: number
          question_text: string
          question_type: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          id?: string
          learning_unit_id?: string
          options?: Json | null
          order_index?: number
          points?: number
          question_text?: string
          question_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_questions_learning_unit_id_fkey"
            columns: ["learning_unit_id"]
            isOneToOne: false
            referencedRelation: "learning_units"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_units: {
        Row: {
          content_type: string
          content_url: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          content_type: string
          content_url: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          content_type?: string
          content_url?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_id: string
          sender_name: string
          target_audience: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_id: string
          sender_name: string
          target_audience: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
          sender_name?: string
          target_audience?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          koshuis: string | null
          last_name: string | null
          login_count: number | null
          posisie: string | null
          posisie_hk_sr: string | null
          profile_completed_at: string | null
          profile_completion_count: number | null
          studierigting: string | null
          telefoonnommer: string | null
          updated_at: string
          user_id: string
          verjaarsdag: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          koshuis?: string | null
          last_name?: string | null
          login_count?: number | null
          posisie?: string | null
          posisie_hk_sr?: string | null
          profile_completed_at?: string | null
          profile_completion_count?: number | null
          studierigting?: string | null
          telefoonnommer?: string | null
          updated_at?: string
          user_id: string
          verjaarsdag?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          koshuis?: string | null
          last_name?: string | null
          login_count?: number | null
          posisie?: string | null
          posisie_hk_sr?: string | null
          profile_completed_at?: string | null
          profile_completion_count?: number | null
          studierigting?: string | null
          telefoonnommer?: string | null
          updated_at?: string
          user_id?: string
          verjaarsdag?: string | null
        }
        Relationships: []
      }
      sr_hk_options: {
        Row: {
          category: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      studierigting_options: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_learning_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          learning_unit_id: string
          test_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          learning_unit_id: string
          test_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          learning_unit_id?: string
          test_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_progress_learning_unit_id_fkey"
            columns: ["learning_unit_id"]
            isOneToOne: false
            referencedRelation: "learning_units"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          notification_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          notification_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          notification_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_monthly_honorarium_impact: {
        Args: { p_month?: number; p_user_id: string; p_year?: number }
        Returns: number
      }
      increment_login_count: {
        Args: { user_uuid: string }
        Returns: undefined
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
