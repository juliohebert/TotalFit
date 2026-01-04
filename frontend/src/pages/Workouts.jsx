import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutService } from '../services/api';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

function Workouts() {
  const navigate = useNavigate();
  const [activeWorkouts, setActiveWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [treinoDoDia, setTreinoDoDia] = useState(null);
  const [outrosTreinos, setOutrosTreinos] = useState([]);

  useEffect(() => {
    buscarTreinos();
  }, []);

  const buscarTreinos = async () => {
    try {
      const userStr = localStorage.getItem('totalfit_user');
      const user = userStr ? JSON.parse(userStr) : { id: 1 };

      // Pegar dia da semana atual
      const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const hoje = diasSemana[new Date().getDay()];

      // Buscar treinos do usuário
      const treinos = await workoutService.listarTreinos(user.id);
      
      // Verificar quais foram concluídos hoje
      const treinosComStatus = await Promise.all(
        treinos.map(async (treino) => {
          try {
            const verificacao = await workoutService.verificarTreinoHoje(user.id, treino.id);
            return {
              ...treino,
              concluido: verificacao?.realizado || false
            };
          } catch (error) {
            return {
              ...treino,
              concluido: false
            };
          }
        })
      );

      // Separar treino do dia dos outros
      const treinoHoje = treinosComStatus.find(t => t.dia_semana === hoje);
      const outrosTreinosLista = treinosComStatus.filter(t => t.dia_semana !== hoje);

      setTreinoDoDia(treinoHoje || null);
      setOutrosTreinos(outrosTreinosLista);
      setActiveWorkouts(treinosComStatus);
    } catch (error) {
      console.error('Erro ao buscar treinos:', error);
    } finally {
      setLoading(false);
    }
  };

  const exploreWorkouts = [
    {
      id: 4,
      nome: 'Yoga Matinal',
      descricao: 'Melhore a flexibilidade e comece o dia com energia.',
      nivel: 'Iniciante',
      duracao: '20 min',
      icon: 'self_improvement',
      gradient: 'from-indigo-900 to-slate-900',
      iconColor: 'text-indigo-400',
      bloqueado: false
    },
    {
      id: 5,
      nome: 'Powerlifting Base',
      descricao: 'Fundamentos de Squat, Bench e Deadlift.',
      nivel: 'Avançado',
      duracao: '90 min',
      icon: 'monitor_weight',
      gradient: 'from-rose-900 to-slate-900',
      iconColor: 'text-rose-400',
      bloqueado: false
    },
    {
      id: 6,
      nome: 'Natação Interm.',
      descricao: 'Treino focado em resistência cardiovascular.',
      nivel: 'Médio',
      duracao: '45 min',
      icon: 'pool',
      gradient: 'from-cyan-900 to-slate-900',
      iconColor: 'text-cyan-400',
      bloqueado: false
    }
  ];

  const handleCreateWorkout = () => {
    navigate('/treinos/novo');
  };

  const handleWorkoutClick = (workoutId) => {
    navigate(`/treino/executar/${workoutId}`);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />

      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
        {/* Header */}
        <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-700 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button 
                aria-label="Menu" 
                className="flex items-center justify-center size-10 rounded-full hover:bg-slate-700 text-text-main transition-colors lg:hidden"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <h1 className="text-xl font-bold tracking-tight text-white">Meus Treinos</h1>
            </div>
            <button 
              onClick={handleCreateWorkout}
              className="hidden md:flex items-center gap-2 bg-primary hover:bg-primary-hover text-slate-900 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95"
            >
              <span className="material-symbols-outlined">add</span>
              Criar Novo Treino
            </button>
          </div>
        </header>

        <div className="w-full max-w-6xl mx-auto p-4 lg:p-8 space-y-10 pb-24">
          {/* Treino do Dia Section */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
            </div>
          ) : treinoDoDia ? (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">today</span>
                  Treino de Hoje
                </h2>
              </div>

              <button
                onClick={() => handleWorkoutClick(treinoDoDia.id)}
                className="w-full group flex flex-col bg-gradient-to-br from-primary/10 to-slate-800 rounded-2xl border-2 border-primary p-6 hover:border-primary-hover hover:shadow-xl hover:shadow-primary/20 transition-all relative overflow-hidden text-left"
              >
                {/* Badge de Concluído */}
                {treinoDoDia.concluido && (
                  <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-primary flex items-center gap-1.5 z-10">
                    <span className="material-symbols-outlined text-slate-900 text-sm">check_circle</span>
                    <span className="text-slate-900 text-xs font-bold uppercase">Concluído</span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-6">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                      {treinoDoDia.nome_treino}
                    </h3>
                    <p className="text-base text-white/90 font-medium leading-relaxed">
                      Treino programado para {treinoDoDia.dia_semana}
                    </p>
                  </div>
                  <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary shrink-0 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-2xl">fitness_center</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-primary/30 flex items-center justify-between">
                  <span className="text-sm font-bold text-white/70">Dia da Semana</span>
                  <span className="text-sm font-bold text-primary">{treinoDoDia.dia_semana}</span>
                </div>

                {!treinoDoDia.concluido && (
                  <div className="mt-4 flex items-center gap-2 text-primary text-sm font-bold">
                    <span className="material-symbols-outlined text-xl">play_arrow</span>
                    <span>Iniciar Treino</span>
                  </div>
                )}
              </button>
            </section>
          ) : (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">today</span>
                  Treino de Hoje
                </h2>
              </div>
              <div className="bg-slate-800/50 rounded-2xl border border-dashed border-slate-700 p-8 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-600 mb-4 block">event_busy</span>
                <p className="text-text-secondary text-sm">Nenhum treino agendado para hoje</p>
              </div>
            </section>
          )}

          {/* Outros Treinos Section */}
          {outrosTreinos.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">calendar_month</span>
                  Outros Treinos
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {outrosTreinos.map((workout) => (
                  <button
                    key={workout.id}
                    onClick={() => handleWorkoutClick(workout.id)}
                    className="group flex flex-col bg-slate-800 rounded-2xl border border-border-color p-6 hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all relative overflow-hidden text-left"
                  >
                    {/* Badge de Concluído */}
                    {workout.concluido && (
                      <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-primary flex items-center gap-1.5 z-10">
                        <span className="material-symbols-outlined text-slate-900 text-sm">check_circle</span>
                        <span className="text-slate-900 text-xs font-bold uppercase">Concluído Hoje</span>
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-2">
                      <div className="pr-6">
                        <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-primary transition-colors">
                          {workout.nome_treino}
                        </h3>
                        <p className="text-sm text-white/80 font-medium leading-relaxed">
                          Treino de {workout.dia_semana}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-primary text-2xl shrink-0 group-hover:translate-x-1 transition-transform">
                        chevron_right
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <div className="flex justify-between items-center text-xs font-bold text-text-secondary">
                        <span>Dia da Semana</span>
                        <span className={workout.concluido ? 'text-primary' : 'text-slate-400'}>
                          {workout.dia_semana}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Active Workouts Section - só mostra se não houver treino do dia */}
          {!treinoDoDia && activeWorkouts.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">fitness_center</span>
                  Todos os Treinos
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {activeWorkouts.map((workout) => (
                  <button
                    key={workout.id}
                    onClick={() => handleWorkoutClick(workout.id)}
                    className="group flex flex-col bg-slate-800 rounded-2xl border border-border-color p-6 hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all relative overflow-hidden text-left"
                  >
                    {workout.concluido && (
                      <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-primary flex items-center gap-1.5 z-10">
                        <span className="material-symbols-outlined text-slate-900 text-sm">check_circle</span>
                        <span className="text-slate-900 text-xs font-bold uppercase">Concluído Hoje</span>
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-2">
                      <div className="pr-6">
                        <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-primary transition-colors">
                          {workout.nome_treino}
                        </h3>
                        <p className="text-sm text-white/80 font-medium leading-relaxed">
                          Treino de {workout.dia_semana}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-primary text-2xl shrink-0 group-hover:translate-x-1 transition-transform">
                        chevron_right
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <div className="flex justify-between items-center text-xs font-bold text-text-secondary">
                        <span>Dia da Semana</span>
                        <span className={workout.concluido ? 'text-primary' : 'text-slate-400'}>
                          {workout.dia_semana}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Mensagem quando não tem nenhum treino */}
          {!loading && activeWorkouts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <span className="material-symbols-outlined text-6xl text-text-secondary">fitness_center</span>
              <p className="text-text-secondary">Você ainda não tem treinos cadastrados</p>
              <button 
                onClick={handleCreateWorkout}
                className="bg-primary hover:bg-primary-hover text-slate-900 font-bold py-3 px-6 rounded-xl transition-colors"
              >
                Criar Primeiro Treino
              </button>
            </div>
          )}

          {/* Explore Workouts Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">explore</span>
                Explorar Treinos
              </h2>
              <div className="flex gap-2">
                <button className="size-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button className="size-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {exploreWorkouts.map((workout) => (
                <article 
                  key={workout.id}
                  className="bg-surface rounded-xl border border-border-color overflow-hidden group cursor-pointer hover:border-primary transition-colors"
                >
                  <div className={`h-32 bg-gradient-to-br ${workout.gradient} relative p-4 flex flex-col justify-end`}>
                    {workout.bloqueado && (
                      <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm p-1.5 rounded-lg">
                        <span className="material-symbols-outlined text-white text-sm">lock_open</span>
                      </div>
                    )}
                    <span className={`material-symbols-outlined text-4xl ${workout.iconColor} mb-2 group-hover:scale-110 transition-transform origin-bottom-left`}>
                      {workout.icon}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white mb-1 group-hover:text-primary transition-colors">
                      {workout.nome}
                    </h3>
                    <p className="text-xs text-text-secondary mb-3">{workout.descricao}</p>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                      <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">
                        {workout.nivel}
                      </span>
                      <span>{workout.duracao}</span>
                    </div>
                  </div>
                </article>
              ))}

              {/* Create Custom Card */}
              <button
                onClick={handleCreateWorkout}
                className="bg-slate-800/30 rounded-xl border border-dashed border-slate-700 flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-slate-800 hover:border-primary/50 transition-all group h-full"
              >
                <div className="size-12 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-slate-900 group-hover:border-primary transition-colors text-slate-400">
                  <span className="material-symbols-outlined">add</span>
                </div>
                <h3 className="font-bold text-white text-sm mb-1">Criar Personalizado</h3>
                <p className="text-xs text-text-secondary">Monte seu treino do zero</p>
              </button>
            </div>
          </section>
        </div>

        {/* Floating Add Button (Mobile) */}
        <button 
          onClick={handleCreateWorkout}
          aria-label="Criar Novo Treino" 
          className="fixed bottom-20 right-6 md:hidden z-40 bg-primary hover:bg-primary-hover text-slate-900 rounded-2xl p-4 shadow-lg shadow-primary/30 transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </main>

      <MobileNav />
    </div>
  );
}

export default Workouts;
