import { Link, useLocation, useNavigate } from 'react-router-dom';

function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', icon: 'grid_view', label: 'Início', fill: true },
    { path: '/treinos', icon: 'fitness_center', label: 'Treino', fill: false },
    { path: '/dieta', icon: 'restaurant_menu', label: 'Dieta', fill: false },
    { path: '/perfil', icon: 'account_circle', label: 'Perfil', fill: false },
  ];

  const isActive = (path) => location.pathname === path;

  const handleExplore = () => {
    navigate('/treinos/explorar');
  };

  return (
    <nav className="lg:hidden fixed bottom-0 w-full bg-surface/90 backdrop-blur-lg border-t border-border-color flex justify-around py-3 px-2 z-50">
      {navItems.slice(0, 2).map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center gap-1 w-16 ${
            isActive(item.path) ? 'text-primary' : 'text-secondary-text'
          }`}
        >
          <span className={`material-symbols-outlined ${item.fill && isActive(item.path) ? 'fill-1' : ''}`}>
            {item.icon}
          </span>
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}

      {/* Central Explore Button */}
      <div className="relative -top-8">
        <button
          onClick={handleExplore}
          className="bg-primary text-slate-900 rounded-full size-14 flex items-center justify-center shadow-[0_0_15px_rgba(163,230,53,0.4)] border-4 border-surface hover:scale-105 transition-transform"
        >
          <span className="material-symbols-outlined text-3xl">explore</span>
        </button>
      </div>

      {navItems.slice(2).map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center gap-1 w-16 ${
            isActive(item.path) ? 'text-primary' : 'text-text-secondary'
          }`}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export default MobileNav;
