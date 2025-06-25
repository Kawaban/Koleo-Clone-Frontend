import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './MapPage.css';
import mapImage from '../assets/map.png';
import AvailableConnections from '../components/AvailableConnections';

interface Location {
  id: number;
  name: string;
  x: number;
  y: number;
}

interface MapPageProps {
  locations: Location[];
}

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

interface Path {
  connections: [number, number][];
  color: string;
}

const MapPage: React.FC<MapPageProps> = ({ locations }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = location.state as { fromStation: string; toStation: string; date: string } | null;
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);

  useEffect(() => {
    if (!searchParams?.fromStation || !searchParams?.toStation || !searchParams?.date) {
      navigate('/', { replace: true });
      return;
    }

    const fetchConnections = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('http://localhost:8000/connections/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            arrival_station: searchParams.toStation,
            departure_station: searchParams.fromStation,
            date: searchParams.date
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || data.detail || 'Failed to fetch connections');
        }

        // Sort routes by departure time
        const sortedRoutes = [...(data.routes || [])].sort((a, b) => {
          const timeA = a.summary.departure_time;
          const timeB = b.summary.departure_time;
          return timeA.localeCompare(timeB);
        });

        setRoutes(sortedRoutes);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch connections');
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [searchParams, navigate]);

  const generatePaths = (): Path[] => {
    if (!routes.length) return [];

    const colors = ['#FF4D4F', '#1890FF', '#52C41A', '#722ED1', '#FA8C16'];
    
    return routes.map((route, index) => {
      const pathSegments: [number, number][] = [];
      
      route.segments.forEach(segment => {
        const fromLocation = locations.find(loc => loc.name === segment.departure_station);
        const toLocation = locations.find(loc => loc.name === segment.arrival_station);
      
        if (fromLocation && toLocation) {
          pathSegments.push([fromLocation.id, toLocation.id]);
        }
      });

      return {
        connections: pathSegments,
        color: colors[index % colors.length]
      };
    }).filter((path): path is Path => path.connections.length > 0);
  };

  const paths = generatePaths();
  const routeColors = paths.map(path => path.color);

  return (
    <div className="map-page">
      <div className="map-section">
        <div className="map-container">
          <img src={mapImage} alt="Mapa połączeń kolejowych" className="map-image" />
          <svg className="map-overlay" viewBox="0 0 1110 1030">
            {paths.map((path, pathIndex) => (
              <g key={pathIndex} style={{ opacity: selectedRoute === null || selectedRoute === pathIndex ? 1 : 0.3 }}>
                {path.connections.map(([fromId, toId], connIndex) => {
                  const fromLocation = locations.find((loc) => loc.id === fromId);
                  const toLocation = locations.find((loc) => loc.id === toId);
                  if (!fromLocation || !toLocation) return null;

                  return (
                    <line
                      key={connIndex}
                      x1={fromLocation.x}
                      y1={fromLocation.y}
                      x2={toLocation.x}
                      y2={toLocation.y}
                      stroke={path.color}
                      strokeWidth="6"
                      className="connection-line"
                    />
                  );
                })}
              </g>
            ))}
            {locations.map((location) => (
              <g key={location.id}>
                <circle
                  cx={location.x}
                  cy={location.y}
                  r="6"
                  className={`station-point ${
                    location.name === searchParams?.fromStation
                      ? 'from-station'
                      : location.name === searchParams?.toStation
                      ? 'to-station'
                      : ''
                  }`}
                />
                <text
                  x={location.x}
                  y={location.y - 15}
                  textAnchor="middle"
                  className="station-label"
                >
                  {location.name}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
      <div className="connections-section">
        {loading && <div className="loading">Wczytywanie połączeń...</div>}
        {error && <div className="error">{error}</div>}
        {!loading && !error && (
          <AvailableConnections 
            routes={routes} 
            onRouteSelect={(index) => setSelectedRoute(index === selectedRoute ? null : index)}
            selectedRoute={selectedRoute}
            routeColors={routeColors}
          />
        )}
      </div>
    </div>
  );
};

export default MapPage; 