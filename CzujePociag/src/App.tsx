import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import './App.css'; 
import MapPage from './pages/MapPage';
import LoginPage from './pages/LoginPage';
import CreateAccountPage from './pages/CreateAccountPage';
import BuyTicketPage from './pages/BuyTicketPage';
import TicketConfirmationPage from './pages/TicketConfirmationPage';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';

export const MAP_WIDTH = 1110; 
export const MAP_HEIGHT = 1030; 

export const POLAND_BOUNDS = {
  lonMin: 14.12,
  latMin: 49.0,
  lonMax: 24.15,
  latMax: 55.03,
};

export const cities = [
  { id: 1, name: 'Warszawa Centralna', lat: 52.2297, lon: 21.0122 },
  { id: 2, name: 'Kraków Główny', lat: 50.0647, lon: 19.9450 },
  { id: 3, name: 'Wrocław Główny', lat: 51.1079, lon: 17.0385 },
  { id: 4, name: 'Gdańsk Główny', lat: 54.4520, lon: 18.6466 },
  { id: 5, name: 'Poznań Główny', lat: 52.4064, lon: 16.9252 },
];

export function project(lat: number, lon: number) {
  const x = ((lon - POLAND_BOUNDS.lonMin) / (POLAND_BOUNDS.lonMax - POLAND_BOUNDS.lonMin)) * MAP_WIDTH;
  const y = ((POLAND_BOUNDS.latMax - lat) / (POLAND_BOUNDS.latMax - POLAND_BOUNDS.latMin)) * MAP_HEIGHT;
  return { x, y };
}

function App() {
  const locations = cities.map(city => ({
    id: city.id,
    name: city.name,
    ...project(city.lat, city.lon),
  }));

  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<CreateAccountPage />} />
            <Route path="/map" element={<MapPage locations={locations} />} />

            {/* Protected routes */}
            <Route 
              path="/buy-ticket" 
              element={
                <ProtectedRoute>
                  <BuyTicketPage locations={locations} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ticket-confirmation" 
              element={
                <ProtectedRoute>
                  <TicketConfirmationPage />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;