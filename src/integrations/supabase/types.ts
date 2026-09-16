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
      answers: {
        Row: {
          attempt_id: string
          awarded_points: number | null
          created_at: string
          id: string
          is_correct: boolean | null
          question_id: string
          selected_option_id: string | null
          text_answer: string | null
          updated_at: string
        }
        Insert: {
          attempt_id: string
          awarded_points?: number | null
          created_at?: string
          id?: string
          is_correct?: boolean | null
          question_id: string
          selected_option_id?: string | null
          text_answer?: string | null
          updated_at?: string
        }
        Update: {
          attempt_id?: string
          awarded_points?: number | null
          created_at?: string
          id?: string
          is_correct?: boolean | null
          question_id?: string
          selected_option_id?: string | null
          text_answer?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_selected_option_id_fkey"
            columns: ["selected_option_id"]
            isOneToOne: false
            referencedRelation: "question_options"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          available_from: string | null
          available_until: string | null
          course_id: string | null
          created_at: string
          description: string | null
          id: string
          max_score: number
          module_id: string | null
          passing_score: number
          status: string
          teacher_id: string | null
          time_limit_minutes: number | null
          title: string
          updated_at: string
        }
        Insert: {
          available_from?: string | null
          available_until?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          max_score?: number
          module_id?: string | null
          passing_score?: number
          status?: string
          teacher_id?: string | null
          time_limit_minutes?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          available_from?: string | null
          available_until?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          max_score?: number
          module_id?: string | null
          passing_score?: number
          status?: string
          teacher_id?: string | null
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      attempts: {
        Row: {
          assessment_id: string
          created_at: string
          id: string
          percentage: number | null
          score: number | null
          started_at: string | null
          status: string
          student_id: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          assessment_id: string
          created_at?: string
          id?: string
          percentage?: number | null
          score?: number | null
          started_at?: string | null
          status?: string
          student_id: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          assessment_id?: string
          created_at?: string
          id?: string
          percentage?: number | null
          score?: number | null
          started_at?: string | null
          status?: string
          student_id?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempts_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          course_id: string
          created_at: string
          day_of_week: string
          end_time: string
          id: string
          name: string
          start_time: string
          status: string
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          day_of_week: string
          end_time: string
          id?: string
          name: string
          start_time: string
          status?: string
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          day_of_week?: string
          end_time?: string
          id?: string
          name?: string
          start_time?: string
          status?: string
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          class_id: string
          created_at: string
          current_module_id: string | null
          id: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          current_module_id?: string | null
          id?: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          current_module_id?: string | null
          id?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_current_module_id_fkey"
            columns: ["current_module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          id: string
          name: string
          order_index: number
          status: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          name: string
          order_index?: number
          status?: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          name?: string
          order_index?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      question_options: {
        Row: {
          id: string
          is_correct: boolean
          option_text: string
          order_index: number
          question_id: string
        }
        Insert: {
          id?: string
          is_correct?: boolean
          option_text: string
          order_index?: number
          question_id: string
        }
        Update: {
          id?: string
          is_correct?: boolean
          option_text?: string
          order_index?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          assessment_id: string
          created_at: string
          grading_mode: string
          id: string
          order_index: number
          points: number
          question_type: string
          statement: string
          updated_at: string
        }
        Insert: {
          assessment_id: string
          created_at?: string
          grading_mode?: string
          id?: string
          order_index?: number
          points?: number
          question_type?: string
          statement: string
          updated_at?: string
        }
        Update: {
          assessment_id?: string
          created_at?: string
          grading_mode?: string
          id?: string
          order_index?: number
          points?: number
          question_type?: string
          statement?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          cpf: string
          created_at: string
          full_name: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          cpf: string
          created_at?: string
          full_name: string
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          cpf?: string
          created_at?: string
          full_name?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      teachers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_exists: { Args: never; Returns: boolean }
      current_teacher_id: { Args: never; Returns: string }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
