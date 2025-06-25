import React from 'react';
import bannerImage from '../assets/banner.png';
import './Banner.css';

const Banner: React.FC = () => {
  return (
    <div className="banner-container">
      <img src={bannerImage} alt="Promotional banner" className="banner-image" />
    </div>
  );
};

export default Banner; 