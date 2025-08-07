// src/lib/api.ts
import { supabase } from './supabaseClient';

// --- TYPE DEFINITIONS ---

export interface Media {
  tmdb_id: number;
  title: string;
  poster_path: string;
  media_type: 'movie' | 'tv';
  score?: number;
}

export interface WatchProvider {
  provider_id: number;
  logo_path: string;
  provider_name: string;
}

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
  watch_providers?: { flatrate?: WatchProvider[]; link?: string };
}

export interface AIParsedFilters {
  media_type?: 'movie' | 'tv';
  genres?: string[];
  not_genres?: string[];
  actor_name?: string;
  not_actor_name?: string;
  director_name?: string;
  not_director_name?: string;
  release_year_min?: number;
  release_year_max?: number;
  max_runtime?: number;
  spoken_language?: string;
  theme_analysis?: string;
}

export interface ChatResponse {
  prose: string;
  recs: Media[];
  filters?: AIParsedFilters;
}

export interface FilterCriteria {
  genre?: string | null;
  actor_name?: string | null;
  max_runtime?: number | null;
}

export interface Suggestion {
  tmdb_id: number;
  title: string;
  poster_path: string;
  media_type: 'movie' | 'tv';
  similarity: number;
}

export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

// --- API FUNCTIONS ---

export async function fetchTrending(page: number = 1): Promise<Media[]> {
  const { data, error } = await supabase.functions.invoke('trending', { body: { page } });
  if (error) throw new Error('Could not load trending titles.');
  return data.trending || [];
}

export async function fetchMediaDetails(tmdb_id: number): Promise<MediaDetails> {
  const { data, error } = await supabase.functions.invoke('get-details', { body: { tmdb_id } });
  if (error) throw new Error('Could not load media details.');
  return data.details;
}

export async function fetchFilteredMedia(filters: FilterCriteria, page: number = 1): Promise<Media[]> {
  const { data, error } = await supabase.functions.invoke('filter-media', { body: { filters, page } });
  if (error) throw new Error('Failed to fetch filtered results.');
  return data.results || [];
}

export async function fetchSearchSuggestions(query: string, filters: FilterCriteria): Promise<Suggestion[]> {
  if (query.trim().length < 2) return [];
  const { data, error } = await supabase.functions.invoke('search-suggestions', { body: { query, ...filters, page_size: 10 } });
  if (error) return [];
  return data.suggestions || [];
}

export async function fetchFuzzyFilteredResults(query: string, filters: FilterCriteria, page: number = 1): Promise<Media[]> {
  const { data, error } = await supabase.functions.invoke('search-suggestions', { body: { query, ...filters, page, page_size: 21 } });
  if (error) throw new Error('Failed to fetch search results.');
  return data.suggestions || [];
}

export async function getChatResponse(history: ChatHistoryMessage[]): Promise<{ prose: string; filters: AIParsedFilters }> {
  const { data, error } = await supabase.functions.invoke('get-chat-response', { body: { history } });
  if (error || data.error) throw new Error(error?.message || data.error);
  return data;
}

export async function fetchRecommendations(filters: AIParsedFilters, lastUserPrompt: string, page: number = 1): Promise<{ recs: Media[] }> {
  const { data, error } = await supabase.functions.invoke('fetch-recommendations', { body: { filters, lastUserPrompt, page } });
  if (error || data.error) throw new Error(error?.message || data.error);
  return data;
}