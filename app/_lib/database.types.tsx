export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      leave_requests: {
        Row: {
          approved_at: string | null
          attachment_url: string | null
          backstop_colleague: number
          consent: boolean
          declined_at: string | null
          end_date: string
          id: number
          leave_type: string
          reason: string
          start_date: string
          status: string
          submitted_at: string
        }
        Insert: {
          approved_at?: string | null
          attachment_url?: string | null
          backstop_colleague: number
          consent: boolean
          declined_at?: string | null
          end_date: string
          id?: number
          leave_type: string
          reason: string
          start_date: string
          status?: string
          submitted_at?: string
        }
        Update: {
          approved_at?: string | null
          attachment_url?: string | null
          backstop_colleague?: number
          consent?: boolean
          declined_at?: string | null
          end_date?: string
          id?: number
          leave_type?: string
          reason?: string
          start_date?: string
          status?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_backstop_colleague_fkey"
            columns: ["backstop_colleague"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_table: {
        Row: {
          attachement: string | null
          backstop: string | null
          end_date: string | null
          id: number
          leave_type: string | null
          name: string | null
          requested_date: string
          role: string | null
          start_date: string | null
          status: string | null
        }
        Insert: {
          attachement?: string | null
          backstop?: string | null
          end_date?: string | null
          id?: number
          leave_type?: string | null
          name?: string | null
          requested_date?: string
          role?: string | null
          start_date?: string | null
          status?: string | null
        }
        Update: {
          attachement?: string | null
          backstop?: string | null
          end_date?: string | null
          id?: number
          leave_type?: string | null
          name?: string | null
          requested_date?: string
          role?: string | null
          start_date?: string | null
          status?: string | null
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string
          department: string
          designation: string
          email: string
          firstName: string
          id: number
          lastName: string
          otherName: string | null
        }
        Insert: {
          created_at?: string
          department: string
          designation: string
          email: string
          firstName: string
          id?: number
          lastName: string
          otherName?: string | null
        }
        Update: {
          created_at?: string
          department?: string
          designation?: string
          email?: string
          firstName?: string
          id?: number
          lastName?: string
          otherName?: string | null
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
