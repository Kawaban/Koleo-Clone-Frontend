import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AvailableConnections.css';

interface SubConnection {
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  trainNumber: string;
  price: string;
}

interface Connection {
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  date: string;
  totalPrice: string;
  trains: string[];
  subConnections: SubConnection[];
  numberOfChanges: number;
}

interface AvailableConnectionsProps {
  connections: Connection[];
}

const formatDuration = (departureTime: string, arrivalTime: string): string => {
  const departure = new Date(departureTime);
  const arrival = new Date(arrivalTime);
  const diff = Math.abs(arrival.getTime() - departure.getTime());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}min`;
};

const formatWaitingTime = (prevArrival: string, nextDeparture: string): string => {
  const arrival = new Date(prevArrival);
  const departure = new Date(nextDeparture);
  const diff = Math.abs(departure.getTime() - arrival.getTime());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}min oczekiwania`;
};

const formatTime = (timeString: string): string => {
  const date = new Date(timeString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
};

const AvailableConnections: React.FC<AvailableConnectionsProps> = ({ connections }) => {
  const [expandedConnection, setExpandedConnection] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleBuyTicket = (subConn: SubConnection) => {
    // Navigate to ticket purchase page with connection details
    navigate('/buy-ticket', {
      state: {
        trainNumber: subConn.trainNumber,
        from: subConn.from,
        to: subConn.to,
        departureTime: subConn.departureTime,
        arrivalTime: subConn.arrivalTime,
        price: subConn.price
      }
    });
  };

  if (connections.length === 0) {
    return (
      <div className="no-connections">
        Nie znaleziono połączeń dla wybranej trasy i daty.
      </div>
    );
  }

  const toggleExpand = (index: number) => {
    setExpandedConnection(expandedConnection === index ? null : index);
  };

  return (
    <div className="available-connections">
      <h2>Dostępne połączenia</h2>
      <div className="connections-list">
        {connections.map((connection, index) => (
          <div 
            key={index} 
            className={`connection-card ${expandedConnection === index ? 'expanded' : ''}`}
            onClick={() => toggleExpand(index)}
          >
            <div className="connection-header">
              <div className="route">
                <span className="station">{connection.from}</span>
                <span className="arrow">→</span>
                <span className="station">{connection.to}</span>
              </div>
              <div className="price">{connection.totalPrice}</div>
            </div>
            
              <div className="time-info">
                <div className="departure">
                <span className="label">Odjazd:</span>
                <span className="time">{formatTime(connection.departureTime)}</span>
              </div>
              <div className="duration">
                <span className="label">Czas podróży:</span>
                <span className="time">{formatDuration(connection.departureTime, connection.arrivalTime)}</span>
                </div>
                <div className="arrival">
                <span className="label">Przyjazd:</span>
                <span className="time">{formatTime(connection.arrivalTime)}</span>
              </div>
            </div>
            
              <div className="additional-info">
              <div className="trains">
                <span className="label">Pociągi:</span>
                <span className="value">{connection.trains.join(', ')}</span>
                </div>
              <div className="changes">
                <span className="label">Przesiadki:</span>
                <span className="value">{connection.numberOfChanges}</span>
              </div>
            </div>

            {expandedConnection === index && (
              <div className="sub-connections">
                <h3>Szczegóły podróży</h3>
                {connection.subConnections.map((subConn, subIndex) => (
                  <React.Fragment key={subIndex}>
                    <div className="sub-connection">
                      <div className="sub-connection-header">
                        <span className="train-number">Pociąg {subConn.trainNumber}</span>
                        <span className="sub-price">{subConn.price}</span>
                      </div>
                      <div className="sub-route">
                        <div className="sub-station">
                          <span className="time">{formatTime(subConn.departureTime)}</span>
                          <span className="name">{subConn.from}</span>
                        </div>
                        <div className="sub-duration">
                          {formatDuration(subConn.departureTime, subConn.arrivalTime)}
                        </div>
                        <div className="sub-station">
                          <span className="time">{formatTime(subConn.arrivalTime)}</span>
                          <span className="name">{subConn.to}</span>
                        </div>
                      </div>
                      <div className="sub-connection-footer">
                        <button 
                          className="buy-ticket-button"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card expansion toggle
                            handleBuyTicket(subConn);
                          }}
                        >
                          Kup bilet
                        </button>
                      </div>
                    </div>
                    {subIndex < connection.subConnections.length - 1 && (
                      <div className="waiting-time">
                        <span>
                          {formatWaitingTime(
                            subConn.arrivalTime,
                            connection.subConnections[subIndex + 1].departureTime
                          ).replace('oczekiwania', 'oczekiwania')}
                        </span>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableConnections; 