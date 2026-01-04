import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function criarTabela() {
  try {
    console.log('Criando tabela exercicios_rotina...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exercicios_rotina (
        id SERIAL PRIMARY KEY,
        rotina_diaria_id INTEGER NOT NULL REFERENCES rotina_diaria(id) ON DELETE CASCADE,
        exercicio_id INTEGER NOT NULL REFERENCES biblioteca_exercicios(id) ON DELETE CASCADE,
        ordem INTEGER NOT NULL,
        series_planejadas INTEGER DEFAULT 3,
        observacoes TEXT,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query('CREATE INDEX IF NOT EXISTS idx_exercicios_rotina_rotina ON exercicios_rotina(rotina_diaria_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_exercicios_rotina_exercicio ON exercicios_rotina(exercicio_id)');
    
    console.log('✅ Tabela exercicios_rotina criada com sucesso!');
    
    // Verificar
    const result = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_name = 'exercicios_rotina'");
    console.log('Tabela existe:', result.rows.length > 0);
    
    await pool.end();
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

criarTabela();
