"use client";

import React, { useState, useEffect } from 'react';
import { fetchMediaDetails } from '@/lib/api';
import type { MediaDetails } from '@/lib/api';

interface MovieModalProps {
  tmdbId: number;
  onClose: () => void;
}

const MovieModal: React.FC<MovieModalProps> = ({ tmdbId, onClose }) => {
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    if (!tmdbId) return;
    
    const getDetails = async () => {
      setLoading(true);
      setShowTrailer(false);
      try {
        const data = await fetchMediaDetails(tmdbId);
        setDetails(data);
      } catch (error) {
        console.error("Failed to fetch movie details:", error);
      } finally {
        setLoading(false);
      }
    };
    getDetails();
  }, [tmdbId]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onClick={handleOverlayClick}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-modal-bg shadow-2xl"
        style={{
          backgroundImage: details?.backdrop_path ? `url(${details.backdrop_path})` : '',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/90 to-black/80"></div>
        
        <button onClick={onClose} className="absolute right-4 top-4 z-20 text-modal-text-secondary transition-colors hover:text-white">
          ✕
        </button>

        <div 
          className="relative z-10 w-full overflow-y-auto p-8 md:p-12 text-modal-text-primary"
        >
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-modal-text-secondary">Loading...</p>
            </div>
          ) : details ? (
            <div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-[250px_1fr]">
                {/* Poster */}
                <div className="col-span-1">
                  <img src={details.poster_path} alt={details.title} className="w-full rounded-lg shadow-xl" />
                </div>
                {/* Details */}
                <div className="flex flex-col">
                  {details.logo_path && (
                    <img src={details.logo_path} alt={`${details.title} logo`} className="mb-4 h-auto max-h-24 w-auto max-w-xs object-contain" />
                  )}
                  <h2 className="text-4xl font-extrabold text-modal-title">{details.title}</h2>
                  <div className="my-3 flex items-center gap-4 text-sm font-medium text-modal-text-secondary">
                    <span>Released: {new Date(details.release_date).getFullYear()}</span>
                    <span>Runtime: {details.runtime} min</span>
                  </div>
                  <div className="my-2 flex flex-wrap gap-2">
                    {details.genres.map((genre) => (
                      <span key={genre} className="rounded-md border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-modal-text-secondary">{genre}</span>
                    ))}
                  </div>
                  {details.trailer_key && (
                     <div className="my-6">
                        <button 
                          onClick={() => setShowTrailer(true)} 
                          className="rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 font-bold text-white shadow-lg transition-colors hover:border-white/50 hover:bg-white/20"
                        >
                           Watch Trailer
                        </button>
                     </div>
                  )}
                  <p className="mt-4 leading-relaxed text-modal-text-primary">{details.synopsis}</p>
                </div>
              </div>
              {details.top_cast && details.top_cast.length > 0 && (
                <div className="mt-10">
                  <h3 className="border-b border-white/10 pb-2 text-xl font-bold text-white">Top Cast</h3>
                  <div className="mt-4 grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-5">
                    {details.top_cast.slice(0, 5).map((actor) => (
                      <div key={actor.name} className="text-center">
                        <img
                          src={actor.profile_path || 'https://placehold.co/185x278?text=N/A'}
                          alt={actor.name}
                          className="mx-auto h-24 w-24 rounded-full object-cover shadow-md"
                        />
                        <p className="mt-2 text-sm font-bold text-modal-text-primary">{actor.name}</p>
                        <p className="text-xs text-modal-text-secondary">{actor.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {details.watch_providers?.flatrate && details.watch_providers.flatrate.length > 0 && (
                <div className="mt-10">
                  <h3 className="border-b border-white/10 pb-2 text-xl font-bold text-white">Where to Watch</h3>
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    {details.watch_providers.flatrate.map((provider: any) => (
                      <a href={details.watch_providers.link} target="_blank" rel="noreferrer" key={provider.provider_id}>
                         <img
                           src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                           alt={provider.provider_name}
                           title={provider.provider_name}
                           className="h-12 w-12 rounded-lg transition-transform hover:scale-110"
                         />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="col-span-full text-center text-red-500">Could not load details.</p>
          )}
        </div>
        {showTrailer && details?.trailer_key && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/90" onClick={() => setShowTrailer(false)}>
                <div className="aspect-video w-11/12">
                   <iframe
                      src={`https://www.youtube.com/embed/${details.trailer_key}?autoplay=1`}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full rounded-lg"
                   ></iframe>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default MovieModal;