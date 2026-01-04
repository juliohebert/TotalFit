import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: 'grid_view', label: 'Dashboard', fill: true },
    { path: '/treinos', icon: 'fitness_center', label: 'Treinos', fill: false },
    { path: '/dieta', icon: 'restaurant_menu', label: 'Dieta', fill: false },
    { path: '/progresso', icon: 'monitoring', label: 'Progresso', fill: false },
    { path: '/perfil', icon: 'account_circle', label: 'Perfil', fill: false },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="hidden lg:flex flex-col w-72 h-full border-r border-border-color bg-surface p-6 justify-between flex-shrink-0">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-primary aspect-square rounded-full size-10 flex items-center justify-center text-slate-900">
            <span className="material-symbols-outlined text-[28px]">bolt</span>
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none tracking-tight text-white">TotalFit</h1>
            <p className="text-xs text-text-secondary font-medium mt-0.5">Sua melhor versão</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {/* Create Workout Button */}
          <Link
            to="/treinos/novo"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary hover:bg-primary-hover text-slate-900 font-bold transition-all mb-4 group shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
          >
            <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform">add</span>
            <span className="text-sm">Novo Treino</span>
          </Link>

          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                isActive(item.path)
                  ? 'bg-slate-700 text-white'
                  : 'hover:bg-slate-800 text-text-secondary hover:text-white'
              }`}
            >
              <span className={`material-symbols-outlined ${isActive(item.path) ? 'text-primary fill-1' : 'group-hover:text-primary'} group-hover:scale-110 transition-transform ${item.fill && isActive(item.path) ? 'fill-1' : ''}`}>
                {item.icon}
              </span>
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 border border-border-color">
        <div className="size-10 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-slate-900 font-bold">
          AS
        </div>
        <div className="flex flex-col overflow-hidden">
          <p className="text-sm font-bold text-white truncate">Alex Silva</p>
          <p className="text-xs text-primary truncate">Plano Pro</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
