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
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
      backup_configs: {
        Row: {
          created_at: string
          destination_id: string
          enabled: boolean
          format: Database["public"]["Enums"]["backup_format"]
          id: string
          notion_connection_id: string
          rotation: Json | null
          schedule: string
          scope: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          destination_id: string
          enabled?: boolean
          format?: Database["public"]["Enums"]["backup_format"]
          id?: string
          notion_connection_id: string
          rotation?: Json | null
          schedule: string
          scope?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          destination_id?: string
          enabled?: boolean
          format?: Database["public"]["Enums"]["backup_format"]
          id?: string
          notion_connection_id?: string
          rotation?: Json | null
          schedule?: string
          scope?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "backup_configs_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backup_configs_notion_connection_id_fkey"
            columns: ["notion_connection_id"]
            isOneToOne: false
            referencedRelation: "notion_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backup_configs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_runs: {
        Row: {
          backup_config_id: string
          created_at: string
          error: string | null
          finished_at: string | null
          id: string
          location: string | null
          started_at: string | null
          stats: Json | null
          status: Database["public"]["Enums"]["run_status"]
          user_id: string
        }
        Insert: {
          backup_config_id: string
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          location?: string | null
          started_at?: string | null
          stats?: Json | null
          status?: Database["public"]["Enums"]["run_status"]
          user_id: string
        }
        Update: {
          backup_config_id?: string
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          location?: string | null
          started_at?: string | null
          stats?: Json | null
          status?: Database["public"]["Enums"]["run_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "backup_runs_backup_config_id_fkey"
            columns: ["backup_config_id"]
            isOneToOne: false
            referencedRelation: "backup_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      destinations: {
        Row: {
          config: Json
          created_at: string
          credentials_secret_id: string | null
          id: string
          label: string | null
          status: Database["public"]["Enums"]["destination_status"]
          type: Database["public"]["Enums"]["destination_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          credentials_secret_id?: string | null
          id?: string
          label?: string | null
          status?: Database["public"]["Enums"]["destination_status"]
          type: Database["public"]["Enums"]["destination_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          credentials_secret_id?: string | null
          id?: string
          label?: string | null
          status?: Database["public"]["Enums"]["destination_status"]
          type?: Database["public"]["Enums"]["destination_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "destinations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notion_connections: {
        Row: {
          access_token_secret_id: string | null
          bot_id: string | null
          created_at: string
          id: string
          notion_workspace_id: string
          refresh_token_secret_id: string | null
          status: Database["public"]["Enums"]["connection_status"]
          token_expires_at: string | null
          updated_at: string
          user_id: string
          workspace_icon: string | null
          workspace_name: string | null
        }
        Insert: {
          access_token_secret_id?: string | null
          bot_id?: string | null
          created_at?: string
          id?: string
          notion_workspace_id: string
          refresh_token_secret_id?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
          workspace_icon?: string | null
          workspace_name?: string | null
        }
        Update: {
          access_token_secret_id?: string | null
          bot_id?: string | null
          created_at?: string
          id?: string
          notion_workspace_id?: string
          refresh_token_secret_id?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
          workspace_icon?: string | null
          workspace_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notion_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
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
      backup_format: "json" | "markdown" | "both"
      connection_status: "active" | "revoked" | "error"
      destination_status: "active" | "error" | "disabled"
      destination_type: "github" | "google_drive" | "sftp" | "r2"
      run_status: "pending" | "running" | "success" | "partial" | "failed"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      backup_format: ["json", "markdown", "both"],
      connection_status: ["active", "revoked", "error"],
      destination_status: ["active", "error", "disabled"],
      destination_type: ["github", "google_drive", "sftp", "r2"],
      run_status: ["pending", "running", "success", "partial", "failed"],
    },
  },
} as const
