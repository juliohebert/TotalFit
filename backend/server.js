import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Configuração de variáveis de ambiente
dotenv.config();

// Chave secreta JWT (em produção, use variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 'totalfit_secret_key_2026';
const JWT_EXPIRES_IN = '7d';

const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================
// Configuração do Pool de Conexão com Neon (PostgreSQL)
// =====================================================
const { Pool } = pg;

// Validação: DATABASE_URL deve estar definida
if (!process.env.DATABASE_URL) {
  console.error('❌ ERRO CRÍTICO: DATABASE_URL não definida no arquivo .env');
  console.error('👉 Configure o arquivo backend/.env com suas credenciais do Neon');
  console.error('👉 Exemplo: DATABASE_URL=postgresql://user:password@host/database?sslmode=require');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necessário para Neon
  },
  // Configurações para Render Free Tier (evita timeout)
  max: 10, // Máximo de conexões
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Teste de conexão ao iniciar
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erro ao conectar no Neon:', err.message);
    console.error('\n🔧 SOLUÇÃO:');
    console.error('1. Acesse: https://console.neon.tech');
    console.error('2. Copie a Connection String do seu projeto');
    console.error('3. Cole no arquivo backend/.env na variável DATABASE_URL');
    console.error('4. Reinicie o servidor: npm start\n');
  } else {
    console.log('✅ Conectado ao Neon PostgreSQL:', res.rows[0].now);
  }
});

// =====================================================
// Middlewares
// =====================================================

// CORS - Permite requisições do frontend na Vercel
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vercel ou local (Vite)
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Aumentar limite para suportar imagens Base64
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging simples
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// =====================================================
// Rotas de Saúde
// =====================================================

app.get('/', (req, res) => {
  res.json({ 
    mensagem: 'TotalFit API está online! 💪',
    versao: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT 1');
    res.json({ 
      status: 'saudavel', 
      banco: 'conectado',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'problema', 
      banco: 'desconectado',
      erro: error.message 
    });
  }
});

// =====================================================
// Rotas de Autenticação
// =====================================================

// POST /api/auth/registrar - Registrar novo usuário
app.post('/api/auth/registrar', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Validação básica
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
    }

    // Verificar se email já existe
    const usuarioExistente = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }

    // Validar senha mínima
    if (senha.length < 6) {
      return res.status(400).json({ erro: 'Senha deve ter no mínimo 6 caracteres' });
    }

    // Hash de senha com bcrypt
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserir usuário
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email, criado_em',
      [nome, email, senhaHash]
    );

    const novoUsuario = result.rows[0];

    // Gerar JWT token
    const token = jwt.sign(
      { id: novoUsuario.id, email: novoUsuario.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      mensagem: 'Usuário criado com sucesso',
      token,
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ erro: 'Erro ao criar usuário' });
  }
});

// POST /api/auth/login - Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    console.log('📧 Login attempt:', email);

    const result = await pool.query(
      'SELECT id, nome, email, senha_hash FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      console.log('❌ Usuário não encontrado:', email);
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const usuario = result.rows[0];
    console.log('✅ Usuário encontrado:', usuario.id, usuario.nome);

    // Verificar senha com bcrypt
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    console.log('🔐 Senha válida:', senhaValida);
    
    if (!senhaValida) {
      console.log('❌ Senha incorreta para:', email);
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    // Gerar JWT token
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      mensagem: 'Login bem-sucedido',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
});

// =====================================================
// Rotas de Exercícios
// =====================================================

// GET /api/exercicios - Listar todos os exercícios
app.get('/api/exercicios', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM biblioteca_exercicios ORDER BY grupo_muscular, nome'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar exercícios:', error);
    res.status(500).json({ erro: 'Erro ao buscar exercícios' });
  }
});

// GET /api/exercicios/:id - Buscar exercício específico
app.get('/api/exercicios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM biblioteca_exercicios WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Exercício não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar exercício:', error);
    res.status(500).json({ erro: 'Erro ao buscar exercício' });
  }
});

// =====================================================
// Rotas de Treino
// =====================================================

