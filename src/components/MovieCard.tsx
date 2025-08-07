// src/components/MovieCard.tsx
import React from 'react';
import type { Media } from '@/lib/api';

interface MovieCardProps {
  movie: Media;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <div 
      className="group relative cursor-pointer overflow-hidden rounded-lg shadow-lg transition-transform duration-200 hover:-translate-y-1"
      data-tmdb-id={movie.tmdb_id}
    >
      {/* --- THIS IS THE FIX --- */}
      {/* We now only render the score if it exists AND is greater than 0. */}
      {/* This will hide the placeholder "0" from our trending fallback. */}
      {movie.score && movie.score > 0 && (
         <div className="absolute right-2 top-2 z-10 rounded-md bg-burgundy px-2 py-1 text-xs font-bold text-white">
           {Math.round(movie.score * 100)}%
         </div>
      )}
      {/* --- END OF FIX --- */}
      
      <img
        src={movie.poster_path}
        alt={`Poster for ${movie.title}`}
        className="block h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 p-4">
        <p className="font-semibold text-white transition-colors group-hover:text-gold">
          {movie.title}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;