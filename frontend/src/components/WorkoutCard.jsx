import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { workoutService } from '../services/api';
import { formatDate, getDiaSemana } from '../utils/config';

function WorkoutCard({ selectedDate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [treinoConcluido, setTreinoConcluido] = useState(false);
  const [treinoEmAndamento, setTreinoEmAndamento] = useState(false);

  useEffect(() => {
    buscarTreinoDoDia();
  }, [selectedDate, location]);

  const buscarTreinoDoDia = async () => {
    setLoading(true);
    try {
      // Buscar usuário do localStorage (temporário até implementar AuthContext completo)
      const userStr = localStorage.getItem('totalfit_user');
      const user = userStr ? JSON.parse(userStr) : { id: 1 }; // Fallback para usuário 1
      
      const dataParaBuscar = selectedDate || new Date();
      const hoje = formatDate(dataParaBuscar);
      const diaSemana = getDiaSemana(dataParaBuscar);

      console.log('Buscando treino para:', { usuarioId: user.id, data: hoje, diaSemana });

      // Buscar rotina do dia
      const response = await workoutService.getTreinoDoDia(user.id, hoje);
      
      console.log('Resposta da API:', response);

      if (response && response.id) {
        setWorkout({
          id: response.id,
          title: response.nome_treino || 'Treino do Dia',
          description: `${diaSemana} - Sua rotina de treino programada para hoje`,
          type: 'TREINO',
          duration: '45 min',
          image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
        });

        // Verificar se o treino foi concluído hoje
        try {
          console.log('🔍 Verificando se treino foi concluído. user.id:', user.id, 'rotina.id:', response.id);
          const verificacao = await workoutService.verificarTreinoHoje(user.id, response.id);
          console.log('✅ Resultado da verificação:', verificacao);
          console.log('🎯 Treino concluído?', verificacao?.realizado);
          setTreinoConcluido(verificacao?.realizado || false);
          
          // Verificar se há treino em andamento (sessão iniciada mas não finalizada)
          const sessaoKey = `treino_sessao_${response.id}`;
          const sessaoEmAndamento = localStorage.getItem(sessaoKey);
          setTreinoEmAndamento(!!sessaoEmAndamento && !verificacao?.realizado);
        } catch (error) {
          console.error('❌ Erro ao verificar treino:', error);
          setTreinoConcluido(false);
          setTreinoEmAndamento(false);
        }
      } else {
        // Sem treino programado para hoje
        throw new Error('Nenhum treino encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar treino:', error);
      // Mostrar card padrão se não houver treino
      setWorkout({
        title: 'Nenhum Treino Hoje',
        description: 'Você não tem treinos programados para hoje. Que tal criar um novo treino?',
        type: 'DESCANSO',
        duration: '--',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = () => {
    if (workout?.id) {
      // Navegar para tela de execução com o ID da rotina
      navigate(`/treino/executar/${workout.id}`);
    } else {
      // Se não houver treino, navegar para criar novo
      navigate('/treinos/novo');
    }
  };

  const handleInfo = () => {
    if (workout?.id) {
      navigate(`/treino/detalhes/${workout.id}`);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-surface rounded-2xl p-8 shadow-sm border border-border-color flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  console.log('🎨 Renderizando WorkoutCard. treinoConcluido:', treinoConcluido, 'workout:', workout);

  return (
    <div className="w-full bg-surface rounded-2xl p-1 shadow-sm border border-border-color">
      <div className="flex flex-col md:flex-row gap-4 bg-slate-900 rounded-xl p-4 md:p-0 overflow-hidden">
        {/* Imagem */}
        <div
          className="w-full md:w-56 h-48 md:h-auto bg-cover bg-center rounded-xl md:rounded-l-xl md:rounded-r-none relative group"
          style={{ backgroundImage: `url("${workout.image}")` }}
        >
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
          <div className="absolute bottom-3 left-3 flex gap-2">
            <div className="bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-md border border-border-color">
              <span className="text-primary text-xs font-bold uppercase">Hoje</span>
            </div>
            {treinoConcluido && (
              <div className="bg-primary/90 backdrop-blur-sm px-2 py-1 rounded-md border border-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-slate-900 text-xs">check_circle</span>
                <span className="text-slate-900 text-xs font-bold uppercase">Concluído</span>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 flex flex-col justify-center p-2 md:pr-6 md:py-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-text-secondary text-xs font-semibold bg-slate-700 px-2 py-0.5 rounded uppercase tracking-wide">
              {workout.type}
            </span>
            <span className="text-text-secondary text-xs font-semibold bg-slate-700 px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {workout.duration}
            </span>
          </div>

          <h3 className="text-2xl font-black text-white mb-1">{workout.title}</h3>
          <p className="text-text-secondary text-sm mb-6 line-clamp-2">{workout.description}</p>

          {treinoConcluido ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-xl p-4">
                <div className="size-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">check_circle</span>
                </div>
                <div className="flex-1">
                  <p className="text-primary font-black text-sm">Treino Concluído!</p>
                  <p className="text-text-secondary text-xs">Parabéns pelo esforço de hoje 🎉</p>
                </div>
              </div>
              <button
                onClick={handleStartWorkout}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined">refresh</span>
                Refazer Treino
              </button>
            </div>
          ) : treinoEmAndamento ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                <div className="size-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-400 text-2xl animate-pulse">schedule</span>
                </div>
                <div className="flex-1">
                  <p className="text-orange-400 font-black text-sm">Treino em Andamento</p>
                  <p className="text-text-secondary text-xs">Continue de onde parou</p>
                </div>
              </div>
              <button
                onClick={handleStartWorkout}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined">play_arrow</span>
                Continuar Treino
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 mt-auto">
              <button
                onClick={handleStartWorkout}
                className="flex-1 bg-white text-slate-900 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
              >
                <span className="material-symbols-outlined fill-1">play_arrow</span>
                Iniciar Treino
              </button>
              <button
                onClick={handleInfo}
                className="size-11 flex items-center justify-center rounded-xl border border-border-color text-text-secondary hover:text-white hover:border-white transition-colors"
              >
                <span className="material-symbols-outlined">info</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkoutCard;
