-- SQL para criar a tabela no Supabase
-- Você pode copiar e colar este código no SQL Editor do seu projeto Supabase.

CREATE TABLE IF NOT EXISTS ouvidoria_respostas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_completo TEXT NOT NULL,
  protocolo TEXT NOT NULL,
  contato TEXT NOT NULL,
  tipo_usuario TEXT NOT NULL,
  documento TEXT NOT NULL,
  email TEXT NOT NULL,
  setor TEXT NOT NULL,
  detalhes TEXT NOT NULL,
  ajuda TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS (opcional, mas recomendado)
ALTER TABLE ouvidoria_respostas ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir inserções (ajuste conforme necessário)
CREATE POLICY "Permitir inserção pública" ON ouvidoria_respostas
  FOR INSERT WITH CHECK (true);
