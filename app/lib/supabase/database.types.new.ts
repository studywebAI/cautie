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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      assignments: {
        Row: {
          answers_enabled: boolean | null
          assignment_index: number
          created_at: string | null
          id: string
          paragraph_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          answers_enabled?: boolean | null
          assignment_index: number
          created_at?: string | null
          id?: string
          paragraph_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          answers_enabled?: boolean | null
          assignment_index?: number
          created_at?: string | null
          id?: string
          paragraph_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_paragraph_id_fkey"
            columns: ["paragraph_id"]
            isOneToOne: false
            referencedRelation: "paragraphs"
            referencedColumns: ["id"]
          },
        ]
      }
      blocks: {
        Row: {
          assignment_id: string
          created_at: string | null
          data: Json
          id: string
          position: number
          type: string
          updated_at: string | null
        }
        Insert: {
          assignment_id: string
          created_at?: string | null
          data: Json
          id?: string
          position: number
          type: string
          updated_at?: string | null
        }
        Update: {
          assignment_id?: string
          created_at?: string | null
          data?: Json
          id?: string
          position?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocks_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          ai_summary: string | null
          chapter_number: number
          created_at: string | null
          id: string
          subject_id: string
          summary_overridden: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_summary?: string | null
          chapter_number: number
          created_at?: string | null
          id?: string
          subject_id: string
          summary_overridden?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_summary?: string | null
          chapter_number?: number
          created_at?: string | null
          id?: string
          subject_id?: string
          summary_overridden?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      class_assignments: {
        Row: {
          ai_generated: boolean | null
          content: Json | null
          created_at: string
          id: string
          order_index: number | null
          subchapter_id: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean | null
          content?: Json | null
          created_at?: string
          id?: string
          order_index?: number | null
          subchapter_id: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean | null
          content?: Json | null
          created_at?: string
          id?: string
          order_index?: number | null
          subchapter_id?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_assignments_subchapter_id_fkey"
            columns: ["subchapter_id"]
            isOneToOne: false
            referencedRelation: "class_subchapters"
            referencedColumns: ["id"]
          },
        ]
      }
      class_chapters: {
        Row: {
          class_id: string
          created_at: string
          description: string | null
          id: string
          order_index: number | null
          title: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_chapters_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_members: {
        Row: {
          class_id: string
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          role?: string
          user_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_members_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_subchapters: {
        Row: {
          chapter_id: string
          created_at: string
          id: string
          order_index: number | null
          title: string
          updated_at: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          id?: string
          order_index?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          id?: string
          order_index?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_subchapters_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "class_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string
          description: string | null
          guest_id: string | null
          id: string
          join_code: string | null
          name: string
          owner_id: string | null
          owner_type: Database["public"]["Enums"]["owner_type_enum"]
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          guest_id?: string | null
          id?: string
          join_code?: string | null
          name: string
          owner_id?: string | null
          owner_type?: Database["public"]["Enums"]["owner_type_enum"]
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          guest_id?: string | null
          id?: string
          join_code?: string | null
          name?: string
          owner_id?: string | null
          owner_type?: Database["public"]["Enums"]["owner_type_enum"]
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      materials: {
        Row: {
          class_id: string | null
          content: Json
          content_id: string | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          metadata: Json | null
          source_text: string | null
          tags: string[] | null
          title: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          class_id?: string | null
          content: Json
          content_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          source_text?: string | null
          tags?: string[] | null
          title?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          class_id?: string | null
          content?: Json
          content_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          source_text?: string | null
          tags?: string[] | null
          title?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "materials_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: Json | null
          created_at: string
          guest_id: string | null
          id: string
          owner_type: Database["public"]["Enums"]["owner_type_enum"]
          title: string
          user_id: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string
          guest_id?: string | null
          id?: string
          owner_type?: Database["public"]["Enums"]["owner_type_enum"]
          title: string
          user_id?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string
          guest_id?: string | null
          id?: string
          owner_type?: Database["public"]["Enums"]["owner_type_enum"]
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      paragraphs: {
        Row: {
          chapter_id: string
          created_at: string | null
          id: string
          paragraph_number: number
          title: string
          updated_at: string | null
        }
        Insert: {
          chapter_id: string
          created_at?: string | null
          id?: string
          paragraph_number: number
          title: string
          updated_at?: string | null
        }
        Update: {
          chapter_id?: string
          created_at?: string | null
          id?: string
          paragraph_number?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paragraphs_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_tasks: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          guest_id: string | null
          id: string
          owner_type: Database["public"]["Enums"]["owner_type_enum"]
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          guest_id?: string | null
          id?: string
          owner_type?: Database["public"]["Enums"]["owner_type_enum"]
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          guest_id?: string | null
          id?: string
          owner_type?: Database["public"]["Enums"]["owner_type_enum"]
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      progress_snapshots: {
        Row: {
          completion_percent: number
          paragraph_id: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          completion_percent?: number
          paragraph_id: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          completion_percent?: number
          paragraph_id?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_snapshots_paragraph_id_fkey"
            columns: ["paragraph_id"]
            isOneToOne: false
            referencedRelation: "paragraphs"
            referencedColumns: ["id"]
          },
        ]
      }
      session_logs: {
        Row: {
          created_at: string | null
          finished_at: string | null
          id: string
          paragraph_id: string
          started_at: string
          student_id: string
        }
        Insert: {
          created_at?: string | null
          finished_at?: string | null
          id?: string
          paragraph_id: string
          started_at: string
          student_id: string
        }
        Update: {
          created_at?: string | null
          finished_at?: string | null
          id?: string
          paragraph_id?: string
          started_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_logs_paragraph_id_fkey"
            columns: ["paragraph_id"]
            isOneToOne: false
            referencedRelation: "paragraphs"
            referencedColumns: ["id"]
          },
        ]
      }
      student_answers: {
        Row: {
          answer_data: Json
          block_id: string
          feedback: string | null
          graded_at: string | null
          graded_by_ai: boolean | null
          id: string
          is_correct: boolean | null
          score: number | null
          student_id: string
          submitted_at: string | null
        }
        Insert: {
          answer_data: Json
          block_id: string
          feedback?: string | null
          graded_at?: string | null
          graded_by_ai?: boolean | null
          id?: string
          is_correct?: boolean | null
          score?: number | null
          student_id: string
          submitted_at?: string | null
        }
        Update: {
          answer_data?: Json
          block_id?: string
          feedback?: string | null
          graded_at?: string | null
          graded_by_ai?: boolean | null
          id?: string
          is_correct?: boolean | null
          score?: number | null
          student_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_answers_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_assignments: {
        Row: {
          content: Json | null
          created_at: string
          id: string
          order_index: number | null
          subchapter_id: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          id?: string
          order_index?: number | null
          subchapter_id: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          id?: string
          order_index?: number | null
          subchapter_id?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subject_assignments_subchapter_id_fkey"
            columns: ["subchapter_id"]
            isOneToOne: false
            referencedRelation: "subject_subchapters"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_chapters: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_index: number | null
          subject_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number | null
          subject_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number | null
          subject_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      subject_subchapters: {
        Row: {
          chapter_id: string
          created_at: string
          id: string
          order_index: number | null
          title: string
          updated_at: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          id?: string
          order_index?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          id?: string
          order_index?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subject_subchapters_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "subject_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          ai_icon_seed: string | null
          class_id: string
          class_label: string | null
          cover_image_url: string | null
          cover_type: string
          created_at: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_icon_seed?: string | null
          class_id: string
          class_label?: string | null
          cover_image_url?: string | null
          cover_type?: string
          created_at?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_icon_seed?: string | null
          class_id?: string
          class_label?: string | null
          cover_image_url?: string | null
          cover_type?: string
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subjects_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          assignment_id: string
          content: Json | null
          feedback: string | null
          files: Json | null
          grade: number | null
          graded_at: string | null
          graded_by: string | null
          id: string
          status: string | null
          submitted_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assignment_id: string
          content?: Json | null
          feedback?: string | null
          files?: Json | null
          grade?: number | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          status?: string | null
          submitted_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assignment_id?: string
          content?: Json | null
          feedback?: string | null
          files?: Json | null
          grade?: number | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          status?: string | null
          submitted_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          color_palette: string | null
          language: string | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color_palette?: string | null
          language?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color_palette?: string | null
          language?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          id: string
          session_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_data: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          session_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assignment_index_to_letter: { Args: { idx: number }; Returns: string }
      get_next_assignment_index: {
        Args: { paragraph_uuid: string }
        Returns: number
      }
      get_next_chapter_number: {
        Args: { subject_uuid: string }
        Returns: number
      }
      get_next_paragraph_number: {
        Args: { chapter_uuid: string }
        Returns: number
      }
      update_progress_snapshot: {
        Args: { paragraph_uuid: string; student_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      owner_type_enum: "guest" | "user"
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
      owner_type_enum: ["guest", "user"],
    },
  },
} as const
