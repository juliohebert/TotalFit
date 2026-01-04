import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário no localStorage
    const storedUser = localStorage.getItem('totalfit_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        localStorage.removeItem('totalfit_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('totalfit_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('totalfit_user');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('totalfit_user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
