import React from 'react';
import SearchForm from '../components/SearchForm';
import PopularConnections from '../components/PopularConnections';
import PromotionBanner from '../components/PromotionBanner';
import './HomePage.css'; 

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <main className="main-content">
        <PopularConnections />
        <PromotionBanner />
      </main>
    </div>
  );
};

export default HomePage;