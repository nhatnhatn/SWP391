import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
// import ConnectionStatus from './components/ConnectionStatus'; // Removed as requested
import Login from './pages/manager/Login';
import Register from './pages/manager/Register';
import Players from './pages/manager/Players';
import Pets from './pages/manager/Pets';
import Items from './pages/manager/Items';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          {/* <ConnectionStatus /> */}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/debug" element={
              <ProtectedRoute>
                <DebugPage />
              </ProtectedRoute>
            } />
            <Route path="/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/players" replace />} />
                    <Route path="players" element={<PlayersV2 />} />
                    <Route path="pets" element={<PetsV2 />} />
                    <Route path="items" element={<ItemsV2 />} />
                    <Route path="*" element={
                      <div className="p-8 text-center">
                        <h1 className="text-2xl font-bold text-red-600">404 - Page Not Found</h1>
                        <p className="mt-4">Current path: {window.location.pathname}</p>
                        <Link to="/players" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">
                          Go to Players
                        </Link>
                      </div>
                    } />
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