// GET /api/treino/ultima-carga/:usuarioId/:exercicioId
// CRÍTICO: Retorna a última carga utilizada para progressão
app.get('/api/treino/ultima-carga/:usuarioId/:exercicioId', async (req, res) => {
  try {
    const { usuarioId, exercicioId } = req.params;

    const result = await pool.query(
      `SELECT carga_kg AS ultima_carga, repeticoes AS ultimas_repeticoes, criado_em AS data_ultimo_treino
       FROM series_treino
       WHERE usuario_id = $1 AND exercicio_id = $2 AND concluido = TRUE
       ORDER BY criado_em DESC
       LIMIT 1`,
      [usuarioId, exercicioId]
    );

    if (result.rows.length === 0) {
      return res.json({ 
        ultima_carga: null, 
        ultimas_repeticoes: null,
        mensagem: 'Primeira vez fazendo este exercício' 
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar última carga:', error);
    res.status(500).json({ erro: 'Erro ao buscar última carga' });
  }
});

// POST /api/treino/sessao - Criar nova sessão de treino
app.post('/api/treino/sessao', async (req, res) => {
  try {
    const { usuarioId, exercicioId, dataSessao, rotinaDiariaId } = req.body;

    const result = await pool.query(
      `INSERT INTO sessao_treino (usuario_id, exercicio_id, data_sessao, rotina_diaria_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [usuarioId, exercicioId, dataSessao, rotinaDiariaId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    res.status(500).json({ erro: 'Erro ao criar sessão de treino' });
  }
});

// POST /api/treino/serie - Salvar série
app.post('/api/treino/serie', async (req, res) => {
  try {
    const { sessaoTreinoId, exercicioId, usuarioId, numeroSerie, cargaKg, repeticoes, descansoSegundos } = req.body;

    const result = await pool.query(
      `INSERT INTO series_treino 
       (sessao_treino_id, exercicio_id, usuario_id, numero_serie, carga_kg, repeticoes, descanso_segundos, concluido)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
       RETURNING *`,
      [sessaoTreinoId, exercicioId, usuarioId, numeroSerie, cargaKg, repeticoes, descansoSegundos]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao salvar série:', error);
    res.status(500).json({ erro: 'Erro ao salvar série' });
  }
});

// POST /api/treino/concluir - Salvar treino concluído com todas as séries
app.post('/api/treino/concluir', async (req, res) => {
  try {
    const { usuario_id, rotina_id, data_hora, series } = req.body;

    // Criar sessão de treino
    const sessaoResult = await pool.query(
      `INSERT INTO sessao_treino (usuario_id, data_sessao, rotina_diaria_id)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [usuario_id, data_hora, rotina_id]
    );

    const sessaoId = sessaoResult.rows[0].id;

    // Salvar todas as séries
    if (series && series.length > 0) {
      for (const serie of series) {
        await pool.query(
          `INSERT INTO series_treino 
           (sessao_treino_id, exercicio_id, numero_serie, concluido)
           VALUES ($1, $2, $3, $4)`,
          [sessaoId, serie.exercicio_rotina_id, serie.numero_serie, true]
        );
      }
    }

    res.status(201).json({ 
      message: 'Treino salvo com sucesso!',
      sessao_id: sessaoId
    });
  } catch (error) {
    console.error('Erro ao salvar treino concluído:', error);
    res.status(500).json({ erro: 'Erro ao salvar treino' });
  }
});

// GET /api/treino/verificar-hoje/:usuarioId/:rotinaId - Verificar se treino foi feito hoje
app.get('/api/treino/verificar-hoje/:usuarioId/:rotinaId', async (req, res) => {
  try {
    const { usuarioId, rotinaId } = req.params;
    const hoje = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const result = await pool.query(
      `SELECT DISTINCT st.id, st.data_sessao 
       FROM sessao_treino st
       WHERE st.usuario_id = $1 
         AND st.rotina_diaria_id = $2 
         AND DATE(st.data_sessao) = $3
       LIMIT 1`,
      [usuarioId, rotinaId, hoje]
    );

    res.json({ 
      realizado: result.rows.length > 0,
      sessao: result.rows[0] || null
    });
  } catch (error) {
    console.error('Erro ao verificar treino de hoje:', error);
    res.status(500).json({ erro: 'Erro ao verificar treino' });
  }
});

// GET /api/treino/ultima-sessao/:usuarioId/:treinoId - Buscar última sessão do treino
app.get('/api/treino/ultima-sessao/:usuarioId/:treinoId', async (req, res) => {
  try {
    const { usuarioId, treinoId } = req.params;

    // Buscar última sessão (mais recente)
    const sessaoResult = await pool.query(
      `SELECT DISTINCT data_sessao
       FROM sessao_treino
       WHERE usuario_id = $1 AND rotina_diaria_id = $2
       ORDER BY data_sessao DESC
       LIMIT 1`,
      [usuarioId, treinoId]
    );

    if (sessaoResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Nenhuma sessão anterior encontrada' });
    }

    const dataSessao = sessaoResult.rows[0].data_sessao;

    // Buscar todas as séries desta data, agrupadas por exercício
    const seriesResult = await pool.query(
      `SELECT 
        st.exercicio_id,
        be.nome as exercicio_nome,
        st.numero_serie,
        st.repeticoes,
        st.carga_kg
       FROM series_treino st
       JOIN biblioteca_exercicios be ON st.exercicio_id = be.id
       JOIN sessao_treino se ON st.sessao_treino_id = se.id
       WHERE se.usuario_id = $1 
         AND se.rotina_diaria_id = $2 
         AND se.data_sessao = $3
       ORDER BY st.exercicio_id, st.numero_serie`,
      [usuarioId, treinoId, dataSessao]
    );

    // Agrupar séries por exercício
    const exercicios = {};
    seriesResult.rows.forEach(serie => {
      if (!exercicios[serie.exercicio_id]) {
        exercicios[serie.exercicio_id] = {
          exercicio_id: serie.exercicio_id,
          nome: serie.exercicio_nome,
          series: []
        };
      }
      exercicios[serie.exercicio_id].series.push({
        numero: serie.numero_serie,
        repeticoes_realizadas: serie.repeticoes,
        carga_utilizada: serie.carga_kg
      });
    });

    res.json({
      data_sessao: dataSessao,
      exercicios: Object.values(exercicios)
    });
  } catch (error) {
    console.error('Erro ao buscar última sessão:', error);
    res.status(500).json({ erro: 'Erro ao buscar última sessão' });
  }
});

// =====================================================
// Rotas de Dieta
// =====================================================

// POST /api/refeicao/registro - Registrar refeição
app.post('/api/refeicao/registro', async (req, res) => {
  try {
    const { usuarioId, nomeRefeicao, dataRefeicao, concluido, rotinaDiariaId } = req.body;

    const result = await pool.query(
      `INSERT INTO registro_refeicoes (usuario_id, nome_refeicao, data_refeicao, concluido, rotina_diaria_id, concluido_em)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [usuarioId, nomeRefeicao, dataRefeicao, concluido, rotinaDiariaId, concluido ? new Date() : null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao registrar refeição:', error);
    res.status(500).json({ erro: 'Erro ao registrar refeição' });
  }
});

// PUT /api/refeicao/registro/:id - Atualizar status da refeição (checkbox)
app.put('/api/refeicao/registro/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { concluido } = req.body;

    const result = await pool.query(
      `UPDATE registro_refeicoes 
       SET concluido = $1, concluido_em = $2
       WHERE id = $3
       RETURNING *`,
      [concluido, concluido ? new Date() : null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Refeição não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar refeição:', error);
    res.status(500).json({ erro: 'Erro ao atualizar refeição' });
  }
});

// GET /api/refeicao/registro/:usuarioId/:data - Buscar refeições do dia
app.get('/api/refeicao/registro/:usuarioId/:data', async (req, res) => {
  try {
    const { usuarioId, data } = req.params;

    const result = await pool.query(
      `SELECT * FROM registro_refeicoes 
       WHERE usuario_id = $1 AND data_refeicao = $2
       ORDER BY id`,
      [usuarioId, data]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar refeições:', error);
    res.status(500).json({ erro: 'Erro ao buscar refeições' });
  }
});

// =====================================================
// Rotas de Rotina Diária
// =====================================================

// GET /api/rotina/:id/exercicios - Buscar exercícios de uma rotina (DEVE VIR ANTES)
app.get('/api/rotina/:id/exercicios', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`📋 Buscando exercícios da rotina ID: ${id}`);

    const result = await pool.query(
      `SELECT 
        er.id as exercicio_rotina_id,
        er.ordem,
        er.series_planejadas,
        er.repeticoes,
        er.carga,
        er.tempo_descanso,
        er.observacoes,
        be.id as exercicio_id,
        be.nome,
        be.grupo_muscular,
        be.descricao,
        be.url_video,
        be.instrucoes
       FROM exercicios_rotina er
       JOIN biblioteca_exercicios be ON er.exercicio_id = be.id
       WHERE er.rotina_diaria_id = $1
       ORDER BY er.ordem`,
      [id]
    );
    
    console.log(`✅ Encontrados ${result.rows.length} exercícios para rotina ${id}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar exercícios da rotina:', error);
    res.status(500).json({ erro: 'Erro ao buscar exercícios da rotina' });
  }
});

// GET /api/rotina/:usuarioId/:data - Buscar rotina do dia
app.get('/api/rotina/:usuarioId/:data', async (req, res) => {
  try {
    const { usuarioId, data } = req.params;
    
    console.log('🔍 Buscando rotina:', { usuarioId, data });

    // Determinar o dia da semana a partir da data
    const dataParsed = new Date(data + 'T12:00:00Z');
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const diaSemana = diasSemana[dataParsed.getUTCDay()];
    
    console.log('🗓️ Buscando rotina para:', diaSemana);
    
    // Buscar rotina pelo dia da semana (mais recente primeiro)
    const result = await pool.query(
      `SELECT * FROM rotina_diaria 
       WHERE usuario_id = $1 AND dia_semana = $2
       ORDER BY criado_em DESC
       LIMIT 1`,
      [usuarioId, diaSemana]
    );
    
    console.log('📊 Resultado busca:', result.rows.length, 'registros');

    if (result.rows.length === 0) {
      console.log('❌ Nenhuma rotina encontrada para', diaSemana);
      return res.status(404).json({ erro: 'Rotina não encontrada para esta data' });
    }

    console.log('✅ Rotina encontrada:', result.rows[0].id, result.rows[0].nome_treino, `(${diaSemana})`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro ao buscar rotina:', error);
    res.status(500).json({ erro: 'Erro ao buscar rotina' });
  }
});

// POST /api/rotina - Criar nova rotina de treino
app.post('/api/rotina', async (req, res) => {
  const client = await pool.connect();
  try {
    const { usuarioId, nomeTreino, descricao, exercicios, diasSemana, cor } = req.body;

    // Validação
    if (!usuarioId || !nomeTreino || !exercicios || exercicios.length === 0 || !diasSemana || diasSemana.length === 0) {
      return res.status(400).json({ erro: 'Dados incompletos: usuarioId, nomeTreino, exercicios e diasSemana são obrigatórios' });
    }

    await client.query('BEGIN');

    // Criar rotinas para cada dia da semana selecionado
    const diasNomes = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const rotinasIds = [];

    for (const diaNumero of diasSemana) {
      const diaNome = diasNomes[diaNumero];
      
      // Criar rotina_diaria para o dia
      const rotinaResult = await client.query(
        `INSERT INTO rotina_diaria (usuario_id, data, dia_semana, nome_treino)
         VALUES ($1, CURRENT_DATE, $2, $3)
         RETURNING id`,
        [usuarioId, diaNome, nomeTreino]
      );

      const rotinaId = rotinaResult.rows[0].id;

      // Inserir exercícios associados à rotina
      for (let i = 0; i < exercicios.length; i++) {
        const exercicio = exercicios[i];
        await client.query(
          `INSERT INTO exercicios_rotina (rotina_diaria_id, exercicio_id, ordem, series_planejadas)
           VALUES ($1, $2, $3, $4)`,
          [rotinaId, exercicio.id, i + 1, exercicio.series || 3]
        );
      }

      rotinasIds.push({ dia: diaNome, rotinaId });
    }

    await client.query('COMMIT');

    res.status(201).json({
      mensagem: 'Treino criado com sucesso',
      rotinas: rotinasIds,
      treino: { nome: nomeTreino, exercicios: exercicios.length, dias: diasSemana.length }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar rotina:', error);
    res.status(500).json({ erro: 'Erro ao criar rotina' });
  } finally {
    client.release();
  }
});

// GET /api/treinos/:id/detalhes - Buscar treino com exercícios para edição (DEVE VIR ANTES DA ROTA GENÉRICA)
app.get('/api/treinos/:id/detalhes', async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar rotina
    const rotinaResult = await pool.query(
      'SELECT * FROM rotina_diaria WHERE id = $1',
      [id]
    );

    if (rotinaResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Treino não encontrado' });
    }

    // Buscar exercícios
    const exerciciosResult = await pool.query(
      `SELECT 
        er.id,
        er.exercicio_id,
        er.ordem,
        er.series_planejadas,
        er.repeticoes,
        er.carga,
        er.tempo_descanso,
        er.observacoes,
        be.nome,
        be.grupo_muscular
       FROM exercicios_rotina er
       JOIN biblioteca_exercicios be ON er.exercicio_id = be.id
       WHERE er.rotina_diaria_id = $1
       ORDER BY er.ordem`,
      [id]
    );

    res.json({
      ...rotinaResult.rows[0],
      exercicios: exerciciosResult.rows
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes do treino:', error);
    res.status(500).json({ erro: 'Erro ao buscar detalhes do treino' });
  }
});

// GET /api/treinos/:usuarioId - Listar todos os treinos do usuário
app.get('/api/treinos/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const result = await pool.query(
      `SELECT id, nome_treino, dia_semana
       FROM rotina_diaria 
       WHERE usuario_id = $1
       ORDER BY 
         CASE dia_semana
           WHEN 'Segunda' THEN 1
           WHEN 'Terça' THEN 2
           WHEN 'Quarta' THEN 3
           WHEN 'Quinta' THEN 4
           WHEN 'Sexta' THEN 5
           WHEN 'Sábado' THEN 6
           WHEN 'Domingo' THEN 7
         END`,
      [usuarioId]
    );

    console.log(`📊 Treinos do usuário ${usuarioId}:`, result.rows.map(r => `ID ${r.id}: ${r.nome_treino} (${r.dia_semana})`));
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar treinos:', error);
    res.status(500).json({ erro: 'Erro ao listar treinos' });
  }
});

// POST /api/treinos - Criar novo treino completo
app.post('/api/treinos', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { usuario_id, nome_treino, dia_semana, descricao, exercicios } = req.body;

    if (!usuario_id || !nome_treino || !dia_semana) {
      return res.status(400).json({ erro: 'Campos obrigatórios: usuario_id, nome_treino, dia_semana' });
    }

    await client.query('BEGIN');

    // Inserir rotina
    const rotinaResult = await client.query(
      `INSERT INTO rotina_diaria (usuario_id, nome_treino, dia_semana, descricao, data_criacao)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING id`,
      [usuario_id, nome_treino, dia_semana, descricao || '']
    );

    const rotinaId = rotinaResult.rows[0].id;

    // Inserir exercícios se fornecidos
    if (exercicios && exercicios.length > 0) {
      for (let i = 0; i < exercicios.length; i++) {
        const ex = exercicios[i];
        await client.query(
          `INSERT INTO exercicios_rotina (rotina_diaria_id, exercicio_id, ordem, series_planejadas, repeticoes, carga, observacoes)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            rotinaId,
            ex.exercicio_id,
            ex.ordem || i + 1,
            ex.series_planejadas || 3,
            ex.repeticoes || null,
            ex.carga || null,
            ex.observacoes || null
          ]
        );
      }
    }

    await client.query('COMMIT');

    res.status(201).json({ 
      message: 'Treino criado com sucesso',
      id: rotinaId 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar treino:', error);
    res.status(500).json({ erro: 'Erro ao criar treino' });
  } finally {
    client.release();
  }
});

// GET /api/rotina/:id - Buscar detalhes completos de uma rotina
app.get('/api/rotina/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar dados da rotina
    const rotinaResult = await pool.query(
      'SELECT * FROM rotina_diaria WHERE id = $1',
      [id]
    );

    if (rotinaResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Rotina não encontrada' });
    }

    const rotina = rotinaResult.rows[0];

    res.json(rotina);
  } catch (error) {
    console.error('Erro ao buscar rotina:', error);
    res.status(500).json({ erro: 'Erro ao buscar rotina' });
  }
});

// PUT /api/treinos/:id - Atualizar treino existente
app.put('/api/treinos/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { nome_treino, dia_semana, descricao, exercicios } = req.body;

    if (!nome_treino || !dia_semana) {
      return res.status(400).json({ erro: 'Campos obrigatórios: nome_treino, dia_semana' });
    }

    await client.query('BEGIN');

    // Atualizar rotina
    const updateResult = await client.query(
      `UPDATE rotina_diaria 
       SET nome_treino = $1, dia_semana = $2, descricao = $3
       WHERE id = $4
       RETURNING id`,
      [nome_treino, dia_semana, descricao || '', id]
    );

    if (updateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ erro: 'Treino não encontrado' });
    }

    // Se exercícios foram fornecidos, atualizar
    if (exercicios && Array.isArray(exercicios)) {
      // Deletar exercícios antigos
      await client.query('DELETE FROM exercicios_rotina WHERE rotina_diaria_id = $1', [id]);

      // Inserir novos exercícios
      for (let i = 0; i < exercicios.length; i++) {
        const ex = exercicios[i];
        await client.query(
          `INSERT INTO exercicios_rotina (rotina_diaria_id, exercicio_id, ordem, series_planejadas, repeticoes, carga, observacoes)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            id,
            ex.exercicio_id,
            ex.ordem || i + 1,
            ex.series_planejadas || 3,
            ex.repeticoes || null,
            ex.carga || null,
            ex.observacoes || null
          ]
        );
      }
    }

    await client.query('COMMIT');

    res.json({ message: 'Treino atualizado com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar treino:', error);
    res.status(500).json({ erro: 'Erro ao atualizar treino' });
  } finally {
    client.release();
  }
});

// GET /api/rotina/:id - Buscar rotina com exercícios (antigo - mantido para compatibilidade)
app.get('/api/rotina/:id/exercicios', async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar dados da rotina
    const rotinaResult = await pool.query(
      'SELECT * FROM rotina_diaria WHERE id = $1',
      [id]
    );

    if (rotinaResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Rotina não encontrada' });
    }

    const rotina = rotinaResult.rows[0];

    // Buscar exercícios da rotina
    const exerciciosResult = await pool.query(
      `SELECT 
        er.id as exercicio_rotina_id,
        er.ordem,
        er.series_planejadas,
        er.observacoes,
        be.id as exercicio_id,
        be.nome,
        be.grupo_muscular,
        be.descricao,
        be.url_video
       FROM exercicios_rotina er
       JOIN biblioteca_exercicios be ON er.exercicio_id = be.id
       WHERE er.rotina_diaria_id = $1
       ORDER BY er.ordem`,
      [id]
    );

    res.json({
      ...rotina,
      exercicios: exerciciosResult.rows
    });
  } catch (error) {
    console.error('Erro ao buscar rotina:', error);
    res.status(500).json({ erro: 'Erro ao buscar rotina' });
  }
});

