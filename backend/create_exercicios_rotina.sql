CREATE TABLE IF NOT EXISTS exercicios_rotina (
    id SERIAL PRIMARY KEY,
    rotina_diaria_id INTEGER NOT NULL REFERENCES rotina_diaria(id) ON DELETE CASCADE,
    exercicio_id INTEGER NOT NULL REFERENCES biblioteca_exercicios(id) ON DELETE CASCADE,
    ordem INTEGER NOT NULL,
    series_planejadas INTEGER DEFAULT 3,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exercicios_rotina_rotina ON exercicios_rotina(rotina_diaria_id);
CREATE INDEX IF NOT EXISTS idx_exercicios_rotina_exercicio ON exercicios_rotina(exercicio_id);
