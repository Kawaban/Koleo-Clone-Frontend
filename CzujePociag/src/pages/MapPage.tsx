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

interface Path {
  connections: [number, number][];
  color: string;
}

interface MapPageProps {
  locations: Location[];
}

interface Connection {
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  date: string;
  totalPrice: string;
  trains: string[];
  subConnections: {
    from: string;
    to: string;
    departureTime: string;
    arrivalTime: string;
    trainNumber: string;
  price: string;
  }[];
  numberOfChanges: number;
}

const MapPage: React.FC<MapPageProps> = ({ locations }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = location.state as { fromStation: string; toStation: string; date: string } | null;
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If there are no search parameters, redirect to home page
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

        // Transform the connections data to match our interface
        const transformedConnections = [];
        
        if (data.content.length > 0) {
          // Create a single journey from all connections
          const journey = {
            from: data.content[0].departure_station,
            to: data.content[data.content.length - 1].arrival_station,
            departureTime: `${searchParams.date}T${data.content[0].departure_time}`,
            arrivalTime: `${searchParams.date}T${data.content[data.content.length - 1].arrival_time}`,
            date: searchParams.date,
            totalPrice: data.content.reduce((total: number, conn: any) => 
              total + parseFloat(conn.price), 0).toFixed(2) + 'PLN',
            trains: data.content.map((conn: any) => conn.train_number),
            subConnections: data.content.map((conn: any) => ({
          from: conn.departure_station,
          to: conn.arrival_station,
              departureTime: `${searchParams.date}T${conn.departure_time}`,
              arrivalTime: `${searchParams.date}T${conn.arrival_time}`,
              trainNumber: conn.train_number,
              price: `${conn.price}PLN`
            })),
            numberOfChanges: data.content.length - 1
          };

          transformedConnections.push(journey);
        }

        setConnections(transformedConnections);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch connections');
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [searchParams, navigate]);

  // Generate paths from connections
  const generatePaths = (): Path[] => {
    if (!connections.length) return [];

    const colors = ['#FF4D4F', '#1890FF', '#52C41A', '#722ED1', '#FA8C16'];
    
    return connections.map((connection, index) => {
      // Create path segments for each sub-connection
      const pathSegments: [number, number][] = [];
      
      connection.subConnections.forEach(subConn => {
        const fromLocation = locations.find(loc => loc.name === subConn.from);
        const toLocation = locations.find(loc => loc.name === subConn.to);
      
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

  return (
    <div className="map-page">
      <div className="map-section">
        <div className="map-image-wrapper">
          <img src={mapImage} alt="Map" className="map-image" />
          <svg className="map-overlay" viewBox="0 0 1110 1030">
            {paths.map((path, pathIndex) => (
              <g key={`path-${pathIndex}`}>
                {path.connections.map(([fromId, toId], connectionIndex) => {
                  const fromLocation = locations.find(loc => loc.id === fromId);
                  const toLocation = locations.find(loc => loc.id === toId);

                  if (fromLocation && toLocation) {
                    return (
                      <line
                        key={`${pathIndex}-${connectionIndex}`}
                        x1={fromLocation.x}
                        y1={fromLocation.y}
                        x2={toLocation.x}
                        y2={toLocation.y}
                        stroke={path.color}
                        strokeWidth="4"
                        className="map-connection-line"
                      />
                    );
                  }
                  return null;
                })}
              </g>
            ))}
            {locations.map(location => (
              <g key={location.id}>
                <circle
                  cx={location.x}
                  cy={location.y}
                  r="8"
                  className="map-location-dot"
                />
                <text
                  x={location.x}
                  y={location.y - 15}
                  textAnchor="middle"
                  className="map-location-label"
                  fill="#333"
                  fontSize="14"
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
        {!loading && !error && <AvailableConnections connections={connections} />}
      </div>
    </div>
  );
};

export default MapPage; 