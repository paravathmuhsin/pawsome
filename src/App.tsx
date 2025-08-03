import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { App as AntApp, Spin } from 'antd';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthPage } from './pages/Auth';
import { Profile } from './pages/Profile';
import './App.css';

// Lazy load the main pages
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const AdoptionPage = lazy(() => import('./pages/AdoptionPage').then(module => ({ default: module.AdoptionPage })));
const PollPage = lazy(() => import('./pages/PollPage').then(module => ({ default: module.PollPage })));
const EventPage = lazy(() => import('./pages/EventPage').then(module => ({ default: module.EventPage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(module => ({ default: module.NotificationsPage })));

// Loading component
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    flexDirection: 'column',
    gap: '16px'
  }}>
    <Spin size="large" />
    <span style={{ color: '#666' }}>Loading...</span>
  </div>
);

function App() {
  return (
    <AntApp>
      <AuthProvider>
        <Router future={{ v7_startTransition: true }}>
          <div style={{ 
            minHeight: '100vh', 
            backgroundColor: '#f5f5f5',
            width: '100%',
            margin: 0,
            padding: 0
          }}>
            <Navigation />
            
            <main>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  } />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/adoption" element={
                    <ProtectedRoute>
                      <AdoptionPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/polls" element={
                    <ProtectedRoute>
                      <PollPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/notifications" element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/events" element={
                    <ProtectedRoute>
                      <EventPage />
                    </ProtectedRoute>
                  } />
                </Routes>
              </Suspense>
            </main>
            
            <footer style={{ 
              textAlign: 'center', 
              padding: window.innerWidth < 768 ? '15px' : '20px',
              marginTop: '50px', 
              color: '#666',
              borderTop: '1px solid #e0e0e0',
              fontSize: window.innerWidth < 768 ? '0.8rem' : '1rem'
            }}>
              <p>Built with React, TypeScript, Vite, Firebase, and React Router</p>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </AntApp>
  );
}

export default App;
