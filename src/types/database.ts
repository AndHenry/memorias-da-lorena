// Database types generated from Supabase schema

export type MediaType = 'photo' | 'video'
export type ModerationStatus = 'pending' | 'approved' | 'rejected'
export type GalleryVisibility = 'public' | 'private' | 'closed'
export type EventStatus = 'active' | 'closed' | 'archived'

export interface Event {
  id: string
  slug: string
  title: string
  description: string | null
  event_date: string | null
  event_location: string | null
  upload_enabled: boolean
  gallery_visibility: GalleryVisibility
  moderation_enabled: boolean
  downloads_enabled: boolean
  max_file_size_mb: number
  max_video_size_mb: number
  max_files_per_upload: number
  status: EventStatus
  upload_closed_message: string | null
  created_at: string
  updated_at: string
}

export interface Media {
  id: string
  event_id: string
  uploader_name: string
  storage_path: string
  thumbnail_path: string | null
  media_type: MediaType
  original_filename: string | null
  file_size: number | null
  mime_type: string | null
  width: number | null
  height: number | null
  duration_seconds: number | null
  moderation_status: ModerationStatus
  likes_count: number
  caption: string | null
  created_at: string
  // client-side enrichment (not from DB)
  reactions?: ReactionSummary[]
  userReacted?: EmojiType[]
}

export type EmojiType = 'heart' | 'star' | 'wow' | 'laugh'

export interface ReactionSummary {
  emoji: EmojiType
  count: number
}

export interface MediaReaction {
  id: string
  media_id: string
  session_token: string
  emoji: EmojiType
  created_at: string
}

export interface EventAccess {
  id: string
  event_id: string
  token_hash: string
  permissions: string[]
  description: string | null
  expires_at: string | null
  revoked_at: string | null
  created_at: string
}

export interface AdminAuditLog {
  id: string
  admin_id: string | null
  action: string
  target_id: string | null
  metadata: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

export interface MediaLike {
  id: string
  media_id: string
  session_token: string
  created_at: string
}

// Frontend-only types

export interface GuestSession {
  name: string
  sessionToken: string
  createdAt: string
}

export interface UploadFile {
  id: string
  file: File
  preview: string | null
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  mediaId?: string
  caption?: string
  thumbnailBlob?: Blob | null
}

export interface GalleryFilters {
  type: 'all' | 'photo' | 'video'
  sort: 'newest' | 'oldest' | 'most_liked'
  page: number
}

export interface AdminStats {
  total_photos: number
  total_videos: number
  total_uploads: number
  total_guests: number
  pending_moderation: number
  storage_used_bytes: number
}

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
      events: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          event_date: string | null
          event_location: string | null
          upload_enabled: boolean
          gallery_visibility: GalleryVisibility
          moderation_enabled: boolean
          downloads_enabled: boolean
          max_file_size_mb: number
          max_video_size_mb: number
          max_files_per_upload: number
          status: EventStatus
          upload_closed_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          event_date?: string | null
          event_location?: string | null
          upload_enabled?: boolean
          gallery_visibility?: GalleryVisibility
          moderation_enabled?: boolean
          downloads_enabled?: boolean
          max_file_size_mb?: number
          max_video_size_mb?: number
          max_files_per_upload?: number
          status?: EventStatus
          upload_closed_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string | null
          event_date?: string | null
          event_location?: string | null
          upload_enabled?: boolean
          gallery_visibility?: GalleryVisibility
          moderation_enabled?: boolean
          downloads_enabled?: boolean
          max_file_size_mb?: number
          max_video_size_mb?: number
          max_files_per_upload?: number
          status?: EventStatus
          upload_closed_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          id: string
          event_id: string
          uploader_name: string
          storage_path: string
          thumbnail_path: string | null
          media_type: MediaType
          original_filename: string | null
          file_size: number | null
          mime_type: string | null
          width: number | null
          height: number | null
          duration_seconds: number | null
          moderation_status: ModerationStatus
          likes_count: number
          caption: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          uploader_name: string
          storage_path: string
          thumbnail_path?: string | null
          media_type: MediaType
          original_filename?: string | null
          file_size?: number | null
          mime_type?: string | null
          width?: number | null
          height?: number | null
          duration_seconds?: number | null
          moderation_status?: ModerationStatus
          likes_count?: number
          caption?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          uploader_name?: string
          storage_path?: string
          thumbnail_path?: string | null
          media_type?: MediaType
          original_filename?: string | null
          file_size?: number | null
          mime_type?: string | null
          width?: number | null
          height?: number | null
          duration_seconds?: number | null
          moderation_status?: ModerationStatus
          likes_count?: number
          caption?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          }
        ]
      }
      event_access: {
        Row: {
          id: string
          event_id: string
          token_hash: string
          permissions: string[]
          description: string | null
          expires_at: string | null
          revoked_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          token_hash: string
          permissions?: string[]
          description?: string | null
          expires_at?: string | null
          revoked_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          token_hash?: string
          permissions?: string[]
          description?: string | null
          expires_at?: string | null
          revoked_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      admin_audit_logs: {
        Row: {
          id: string
          admin_id: string | null
          action: string
          target_id: string | null
          metadata: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id?: string | null
          action: string
          target_id?: string | null
          metadata?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string | null
          action?: string
          target_id?: string | null
          metadata?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Relationships: []
      }
      media_likes: {
        Row: {
          id: string
          media_id: string
          session_token: string
          created_at: string
        }
        Insert: {
          id?: string
          media_id: string
          session_token: string
          created_at?: string
        }
        Update: {
          id?: string
          media_id?: string
          session_token?: string
          created_at?: string
        }
        Relationships: []
      }
      media_reactions: {
        Row: {
          id: string
          media_id: string
          session_token: string
          emoji: string
          created_at: string
        }
        Insert: {
          id?: string
          media_id: string
          session_token: string
          emoji?: string
          created_at?: string
        }
        Update: {
          id?: string
          media_id?: string
          session_token?: string
          emoji?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_reactions_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          }
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

