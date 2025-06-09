import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContextV2';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/manager/Login';
import Register from './pages/manager/Register';
import PlayersV2 from './pages/manager/PlayersV2';
import Pets from './pages/manager/Pets';
import Items from './pages/manager/Items';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={<ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/players" replace />} />
                  <Route path="/players" element={<PlayersV2 />} />
                  <Route path="/pets" element={<Pets />} />
                  <Route path="/items" element={<Items />} />
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
