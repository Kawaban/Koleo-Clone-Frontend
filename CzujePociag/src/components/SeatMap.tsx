import React from 'react';
import './SeatMap.css';
import seatMapImage from '../assets/seat-map.png';

interface Seat {
  seat_number: string;
  is_available: boolean;
}

interface SeatMapProps {
  seats: Seat[];
  selectedSeat: string;
  onSeatSelect: (seatNumber: string) => void;
}

const SeatMap: React.FC<SeatMapProps> = ({ seats, selectedSeat, onSeatSelect }) => {
  // Convert seat number to grid position
  const getSeatPosition = (seatNumber: string): { row: number; col: number } | null => {
    const num = parseInt(seatNumber);
    if (isNaN(num) || num < 1 || num > 16) return null;

    if (num <= 8) {
      return { row: 0, col: num };
    } else {
      return { row: 1, col: num - 8 };
    }
  };

  // Create array of all possible seat positions
  const seatGrid = Array(2).fill(null).map(() => Array(10).fill(null));
  
  // Fill the grid with seat data
  seats.forEach(seat => {
    const position = getSeatPosition(seat.seat_number);
    if (position) {
      seatGrid[position.row][position.col] = seat;
    }
  });

  const handleSeatClick = (seat: Seat | null, row: number, col: number) => {
    if (!seat || !seat.is_available) return;
    onSeatSelect(seat.seat_number);
  };

  return (
    <div className="seat-map-container">
      <img src={seatMapImage} alt="Seat Map" className="seat-map-image" />
      <div className="seat-grid-overlay">
        {seatGrid.map((row, rowIndex) => (
          <div key={rowIndex} className="seat-row">
            {row.map((seat, colIndex) => {
              const isCorner = (rowIndex === 0 && (colIndex === 0 || colIndex === 9)) ||
                             (rowIndex === 1 && (colIndex === 0 || colIndex === 9));
              const isSelected = seat && seat.seat_number === selectedSeat;
              const isUnavailable = seat && !seat.is_available;

              return (
                <div
                  key={colIndex}
                  className={`seat-cell ${isCorner ? 'disabled' : ''} 
                                      ${isSelected ? 'selected' : ''} 
                                      ${isUnavailable ? 'unavailable' : ''} 
                                      ${seat ? 'has-seat' : ''}`}
                  onClick={() => handleSeatClick(seat, rowIndex, colIndex)}
                >
                  {/* Removed the seat number display */}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="seat-legend">
        <div className="legend-item">
          <div className="legend-box has-seat"></div>
          <span>Dostępne</span>
        </div>
        <div className="legend-item">
          <div className="legend-box selected"></div>
          <span>Wybrane</span>
        </div>
        <div className="legend-item">
          <div className="legend-box unavailable"></div>
          <span>Zajęte</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap; 