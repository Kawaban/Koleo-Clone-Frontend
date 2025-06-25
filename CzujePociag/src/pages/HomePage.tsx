import React from 'react';
import SearchForm from '../components/SearchForm';
import PopularConnections from '../components/PopularConnections';
import PromotionBanner from '../components/PromotionBanner';
import Banner from '../components/Banner';
import './HomePage.css'; 

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <main className="main-content">
        <SearchForm />
        {/* <Banner /> */}
        <PopularConnections />
        <PromotionBanner />
      </main>
    </div>
  );
};

export default HomePage;