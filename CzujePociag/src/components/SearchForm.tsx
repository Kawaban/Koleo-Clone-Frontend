import React from 'react';
import './SearchForm.css';
import banner from '../assets/banner.png'; 

const SearchForm: React.FC = () => {
  return (
    <section className="search-form-section">
      <div className="image-placeholder">
        <img src={banner} alt="Banner" className="banner-image" />
      </div>
    </section>
  );
};

export default SearchForm;