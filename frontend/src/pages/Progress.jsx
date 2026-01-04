import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

function Progress() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />

      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px' }}>bolt</span>
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
            {/* Empty State - Em Desenvolvimento */}
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
              <div className="text-center max-w-2xl px-4">
                {/* Icon */}
                <div className="mb-8 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                    <span className="material-symbols-outlined text-primary relative" style={{ fontSize: '120px' }}>
                      monitoring
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Relatórios de Progresso
                </h2>
                
                {/* Description */}
                <p className="text-lg text-text-secondary mb-8 leading-relaxed">
                  Esta funcionalidade está em desenvolvimento. Em breve será possível acompanhar:
                </p>

                {/* Features List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
                  <div className="bg-surface rounded-xl p-4 border border-border-color">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary mt-0.5">show_chart</span>
                      <div>
                        <h4 className="font-bold text-white mb-1">Evolução de Cargas</h4>
                        <p className="text-sm text-text-secondary">Acompanhe o progresso em cada exercício ao longo do tempo</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface rounded-xl p-4 border border-border-color">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary mt-0.5">emoji_events</span>
                      <div>
                        <h4 className="font-bold text-white mb-1">Conquistas</h4>
                        <p className="text-sm text-text-secondary">Sistema de badges e marcos de progresso alcançados</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface rounded-xl p-4 border border-border-color">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary mt-0.5">analytics</span>
                      <div>
                        <h4 className="font-bold text-white mb-1">Volume Total</h4>
                        <p className="text-sm text-text-secondary">Análise de volume de treino e carga acumulada</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface rounded-xl p-4 border border-border-color">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary mt-0.5">local_fire_department</span>
                      <div>
                        <h4 className="font-bold text-white mb-1">Nutrição</h4>
                        <p className="text-sm text-text-secondary">Histórico de calorias e macronutrientes consumidos</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface rounded-xl p-4 border border-border-color">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary mt-0.5">monitor_weight</span>
                      <div>
                        <h4 className="font-bold text-white mb-1">Medidas Corporais</h4>
                        <p className="text-sm text-text-secondary">Evolução de peso, gordura corporal e outras medidas</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface rounded-xl p-4 border border-border-color">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary mt-0.5">insights</span>
                      <div>
                        <h4 className="font-bold text-white mb-1">Insights IA</h4>
                        <p className="text-sm text-text-secondary">Análises e recomendações personalizadas</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <p className="text-sm text-text-secondary mb-6">
                  Enquanto isso, continue registrando seus treinos e refeições para que possamos gerar relatórios precisos no futuro!
                </p>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary hover:bg-primary-hover text-slate-900 font-bold text-lg transition-all shadow-lg shadow-primary/30"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Voltar ao Dashboard
                </button>
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
