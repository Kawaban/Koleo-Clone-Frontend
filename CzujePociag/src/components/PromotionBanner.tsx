import React from 'react';
import './PromotionBanner.css';
import dresdenPromo from '../assets/dresden-promo.jpg'; 

const PromotionBanner: React.FC = () => {
  return (
    <section className="promotion-banner">
      <div className="promotion-content">
        <h2 className="promotion-title">Promocja Drezdeńska tylko na połączenia KD i DB</h2>
        <p className="promotion-discount">50%</p>
        <p className="promotion-description">taniej w porównaniu do zwykłego biletu na połączenie:
        <br /> Wrocław Gł - Berlin</p>
        <a href="https://kolejedolnoslaskie.pl/oferty-taryfowe/promocja-drezdenska/" target="_blank" rel="noopener noreferrer"><button className="buy-now-button">KUP TERAZ</button></a>
      </div>
      <div className="promotion-image-placeholder">
        <img src={dresdenPromo} alt="Dresden Promotion" className="promotion-image" />
      </div>
    </section>
  );
};

export default PromotionBanner;