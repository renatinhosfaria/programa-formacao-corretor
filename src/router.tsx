import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FormacaoCorretores from './pages/FormacaoCorretores';
import Inscricao from './pages/Inscricao';

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FormacaoCorretores />} />
        <Route path="/quero-ser-um-corretor" element={<FormacaoCorretores />} />
        <Route path="/inscricao" element={<Inscricao />} />
      </Routes>
    </Router>
  );
}