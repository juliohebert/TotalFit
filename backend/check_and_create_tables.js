import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkAndCreateTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verificando tabelas de nutrição...\n');

    // Verificar se tabela refeicoes existe
    const checkRefeicoes = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'refeicoes'
      );
    `);

    if (!checkRefeicoes.rows[0].exists) {
      console.log('❌ Tabela refeicoes não existe. Criando...');
      
      await client.query(`
        CREATE TABLE refeicoes (
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
      `);
      
      console.log('✅ Tabela refeicoes criada com sucesso!\n');
    } else {
      console.log('✅ Tabela refeicoes já existe.\n');
    }

    // Verificar se tabela hidratacao existe
    const checkHidratacao = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'hidratacao'
      );
    `);

    if (!checkHidratacao.rows[0].exists) {
      console.log('❌ Tabela hidratacao não existe. Criando...');
      
      await client.query(`
        CREATE TABLE hidratacao (
          id SERIAL PRIMARY KEY,
          usuario_id INTEGER NOT NULL,
          data DATE NOT NULL,
          quantidade INTEGER NOT NULL,
          horario TIME,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        );
      `);
      
      console.log('✅ Tabela hidratacao criada com sucesso!\n');
    } else {
      console.log('✅ Tabela hidratacao já existe.\n');
    }

    // Inserir dados de exemplo se as tabelas estiverem vazias
    const countRefeicoes = await client.query('SELECT COUNT(*) FROM refeicoes WHERE usuario_id = 1');
    
    if (parseInt(countRefeicoes.rows[0].count) === 0) {
      console.log('📝 Inserindo refeições de exemplo para usuário 1...');
      
      const hoje = new Date().toISOString().split('T')[0];
      
      await client.query(`
        INSERT INTO refeicoes (usuario_id, data, tipo_refeicao, nome, alimentos, calorias, proteinas, carboidratos, gorduras, concluido, horario)
        VALUES 
          (1, $1, 'Café da Manhã', 'Breakfast Fit', 'Ovos mexidos, Pão integral, Café', 400, 25, 45, 12, true, '08:00'),
          (1, $1, 'Lanche da Manhã', 'Snack Proteico', 'Iogurte grego, Frutas vermelhas, Granola', 180, 15, 22, 5, true, '10:30'),
          (1, $1, 'Almoço', 'Almoço Completo', 'Frango grelhado 200g, Arroz integral, Brócolis', 600, 45, 65, 18, false, '12:30'),
          (1, $1, 'Jantar', 'Jantar Leve', 'Salmão grelhado, Salada mista, Azeite', 520, 35, 25, 28, false, '19:00');
      `, [hoje]);
      
      console.log('✅ Refeições de exemplo inseridas!\n');
    }

    const countHidratacao = await client.query('SELECT COUNT(*) FROM hidratacao WHERE usuario_id = 1');
    
    if (parseInt(countHidratacao.rows[0].count) === 0) {
      console.log('💧 Inserindo registros de hidratação de exemplo...');
      
      const hoje = new Date().toISOString().split('T')[0];
      
      await client.query(`
        INSERT INTO hidratacao (usuario_id, data, quantidade, horario)
        VALUES 
          (1, $1, 250, '08:30'),
          (1, $1, 500, '11:00'),
          (1, $1, 300, '14:00'),
          (1, $1, 200, '16:30');
      `, [hoje]);
      
      console.log('✅ Hidratação de exemplo inserida!\n');
    }

    // Verificar totais
    const totais = await client.query(`
      SELECT 
        COALESCE(SUM(calorias), 0) as total_calorias,
        COALESCE(SUM(proteinas), 0) as total_proteinas,
        COALESCE(SUM(carboidratos), 0) as total_carboidratos,
        COALESCE(SUM(gorduras), 0) as total_gorduras
      FROM refeicoes 
      WHERE usuario_id = 1 AND data = CURRENT_DATE
    `);

    const hidratacaoTotal = await client.query(`
      SELECT COALESCE(SUM(quantidade), 0) as total_hidratacao
      FROM hidratacao 
      WHERE usuario_id = 1 AND data = CURRENT_DATE
    `);

    console.log('📊 Totais do dia para usuário 1:');
    console.log(`   Calorias: ${totais.rows[0].total_calorias} kcal`);
    console.log(`   Proteínas: ${totais.rows[0].total_proteinas}g`);
    console.log(`   Carboidratos: ${totais.rows[0].total_carboidratos}g`);
    console.log(`   Gorduras: ${totais.rows[0].total_gorduras}g`);
    console.log(`   Hidratação: ${hidratacaoTotal.rows[0].total_hidratacao}ml`);
    
    console.log('\n✅ Verificação concluída!');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkAndCreateTables();
