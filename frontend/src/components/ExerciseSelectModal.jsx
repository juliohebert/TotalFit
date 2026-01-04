import { useState, useEffect } from 'react';
import { exerciseService } from '../services/api';

/**
 * ExerciseSelectModal - Modal para selecionar exercícios da biblioteca
 * 
 * Props:
 * - isOpen: boolean - controla visibilidade do modal
 * - onClose: function - callback para fechar modal
 * - onSelect: function(exercise) - callback quando exercício é selecionado
 */
function ExerciseSelectModal({ isOpen, onClose, onSelect }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Todos');

  const muscleGroups = [
    'Todos',
    'Peito',
    'Costas',
    'Ombros',
    'Bíceps',
    'Tríceps',
    'Pernas',
    'Abdômen',
    'Glúteos',
  ];

  useEffect(() => {
    if (isOpen) {
      fetchExercises();
    }
  }, [isOpen]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const data = await exerciseService.getAll();
      setExercises(data);
    } catch (error) {
      console.error('Erro ao buscar exercícios:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === 'Todos' || exercise.grupo_muscular === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const handleSelectExercise = (exercise) => {
    onSelect(exercise);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-border-color flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-color">
          <div>
            <h2 className="text-2xl font-black text-white">Selecionar Exercício</h2>
            <p className="text-text-secondary text-sm">Escolha um exercício da biblioteca</p>
          </div>
          <button
            onClick={onClose}
            className="size-10 flex items-center justify-center rounded-full hover:bg-slate-700 text-text-secondary hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-6 space-y-4 border-b border-border-color">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar exercício..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-border-color rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Muscle Group Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {muscleGroups.map((group) => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  selectedGroup === group
                    ? 'bg-primary text-slate-900'
                    : 'bg-slate-800 text-text-secondary hover:bg-slate-700 hover:text-white'
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="material-symbols-outlined text-4xl text-primary animate-spin">
                progress_activity
              </span>
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="material-symbols-outlined text-6xl text-text-secondary mb-4">
                search_off
              </span>
              <p className="text-white font-bold text-lg">Nenhum exercício encontrado</p>
              <p className="text-text-secondary text-sm">Tente ajustar os filtros</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => handleSelectExercise(exercise)}
                  className="bg-slate-800 hover:bg-slate-700 border border-border-color rounded-xl p-4 text-left transition-all hover:border-primary group"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="size-12 bg-slate-700 group-hover:bg-primary/20 rounded-xl flex items-center justify-center text-primary flex-shrink-0 transition-colors">
                      <span className="material-symbols-outlined">fitness_center</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold truncate">{exercise.nome}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-1 bg-slate-700 text-primary rounded-lg font-bold">
                          {exercise.grupo_muscular}
                        </span>
                        <span className="text-xs text-text-secondary">
                          {exercise.equipamento}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">
                      arrow_forward
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExerciseSelectModal;
