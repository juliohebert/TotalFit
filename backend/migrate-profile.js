import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrate() {
  try {
    console.log('🔄 Executando migração de perfil...');
    
    const sql = `
      ALTER TABLE usuarios
        ADD COLUMN IF NOT EXISTS nome_exibicao VARCHAR(100),
        ADD COLUMN IF NOT EXISTS data_nascimento DATE,
        ADD COLUMN IF NOT EXISTS telefone VARCHAR(20),
        ADD COLUMN IF NOT EXISTS peso NUMERIC(5,2),
        ADD COLUMN IF NOT EXISTS altura NUMERIC(5,2),
        ADD COLUMN IF NOT EXISTS gordura_corporal NUMERIC(5,2),
        ADD COLUMN IF NOT EXISTS meta_principal VARCHAR(100),
        ADD COLUMN IF NOT EXISTS foto_perfil VARCHAR(500),
        ADD COLUMN IF NOT EXISTS nivel VARCHAR(100),
        ADD COLUMN IF NOT EXISTS plano VARCHAR(50);
    `;
    
    await pool.query(sql);
    console.log('✅ Migração executada com sucesso!');
    
    // Verificar estrutura
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Estrutura da tabela usuarios:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    await pool.end();
    process.exit(1);
  }
}

migrate();
