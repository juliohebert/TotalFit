import { useState, useEffect } from 'react';
import { nutricaoService } from '../services/api';
import { formatDate } from '../utils/config';

function CaloriesCard({ selectedDate }) {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarDadosNutricionais();
  }, [selectedDate]);

  const buscarDadosNutricionais = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem('totalfit_user');
      const user = userStr ? JSON.parse(userStr) : { id: 1 };
      
      const dataParaBuscar = selectedDate || new Date();
      const data = formatDate(dataParaBuscar);

      const response = await nutricaoService.getResumo(user.id, data);
      setDados(response);
    } catch (error) {
      console.error('Erro ao buscar dados nutricionais:', error);
      // Dados vazios quando há erro ou usuário não configurou metas
      setDados({
        calorias: { consumido: 0, meta: null, restante: null },
        macros: { 
          proteinas: 0, 
          carboidratos: 0, 
          gorduras: 0,
          metas: { proteinas: null, carboidratos: null, gorduras: null }
        },
        hidratacao: { atual: 0, meta: null }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-color flex items-center justify-center h-64">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
        </div>
      </div>
    );
  }

  // Se não tem meta configurada, mostrar estado vazio
  if (!dados.calorias.meta) {
    return (
      <div className="flex flex-col gap-6">
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-color text-center">
          <span className="material-symbols-outlined text-6xl text-text-secondary mb-4 block">restaurant_menu</span>
          <h3 className="text-xl font-bold text-white mb-2">Configure suas metas</h3>
          <p className="text-text-secondary mb-6">Defina suas metas nutricionais no perfil para acompanhar seu progresso</p>
          <button 
            onClick={() => window.location.href = '/perfil'}
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-slate-900 font-bold transition-all inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined">settings</span>
            Ir para Perfil
          </button>
        </div>
      </div>
    );
  }

  const percentage = (dados.calorias.consumido / dados.calorias.meta) * 100;
  const circumference = 2 * Math.PI * 15.9155;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col gap-6">
      {/* Calorias Card */}
      <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-color relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>
        
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h3 className="text-white text-lg font-bold">Calorias Restantes</h3>
            <p className="text-text-secondary text-sm">Resumo diário</p>
          </div>
          <div className="bg-slate-700 p-2 rounded-lg text-primary">
            <span className="material-symbols-outlined">local_fire_department</span>
          </div>
        </div>

        <div className="flex items-center gap-6 relative z-10">
          {/* Circular Progress */}
          <div className="relative size-28 flex-shrink-0">
            <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
              {/* Background Circle */}
              <circle
                className="text-slate-700"
                cx="18"
                cy="18"
                r="15.9155"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              {/* Progress Circle */}
              <circle
                className="text-primary drop-shadow-[0_0_6px_rgba(163,230,53,0.6)] transition-all duration-500"
                cx="18"
                cy="18"
                r="15.9155"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="text-white font-bold text-lg block leading-none">{dados.calorias.restante}</span>
              <span className="text-[10px] text-text-secondary font-medium">kcal rest.</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Consumido</span>
              <span className="text-white font-bold">{dados.calorias.consumido}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-text-secondary">Meta</span>
              <span className="text-white font-bold">{dados.calorias.meta}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5"></div>
          </div>
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-2 mt-6 relative z-10">
          <div className="bg-slate-900 rounded-lg p-2 text-center border border-border-color">
            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Prot</p>
            <p className="text-white font-bold text-sm">{dados.macros.proteinas}g</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-2 text-center border border-border-color">
            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Carb</p>
            <p className="text-white font-bold text-sm">{dados.macros.carboidratos}g</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-2 text-center border border-border-color">
            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Gord</p>
            <p className="text-white font-bold text-sm">{dados.macros.gorduras}g</p>
          </div>
        </div>
      </div>

      {/* Hydration Card */}
      <div className="bg-blue-950 rounded-2xl p-4 flex items-center justify-between border border-blue-900">
        <div className="flex items-center gap-3">
          <div className="bg-blue-900 p-2 rounded-lg text-blue-400">
            <span className="material-symbols-outlined">water_drop</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm">Hidratação</p>
            <p className="text-blue-300 text-xs">{dados.hidratacao.atual}ml / {dados.hidratacao.meta}ml</p>
          </div>
        </div>
        <button className="size-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-400 transition-colors">
          <span className="material-symbols-outlined text-lg">add</span>
        </button>
      </div>
    </div>
  );
}

export default CaloriesCard;
