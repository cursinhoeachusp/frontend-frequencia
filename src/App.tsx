import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Leitor from './pages/Leitor';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/leitor" element={<Leitor />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}