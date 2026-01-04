import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workoutService } from '../services/api';
import ExerciseDetailModal from '../components/ExerciseDetailModal';

function WorkoutExecutionNew() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rotina, setRotina] = useState(null);
  const [exercicios, setExercicios] = useState([]);
  const [exercicioAtualIndex, setExercicioAtualIndex] = useState(0);
  const [serieAtualIndex, setSerieAtualIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [descanso, setDescanso] = useState({ ativo: false, tempo: 60 });
  const [exercicioSelecionado, setExercicioSelecionado] = useState(null);
  const [detalhesExercicios, setDetalhesExercicios] = useState({});
  
  // Recuperar tempo de treino do localStorage ou iniciar novo
  const [tempoTreino, setTempoTreino] = useState(() => {
    const sessaoKey = `treino_sessao_${id}`;
    const sessaoSalva = localStorage.getItem(sessaoKey);
    if (sessaoSalva) {
      const { inicioTimestamp } = JSON.parse(sessaoSalva);
      const tempoDecorrido = Math.floor((Date.now() - inicioTimestamp) / 1000);
      return tempoDecorrido;
    }
    return 0;
  });

  // Salvar início da sessão no localStorage
  useEffect(() => {
    const sessaoKey = `treino_sessao_${id}`;
    const sessaoSalva = localStorage.getItem(sessaoKey);
    if (!sessaoSalva) {
      localStorage.setItem(sessaoKey, JSON.stringify({
        inicioTimestamp: Date.now(),
        treinoId: id
      }));
    }
  }, [id]);

  // Timer do treino
  useEffect(() => {
    const interval = setInterval(() => {
      setTempoTreino(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer de descanso
  useEffect(() => {
    let interval;
    if (descanso.ativo && descanso.tempo > 0) {
      interval = setInterval(() => {
        setDescanso(prev => ({
          ...prev,
          tempo: prev.tempo - 1
        }));
      }, 1000);
    } else if (descanso.ativo && descanso.tempo === 0) {
      setDescanso({ ativo: false, tempo: 60 });
    }
    return () => clearInterval(interval);
  }, [descanso.ativo, descanso.tempo]);

  useEffect(() => {
    buscarRotina();
  }, [id]);

  const buscarRotina = async () => {
    try {
      const userStr = localStorage.getItem('totalfit_user');
      const user = userStr ? JSON.parse(userStr) : { id: 1 };
      
      const rotinaData = await workoutService.getTreinoById(id);
      setRotina(rotinaData);
      
      const exerciciosData = await workoutService.getExerciciosTreino(id);
      
      // Buscar última execução para preencher valores anteriores
      let ultimaExecucao = null;
      try {
        ultimaExecucao = await workoutService.getUltimaSessao(user.id, parseInt(id));
      } catch (error) {
        // Sem execução anterior
      }

      // Buscar detalhes completos de cada exercício
      const { exerciseService } = await import('../services/api');
      const detalhesPromises = exerciciosData.map(ex => 
        exerciseService.getById(ex.exercicio_id).catch(() => null)
      );
      const detalhesArray = await Promise.all(detalhesPromises);
      
      // Criar objeto de detalhes indexado por exercicio_id
      const detalhesMap = {};
      detalhesArray.forEach((detalhe, index) => {
        if (detalhe) {
          detalhesMap[exerciciosData[index].exercicio_id] = detalhe;
        }
      });
      setDetalhesExercicios(detalhesMap);
      
      const exerciciosComSeries = exerciciosData.map(ex => {
        // Buscar dados da última execução deste exercício
        const dadosAnteriores = ultimaExecucao?.exercicios?.find(
          e => e.exercicio_id === ex.exercicio_id
        );
        
        return {
          ...ex,
          series: Array.from({ length: ex.series_planejadas || 3 }, (_, i) => ({
            numero: i + 1,
            peso: ex.carga || '',
            reps: ex.repeticoes || '',
            concluida: false,
            pesoAnterior: dadosAnteriores?.series[i]?.carga_utilizada || ex.carga || '',
            repsAnterior: dadosAnteriores?.series[i]?.repeticoes_realizadas || ex.repeticoes || ''
          }))
        };
      });
      
      setExercicios(exerciciosComSeries);
      
      // Recuperar progresso salvo se existir
      const progressoSalvo = localStorage.getItem(`treino_progresso_${id}`);
      if (progressoSalvo) {
        try {
          const { exercicioAtualIndex: savedExIndex, serieAtualIndex: savedSerIndex, exercicios: savedExercicios } = JSON.parse(progressoSalvo);
          // Restaurar apenas as séries concluídas
          const exerciciosRestaurados = exerciciosComSeries.map((ex, exIndex) => {
            const savedEx = savedExercicios[exIndex];
            if (savedEx) {
              return {
                ...ex,
                series: ex.series.map((serie, serieIndex) => ({
                  ...serie,
                  concluida: savedEx.series[serieIndex]?.concluida || false,
                  peso: savedEx.series[serieIndex]?.peso || serie.peso,
                  reps: savedEx.series[serieIndex]?.reps || serie.reps
                }))
              };
            }
            return ex;
          });
          setExercicios(exerciciosRestaurados);
          setExercicioAtualIndex(savedExIndex);
          setSerieAtualIndex(savedSerIndex);
        } catch (e) {
          console.error('Erro ao recuperar progresso:', e);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar rotina:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTempo = (segundos) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
  };

  const exercicioAtual = exercicios[exercicioAtualIndex];
  const serieAtual = exercicioAtual?.series[serieAtualIndex];
  const totalSeries = exercicios.reduce((acc, ex) => acc + ex.series.length, 0);
  const seriesConcluidas = exercicios.reduce((acc, ex) => acc + ex.series.filter(s => s.concluida).length, 0);

  const handleConcluirSerie = (serieIndex) => {
    const novosExercicios = [...exercicios];
    novosExercicios[exercicioAtualIndex].series[serieIndex].concluida = true;
    setExercicios(novosExercicios);
    
    // Salvar progresso no localStorage
    localStorage.setItem(`treino_progresso_${id}`, JSON.stringify({
      exercicioAtualIndex,
      serieAtualIndex,
      exercicios: novosExercicios
    }));

    // Usar tempo de descanso do planejamento ou padrão 60s
    const tempoDescanso = exercicioAtual.tempo_descanso || 60;
    setDescanso({ ativo: true, tempo: tempoDescanso });

    // Avançar para próxima série automaticamente
    const proximaSerie = exercicioAtual.series.findIndex((s, i) => i > serieIndex && !s.concluida);
    
    if (proximaSerie !== -1) {
      // Tem mais séries neste exercício
      setSerieAtualIndex(proximaSerie);
    } else if (exercicioAtualIndex < exercicios.length - 1) {
      // Todas as séries concluídas - marcar exercício como concluído e navegar automaticamente
      novosExercicios[exercicioAtualIndex].concluido = true;
      setExercicios(novosExercicios);
      
      // Auto-navegar para próximo exercício após 2 segundos
      setTimeout(() => {
        setExercicioAtualIndex(exercicioAtualIndex + 1);
        setSerieAtualIndex(0);
        setDescanso({ ativo: false, tempo: 60 });
      }, 2000);
    } else {
      // Último exercício concluído
      novosExercicios[exercicioAtualIndex].concluido = true;
      setExercicios(novosExercicios);
    }
  };

  const handleAdicionarSerie = () => {
    const novosExercicios = [...exercicios];
    const novoNumero = exercicioAtual.series.length + 1;
    novosExercicios[exercicioAtualIndex].series.push({
      numero: novoNumero,
      peso: exercicioAtual.carga || '',
      reps: exercicioAtual.repeticoes || '',
      concluida: false,
      pesoAnterior: exercicioAtual.carga || '',
      repsAnterior: exercicioAtual.repeticoes || ''
    });
    setExercicios(novosExercicios);
  };

  const handleUpdateSerie = (serieIndex, field, value) => {
    const novosExercicios = [...exercicios];
    novosExercicios[exercicioAtualIndex].series[serieIndex][field] = value;
    setExercicios(novosExercicios);
    
    // Salvar progresso no localStorage
    localStorage.setItem(`treino_progresso_${id}`, JSON.stringify({
      exercicioAtualIndex,
      serieAtualIndex,
      exercicios: novosExercicios
    }));
  };

  const handlePularExercicio = () => {
    const novosExercicios = [...exercicios];
    novosExercicios[exercicioAtualIndex].pulado = true;
    setExercicios(novosExercicios);
    
    // Auto-navegar para próximo exercício
    if (exercicioAtualIndex < exercicios.length - 1) {
      setExercicioAtualIndex(exercicioAtualIndex + 1);
      setSerieAtualIndex(0);
      setDescanso({ ativo: false, tempo: 60 });
    }
  };

  const handleProximoExercicio = () => {
    if (exercicioAtualIndex < exercicios.length - 1) {
      setExercicioAtualIndex(exercicioAtualIndex + 1);
      setSerieAtualIndex(0);
    }
  };

  const handleExercicioAnterior = () => {
    if (exercicioAtualIndex > 0) {
      setExercicioAtualIndex(exercicioAtualIndex - 1);
      setSerieAtualIndex(0);
    }
  };

  const handleFinalizar = async () => {
    try {
      const userStr = localStorage.getItem('totalfit_user');
      const user = userStr ? JSON.parse(userStr) : { id: 1 };
      
      await workoutService.registrarSessao({
        usuario_id: user.id,
        treino_id: parseInt(id),
        data: new Date().toISOString().split('T')[0],
        duracao_minutos: Math.floor(tempoTreino / 60),
        series: exercicios.flatMap(ex => 
          ex.series
            .filter(s => s.concluida)
            .map(s => ({
              exercicio_rotina_id: ex.exercicio_rotina_id,
              numero_serie: s.numero,
              repeticoes_realizadas: parseInt(s.reps) || 0,
              carga_utilizada: parseFloat(s.peso) || 0,
              observacoes: s.observacoes || ''
            }))
        )
      });

      // Limpar dados da sessão do localStorage
      localStorage.removeItem(`treino_sessao_${id}`);
      localStorage.removeItem(`treino_progresso_${id}`);
      
      navigate('/dashboard', {
        state: { 
          message: 'Treino concluído com sucesso!',
          treinoConcluido: true
        }
      });
    } catch (error) {
      console.error('Erro ao finalizar treino:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  if (!exercicioAtual) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-red-500 mb-4 block">error</span>
          <p className="text-white text-xl">Nenhum exercício encontrado</p>
        </div>
      </div>
    );
  }

  const exercicioProximo = exercicios[exercicioAtualIndex + 1];
  const exercicioAnterior = exercicios[exercicioAtualIndex - 1];

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-border-color flex items-center justify-between px-4 lg:px-8 shrink-0 bg-surface/95 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <h1 className="text-xs text-slate-400 font-medium leading-none uppercase tracking-wider">Em execução</h1>
            <h2 className="text-base lg:text-lg font-bold text-white leading-tight">{rotina?.nome_treino}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-lg mr-2 border border-slate-700/50">
            <span className="material-symbols-outlined text-primary text-sm">timer</span>
            <span className="font-mono font-bold text-primary">{formatTempo(tempoTreino)}</span>
          </div>
          <button onClick={handleFinalizar} className="flex h-9 lg:h-10 items-center justify-center rounded-xl bg-red-500/10 px-3 lg:px-4 text-red-500 font-bold text-xs lg:text-sm hover:bg-red-500/20 border border-red-500/20 transition-colors">
            Finalizar
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto lg:overflow-hidden p-0 lg:p-6 flex justify-center">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 h-full">
          
          {/* Left Column - Exercise Info */}
          <div className="lg:col-span-5 flex flex-col gap-0 lg:gap-6 lg:overflow-y-auto pb-0 lg:pb-0 bg-background">
            {/* Video/Image */}
            <div className="relative w-full aspect-video lg:rounded-2xl overflow-hidden bg-slate-800 shadow-xl group border-b lg:border border-slate-700/50 z-10 shrink-0">
              {exercicioAtual.url_video ? (
                <iframe
                  src={exercicioAtual.url_video}
                  title={exercicioAtual.nome}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                  <span className="material-symbols-outlined text-6xl text-slate-600">fitness_center</span>
                </div>
              )}
            </div>

            {/* Exercise Info */}
            <div className="p-4 lg:p-0 flex flex-col gap-3 lg:gap-4 border-b border-slate-800 lg:border-none">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-primary text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      {exercicioAtual.grupo_muscular}
                    </span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">{exercicioAtual.nome}</h1>
                </div>
              </div>

              {/* Detalhes do Exercício */}
              {detalhesExercicios[exercicioAtual.exercicio_id] && (
                <div className="space-y-3">
                  {/* Músculos Secundários e Equipamentos */}
                  <div className="grid grid-cols-1 gap-3">
                    {detalhesExercicios[exercicioAtual.exercicio_id].musculos_secundarios && (
                      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm text-primary">accessibility</span>
                          Músculos Secundários
                        </h3>
                        <p className="text-sm text-slate-200 leading-snug">
                          {detalhesExercicios[exercicioAtual.exercicio_id].musculos_secundarios}
                        </p>
                      </div>
                    )}

                    {detalhesExercicios[exercicioAtual.exercicio_id].equipamentos && 
                     detalhesExercicios[exercicioAtual.exercicio_id].equipamentos.length > 0 && (
                      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm text-primary">build</span>
                          Equipamentos
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {detalhesExercicios[exercicioAtual.exercicio_id].equipamentos.map((equip, idx) => (
                            <span key={idx} className="bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-600">
                              {equip}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Instruções de Execução */}
                  {(detalhesExercicios[exercicioAtual.exercicio_id].posicao_inicial || 
                    (detalhesExercicios[exercicioAtual.exercicio_id].passos_execucao && 
                     detalhesExercicios[exercicioAtual.exercicio_id].passos_execucao.length > 0)) && (
                    <div className="bg-slate-800/50 lg:bg-slate-800 rounded-xl p-4 border border-slate-700/50">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-primary">assignment</span>
                        Instruções de Execução
                      </h3>

                      {detalhesExercicios[exercicioAtual.exercicio_id].posicao_inicial && (
                        <div className="mb-3 pb-3 border-b border-slate-700/50">
                          <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1.5">
                            Posição Inicial
                          </h4>
                          <p className="text-sm text-slate-200 leading-snug">
                            {detalhesExercicios[exercicioAtual.exercicio_id].posicao_inicial}
                          </p>
                        </div>
                      )}

                      {detalhesExercicios[exercicioAtual.exercicio_id].passos_execucao && 
                       detalhesExercicios[exercicioAtual.exercicio_id].passos_execucao.length > 0 && (
                        <ul className="space-y-2">
                          {detalhesExercicios[exercicioAtual.exercicio_id].passos_execucao.map((passo, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-200 leading-snug">
                              <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0"></span>
                              <span>{passo}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Dicas Pro */}
                  {detalhesExercicios[exercicioAtual.exercicio_id].dicas && 
                   detalhesExercicios[exercicioAtual.exercicio_id].dicas.length > 0 && (
                    <div className="bg-yellow-500/5 rounded-xl p-4 border border-yellow-500/20">
                      <h3 className="text-xs font-bold text-yellow-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">lightbulb</span>
                        Dicas Pro
                      </h3>
                      <ul className="space-y-2">
                        {detalhesExercicios[exercicioAtual.exercicio_id].dicas.map((dica, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-200 leading-snug">
                            <span className="text-yellow-500 shrink-0 mt-0.5 material-symbols-outlined text-base">star</span>
                            <span>{dica}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Observações do Treino */}
              {exercicioAtual.observacoes && (
                <div className="bg-slate-800/50 lg:bg-slate-800 rounded-xl p-4 border border-slate-700/50">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">edit_note</span>
                    Observações do Treino
                  </h3>
                  <p className="text-sm text-slate-200 leading-snug">{exercicioAtual.observacoes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Series Table */}
          <div className="lg:col-span-7 flex flex-col h-full lg:overflow-hidden pb-24 lg:pb-0 px-4 lg:px-0">
            <div className="bg-transparent lg:bg-slate-800 lg:rounded-3xl lg:border lg:border-slate-700/50 flex flex-col h-full lg:shadow-2xl relative overflow-hidden">
              
              {/* Table Header */}
              <div className="grid grid-cols-10 gap-2 px-2 lg:px-6 py-3 lg:py-4 bg-slate-900/50 lg:bg-slate-800/80 backdrop-blur border-b border-slate-700 text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-wider z-10 rounded-t-xl lg:rounded-none mt-4 lg:mt-0">
                <div className="col-span-1 flex items-center justify-center">#</div>
                <div className="col-span-2 flex items-center justify-center">Prev</div>
                <div className="col-span-3 flex items-center justify-center">Kg</div>
                <div className="col-span-3 flex items-center justify-center">Reps</div>
                <div className="col-span-1 flex items-center justify-center">
                  <span className="material-symbols-outlined text-base">check</span>
                </div>
              </div>

              {/* Series List */}
              <div className="flex-1 overflow-y-auto pt-2 lg:p-4 space-y-2 lg:space-y-3 relative">
                {exercicioAtual.series.map((serie, index) => {
                  const isCurrent = index === serieAtualIndex;
                  const isCompleted = serie.concluida;
                  const isPending = !isCompleted && index > serieAtualIndex;

                  return (
                    <div
                      key={index}
                      className={`grid grid-cols-10 gap-2 items-center p-3 lg:p-4 rounded-xl border transition-all ${
                        isCompleted
                          ? 'bg-slate-800 lg:bg-slate-900/50 border-slate-700/50 lg:border-transparent opacity-60'
                          : isCurrent
                          ? 'bg-slate-800 lg:bg-slate-700/30 border-primary shadow-[0_0_15px_rgba(13,242,13,0.1)]'
                          : 'bg-slate-800/50 lg:bg-transparent border-dashed border-slate-700'
                      }`}
                    >
                      {/* Número */}
                      <div className={`col-span-1 flex items-center justify-center font-bold ${
                        isCurrent ? 'text-white text-lg' : isCompleted ? 'text-slate-500' : 'text-slate-600'
                      }`}>
                        {serie.numero}
                      </div>

                      {/* Previous */}
                      <div className="col-span-2 text-center flex flex-col items-center justify-center">
                        {serie.pesoAnterior && (
                          <>
                            <span className="text-[10px] text-slate-400 font-medium">Última:</span>
                            <span className="text-xs text-white font-mono">{serie.pesoAnterior}kg</span>
                          </>
                        )}
                      </div>

                      {/* Peso */}
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={serie.peso}
                          onChange={(e) => handleUpdateSerie(index, 'peso', e.target.value)}
                          disabled={isCompleted || isPending}
                          className={`w-full text-center font-bold rounded-lg border py-3 lg:py-4 transition-all ${
                            isCurrent
                              ? 'bg-slate-900 text-white text-xl lg:text-2xl border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary'
                              : isCompleted
                              ? 'bg-transparent text-slate-400 border-none text-lg'
                              : 'bg-transparent text-slate-500 border-none placeholder-slate-700 text-lg'
                          }`}
                          placeholder="-"
                        />
                      </div>

                      {/* Reps */}
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={serie.reps}
                          onChange={(e) => handleUpdateSerie(index, 'reps', e.target.value)}
                          disabled={isCompleted || isPending}
                          className={`w-full text-center font-bold rounded-lg border py-3 lg:py-4 transition-all ${
                            isCurrent
                              ? 'bg-slate-900 text-white text-xl lg:text-2xl border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary'
                              : isCompleted
                              ? 'bg-transparent text-slate-400 border-none text-lg'
                              : 'bg-transparent text-slate-500 border-none placeholder-slate-700 text-lg'
                          }`}
                          placeholder="-"
                        />
                      </div>

                      {/* Status / Completion Button */}
                      <div className="col-span-1 flex justify-center">
                        {isCompleted ? (
                          <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                        ) : (
                          <button
                            onClick={() => handleConcluirSerie(index)}
                            disabled={isPending}
                            className={`group ${
                              isCurrent
                                ? 'size-8 rounded-full bg-primary hover:bg-primary/80 transition-all flex items-center justify-center shadow-[0_0_15px_rgba(13,242,13,0.5)] hover:shadow-[0_0_20px_rgba(13,242,13,0.8)]'
                                : 'size-7 rounded-full border-2 border-slate-600 hover:border-primary hover:bg-primary/10 transition-all flex items-center justify-center'
                            } ${isPending ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span className={`material-symbols-outlined ${isCurrent ? 'text-black text-lg' : 'text-slate-500 group-hover:text-primary text-base'}`}>
                              {isCurrent ? 'check' : 'circle'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Add Series Button */}
                <button
                  onClick={handleAdicionarSerie}
                  className="w-full py-3 flex items-center justify-center gap-2 text-slate-400 hover:text-primary hover:bg-slate-700/30 rounded-xl transition-colors text-sm font-medium border border-transparent hover:border-slate-700 border-dashed mt-2"
                >
                  <span className="material-symbols-outlined text-xl">add_circle</span>
                  Adicionar Série
                </button>

                {/* Skip Exercise Button */}
                <button
                  onClick={handlePularExercicio}
                  className="w-full py-3 flex items-center justify-center gap-2 text-slate-500 hover:text-orange-400 hover:bg-orange-500/10 rounded-xl transition-colors text-sm font-medium border border-transparent hover:border-orange-500/30 border-dashed"
                >
                  <span className="material-symbols-outlined text-xl">skip_next</span>
                  Pular Exercício
                </button>
              </div>

              {/* Footer Actions */}
              <div className="mt-auto pt-4 lg:p-4 lg:bg-slate-800 lg:border-t lg:border-slate-700 z-10 flex flex-col gap-3 pb-4">
                {/* Rest Timer - Enhanced */}
                {descanso.ativo && (
                  <div className="relative overflow-hidden">
                    {/* Animated Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 animate-pulse"></div>
                    
                    <div className="relative flex flex-col gap-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 border-2 border-primary/40 shadow-[0_0_30px_rgba(13,242,13,0.3)]">
                      {/* Main Timer Display */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative size-16 flex items-center justify-center">
                            {/* Outer glow ring */}
                            <div className="absolute inset-0 rounded-full bg-primary/20 blur-md animate-pulse"></div>
                            
                            {/* SVG Timer Circle */}
                            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                              <path
                                className="text-slate-700/50"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="text-primary transition-all duration-1000"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeDasharray={`${(descanso.tempo / 60) * 100}, 100`}
                                strokeLinecap="round"
                                strokeWidth="4"
                              />
                            </svg>
                            
                            {/* Timer Text */}
                            <div className="absolute flex flex-col items-center">
                              <span className="text-2xl font-black text-primary tabular-nums">{descanso.tempo}</span>
                              <span className="text-[9px] text-slate-400 font-bold -mt-1">SEG</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary text-xl animate-pulse">bedtime</span>
                              <span className="text-xs uppercase text-primary font-black tracking-widest">Descanso Ativo</span>
                            </div>
                            <span className="text-base text-white font-bold">Prepare-se para a próxima!</span>
                            <span className="text-xs text-slate-400">Respire fundo e recupere a energia</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => setDescanso(prev => ({ ...prev, tempo: prev.tempo + 15 }))}
                          className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold border border-slate-600 transition-all flex items-center justify-center gap-2 hover:scale-105"
                        >
                          <span className="material-symbols-outlined text-lg">add_circle</span>
                          +15s
                        </button>
                        <button
                          onClick={() => setDescanso({ ativo: false, tempo: 60 })}
                          className="flex-1 py-3 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary text-sm font-bold border-2 border-primary/50 hover:border-primary transition-all flex items-center justify-center gap-2 hover:scale-105 hover:shadow-[0_0_20px_rgba(13,242,13,0.4)]"
                        >
                          <span className="material-symbols-outlined text-lg">skip_next</span>
                          Continuar Agora
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Navigation Footer */}
      <nav className="h-auto min-h-[70px] bg-surface border-t border-border-color shrink-0 flex items-center justify-between px-4 lg:px-8 py-2 z-40 fixed lg:relative bottom-0 w-full lg:w-auto">
        <button
          onClick={handleExercicioAnterior}
          disabled={exercicioAtualIndex === 0}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors p-2 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-3xl">chevron_left</span>
          <div className="text-left hidden lg:block">
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">Anterior</div>
            {exercicioAnterior && <div className="text-sm font-medium">{exercicioAnterior.nome}</div>}
          </div>
        </button>

        <div className="flex flex-col items-center justify-center flex-1">
          <div className="text-[10px] uppercase font-bold text-primary tracking-widest mb-1 flex items-center gap-1 opacity-80">
            Progresso: {seriesConcluidas}/{totalSeries}
          </div>
        </div>

        <button
          onClick={handleProximoExercicio}
          disabled={exercicioAtualIndex === exercicios.length - 1}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-right p-2 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <div className="text-right hidden lg:block">
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">Próximo</div>
            {exercicioProximo && <div className="text-sm font-medium">{exercicioProximo.nome}</div>}
          </div>
          <span className="material-symbols-outlined text-3xl">chevron_right</span>
        </button>
      </nav>

      {/* Exercise Detail Modal */}
      {exercicioSelecionado && (
        <ExerciseDetailModal
          exerciseId={exercicioSelecionado}
          onClose={() => setExercicioSelecionado(null)}
        />
      )}
    </div>
  );
}

export default WorkoutExecutionNew;
