import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './Header.css';
import trainLogo from '../assets/train-logo.svg';
import userIcon from '../assets/user-icon.svg'; 
import searchIcon from '../assets/search-icon.svg';
import calendarIcon from '../assets/calendar-icon.svg';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {useAuth0} from "@auth0/auth0-react";

interface HeaderProps {
  showFilledSearch?: boolean;
  fromStation?: string;
  toStation?: string;
  dateTime?: string;
}

// Custom event for auth state changes
const AUTH_STATE_CHANGE_EVENT = 'authStateChange';

function formatDateTime(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const Header: React.FC<HeaderProps> = ({ showFilledSearch = true, fromStation = '', toStation = '', dateTime = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [fromStationState, setFromStation] = useState(fromStation);
  const [toStationState, setToStation] = useState(toStation);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [availableStations, setAvailableStations] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { getAccessTokenSilently } = useAuth0();


  // Check auth state on mount and when location changes
  useEffect(() => {
    const checkToken = async () => {
      const token = await getAccessTokenSilently();
      console.log(token);
      setIsLoggedIn(!!token);
      console.log(`Token checked: ${!!token}`);
    };

    checkToken();

    const handleStorageChange = async () => {
      await checkToken();
    };

    window.addEventListener('storage-changed', handleStorageChange);

    return () => {
      window.removeEventListener('storage-changed', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    // Fetch available stations when component mounts
    const fetchStations = async () => {
      try {
        const response = await fetch('http://localhost:8000/stations/');
        const data = await response.json();
        setAvailableStations(data.stations);
      } catch (error) {
        console.error('Error fetching stations:', error);
      }
    };

    fetchStations();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    const event = new Event('storage-changed');
    window.dispatchEvent(event);
    navigate('/');
  };

  const handleUserIconClick = () => {
    console.log(`User icon clicked, isLoggedIn: ${isLoggedIn}`);
    if (isLoggedIn) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  const handleCalendarClick = () => {
    setPickerOpen((open) => !open);
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setPickerOpen(false);
    }
  };

  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSearch = async () => {
    if (!fromStationState || !toStationState) {
      alert('Please fill in both source and destination stations');
      return;
    }

    // Navigate to MapPage with search parameters
    navigate('/map', {
      state: {
        fromStation: fromStationState,
        toStation: toStationState,
        date: formatDateString(selectedDate)
      }
    });
  };

  // Helper for minTime/maxTime
  const isToday = selectedDate && selectedDate.toDateString() === new Date().toDateString();
  const minTime = isToday ? new Date() : new Date(0, 0, 0, 0, 0);
  const maxTime = new Date(0, 0, 0, 23, 59);

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <img src={trainLogo} alt="Train Logo" className="train-logo" />
          <span>CzujePociąg</span>
        </Link>
        <div className="header-right">
          <img
            src={userIcon}
            alt="User"
            className="user-icon"
            onClick={handleUserIconClick}
            style={{ cursor: 'pointer' }}
          />
          {isLoggedIn ? (
            <button onClick={handleLogout} className="auth-button">
              Wyloguj
            </button>
          ) : (
            <Link to="/login" className="auth-button">
              Zaloguj
            </Link>
          )}
        </div>
      </div>

      <div className="header-bottom-row">
        <div className="header-bottom-left">
          <div className="search-section">
            <div className="search-input-group">
              <label htmlFor="fromStation" className="visually-hidden">Skąd jedziemy?</label>
              <select
                id="fromStation"
                className="search-input"
                value={fromStationState}
                onChange={(e) => setFromStation(e.target.value)}
              >
                <option value="">Skąd jedziemy?</option>
                {availableStations.map((station) => (
                  <option key={station} value={station}>
                    {station}
                  </option>
                ))}
              </select>
              <img src={searchIcon} alt="Search Icon" className="input-icon" />
            </div>
            <div className="search-input-group">
              <label htmlFor="toStation" className="visually-hidden">Dokąd jedziemy?</label>
              <select
                id="toStation"
                className="search-input"
                value={toStationState}
                onChange={(e) => setToStation(e.target.value)}
              >
                <option value="">Dokąd jedziemy?</option>
                {availableStations.map((station) => (
                  <option key={station} value={station}>
                    {station}
                  </option>
                ))}
              </select>
              <img src={searchIcon} alt="Search Icon" className="input-icon" />
            </div>
          </div>
        </div>

        {showFilledSearch && (
          <div className="header-bottom-right">
            <div className="date-time-group">
              <span
                className="date-time-trigger"
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}
                onClick={handleCalendarClick}
                tabIndex={0}
                role="button"
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleCalendarClick(); }}
              >
                <img
                  src={calendarIcon}
                  alt="Calendar Icon"
                  className="calendar-icon"
                />
                <span className="date-time-display">{formatDateTime(selectedDate)}</span>
              </span>
            </div>
            {pickerOpen && (
              <div style={{ position: 'absolute', zIndex: 1000, marginTop: '40px' }}>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd.MM.yyyy HH:mm"
                  timeCaption="Godzina"
                  inline
                  locale="pl"
                  minDate={new Date()}
                  minTime={minTime}
                  maxTime={maxTime}
                />
              </div>
            )}
            <button 
              className="search-button"
              onClick={handleSearch}
            >
              Szukaj
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;