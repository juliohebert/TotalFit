import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

function Diet() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }
  }, [location]);

  // Dados mockados (posteriormente virão do backend)
  const [dietData, setDietData] = useState({
    caloriasMeta: 2400,
    caloriasConsumidas: 1250,
    macros: {
      proteina: { consumido: 85, meta: 180 },
      carboidratos: { consumido: 120, meta: 250 },
      gorduras: { consumido: 35, meta: 70 }
    },
    refeicoes: [
      {
        id: 1,
        nome: 'Café da Manhã',
        horario: '07:30',
        meta: 600,
        consumido: 450,
        icon: 'bakery_dining',
        cor: 'orange',
        alimentos: [
          { nome: 'Ovos Mexidos', quantidade: '3 unidades grandes', calorias: 210, proteina: 18, carb: 2, gordura: 15 },
          { nome: 'Pão Integral', quantidade: '2 fatias (50g)', calorias: 130, proteina: 6, carb: 24, gordura: 2 },
          { nome: 'Café Preto', quantidade: '200ml • Sem açúcar', calorias: 5, proteina: 0, carb: 1, gordura: 0 }
        ]
      },
      {
        id: 2,
        nome: 'Almoço',
        horario: '12:30',
        meta: 800,
        consumido: 600,
        icon: 'restaurant',
        cor: 'blue',
        alimentos: [
          { nome: 'Peito de Frango Grelhado', quantidade: '150g', calorias: 240, proteina: 45, carb: 0, gordura: 5 },
          { nome: 'Arroz Branco', quantidade: '150g (Cozido)', calorias: 195, proteina: 4, carb: 42, gordura: 0 }
        ]
      },
      {
        id: 3,
        nome: 'Lanche da Tarde',
        horario: '16:00',
        meta: 300,
        consumido: 200,
        icon: 'egg_alt',
        cor: 'yellow',
        alimentos: [
          { nome: 'Iogurte Natural', quantidade: '170g', calorias: 100, proteina: 6, carb: 8, gordura: 6 },
          { nome: 'Maçã', quantidade: '1 unidade média', calorias: 95, proteina: 0, carb: 25, gordura: 0 }
        ]
      },
      {
        id: 4,
        nome: 'Jantar',
        horario: '20:00',
        meta: 700,
        consumido: 0,
        icon: 'dinner_dining',
        cor: 'indigo',
        alimentos: []
      }
    ]
  });

  const [openMeals, setOpenMeals] = useState([1]); // Café da manhã aberto por padrão

  const toggleMeal = (mealId) => {
    setOpenMeals(prev => 
      prev.includes(mealId) 
        ? prev.filter(id => id !== mealId)
        : [...prev, mealId]
    );
  };

  const handleAddFood = (mealId) => {
    navigate('/dieta/adicionar', { state: { mealId } });
  };

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const caloriasRestantes = dietData.caloriasMeta - dietData.caloriasConsumidas;
  const percentualCalorias = (dietData.caloriasConsumidas / dietData.caloriasMeta) * 100;

  const getCorClass = (cor) => {
    const cores = {
      orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    };
    return cores[cor] || cores.orange;
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

        {/* Header */}
        <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-50 border-b border-border-color shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center justify-between w-full sm:w-auto gap-3">
              <button 
                aria-label="Menu" 
                className="flex items-center justify-center size-10 rounded-full hover:bg-slate-700 text-text-main transition-colors lg:hidden"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <h1 className="text-xl font-bold tracking-tight text-white">Minha Dieta</h1>
              <div className="w-10 lg:hidden"></div>
            </div>

            {/* Date Selector */}
            <div className="flex items-center bg-slate-900 rounded-xl border border-slate-700 p-1">
              <button 
                onClick={handlePreviousDay}
                className="p-2 hover:text-primary hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <div className="flex flex-col items-center px-4 w-32 cursor-pointer">
                <span className="text-xs font-bold text-primary uppercase">
                  {isToday(selectedDate) ? 'Hoje' : ''}
                </span>
                <span className="text-sm font-bold text-white">{formatDate(selectedDate)}</span>
              </div>
              <button 
                onClick={handleNextDay}
                className="p-2 hover:text-primary hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>

            <div className="hidden sm:block w-10"></div>
          </div>
        </header>

        <div className="w-full max-w-5xl mx-auto p-4 lg:p-8 space-y-8 pb-24">
          {/* Summary Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Calorias Card */}
            <div className="bg-surface rounded-2xl shadow-sm border border-border-color p-6 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-8xl text-primary">local_fire_department</span>
              </div>
              <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-primary">local_fire_department</span>
                Calorias
              </h2>
              <div className="flex items-end gap-2 mb-2 z-10">
                <span className="text-4xl font-bold text-white">{dietData.caloriasConsumidas.toLocaleString()}</span>
                <span className="text-sm font-bold text-text-secondary mb-1.5">/ {dietData.caloriasMeta.toLocaleString()} kcal</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3 mb-2 z-10 overflow-hidden border border-slate-700">
                <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${Math.min(percentualCalorias, 100)}%` }}></div>
              </div>
              <p className="text-xs text-right text-primary font-bold z-10">
                Restam {caloriasRestantes.toLocaleString()} kcal
              </p>
            </div>

            {/* Macronutrientes Card */}
            <div className="bg-surface rounded-2xl shadow-sm border border-border-color p-6 flex flex-col justify-between relative overflow-hidden">
              <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-primary">pie_chart</span>
                Macronutrientes
              </h2>
              <div className="space-y-4 z-10">
                {/* Proteína */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-white">Proteína</span>
                    <span className="text-primary">
                      {dietData.macros.proteina.consumido}g / {dietData.macros.proteina.meta}g
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-700">
                    <div 
                      className="bg-blue-400 h-2 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.5)] transition-all" 
                      style={{ width: `${(dietData.macros.proteina.consumido / dietData.macros.proteina.meta) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Carboidratos */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-white">Carboidratos</span>
                    <span className="text-primary">
                      {dietData.macros.carboidratos.consumido}g / {dietData.macros.carboidratos.meta}g
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-700">
                    <div 
                      className="bg-orange-400 h-2 rounded-full shadow-[0_0_10px_rgba(251,146,60,0.5)] transition-all" 
                      style={{ width: `${(dietData.macros.carboidratos.consumido / dietData.macros.carboidratos.meta) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Gorduras */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-white">Gorduras</span>
                    <span className="text-primary">
                      {dietData.macros.gorduras.consumido}g / {dietData.macros.gorduras.meta}g
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-700">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)] transition-all" 
                      style={{ width: `${(dietData.macros.gorduras.consumido / dietData.macros.gorduras.meta) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Refeições */}
          <section className="space-y-4">
            {dietData.refeicoes.map((refeicao) => {
              const isOpen = openMeals.includes(refeicao.id);
              
              return (
                <div 
                  key={refeicao.id}
                  className="bg-surface rounded-2xl border border-border-color shadow-sm overflow-hidden"
                >
                  {/* Header */}
                  <button
                    onClick={() => toggleMeal(refeicao.id)}
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`size-10 rounded-lg flex items-center justify-center border ${getCorClass(refeicao.cor)}`}>
                        <span className="material-symbols-outlined">{refeicao.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{refeicao.nome}</h3>
                        <p className="text-xs text-text-secondary font-medium">
                          {refeicao.horario} • Meta: {refeicao.meta} kcal
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-base font-bold ${refeicao.consumido > 0 ? 'text-primary' : 'text-text-secondary'}`}>
                        {refeicao.consumido} kcal
                      </span>
                      <span className={`material-symbols-outlined text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </div>
                  </button>

                  {/* Content */}
                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-700/50 bg-slate-800/50 animate-in slide-in-from-top duration-300">
                      {refeicao.alimentos.length > 0 ? (
                        <div className="space-y-3 mb-4">
                          {refeicao.alimentos.map((alimento, index) => (
                            <div 
                              key={index}
                              className="flex justify-between items-start py-2 border-b border-slate-700/50 last:border-0"
                            >
                              <div>
                                <p className="text-sm font-bold text-white">{alimento.nome}</p>
                                <p className="text-xs text-text-secondary">{alimento.quantidade}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-white">{alimento.calorias} kcal</p>
                                <p className="text-[10px] text-text-secondary">
                                  P:{alimento.proteina}g C:{alimento.carb}g G:{alimento.gordura}g
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-text-secondary text-sm mb-4">
                          Nenhum alimento registrado ainda.
                        </div>
                      )}

                      <button 
                        onClick={() => handleAddFood(refeicao.id)}
                        className="w-full py-3 rounded-xl border border-dashed border-primary/30 hover:border-primary bg-primary/10 hover:bg-primary/20 text-primary text-sm font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-lg">add</span>
                        Adicionar Alimento
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        </div>

        {/* Floating Add Button (Mobile) */}
        <button 
          aria-label="Adicionar Refeição" 
          className="fixed bottom-20 right-6 lg:hidden z-40 bg-primary hover:bg-primary-hover text-slate-900 rounded-2xl p-4 shadow-lg shadow-primary/30 transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </main>

      <MobileNav />
    </div>
  );
}

export default Diet;
