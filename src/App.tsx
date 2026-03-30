import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import Community from './pages/Community';
import Reports from './pages/Reports';
import Nutrition from './pages/Nutrition';
import SOS from './pages/SOS';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="chatbot" element={<Chatbot />} />
              <Route path="community" element={<Community />} />
              <Route path="reports" element={<Reports />} />
              <Route path="nutrition" element={<Nutrition />} />
              <Route path="sos" element={<SOS />} />
              <Route path="onboarding" element={<Onboarding />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
