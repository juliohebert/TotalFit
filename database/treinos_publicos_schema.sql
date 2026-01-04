-- =====================================================
-- Schema para Treinos Públicos (Explorar Treinos)
-- =====================================================

-- Tabela de Categorias/Objetivos
CREATE TABLE IF NOT EXISTS categorias_treino (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE, -- 'Ganho de Massa', 'Perda de Peso', 'Força', 'Resistência'
    slug VARCHAR(50) NOT NULL UNIQUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Níveis
CREATE TABLE IF NOT EXISTS niveis_treino (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE, -- 'Iniciante', 'Intermediário', 'Avançado'
    slug VARCHAR(50) NOT NULL UNIQUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Treinos Públicos
CREATE TABLE IF NOT EXISTS treinos_publicos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    imagem_url TEXT,
    categoria_id INTEGER REFERENCES categorias_treino(id),
    nivel_id INTEGER REFERENCES niveis_treino(id),
    frequencia_semanal INTEGER, -- 2, 3, 4, 5+
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Favoritos
CREATE TABLE IF NOT EXISTS treinos_favoritos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    treino_publico_id INTEGER NOT NULL REFERENCES treinos_publicos(id) ON DELETE CASCADE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, treino_publico_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_treinos_publicos_categoria ON treinos_publicos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_treinos_publicos_nivel ON treinos_publicos(nivel_id);
CREATE INDEX IF NOT EXISTS idx_treinos_publicos_frequencia ON treinos_publicos(frequencia_semanal);
CREATE INDEX IF NOT EXISTS idx_treinos_favoritos_usuario ON treinos_favoritos(usuario_id);

-- Inserir dados iniciais
INSERT INTO categorias_treino (nome, slug) VALUES
    ('Todos', 'todos'),
    ('Ganho de Massa', 'ganho_massa'),
    ('Perda de Peso', 'perda_peso'),
    ('Força', 'forca'),
    ('Resistência', 'resistencia')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO niveis_treino (nome, slug) VALUES
    ('Iniciante', 'iniciante'),
    ('Intermediário', 'intermediario'),
    ('Avançado', 'avancado')
ON CONFLICT (slug) DO NOTHING;

-- Inserir treinos de exemplo
INSERT INTO treinos_publicos (titulo, descricao, imagem_url, categoria_id, nivel_id, frequencia_semanal) VALUES
    ('Full Body Iniciante', '3 dias/semana - Foco em adaptação neuromuscular e aprendizado.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', 2, 1, 3),
    ('Hipertrofia ABCD', '4 dias/semana - Divisão clássica para ganho de massa muscular.', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80', 2, 2, 4),
    ('Queima de Gordura HIIT', '3 dias/semana - Treino intervalado de alta intensidade.', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', 3, 1, 3),
    ('Força Bruta 5x5', '3 dias/semana - Programa clássico para aumento de força base.', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80', 4, 2, 3),
    ('Calistenia Avançada', '4 dias/semana - Domínio do corpo com exercícios de peso corporal.', 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800&q=80', 5, 3, 4),
    ('Superior Completo', '2 dias/semana - Foco em ombros, peito e costas para definição.', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80', 2, 2, 2),
    ('Especialização de Braços', '1 dia/semana - Treino focado em bíceps e tríceps volumosos.', 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&q=80', 2, 2, 1),
    ('Glúteos e Pernas', '2 dias/semana - Foco em membros inferiores e tonificação.', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80', 2, 1, 2)
ON CONFLICT DO NOTHING;
