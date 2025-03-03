import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieRow from './components/MovieRow';
import Footer from './components/Footer';
import { movies } from './data/movies';
import './styles/index.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const allMovies = [...movies.trending, ...movies.action, ...movies.comedy];
  
  const filteredMovies = allMovies.filter(movie => 
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      {searchQuery ? (
        <div className="search-results">
          <MovieRow title="Search Results" movies={filteredMovies} />
        </div>
      ) : (
        <>
          <Hero />
          <MovieRow title="Trending Now" movies={movies.trending} />
          <MovieRow title="Action Movies" movies={movies.action} />
          <MovieRow title="Comedy Hits" movies={movies.comedy} />
        </>
      )}
      <Footer />
    </div>
  );
}

export default App;