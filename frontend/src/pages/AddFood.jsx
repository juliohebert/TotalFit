import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function AddFood() {
  const navigate = useNavigate();
  const location = useLocation();
  const mealId = location.state?.mealId;
  const userId = localStorage.getItem('userId');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('gramas');
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
  }, [userId, navigate]);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        // Buscar alimentos da API TACO ou banco de dados
        // Por enquanto, retorna lista vazia - usuário precisa criar
        setFoods([]);
      } catch (error) {
        console.error('Erro ao carregar alimentos:', error);
        setFoods([]);
      }
      setLoading(false);
    };

    fetchFoods();
  }, []);

  const categories = ['Todos', 'Proteínas', 'Carboidratos', 'Vegetais', 'Frutas', 'Favoritos'];

  const handleSelectFood = (food) => {
    if (selectedFood?.id === food.id) {
      setSelectedFood(null);
      setQuantity(1);
      setUnit(food.unidades[0]);
    } else {
      setSelectedFood(food);
      setQuantity(1);
      setUnit(food.unidades[0]);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedFood) {
      const totalCalories = selectedFood.calorias * quantity;
      console.log('Adicionando:', {
        food: selectedFood,
        quantity,
        unit,
        totalCalories,
        mealId
      });
      // TODO: Enviar para backend
      navigate('/dieta', { 
        state: { 
          message: `${selectedFood.nome} adicionado com sucesso!` 
        } 
      });
    }
  };

  const handleCancel = () => {
    navigate('/dieta');
  };

  const filteredFoods = foods.filter(food => 
    food.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTotalCalories = () => {
    if (!selectedFood) return 0;
    return selectedFood.calorias * quantity;
  };

  return (
    <div className="bg-background min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-700 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">add_circle</span>
            Adicionar Alimento
          </h1>
          <button 
            onClick={handleCancel}
            className="text-sm font-bold text-text-secondary hover:text-white transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-lg">close</span>
            <span className="hidden sm:inline">Cancelar</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 lg:p-8 space-y-6 pb-28">
        {/* Search Bar */}
        <div className="sticky top-[73px] z-40 bg-background pt-2 pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 lg:static lg:bg-transparent lg:pt-0 lg:pb-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-text-secondary">search</span>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 bg-surface border border-slate-700 rounded-xl text-white placeholder-text-secondary focus:ring-2 focus:ring-primary focus:border-transparent text-lg shadow-sm"
              placeholder="Buscar alimento (ex: Frango, Arroz)..."
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
              <button className="p-2 text-text-secondary hover:text-white rounded-lg hover:bg-slate-700 transition-colors">
                <span className="material-symbols-outlined">qr_code_scanner</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 font-bold rounded-full text-sm whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-primary text-slate-900 shadow-lg shadow-primary/20'
                  : 'bg-surface border border-slate-700 text-text-secondary hover:text-white hover:border-slate-500 font-medium'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
            {searchTerm ? 'Resultados da Busca' : 'Resultados Recentes'}
          </h2>

          {filteredFoods.map((food) => {
            const isSelected = selectedFood?.id === food.id;

            return (
              <div
                key={food.id}
                className={`bg-surface rounded-2xl p-4 transition-all ${
                  isSelected
                    ? 'border border-primary/50 shadow-lg shadow-primary/5 ring-1 ring-primary/20'
                    : 'border border-slate-700 hover:bg-slate-800 cursor-pointer'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined">{food.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{food.nome}</h3>
                      <p className="text-xs text-text-secondary">{food.descricao}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-white'}`}>
                        {food.calorias} kcal
                      </p>
                      <p className="text-[10px] text-text-secondary">
                        P:{food.proteina}g C:{food.carboidratos}g G:{food.gorduras}g
                      </p>
                    </div>
                    {!isSelected && (
                      <button
                        onClick={() => handleSelectFood(food)}
                        className="size-10 rounded-full border border-slate-600 text-primary hover:bg-primary hover:text-slate-900 hover:border-primary transition-all flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined">add</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Quantity Input (shown when selected) */}
                {isSelected && (
                  <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50 flex flex-col sm:flex-row gap-3 items-center animate-in slide-in-from-top duration-300">
                    <div className="flex-1 w-full">
                      <label className="block text-xs text-text-secondary mb-1">Quantidade</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={quantity}
                          onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                          placeholder="0"
                        />
                        <select
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                        >
                          {food.unidades.map((u) => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={handleConfirmSelection}
                      className="w-full sm:w-auto mt-auto h-[42px] px-6 bg-primary hover:bg-primary-hover text-slate-900 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">check</span>
                      Confirmar
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {filteredFoods.length === 0 && (
            <div className="text-center py-12 text-text-secondary">
              <span className="material-symbols-outlined text-6xl mb-4">search_off</span>
              <p className="text-lg font-bold">Nenhum alimento encontrado</p>
              <p className="text-sm">Tente buscar com outros termos</p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Bar (shown when food is selected) */}
      {selectedFood && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-lg border-t border-slate-700 p-4 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="text-sm">
              <p className="text-text-secondary">Selecionado:</p>
              <p className="font-bold text-white">
                <span className="text-primary">{quantity}</span> {selectedFood.nome} ({getTotalCalories()} kcal)
              </p>
            </div>
            <button
              onClick={handleConfirmSelection}
              className="bg-primary hover:bg-primary-hover text-slate-900 font-extrabold text-base py-3 px-8 rounded-xl shadow-lg shadow-primary/20 transition-transform active:scale-95 flex items-center gap-2"
            >
              Concluir Adição
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddFood;
