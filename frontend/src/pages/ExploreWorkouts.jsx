import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import api from '../services/api';

const ExploreWorkouts = () => {
  const [treinos, setTreinos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [niveis, setNiveis] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('todos');
  const [nivelSelecionado, setNivelSelecionado] = useState('');
  const [frequenciaSelecionada, setFrequenciaSelecionada] = useState('all');
  const [termoBusca, setTermoBusca] = useState('');
  const [debouncedBusca, setDebouncedBusca] = useState('');

  const usuarioId = localStorage.getItem('userId');

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBusca(termoBusca);
    }, 500);

    return () => clearTimeout(timer);
  }, [termoBusca]);

  // Carregar categorias e níveis
  useEffect(() => {
    const carregarFiltros = async () => {
      try {
        const [categoriasRes, niveisRes] = await Promise.all([
          api.get('/categorias-treino'),
          api.get('/niveis-treino')
        ]);
        setCategorias(categoriasRes.data);
        setNiveis(niveisRes.data);
      } catch (error) {
        console.error('Erro ao carregar filtros:', error);
      }
    };
    carregarFiltros();
  }, []);

  // Carregar treinos com filtros
  const carregarTreinos = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        usuario_id: usuarioId,
        busca: debouncedBusca,
        categoria: categoriaSelecionada,
        nivel: nivelSelecionado,
        frequencia: frequenciaSelecionada
      };

      const response = await api.get('/treinos-publicos', { params });
      setTreinos(response.data);
    } catch (error) {
      console.error('Erro ao carregar treinos:', error);
    } finally {
      setLoading(false);
    }
  }, [usuarioId, debouncedBusca, categoriaSelecionada, nivelSelecionado, frequenciaSelecionada]);

  useEffect(() => {
    carregarTreinos();
  }, [carregarTreinos]);

  // Toggle favorito
  const toggleFavorito = async (treinoId) => {
    try {
      const response = await api.post('/treinos-favoritos/toggle', {
        usuario_id: usuarioId,
        treino_publico_id: treinoId
      });

      // Atualizar estado local
      setTreinos(treinos.map(t => 
        t.id === treinoId ? { ...t, favorito: response.data.favorito } : t
      ));
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error);
    }
  };

  const toggleCategoria = (slug) => {
    setCategoriaSelecionada(categoriaSelecionada === slug ? 'todos' : slug);
  };

  const toggleNivel = (slug) => {
    setNivelSelecionado(nivelSelecionado === slug ? '' : slug);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden bg-slate-900">
        <div className="max-w-7xl mx-auto w-full p-4 lg:p-8 flex flex-col gap-6 lg:gap-8">
          {/* Breadcrumb e Header */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Link to="/treinos" className="hover:text-primary transition-colors">Treino</Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-white font-medium">Explorar Treinos</span>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
                  Explorar <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Treinos</span>
                </h1>
                <p className="text-slate-400 text-base md:text-lg max-w-2xl">
                  Descubra rotinas completas criadas por especialistas. Escolha seu objetivo e comece hoje.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/dashboard" className="px-4 py-2 text-slate-400 hover:text-white transition-colors font-medium">
                  Voltar
                </Link>
                <Link 
                  to="/treinos/novo"
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all border border-slate-700"
                >
                  <span className="material-symbols-outlined text-primary">add</span>
                  <span>Criar Treino</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Filtros Sticky */}
          <div className="bg-slate-800/50 rounded-2xl p-4 lg:p-6 border border-slate-700/50 backdrop-blur-sm shadow-xl shadow-black/20 sticky top-4 z-30">
            <div className="flex flex-col gap-6">
              {/* Busca */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                </div>
                <input 
                  type="text"
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-xl bg-slate-950 border-transparent text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:bg-slate-900 transition-all text-lg shadow-inner" 
                  placeholder="Busque por 'Hipertrofia', 'Emagrecimento' ou 'Iniciante'..."
                />
              </div>

              {/* Filtros de Categoria e Nível */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-xs uppercase font-bold text-slate-500 tracking-wider ml-1">Objetivo & Nível</span>
                  <div className="flex flex-wrap gap-2">
                    {/* Categorias */}
                    {categorias.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategoria(cat.slug)}
                        className={`group relative px-4 py-1.5 rounded-full font-bold text-sm transition-all active:scale-95 flex items-center gap-2 ${
                          categoriaSelecionada === cat.slug
                            ? 'bg-primary text-slate-900 shadow-[0_0_10px_rgba(13,242,13,0.3)]'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium border border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <span>{cat.nome}</span>
                        {categoriaSelecionada === cat.slug && (
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        )}
                      </button>
                    ))}
                    
                    <div className="w-px h-6 bg-slate-700 mx-1 hidden sm:block self-center"></div>
                    
                    {/* Níveis */}
                    {niveis.map(nivel => (
                      <button
                        key={nivel.id}
                        onClick={() => toggleNivel(nivel.slug)}
                        className={`group relative px-4 py-1.5 rounded-full font-bold text-sm transition-all active:scale-95 flex items-center gap-2 ${
                          nivelSelecionado === nivel.slug
                            ? 'bg-primary text-slate-900 shadow-[0_0_10px_rgba(13,242,13,0.3)]'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium border border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <span>{nivel.nome}</span>
                        {nivelSelecionado === nivel.slug && (
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frequência Semanal */}
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-xs uppercase font-bold text-slate-500 tracking-wider ml-1">Frequência Semanal</span>
                  <div className="relative w-full sm:w-64">
                    <select 
                      value={frequenciaSelecionada}
                      onChange={(e) => setFrequenciaSelecionada(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer hover:bg-slate-750 transition-colors"
                    >
                      <option value="all">Qualquer Frequência</option>
                      <option value="2">2x Semana</option>
                      <option value="3">3x Semana</option>
                      <option value="4">4x Semana</option>
                      <option value="5">5x Semana+</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <span className="material-symbols-outlined text-primary">expand_more</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Treinos */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-slate-800 rounded-2xl h-96 animate-pulse border border-slate-700"></div>
              ))}
            </div>
          ) : treinos.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-slate-600 text-8xl mx-auto mb-4 block">explore_off</span>
              <p className="text-xl text-gray-400">Nenhum treino encontrado</p>
              <p className="text-gray-500 mt-2">Tente ajustar os filtros</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
              {treinos.map(treino => (
                <article 
                  key={treino.id}
                  className="group relative flex flex-col bg-slate-800 rounded-2xl overflow-hidden hover:shadow-[0_0_20px_rgba(13,242,13,0.15)] transition-all duration-300 border border-slate-700 hover:border-primary/50 cursor-pointer h-full"
                >
                  {/* Imagem */}
                  <div className="aspect-video w-full overflow-hidden bg-slate-900 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent z-10"></div>
                    
                    {/* Botão Favorito */}
                    <div className="absolute top-3 right-3 z-20">
                      <button 
                        onClick={() => toggleFavorito(treino.id)}
                        className="p-2 rounded-full bg-slate-900/50 backdrop-blur-md text-slate-400 hover:text-primary hover:bg-slate-900 transition-colors group/btn"
                      >
                        <span className={`material-symbols-${treino.favorito ? 'filled' : 'outlined'} ${treino.favorito ? 'text-red-500' : ''}`}>
                          favorite
                        </span>
                      </button>
                    </div>
                    
                    <img
                      src={treino.imagem_url}
                      alt={treino.titulo}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Conteúdo */}
                  <div className="p-5 flex flex-col gap-3 flex-1 relative z-10">
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight group-hover:text-primary transition-colors mb-1">
                        {treino.titulo}
                      </h3>
                      <p className="text-sm text-slate-400 line-clamp-2">{treino.descricao}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-1 rounded-md bg-slate-700/50 text-xs font-semibold text-primary border border-slate-600">
                        {treino.categoria}
                      </span>
                      <span className="px-2 py-1 rounded-md bg-slate-700/50 text-xs font-medium text-slate-300 border border-slate-600">
                        {treino.frequencia_semanal}x Semana
                      </span>
                    </div>

                    <div className="mt-auto pt-4">
                      <Link
                        to={`/treino/detalhes/${treino.id}`}
                        className="w-full py-2.5 rounded-xl bg-primary hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                      >
                        <span>Visualizar Detalhes</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Botão Carregar Mais */}
          {!loading && treinos.length > 0 && (
            <div className="flex justify-center pb-8">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all border border-slate-700 hover:border-primary/50 group">
                <span className="material-symbols-outlined group-hover:animate-bounce">expand_more</span>
                Carregar Mais Treinos
              </button>
            </div>
          )}

          {/* Bottom Padding for Mobile Nav */}
          <div className="h-8 lg:hidden"></div>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
};

export default ExploreWorkouts;