// DELETE /api/rotina/:id - Deletar rotina
app.delete('/api/rotina/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM rotina_diaria WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Rotina não encontrada' });
    }

    res.json({ mensagem: 'Rotina deletada com sucesso', rotina: result.rows[0] });
  } catch (error) {
    console.error('Erro ao deletar rotina:', error);
    res.status(500).json({ erro: 'Erro ao deletar rotina' });
  }
});

// =====================================================
// Rotas de Nutrição
// =====================================================

// GET /api/nutricao/resumo/:usuarioId/:data - Buscar resumo nutricional do dia
app.get('/api/nutricao/resumo/:usuarioId/:data', async (req, res) => {
  try {
    const { usuarioId, data } = req.params;
    
    // Buscar metas do usuário
    const usuario = await pool.query(
      `SELECT meta_calorias, meta_proteinas, meta_carboidratos, meta_gorduras, meta_agua 
       FROM usuarios WHERE id = $1`,
      [usuarioId]
    );

    // Usar metas do usuário ou valores padrão vazios (null)
    const metaCalorias = usuario.rows[0]?.meta_calorias || null;
    const metaProteinas = usuario.rows[0]?.meta_proteinas || null;
    const metaCarboidratos = usuario.rows[0]?.meta_carboidratos || null;
    const metaGorduras = usuario.rows[0]?.meta_gorduras || null;
    const metaAgua = usuario.rows[0]?.meta_agua || null;
    
    // Buscar refeições do dia
    const refeicoes = await pool.query(
      `SELECT * FROM refeicoes 
       WHERE usuario_id = $1 AND DATE(data) = $2 
       ORDER BY horario`,
      [usuarioId, data]
    );

    // Calcular totais
    let totalCalorias = 0;
    let totalProteinas = 0;
    let totalCarboidratos = 0;
    let totalGorduras = 0;

    refeicoes.rows.forEach(ref => {
      totalCalorias += parseFloat(ref.calorias || 0);
      totalProteinas += parseFloat(ref.proteinas || 0);
      totalCarboidratos += parseFloat(ref.carboidratos || 0);
      totalGorduras += parseFloat(ref.gorduras || 0);
    });

    // Buscar hidratação do dia
    const hidratacao = await pool.query(
      `SELECT COALESCE(SUM(quantidade), 0) as total 
       FROM hidratacao 
       WHERE usuario_id = $1 AND DATE(data) = $2`,
      [usuarioId, data]
    );

    res.json({
      calorias: {
        consumido: Math.round(totalCalorias),
        meta: metaCalorias,
        restante: metaCalorias ? metaCalorias - Math.round(totalCalorias) : null
      },
      macros: {
        proteinas: Math.round(totalProteinas),
        carboidratos: Math.round(totalCarboidratos),
        gorduras: Math.round(totalGorduras),
        metas: {
          proteinas: metaProteinas,
          carboidratos: metaCarboidratos,
          gorduras: metaGorduras
        }
      },
      hidratacao: {
        atual: parseInt(hidratacao.rows[0].total),
        meta: metaAgua
      },
      refeicoes: refeicoes.rows.length
    });
  } catch (error) {
    console.error('Erro ao buscar resumo nutricional:', error);
    res.status(500).json({ erro: 'Erro ao buscar resumo nutricional' });
  }
});

