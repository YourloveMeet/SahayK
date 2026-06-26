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
      help_score_log: {
        Row: {
          created_at: string | null
          id: string
          points: number
          reason: string | null
          task_id: string
          volunteer_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          points?: number
          reason?: string | null
          task_id: string
          volunteer_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          points?: number
          reason?: string | null
          task_id?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "help_score_log_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_score_log_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          task_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          task_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          task_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          area_name: string | null
          avatar_url: string | null
          college_name: string | null
          created_at: string | null
          disability_type: string | null
          full_name: string
          help_score: number | null
          id: string
          is_active: boolean | null
          language: string | null
          latitude: number | null
          longitude: number | null
          phone: string | null
          role: string
          tasks_completed: number | null
          updated_at: string | null
          preferred_causes: string[] | null
          verification_status: string | null
        }
        Insert: {
          area_name?: string | null
          avatar_url?: string | null
          college_name?: string | null
          created_at?: string | null
          disability_type?: string | null
          full_name: string
          help_score?: number | null
          id: string
          is_active?: boolean | null
          language?: string | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          role: string
          tasks_completed?: number | null
          updated_at?: string | null
          preferred_causes?: string[] | null
          verification_status?: string | null
        }
        Update: {
          area_name?: string | null
          avatar_url?: string | null
          college_name?: string | null
          created_at?: string | null
          disability_type?: string | null
          full_name?: string
          help_score?: number | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          role?: string
          tasks_completed?: number | null
          updated_at?: string | null
          preferred_causes?: string[] | null
          verification_status?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          id: string
          donor_id: string
          recipient_id: string
          amount: number
          cause: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          donor_id: string
          recipient_id: string
          amount: number
          cause: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          donor_id?: string
          recipient_id?: string
          amount?: number
          cause?: string
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      seeker_financial_requests: {
        Row: {
          id: string
          seeker_id: string
          title: string
          description: string
          amount_needed: number
          urgency: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          seeker_id: string
          title: string
          description: string
          amount_needed: number
          urgency: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          seeker_id?: string
          title?: string
          description?: string
          amount_needed?: number
          urgency?: string
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seeker_financial_requests_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      schemes: {
        Row: {
          apply_at: string | null
          apply_link: string | null
          category: string
          created_at: string | null
          description: string
          documents_required: string[] | null
          eligibility_disability: string[] | null
          eligibility_max_age: number | null
          eligibility_max_income: number | null
          eligibility_min_age: number | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          apply_at?: string | null
          apply_link?: string | null
          category: string
          created_at?: string | null
          description: string
          documents_required?: string[] | null
          eligibility_disability?: string[] | null
          eligibility_max_age?: number | null
          eligibility_max_income?: number | null
          eligibility_min_age?: number | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          apply_at?: string | null
          apply_link?: string | null
          category?: string
          created_at?: string | null
          description?: string
          documents_required?: string[] | null
          eligibility_disability?: string[] | null
          eligibility_max_age?: number | null
          eligibility_max_income?: number | null
          eligibility_min_age?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      task_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          sender_id: string
          task_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          sender_id: string
          task_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          sender_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_messages_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          accepted_at: string | null
          area_name: string | null
          category: string
          completed_at: string | null
          completion_note: string | null
          completion_proof_url: string | null
          created_at: string | null
          description: string
          id: string
          is_urgent: boolean | null
          latitude: number | null
          longitude: number | null
          seeker_id: string
          status: string | null
          title: string
          updated_at: string | null
          verified_at: string | null
          volunteer_id: string | null
          task_status_detail: string | null
          errand_details: string | null
        }
        Insert: {
          accepted_at?: string | null
          area_name?: string | null
          category: string
          completed_at?: string | null
          completion_note?: string | null
          completion_proof_url?: string | null
          created_at?: string | null
          description: string
          id?: string
          is_urgent?: boolean | null
          latitude?: number | null
          longitude?: number | null
          seeker_id: string
          status?: string | null
          title: string
          updated_at?: string | null
          verified_at?: string | null
          volunteer_id?: string | null
          task_status_detail?: string | null
          errand_details?: string | null
        }
        Update: {
          accepted_at?: string | null
          area_name?: string | null
          category?: string
          completed_at?: string | null
          completion_note?: string | null
          completion_proof_url?: string | null
          created_at?: string | null
          description?: string
          id?: string
          is_urgent?: boolean | null
          latitude?: number | null
          longitude?: number | null
          seeker_id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          verified_at?: string | null
          volunteer_id?: string | null
          task_status_detail?: string | null
          errand_details?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ngo_profiles: { Row: any, Insert: any, Update: any, Relationships: any[] }
      ngo_residents: { Row: any, Insert: any, Update: any, Relationships: any[] }
      resident_medicines: { Row: any, Insert: any, Update: any, Relationships: any[] }
      resident_reminders: { Row: any, Insert: any, Update: any, Relationships: any[] }
      service_categories: { Row: any, Insert: any, Update: any, Relationships: any[] }
      services: { Row: any, Insert: any, Update: any, Relationships: any[] }
      resident_care_notes: { Row: any, Insert: any, Update: any, Relationships: any[] }
      resident_documents: { Row: any, Insert: any, Update: any, Relationships: any[] }
      resident_visitor_log: { Row: any, Insert: any, Update: any, Relationships: any[] }
      resident_incidents: { Row: any, Insert: any, Update: any, Relationships: any[] }
      ngo_caretakers: { Row: any, Insert: any, Update: any, Relationships: any[] }
      ngo_caretaker_shifts: { Row: any, Insert: any, Update: any, Relationships: any[] }
      ngo_expenses: { Row: any, Insert: any, Update: any, Relationships: any[] }
      ngo_referrals: { Row: any, Insert: any, Update: any, Relationships: any[] }
      ngo_inquiries: { Row: any, Insert: any, Update: any, Relationships: any[] }
      ngo_needs: { Row: any, Insert: any, Update: any, Relationships: any[] }
      need_interests: { Row: any, Insert: any, Update: any, Relationships: any[] }
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
