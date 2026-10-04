import { MediaItem, MediaType } from '../../types';
import { MOCK_CATALOG } from '../../data/mockCatalog';

export interface ProviderSearchParams {
  query?: string;
  type?: MediaType;
  limit?: number;
}

export interface MediaProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  getMediaById(id: string): Promise<MediaItem | null>;
  search(params: ProviderSearchParams): Promise<MediaItem[]>;
  getAllCatalog(): Promise<MediaItem[]>;
}

/**
 * Curated / In-Memory Mock Provider
 * Ensures the app works 100% in demo mode without external API keys.
 */
export class CuratedLocalProvider implements MediaProvider {
  name = 'CuratedLocalProvider';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async getMediaById(id: string): Promise<MediaItem | null> {
    const found = MOCK_CATALOG.find((m) => m.id === id || m.source_id === id);
    return found || null;
  }

  async search(params: ProviderSearchParams): Promise<MediaItem[]> {
    let results = [...MOCK_CATALOG];

    if (params.type) {
      results = results.filter((m) => m.type === params.type);
    }

    if (params.query && params.query.trim()) {
      const q = params.query.toLowerCase().trim();
      results = results.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.tagline.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.genres.some((g) => g.toLowerCase().includes(q)) ||
          m.themes.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (params.limit) {
      results = results.slice(0, params.limit);
    }

    return results;
  }

  async getAllCatalog(): Promise<MediaItem[]> {
    return [...MOCK_CATALOG];
  }
}

/**
 * AniList Provider Adapter (Public GraphQL API for Anime & Manga)
 * Demonstrates live API provider integration without requiring server secret.
 */
export class AniListProvider implements MediaProvider {
  name = 'AniListProvider';
  private endpoint = 'https://graphql.anilist.co';

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '{ Media(id: 1) { id } }' }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async getMediaById(_id: string): Promise<MediaItem | null> {
    return null;
  }

  async search(_params: ProviderSearchParams): Promise<MediaItem[]> {
    return [];
  }

  async getAllCatalog(): Promise<MediaItem[]> {
    return [];
  }
}

/**
 * Open Library / Google Books Provider Adapter
 */
export class BooksProvider implements MediaProvider {
  name = 'BooksProvider';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async getMediaById(_id: string): Promise<MediaItem | null> {
    return null;
  }

  async search(_params: ProviderSearchParams): Promise<MediaItem[]> {
    return [];
  }

  async getAllCatalog(): Promise<MediaItem[]> {
    return [];
  }
}

/**
 * Unified Provider Manager
 */
export class MediaProviderManager {
  private providers: MediaProvider[] = [];

  constructor() {
    this.providers.push(new CuratedLocalProvider());
    this.providers.push(new AniListProvider());
    this.providers.push(new BooksProvider());
  }

  async getAllMedia(): Promise<MediaItem[]> {
    // Primary provider is curated local catalog
    const primary = this.providers[0];
    return primary.getAllCatalog();
  }

  async searchMedia(params: ProviderSearchParams): Promise<MediaItem[]> {
    const primary = this.providers[0];
    return primary.search(params);
  }

  async getMediaById(id: string): Promise<MediaItem | null> {
    for (const provider of this.providers) {
      const item = await provider.getMediaById(id);
      if (item) return item;
    }
    return null;
  }
}

export const providerManager = new MediaProviderManager();
