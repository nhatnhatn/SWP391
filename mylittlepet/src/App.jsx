import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Players from './pages/Players';
import Pets from './pages/Pets';
import Items from './pages/Items';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/players" element={<Players />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/items" element={<Items />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
