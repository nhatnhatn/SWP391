import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/manager/Login';
import Register from './pages/manager/Register';
import Dashboard from './pages/manager/Dashboard';
import Players from './pages/manager/Players';
import Pets from './pages/manager/Pets';
import Items from './pages/manager/Items';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/players" element={<Players />} />
                  <Route path="/pets" element={<Pets />} />
                  <Route path="/items" element={<Items />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
