import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AvailableConnections.css';

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

interface AvailableConnectionsProps {
  routes: Route[];
  onRouteSelect?: (index: number) => void;
  selectedRoute?: number | null;
  routeColors: string[];
}

const formatDuration = (duration: string): string => {
  const durationInSeconds = parseFloat(duration);
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  return `${hours}h ${minutes}min`;
};

const formatWaitingTime = (prevArrival: string, nextDeparture: string): string => {
  const arrival = new Date(`1970-01-01T${prevArrival}`);
  const departure = new Date(`1970-01-01T${nextDeparture}`);
  const diff = Math.abs(departure.getTime() - arrival.getTime());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}min oczekiwania`;
};

const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  return `${hours}:${minutes}`;
};

const formatPrice = (price: string): string => {
  return `${parseFloat(price).toFixed(2)} PLN`;
};

const AvailableConnections: React.FC<AvailableConnectionsProps> = ({ routes, onRouteSelect, selectedRoute, routeColors }) => {
  const [expandedRoute, setExpandedRoute] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleBuyTicket = (segment: Segment) => {
    navigate('/buy-ticket', {
      state: {
        trainNumber: segment.train_number,
        from: segment.departure_station,
        to: segment.arrival_station,
        departureTime: segment.departure_time,
        arrivalTime: segment.arrival_time,
        price: segment.price
      }
    });
  };

  if (routes.length === 0) {
    return (
      <div className="no-connections">
        Nie znaleziono połączeń dla wybranej trasy i daty.
      </div>
    );
  }

  const toggleExpand = (index: number) => {
    setExpandedRoute(expandedRoute === index ? null : index);
    if (onRouteSelect) {
      onRouteSelect(index);
    }
  };

  return (
    <div className="available-connections">
      <h2>Dostępne połączenia</h2>
      <div className="connections-list">
        {routes.map((route, index) => (
          <div 
            key={index} 
            className={`connection-card ${expandedRoute === index ? 'expanded' : ''} ${selectedRoute === index ? 'selected' : ''}`}
            onClick={() => toggleExpand(index)}
            style={{
              borderColor: routeColors[index],
              boxShadow: selectedRoute === index ? `0 0 0 2px ${routeColors[index]}40` : undefined
            }}
          >
            <div className="connection-header">
              <div className="route">
                <span className="station">{route.summary.departure_station}</span>
                <span className="arrow">→</span>
                <span className="station">{route.summary.arrival_station}</span>
              </div>
              <div className="price" style={{ color: routeColors[index] }}>{formatPrice(route.summary.total_price)}</div>
            </div>
            
            <div className="time-info">
              <div className="departure">
                <span className="label">Odjazd:</span>
                <span className="time">{formatTime(route.summary.departure_time)}</span>
              </div>
              <div className="duration">
                <span className="label">Czas podróży:</span>
                <span className="time">{formatDuration(route.summary.total_duration)}</span>
              </div>
              <div className="arrival">
                <span className="label">Przyjazd:</span>
                <span className="time">{formatTime(route.summary.arrival_time)}</span>
              </div>
            </div>
            
            <div className="additional-info">
              <div className="trains">
                <span className="label">Pociągi:</span>
                <span className="value">{route.segments.map(seg => seg.train_number).join(', ')}</span>
              </div>
              <div className="changes">
                <span className="label">Przesiadki:</span>
                <span className="value">{route.summary.transfers}</span>
              </div>
            </div>

            {expandedRoute === index && (
              <div className="sub-connections">
                <h3>Szczegóły podróży</h3>
                {route.segments.map((segment, segIndex) => (
                  <React.Fragment key={segIndex}>
                    <div className="sub-connection">
                      <div className="sub-connection-header">
                        <span className="train-number">Pociąg {segment.train_number}</span>
                        <span className="sub-price">{formatPrice(segment.price)}</span>
                      </div>
                      <div className="sub-route">
                        <div className="sub-station">
                          <span className="time">{formatTime(segment.departure_time)}</span>
                          <span className="name">{segment.departure_station}</span>
                        </div>
                        <div className="sub-duration">
                          {formatDuration(segment.duration)}
                        </div>
                        <div className="sub-station">
                          <span className="time">{formatTime(segment.arrival_time)}</span>
                          <span className="name">{segment.arrival_station}</span>
                        </div>
                      </div>
                      <div className="sub-connection-footer">
                        <button 
                          className="buy-ticket-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuyTicket(segment);
                          }}
                        >
                          Kup bilet
                        </button>
                      </div>
                    </div>
                    {segIndex < route.segments.length - 1 && (
                      <div className="waiting-time">
                        <span>
                          {formatWaitingTime(
                            segment.arrival_time,
                            route.segments[segIndex + 1].departure_time
                          )}
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