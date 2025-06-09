import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContextV2';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ConnectionStatus from './components/ConnectionStatus';
import Login from './pages/manager/Login';
import Register from './pages/manager/Register';
import PlayersV2 from './pages/manager/PlayersV2';
import PetsV2 from './pages/manager/PetsV2';
import ItemsV2 from './pages/manager/ItemsV2';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <ConnectionStatus />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/players" replace />} />
                    <Route path="/players" element={<PlayersV2 />} />
                    <Route path="/pets" element={<PetsV2 />} />
                    <Route path="/items" element={<ItemsV2 />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
