import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatbotProvider } from './context/ChatbotContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';

const Placeholder = ({ title }) => (
  <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-white mb-4">{title}</h1>
      <p className="text-[var(--text-secondary)]">Coming soon...</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ChatbotProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<Placeholder title="Transaction History" />} />
            <Route path="/alerts" element={<Placeholder title="Real-time Alerts" />} />
            <Route path="/settings" element={<Placeholder title="Settings" />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
        <Chatbot />
      </ChatbotProvider>
    </AuthProvider>
  );
}

export default App;
