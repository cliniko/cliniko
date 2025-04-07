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
      consultations: {
        Row: {
          assessment: Json | null
          attending_nurse: string | null
          attending_physician: string
          bp_monitoring: boolean | null
          chief_complaint: string
          created_at: string
          created_by: string
          date: string
          hba1c_monitoring: boolean | null
          id: string
          objective: Json | null
          patient_id: string
          patient_type: string
          plan: Json | null
          prescription: Json | null
          subjective: string | null
          time: string
          vital_signs: Json | null
        }
        Insert: {
          assessment?: Json | null
          attending_nurse?: string | null
          attending_physician: string
          bp_monitoring?: boolean | null
          chief_complaint: string
          created_at?: string
          created_by: string
          date: string
          hba1c_monitoring?: boolean | null
          id?: string
          objective?: Json | null
          patient_id: string
          patient_type: string
          plan?: Json | null
          prescription?: Json | null
          subjective?: string | null
          time: string
          vital_signs?: Json | null
        }
        Update: {
          assessment?: Json | null
          attending_nurse?: string | null
          attending_physician?: string
          bp_monitoring?: boolean | null
          chief_complaint?: string
          created_at?: string
          created_by?: string
          date?: string
          hba1c_monitoring?: boolean | null
          id?: string
          objective?: Json | null
          patient_id?: string
          patient_type?: string
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
      }
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
      }
      patients: {
        Row: {
          address: string | null
          contact: string | null
          created_at: string
          created_by: string
          date_of_birth: string
          email: string | null
          gender: string
          id: string
          medical_history: string | null
          name: string
        }
        Insert: {
          address?: string | null
          contact?: string | null
          created_at?: string
          created_by: string
          date_of_birth: string
          email?: string | null
          gender: string
          id?: string
          medical_history?: string | null
          name: string
        }
        Update: {
          address?: string | null
          contact?: string | null
          created_at?: string
          created_by?: string
          date_of_birth?: string
          email?: string | null
          gender?: string
          id?: string
          medical_history?: string | null
          name?: string
        }
        Relationships: []
      }
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
      }
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
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "admin" | "doctor" | "nurse" | "staff"
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
    },
  },
} as const
