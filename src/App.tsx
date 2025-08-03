import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { App as AntApp } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { AuthPage } from './pages/Auth';
import { Profile } from './pages/Profile';
import { AdoptionPage } from './pages/AdoptionPage';
import { PollPage } from './pages/PollPage';
import { EventPage } from './pages/EventPage';
import './App.css';

function App() {
  return (
    <AntApp>
      <AuthProvider>
        <Router>
          <div style={{ 
            minHeight: '100vh', 
            backgroundColor: '#f5f5f5',
            width: '100%',
            margin: 0,
            padding: 0
          }}>
            <Navigation />
            
            <main>
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
                <Route path="/events" element={
                  <ProtectedRoute>
                    <EventPage />
                  </ProtectedRoute>
                } />
              </Routes>
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
