import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from 'react-router-dom';
import AdminDashboard from './components/admin/AdminDashboard';
import AuthForm from './components/AuthForm';
import ScanPage from './components/ScanPage';
import ResultsPage from './components/ResultsPage';

export default function App() {
  const [user, setUser] = useState(null);
  const handleLogin = u => setUser(u);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? <Navigate to="/scan" /> : <AuthForm onSuccess={handleLogin} />
          }
        />
        <Route
          path="/scan"
          element={user ? <ScanPage user={user} /> : <Navigate to="/" />}
        />
        <Route
          path="/results/:id"
          element={<ResultsWrapper />}
        />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

function ResultsWrapper() {
  const { id } = useParams();
  return <ResultsPage scanId={id} />;
}
