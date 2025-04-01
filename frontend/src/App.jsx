import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieRow from './components/MovieRow';
import Footer from './components/Footer';
import VideoPlayer from './components/VideoPlayer';
import { movies } from './data/movies';
import './styles/index.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const allMovies = [...movies.trending, ...movies.action, ...movies.comedy];
  
  const filteredMovies = allMovies.filter(movie => 
    (movie.title && movie.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (movie.description && movie.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );  

  const HomePage = () => (
    <>
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
    </>
  );

  return (
    <Router>
      <div className="app-container">
        <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/watch/:movieId" element={<VideoPlayer />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;