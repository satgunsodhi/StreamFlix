import React from 'react';

const MovieRow = ({ title, movies }) => {
  return (
    <div className="movie-section">
      <h2 className="section-title">{title}</h2>
      <div className="movie-row">
        {movies && movies.length > 0 ? (
          movies.map((movie) => (
            <div key={movie.id} className="movie-card">
              <img src={movie.image} alt={movie.title} className="movie-image" />
              <div className="movie-info">
                <h3>{movie.title}</h3>
                <p>{movie.description}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No movies found</p>
        )}
      </div>
    </div>
  );
};

export default MovieRow;