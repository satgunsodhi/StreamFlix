import React from 'react';
import { Play, Info } from 'lucide-react';

const Hero = () => {
  return (
    <div 
      className="hero" 
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.8)), 
        url(https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1920)`
      }}
    >
      <div className="hero-content">
        <h1 className="hero-title">Welcome to <span style={{ color: 'red' }}>STREAMFLIX</span></h1>
        <p className="hero-description">
          Enjoy exploring our vast collection of content, from thrilling adventures to heartwarming stories. 
          Sit back, relax, and start watching!
        </p>
        <div className="button-group">
          <button 
            className="button button-primary"
            onClick={() => window.location.href = '/watch/interstellar-2014'}
          >
            <Play size={20} />
            Play Random
          </button>
          <button className="button button-secondary">
            <Info size={20} />
            More Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;