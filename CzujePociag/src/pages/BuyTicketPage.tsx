import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './BuyTicketPage.css';
import mapImage from '../assets/map.png';
import SeatMap from '../components/SeatMap';

interface Location {
  id: number;
  name: string;
  x: number;
  y: number;
}

interface Seat {
  id: string;
  seat_number: string;
  is_available: boolean;
}

interface Wagon {
  id: string;
  wagon_number: string;
  seats: Seat[];
}

interface BuyTicketPageProps {
  locations: Location[];
}

const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  return `${hours}:${minutes}`;
};

const BuyTicketPage: React.FC<BuyTicketPageProps> = ({ locations }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [wagons, setWagons] = useState<Wagon[]>([]);
  const [selectedWagon, setSelectedWagon] = useState<string>('');
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectionDetails = location.state as {
    trainNumber: string;
    from: string;
    to: string;
    departureTime: string;
    arrivalTime: string;
    price: string;
  } | null;

  useEffect(() => {
    if (!connectionDetails) {
      navigate('/', { replace: true });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchTrainDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:8000/trains/${connectionDetails.trainNumber}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate('/login', { replace: true });
            return;
          }
          throw new Error('Failed to fetch train details');
        }

        const data = await response.json();
        setWagons(data.content.wagons);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch train details');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainDetails();
  }, [connectionDetails, navigate]);

  const handleBuyTicket = async () => {
    if (!selectedWagon || !selectedSeat) {
      setError('Proszę wybrać wagon i miejsce');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Format departure and arrival times to ISO format
      const departureDateTime = `${today}T${connectionDetails?.departureTime}:00`;
      const arrivalDateTime = `${today}T${connectionDetails?.arrivalTime}:00`;

      const response = await fetch('http://localhost:8000/tickets/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          seat_number: selectedSeat,
          wagon_number: selectedWagon,
          train_number: connectionDetails?.trainNumber,
          departure_station: connectionDetails?.from,
          arrival_station: connectionDetails?.to,
          departure_time: departureDateTime,
          arrival_time: arrivalDateTime,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login', { replace: true });
          return;
        }
        const data = await response.json();
        throw new Error(data.error || 'Failed to purchase ticket');
      }

      navigate('/ticket-confirmation', { replace: true });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to purchase ticket');
    }
  };

  // Find the locations for the connection
  const fromLocation = locations.find(loc => loc.name === connectionDetails?.from);
  const toLocation = locations.find(loc => loc.name === connectionDetails?.to);

  return (
    <div className="buy-ticket-page">
      <div className="map-section">
        <div className="map-image-wrapper">
          <img src={mapImage} alt="Map" className="map-image" />
          <svg className="map-overlay" viewBox="0 0 1110 1030">
            {fromLocation && toLocation && (
              <line
                x1={fromLocation.x}
                y1={fromLocation.y}
                x2={toLocation.x}
                y2={toLocation.y}
                stroke="#2ecc71"
                strokeWidth="8"
                className="map-connection-line"
              />
            )}
            {locations.map(location => (
              <g key={location.id}>
                <circle
                  cx={location.x}
                  cy={location.y}
                  r="8"
                  className={`map-location-dot ${
                    location.name === connectionDetails?.from || location.name === connectionDetails?.to
                      ? 'highlighted'
                      : ''
                  }`}
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

      <div className="ticket-section">
        <h2>Kup bilet</h2>
        {connectionDetails && (
          <div className="connection-details">
            <div className="route">
              <span className="station">{connectionDetails.from}</span>
              <span className="arrow">→</span>
              <span className="station">{connectionDetails.to}</span>
            </div>
            <div className="time-info">
              <div>
                <span className="label">Odjazd:</span>
                <span className="value">{formatTime(connectionDetails.departureTime)}</span>
              </div>
              <div>
                <span className="label">Przyjazd:</span>
                <span className="value">{formatTime(connectionDetails.arrivalTime)}</span>
              </div>
            </div>
            <div className="price">
              <span className="label">Cena:</span>
              <span className="value">{connectionDetails.price}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading">Ładowanie informacji o pociągu...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="seat-selection">
            <div className="wagon-selection">
              <h3>Wybierz wagon:</h3>
              <div className="wagon-list">
                {wagons.map(wagon => (
                  <button
                    key={wagon.id}
                    className={`wagon-button ${selectedWagon === wagon.wagon_number ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedWagon(wagon.wagon_number);
                      setSelectedSeat('');
                    }}
                  >
                    Wagon {wagon.wagon_number}
                  </button>
                ))}
              </div>
            </div>

            {selectedWagon && (
              <div className="seat-selection">
                <h3>Wybierz miejsce:</h3>
                <SeatMap
                  seats={wagons.find(w => w.wagon_number === selectedWagon)?.seats || []}
                  selectedSeat={selectedSeat}
                  onSeatSelect={setSelectedSeat}
                />
              </div>
            )}

            <button
              className="buy-button"
              onClick={handleBuyTicket}
              disabled={!selectedWagon || !selectedSeat}
            >
              Kup bilet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyTicketPage; 