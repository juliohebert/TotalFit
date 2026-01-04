import { Navigate } from 'react-router-dom';

/**
 * PrivateRoute - Componente para proteger rotas que exigem autenticação
 * 
 * Uso:
 * <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
 */
function PrivateRoute({ children }) {
  // Verificar se há token no localStorage
  const token = localStorage.getItem('totalfit_token');
  const user = localStorage.getItem('totalfit_user');

  // Se não estiver autenticado, redireciona para login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Se autenticado, renderiza o componente filho
  return children;
}

export default PrivateRoute;
