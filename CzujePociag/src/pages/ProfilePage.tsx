import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

interface Ticket {
  id: number;
  train_number: string;
  departure_station: string;
  arrival_station: string;
  departure_time: string;
  arrival_time: string;
  wagon_number: number;
  seat_number: number;
  purchase_date: string;
}

interface UserProfile {
  email: string;
  first_name: string;
  last_name: string;
}

const ProfilePage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Get user info from JWT token
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        setUserProfile({
          email: tokenData.email,
          first_name: tokenData.first_name || '',
          last_name: tokenData.last_name || ''
        });

        // Fetch user tickets
        const ticketsResponse = await fetch('http://localhost:8000/tickets/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!ticketsResponse.ok) {
          throw new Error('Failed to fetch tickets');
        }

        const ticketsData = await ticketsResponse.json();
        setTickets(ticketsData.content || []);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/auth/delete/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      localStorage.removeItem('token');
      // Trigger auth state change event
      window.dispatchEvent(new Event('storage-changed'));
      navigate('/');
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete account');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="loading">Ładowanie danych...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Profil użytkownika</h1>
          {userProfile && (
            <div className="user-info">
              <p><strong>Email:</strong> {userProfile.email}</p>
              {userProfile.first_name && <p><strong>Imię:</strong> {userProfile.first_name}</p>}
              {userProfile.last_name && <p><strong>Nazwisko:</strong> {userProfile.last_name}</p>}
            </div>
          )}
          <div className="account-actions">
            {deleteError && <p className="delete-error">{deleteError}</p>}
            {showConfirmDelete ? (
              <div className="confirm-delete">
                <p>Czy na pewno chcesz usunąć konto? Ta operacja jest nieodwracalna. </p>
                <p> <b>Uwaga: Usuwanie konta spowoduje utratę dostępu do wszystkich zakupionych biletów z poziomu portalu, natomiast bilety nadal pozostaną ważne w formie papierowej.</b></p>
                <div style={{display: 'inline-grid'}} className="confirm-buttons">
                  <button onClick={handleDeleteAccount} className="confirm-delete-btn">
                    Tak, usuń konto
                  </button>
                  <button onClick={() => setShowConfirmDelete(false)} className="cancel-delete-btn">
                    Anuluj
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowConfirmDelete(true)} className="delete-account-btn">
                Usuń konto
              </button>
            )}
          </div>
        </div>

        <div className="tickets-section">
          <h2>Twoje bilety</h2>
          {tickets.length === 0 ? (
            <p className="no-tickets">Nie masz jeszcze żadnych biletów</p>
          ) : (
            <div className="tickets-grid">
              {tickets.map(ticket => (
                <div key={ticket.id} className="ticket-card">
                  <div className="ticket-header">
                    <h3>Pociąg {ticket.train_number}</h3>
                    <span className="purchase-date">
                      {/* Zakupiono: {formatDate(ticket.purchase_date)} */}
                    </span>
                  </div>
                  <div className="ticket-details">
                    <div className="route-info">
                      <div className="station">
                        <p className="time">{formatDate(ticket.departure_time)}</p>
                        <p className="name">{ticket.departure_station}</p>
                      </div>
                      <div className="arrow">→</div>
                      <div className="station">
                        <p className="time">{formatDate(ticket.arrival_time)}</p>
                        <p className="name">{ticket.arrival_station}</p>
                      </div>
                    </div>
                    <div className="seat-info">
                      <p><strong>Wagon:</strong> {ticket.wagon_number}</p>
                      <p><strong>Miejsce:</strong> {ticket.seat_number}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;