// src/components/SearchAndFilter.tsx
"use client";

// --- STEP 1: Import useRef and useEffect from React ---
import React, { useState, useEffect, useRef, useCallback } from 'react';
import CustomSelect from './CustomSelect';

import {
  FilterCriteria,
  Suggestion,
  fetchSearchSuggestions
} from '@/lib/api';

interface SearchAndFilterProps {
  onSearch: (query: string, filters: FilterCriteria) => void;
  onFilter: (filters: FilterCriteria) => void;
}

const genreOptions = [
    { value: '', label: 'All Genres' }, { value: 'Action', label: 'Action' },
    { value: 'Adventure', label: 'Adventure' }, { value: 'Animation', label: 'Animation' },
    { value: 'Comedy', label: 'Comedy' }, { value: 'Crime', label: 'Crime' },
    { value: 'Documentary', label: 'Documentary' }, { value: 'Drama', label: 'Drama' },
    { value: 'Family', label: 'Family' }, { value: 'Fantasy', label: 'Fantasy' },
    { value: 'History', label: 'History' }, { value: 'Horror', label: 'Horror' },
    { value: 'Music', label: 'Music' }, { value: 'Mystery', label: 'Mystery' },
    { value: 'Romance', label: 'Romance' }, { value: 'Science Fiction', label: 'Science Fiction' },
    { value: 'Thriller', label: 'Thriller' }, { value: 'War', label: 'War' },
    { value: 'Western', label: 'Western' },
];

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ onSearch, onFilter }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [genre, setGenre] = useState('');
  const [runtime, setRuntime] = useState(240);
  const [actor, setActor] = useState('');
  
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // --- STEP 2: Create a ref to attach to the component's main container ---
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Effect for debouncing suggestion fetches
  useEffect(() => {
    const currentFilters: FilterCriteria = {
      genre: genre || null,
      max_runtime: runtime < 240 ? runtime : null,
      actor_name: actor.trim() || null,
    };

    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    const timerId = setTimeout(() => {
      fetchSearchSuggestions(query, currentFilters).then(results => {
        setSuggestions(results);
        setIsLoadingSuggestions(false);
      });
    }, 300);

    return () => clearTimeout(timerId);
  }, [query, genre, runtime, actor]);

  // --- STEP 3: Add the useEffect hook for the click-outside listener ---
  useEffect(() => {
    // This function will be called whenever a mousedown event occurs
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the ref is attached and if the click was NOT inside the container
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        // If the click was outside, clear the suggestions to hide the dropdown
        setSuggestions([]);
      }
    };

    // Add the event listener to the whole document
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup function: remove the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // The empty dependency array ensures this effect runs only once

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentFilters: FilterCriteria = {
      genre: genre || null,
      max_runtime: runtime < 240 ? runtime : null,
      actor_name: actor.trim() || null,
    };
    onSearch(query.trim(), currentFilters);
    setSuggestions([]);
  };

  const handleSuggestionClick = (suggestionTitle: string) => {
    setQuery(suggestionTitle);
    setSuggestions([]);
    const currentFilters: FilterCriteria = {
      genre: genre || null,
      max_runtime: runtime < 240 ? runtime : null,
      actor_name: actor.trim() || null,
    };
    onSearch(suggestionTitle, currentFilters);
  };
  
  const handleFilterSubmit = () => {
    const currentFilters: FilterCriteria = {
      genre: genre || null,
      max_runtime: runtime < 240 ? runtime : null,
      actor_name: actor.trim() || null,
    };
    
    if (query.trim()) {
      onSearch(query.trim(), currentFilters);
    } else {
      onFilter(currentFilters);
    }
  };

  // --- STEP 4: Attach the ref to the root element of the component ---
  return (
    <section className="my-16 text-center text-white" ref={searchContainerRef}>
      <h1 className="text-4xl font-extrabold lg:text-5xl">
        Discover your next favorite movie
      </h1>

      <form onSubmit={handleSearchSubmit} className="relative mx-auto mt-6 flex max-w-xl">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., mind-bending sci-fi..."
          className="flex-grow rounded-l-lg border border-white/30 bg-white/10 px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold"
          autoComplete="off"
        />
        <button type="submit" className="rounded-r-lg border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white transition-colors hover:bg-gold hover:text-navy">
          Search
        </button>
        
        {(suggestions.length > 0 || isLoadingSuggestions) && (
          <ul 
            className="absolute left-0 right-0 top-full z-20 mt-2 max-h-96 overflow-y-auto rounded-lg border 
                       border-gold/30 bg-navy/80 text-left shadow-2xl backdrop-blur-md"
          >
            {isLoadingSuggestions && <li className="p-3 text-sm text-text/70">Searching for suggestions...</li>}
            {!isLoadingSuggestions && suggestions.map((s) => (
              <li
                key={s.tmdb_id}
                onClick={() => handleSuggestionClick(s.title)}
                className="flex cursor-pointer items-center gap-4 p-3 transition-colors hover:bg-gold/20"
              >
                <img src={s.poster_path} alt={`Poster for ${s.title}`} className="h-16 w-12 flex-shrink-0 rounded-md object-cover"/>
                <div>
                  <p className="font-bold">{s.title}</p>
                  <p className="text-sm capitalize opacity-70">{s.media_type}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </form>

      <div className="mt-6">
        <button onClick={() => setShowFilters(!showFilters)} className="rounded-lg border border-white/30 px-5 py-2 font-semibold transition-colors hover:border-gold hover:bg-gold hover:text-navy">
          {showFilters ? 'Hide' : 'Filter Results'}
        </button>
      </div>

      {showFilters && (
        <div className="mx-auto mt-6 grid max-w-4xl grid-cols-1 gap-4 rounded-lg bg-black/20 p-6 text-left md:grid-cols-3 md:items-end">
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-semibold text-gray-300">Genre</label>
            <CustomSelect options={genreOptions} value={genre} onChange={setGenre} placeholder="All Genres"/>
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="actor-filter" className="mb-1 text-sm font-semibold text-gray-300">Actor</label>
            <input type="text" id="actor-filter" value={actor} onChange={(e) => setActor(e.target.value)} placeholder="e.g., Tom Hanks" className="rounded-md border border-white/30 bg-white/10 p-2 text-white" />
          </div>

          <div className="flex flex-col">
            <label htmlFor="runtime-filter" className="mb-1 text-sm font-semibold text-gray-300">Max Runtime: <span className="font-bold">{runtime < 240 ? `< ${runtime} min` : 'Any'}</span></label>
            <input type="range" id="runtime-filter" min="60" max="240" step="10" value={runtime} onChange={(e) => setRuntime(Number(e.target.value))} />
          </div>

          <div className="mt-4 md:col-span-3 md:text-center">
            <button onClick={handleFilterSubmit} className="w-full rounded-lg bg-gold px-8 py-2 font-semibold text-navy md:w-auto">Apply Filters</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default SearchAndFilter;