import React from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const MovieRow = ({ title, movies }) => {
  const navigate = useNavigate();

  const handleMovieClick = (movieId) => {
    navigate(`/watch/${movieId}?room=${uuidv4()}`);
  };

  return (
    <div className="movie-section">
      <h2 className="section-title">{title}</h2>
      <div className="movie-row">
        {movies.map((movie) => (
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
    </div>
  );
};

export default MovieRow;