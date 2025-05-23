export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          attending_nurse: string | null
          chief_complaint: string
          consultation_id: string | null
          created_at: string
          created_by: string
          id: string
          is_archived: boolean
          objective: Json | null
          patient_id: string
          status: string
          subjective: string | null
          updated_at: string
          vital_signs: Json | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          attending_nurse?: string | null
          chief_complaint: string
          consultation_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          is_archived?: boolean
          objective?: Json | null
          patient_id: string
          status: string
          subjective?: string | null
          updated_at?: string
          vital_signs?: Json | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          attending_nurse?: string | null
          chief_complaint?: string
          consultation_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          is_archived?: boolean
          objective?: Json | null
          patient_id?: string
          status?: string
          subjective?: string | null
          updated_at?: string
          vital_signs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_attending_nurse_fkey"
            columns: ["attending_nurse"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      },
      consultations: {
        Row: {
          assessment: Json | null
          assessment_items: Json | null
          additional_remarks: string | null
          attending_nurse: string | null
          attending_physician: string
          bp_monitoring: boolean | null
          chief_complaint: string
          created_at: string
          created_by: string
          date: string
          encounter_type: Database["public"]["Enums"]["encounter_type"]
          hba1c_monitoring: boolean | null
          id: string
          is_archived: boolean
          objective: Json | null
          patient_id: string
          reference_consultation_id: string | null
          plan: Json | null
          prescription: Json | null
          subjective: string | null
          time: string
          vital_signs: Json | null
        }
        Insert: {
          assessment?: Json | null
          assessment_items?: Json | null
          additional_remarks?: string | null
          attending_nurse?: string | null
          attending_physician: string
          bp_monitoring?: boolean | null
          chief_complaint: string
          created_at?: string
          created_by: string
          date: string
          encounter_type: Database["public"]["Enums"]["encounter_type"]
          hba1c_monitoring?: boolean | null
          id?: string
          is_archived?: boolean
          objective?: Json | null
          patient_id: string
          reference_consultation_id?: string | null
          plan?: Json | null
          prescription?: Json | null
          subjective?: string | null
          time: string
          vital_signs?: Json | null
        }
        Update: {
          assessment?: Json | null
          assessment_items?: Json | null
          additional_remarks?: string | null
          attending_nurse?: string | null
          attending_physician?: string
          bp_monitoring?: boolean | null
          chief_complaint?: string
          created_at?: string
          created_by?: string
          date?: string
          encounter_type?: Database["public"]["Enums"]["encounter_type"]
          hba1c_monitoring?: boolean | null
          id?: string
          is_archived?: boolean
          objective?: Json | null
          patient_id?: string
          reference_consultation_id?: string | null
          plan?: Json | null
          prescription?: Json | null
          subjective?: string | null
          time?: string
          vital_signs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      },
      consultation_edits: {
        Row: {
          id: string
          consultation_id: string
          user_id: string
          edited_at: string
          changes: any
          reason: string | null
        }
        Insert: {
          id?: string
          consultation_id: string
          user_id: string
          edited_at?: string
          changes: any
          reason?: string | null
        }
        Update: {
          id?: string
          consultation_id?: string
          user_id?: string
          edited_at?: string
          changes?: any
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultation_edits_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_edits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      },
      drugs: {
        Row: {
          atc_code: string | null
          created_at: string | null
          drug_form: string
          drug_id: string
          drug_name: string
          id: string
        }
        Insert: {
          atc_code?: string | null
          created_at?: string | null
          drug_form: string
          drug_id: string
          drug_name: string
          id?: string
        }
        Update: {
          atc_code?: string | null
          created_at?: string | null
          drug_form?: string
          drug_id?: string
          drug_name?: string
          id?: string
        }
        Relationships: []
      },
      patients: {
        Row: {
          address: string | null
          contact: string | null
          created_at: string
          created_by: string
          date_of_birth: string
          designation: string | null
          email: string | null
          gender: string
          id: string
          is_archived: boolean
          medical_history: string | null
          name: string
          position: string | null
        }
        Insert: {
          address?: string | null
          contact?: string | null
          created_at?: string
          created_by: string
          date_of_birth: string
          designation?: string | null
          email?: string | null
          gender: string
          id?: string
          is_archived?: boolean
          medical_history?: string | null
          name: string
          position?: string | null
        }
        Update: {
          address?: string | null
          contact?: string | null
          created_at?: string
          created_by?: string
          date_of_birth?: string
          designation?: string | null
          email?: string | null
          gender?: string
          id?: string
          is_archived?: boolean
          medical_history?: string | null
          name?: string
          position?: string | null
        }
        Relationships: []
      },
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      },
      vital_signs: {
        Row: {
          created_by: string
          date: string
          diastolic_bp: number | null
          heart_rate: number | null
          height: number | null
          id: string
          oxygen_saturation: number | null
          patient_id: string
          respiratory_rate: number | null
          systolic_bp: number | null
          temperature: number | null
          weight: number | null
        }
        Insert: {
          created_by: string
          date?: string
          diastolic_bp?: number | null
          heart_rate?: number | null
          height?: number | null
          id?: string
          oxygen_saturation?: number | null
          patient_id: string
          respiratory_rate?: number | null
          systolic_bp?: number | null
          temperature?: number | null
          weight?: number | null
        }
        Update: {
          created_by?: string
          date?: string
          diastolic_bp?: number | null
          heart_rate?: number | null
          height?: number | null
          id?: string
          oxygen_saturation?: number | null
          patient_id?: string
          respiratory_rate?: number | null
          systolic_bp?: number | null
          temperature?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vital_signs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      },
      icd10_codes: {
        Row: {
          code: string
          name: string
          description: string | null
          category: string | null
          created_at: string
        }
        Insert: {
          code: string
          name: string
          description?: string | null
          category?: string | null
          created_at?: string
        }
        Update: {
          code?: string
          name?: string
          description?: string | null
          category?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      convert_appointment_to_consultation: {
        Args: { appointment_id_param: string; physician_id_param: string }
        Returns: string
      }
      get_appointments_with_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          patient_id: string
          patient_name: string
          appointment_date: string
          appointment_time: string
          chief_complaint: string
          subjective: string
          objective: Json
          attending_nurse: string
          nurse_name: string
          status: string
          consultation_id: string
          vital_signs: Json
          created_by: string
          created_at: string
        }[]
      }
      get_patient_appointments: {
        Args: { patient_id_param: string }
        Returns: {
          id: string
          appointment_date: string
          appointment_time: string
          chief_complaint: string
          attending_nurse: string
          nurse_name: string
          status: string
          consultation_id: string
        }[]
      }
      fetch_all_appointments: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          appointment_date: string
          appointment_time: string
          chief_complaint: string
          status: string
          patient_id: string
          patient_name: string
          nurse_id: string
          nurse_name: string
          is_archived: boolean
        }[]
      }
      fetch_all_appointments_with_archived: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          appointment_date: string
          appointment_time: string
          chief_complaint: string
          status: string
          patient_id: string
          patient_name: string
          nurse_id: string
          nurse_name: string
          is_archived: boolean
        }[]
      }
      fetch_patient_appointments: {
        Args: { patient_id_param: string }
        Returns: {
          id: string
          appointment_date: string
          appointment_time: string
          chief_complaint: string
          attending_nurse: string
          nurse_name: string
          status: string
          consultation_id: string
          is_archived: boolean
        }[]
      }
      fetch_patient_appointments_with_archived: {
        Args: { patient_id_param: string }
        Returns: {
          id: string
          appointment_date: string
          appointment_time: string
          chief_complaint: string
          attending_nurse: string
          nurse_name: string
          status: string
          consultation_id: string
          is_archived: boolean
        }[]
      }
      fetch_patient_consults: {
        Args: { patient_id_param: string }
        Returns: {
          id: string
          date: string
          time: string
          patient_id: string
          chief_complaint: string
          attending_physician_name: string
          attending_physician: string
          created_at: string
          status: string
          is_archived: boolean
        }[]
      }
      fetch_patient_consults_with_archived: {
        Args: { patient_id_param: string }
        Returns: {
          id: string
          date: string
          time: string
          patient_id: string
          chief_complaint: string
          attending_physician_name: string
          attending_physician: string
          created_at: string
          status: string
          is_archived: boolean
        }[]
      }
      search_icd10_codes: {
        Args: { search_term: string }
        Returns: {
          code: string
          name: string
          description: string
        }[]
      }
      get_users_by_role: {
        Args: { role_filter: string }
        Returns: {
          id: string
          name: string
          role: string
          created_at: string
          updated_at: string
        }[]
      }
      get_patient_with_related_data: {
        Args: { 
          patient_id_param: string
          include_archived?: boolean
          start_date?: string
          end_date?: string
          limit_param?: number
          offset_param?: number
        }
        Returns: any
      }
      log_consultation_edit: {
        Args: {
          consultation_id_param: string
          user_id_param: string
          changes_param: any
          reason_param?: string
        }
        Returns: string
      }
    }
    Enums: {
      user_role: "admin" | "doctor" | "nurse" | "staff"
      encounter_type: "NEW_CONSULT" | "FOLLOW_UP" | "EMERGENCY"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "doctor", "nurse", "staff"],
      encounter_type: ["NEW_CONSULT", "FOLLOW_UP", "EMERGENCY"],
    },
  },
} as const
