import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContextV2';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/manager/Login';
import Register from './pages/manager/Register';
import PlayersSimple from './pages/manager/PlayersSimple';
import PetManagement from './pages/manager/PetManagement';
import ShopProductManagement from './pages/manager/ShopProductManagement';
import { useLocation } from 'react-router-dom';

// Simple debug component to test routing
const DebugPage = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-green-600 mb-6">✅ Debug Page - Authentication Working!</h1>
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <p className="text-lg text-green-800">🎉 If you can see this, authentication and routing are working correctly!</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>Is Authenticated:</strong> <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>{isAuthenticated ? '✅ Yes' : '❌ No'}</span></p>
            <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
            <p><strong>User Name:</strong> {user?.name || 'N/A'}</p>
            <p><strong>User Role:</strong> {user?.role || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3">Current Route</h2>
          <div className="space-y-2">
            <p><strong>Path:</strong> {location.pathname}</p>
            <p><strong>Search:</strong> {location.search || 'None'}</p>
            <p><strong>Hash:</strong> {location.hash || 'None'}</p>
          </div>
        </div>
      </div>      <div className="mt-6 flex gap-4">
        <Link to="/players" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Go to Players
        </Link>
        <Link to="/pets" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Go to Pets
        </Link>
        <Link to="/items" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
          Go to Items
        </Link>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Clear Auth & Reload
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>

      <Router>
        {/* <ConnectionStatus /> */}          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>                <Routes>
                <Route path="/" element={<Navigate to="/shop-products" replace />} />                
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
            </ProtectedRoute>
          } />
        </Routes>
      </Router>


    </AuthProvider>
  );
}

export default App;
