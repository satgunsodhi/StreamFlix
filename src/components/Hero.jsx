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
        <h1 className="hero-title">Stranger Things</h1>
        <p className="hero-description">
          When a young boy vanishes, a small town uncovers a mystery involving secret experiments, 
          terrifying supernatural forces and one strange little girl.
        </p>
        <div className="button-group">
          <button className="button button-primary">
            <Play size={20} />
            Play
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