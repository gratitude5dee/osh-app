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
      fal_jobs: {
        Row: {
          created_at: string
          endpoint: string
          error: string | null
          fal_request_id: string | null
          id: string
          input: Json
          kind: string
          output: Json | null
          review_queue_item_id: string | null
          session_id: string | null
          status: Database["public"]["Enums"]["job_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          error?: string | null
          fal_request_id?: string | null
          id?: string
          input?: Json
          kind?: string
          output?: Json | null
          review_queue_item_id?: string | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          error?: string | null
          fal_request_id?: string | null
          id?: string
          input?: Json
          kind?: string
          output?: Json | null
          review_queue_item_id?: string | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fal_jobs_review_queue_item_id_fkey"
            columns: ["review_queue_item_id"]
            isOneToOne: false
            referencedRelation: "review_queue_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fal_jobs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "stream_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_replacements: {
        Row: {
          created_at: string
          fal_job_id: string | null
          id: string
          kind: string
          metadata: Json
          output_url: string | null
          review_queue_item_id: string | null
          source_url: string | null
        }
        Insert: {
          created_at?: string
          fal_job_id?: string | null
          id?: string
          kind?: string
          metadata?: Json
          output_url?: string | null
          review_queue_item_id?: string | null
          source_url?: string | null
        }
        Update: {
          created_at?: string
          fal_job_id?: string | null
          id?: string
          kind?: string
          metadata?: Json
          output_url?: string | null
          review_queue_item_id?: string | null
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_replacements_fal_job_id_fkey"
            columns: ["fal_job_id"]
            isOneToOne: false
            referencedRelation: "fal_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_replacements_review_queue_item_id_fkey"
            columns: ["review_queue_item_id"]
            isOneToOne: false
            referencedRelation: "review_queue_items"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_events: {
        Row: {
          action: Database["public"]["Enums"]["moderation_action"]
          categories: string[]
          confidence: number
          created_at: string
          decision: Database["public"]["Enums"]["moderation_decision"]
          frame_index: number | null
          id: string
          latency_ms: number | null
          model: string
          obs_client_id: string | null
          raw_result: Json
          reason: string | null
          session_id: string
          source_ts_ms: number
        }
        Insert: {
          action?: Database["public"]["Enums"]["moderation_action"]
          categories?: string[]
          confidence: number
          created_at?: string
          decision: Database["public"]["Enums"]["moderation_decision"]
          frame_index?: number | null
          id?: string
          latency_ms?: number | null
          model: string
          obs_client_id?: string | null
          raw_result?: Json
          reason?: string | null
          session_id: string
          source_ts_ms: number
        }
        Update: {
          action?: Database["public"]["Enums"]["moderation_action"]
          categories?: string[]
          confidence?: number
          created_at?: string
          decision?: Database["public"]["Enums"]["moderation_decision"]
          frame_index?: number | null
          id?: string
          latency_ms?: number | null
          model?: string
          obs_client_id?: string | null
          raw_result?: Json
          reason?: string | null
          session_id?: string
          source_ts_ms?: number
        }
        Relationships: [
          {
            foreignKeyName: "moderation_events_obs_client_id_fkey"
            columns: ["obs_client_id"]
            isOneToOne: false
            referencedRelation: "obs_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "stream_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_windows: {
        Row: {
          categories: string[]
          created_at: string
          end_ts_ms: number | null
          highest_confidence: number
          id: string
          session_id: string
          start_ts_ms: number
          status: string
          updated_at: string
        }
        Insert: {
          categories?: string[]
          created_at?: string
          end_ts_ms?: number | null
          highest_confidence?: number
          id?: string
          session_id: string
          start_ts_ms: number
          status?: string
          updated_at?: string
        }
        Update: {
          categories?: string[]
          created_at?: string
          end_ts_ms?: number | null
          highest_confidence?: number
          id?: string
          session_id?: string
          start_ts_ms?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_windows_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "stream_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mux_assets: {
        Row: {
          created_at: string
          duration_seconds: number | null
          id: string
          mux_asset_id: string
          mux_live_stream_id: string | null
          playback_id: string | null
          playback_policy: string
          raw: Json
          session_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          mux_asset_id: string
          mux_live_stream_id?: string | null
          playback_id?: string | null
          playback_policy?: string
          raw?: Json
          session_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          mux_asset_id?: string
          mux_live_stream_id?: string | null
          playback_id?: string | null
          playback_policy?: string
          raw?: Json
          session_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mux_assets_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "stream_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mux_live_streams: {
        Row: {
          active_asset_id: string | null
          created_at: string
          id: string
          ingest_url: string | null
          latency_mode: string | null
          mux_live_stream_id: string
          playback_id: string | null
          raw: Json
          reconnect_window: number | null
          session_id: string | null
          status: string | null
          stream_key_last4: string | null
          updated_at: string
        }
        Insert: {
          active_asset_id?: string | null
          created_at?: string
          id?: string
          ingest_url?: string | null
          latency_mode?: string | null
          mux_live_stream_id: string
          playback_id?: string | null
          raw?: Json
          reconnect_window?: number | null
          session_id?: string | null
          status?: string | null
          stream_key_last4?: string | null
          updated_at?: string
        }
        Update: {
          active_asset_id?: string | null
          created_at?: string
          id?: string
          ingest_url?: string | null
          latency_mode?: string | null
          mux_live_stream_id?: string
          playback_id?: string | null
          raw?: Json
          reconnect_window?: number | null
          session_id?: string | null
          status?: string | null
          stream_key_last4?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mux_live_streams_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "stream_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mux_webhook_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          mux_event_id: string | null
          object_id: string | null
          payload: Json
          verified: boolean
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          mux_event_id?: string | null
          object_id?: string | null
          payload?: Json
          verified?: boolean
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          mux_event_id?: string | null
          object_id?: string | null
          payload?: Json
          verified?: boolean
        }
        Relationships: []
      }
      obs_clients: {
        Row: {
          config_version: string
          created_at: string
          id: string
          last_seen_at: string | null
          name: string
          revoked_at: string | null
          session_id: string
          token_hash: string
          token_prefix: string
          updated_at: string
        }
        Insert: {
          config_version?: string
          created_at?: string
          id?: string
          last_seen_at?: string | null
          name?: string
          revoked_at?: string | null
          session_id: string
          token_hash: string
          token_prefix: string
          updated_at?: string
        }
        Update: {
          config_version?: string
          created_at?: string
          id?: string
          last_seen_at?: string | null
          name?: string
          revoked_at?: string | null
          session_id?: string
          token_hash?: string
          token_prefix?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "obs_clients_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "stream_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      review_decisions: {
        Row: {
          created_at: string
          decision: Database["public"]["Enums"]["review_status"]
          event_id: string | null
          id: string
          notes: string | null
          review_queue_item_id: string | null
          reviewer_id: string
        }
        Insert: {
          created_at?: string
          decision: Database["public"]["Enums"]["review_status"]
          event_id?: string | null
          id?: string
          notes?: string | null
          review_queue_item_id?: string | null
          reviewer_id: string
        }
        Update: {
          created_at?: string
          decision?: Database["public"]["Enums"]["review_status"]
          event_id?: string | null
          id?: string
          notes?: string | null
          review_queue_item_id?: string | null
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_decisions_review_queue_item_id_fkey"
            columns: ["review_queue_item_id"]
            isOneToOne: false
            referencedRelation: "review_queue_items"
            referencedColumns: ["id"]
          },
        ]
      }
      review_queue_items: {
        Row: {
          categories: string[]
          confidence: number
          created_at: string
          id: string
          moderation_window_id: string | null
          mux_asset_id: string | null
          notes: string | null
          priority: number
          robots_job_id: string | null
          session_id: string | null
          status: Database["public"]["Enums"]["review_status"]
          title: string | null
          updated_at: string
        }
        Insert: {
          categories?: string[]
          confidence?: number
          created_at?: string
          id?: string
          moderation_window_id?: string | null
          mux_asset_id?: string | null
          notes?: string | null
          priority?: number
          robots_job_id?: string | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          title?: string | null
          updated_at?: string
        }
        Update: {
          categories?: string[]
          confidence?: number
          created_at?: string
          id?: string
          moderation_window_id?: string | null
          mux_asset_id?: string | null
          notes?: string | null
          priority?: number
          robots_job_id?: string | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_queue_items_moderation_window_id_fkey"
            columns: ["moderation_window_id"]
            isOneToOne: false
            referencedRelation: "moderation_windows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_queue_items_robots_job_id_fkey"
            columns: ["robots_job_id"]
            isOneToOne: false
            referencedRelation: "robots_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_queue_items_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "stream_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      robots_jobs: {
        Row: {
          asset_row_id: string | null
          created_at: string
          error: string | null
          exceeds_threshold: boolean | null
          id: string
          max_samples: number | null
          max_scores: Json | null
          mux_asset_id: string
          mux_job_id: string | null
          raw_result: Json
          sampling_interval: number | null
          status: Database["public"]["Enums"]["job_status"]
          thresholds: Json
          thumbnail_scores: Json | null
          units_consumed: number | null
          updated_at: string
          workflow: string
        }
        Insert: {
          asset_row_id?: string | null
          created_at?: string
          error?: string | null
          exceeds_threshold?: boolean | null
          id?: string
          max_samples?: number | null
          max_scores?: Json | null
          mux_asset_id: string
          mux_job_id?: string | null
          raw_result?: Json
          sampling_interval?: number | null
          status?: Database["public"]["Enums"]["job_status"]
          thresholds?: Json
          thumbnail_scores?: Json | null
          units_consumed?: number | null
          updated_at?: string
          workflow?: string
        }
        Update: {
          asset_row_id?: string | null
          created_at?: string
          error?: string | null
          exceeds_threshold?: boolean | null
          id?: string
          max_samples?: number | null
          max_scores?: Json | null
          mux_asset_id?: string
          mux_job_id?: string | null
          raw_result?: Json
          sampling_interval?: number | null
          status?: Database["public"]["Enums"]["job_status"]
          thresholds?: Json
          thumbnail_scores?: Json | null
          units_consumed?: number | null
          updated_at?: string
          workflow?: string
        }
        Relationships: [
          {
            foreignKeyName: "robots_jobs_asset_row_id_fkey"
            columns: ["asset_row_id"]
            isOneToOne: false
            referencedRelation: "mux_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      search_documents: {
        Row: {
          body: string | null
          created_at: string
          id: string
          metadata: Json
          mux_asset_id: string | null
          object_id: string
          object_type: string
          owner_id: string | null
          session_id: string | null
          tags: string[]
          title: string | null
          tsv: unknown
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          mux_asset_id?: string | null
          object_id: string
          object_type: string
          owner_id?: string | null
          session_id?: string | null
          tags?: string[]
          title?: string | null
          tsv?: unknown
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          mux_asset_id?: string | null
          object_id?: string
          object_type?: string
          owner_id?: string | null
          session_id?: string | null
          tags?: string[]
          title?: string | null
          tsv?: unknown
        }
        Relationships: [
          {
            foreignKeyName: "search_documents_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "stream_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_policies: {
        Row: {
          block_mode: string
          categories: Json
          created_at: string
          fail_open: boolean
          fallback_models: string[]
          id: string
          model: string
          name: string
          owner_id: string
          prompt: string
          review_threshold: number
          sample_fps: number
          team_id: string | null
          threshold: number
          updated_at: string
        }
        Insert: {
          block_mode?: string
          categories?: Json
          created_at?: string
          fail_open?: boolean
          fallback_models?: string[]
          id?: string
          model?: string
          name: string
          owner_id: string
          prompt: string
          review_threshold?: number
          sample_fps?: number
          team_id?: string | null
          threshold?: number
          updated_at?: string
        }
        Update: {
          block_mode?: string
          categories?: Json
          created_at?: string
          fail_open?: boolean
          fallback_models?: string[]
          id?: string
          model?: string
          name?: string
          owner_id?: string
          prompt?: string
          review_threshold?: number
          sample_fps?: number
          team_id?: string | null
          threshold?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_policies_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          model_status: Json
          mux_active_asset_id: string | null
          mux_latency_mode: string
          mux_live_stream_id: string | null
          mux_playback_id: string | null
          mux_reconnect_window: number
          obs_delay_ms: number
          obs_sample_fps: number
          owner_id: string
          playback_policy: string
          policy_id: string | null
          selected_model: string
          started_at: string | null
          status: Database["public"]["Enums"]["stream_status"]
          team_id: string | null
          title: string
          twitch_enabled: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          model_status?: Json
          mux_active_asset_id?: string | null
          mux_latency_mode?: string
          mux_live_stream_id?: string | null
          mux_playback_id?: string | null
          mux_reconnect_window?: number
          obs_delay_ms?: number
          obs_sample_fps?: number
          owner_id: string
          playback_policy?: string
          policy_id?: string | null
          selected_model?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["stream_status"]
          team_id?: string | null
          title: string
          twitch_enabled?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          model_status?: Json
          mux_active_asset_id?: string | null
          mux_latency_mode?: string
          mux_live_stream_id?: string | null
          mux_playback_id?: string | null
          mux_reconnect_window?: number
          obs_delay_ms?: number
          obs_sample_fps?: number
          owner_id?: string
          playback_policy?: string
          policy_id?: string | null
          selected_model?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["stream_status"]
          team_id?: string | null
          title?: string
          twitch_enabled?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_sessions_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "stream_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_sessions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_all: {
        Args: { q: string }
        Returns: {
          body: string
          created_at: string
          id: string
          metadata: Json
          object_id: string
          object_type: string
          rank: number
          tags: string[]
          title: string
        }[]
      }
    }
    Enums: {
      job_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "cancelled"
      moderation_action:
        | "none"
        | "blackout"
        | "hold_last_safe"
        | "slate"
        | "end_stream"
      moderation_decision: "allow" | "review" | "block"
      review_status:
        | "pending"
        | "approved"
        | "rejected"
        | "escalated"
        | "auto_rejected"
      stream_status:
        | "draft"
        | "starting"
        | "live"
        | "degraded"
        | "ended"
        | "failed"
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
      job_status: ["pending", "processing", "completed", "failed", "cancelled"],
      moderation_action: [
        "none",
        "blackout",
        "hold_last_safe",
        "slate",
        "end_stream",
      ],
      moderation_decision: ["allow", "review", "block"],
      review_status: [
        "pending",
        "approved",
        "rejected",
        "escalated",
        "auto_rejected",
      ],
      stream_status: [
        "draft",
        "starting",
        "live",
        "degraded",
        "ended",
        "failed",
      ],
    },
  },
} as const
