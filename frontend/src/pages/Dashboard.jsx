import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import DaySelector from '../components/DaySelector';
import CaloriesCard from '../components/CaloriesCard';
import WorkoutCard from '../components/WorkoutCard';
import MealsCard from '../components/MealsCard';

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshWorkout, setRefreshWorkout] = useState(0);
  const [showHidratacaoModal, setShowHidratacaoModal] = useState(false);
  const [refreshCalories, setRefreshCalories] = useState(0);

  useEffect(() => {
    if (location.state?.message) {
      setShowSuccessMessage(true);
      // Forçar refresh do WorkoutCard quando voltar de treino concluído
      if (location.state?.treinoConcluido) {
        setRefreshWorkout(prev => prev + 1);
      }
      // Limpar mensagem após 3 segundos
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }
  }, [location]);

  const handleRegister = () => {
    setShowHidratacaoModal(true);
  };

  const handleCreateWorkout = () => {
    navigate('/treinos/novo');
  };

  const handleHidratacaoAdded = () => {
    setRefreshCalories(prev => prev + 1);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />

      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
        {/* Success Toast */}
        {showSuccessMessage && (
          <div className="fixed top-4 right-4 z-50 bg-primary text-slate-900 px-6 py-4 rounded-xl shadow-2xl shadow-primary/50 flex items-center gap-3 animate-in slide-in-from-top duration-300">
            <span className="material-symbols-outlined text-2xl">check_circle</span>
            <span className="font-bold">{location.state?.message}</span>
          </div>
        )}

        <div className="max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col gap-8">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                O Dia de Hoje
              </h2>
              <p className="text-text-secondary text-base">
                Visão geral das suas metas e atividades.
              </p>
            </div>

            <div className="flex gap-3">
              <button className="size-10 flex items-center justify-center rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border border-slate-800"></span>
              </button>
              <button
                onClick={handleRegister}
                className="h-10 px-4 flex items-center justify-center rounded-full bg-primary text-slate-900 font-bold text-sm hover:bg-primary-hover transition-colors gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Registrar
              </button>
            </div>
          </header>

          {/* Day Selector */}
          <DaySelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Calories & Hydration */}
            <div className="md:col-span-5 lg:col-span-4">
              <CaloriesCard selectedDate={selectedDate} key={refreshCalories} />
            </div>

            {/* Right Column: Workout & Meals */}
            <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-6">
              <WorkoutCard selectedDate={selectedDate} key={refreshWorkout} />
              <MealsCard selectedDate={selectedDate} />
            </div>
          </div>

          {/* Bottom Padding for Mobile Nav */}
          <div className="h-8 lg:hidden"></div>
        </div>
      </main>

      <MobileNav />

      {/* Modal de Hidratação */}
      {showHidratacaoModal && (
        <HidratacaoModal 
          selectedDate={selectedDate}
          onClose={() => setShowHidratacaoModal(false)}
          onSuccess={handleHidratacaoAdded}
        />
      )}
    </div>
  );
}

// Componente Modal de Hidratação
function HidratacaoModal({ selectedDate, onClose, onSuccess }) {
  const [quantidade, setQuantidade] = useState(250);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const opcoes = [100, 200, 250, 300, 500];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (quantidade <= 0) {
      setError('Quantidade deve ser maior que zero');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userStr = localStorage.getItem('totalfit_user');
      const user = userStr ? JSON.parse(userStr) : { id: 1 };
      
      const dataFormatada = selectedDate.toISOString().split('T')[0];
      const horario = new Date().toTimeString().slice(0, 5);

      const { nutricaoService } = await import('../services/api');
      
      await nutricaoService.registrarHidratacao({
        usuario_id: user.id,
        data: dataFormatada,
        quantidade: quantidade,
        horario: horario
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao registrar hidratação:', error);
      setError('Erro ao registrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface rounded-2xl p-6 max-w-md w-full mx-4 border border-border-color animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-500 text-2xl">water_drop</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Registrar Hidratação</h3>
              <p className="text-text-secondary text-sm">Adicione água consumida</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-10 flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors text-text-secondary"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Opções Rápidas */}
          <div>
            <label className="text-sm text-text-secondary mb-3 block">Quantidade (ml)</label>
            <div className="grid grid-cols-5 gap-2">
              {opcoes.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setQuantidade(opt)}
                  className={`py-3 rounded-xl font-bold text-sm transition-all ${
                    quantidade === opt
                      ? 'bg-blue-500 text-white scale-105'
                      : 'bg-slate-800 text-text-secondary hover:bg-slate-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Customizado */}
          <div>
            <label className="text-sm text-text-secondary mb-2 block">Ou digite:</label>
            <input
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(parseInt(e.target.value) || 0)}
              min="0"
              step="50"
              className="w-full bg-slate-800 border border-border-color rounded-xl px-4 py-3 text-white text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Salvando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Dashboard;
