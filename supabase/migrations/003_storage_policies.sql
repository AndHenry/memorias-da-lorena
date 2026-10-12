-- ============================================================
-- Memórias da Lorena — Migração 003: Storage Bucket & Políticas
-- ============================================================

-- Criar o bucket de armazenamento de mídias do evento ('media')
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  false, -- Acesso seguro via signed URLs geradas pela API
  104857600, -- Limite máximo de 100MB por arquivo (para suportar vídeos de 15 anos)
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ];

-- -------------------------------------------------------
-- POLÍTICAS DE ACESSO AO BUCKET (storage.objects)
-- -------------------------------------------------------

-- Permitir que a API de upload e convidados enviem arquivos para o bucket media
DROP POLICY IF EXISTS "Allow upload to media" ON storage.objects;
CREATE POLICY "Allow upload to media"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'media');

-- Permitir leitura de objetos do bucket media
DROP POLICY IF EXISTS "Allow read from media" ON storage.objects;
CREATE POLICY "Allow read from media"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'media');

-- Apenas administradores autenticados podem excluir mídias do storage
DROP POLICY IF EXISTS "Allow admin delete from media" ON storage.objects;
CREATE POLICY "Allow admin delete from media"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'media');
