-- Criar tabela refeicoes
CREATE TABLE IF NOT EXISTS refeicoes (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  data DATE NOT NULL,
  tipo_refeicao VARCHAR(100),
  nome VARCHAR(200),
  descricao TEXT,
  alimentos TEXT,
  calorias DECIMAL(10,2) DEFAULT 0,
  proteinas DECIMAL(10,2) DEFAULT 0,
  carboidratos DECIMAL(10,2) DEFAULT 0,
  gorduras DECIMAL(10,2) DEFAULT 0,
  concluido BOOLEAN DEFAULT false,
  horario TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Criar tabela hidratacao
CREATE TABLE IF NOT EXISTS hidratacao (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL,
  data DATE NOT NULL,
  quantidade INTEGER NOT NULL,
  horario TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Inserir refeições de exemplo para hoje
INSERT INTO refeicoes (usuario_id, data, tipo_refeicao, nome, alimentos, calorias, proteinas, carboidratos, gorduras, concluido, horario)
VALUES 
  (1, CURRENT_DATE, 'Café da Manhã', 'Breakfast Fit', 'Ovos mexidos, Pão integral, Café', 400, 25, 45, 12, true, '08:00'),
  (1, CURRENT_DATE, 'Lanche da Manhã', 'Snack Proteico', 'Iogurte grego, Frutas vermelhas, Granola', 180, 15, 22, 5, true, '10:30'),
  (1, CURRENT_DATE, 'Almoço', 'Almoço Completo', 'Frango grelhado 200g, Arroz integral, Brócolis', 600, 45, 65, 18, false, '12:30'),
  (1, CURRENT_DATE, 'Jantar', 'Jantar Leve', 'Salmão grelhado, Salada mista, Azeite', 520, 35, 25, 28, false, '19:00')
ON CONFLICT DO NOTHING;

-- Inserir hidratação de exemplo para hoje
INSERT INTO hidratacao (usuario_id, data, quantidade, horario)
VALUES 
  (1, CURRENT_DATE, 250, '08:30'),
  (1, CURRENT_DATE, 500, '11:00'),
  (1, CURRENT_DATE, 300, '14:00'),
  (1, CURRENT_DATE, 200, '16:30')
ON CONFLICT DO NOTHING;

-- Verificar totais
SELECT 
  COALESCE(SUM(calorias), 0) as total_calorias,
  COALESCE(SUM(proteinas), 0) as total_proteinas,
  COALESCE(SUM(carboidratos), 0) as total_carboidratos,
  COALESCE(SUM(gorduras), 0) as total_gorduras
FROM refeicoes 
WHERE usuario_id = 1 AND data = CURRENT_DATE;

SELECT COALESCE(SUM(quantidade), 0) as total_hidratacao
FROM hidratacao 
WHERE usuario_id = 1 AND data = CURRENT_DATE;