// GET /api/nutricao/refeicoes/:usuarioId/:data - Buscar refeições do dia
app.get('/api/nutricao/refeicoes/:usuarioId/:data', async (req, res) => {
  try {
    const { usuarioId, data } = req.params;
    
    const result = await pool.query(
      `SELECT * FROM refeicoes 
       WHERE usuario_id = $1 AND DATE(data) = $2 
       ORDER BY horario`,
      [usuarioId, data]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar refeições:', error);
    res.status(500).json({ erro: 'Erro ao buscar refeições' });
  }
});

// PUT /api/nutricao/refeicoes/:id/concluir - Marcar refeição como concluída/não concluída
app.put('/api/nutricao/refeicoes/:id/concluir', async (req, res) => {
  try {
    const { id } = req.params;
    const { concluido } = req.body;

    const result = await pool.query(
      'UPDATE refeicoes SET concluido = $1 WHERE id = $2 RETURNING *',
      [concluido, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Refeição não encontrada' });
    }

    res.json({ message: 'Status atualizado com sucesso', refeicao: result.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar refeição:', error);
    res.status(500).json({ erro: 'Erro ao atualizar refeição' });
  }
});

// POST /api/nutricao/refeicoes - Criar nova refeição
app.post('/api/nutricao/refeicoes', async (req, res) => {
  try {
    const { usuario_id, data, tipo_refeicao, nome, alimentos, calorias, proteinas, carboidratos, gorduras, horario } = req.body;

    if (!usuario_id || !data || !nome) {
      return res.status(400).json({ erro: 'Campos obrigatórios: usuario_id, data, nome' });
    }

    const result = await pool.query(
      `INSERT INTO refeicoes (usuario_id, data, tipo_refeicao, nome, alimentos, calorias, proteinas, carboidratos, gorduras, horario, concluido)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false)
       RETURNING *`,
      [usuario_id, data, tipo_refeicao, nome, alimentos, calorias || 0, proteinas || 0, carboidratos || 0, gorduras || 0, horario]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar refeição:', error);
    res.status(500).json({ erro: 'Erro ao criar refeição' });
  }
});

// POST /api/nutricao/hidratacao - Registrar consumo de água
app.post('/api/nutricao/hidratacao', async (req, res) => {
  try {
    const { usuario_id, data, quantidade, horario } = req.body;

    if (!usuario_id || !data || !quantidade) {
      return res.status(400).json({ erro: 'Campos obrigatórios: usuario_id, data, quantidade' });
    }

    const result = await pool.query(
      'INSERT INTO hidratacao (usuario_id, data, quantidade, horario) VALUES ($1, $2, $3, $4) RETURNING *',
      [usuario_id, data, quantidade, horario || new Date().toTimeString().slice(0, 5)]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao registrar hidratação:', error);
    res.status(500).json({ erro: 'Erro ao registrar hidratação' });
  }
});

// =====================================================
// Rotas de Treinos Públicos (Explorar Treinos)
// =====================================================

// GET /api/treinos-publicos - Listar treinos públicos com filtros
app.get('/api/treinos-publicos', async (req, res) => {
  try {
    const { busca, categoria, nivel, frequencia, usuario_id } = req.query;
    
    let query = `
      SELECT 
        tp.id,
        tp.titulo,
        tp.descricao,
        tp.imagem_url,
        tp.frequencia_semanal,
        c.nome as categoria,
        c.slug as categoria_slug,
        n.nome as nivel,
        n.slug as nivel_slug,
        CASE WHEN tf.id IS NOT NULL THEN true ELSE false END as favorito
      FROM treinos_publicos tp
      LEFT JOIN categorias_treino c ON tp.categoria_id = c.id
      LEFT JOIN niveis_treino n ON tp.nivel_id = n.id
      LEFT JOIN treinos_favoritos tf ON tp.id = tf.treino_publico_id AND tf.usuario_id = $1
      WHERE tp.ativo = true
    `;
    
    const params = [usuario_id || null];
    let paramIndex = 2;
    
    // Filtro de busca por texto
    if (busca) {
      query += ` AND (LOWER(tp.titulo) LIKE $${paramIndex} OR LOWER(tp.descricao) LIKE $${paramIndex})`;
      params.push(`%${busca.toLowerCase()}%`);
      paramIndex++;
    }
    
    // Filtro por categoria
    if (categoria && categoria !== 'todos') {
      query += ` AND c.slug = $${paramIndex}`;
      params.push(categoria);
      paramIndex++;
    }
    
    // Filtro por nível
    if (nivel) {
      query += ` AND n.slug = $${paramIndex}`;
      params.push(nivel);
      paramIndex++;
    }
    
    // Filtro por frequência semanal
    if (frequencia && frequencia !== 'all') {
      query += ` AND tp.frequencia_semanal = $${paramIndex}`;
      params.push(parseInt(frequencia));
      paramIndex++;
    }
    
    query += ' ORDER BY tp.criado_em DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar treinos públicos:', error);
    res.status(500).json({ erro: 'Erro ao buscar treinos' });
  }
});

// GET /api/categorias-treino - Listar categorias
app.get('/api/categorias-treino', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias_treino ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ erro: 'Erro ao buscar categorias' });
  }
});

// GET /api/niveis-treino - Listar níveis
app.get('/api/niveis-treino', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM niveis_treino ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar níveis:', error);
    res.status(500).json({ erro: 'Erro ao buscar níveis' });
  }
});

