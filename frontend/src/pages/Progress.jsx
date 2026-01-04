import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

function Progress() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('7dias');
  const [chartType, setChartType] = useState('forca');

  // Dados mockados (posteriormente virão do backend)
  const kpiData = {
    melhorDesempenho: { valor: '120kg', exercicio: 'Agachamento Livre', variacao: '+5%' },
    volumeTotal: { valor: '45.000kg', descricao: 'Total acumulado', variacao: '+12%' },
    pesoCorporal: { valor: '78.5kg', descricao: 'Média semanal', variacao: '-1.2kg', tipo: 'down' },
    caloriaMedia: { valor: '2.450', descricao: 'Kcal / Dia', variacao: 'Estável', tipo: 'flat' }
  };

  const conquistas = [
    {
      id: 1,
      titulo: 'Novo PR Agachamento',
      descricao: '120kg - Superou em 5kg',
      icon: 'trophy',
      cor: 'primary',
      tempo: '2d'
    },
    {
      id: 2,
      titulo: 'Sequência de 7 Dias',
      descricao: 'Manteve a rotina de treino',
      icon: 'local_fire_department',
      cor: 'orange',
      tempo: 'Ontem'
    },
    {
      id: 3,
      titulo: 'Meta de Peso',
      descricao: 'Atingiu 78.5kg',
      icon: 'scale',
      cor: 'blue',
      tempo: '3d'
    },
    {
      id: 4,
      titulo: 'Treino Mais Longo',
      descricao: '1h 45min de dedicação',
      icon: 'timer',
      cor: 'purple',
      tempo: '1sem'
    }
  ];

  const periods = [
    { id: '7dias', label: 'Últimos 7 dias' },
    { id: 'mes', label: 'Mês Atual' },
    { id: '3meses', label: '3 Meses' },
    { id: 'custom', label: 'Personalizado' }
  ];

  const getCorClass = (cor) => {
    const cores = {
      primary: 'bg-primary/20 text-primary',
      orange: 'bg-orange-500/20 text-orange-500',
      blue: 'bg-blue-500/20 text-blue-500',
      purple: 'bg-purple-500/20 text-purple-500'
    };
    return cores[cor] || cores.primary;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />

      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px' }}>ecg_heart</span>
                <h1 className="text-xl font-bold tracking-tight text-white">Relatórios de Progresso</h1>
              </div>
              <button 
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2 rounded-lg border border-slate-700 bg-transparent px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-primary hover:text-primary active:bg-slate-800"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
                <span className="hidden sm:inline">Voltar</span>
              </button>
            </div>
          </div>
        </header>

        <div className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Filters & Time Period */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex overflow-x-auto pb-2 sm:pb-0 gap-2 no-scrollbar">
                {periods.map((period) => (
                  <button
                    key={period.id}
                    onClick={() => setSelectedPeriod(period.id)}
                    className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-bold transition ${
                      selectedPeriod === period.id
                        ? 'bg-primary text-slate-900 shadow-[0_0_15px_rgba(164,244,37,0.3)]'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-750 hover:text-white">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_list</span>
                  Filtros
                </button>
                <button className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-750 hover:text-white">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
                  Exportar
                </button>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1 - Melhor Desempenho */}
              <div className="group relative overflow-hidden rounded-xl bg-slate-850 p-5 shadow-lg transition hover:bg-slate-800 border border-slate-800 hover:border-slate-700">
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/5 blur-3xl transition group-hover:bg-primary/10"></div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Melhor Desempenho</p>
                    <h3 className="mt-1 text-2xl font-bold text-white">{kpiData.melhorDesempenho.valor}</h3>
                    <p className="text-xs text-slate-500">{kpiData.melhorDesempenho.exercicio}</p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <span className="material-symbols-outlined">fitness_center</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="flex items-center text-xs font-bold text-primary">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>trending_up</span>
                    {kpiData.melhorDesempenho.variacao}
                  </span>
                  <span className="text-xs text-slate-500">vs. mês anterior</span>
                </div>
              </div>

              {/* Card 2 - Volume Total */}
              <div className="group relative overflow-hidden rounded-xl bg-slate-850 p-5 shadow-lg transition hover:bg-slate-800 border border-slate-800 hover:border-slate-700">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Volume Total</p>
                    <h3 className="mt-1 text-2xl font-bold text-white">{kpiData.volumeTotal.valor}</h3>
                    <p className="text-xs text-slate-500">{kpiData.volumeTotal.descricao}</p>
                  </div>
                  <div className="rounded-lg bg-slate-700/50 p-2 text-slate-300">
                    <span className="material-symbols-outlined">analytics</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="flex items-center text-xs font-bold text-primary">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>trending_up</span>
                    {kpiData.volumeTotal.variacao}
                  </span>
                  <span className="text-xs text-slate-500">vs. mês anterior</span>
                </div>
              </div>

              {/* Card 3 - Peso Corporal */}
              <div className="group relative overflow-hidden rounded-xl bg-slate-850 p-5 shadow-lg transition hover:bg-slate-800 border border-slate-800 hover:border-slate-700">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Peso Corporal</p>
                    <h3 className="mt-1 text-2xl font-bold text-white">{kpiData.pesoCorporal.valor}</h3>
                    <p className="text-xs text-slate-500">{kpiData.pesoCorporal.descricao}</p>
                  </div>
                  <div className="rounded-lg bg-slate-700/50 p-2 text-slate-300">
                    <span className="material-symbols-outlined">monitor_weight</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="flex items-center text-xs font-bold text-red-500">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>trending_down</span>
                    {kpiData.pesoCorporal.variacao}
                  </span>
                  <span className="text-xs text-slate-500">vs. mês anterior</span>
                </div>
              </div>

              {/* Card 4 - Calorias */}
              <div className="group relative overflow-hidden rounded-xl bg-slate-850 p-5 shadow-lg transition hover:bg-slate-800 border border-slate-800 hover:border-slate-700">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Calorias Médias</p>
                    <h3 className="mt-1 text-2xl font-bold text-white">{kpiData.caloriaMedia.valor}</h3>
                    <p className="text-xs text-slate-500">{kpiData.caloriaMedia.descricao}</p>
                  </div>
                  <div className="rounded-lg bg-slate-700/50 p-2 text-slate-300">
                    <span className="material-symbols-outlined">local_fire_department</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="flex items-center text-xs font-bold text-primary">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>trending_flat</span>
                    {kpiData.caloriaMedia.variacao}
                  </span>
                  <span className="text-xs text-slate-500">dentro da meta</span>
                </div>
              </div>
            </div>

            {/* Main Content Area: Charts & Details */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 pb-24">
              {/* Primary Chart Section */}
              <div className="lg:col-span-2 flex flex-col gap-8">
                {/* Strength Chart */}
                <div className="rounded-xl border border-slate-800 bg-slate-850 p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white">Evolução de Carga</h3>
                      <p className="text-sm text-slate-400">Agachamento Livre (Max Weight)</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-slate-800 p-1">
                      <button
                        onClick={() => setChartType('forca')}
                        className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                          chartType === 'forca'
                            ? 'bg-slate-700 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Força
                      </button>
                      <button
                        onClick={() => setChartType('volume')}
                        className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                          chartType === 'volume'
                            ? 'bg-slate-700 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Volume
                      </button>
                    </div>
                  </div>

                  {/* Chart Placeholder */}
                  <div className="relative h-64 w-full bg-slate-900/50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-6xl text-slate-700 mb-2">show_chart</span>
                      <p className="text-sm text-slate-500">Gráfico de evolução</p>
                      <p className="text-xs text-slate-600 mt-1">Em breve com dados reais</p>
                    </div>
                  </div>

                  {/* X Axis Labels */}
                  <div className="mt-4 flex justify-between text-xs font-medium text-slate-500">
                    <span>01 Jan</span>
                    <span>08 Jan</span>
                    <span>15 Jan</span>
                    <span>22 Jan</span>
                    <span>29 Jan</span>
                  </div>
                </div>

                {/* Calories Bar Chart */}
                <div className="rounded-xl border border-slate-800 bg-slate-850 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white">Ingestão Calórica Diária</h3>
                      <p className="text-sm text-slate-400">Média: 2.450 kcal</p>
                    </div>
                  </div>

                  {/* Bar Chart */}
                  <div className="relative h-48 w-full flex items-end justify-between gap-2">
                    {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'].map((dia, index) => {
                      const heights = [60, 80, 45, 90, 75, 50, 85];
                      const isDom = dia === 'Dom';
                      return (
                        <div key={dia} className="group relative w-full flex flex-col justify-end h-full gap-2 items-center">
                          <div
                            className={`w-full max-w-[40px] rounded-t-sm transition-all duration-300 ${
                              isDom
                                ? 'bg-primary shadow-[0_0_15px_rgba(164,244,37,0.3)]'
                                : 'bg-slate-700 hover:bg-primary'
                            }`}
                            style={{ height: `${heights[index]}%` }}
                          ></div>
                          <span className={`text-[10px] ${isDom ? 'font-bold text-white' : 'text-slate-500'}`}>
                            {dia}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Secondary Column - Achievements */}
              <div className="flex flex-col gap-6">
                {/* Achievements List */}
                <div className="rounded-xl border border-slate-800 bg-slate-850 p-6 shadow-sm h-full">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-primary">emoji_events</span>
                    <h3 className="text-lg font-bold text-white">Conquistas Recentes</h3>
                  </div>

                  <div className="flex flex-col gap-4">
                    {conquistas.map((conquista) => (
                      <div
                        key={conquista.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition border border-transparent hover:border-slate-700"
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getCorClass(conquista.cor)}`}>
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                            {conquista.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-bold text-white">{conquista.titulo}</p>
                          <p className="truncate text-xs text-slate-400">{conquista.descricao}</p>
                        </div>
                        <span className="text-[10px] font-medium text-slate-500">{conquista.tempo}</span>
                      </div>
                    ))}
                  </div>

                  <button className="mt-6 w-full rounded-lg border border-slate-700 py-2 text-xs font-bold text-slate-400 transition hover:bg-slate-800 hover:text-white">
                    Ver Histórico Completo
                  </button>
                </div>

                {/* AI Insight */}
                <div className="rounded-xl bg-gradient-to-br from-primary/20 to-slate-800 p-6 border border-primary/20">
                  <h4 className="text-sm font-bold text-primary mb-2">Insight da IA</h4>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    Seu progresso no agachamento está consistente. Considere aumentar a ingestão de proteínas em dias de perna para otimizar a recuperação muscular.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Gradient */}
        <div className="fixed bottom-0 left-0 -z-10 h-96 w-96 opacity-20 blur-[100px]" style={{ background: 'radial-gradient(circle, rgba(164,244,37,0.4) 0%, rgba(15,23,42,0) 70%)' }}></div>
      </main>

      <MobileNav />
    </div>
  );
}

export default Progress;
