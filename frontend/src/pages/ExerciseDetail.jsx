import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { exerciseService } from '../services/api';

function ExerciseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    carregarExercicio();
  }, [id]);

  const carregarExercicio = async () => {
    try {
      setLoading(true);
      const data = await exerciseService.getById(id);
      setExercise(data);
    } catch (error) {
      console.error('Erro ao carregar exercício:', error);
      setError('Erro ao carregar exercício');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const getDifficultyColor = (nivel) => {
    switch(nivel) {
      case 'iniciante': return 'bg-green-500/20 text-green-500';
      case 'intermediario': return 'bg-yellow-500/20 text-yellow-500';
      case 'avancado': return 'bg-red-500/20 text-red-500';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  const getDifficultyLabel = (nivel) => {
    switch(nivel) {
      case 'iniciante': return 'Iniciante';
      case 'intermediario': return 'Intermediário';
      case 'avancado': return 'Avançado';
      default: return 'Intermediário';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4 p-4">
        <span className="material-symbols-outlined text-6xl text-red-500">error</span>
        <p className="text-white text-xl">{error || 'Exercício não encontrado'}</p>
        <button
          onClick={handleBack}
          className="bg-primary hover:bg-[#0bc00b] text-slate-900 font-bold py-3 px-6 rounded-xl transition-all"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border-color flex items-center px-4 shrink-0 bg-surface/95 backdrop-blur-sm sticky top-0 z-50 shadow-lg">
        <button
          onClick={handleBack}
          className="size-10 -ml-2 flex items-center justify-center hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-black text-white ml-2">{exercise.nome}</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 space-y-5 pb-8">
          
          {/* Video Section */}
          {exercise.url_video && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-800 shadow-xl border border-border-color">
              <iframe
                src={exercise.url_video}
                title={exercise.nome}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-primary/20 text-primary text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wide flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">fitness_center</span>
              {exercise.grupo_muscular}
            </div>
            <div className={`text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wide flex items-center gap-1.5 ${getDifficultyColor(exercise.nivel_dificuldade)}`}>
              <span className="material-symbols-outlined text-base">trending_up</span>
              {getDifficultyLabel(exercise.nivel_dificuldade)}
            </div>
          </div>

          {/* Description */}
          {exercise.descricao && (
            <div className="bg-surface rounded-2xl border border-border-color p-5">
              <p className="text-slate-300 leading-relaxed">{exercise.descricao}</p>
            </div>
          )}

          {/* Grid: Músculos e Equipamentos */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Muscle Groups */}
            {exercise.musculos_secundarios && (
              <div className="bg-surface rounded-2xl border border-border-color p-5">
                <h3 className="font-black text-white mb-3 flex items-center gap-2.5 text-base">
                  <div className="size-9 bg-primary/20 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">accessibility</span>
                  </div>
                  Músculos Secundários
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">{exercise.musculos_secundarios}</p>
              </div>
            )}

            {/* Equipment */}
            {exercise.equipamentos && exercise.equipamentos.length > 0 && (
              <div className="bg-surface rounded-2xl border border-border-color p-5">
                <h3 className="font-black text-white mb-3 flex items-center gap-2.5 text-base">
                  <div className="size-9 bg-primary/20 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">build</span>
                  </div>
                  Equipamentos
                </h3>
                <div className="flex flex-wrap gap-2">
                  {exercise.equipamentos.map((equip, index) => (
                    <span
                      key={index}
                      className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700"
                    >
                      {equip}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Execution Instructions */}
          {(exercise.posicao_inicial || (exercise.passos_execucao && exercise.passos_execucao.length > 0) || exercise.instrucoes) && (
            <details className="group bg-surface rounded-2xl border border-border-color overflow-hidden shadow-md" open>
              <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-800/50 transition-all list-none select-none">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-primary/20 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">assignment</span>
                  </div>
                  <span className="font-black text-white text-base">Instruções de Execução</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform duration-300 text-2xl">
                  expand_more
                </span>
              </summary>
              <div className="px-5 pb-5 space-y-4">
                {exercise.posicao_inicial && (
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <h4 className="font-black text-primary mb-2 text-xs uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">radio_button_checked</span>
                      Posição Inicial
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{exercise.posicao_inicial}</p>
                  </div>
                )}
                
                {exercise.passos_execucao && exercise.passos_execucao.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-black text-white text-xs uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">format_list_numbered</span>
                      Passos
                    </h4>
                    {exercise.passos_execucao.map((passo, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        <div className="size-7 bg-primary text-slate-900 rounded-lg flex items-center justify-center font-black text-sm shrink-0 shadow-lg shadow-primary/30">
                          {index + 1}
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed pt-0.5">{passo}</p>
                      </div>
                    ))}
                  </div>
                ) : exercise.instrucoes && (
                  <p className="text-slate-300 text-sm leading-relaxed">{exercise.instrucoes}</p>
                )}
              </div>
            </details>
          )}

          {/* Tips */}
          {exercise.dicas && exercise.dicas.length > 0 && (
            <details className="group bg-surface rounded-2xl border border-border-color overflow-hidden shadow-md">
              <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-800/50 transition-all list-none select-none">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-yellow-500 text-xl">tips_and_updates</span>
                  </div>
                  <span className="font-black text-white text-base">Dicas Pro</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform duration-300 text-2xl">
                  expand_more
                </span>
              </summary>
              <div className="px-5 pb-5 space-y-2.5">
                {exercise.dicas.map((dica, index) => (
                  <div key={index} className="flex gap-3 items-start bg-slate-800/30 rounded-xl p-3 border border-slate-700/50">
                    <span className="text-yellow-500 shrink-0 mt-0.5 material-symbols-outlined text-lg">star</span>
                    <span className="text-slate-300 text-sm leading-relaxed">{dica}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </main>
    </div>
  );
}

export default ExerciseDetail;
