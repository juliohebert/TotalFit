-- Adiciona campos de perfil à tabela usuarios
ALTER TABLE usuarios
  ADD COLUMN nome_exibicao VARCHAR(100),
  ADD COLUMN data_nascimento DATE,
  ADD COLUMN telefone VARCHAR(20),
  ADD COLUMN peso NUMERIC(5,2),
  ADD COLUMN altura NUMERIC(5,2),
  ADD COLUMN gordura_corporal NUMERIC(5,2),
  ADD COLUMN meta_principal VARCHAR(100),
  ADD COLUMN foto_perfil VARCHAR(500),
  ADD COLUMN nivel VARCHAR(100),
  ADD COLUMN plano VARCHAR(50);