// POST /api/treinos-favoritos/toggle - Toggle favorito
app.post('/api/treinos-favoritos/toggle', async (req, res) => {
  try {
    const { usuario_id, treino_publico_id } = req.body;
    
    // Verificar se já existe
    const checkResult = await pool.query(
      'SELECT id FROM treinos_favoritos WHERE usuario_id = $1 AND treino_publico_id = $2',
      [usuario_id, treino_publico_id]
    );
    
    if (checkResult.rows.length > 0) {
      // Remover favorito
      await pool.query(
        'DELETE FROM treinos_favoritos WHERE usuario_id = $1 AND treino_publico_id = $2',
        [usuario_id, treino_publico_id]
      );
      res.json({ favorito: false, mensagem: 'Treino removido dos favoritos' });
    } else {
      // Adicionar favorito
      await pool.query(
        'INSERT INTO treinos_favoritos (usuario_id, treino_publico_id) VALUES ($1, $2)',
        [usuario_id, treino_publico_id]
      );
      res.json({ favorito: true, mensagem: 'Treino adicionado aos favoritos' });
    }
  } catch (error) {
    console.error('Erro ao toggle favorito:', error);
    res.status(500).json({ erro: 'Erro ao atualizar favorito' });
  }
});

// =====================================================
// Error Handler
// =====================================================

