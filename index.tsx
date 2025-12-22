import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import LandingPage from './LandingPage';
import InputPage from './pages/InputPage';
import ResultPage from './pages/ResultPage';
import DeepAnalysis from './pages/DeepAnalysis';
import CalendarPage from './pages/CalendarPage';
import CalendarTestPage from './pages/CalendarTestPage';
import DaewoonPage from './pages/DaewoonPage';
import DashboardPage from './pages/DashboardPage';
import FiveElementsOrbit from './pages/FiveElementsOrbit';
import YongsinPage from './pages/YongsinPage';
import MyEnergyPage from './pages/MyEnergyPage';

// Clerk Publishable Key 가져오기
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/input" element={<InputPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/deep-analysis" element={<DeepAnalysis />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/calendar-test" element={<CalendarTestPage />} />
          <Route path="/daewoon" element={<DaewoonPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/orbit" element={<FiveElementsOrbit />} />
          <Route path="/yongsin" element={<YongsinPage />} />
          <Route path="/my-energy" element={<MyEnergyPage />} />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
);
