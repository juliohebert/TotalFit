import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    nome: '',
    nome_exibicao: '',
    email: '',
    data_nascimento: '',
    telefone: '',
    peso: '',
    altura: '',
    gordura_corporal: '',
    meta_principal: '',
    foto_perfil: '',
    plano: '',
    nivel: '',
    meta_calorias: '',
    meta_proteinas: '',
    meta_carboidratos: '',
    meta_gorduras: '',
    meta_agua: '',
    criado_em: '',
    atualizado_em: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await axios.get(`/api/usuarios/${userId}`);
        setUserData(res.data);
      } catch (err) {
        setError('Erro ao carregar perfil');
      }
      setLoading(false);
    }
    fetchProfile();
  }, [userId, navigate]);

  const handleLogout = () => {
    // Futuramente: limpar localStorage/cookies
    navigate('/login');
  };


  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await axios.put(`/api/usuarios/${userId}`, userData);
      setUserData(res.data.usuario);
      setIsEditing(false);
    } catch (err) {
      console.error('Erro ao salvar:', err.response?.data || err.message);
      setError(err.response?.data?.erro || 'Erro ao salvar perfil');
    }
    setSaving(false);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB');
        return;
      }
      
      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione uma imagem válida');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData((prev) => ({ ...prev, foto_perfil: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Tem certeza que deseja excluir sua conta permanentemente? Esta ação não pode ser desfeita.')) {
      // Futuramente: chamar API de exclusão
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
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
          {loading ? (
            <div className="text-center text-white py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando perfil...</p>
            </div>
          ) : (
            <>
              {/* Page Heading */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-white">Meu Perfil</h2>
                  <p className="text-text-secondary mt-1">Gerencie suas informações e metas</p>
                </div>
                {!isEditing ? (
                  <button
                    onClick={handleEditProfile}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary/30 text-primary hover:bg-primary hover:text-slate-900 font-bold transition-all active:scale-95 group"
                  >
                    <span className="material-symbols-outlined text-[20px] group-hover:text-slate-900">edit</span>
                    <span>Editar Perfil</span>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-slate-900 font-bold transition-all active:scale-95 shadow disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[20px]">save</span>
                      {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 text-white hover:bg-slate-700 font-bold transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[20px]">close</span>
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              {error && <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">{error}</div>}

              {/* Profile Header Card */}
              <div className="bg-surface rounded-2xl p-6 lg:p-8 shadow-xl border border-border-color mb-6 relative overflow-hidden group">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full p-1 border-2 border-primary/30 bg-background">
                      <div
                        className="w-full h-full rounded-full bg-cover bg-center"
                        style={{ backgroundImage: `url('${userData.foto_perfil || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.nome || 'User')}')` }}
                      ></div>
                    </div>
                    {isEditing && (
                      <label htmlFor="photo-upload" className="absolute bottom-1 right-1 bg-primary text-slate-900 p-2 rounded-full hover:bg-emerald-400 transition-colors shadow-lg flex items-center justify-center cursor-pointer">
                        <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    {!isEditing ? (
                      <>
                        <h3 className="text-2xl font-bold text-white mb-1">{userData.nome_exibicao || userData.nome}</h3>
                        <p className="text-text-secondary text-sm mb-4">Membro desde {userData.criado_em ? new Date(userData.criado_em).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : ''}</p>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                          <span className="px-3 py-1 rounded-full bg-slate-700/50 text-xs font-medium text-slate-300 border border-slate-600">
                            {userData.plano || 'Gratuito'}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary border border-primary/20">
                            {userData.nivel || 'Iniciante'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          name="nome_exibicao"
                          value={userData.nome_exibicao || ''}
                          onChange={handleChange}
                          placeholder="Nome de Exibição"
                          className="mb-2 w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white"
                        />
                        <input
                          type="text"
                          name="nivel"
                          value={userData.nivel || ''}
                          onChange={handleChange}
                          placeholder="Nível (ex: Iniciante, Intermediário, Avançado)"
                          className="mb-2 w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white"
                        />
                        <input
                          type="text"
                          name="plano"
                          value={userData.plano || ''}
                          onChange={handleChange}
                          placeholder="Plano (ex: Gratuito, Premium)"
                          className="w-full px-3 py-2 rounded-xl bg-background border border-primary/30 text-white"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-surface p-5 rounded-2xl border border-border-color flex flex-col items-center justify-center text-center hover:border-primary/30 transition-colors">
                  <span className="text-text-secondary text-sm font-medium mb-1">Peso Atual</span>
                  {!isEditing ? (
                    <div className="text-2xl font-black text-white flex items-end gap-1">
                      {userData.peso || '--'} <span className="text-primary text-sm font-bold mb-1">kg</span>
                    </div>
                  ) : (
                    <input
                      type="number"
                      name="peso"
                      value={userData.peso || ''}
                      onChange={handleChange}
                      className="w-full px-2 py-1 rounded-xl bg-background border border-primary/30 text-white text-center"
                      placeholder="kg"
                    />
                  )}
                </div>
                <div className="bg-surface p-5 rounded-2xl border border-border-color flex flex-col items-center justify-center text-center hover:border-primary/30 transition-colors">
                  <span className="text-text-secondary text-sm font-medium mb-1">Altura</span>
                  {!isEditing ? (
                    <div className="text-2xl font-black text-white flex items-end gap-1">
                      {userData.altura || '--'} <span className="text-text-secondary text-sm font-bold mb-1">cm</span>
                    </div>
                  ) : (
                    <input
                      type="number"
                      name="altura"
                      value={userData.altura || ''}
                      onChange={handleChange}
                      className="w-full px-2 py-1 rounded-xl bg-background border border-primary/30 text-white text-center"
                      placeholder="cm"
                    />
                  )}
                </div>
                <div className="bg-surface p-5 rounded-2xl border border-border-color flex flex-col items-center justify-center text-center hover:border-primary/30 transition-colors">
                  <span className="text-text-secondary text-sm font-medium mb-1">Gordura Corporal</span>
                  {!isEditing ? (
                    <div className="text-2xl font-black text-white flex items-end gap-1">
                      {userData.gordura_corporal || '--'} <span className="text-text-secondary text-sm font-bold mb-1">%</span>
                    </div>
                  ) : (
                    <input
                      type="number"
                      name="gordura_corporal"
                      value={userData.gordura_corporal || ''}
                      onChange={handleChange}
                      className="w-full px-2 py-1 rounded-xl bg-background border border-primary/30 text-white text-center"
                      placeholder="%"
                    />
                  )}
                </div>
                <div className="bg-surface p-5 rounded-2xl border border-border-color flex flex-col items-center justify-center text-center hover:border-primary/30 transition-colors">
                  <span className="text-text-secondary text-sm font-medium mb-1">Meta Principal</span>
                  {!isEditing ? (
                    <div className="text-lg font-bold text-primary truncate w-full">
                      {userData.meta_principal || 'Definir meta'}
                    </div>
                  ) : (
                    <input
                      type="text"
                      name="meta_principal"
                      value={userData.meta_principal || ''}
                      onChange={handleChange}
                      className="w-full px-2 py-1 rounded-xl bg-background border border-primary/30 text-white text-center"
                      placeholder="Meta"
                    />
                  )}
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
                    {!isEditing ? (
                      <div className="flex items-center px-4 h-12 bg-background rounded-xl border border-border-color text-white font-medium">
                        {userData.nome || 'Não informado'}
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="nome"
                        value={userData.nome || ''}
                        onChange={handleChange}
                        className="px-4 h-12 rounded-xl bg-background border border-primary/30 text-white font-medium"
                        placeholder="Nome Completo"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-text-secondary text-sm font-medium">Email</label>
                    <div className="flex items-center px-4 h-12 bg-background rounded-xl border border-border-color text-white font-medium opacity-70">
                      {userData.email}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-text-secondary text-sm font-medium">Data de Nascimento</label>
                    {!isEditing ? (
                      <div className="flex items-center px-4 h-12 bg-background rounded-xl border border-border-color text-white font-medium">
                        {userData.data_nascimento ? new Date(userData.data_nascimento).toLocaleDateString('pt-BR') : 'Não informado'}
                      </div>
                    ) : (
                      <input
                        type="date"
                        name="data_nascimento"
                        value={userData.data_nascimento ? userData.data_nascimento.substring(0,10) : ''}
                        onChange={handleChange}
                        className="px-4 h-12 rounded-xl bg-background border border-primary/30 text-white font-medium"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-text-secondary text-sm font-medium">Telefone</label>
                    {!isEditing ? (
                      <div className="flex items-center px-4 h-12 bg-background rounded-xl border border-border-color text-white font-medium">
                        {userData.telefone || 'Não informado'}
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="telefone"
                        value={userData.telefone || ''}
                        onChange={handleChange}
                        className="px-4 h-12 rounded-xl bg-background border border-primary/30 text-white font-medium"
                        placeholder="(00) 00000-0000"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Metas Nutricionais Section */}
              <div className="bg-surface rounded-2xl p-6 lg:p-8 border border-border-color mb-6">
                <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">restaurant</span>
                  Metas Nutricionais Diárias
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-text-secondary text-sm font-medium">Calorias (kcal)</label>
                    {!isEditing ? (
                      <div className="flex items-center px-4 h-12 bg-background rounded-xl border border-border-color text-white font-medium">
                        {userData.meta_calorias || 'Não definida'}
                      </div>
                    ) : (
                      <input
                        type="number"
                        name="meta_calorias"
                        value={userData.meta_calorias || ''}
                        onChange={handleChange}
                        className="px-4 h-12 rounded-xl bg-background border border-primary/30 text-white font-medium"
                        placeholder="2000"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-text-secondary text-sm font-medium">Proteínas (g)</label>
                    {!isEditing ? (
                      <div className="flex items-center px-4 h-12 bg-background rounded-xl border border-border-color text-white font-medium">
                        {userData.meta_proteinas || 'Não definida'}
                      </div>
                    ) : (
                      <input
                        type="number"
                        name="meta_proteinas"
                        value={userData.meta_proteinas || ''}
                        onChange={handleChange}
                        className="px-4 h-12 rounded-xl bg-background border border-primary/30 text-white font-medium"
                        placeholder="150"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-text-secondary text-sm font-medium">Carboidratos (g)</label>
                    {!isEditing ? (
                      <div className="flex items-center px-4 h-12 bg-background rounded-xl border border-border-color text-white font-medium">
                        {userData.meta_carboidratos || 'Não definida'}
                      </div>
                    ) : (
                      <input
                        type="number"
                        name="meta_carboidratos"
                        value={userData.meta_carboidratos || ''}
                        onChange={handleChange}
                        className="px-4 h-12 rounded-xl bg-background border border-primary/30 text-white font-medium"
                        placeholder="200"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-text-secondary text-sm font-medium">Gorduras (g)</label>
                    {!isEditing ? (
                      <div className="flex items-center px-4 h-12 bg-background rounded-xl border border-border-color text-white font-medium">
                        {userData.meta_gorduras || 'Não definida'}
                      </div>
                    ) : (
                      <input
                        type="number"
                        name="meta_gorduras"
                        value={userData.meta_gorduras || ''}
                        onChange={handleChange}
                        className="px-4 h-12 rounded-xl bg-background border border-primary/30 text-white font-medium"
                        placeholder="60"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-text-secondary text-sm font-medium">Água (ml)</label>
                    {!isEditing ? (
                      <div className="flex items-center px-4 h-12 bg-background rounded-xl border border-border-color text-white font-medium">
                        {userData.meta_agua || 'Não definida'}
                      </div>
                    ) : (
                      <input
                        type="number"
                        name="meta_agua"
                        value={userData.meta_agua || ''}
                        onChange={handleChange}
                        className="px-4 h-12 rounded-xl bg-background border border-primary/30 text-white font-medium"
                        placeholder="2000"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Settings List */}
              <div className="bg-surface rounded-2xl border border-border-color overflow-hidden mb-6">
                <div className="p-6 pb-2">
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">settings</span>
                    Configurações do App
                  </h4>
                </div>
                <div className="divide-y divide-border-color">
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
            </>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}

export default Profile;
