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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
