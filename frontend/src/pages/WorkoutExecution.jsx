import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workoutService } from '../services/api';
import ExerciseDetailModal from '../components/ExerciseDetailModal';

function WorkoutExecution() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rotina, setRotina] = useState(null);
  const [exercicios, setExercicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarConfirmacaoSaida, setMostrarConfirmacaoSaida] = useState(false);
  const [descanso, setDescanso] = useState({ ativo: false, tempo: 60, exercicioId: null, serie: null });
  const [exercicioSelecionado, setExercicioSelecionado] = useState(null);

  useEffect(() => {
    buscarRotina();
  }, [id]);

  useEffect(() => {
    let interval;
    if (descanso.ativo && descanso.tempo > 0) {
      interval = setInterval(() => {
        setDescanso((prev) => {
          if (prev.tempo <= 1) {
            return { ativo: false, tempo: 60, exercicioId: null, serie: null, entreExercicios: false };
          }
          return {
            ...prev,
            tempo: prev.tempo - 1
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [descanso.ativo, descanso.tempo]);

  const buscarRotina = async () => {
    try {
      const rotinaData = await workoutService.getTreinoById(id);
      setRotina(rotinaData);
      
      const exerciciosData = await workoutService.getExerciciosTreino(id);
      
      // Inicializar séries para todos os exercícios
      const exerciciosComSeries = exerciciosData.map(ex => ({
        ...ex,
        series: Array.from({ length: ex.series_planejadas || 3 }, (_, i) => ({
          numero: i + 1,
          observacoes: '',
          concluida: false,
        }))
      }));
      
      setExercicios(exerciciosComSeries);
    } catch (error) {
      console.error('Erro ao buscar rotina:', error);
    } finally {
      setLoading(false);
    }
  };

  const tocarFeedback = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Silencioso se falhar
    }
  };

  const handleConcluirSerie = (exercicioId, numeroSerie, observacoes) => {
    // Atualizar estado e processar lógica de descanso com o estado atualizado
    setExercicios((prev) => {
      const novosExercicios = prev.map((ex) =>
        ex.exercicio_rotina_id === exercicioId
          ? {
              ...ex,
              series: ex.series.map((s) =>
                s.numero === numeroSerie
                  ? { ...s, observacoes, concluida: true }
                  : s
              )
            }
          : ex
      );
      
      // Usar o estado atualizado para verificar descansos
      const exercicio = novosExercicios.find(ex => ex.exercicio_rotina_id === exercicioId);
      const todasSeriesDoExercicioConcluidas = exercicio?.series.every(s => s.concluida);
      
      if (exercicio && numeroSerie < exercicio.series.length) {
        // Descanso entre séries (60 segundos)
        setDescanso({ ativo: true, tempo: 60, exercicioId, serie: numeroSerie });
      } else if (todasSeriesDoExercicioConcluidas) {
        // Última série do exercício - verificar se há próximo exercício
        const indexExercicioAtual = novosExercicios.findIndex(ex => ex.exercicio_rotina_id === exercicioId);
        if (indexExercicioAtual < novosExercicios.length - 1) {
          // Descanso entre exercícios (120 segundos)
          setDescanso({ ativo: true, tempo: 120, exercicioId, serie: numeroSerie, entreExercicios: true });
        }
      }
      
      return novosExercicios;
    });
    
    tocarFeedback();
  };

  const pularDescanso = () => {
    setDescanso({ ativo: false, tempo: 60, exercicioId: null, serie: null });
  };

  const adicionarTempo = () => {
    setDescanso((prev) => ({ ...prev, tempo: prev.tempo + 30 }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSairComConfirmacao = () => {
    const algumProgresso = exercicios.some(ex => 
      ex.series.some(s => s.concluida)
    );
    
    if (algumProgresso) {
      setMostrarConfirmacaoSaida(true);
    } else {
      navigate(-1);
    }
  };

  const handleFinalizarTreino = async () => {
    const todasSeriesConcluidas = exercicios.every(ex => 
      ex.series.every(s => s.concluida)
    );
    
    if (todasSeriesConcluidas) {
      try {
        const usuario = JSON.parse(localStorage.getItem('totalfit_user'));
        const dataHora = new Date().toISOString();
        
        // Preparar dados das séries realizadas
        const series = exercicios.flatMap(ex => 
          ex.series.map(s => ({
            exercicio_rotina_id: ex.exercicio_rotina_id,
            numero_serie: s.numero,
            observacoes: s.observacoes || null,
            concluida: true
          }))
        );

        await workoutService.salvarTreinoConcluido({
          usuario_id: usuario.id,
          rotina_id: id,
          data_hora: dataHora,
          series: series
        });

        navigate('/dashboard', {
          state: { message: 'Treino concluído com sucesso! 🎉', treinoConcluido: true },
        });
      } catch (error) {
        console.error('Erro ao salvar treino:', error);
        // Navegar mesmo com erro para não travar o usuário
        navigate('/dashboard', {
          state: { message: 'Treino concluído! 🎉' },
        });
      }
    }
  };

  const calcularProgresso = () => {
    const totalSeries = exercicios.reduce((acc, ex) => acc + ex.series.length, 0);
    const seriesConcluidas = exercicios.reduce(
      (acc, ex) => acc + ex.series.filter(s => s.concluida).length,
      0
    );
    return totalSeries > 0 ? Math.round((seriesConcluidas / totalSeries) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  if (!rotina || exercicios.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-4">
        <span className="material-symbols-outlined text-6xl text-text-secondary">fitness_center</span>
        <h2 className="text-2xl font-bold text-white">Nenhum exercício encontrado</h2>
        <p className="text-text-secondary text-center max-w-md">
          Este treino ainda não possui exercícios cadastrados. Adicione exercícios para começar!
        </p>
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => navigate(`/treinos/editar/${id}`)}
            className="bg-primary hover:bg-primary-hover text-slate-900 font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Adicionar Exercícios
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const progresso = calcularProgresso();

  return (
    <div className="min-h-screen bg-background text-text-main">
      <header className="bg-surface border-b border-border-color sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleSairComConfirmacao}
              className="size-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="text-center flex-1">
              <h1 className="text-lg font-black text-white">{rotina?.nome_treino}</h1>
              <p className="text-sm text-text-secondary">{exercicios.length} exercícios</p>
            </div>
            {progresso === 100 && (
              <button
                onClick={handleFinalizarTreino}
                className="size-10 flex items-center justify-center rounded-full bg-primary hover:bg-primary-hover text-slate-900 transition-colors"
              >
                <span className="material-symbols-outlined">check</span>
              </button>
            )}
            {progresso < 100 && <div className="size-10"></div>}
          </div>
          
          {/* Barra de Progresso */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white font-bold">
                {exercicios.reduce((acc, ex) => acc + ex.series.filter(s => s.concluida).length, 0)}/
                {exercicios.reduce((acc, ex) => acc + ex.series.length, 0)} séries
              </span>
              <span className={`text-sm font-black transition-colors duration-300 ${
                progresso === 100 ? 'text-primary' : 'text-white'
              }`}>
                {progresso}%
              </span>
            </div>
            <div className="relative h-2.5 bg-slate-900/80 rounded-full overflow-hidden border border-slate-700/50">
              {/* Barra de progresso com animação suave */}
              <div
                className={`h-full transition-all duration-700 ease-out relative ${
                  progresso === 100 
                    ? 'bg-gradient-to-r from-primary via-lime-400 to-primary' 
                    : 'bg-gradient-to-r from-primary to-lime-400'
                }`}
                style={{ width: `${progresso}%` }}
              >
                {/* Brilho animado */}
                {progresso > 0 && (
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                  </div>
                )}
                
                {/* Reflexo superior */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent h-1/2"></div>
              </div>
              
              {/* Ícone de check quando completo */}
              {progresso === 100 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-slate-900/60 rounded-full p-0.5 animate-bounce">
                    <span className="material-symbols-outlined text-primary text-xs font-bold">
                      check
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 pb-24 space-y-4">
        {exercicios.map((exercicio, exIndex) => (
          <ExercicioCard
            key={exercicio.exercicio_rotina_id}
            exercicio={exercicio}
            index={exIndex}
            onConcluirSerie={handleConcluirSerie}
            descansoAtivo={descanso.ativo && descanso.exercicioId === exercicio.exercicio_rotina_id}
            onVerDetalhes={setExercicioSelecionado}
          />
        ))}
      </main>

      {/* Modal de Descanso - Centro da Tela */}
      {descanso.ativo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border-2 border-primary shadow-[0_0_50px_rgba(163,230,53,0.4)] max-w-md mx-4 animate-in zoom-in-95 duration-300">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center size-20 bg-primary/20 rounded-full mb-4">
                <span className="material-symbols-outlined text-primary text-5xl animate-pulse">timer</span>
              </div>
              <h3 className="text-white font-black text-2xl mb-2">
                {descanso.entreExercicios ? 'Descanso entre Exercícios' : 'Descanso'}
              </h3>
              <p className="text-text-secondary text-sm">
                {descanso.entreExercicios ? 'Prepare-se para o próximo exercício' : 'Próxima série em breve'}
              </p>
            </div>
            
            <div className="text-center mb-6">
              <div className="text-7xl font-black text-primary">{formatTime(descanso.tempo)}</div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={pularDescanso}
                className="flex-1 bg-primary hover:bg-primary-hover text-slate-900 font-black py-4 px-6 rounded-xl transition-all hover:scale-105 text-lg"
              >
                Pular
              </button>
              <button
                onClick={adicionarTempo}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-6 rounded-xl transition-all hover:scale-105 text-lg"
              >
                +30s
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Saída */}
      {mostrarConfirmacaoSaida && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-2xl p-6 max-w-sm w-full border border-border-color">
            <div className="text-center mb-6">
              <span className="material-symbols-outlined text-5xl text-yellow-500 mb-2">warning</span>
              <h3 className="text-xl font-black text-white mb-2">Sair do Treino?</h3>
              <p className="text-text-secondary text-sm">
                Seu progresso não será salvo se você sair agora.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setMostrarConfirmacaoSaida(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Continuar Treino
              </button>
              <button
                onClick={() => navigate(-1)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Exercício */}
      {exercicioSelecionado && (
        <ExerciseDetailModal
          exerciseId={exercicioSelecionado}
          onClose={() => setExercicioSelecionado(null)}
        />
      )}
    </div>
  );
}

// Componente de Card de Exercício
function ExercicioCard({ exercicio, index, onConcluirSerie, descansoAtivo, onVerDetalhes }) {
  const [expandido, setExpandido] = useState(index === 0); // Primeiro expandido por padrão
  
  const seriesConcluidas = exercicio.series.filter(s => s.concluida).length;
  const todasConcluidas = seriesConcluidas === exercicio.series.length;

  return (
    <div className={`bg-surface rounded-xl border transition-all ${
      todasConcluidas ? 'border-primary/50' : 'border-border-color'
    }`}>
      {/* Header do Exercício */}
      <div
        onClick={() => setExpandido(!expandido)}
        className="w-full p-4 flex items-center gap-4 hover:bg-slate-800/50 transition-colors rounded-xl cursor-pointer"
      >
        <div className={`size-12 rounded-xl flex items-center justify-center font-black text-lg ${
          todasConcluidas 
            ? 'bg-primary/20 text-primary' 
            : 'bg-slate-800 text-white'
        }`}>
          {todasConcluidas ? (
            <span className="material-symbols-outlined">check_circle</span>
          ) : (
            index + 1
          )}
        </div>
        
        <div className="flex-1 text-left">
          <div className="flex items-center gap-3">
            <h3 className="text-white font-bold flex-1">{exercicio.nome}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVerDetalhes(exercicio.exercicio_id);
              }}
              className="size-9 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all hover:scale-110 shrink-0"
              title="Ver detalhes do exercício"
            >
              <span className="material-symbols-outlined text-xl">info</span>
            </button>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-1 bg-slate-700 text-primary rounded-lg font-bold">
              {exercicio.grupo_muscular}
            </span>
            <span className="text-xs text-text-secondary">
              {seriesConcluidas}/{exercicio.series.length} séries
            </span>
            {exercicio.repeticoes && (
              <span className="text-xs text-text-secondary">
                • {exercicio.repeticoes} reps
              </span>
            )}
            {exercicio.carga && (
              <span className="text-xs text-text-secondary">
                • {exercicio.carga}kg
              </span>
            )}
          </div>
        </div>

        <span className={`material-symbols-outlined text-text-secondary transition-transform ${
          expandido ? 'rotate-180' : ''
        }`}>
          expand_more
        </span>
      </div>

      {/* Conteúdo Expansível */}
      {expandido && (
        <div 
          className="px-4 pb-4 space-y-3 border-t border-border-color pt-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Detalhes do Exercício */}
          <div className="bg-slate-800 rounded-lg p-3 space-y-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-text-secondary text-xs mb-1">Séries</p>
                <p className="text-white font-bold text-lg">{exercicio.series.length}</p>
              </div>
              {exercicio.repeticoes && (
                <div className="text-center">
                  <p className="text-text-secondary text-xs mb-1">Repetições</p>
                  <p className="text-white font-bold text-lg">{exercicio.repeticoes}</p>
                </div>
              )}
              {exercicio.carga && (
                <div className="text-center">
                  <p className="text-text-secondary text-xs mb-1">Carga</p>
                  <p className="text-white font-bold text-lg">{exercicio.carga}kg</p>
                </div>
              )}
            </div>
            {exercicio.observacoes && (
              <div className="pt-2 border-t border-slate-700">
                <p className="text-text-secondary text-xs mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  Observações
                </p>
                <p className="text-white text-sm">{exercicio.observacoes}</p>
              </div>
            )}
          </div>
          
          {exercicio.descricao && (
            <p className="text-text-secondary text-sm mb-3">{exercicio.descricao}</p>
          )}
          
          {descansoAtivo && (
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-center">
              <span className="material-symbols-outlined text-primary text-3xl mb-2">timer</span>
              <p className="text-primary font-bold text-sm">Descansando...</p>
            </div>
          )}
          
          {exercicio.series.map((serie) => (
            <SerieCard
              key={serie.numero}
              serie={serie}
              exercicioId={exercicio.exercicio_rotina_id}
              onConcluir={onConcluirSerie}
              desabilitado={descansoAtivo}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Componente de Série
function SerieCard({ serie, exercicioId, onConcluir, desabilitado }) {
  const [observacoes, setObservacoes] = useState(serie.observacoes || '');
  const [mostrarObservacoes, setMostrarObservacoes] = useState(false);

  const handleConcluir = () => {
    onConcluir(exercicioId, serie.numero, observacoes);
  };

  if (serie.concluida) {
    return (
      <div className="bg-slate-800 rounded-xl p-4 border border-primary/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">check</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-bold">Série {serie.numero}</p>
              {serie.observacoes && (
                <p className="text-sm text-text-secondary mt-1">
                  {serie.observacoes}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-4 border-2 border-slate-700 hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-slate-700 rounded-lg flex items-center justify-center text-white font-black">
            {serie.numero}
          </div>
          <p className="text-white font-bold">Série {serie.numero}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMostrarObservacoes(!mostrarObservacoes);
            }}
            className={`size-9 flex items-center justify-center rounded-lg transition-colors ${
              mostrarObservacoes || observacoes 
                ? 'bg-primary/20 text-primary' 
                : 'bg-slate-700 text-text-secondary hover:text-white'
            }`}
            title="Observações"
          >
            <span className="material-symbols-outlined text-xl">edit_note</span>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleConcluir();
            }}
            disabled={desabilitado}
            className="size-9 flex items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-slate-900 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title="Concluir Série"
          >
            <span className="material-symbols-outlined text-xl">check_circle</span>
          </button>
        </div>
      </div>

      {mostrarObservacoes && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          <label className="text-text-secondary text-xs font-bold mb-2 block">Observações</label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Ex: Aumentar peso na próxima, faltou 2 reps..."
            rows={2}
            disabled={desabilitado}
            className="w-full bg-slate-700 border border-border-color rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-50"
          />
        </div>
      )}
    </div>
  );
}

export default WorkoutExecution;
