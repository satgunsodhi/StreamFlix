import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MovieRow = ({ title, movies }) => {
  const navigate = useNavigate();
  const rowRef = useRef(null);
  const [startIndex, setStartIndex] = useState(0); // Track the starting index of visible movies
  const [visibleCount, setVisibleCount] = useState(0); // Number of movies visible at a time

  const handleMovieClick = (movieId) => {
    navigate(`/watch/${movieId}`);
  };

  const scrollLeft = () => {
    if (rowRef.current) {
      rowRef.current.classList.add('scroll-left');
      setTimeout(() => rowRef.current.classList.remove('scroll-left'), 500);
    }
    setStartIndex((prevIndex) => Math.max(prevIndex - visibleCount, 0)); // Prevent negative index
  };

  const scrollRight = () => {
    if (rowRef.current) {
      rowRef.current.classList.add('scroll-right');
      setTimeout(() => rowRef.current.classList.remove('scroll-right'), 500);
    }
    setStartIndex((prevIndex) => Math.min(prevIndex + visibleCount, movies.length - visibleCount)); // Prevent overflow
  };

  useEffect(() => {
    const updateVisibleCount = () => {
      if (rowRef.current) {
        const { clientWidth } = rowRef.current;
        const cardWidth = 164 + 15; // Movie card width + gap
        setVisibleCount(Math.floor(clientWidth / cardWidth));
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);

    return () => {
      window.removeEventListener('resize', updateVisibleCount);
    };
  }, []);

  const visibleMovies = movies.slice(startIndex, startIndex + visibleCount);

  return (
    <div className="movie-section">
      <h2 className="section-title">{title}</h2>
      <div className="movie-row-container">
        <button className="scroll-button left styled-button" onClick={scrollLeft}>
          &#8249;
        </button>
        <div className="movie-row" ref={rowRef}>
          {visibleMovies.map((movie) => (
            <div
              key={movie.id}
              className="movie-card"
              onClick={() => handleMovieClick(movie.id)}
              role="button"
              tabIndex={0}
            >
              <img src={movie.image} alt={movie.title} className="movie-image" />
              <div className="movie-info">
                <h3>{movie.title}</h3>
                <p>{movie.description}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="scroll-button right styled-button" onClick={scrollRight}>
          &#8250;
        </button>
      </div>
    </div>
  );
};

export default MovieRow;