import React from 'react';
import './Footer.css';
import facebookIcon from '../assets/facebook-icon.svg';
import instagramIcon from '../assets/instagram-icon.svg';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4 className="footer-title">O nas</h4>
          <p className="footer-description">
            CzujePociag to najlepszy sposób na planowanie podróży koleją. Sprawdź połączenia, kup bilety i podróżuj wygodnie!
          </p>
        </div>
        <div className="footer-section">
          <h4 className="footer-title">Szybkie linki</h4>
          <ul className="footer-links">
            <li><a href="#">Strona główna</a></li>
            <li><a href="#">Najpopularniejsze połączenia</a></li>
            <li><a href="#">Promocje</a></li>
            <li><a href="#">Kontakt</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4 className="footer-title">Śledź nas</h4>
          <div className="social-icons">
            <a href="#" aria-label="Facebook"><img src={facebookIcon} alt="Facebook" /></a>
            <a href="#" aria-label="Instagram"><img src={instagramIcon} alt="Instagram" /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 CzujePociag. Wszelkie prawa zastrzeżone.</p>
      </div>
    </footer>
  );
};

export default Footer;