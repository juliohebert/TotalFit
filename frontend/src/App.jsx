import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ExerciseDetail from './pages/ExerciseDetail';
import CreateWorkout from './pages/CreateWorkout';
import WorkoutExecutionNew from './pages/WorkoutExecutionNew';
import WorkoutDetail from './pages/WorkoutDetail';
import Profile from './pages/Profile';
import Diet from './pages/Diet';
import AddFood from './pages/AddFood';
import Workouts from './pages/Workouts';
import Progress from './pages/Progress';
import ExploreWorkouts from './pages/ExploreWorkouts';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Redireciona raiz para login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Rotas de Autenticação */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Dashboard */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          
          {/* Exercise Detail */}
          <Route path="/exercicio/:id" element={<PrivateRoute><ExerciseDetail /></PrivateRoute>} />
          
          {/* Create Workout */}
          <Route path="/treinos/novo" element={<PrivateRoute><CreateWorkout /></PrivateRoute>} />
          
          {/* Edit Workout - redireciona para criar novo por enquanto */}
          <Route path="/treinos/editar/:id" element={<PrivateRoute><CreateWorkout /></PrivateRoute>} />
          
          {/* Workout Detail */}
          <Route path="/treino/detalhes/:id" element={<PrivateRoute><WorkoutDetail /></PrivateRoute>} />
          
          {/* Workout Execution */}
          <Route path="/treino/executar/:id" element={<PrivateRoute><WorkoutExecutionNew /></PrivateRoute>} />
          
          {/* Profile */}
          <Route path="/perfil" element={<PrivateRoute><Profile /></PrivateRoute>} />
          
          {/* Diet */}
          <Route path="/dieta" element={<PrivateRoute><Diet /></PrivateRoute>} />
          
          {/* Add Food */}
          <Route path="/dieta/adicionar" element={<PrivateRoute><AddFood /></PrivateRoute>} />
          
          {/* Workouts */}
          <Route path="/treinos" element={<PrivateRoute><Workouts /></PrivateRoute>} />
          
          {/* Explore Workouts */}
          <Route path="/treinos/explorar" element={<PrivateRoute><ExploreWorkouts /></PrivateRoute>} />
          
          {/* Progress */}
          <Route path="/progresso" element={<PrivateRoute><Progress /></PrivateRoute>} />
          
          {/* Rota 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
