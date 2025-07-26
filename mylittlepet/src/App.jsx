import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContextV2';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/manager/Login';
import Register from './pages/manager/Register';
import PlayersSimple from './pages/manager/PlayersSimple';
import PetManagement from './pages/manager/PetManagement';
import ShopProductManagement from './pages/manager/ShopProductManagement';

// Component to handle redirect based on localStorage
const DefaultRedirect = () => {
  const lastPath = localStorage.getItem('lastVisitedPath');
  const validPaths = ['/players', '/pets', '/shop-products'];

  // If lastPath exists and is valid, redirect there, otherwise default to shop-products
  const redirectTo = (lastPath && validPaths.includes(lastPath)) ? lastPath : '/players';

  return <Navigate to={redirectTo} replace />;
};

// Component để track và lưu current path
const PathTracker = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Chỉ lưu những path chính, không lưu path con hay query params
    const validPaths = ['/players', '/pets', '/shop-products'];
    if (validPaths.includes(location.pathname)) {
      localStorage.setItem('lastVisitedPath', location.pathname);
    }
  }, [location.pathname]);

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* <ConnectionStatus /> */}          
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <PathTracker>
                <Layout>
                  <Routes>
                    <Route path="/" element={<DefaultRedirect />} />
                    <Route path="players" element={<PlayersSimple />} />
                    <Route path="pets" element={<PetManagement />} />
                    <Route path="shop-products" element={<ShopProductManagement />} />
                    <Route path="*" element={
                      <div className="p-8 text-center">
                        <h1 className="text-2xl font-bold text-red-600">404 - Page Not Found</h1>
                        <p className="mt-4">Current path: {window.location.pathname}</p>
                        <Link to="/players" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">
                          Go to Players
                        </Link>
                      </div>} />
                  </Routes>
                </Layout>
              </PathTracker>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
