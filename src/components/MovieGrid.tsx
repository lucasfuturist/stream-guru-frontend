// src/components/MovieGrid.tsx
import React from 'react';
import MovieCard from './MovieCard';
import type { Media } from '@/lib/api';

interface MovieGridProps {
  movies: Media[];
  onCardClick: (tmdbId: number) => void; // Add this prop
}

const MovieGrid: React.FC<MovieGridProps> = ({ movies, onCardClick }) => {
  if (movies.length === 0) {
    return <p className="text-center text-text/70">No results found. Try a different search!</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
      {movies.map((movie) => (
        // Add the onClick handler here
        <div key={movie.tmdb_id} onClick={() => onCardClick(movie.tmdb_id)}>
          <MovieCard movie={movie} />
        </div>
      ))}
    </div>
  );
};

export default MovieGrid;