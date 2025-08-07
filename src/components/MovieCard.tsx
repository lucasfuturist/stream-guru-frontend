// src/components/MovieCard.tsx
import React from 'react';
import Image from 'next/image';
import type { Media } from '@/lib/api';

interface MovieCardProps {
  movie: Media;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const showScore = typeof movie.score === 'number' && movie.score > 0;

  return (
    // --- THIS IS THE FIX ---
    // We've added `relative` and `aspect-[2/3]` to this div.
    // 'relative' is required for the child <Image> with `fill` to work.
    // 'aspect-[2/3]' gives the container a defined shape (a standard movie poster ratio),
    // which resolves the "height of 0" warning.
    <div className="group relative aspect-[2/3] w-full cursor-pointer overflow-hidden rounded-lg shadow-lg transition-transform duration-200 hover:-translate-y-1">
      {showScore && (
        <div className="absolute right-2 top-2 z-10 rounded-md bg-burgundy px-2 py-1 text-xs font-bold text-white">
          {Math.round(movie.score! * 100)}%
        </div>
      )}
      <Image
        src={movie.poster_path}
        alt={`Poster for ${movie.title}`}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 14vw"
        className="object-cover"
        // Add a placeholder to prevent layout shift while loading
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN8+A8AAssB5CY77SMAAAAASUVORK5CYII="
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