// =====================================================
// Rotas de Perfil de Usuário
// =====================================================

// GET /api/usuarios/:id - Buscar perfil do usuário
app.get('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, nome, nome_exibicao, email, data_nascimento, telefone, peso, altura, gordura_corporal, meta_principal, foto_perfil, nivel, plano, meta_calorias, meta_proteinas, meta_carboidratos, meta_gorduras, meta_agua, criado_em, atualizado_em
       FROM usuarios WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ erro: 'Erro ao buscar perfil do usuário' });
  }
});

// PUT /api/usuarios/:id - Atualizar perfil do usuário
app.put('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome,
      nome_exibicao,
      data_nascimento,
      telefone,
      peso,
      altura,
      gordura_corporal,
      meta_principal,
      foto_perfil,
      nivel,
      plano,
      meta_calorias,
      meta_proteinas,
      meta_carboidratos,
      meta_gorduras,
      meta_agua
    } = req.body;

    const result = await pool.query(
      `UPDATE usuarios SET
        nome = COALESCE($1, nome),
        nome_exibicao = COALESCE($2, nome_exibicao),
        data_nascimento = COALESCE($3, data_nascimento),
        telefone = COALESCE($4, telefone),
        peso = COALESCE($5, peso),
        altura = COALESCE($6, altura),
        gordura_corporal = COALESCE($7, gordura_corporal),
        meta_principal = COALESCE($8, meta_principal),
        foto_perfil = COALESCE($9, foto_perfil),
        nivel = COALESCE($10, nivel),
        plano = COALESCE($11, plano),
        meta_calorias = COALESCE($12, meta_calorias),
        meta_proteinas = COALESCE($13, meta_proteinas),
        meta_carboidratos = COALESCE($14, meta_carboidratos),
        meta_gorduras = COALESCE($15, meta_gorduras),
        meta_agua = COALESCE($16, meta_agua),
        atualizado_em = NOW()
      WHERE id = $17
      RETURNING id, nome, nome_exibicao, email, data_nascimento, telefone, peso, altura, gordura_corporal, meta_principal, foto_perfil, nivel, plano, meta_calorias, meta_proteinas, meta_carboidratos, meta_gorduras, meta_agua, criado_em, atualizado_em`,
      [
        nome,
        nome_exibicao,
        data_nascimento,
        telefone,
        peso,
        altura,
        gordura_corporal,
        meta_principal,
        foto_perfil,
        nivel,
        plano,
        meta_calorias,
        meta_proteinas,
        meta_carboidratos,
        meta_gorduras,
        meta_agua,
        id
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    res.json({ mensagem: 'Perfil atualizado com sucesso', usuario: result.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ erro: 'Erro ao atualizar perfil do usuário' });
  }
});

app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

// =====================================================
// Inicialização do Servidor
// =====================================================

app.listen(PORT, () => {
  console.log(`🚀 TotalFit API rodando na porta ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Fechando servidor...');
  pool.end(() => {
    console.log('Pool de conexões fechado');
    process.exit(0);
  });
});
