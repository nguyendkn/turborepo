/**
 * Sprite map interface for custom icons
 */
export interface SpritesMap {
  [key: string]: string;
}

/**
 * Sprite configuration interface
 */
export interface SpriteConfig {
  /** Sprite map with icon names and URLs */
  sprites: SpritesMap;
  /** Default sprite size */
  defaultSize?: number;
  /** Cache size limit */
  cacheLimit?: number;
}

/**
 * Sprite cache entry
 */
interface SpriteCacheEntry {
  image: HTMLImageElement;
  loaded: boolean;
  loading: boolean;
}

/**
 * Manager for sprite/icon loading and caching
 * Based on teable's SpriteManager for efficient icon rendering
 */
export class SpriteManager {
  private sprites: SpritesMap;
  private cache: Map<string, SpriteCacheEntry> = new Map();
  private defaultSize: number;
  private cacheLimit: number;

  constructor(config: SpriteConfig) {
    this.sprites = config.sprites;
    this.defaultSize = config.defaultSize || 16;
    this.cacheLimit = config.cacheLimit || 100;
  }

  /**
   * Update sprite map
   */
  updateSprites(sprites: SpritesMap): void {
    this.sprites = { ...this.sprites, ...sprites };
  }

  /**
   * Get sprite URL by name
   */
  getSpriteUrl(name: string): string | undefined {
    return this.sprites[name];
  }

  /**
   * Load sprite image
   */
  async loadSprite(name: string): Promise<HTMLImageElement | null> {
    const url = this.getSpriteUrl(name);
    if (!url) {
      console.warn(`Sprite not found: ${name}`);
      return null;
    }

    // Check cache first
    const cached = this.cache.get(name);
    if (cached) {
      if (cached.loaded) {
        return cached.image;
      }
      if (cached.loading) {
        // Wait for loading to complete
        return new Promise((resolve) => {
          const checkLoaded = () => {
            const entry = this.cache.get(name);
            if (entry?.loaded) {
              resolve(entry.image);
            } else {
              setTimeout(checkLoaded, 10);
            }
          };
          checkLoaded();
        });
      }
    }

    // Start loading
    const image = new Image();
    const cacheEntry: SpriteCacheEntry = {
      image,
      loaded: false,
      loading: true,
    };

    this.cache.set(name, cacheEntry);

    return new Promise((resolve, reject) => {
      image.onload = () => {
        cacheEntry.loaded = true;
        cacheEntry.loading = false;
        this.cleanupCache();
        resolve(image);
      };

      image.onerror = () => {
        cacheEntry.loading = false;
        this.cache.delete(name);
        console.error(`Failed to load sprite: ${name}`);
        reject(new Error(`Failed to load sprite: ${name}`));
      };

      image.src = url;
    });
  }

  /**
   * Get sprite image synchronously (returns null if not loaded)
   */
  getSprite(name: string): HTMLImageElement | null {
    const cached = this.cache.get(name);
    return cached?.loaded ? cached.image : null;
  }

  /**
   * Check if sprite is loaded
   */
  isSpriteLoaded(name: string): boolean {
    const cached = this.cache.get(name);
    return cached?.loaded || false;
  }

  /**
   * Preload multiple sprites
   */
  async preloadSprites(names: string[]): Promise<void> {
    const promises = names.map(name => this.loadSprite(name).catch(() => null));
    await Promise.all(promises);
  }

  /**
   * Draw sprite on canvas
   */
  drawSprite(
    ctx: CanvasRenderingContext2D,
    name: string,
    x: number,
    y: number,
    width?: number,
    height?: number
  ): boolean {
    const image = this.getSprite(name);
    if (!image) {
      // Try to load sprite if not cached
      this.loadSprite(name);
      return false;
    }

    const w = width || this.defaultSize;
    const h = height || this.defaultSize;

    try {
      ctx.drawImage(image, x, y, w, h);
      return true;
    } catch (error) {
      console.error(`Error drawing sprite ${name}:`, error);
      return false;
    }
  }

  /**
   * Get sprite dimensions
   */
  getSpriteDimensions(name: string): { width: number; height: number } | null {
    const image = this.getSprite(name);
    if (!image) return null;

    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  }

  /**
   * Clear sprite cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clean up cache if it exceeds limit
   */
  private cleanupCache(): void {
    if (this.cache.size <= this.cacheLimit) return;

    // Remove oldest entries (simple LRU-like cleanup)
    const entries = Array.from(this.cache.entries());
    const toRemove = entries.slice(0, entries.length - this.cacheLimit);
    
    toRemove.forEach(([key]) => {
      this.cache.delete(key);
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    limit: number;
    loadedCount: number;
    loadingCount: number;
  } {
    let loadedCount = 0;
    let loadingCount = 0;

    this.cache.forEach(entry => {
      if (entry.loaded) loadedCount++;
      if (entry.loading) loadingCount++;
    });

    return {
      size: this.cache.size,
      limit: this.cacheLimit,
      loadedCount,
      loadingCount,
    };
  }
}
