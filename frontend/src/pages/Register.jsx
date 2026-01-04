import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validações
      if (!formData.nome || !formData.email || !formData.senha || !formData.confirmarSenha) {
        setError('Por favor, preencha todos os campos');
        setLoading(false);
        return;
      }

      if (formData.senha.length < 6) {
        setError('A senha deve ter no mínimo 6 caracteres');
        setLoading(false);
        return;
      }

      if (formData.senha !== formData.confirmarSenha) {
        setError('As senhas não coincidem');
        setLoading(false);
        return;
      }

      // Chamada para API
      const response = await authService.register(
        formData.nome,
        formData.email,
        formData.senha
      );

      console.log('Cadastro bem-sucedido:', response);
      
      // Após cadastro, faz login automático
      await authService.login(formData.email, formData.senha);
      
      // Redireciona para dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Erro no cadastro:', err);
      setError(err.response?.data?.error || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background font-display text-text-main min-h-screen flex flex-col selection:bg-primary selection:text-slate-900 overflow-hidden relative">
      {/* Background gradient blur effects */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary rounded-full blur-[150px] opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px] opacity-10"></div>
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 w-full">
        <div className="w-full max-w-[480px] flex flex-col gap-6">
          {/* Header */}
          <div className="text-center space-y-2 mb-4">
            <div className="inline-flex items-center gap-2 justify-center mb-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '40px' }}>
                fitness_center
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-white">TotalFit</h1>
            </div>
            <h2 className="text-xl text-text-secondary font-medium">Comece sua jornada fitness hoje!</h2>
          </div>

          {/* Form Container */}
          <div className="bg-surface/80 backdrop-blur-xl border border-border-color rounded-2xl p-6 sm:p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Name Field */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300 ml-1" htmlFor="name">
                  Nome Completo
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-text-secondary group-focus-within:text-primary transition-colors">
                      person
                    </span>
                  </div>
                  <input
                    className="w-full h-14 pl-12 pr-4 bg-surface-input border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    id="nome"
                    name="nome"
                    placeholder="Seu nome completo"
                    type="text"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300 ml-1" htmlFor="email">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-text-secondary group-focus-within:text-primary transition-colors">
                      mail
                    </span>
                  </div>
                  <input
                    className="w-full h-14 pl-12 pr-4 bg-surface-input border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    id="email"
                    name="email"
                    placeholder="seu@email.com"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300 ml-1" htmlFor="password">
                  Senha
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-text-secondary group-focus-within:text-primary transition-colors">
                      lock
                    </span>
                  </div>
                  <input
                    className="w-full h-14 pl-12 pr-12 bg-surface-input border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    id="senha"
                    name="senha"
                    placeholder="Mínimo 6 caracteres"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.senha}
                    onChange={handleChange}
                    required
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-secondary hover:text-white transition-colors cursor-pointer"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300 ml-1" htmlFor="confirmPassword">
                  Confirmar Senha
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-text-secondary group-focus-within:text-primary transition-colors">
                      lock_reset
                    </span>
                  </div>
                  <input
                    className="w-full h-14 pl-12 pr-12 bg-surface-input border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    id="confirmarSenha"
                    name="confirmarSenha"
                    placeholder="Repita sua senha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                    required
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-secondary hover:text-white transition-colors cursor-pointer"
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <span className="material-symbols-outlined">
                      {showConfirmPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                className="mt-4 w-full h-14 bg-primary hover:bg-primary-hover text-background-dark text-lg font-bold rounded-xl transition-all duration-200 transform active:scale-[0.98] neon-shadow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                <span>{loading ? 'Criando conta...' : 'Criar Conta'}</span>
                {!loading && (
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    arrow_forward
                  </span>
                )}
              </button>

              {/* Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-border-dark"></div>
                <span className="flex-shrink-0 mx-4 text-text-secondary text-sm">ou cadastre-se com</span>
                <div className="flex-grow border-t border-border-dark"></div>
              </div>

              {/* Social Register Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  className="h-12 flex items-center justify-center gap-2 bg-surface-input border border-border-dark hover:bg-white/5 rounded-xl text-white font-medium transition-colors"
                  type="button"
                  onClick={() => alert('Cadastro com Google em desenvolvimento')}
                >
                  <img
                    alt="Google"
                    className="w-5 h-5"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeeVO9YYzxhMwQARogwGkSpT4RX0xGqH5ibdAW3gubwCJ9zhf47lxbaT73OwuRPL2hlNCT9S-3z2k2foMEEn80HXv1EySuEiQeL5vFmSJa9HcpvQ3U4I1ujqeNGjBbXGo1yTJ-8AVOXKV1AaxkFuoMkkjHnpfZe378Jhkk6U2Xu2wPsrnzWQWlxuRnlsaq4aakXyCacdIJ_dVBzXV3ngu0y0l1pcM3ysY7-68y8mHtriDCjag6vYQXqfxlb6whuwpv0tUA8rs1m2Q"
                  />
                  <span>Google</span>
                </button>
                <button
                  className="h-12 flex items-center justify-center gap-2 bg-surface-input border border-border-dark hover:bg-white/5 rounded-xl text-white font-medium transition-colors"
                  type="button"
                  onClick={() => alert('Cadastro com Apple em desenvolvimento')}
                >
                  <img
                    alt="Apple"
                    className="w-5 h-5 invert"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6FPzOvkrq7369xUPiPdK4ETU1FF0g1M4WsS_bmiQra_KJJ5tFpVq7A9SJmvbjBu_QnYzIPxWeZX-c0ACidyJlAQP1IhpGH_Rv39Nu3Hm96F2cKQZwfc11w9wq8L6jQ-Rb2n9zAigudUoZHeJlZ_aVucjZzXFz0HybrmuE_-9TxGeIolmJYgf-hVOgJyTXIejj1b-tb3Y8MHm7i3ZIakJYbWwAB9IHtCk6i1VjGFELEFxZGEJbslKgJwoMWMVSFV_qThqPRFqZC3A"
                  />
                  <span>Apple</span>
                </button>
              </div>
            </form>
          </div>

          {/* Login Link */}
          <p className="text-center text-text-secondary">
            Já tem uma conta?
            <Link
              className="text-primary font-bold hover:underline decoration-2 underline-offset-4 ml-1"
              to="/login"
            >
              Faça Login
            </Link>
          </p>

          {/* Feature Icons */}
          <div className="mt-8 flex justify-center gap-8 opacity-40">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-surface-input flex items-center justify-center text-primary border border-border-dark">
                <span className="material-symbols-outlined">monitoring</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-text-secondary">
                Análises
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-surface-input flex items-center justify-center text-primary border border-border-dark">
                <span className="material-symbols-outlined">restaurant</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-text-secondary">
                Dietas
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-surface-input flex items-center justify-center text-primary border border-border-dark">
                <span className="material-symbols-outlined">exercise</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-text-secondary">
                Treinos
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Register;
