import { useState, useEffect } from 'react';
import { nutricaoService } from '../services/api';
import { formatDate } from '../utils/config';

function MealsCard({ selectedDate }) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    buscarRefeicoes();
  }, [selectedDate]);

  const buscarRefeicoes = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem('totalfit_user');
      const user = userStr ? JSON.parse(userStr) : { id: 1 };
      
      const dataParaBuscar = selectedDate || new Date();
      const data = formatDate(dataParaBuscar);

      const response = await nutricaoService.getRefeicoes(user.id, data);
      
      // Transformar dados do banco para formato do componente
      const refeicoesFormatadas = response.map(ref => ({
        id: ref.id,
        name: ref.nome || ref.tipo_refeicao,
        description: ref.descricao || ref.alimentos || '',
        calories: Math.round(ref.calorias || 0),
        completed: ref.concluido || false
      }));
      
      setMeals(refeicoesFormatadas);
    } catch (error) {
      console.error('Erro ao buscar refeições:', error);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMeal = async (id) => {
    const meal = meals.find(m => m.id === id);
    const novoConcluido = !meal.completed;
    
    // Atualizar UI otimisticamente
    setMeals(meals.map(m => 
      m.id === id ? { ...m, completed: novoConcluido } : m
    ));

    try {
      await nutricaoService.toggleRefeicao(id, novoConcluido);
    } catch (error) {
      console.error('Erro ao atualizar refeição:', error);
      // Reverter em caso de erro
      setMeals(meals.map(m => 
        m.id === id ? { ...m, completed: !novoConcluido } : m
      ));
    }
  };

  const addMeal = () => {
    setShowAddModal(true);
  };

  const handleMealAdded = () => {
    buscarRefeicoes(); // Recarregar lista
  };

  const completedCount = meals.filter(m => m.completed).length;

  if (loading) {
    return (
      <div className="bg-surface rounded-2xl border border-border-color flex items-center justify-center p-12">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-border-color flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border-color flex justify-between items-center">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">restaurant</span>
          Refeições de Hoje
        </h3>
        <span className="text-xs font-bold bg-slate-700 text-text-secondary px-2 py-1 rounded">
          {completedCount}/{meals.length} Completo
        </span>
      </div>

      {/* Meals List */}
      <div className="p-4 flex flex-col gap-3">
        {meals.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-5xl text-text-secondary mb-2 block">restaurant_menu</span>
            <p className="text-text-secondary text-sm">Nenhuma refeição registrada hoje</p>
          </div>
        ) : (
          meals.map((meal) => (
            <label
              key={meal.id}
              className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all group ${
                meal.completed
                  ? 'bg-sidebar-bg border border-border-dark/50'
                  : 'bg-surface-dark border border-border-dark hover:border-primary/50'
              }`}
            >
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={meal.completed}
                  onChange={() => toggleMeal(meal.id)}
                  className={`peer appearance-none size-6 border-2 rounded-md transition-colors cursor-pointer ${
                    meal.completed
                      ? 'bg-primary border-primary'
                      : 'border-slate-600 group-hover:border-primary'
                  }`}
                />
                <span className="material-symbols-outlined text-slate-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[18px] opacity-0 peer-checked:opacity-100 pointer-events-none">
                  check
                </span>
              </div>

              <div className={`flex-1 transition-opacity ${meal.completed ? 'opacity-50' : ''}`}>
                <p className={`text-white font-medium ${meal.completed ? 'line-through decoration-[#6b7660]' : 'font-bold'}`}>
                  {meal.name}
                </p>
                <p className={`text-text-secondary text-xs ${!meal.completed && 'group-hover:text-white'} transition-colors`}>
                  {meal.description}
                </p>
              </div>

              <div className="text-right">
                <span className={`text-sm font-bold ${meal.completed ? 'text-primary' : 'text-white bg-slate-700 px-2 py-1 rounded'}`}>
                  {meal.calories} kcal
                </span>
              </div>
            </label>
          ))
        )}

        {/* Add Meal Button */}
        <button
          onClick={addMeal}
          className="w-full py-3 rounded-xl border border-dashed border-slate-700 text-text-secondary hover:text-primary hover:border-primary hover:bg-slate-700/30 transition-all flex items-center justify-center gap-2 text-sm font-medium mt-2"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Adicionar Refeição ou Lanche
        </button>
      </div>

      {/* Modal Adicionar Refeição */}
      {showAddModal && (
        <AddMealModal
          selectedDate={selectedDate}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleMealAdded}
        />
      )}
    </div>
  );
}

// Componente Modal Adicionar Refeição
function AddMealModal({ selectedDate, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    tipo_refeicao: 'Café da Manhã',
    nome: '',
    alimentos: '',
    calorias: '',
    proteinas: '',
    carboidratos: '',
    gorduras: '',
    horario: new Date().toTimeString().slice(0, 5)
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tiposRefeicao = [
    'Café da Manhã',
    'Lanche da Manhã',
    'Almoço',
    'Lanche da Tarde',
    'Jantar',
    'Ceia'
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      setError('Nome da refeição é obrigatório');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userStr = localStorage.getItem('totalfit_user');
      const user = userStr ? JSON.parse(userStr) : { id: 1 };
      
      const dataFormatada = selectedDate.toISOString().split('T')[0];

      const { nutricaoService } = await import('../services/api');
      
      await nutricaoService.criarRefeicao({
        usuario_id: user.id,
        data: dataFormatada,
        tipo_refeicao: formData.tipo_refeicao,
        nome: formData.nome,
        alimentos: formData.alimentos,
        calorias: parseFloat(formData.calorias) || 0,
        proteinas: parseFloat(formData.proteinas) || 0,
        carboidratos: parseFloat(formData.carboidratos) || 0,
        gorduras: parseFloat(formData.gorduras) || 0,
        horario: formData.horario
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao criar refeição:', error);
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in overflow-y-auto p-4">
      <div className="bg-surface rounded-2xl p-6 max-w-md w-full my-8 border border-border-color animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">restaurant</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Nova Refeição</h3>
              <p className="text-text-secondary text-sm">Registre sua refeição</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-10 flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors text-text-secondary"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Refeição */}
          <div>
            <label className="text-sm text-text-secondary mb-2 block">Tipo de Refeição</label>
            <select
              value={formData.tipo_refeicao}
              onChange={(e) => handleChange('tipo_refeicao', e.target.value)}
              className="w-full bg-slate-800 border border-border-color rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {tiposRefeicao.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          {/* Nome */}
          <div>
            <label className="text-sm text-text-secondary mb-2 block">Nome *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Ex: Omelete com queijo"
              className="w-full bg-slate-800 border border-border-color rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Alimentos */}
          <div>
            <label className="text-sm text-text-secondary mb-2 block">Alimentos</label>
            <textarea
              value={formData.alimentos}
              onChange={(e) => handleChange('alimentos', e.target.value)}
              placeholder="Ex: 3 ovos, 50g queijo muçarela, tomate"
              rows={2}
              className="w-full bg-slate-800 border border-border-color rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Horário */}
          <div>
            <label className="text-sm text-text-secondary mb-2 block">Horário</label>
            <input
              type="time"
              value={formData.horario}
              onChange={(e) => handleChange('horario', e.target.value)}
              className="w-full bg-slate-800 border border-border-color rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Macros */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-text-secondary mb-2 block">Calorias (kcal)</label>
              <input
                type="number"
                value={formData.calorias}
                onChange={(e) => handleChange('calorias', e.target.value)}
                placeholder="0"
                min="0"
                step="1"
                className="w-full bg-slate-800 border border-border-color rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-2 block">Proteínas (g)</label>
              <input
                type="number"
                value={formData.proteinas}
                onChange={(e) => handleChange('proteinas', e.target.value)}
                placeholder="0"
                min="0"
                step="0.1"
                className="w-full bg-slate-800 border border-border-color rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-2 block">Carboidratos (g)</label>
              <input
                type="number"
                value={formData.carboidratos}
                onChange={(e) => handleChange('carboidratos', e.target.value)}
                placeholder="0"
                min="0"
                step="0.1"
                className="w-full bg-slate-800 border border-border-color rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-2 block">Gorduras (g)</label>
              <input
                type="number"
                value={formData.gorduras}
                onChange={(e) => handleChange('gorduras', e.target.value)}
                placeholder="0"
                min="0"
                step="0.1"
                className="w-full bg-slate-800 border border-border-color rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary-hover text-slate-900 font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Salvando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MealsCard;
