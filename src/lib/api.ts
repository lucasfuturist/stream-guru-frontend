// src/lib/api.ts
import { supabase } from './supabaseClient';

// --- TYPE DEFINITIONS ---

/** Base type for a media item (movie or TV show). */
export interface Media {
  tmdb_id: number;
  title: string;
  poster_path: string;
  score?: number;
}

/** Extended type for the detailed view in the modal. */
export interface MediaDetails extends Media {
  synopsis: string;
  genres: string[];
  runtime: number;
  release_date: string;
  tagline: string;
  director?: string;
  trailer_key?: string;
  backdrop_path?: string;
  logo_path?: string;
  top_cast?: { name: string; character: string; profile_path: string }[];
  watch_providers?: any;
}

/** Type for the response from the chat functions. */
export interface ChatResponse {
  prose: string;
  recs: Media[];
}

/** Type for the structured filter object used by the homepage. */
export interface FilterCriteria {
  genre?: string | null;
  actor_name?: string | null;
  max_runtime?: number | null;
}

/** Represents a single search suggestion item for the homepage fuzzy search. */
export interface Suggestion {
  tmdb_id: number;
  title: string;
  poster_path: string;
  media_type: 'movie' | 'tv';
  similarity: number;
}

/**
 * Type for a single message in the conversation history sent to the hybrid chat API.
 * This is NEW for the updated chat page.
 */
export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}


// --- API FUNCTIONS ---

// preserved for homepage functionality
export async function fetchTrending(page: number = 1): Promise<Media[]> {
  const { data, error } = await supabase.functions.invoke('trending', {
    body: { page },
  });
  if (error) {
    console.error('Error fetching trending media:', error);
    throw new Error('Could not load trending titles.');
  }
  return data.trending || [];
}

// preserved for modal functionality
export async function fetchMediaDetails(tmdb_id: number): Promise<MediaDetails> {
  const { data, error } = await supabase.functions.invoke('get-details', {
    body: { tmdb_id },
  });
  if (error) {
    console.error(`Error fetching details for tmdb_id ${tmdb_id}:`, error);
    throw new Error('Could not load media details.');
  }
  return data.details;
}

// preserved for homepage functionality
export async function fetchFilteredMedia(filters: FilterCriteria, page: number = 1): Promise<Media[]> {
  const { data, error } = await supabase.functions.invoke('filter-media', {
    body: { filters, page },
  });
  if (error) {
    console.error('Error fetching filtered media:', error);
    throw new Error('Failed to fetch filtered results.');
  }
  return data.results || [];
}

// preserved for homepage suggestion dropdown
export async function fetchSearchSuggestions(query: string, filters: FilterCriteria): Promise<Suggestion[]> {
  if (query.trim().length < 2) return [];

  const { data, error } = await supabase.functions.invoke('search-suggestions', {
    body: {
      query,
      ...filters,
      page_size: 10
    },
  });

  if (error) {
    console.error('Error fetching search suggestions:', error);
    return [];
  }
  
  return data.suggestions || [];
}

// preserved for homepage search results
export async function fetchFuzzyFilteredResults(query: string, filters: FilterCriteria, page: number = 1): Promise<Media[]> {
  const { data, error } = await supabase.functions.invoke('search-suggestions', {
    body: {
      query,
      ...filters,
      page,
      page_size: 21
    },
  });

  if (error) {
    console.error('Error fetching fuzzy search results:', error);
    throw new Error('Failed to fetch search results.');
  }

  return data.suggestions || [];
}

export interface ChatResponse {
  prose: string;
  recs: Media[];
  filters?: any; // Add this for debugging purposes
}

export async function getChatResponse(history: ChatHistoryMessage[]): Promise<{ prose: string; filters: any }> {
  const { data, error } = await supabase.functions.invoke('get-chat-response', {
    body: { history },
  });
  if (error || data.error) throw new Error(error?.message || data.error);
  return data;
}

export async function fetchRecommendations(filters: any, lastUserPrompt: string): Promise<{ recs: Media[] }> {
  const { data, error } = await supabase.functions.invoke('fetch-recommendations', {
    body: { filters, lastUserPrompt },
  });
  if (error || data.error) throw new Error(error?.message || data.error);
  return data;
}