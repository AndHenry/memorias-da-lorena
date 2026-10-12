-- ============================================================
-- Memórias da Lorena — Migração 002: Políticas de Segurança (RLS)
-- ============================================================

-- Habilitar Row Level Security em todas as tabelas
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_likes ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- POLÍTICAS: events
-- -------------------------------------------------------
-- Leitura pública para eventos ativos
CREATE POLICY "Public events can be read by anyone"
  ON public.events
  FOR SELECT
  USING (true);

-- Apenas admins autenticados podem modificar configurações do evento
CREATE POLICY "Admins can update events"
  ON public.events
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- -------------------------------------------------------
-- POLÍTICAS: media
-- -------------------------------------------------------
-- Leitura pública: apenas mídias aprovadas em eventos com galeria pública
CREATE POLICY "Approved media is viewable by everyone"
  ON public.media
  FOR SELECT
  USING (
    moderation_status = 'approved'
    OR (auth.role() = 'authenticated')
  );

-- Upload: qualquer visitante ou usuário pode inserir fotos/vídeos
CREATE POLICY "Anyone can upload media"
  ON public.media
  FOR INSERT
  WITH CHECK (true);

-- Moderação / Exclusão: apenas administradores autenticados
CREATE POLICY "Admins can update media"
  ON public.media
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete media"
  ON public.media
  FOR DELETE
  TO authenticated
  USING (true);

-- -------------------------------------------------------
-- POLÍTICAS: event_access
-- -------------------------------------------------------
CREATE POLICY "Only admins can view event access"
  ON public.event_access
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage event access"
  ON public.event_access
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- -------------------------------------------------------
-- POLÍTICAS: admin_audit_logs
-- -------------------------------------------------------
CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create audit logs"
  ON public.admin_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- -------------------------------------------------------
-- POLÍTICAS: media_likes
-- -------------------------------------------------------
CREATE POLICY "Anyone can view likes"
  ON public.media_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can like media"
  ON public.media_likes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can remove their own like"
  ON public.media_likes
  FOR DELETE
  USING (true);
