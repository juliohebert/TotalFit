// Configurações da aplicação
export const config = {
  // URL da API (ajustar conforme ambiente)
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  
  // Configurações de autenticação
  auth: {
    tokenKey: 'totalfit_token',
    userKey: 'totalfit_user',
  },
  
  // Configurações de treino
  workout: {
    diasSemana: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    duracaoPadrao: 45, // minutos
  },
  
  // Configurações de dieta
  diet: {
    caloriasPadrao: 2400,
    proteinaPadrao: 180, // gramas
    carboidratosPadrao: 250, // gramas
    gordurasPadrao: 70, // gramas
  },
  
  // Validações
  validations: {
    nomeMin: 3,
    nomeMax: 100,
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    senhaMin: 6,
    pesoMin: 30,
    pesoMax: 300,
    alturaMin: 100,
    alturaMax: 250,
  },
};

// Helper para formatar datas
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0]; // YYYY-MM-DD
};

// Helper para obter dia da semana
export const getDiaSemana = (date = new Date()) => {
  return config.workout.diasSemana[date.getDay()];
};

// Helper para validar email
export const isValidEmail = (email) => {
  return config.validations.emailRegex.test(email);
};

// Helper para validar senha
export const isValidPassword = (password) => {
  return password && password.length >= config.validations.senhaMin;
};

// Helper para formatar número com separador de milhares
export const formatNumber = (num) => {
  return num?.toLocaleString('pt-BR') || '0';
};

// Helper para calcular IMC
export const calculateIMC = (peso, altura) => {
  if (!peso || !altura) return 0;
  const alturaMetros = altura / 100;
  return (peso / (alturaMetros * alturaMetros)).toFixed(1);
};

// Helper para classificar IMC
export const classifyIMC = (imc) => {
  if (imc < 18.5) return { label: 'Abaixo do peso', color: 'text-blue-400' };
  if (imc < 25) return { label: 'Peso normal', color: 'text-primary' };
  if (imc < 30) return { label: 'Sobrepeso', color: 'text-yellow-400' };
  return { label: 'Obesidade', color: 'text-red-400' };
};
