// Types de la base Notivault (schéma M1).
//
// ⚠️ Écrits à la main d'après les migrations supabase/migrations/ (le projet
// n'était pas encore appliqué au moment de M2a). À REMPLACER par la sortie de :
//   supabase gen types typescript --project-id <ref> > src/shared/lib/database.types.ts
// une fois M1 poussé, pour rester la source de vérité exacte.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notion_connections: {
        Row: {
          id: string;
          user_id: string;
          notion_workspace_id: string;
          workspace_name: string | null;
          workspace_icon: string | null;
          bot_id: string | null;
          access_token_secret_id: string | null;
          refresh_token_secret_id: string | null;
          token_expires_at: string | null;
          status: Database["public"]["Enums"]["connection_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          notion_workspace_id: string;
          workspace_name?: string | null;
          workspace_icon?: string | null;
          bot_id?: string | null;
          access_token_secret_id?: string | null;
          refresh_token_secret_id?: string | null;
          token_expires_at?: string | null;
          status?: Database["public"]["Enums"]["connection_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notion_connections"]["Insert"]>;
        Relationships: [];
      };
      destinations: {
        Row: {
          id: string;
          user_id: string;
          type: Database["public"]["Enums"]["destination_type"];
          label: string | null;
          credentials_secret_id: string | null;
          config: Json;
          status: Database["public"]["Enums"]["destination_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: Database["public"]["Enums"]["destination_type"];
          label?: string | null;
          credentials_secret_id?: string | null;
          config?: Json;
          status?: Database["public"]["Enums"]["destination_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["destinations"]["Insert"]>;
        Relationships: [];
      };
      backup_configs: {
        Row: {
          id: string;
          user_id: string;
          notion_connection_id: string;
          destination_id: string;
          schedule: string;
          scope: Json;
          format: Database["public"]["Enums"]["backup_format"];
          rotation: Json | null;
          enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          notion_connection_id: string;
          destination_id: string;
          schedule: string;
          scope?: Json;
          format?: Database["public"]["Enums"]["backup_format"];
          rotation?: Json | null;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["backup_configs"]["Insert"]>;
        Relationships: [];
      };
      backup_runs: {
        Row: {
          id: string;
          backup_config_id: string;
          user_id: string;
          status: Database["public"]["Enums"]["run_status"];
          started_at: string | null;
          finished_at: string | null;
          stats: Json | null;
          error: string | null;
          location: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          backup_config_id: string;
          user_id: string;
          status?: Database["public"]["Enums"]["run_status"];
          started_at?: string | null;
          finished_at?: string | null;
          stats?: Json | null;
          error?: string | null;
          location?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["backup_runs"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      destination_type: "github" | "google_drive" | "sftp" | "r2";
      connection_status: "active" | "revoked" | "error";
      destination_status: "active" | "error" | "disabled";
      backup_format: "json" | "markdown" | "both";
      run_status: "pending" | "running" | "success" | "partial" | "failed";
    };
    CompositeTypes: Record<never, never>;
  };
};
