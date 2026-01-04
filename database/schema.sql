-- =====================================================
-- TotalFit Database Schema (PostgreSQL - Neon Compatible)
-- Schema em Português
-- =====================================================

-- Extensão para UUID (opcional, mas recomendado)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Tabela: usuarios
-- =====================================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios(email);

-- =====================================================
-- Tabela: biblioteca_exercicios
-- =====================================================
CREATE TABLE biblioteca_exercicios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    url_video VARCHAR(500), -- URL do vídeo de demonstração
    grupo_muscular VARCHAR(100), -- Ex: "Peito", "Costas", "Pernas"
    instrucoes TEXT, -- Instruções detalhadas de execução
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exercicio_musculo ON biblioteca_exercicios(grupo_muscular);

-- =====================================================
-- Tabela: rotina_diaria
-- =====================================================
CREATE TABLE rotina_diaria (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    dia_semana VARCHAR(20) NOT NULL, -- "Segunda", "Terça", etc.
    nome_treino VARCHAR(100), -- Ex: "Treino A - Peito e Tríceps"
    plano_dieta TEXT, -- JSON ou texto com plano alimentar do dia
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rotina_usuario_data ON rotina_diaria(usuario_id, data);
CREATE INDEX idx_rotina_dia_semana ON rotina_diaria(dia_semana);

-- =====================================================
-- Tabela: exercicios_rotina
-- Associação entre rotinas e exercícios
-- =====================================================
CREATE TABLE exercicios_rotina (
    id SERIAL PRIMARY KEY,
    rotina_diaria_id INTEGER NOT NULL REFERENCES rotina_diaria(id) ON DELETE CASCADE,
    exercicio_id INTEGER NOT NULL REFERENCES biblioteca_exercicios(id) ON DELETE CASCADE,
    ordem INTEGER NOT NULL, -- Ordem de execução no treino
    series_planejadas INTEGER DEFAULT 3, -- Número de séries planejadas
    observacoes TEXT, -- Notas específicas para este exercício no treino
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exercicios_rotina_rotina ON exercicios_rotina(rotina_diaria_id);
CREATE INDEX idx_exercicios_rotina_exercicio ON exercicios_rotina(exercicio_id);

-- =====================================================
-- Tabela: sessao_treino
-- =====================================================
CREATE TABLE sessao_treino (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    rotina_diaria_id INTEGER REFERENCES rotina_diaria(id) ON DELETE SET NULL,
    exercicio_id INTEGER NOT NULL REFERENCES biblioteca_exercicios(id) ON DELETE CASCADE,
    data_sessao DATE NOT NULL,
    iniciado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    concluido_em TIMESTAMP,
    observacoes TEXT
);

CREATE INDEX idx_treino_usuario_data ON sessao_treino(usuario_id, data_sessao);
CREATE INDEX idx_treino_exercicio ON sessao_treino(exercicio_id);

-- =====================================================
-- Tabela: series_treino
-- CRÍTICO: Armazena histórico de cargas para progressão
-- =====================================================
CREATE TABLE series_treino (
    id SERIAL PRIMARY KEY,
    sessao_treino_id INTEGER NOT NULL REFERENCES sessao_treino(id) ON DELETE CASCADE,
    exercicio_id INTEGER NOT NULL REFERENCES biblioteca_exercicios(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    numero_serie INTEGER NOT NULL, -- Número da série (1, 2, 3...)
    carga_kg DECIMAL(6,2), -- Carga utilizada em kg
    repeticoes INTEGER, -- Repetições realizadas
    descanso_segundos INTEGER, -- Tempo de descanso em segundos
    concluido BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_series_sessao ON series_treino(sessao_treino_id);
CREATE INDEX idx_series_usuario_exercicio ON series_treino(usuario_id, exercicio_id, criado_em DESC);
-- ⬆️ Este índice é ESSENCIAL para buscar "última carga utilizada" rapidamente

-- =====================================================
-- Tabela: registro_refeicoes
-- =====================================================
CREATE TABLE registro_refeicoes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    rotina_diaria_id INTEGER REFERENCES rotina_diaria(id) ON DELETE SET NULL,
    nome_refeicao VARCHAR(100) NOT NULL, -- Ex: "Café da Manhã", "Almoço"
    data_refeicao DATE NOT NULL,
    concluido BOOLEAN DEFAULT FALSE,
    concluido_em TIMESTAMP,
    observacoes TEXT
);

CREATE INDEX idx_refeicao_usuario_data ON registro_refeicoes(usuario_id, data_refeicao);

-- =====================================================
-- View: ultima_carga_utilizada
-- =====================================================
-- Esta view facilita buscar a última carga de cada exercício
CREATE OR REPLACE VIEW ultima_carga_utilizada AS
SELECT DISTINCT ON (usuario_id, exercicio_id)
    usuario_id,
    exercicio_id,
    carga_kg AS ultima_carga,
    repeticoes AS ultimas_repeticoes,
    criado_em AS data_ultimo_treino
FROM series_treino
WHERE concluido = TRUE
ORDER BY usuario_id, exercicio_id, criado_em DESC;

-- =====================================================
-- Função: Atualizar atualizado_em automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar usuarios.atualizado_em
CREATE TRIGGER atualizar_usuarios_timestamp
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

-- =====================================================
-- Dados de Exemplo (Opcional - para testes)
-- =====================================================

-- Inserir exercícios de exemplo
INSERT INTO biblioteca_exercicios (nome, descricao, url_video, grupo_muscular, instrucoes) VALUES
('Supino Reto', 'Exercício básico para peito', 'https://youtube.com/watch?v=example1', 'Peito', 'Deite no banco reto, segure a barra com pegada média, desça até o peito e empurre para cima.'),
('Agachamento Livre', 'Exercício composto para pernas', 'https://youtube.com/watch?v=example2', 'Pernas', 'Posicione a barra nas costas, desça com joelhos alinhados aos pés até 90 graus e suba.'),
('Remada Curvada', 'Exercício para costas', 'https://youtube.com/watch?v=example3', 'Costas', 'Incline o tronco, segure a barra e puxe em direção ao abdômen, mantendo as costas retas.'),
('Desenvolvimento com Halteres', 'Exercício para ombros', 'https://youtube.com/watch?v=example4', 'Ombros', 'Sentado, empurre os halteres acima da cabeça até extensão completa dos braços.');

-- =====================================================
-- IMPORTANTE: Backup e Segurança
-- =====================================================
-- Recomendações:
-- 1. No Neon, configure backups automáticos no painel
-- 2. Use variáveis de ambiente para a connection string
-- 3. Nunca exponha credenciais no código fonte
