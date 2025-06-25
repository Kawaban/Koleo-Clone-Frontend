import React, { useEffect, useState } from 'react';
import './PopularConnections.css';
import { useNavigate } from 'react-router-dom';
import boliwiaImage from '../assets/boliwia_1.jpg'; 
import lublinImage from '../assets/lublin_1.jpg'; 

interface Segment {
  departure_station: string;
  arrival_station: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  train_number: string;
  price: string;
}

interface RouteSummary {
  departure_station: string;
  arrival_station: string;
  departure_time: string;
  arrival_time: string;
  total_duration: string;
  total_price: string;
  transfers: number;
}

interface Route {
  summary: RouteSummary;
  segments: Segment[];
}

interface ConnectionProps {
  from: string;
  to: string;
  price: string;
  onClick: () => void;
  image: string; 
}

const ConnectionCard: React.FC<ConnectionProps> = ({ from, to, price, onClick, image }) => {
  return (
    <div className="connection-card" onClick={onClick}>
      <img src={image} alt={`${from} to ${to}`} className="connection-image" />
      <p className="connection-details">{from} -&gt; {to}</p>
      <p className="connection-price">{price}</p>
    </div>
  );
};

const PopularConnections: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPopularConnections = async () => {
      setLoading(true);
      setError(null);

      const popularRoutes = [
        {
          departure_station: "Wrocław Główny",
          arrival_station: "Poznań Główny",
          date: new Date().toISOString().split('T')[0]
        },
        {
          departure_station: "Kraków Główny",
          arrival_station: "Poznań Główny",
          date: new Date().toISOString().split('T')[0]
        }
      ];

      try {
        const results = await Promise.all(
          popularRoutes.map(route =>
            fetch('http://localhost:8000/connections/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(route),
            }).then(response => response.json())
          )
        );

      const firstRoutes = results
        .map(data => (data.routes && data.routes.length > 0) ? data.routes[0] : null)
        .filter((route): route is Route => route !== null);
      
      setRoutes(firstRoutes);
      } catch (error) {
        setError('Failed to fetch connections');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularConnections();
  }, []);

  const handleConnectionClick = (route: Route) => {
    navigate('/map', {
      state: {
        fromStation: route.summary.departure_station,
        toStation: route.summary.arrival_station,
        date: new Date().toISOString().split('T')[0]
      }
    });
  };

  return (
    <section className="popular-connections-section">
      <div className="popular-connections-header">
        <h2 className="section-title">Najpopularniejsze połączenia!</h2>
      </div>
      <div className="connections-grid">
        {loading && <p>Ładowanie połączeń...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && routes.map((route, index) => (
          <ConnectionCard
            key={index}
            from={route.summary.departure_station}
            to={route.summary.arrival_station}
            price={`${parseFloat(route.summary.total_price).toFixed(2)} PLN`}
            onClick={() => handleConnectionClick(route)}
            image={index === 0 ? boliwiaImage : lublinImage}
          />
        ))}
      </div>
    </section>
  );
};

export default PopularConnections;