// src/app/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Media, FilterCriteria } from '@/lib/api';
import { fetchTrending, fetchFuzzyFilteredResults, fetchFilteredMedia } from '@/lib/api';
import SearchAndFilter from '@/components/SearchAndFilter';
import MovieGrid from '@/components/MovieGrid';
import MovieModal from '@/components/MovieModal';

const PAGE_SIZE = 21;
const SCROLL_THRESHOLD = 50;

export default function HomePage() {
  const [movies, setMovies] = useState<Media[]>([]);
  const [heading, setHeading] = useState('Trending Now');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentAction, setCurrentAction] = useState<'trending' | 'search' | 'filter'>('trending');
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentFilters, setCurrentFilters] = useState<FilterCriteria>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  const loadMoreMovies = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    try {
      let newMovies: Media[] = [];
      if (currentAction === 'search') {
        newMovies = await fetchFuzzyFilteredResults(currentQuery, currentFilters, nextPage);
      } else if (currentAction === 'filter') {
        newMovies = await fetchFilteredMedia(currentFilters, nextPage);
      } else {
        newMovies = await fetchTrending(nextPage);
      }
      if (newMovies.length > 0) {
        setMovies(prev => [...prev, ...newMovies]);
        setPage(nextPage);
      }
      if (newMovies.length < PAGE_SIZE) setHasMore(false);
    } catch (error) {
      console.error("Failed to load more movies:", error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, hasMore, isLoadingMore, currentAction, currentQuery, currentFilters]);

  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || isLoadingMore || !hasMore || movies.length >= SCROLL_THRESHOLD) return;
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 500) {
        loadMoreMovies();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, isLoadingMore, hasMore, movies.length, loadMoreMovies]);

  const startNewQuery = useCallback((action: 'trending' | 'search' | 'filter', loader: Promise<Media[]>) => {
    setIsLoading(true);
    setMovies([]);
    setPage(1);
    setHasMore(true);
    setCurrentAction(action);
    loader.then(initialMovies => {
      setMovies(initialMovies);
      if (initialMovies.length < PAGE_SIZE) setHasMore(false);
    }).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setHeading('Trending Now');
    startNewQuery('trending', fetchTrending(1));
  }, [startNewQuery]);

  const handleSearch = (query: string, filters: FilterCriteria) => {
    setHeading(`Results for "${query}"`);
    setCurrentQuery(query);
    setCurrentFilters(filters);
    startNewQuery('search', fetchFuzzyFilteredResults(query, filters, 1));
  };
  
  const handleFilter = (filters: FilterCriteria) => {
    setHeading('Filtered Results');
    setCurrentQuery(''); 
    setCurrentFilters(filters);
    startNewQuery('filter', fetchFilteredMedia(filters, 1));
  };
  
  const handleCardClick = (tmdbId: number) => { setSelectedMovieId(tmdbId); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setSelectedMovieId(null); };

  return (
    <>
      <SearchAndFilter onSearch={handleSearch} onFilter={handleFilter} />
      <section>
        <h2 className="mb-6 text-2xl font-bold text-navy">{heading}</h2>
        {isLoading ? ( <p className="text-center text-text/70">Finding movies...</p> ) : (
          <>
            <MovieGrid movies={movies} onCardClick={handleCardClick} />
            {isLoadingMore && <p className="mt-4 text-center text-text/70">Loading more...</p>}
            {hasMore && !isLoadingMore && movies.length >= SCROLL_THRESHOLD && (
              <div className="mt-8 text-center">
                <button onClick={loadMoreMovies} className="rounded-lg bg-gold px-8 py-3 font-semibold text-navy transition-transform hover:scale-105">
                  Load More
                </button>
              </div>
            )}
            {!hasMore && movies.length > 0 && <p className="mt-8 text-center text-text/70">You&apos;ve reached the end!</p>}
          </>
        )}
      </section>
      {isModalOpen && selectedMovieId && ( <MovieModal tmdbId={selectedMovieId} onClose={handleCloseModal} /> )}
    </>
  );
}