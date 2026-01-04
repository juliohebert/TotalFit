import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workoutService } from '../services/api';

function WorkoutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkoutDetail();
  }, [id]);

  const fetchWorkoutDetail = async () => {
    try {
      setLoading(true);
      
      // Buscar rotina
      const rotinaData = await workoutService.getTreinoById(id);
      setWorkout(rotinaData);

      // Buscar exercícios da rotina
      const exerciciosData = await workoutService.getExerciciosTreino(id);
      setExercises(exerciciosData);
    } catch (error) {
      console.error('Erro ao buscar detalhes do treino:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = () => {
    navigate(`/treino/executar/${id}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-primary animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-4">
        <span className="material-symbols-outlined text-6xl text-text-secondary">
          fitness_center
        </span>
        <h2 className="text-2xl font-bold text-white">Treino não encontrado</h2>
        <button
          onClick={handleBack}
          className="bg-primary hover:bg-primary-hover text-slate-900 font-bold py-3 px-6 rounded-xl transition-colors"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-main">
      {/* Header */}
      <header className="bg-surface border-b border-border-color sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="size-10 flex items-center justify-center rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl font-black text-white">Detalhes do Treino</h1>
          <div className="size-10"></div> {/* Spacer */}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-4 pb-24 space-y-6">
        {/* Workout Info Card */}
        <div className="bg-surface rounded-2xl p-6 border border-border-color">
          <div className="flex items-start gap-4">
            <div className="size-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-3xl">fitness_center</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-white mb-2">
                {workout.nome_treino}
              </h2>
              {workout.descricao && (
                <p className="text-text-secondary mb-4">{workout.descricao}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-primary text-sm">
                    format_list_numbered
                  </span>
                  <span className="text-white text-sm font-bold">
                    {exercises.length} exercícios
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-primary text-sm">timer</span>
                  <span className="text-white text-sm font-bold">45-60 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exercise List */}
        <div className="space-y-3">
          <h3 className="text-white font-black text-lg">Exercícios</h3>
          {exercises.length === 0 ? (
            <div className="bg-surface rounded-2xl p-8 border border-border-color text-center">
              <span className="material-symbols-outlined text-4xl text-text-secondary mb-2">
                fitness_center
              </span>
              <p className="text-text-secondary">Nenhum exercício cadastrado</p>
            </div>
          ) : (
            exercises.map((exercise, index) => (
              <div
                key={exercise.id || index}
                className="bg-surface rounded-2xl p-4 border border-border-color hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Order Number */}
                  <div className="size-10 bg-slate-800 rounded-xl flex items-center justify-center text-primary font-black flex-shrink-0">
                    {exercise.ordem || index + 1}
                  </div>

                  {/* Exercise Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold truncate">
                      {exercise.nome || exercise.exercicio_nome}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-slate-700 text-primary rounded-lg font-bold">
                        {exercise.grupo_muscular}
                      </span>
                      {exercise.series_planejadas && (
                        <span className="text-xs text-text-secondary">
                          {exercise.series_planejadas} séries
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  <span className="material-symbols-outlined text-text-secondary">
                    chevron_right
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border-color p-4 z-10">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleStartWorkout}
            className="w-full bg-primary hover:bg-primary-hover text-slate-900 font-black py-4 rounded-2xl transition-all hover:shadow-[0_0_20px_rgba(163,230,53,0.4)] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-2xl">play_circle</span>
            Iniciar Treino
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorkoutDetail;
