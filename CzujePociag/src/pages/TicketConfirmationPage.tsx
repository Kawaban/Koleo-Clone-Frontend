import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TicketConfirmationPage.css';

interface Ticket {
  seat_number: string;
  wagon_number: string;
  train_number: string;
  departure_station: string;
  arrival_station: string;
  departure_time: string;
  arrival_time: string;
}

const TicketConfirmationPage: React.FC = () => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestTicket = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/tickets/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate('/login', { replace: true });
            return;
          }
          throw new Error('Failed to fetch ticket details');
        }

        const data = await response.json();
        // Assuming the latest ticket is the first one in the list
        if (data.content && data.content.length > 0) {
          setTicket(data.content[0]);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch ticket details');
      }
    };

    fetchLatestTicket();
  }, [navigate]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!ticket) {
    return <div className="loading">Ładowanie szczegółów biletu...</div>;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="ticket-confirmation-page">
      <div className="ticket-confirmation-container">
        <h1>Potwierdzenie zakupu biletu</h1>
        
        <div className="ticket-details">
          <div className="ticket-header">
            <h2>Bilet kolejowy</h2>
            <span className="train-number">{ticket.train_number}</span>
          </div>

          <div className="route-info">
              {/* <div className="station-info"> */}
                <div className="departure">
                  <h3 style={{marginTop: '0'}}>Stacja początkowa</h3>
                  <p>{ticket.departure_station}</p>
                  <p className="time">{formatDate(ticket.departure_time)}</p>
                </div>
                <div className="arrow">→</div>
                <div className="arrival">
                  <h3 style={{marginTop: '0'}}>Stacja końcowa</h3>
                  <p>{ticket.arrival_station}</p>
                  <p className="time">{formatDate(ticket.arrival_time)}</p>
                </div>
              {/* </div> */}
            {/* </div> */}
          </div>

          <div className="seat-info">
            <div className="wagon">
              <h3 style={{marginTop: '0'}}>Wagon</h3>
              <p style={{display: 'block'}}>{ticket.wagon_number}</p>
            </div>
            <div className="seat">
              <h3 style={{marginTop: '0'}}>Miejsce</h3>
              <p style={{display: 'block'}}>{ticket.seat_number}</p>
            </div>
          </div>
        </div>

        <div className="actions">
          <button onClick={() => window.print()} className="print-button">
            Drukuj bilet
          </button>
          <button onClick={() => navigate('/')} className="home-button">
            Powrót do strony głównej
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketConfirmationPage; 