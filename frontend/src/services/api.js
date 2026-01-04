import axios from 'axios';

// URL base da API (Render ou localhost)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('totalfit_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirecionar para login se não autorizado
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// =====================================================
// Serviços de Autenticação
// =====================================================

export const authService = {
  register: async (nome, email, senha) => {
    const response = await api.post('/auth/registrar', { nome, email, senha });
    if (response.data.token) {
      localStorage.setItem('totalfit_token', response.data.token);
    }
    if (response.data.usuario) {
      localStorage.setItem('totalfit_user', JSON.stringify(response.data.usuario));
    }
    return response.data;
  },

  login: async (email, senha) => {
    const response = await api.post('/auth/login', { email, senha });
    if (response.data.token) {
      localStorage.setItem('totalfit_token', response.data.token);
    }
    if (response.data.usuario) {
      localStorage.setItem('totalfit_user', JSON.stringify(response.data.usuario));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('totalfit_token');
    localStorage.removeItem('totalfit_user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('totalfit_user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// =====================================================
// Serviços de Exercícios
// =====================================================

export const exerciseService = {
  getAll: async () => {
    const response = await api.get('/exercicios');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/exercicios/${id}`);
    return response.data;
  },
};

// =====================================================
// Serviços de Treino
// =====================================================

export const workoutService = {
  // Buscar treino do dia
  getTreinoDoDia: async (usuarioId, data) => {
    const response = await api.get(`/rotina/${usuarioId}/${data}`);
    return response.data;
  },

  // Buscar treino por ID
  getTreinoById: async (id) => {
    const response = await api.get(`/rotina/${id}`);
    return response.data;
  },

  // Buscar exercícios do treino
  getExerciciosTreino: async (rotinaId) => {
    const response = await api.get(`/rotina/${rotinaId}/exercicios`);
    return response.data;
  },

  // Criar novo treino
  createTreino: async (dados) => {
    const response = await api.post('/rotina', dados);
    return response.data;
  },

  // Listar todos os treinos do usuário
  listarTreinos: async (usuarioId) => {
    const response = await api.get(`/treinos/${usuarioId}`);
    return response.data;
  },

  // Buscar última carga utilizada (CRÍTICO para progressão)
  getLastWeight: async (usuarioId, exercicioId) => {
    const response = await api.get(`/treino/ultima-carga/${usuarioId}/${exercicioId}`);
    return response.data;
  },

  // Criar sessão de treino
  createSession: async (data) => {
    const response = await api.post('/treino/sessao', data);
    return response.data;
  },

  // Salvar série
  saveSet: async (data) => {
    const response = await api.post('/treino/serie', data);
    return response.data;
  },

  // Finalizar sessão de treino
  finalizarSessao: async (sessaoId, dados) => {
    const response = await api.put(`/treino/sessao/${sessaoId}/finalizar`, dados);
    return response.data;
  },

  // Criar sessão de treino completa
  salvarTreinoConcluido: async (dados) => {
    const response = await api.post('/treino/concluir', dados);
    return response.data;
  },

  // Verificar se treino foi feito hoje
  verificarTreinoHoje: async (usuarioId, rotinaId) => {
    const response = await api.get(`/treino/verificar-hoje/${usuarioId}/${rotinaId}`);
    return response.data;
  },

  // Buscar última sessão de treino
  getUltimaSessao: async (usuarioId, treinoId) => {
    const response = await api.get(`/treino/ultima-sessao/${usuarioId}/${treinoId}`);
    return response.data;
  },

  // Criar novo treino
  criarTreino: async (dados) => {
    const response = await api.post('/treinos', dados);
    return response.data;
  },

  // Buscar detalhes do treino para edição
  getTreinoDetalhes: async (id) => {
    const response = await api.get(`/treinos/${id}/detalhes`);
    return response.data;
  },

  // Atualizar treino existente
  atualizarTreino: async (id, dados) => {
    const response = await api.put(`/treinos/${id}`, dados);
    return response.data;
  },
};

// =====================================================
// Serviços de Nutrição
// =====================================================

export const nutricaoService = {
  // Buscar resumo nutricional do dia
  getResumo: async (usuarioId, data) => {
    const response = await api.get(`/nutricao/resumo/${usuarioId}/${data}`);
    return response.data;
  },

  // Buscar refeições do dia
  getRefeicoes: async (usuarioId, data) => {
    const response = await api.get(`/nutricao/refeicoes/${usuarioId}/${data}`);
    return response.data;
  },

  // Marcar refeição como concluída/não concluída
  toggleRefeicao: async (refeicaoId, concluido) => {
    const response = await api.put(`/nutricao/refeicoes/${refeicaoId}/concluir`, { concluido });
    return response.data;
  },

  // Criar nova refeição
  criarRefeicao: async (dados) => {
    const response = await api.post('/nutricao/refeicoes', dados);
    return response.data;
  },

  // Registrar hidratação
  registrarHidratacao: async (dados) => {
    const response = await api.post('/nutricao/hidratacao', dados);
    return response.data;
  },
};

// =====================================================
// Serviços de Dieta
// =====================================================

export const mealService = {
  // Buscar refeições do dia
  getMealsByDate: async (usuarioId, data) => {
    const response = await api.get(`/refeicao/registro/${usuarioId}/${data}`);
    return response.data;
  },

  // Registrar refeição
  logMeal: async (data) => {
    const response = await api.post('/refeicao/registro', data);
    return response.data;
  },

  // Atualizar status (checkbox)
  updateMealStatus: async (id, concluido) => {
    const response = await api.put(`/refeicao/registro/${id}`, { concluido });
    return response.data;
  },
};

// =====================================================
// Serviços de Rotina
// =====================================================

export const routineService = {
  // Buscar rotina do dia
  getByDate: async (usuarioId, data) => {
    const response = await api.get(`/rotina/${usuarioId}/${data}`);
    return response.data;
  },
};
