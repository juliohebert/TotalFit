import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { workoutService } from '../services/api';
import ExerciseSelectModal from '../components/ExerciseSelectModal';

function CreateWorkout() {
  const navigate = useNavigate();
  const { id } = useParams(); // ID do treino para edição
  const isEditing = !!id;
  
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [selectedDay, setSelectedDay] = useState('Segunda');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [exercises, setExercises] = useState([]);

  const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  useEffect(() => {
    if (isEditing) {
      carregarTreino();
    }
  }, [id]);

  const carregarTreino = async () => {
    try {
      setLoadingData(true);
      const treino = await workoutService.getTreinoDetalhes(id);
      
      setWorkoutName(treino.nome_treino);
      setWorkoutDescription(treino.descricao || '');
      setSelectedDay(treino.dia_semana);
      
      // Mapear exercícios
      if (treino.exercicios) {
        setExercises(treino.exercicios.map(ex => ({
          exercicio_id: ex.exercicio_id,
          nome: ex.nome,
          grupo_muscular: ex.grupo_muscular,
          series_planejadas: ex.series_planejadas,
          repeticoes: ex.repeticoes || '',
          carga: ex.carga || '',
          observacoes: ex.observacoes || '',
          ordem: ex.ordem
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar treino:', error);
      setError('Erro ao carregar treino');
    } finally {
      setLoadingData(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleAddExercise = () => {
    setIsModalOpen(true);
  };

  const handleSelectExercise = (exercise) => {
    setExercises(prev => [
      ...prev,
      {
        exercicio_id: exercise.id,
        nome: exercise.nome,
        grupo_muscular: exercise.grupo_muscular,
        series_planejadas: 3,
        repeticoes: '',
        carga: '',
        observacoes: '',
        ordem: prev.length + 1
      }
    ]);
  };

  const handleUpdateExercise = (index, field, value) => {
    setExercises(prev => prev.map((ex, i) => 
      i === index ? { ...ex, [field]: value } : ex
    ));
  };

  const handleRemoveExercise = (index) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveWorkout = async () => {
    if (!workoutName.trim()) {
      setError('Preencha o nome do treino');
      return;
    }

    if (exercises.length === 0) {
      setError('Adicione pelo menos um exercício');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userStr = localStorage.getItem('totalfit_user');
      const user = userStr ? JSON.parse(userStr) : { id: 1 };

      const workoutData = {
        usuario_id: user.id,
        nome_treino: workoutName,
        dia_semana: selectedDay,
        descricao: workoutDescription,
        exercicios: exercises.map((ex, index) => ({
          exercicio_id: ex.exercicio_id,
          ordem: index + 1,
          series_planejadas: parseInt(ex.series_planejadas) || 3,
          repeticoes: ex.repeticoes || null,
          carga: ex.carga || null,
          observacoes: ex.observacoes || null
        }))
      };

      if (isEditing) {
        await workoutService.atualizarTreino(id, workoutData);
        navigate('/treinos', { 
          state: { message: 'Treino atualizado com sucesso!' }
        });
      } else {
        await workoutService.criarTreino(workoutData);
        navigate('/treinos', { 
          state: { message: 'Treino criado com sucesso!' }
        });
      }
    } catch (err) {
      console.error('Erro ao salvar treino:', err);
      setError(err.response?.data?.erro || 'Erro ao salvar treino. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col">
      {/* Header */}
      <header className="bg-surface/95 backdrop-blur-xl sticky top-0 z-50 border-b border-border-color shadow-lg">
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              aria-label="Voltar"
              className="flex items-center justify-center size-10 rounded-full hover:bg-slate-700 text-white transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                {isEditing ? 'Editar Treino' : 'Novo Treino'}
              </h1>
              <p className="text-xs text-text-secondary hidden sm:block">
                {isEditing ? 'Atualize sua rotina' : 'Crie e personalize sua rotina'}
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="hidden sm:block text-primary font-bold text-sm hover:text-primary-hover px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-8 space-y-8">
          {/* Basic Info Card */}
          <div className="bg-surface rounded-2xl border border-border-color p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">info</span>
                Informações Básicas
              </h2>
              <p className="text-sm text-text-secondary">Configure nome e dia do treino</p>
            </div>

            {/* Workout Name */}
            <div>
              <label className="text-sm text-text-secondary mb-2 block font-medium">Nome do Treino *</label>
              <input
                type="text"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="Ex: Treino A - Peito e Tríceps"
                className="w-full bg-slate-800 border border-border-color rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm text-text-secondary mb-2 block font-medium">Descrição (Opcional)</label>
              <textarea
                value={workoutDescription}
                onChange={(e) => setWorkoutDescription(e.target.value)}
                placeholder="Ex: Foco em hipertrofia com alto volume"
                rows={3}
                className="w-full bg-slate-800 border border-border-color rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* Day Selection */}
            <div>
              <label className="text-sm text-text-secondary mb-3 block font-medium">Dia da Semana *</label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`py-3 rounded-xl font-bold text-sm transition-all ${
                      selectedDay === day
                        ? 'bg-primary text-slate-900 scale-105'
                        : 'bg-slate-800 text-text-secondary hover:bg-slate-700'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Exercises Card */}
          <div className="bg-surface rounded-2xl border border-border-color p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">fitness_center</span>
                  Exercícios
                </h2>
                <p className="text-sm text-text-secondary">
                  {exercises.length} exercício{exercises.length !== 1 ? 's' : ''} adicionado{exercises.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={handleAddExercise}
                className="bg-primary hover:bg-primary-hover text-slate-900 font-bold py-2.5 px-4 rounded-xl transition-all hover:scale-105 flex items-center gap-2"
              >
                <span className="material-symbols-outlined">add</span>
                <span className="hidden sm:inline">Adicionar</span>
              </button>
            </div>

            {exercises.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-xl">
                <span className="material-symbols-outlined text-6xl text-text-secondary mb-3 block">fitness_center</span>
                <p className="text-text-secondary mb-4">Nenhum exercício adicionado ainda</p>
                <button
                  onClick={handleAddExercise}
                  className="bg-primary hover:bg-primary-hover text-slate-900 font-bold py-3 px-6 rounded-xl transition-all hover:scale-105 inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  Adicionar Primeiro Exercício
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {exercises.map((exercise, index) => (
                  <div key={index} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <div className="flex items-start gap-4">
                      <div className="size-10 bg-primary/20 rounded-lg flex items-center justify-center font-bold text-primary shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <h3 className="text-white font-bold">{exercise.nome}</h3>
                            <p className="text-text-secondary text-sm">{exercise.grupo_muscular}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigate(`/exercicio/${exercise.exercicio_id}`)}
                            className="size-8 flex items-center justify-center rounded-full hover:bg-slate-700 text-primary transition-colors shrink-0"
                            title="Ver detalhes do exercício"
                          >
                            <span className="material-symbols-outlined text-[20px]">info</span>
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-text-secondary mb-1 block">Séries</label>
                            <input
                              type="number"
                              value={exercise.series_planejadas}
                              onChange={(e) => handleUpdateExercise(index, 'series_planejadas', e.target.value)}
                              min="1"
                              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-text-secondary mb-1 block">Reps</label>
                            <input
                              type="text"
                              value={exercise.repeticoes}
                              onChange={(e) => handleUpdateExercise(index, 'repeticoes', e.target.value)}
                              placeholder="12"
                              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-text-secondary mb-1 block">Carga (kg)</label>
                            <input
                              type="text"
                              value={exercise.carga}
                              onChange={(e) => handleUpdateExercise(index, 'carga', e.target.value)}
                              placeholder="20"
                              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-text-secondary mb-1 block">Observações</label>
                          <input
                            type="text"
                            value={exercise.observacoes}
                            onChange={(e) => handleUpdateExercise(index, 'observacoes', e.target.value)}
                            placeholder="Ex: Dropset na última série"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveExercise(index)}
                        className="size-9 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors shrink-0"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-500 flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
          )}
        </div>
      </main>

      {/* Footer Actions */}
      <footer className="bg-surface/95 backdrop-blur-xl border-t border-border-color sticky bottom-0">
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-4 flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 sm:flex-initial sm:px-8 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveWorkout}
            disabled={isLoading}
            className="flex-1 sm:flex-initial sm:px-8 bg-primary hover:bg-primary-hover text-slate-900 font-bold py-3 rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? 'Salvando...' : isEditing ? 'Atualizar Treino' : 'Criar Treino'}
          </button>
        </div>
      </footer>

      {/* Modal de Seleção de Exercícios */}
      {isModalOpen && (
        <ExerciseSelectModal
          onClose={() => setIsModalOpen(false)}
          onSelect={handleSelectExercise}
        />
      )}
    </div>
  );
}

export default CreateWorkout;
