import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  // Dados do usuário (posteriormente virão do backend)
  const [userData, setUserData] = useState({
    nome: 'João Vitor da Silva',
    nomeExibicao: 'João Silva',
    email: 'joao.silva@email.com',
    dataNascimento: '12/05/1995',
    telefone: '(11) 99999-8888',
    peso: 82,
    altura: 178,
    gorduraCorporal: 15,
    metaPrincipal: 'Hipertrofia',
    membroDesde: 'Março, 2023',
    fotoPerfil: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtMFgqXNK4lz-XrZp3YFvS0-ClqQ76kf6aTrmc41xr3oj76I4HTBAnkXn3yrZksGwS3iJZNILM-sVnm_saU3SyoA6o9_mSLIBBzsVVTGMTyM2dLo4YWAkyPxRDdRakY3HH_Tm7hA5Y0sYoM4LFge_XmjK5YWu6HDcLunAEMhiIPDHYEMJgyFcJnTlyYjTVm_58mCP2lrGzDZUFWiw80tOIi-kf85JGh4GRAb5Zk4ns3te-SOSQ3Z7fhh6QjTb7TdwW33cS_9xfeEs',
    plano: 'Premium',
    nivel: 'Atleta Intermediário'
  });

  const handleLogout = () => {
    // Futuramente: limpar localStorage/cookies
    navigate('/login');
  };

  const handleEditProfile = () => {
    setIsEditing(!isEditing);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Tem certeza que deseja excluir sua conta permanentemente? Esta ação não pode ser desfeita.')) {
      // Futuramente: chamar API de exclusão
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar Desktop */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
        {/* Mobile Header */}
        <div className="lg:hidden flex justify-between items-center p-4 bg-background sticky top-0 z-20 border-b border-border-color">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">fitness_center</span>
            <span className="font-bold text-lg">TotalFit</span>
          </div>
          <button className="text-white">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8 lg:py-12 pb-24">
          {/* Page Heading */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-white">Meu Perfil</h2>
              <p className="text-text-secondary mt-1">Gerencie suas informações e metas</p>
            </div>
            <button
              onClick={handleEditProfile}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary/30 text-primary hover:bg-primary hover:text-slate-900 font-bold transition-all active:scale-95 group"
            >
              <span className="material-symbols-outlined text-[20px] group-hover:text-slate-900">edit</span>
              <span>Editar Perfil</span>
            </button>
          </div>

          {/* Profile Header Card */}
          <div className="bg-surface rounded-2xl p-6 lg:p-8 shadow-xl border border-border-color mb-6 relative overflow-hidden group">
            {/* Decorative Glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
              <div className="relative">
                <div className="w-32 h-32 rounded-full p-1 border-2 border-primary/30 bg-background">
                  <div
                    className="w-full h-full rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${userData.fotoPerfil}')` }}
                  ></div>
                </div>
                <button className="absolute bottom-1 right-1 bg-primary text-slate-900 p-2 rounded-full hover:bg-primary-hover transition-colors shadow-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                </button>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-2xl font-bold text-white mb-1">{userData.nomeExibicao}</h3>
                <p className="text-text-secondary text-sm mb-4">Membro desde {userData.membroDesde}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-700/50 text-xs font-medium text-slate-300 border border-slate-600">
                    {userData.plano}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary border border-primary/20">
                    {userData.nivel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Weight */}
            <div className="bg-surface p-5 rounded-2xl border border-border-color flex flex-col items-center justify-center text-center hover:border-primary/30 transition-colors">
              <span className="text-text-secondary text-sm font-medium mb-1">Peso Atual</span>
              <div className="text-2xl font-black text-white flex items-end gap-1">
                {userData.peso} <span className="text-primary text-sm font-bold mb-1">kg</span>
              </div>
            </div>

            {/* Height */}
            <div className="bg-surface p-5 rounded-2xl border border-border-color flex flex-col items-center justify-center text-center hover:border-primary/30 transition-colors">
              <span className="text-text-secondary text-sm font-medium mb-1">Altura</span>
              <div className="text-2xl font-black text-white flex items-end gap-1">
                {userData.altura} <span className="text-text-secondary text-sm font-bold mb-1">cm</span>
              </div>
            </div>

            {/* Body Fat */}
            <div className="bg-surface p-5 rounded-2xl border border-border-color flex flex-col items-center justify-center text-center hover:border-primary/30 transition-colors">
              <span className="text-text-secondary text-sm font-medium mb-1">Gordura Corporal</span>
              <div className="text-2xl font-black text-white flex items-end gap-1">
                {userData.gorduraCorporal} <span className="text-text-secondary text-sm font-bold mb-1">%</span>
              </div>
            </div>

            {/* Goal */}
            <div className="bg-surface p-5 rounded-2xl border border-border-color flex flex-col items-center justify-center text-center hover:border-primary/30 transition-colors">
              <span className="text-text-secondary text-sm font-medium mb-1">Meta Principal</span>
              <div className="text-lg font-bold text-primary truncate w-full">
                {userData.metaPrincipal}
              </div>
            </div>
          </div>

          {/* Personal Info Section */}
          <div className="bg-surface rounded-2xl p-6 lg:p-8 border border-border-color mb-6">
            <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person_outline</span>
              Informações Pessoais
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-text-secondary text-sm font-medium">Nome Completo</label>
                <div className="flex items-center px-4 h-12 bg-background rounded-xl border border-border-color text-white font-medium">
                  {userData.nome}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-text-secondary text-sm font-medium">Email</label>
                <div className="flex items-center px-4 h-12 bg-background rounded-xl border border-border-color text-white font-medium opacity-70">
                  {userData.email}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-text-secondary text-sm font-medium">Data de Nascimento</label>
                <div className="flex items-center px-4 h-12 bg-background rounded-xl border border-border-color text-white font-medium">
                  {userData.dataNascimento}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-text-secondary text-sm font-medium">Telefone</label>
                <div className="flex items-center px-4 h-12 bg-background rounded-xl border border-border-color text-white font-medium">
                  {userData.telefone}
                </div>
              </div>
            </div>
          </div>

          {/* Settings List */}
          <div className="bg-surface rounded-2xl border border-border-color overflow-hidden">
            <div className="p-6 pb-2">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">settings</span>
                Configurações do App
              </h4>
            </div>

            <div className="divide-y divide-border-color">
              {/* Change Password */}
              <button className="w-full flex items-center justify-between p-6 hover:bg-slate-700/30 transition-colors group text-left">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-700/50 p-2 rounded-lg text-white">
                    <span className="material-symbols-outlined">lock</span>
                  </div>
                  <div>
                    <p className="font-bold text-white">Alterar Senha</p>
                    <p className="text-sm text-text-secondary">Atualize sua segurança</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>

              {/* Notifications */}
              <button className="w-full flex items-center justify-between p-6 hover:bg-slate-700/30 transition-colors group text-left">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-700/50 p-2 rounded-lg text-white">
                    <span className="material-symbols-outlined">notifications</span>
                  </div>
                  <div>
                    <p className="font-bold text-white">Notificações</p>
                    <p className="text-sm text-text-secondary">Gerencie alertas de treino</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>

              {/* Language */}
              <button className="w-full flex items-center justify-between p-6 hover:bg-slate-700/30 transition-colors group text-left">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-700/50 p-2 rounded-lg text-white">
                    <span className="material-symbols-outlined">language</span>
                  </div>
                  <div>
                    <p className="font-bold text-white">Idioma</p>
                    <p className="text-sm text-text-secondary">Português (BR)</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-6 hover:bg-red-500/10 transition-colors group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-red-500/20 p-2 rounded-lg text-red-400">
                    <span className="material-symbols-outlined">logout</span>
                  </div>
                  <div>
                    <p className="font-bold text-red-400">Sair da Conta</p>
                    <p className="text-sm text-text-secondary">Fazer logout do dispositivo</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleDeleteAccount}
              className="text-sm text-red-400 hover:text-red-300 underline underline-offset-4 decoration-red-400/30"
            >
              Excluir minha conta permanentemente
            </button>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}

export default Profile;
