-- ============================================================
-- Memórias da Lorena — Migração 001: Criação das tabelas
-- ============================================================

-- Habilitar extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------
-- TABELA: events
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ,
  event_location TEXT,
  upload_enabled BOOLEAN NOT NULL DEFAULT true,
  gallery_visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (gallery_visibility IN ('public', 'private', 'closed')),
  moderation_enabled BOOLEAN NOT NULL DEFAULT true,
  downloads_enabled BOOLEAN NOT NULL DEFAULT true,
  max_file_size_mb INTEGER NOT NULL DEFAULT 15,
  max_video_size_mb INTEGER NOT NULL DEFAULT 100,
  max_files_per_upload INTEGER NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'closed', 'archived')),
  upload_closed_message TEXT DEFAULT 'O período de envio de fotos foi encerrado. Obrigado por participar!',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS events_updated_at ON public.events;
CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -------------------------------------------------------
-- TABELA: media
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  uploader_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  original_filename TEXT,
  file_size BIGINT,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  duration_seconds INTEGER,
  moderation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para consultas frequentes
CREATE INDEX IF NOT EXISTS media_event_id_idx ON public.media(event_id);
CREATE INDEX IF NOT EXISTS media_status_idx ON public.media(moderation_status);
CREATE INDEX IF NOT EXISTS media_created_idx ON public.media(created_at DESC);
CREATE INDEX IF NOT EXISTS media_type_idx ON public.media(media_type);
CREATE INDEX IF NOT EXISTS media_event_status_idx ON public.media(event_id, moderation_status);

-- -------------------------------------------------------
-- TABELA: event_access
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT ARRAY['view', 'upload'],
  description TEXT,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS event_access_token_idx ON public.event_access(token_hash);
CREATE INDEX IF NOT EXISTS event_access_event_idx ON public.event_access(event_id);

-- -------------------------------------------------------
-- TABELA: admin_audit_logs
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_id UUID,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_admin_idx ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS audit_created_idx ON public.admin_audit_logs(created_at DESC);

-- -------------------------------------------------------
-- TABELA: media_likes
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(media_id, session_token)
);

CREATE INDEX IF NOT EXISTS likes_media_idx ON public.media_likes(media_id);

-- -------------------------------------------------------
-- DADOS INICIAIS: Evento da Lorena
-- -------------------------------------------------------
INSERT INTO public.events (
  slug,
  title,
  description,
  event_date,
  event_location,
  upload_enabled,
  gallery_visibility,
  moderation_enabled,
  downloads_enabled,
  max_file_size_mb,
  max_video_size_mb,
  max_files_per_upload,
  status
) VALUES (
  'lorena-rayla-xv',
  'Memórias da Lorena — Uma Noite Estrelada',
  'A festa de 15 anos de Lorena Rayla. Compartilhe suas fotos e ajude a eternizar essa noite especial.',
  '2026-10-17 22:30:00+00',
  'Estrada Beira Rio, 911 — Caucaia do Alto, Cotia',
  true,
  'public',
  false,
  true,
  15,
  100,
  10,
  'active'
) ON CONFLICT (slug) DO NOTHING;
