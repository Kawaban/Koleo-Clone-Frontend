import React, { useEffect, useState } from 'react';
import './PopularConnections.css';
import { useNavigate } from 'react-router-dom';
import boliwiaImage from '../assets/boliwia_1.jpg'; 
import lublinImage from '../assets/lublin_1.jpg'; 

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
  const [connections, setConnections] = useState<Connection[]>([]);
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

        const transformedConnections = results.map(data => {
          if (data.content && data.content.length > 0) {
            return {
              from: data.content[0].departure_station,
              to: data.content[data.content.length - 1].arrival_station,
              departureTime: `${data.content[0].departure_time}`,
              arrivalTime: `${data.content[data.content.length - 1].arrival_time}`,
              date: popularRoutes[0].date,
              totalPrice: data.content.reduce((total: number, conn: any) => 
                total + parseFloat(conn.price), 0).toFixed(2),
              trains: data.content.map((conn: any) => conn.train_number),
              subConnections: data.content.map((conn: any) => ({
                from: conn.departure_station,
                to: conn.arrival_station,
                departureTime: conn.departure_time,
                arrivalTime: conn.arrival_time,
                trainNumber: conn.train_number,
                price: conn.price
              })),
              numberOfChanges: data.content.length - 1
            };
          }
          return null;
        }).filter((conn): conn is Connection => conn !== null);

        setConnections(transformedConnections);
      } catch (error) {
        setError('Failed to fetch connections');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularConnections();
  }, []);

  const handleConnectionClick = (connection: Connection) => {
    navigate('/map', {
      state: {
        fromStation: connection.from,
        toStation: connection.to,
        date: connection.date
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
        {!loading && !error && connections.map((connection, index) => (
        <ConnectionCard
            key={index}
            from={connection.from}
            to={connection.to}
            price={`${connection.totalPrice} PLN`}
            onClick={() => handleConnectionClick(connection)}
            image={index === 0 ? boliwiaImage : lublinImage}
        />
        ))}
      </div>
    </section>
  );
};

export default PopularConnections;