/**
 * Image loading state
 */
export enum ImageLoadingState {
  NotLoaded = 'NotLoaded',
  Loading = 'Loading',
  Loaded = 'Loaded',
  Error = 'Error',
}

/**
 * Image cache entry
 */
export interface ImageCacheEntry {
  image: HTMLImageElement;
  state: ImageLoadingState;
  url: string;
  width?: number;
  height?: number;
  error?: string;
}

/**
 * Image configuration interface
 */
export interface ImageConfig {
  /** Maximum cache size */
  maxCacheSize?: number;
  /** Default image placeholder */
  placeholder?: string;
  /** Image loading timeout in ms */
  timeout?: number;
  /** Enable CORS for images */
  crossOrigin?: boolean;
}

/**
 * Manager for image loading, caching, and rendering
 * Based on teable's ImageManager for efficient image handling in grid
 */
export class ImageManager {
  private cache: Map<string, ImageCacheEntry> = new Map();
  private loadingPromises: Map<string, Promise<HTMLImageElement>> = new Map();
  private maxCacheSize: number;
  private placeholder?: string;
  private timeout: number;
  private crossOrigin: boolean;

  constructor(config: ImageConfig = {}) {
    this.maxCacheSize = config.maxCacheSize || 200;
    this.placeholder = config.placeholder;
    this.timeout = config.timeout || 10000; // 10 seconds
    this.crossOrigin = config.crossOrigin || false;
  }

  /**
   * Load image from URL
   */
  async loadImage(url: string): Promise<HTMLImageElement> {
    // Check cache first
    const cached = this.cache.get(url);
    if (cached) {
      if (cached.state === ImageLoadingState.Loaded) {
        return cached.image;
      }
      if (cached.state === ImageLoadingState.Error) {
        throw new Error(cached.error || 'Image failed to load');
      }
    }

    // Check if already loading
    const existingPromise = this.loadingPromises.get(url);
    if (existingPromise) {
      return existingPromise;
    }

    // Start loading
    const promise = this.createLoadPromise(url);
    this.loadingPromises.set(url, promise);

    try {
      const image = await promise;
      this.loadingPromises.delete(url);
      return image;
    } catch (error) {
      this.loadingPromises.delete(url);
      throw error;
    }
  }

  /**
   * Create image loading promise
   */
  private createLoadPromise(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      
      // Set cache entry as loading
      const cacheEntry: ImageCacheEntry = {
        image,
        state: ImageLoadingState.Loading,
        url,
      };
      this.cache.set(url, cacheEntry);

      // Set up timeout
      const timeoutId = setTimeout(() => {
        cacheEntry.state = ImageLoadingState.Error;
        cacheEntry.error = 'Image loading timeout';
        reject(new Error('Image loading timeout'));
      }, this.timeout);

      image.onload = () => {
        clearTimeout(timeoutId);
        cacheEntry.state = ImageLoadingState.Loaded;
        cacheEntry.width = image.naturalWidth;
        cacheEntry.height = image.naturalHeight;
        this.cleanupCache();
        resolve(image);
      };

      image.onerror = () => {
        clearTimeout(timeoutId);
        cacheEntry.state = ImageLoadingState.Error;
        cacheEntry.error = 'Failed to load image';
        reject(new Error('Failed to load image'));
      };

      if (this.crossOrigin) {
        image.crossOrigin = 'anonymous';
      }

      image.src = url;
    });
  }

  /**
   * Get image synchronously (returns null if not loaded)
   */
  getImage(url: string): HTMLImageElement | null {
    const cached = this.cache.get(url);
    return cached?.state === ImageLoadingState.Loaded ? cached.image : null;
  }

  /**
   * Check if image is loaded
   */
  isImageLoaded(url: string): boolean {
    const cached = this.cache.get(url);
    return cached?.state === ImageLoadingState.Loaded || false;
  }

  /**
   * Check if image is loading
   */
  isImageLoading(url: string): boolean {
    const cached = this.cache.get(url);
    return cached?.state === ImageLoadingState.Loading || false;
  }

  /**
   * Get image loading state
   */
  getImageState(url: string): ImageLoadingState {
    const cached = this.cache.get(url);
    return cached?.state || ImageLoadingState.NotLoaded;
  }

  /**
   * Get image dimensions
   */
  getImageDimensions(url: string): { width: number; height: number } | null {
    const cached = this.cache.get(url);
    if (cached?.state === ImageLoadingState.Loaded && cached.width && cached.height) {
      return { width: cached.width, height: cached.height };
    }
    return null;
  }

  /**
   * Draw image on canvas
   */
  drawImage(
    ctx: CanvasRenderingContext2D,
    url: string,
    x: number,
    y: number,
    width: number,
    height: number,
    options: {
      fit?: 'cover' | 'contain' | 'fill';
      placeholder?: boolean;
    } = {}
  ): boolean {
    const image = this.getImage(url);
    
    if (!image) {
      // Try to load image if not cached
      this.loadImage(url).catch(() => {
        // Ignore errors, will be handled by cache
      });

      // Draw placeholder if available
      if (options.placeholder && this.placeholder) {
        const placeholderImage = this.getImage(this.placeholder);
        if (placeholderImage) {
          this.drawImageWithFit(ctx, placeholderImage, x, y, width, height, options.fit);
          return true;
        }
      }
      return false;
    }

    this.drawImageWithFit(ctx, image, x, y, width, height, options.fit);
    return true;
  }

  /**
   * Draw image with fit options
   */
  private drawImageWithFit(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number,
    fit: 'cover' | 'contain' | 'fill' = 'cover'
  ): void {
    const imageAspect = image.naturalWidth / image.naturalHeight;
    const targetAspect = width / height;

    let drawWidth = width;
    let drawHeight = height;
    let drawX = x;
    let drawY = y;

    if (fit === 'contain') {
      if (imageAspect > targetAspect) {
        drawHeight = width / imageAspect;
        drawY = y + (height - drawHeight) / 2;
      } else {
        drawWidth = height * imageAspect;
        drawX = x + (width - drawWidth) / 2;
      }
    } else if (fit === 'cover') {
      if (imageAspect > targetAspect) {
        drawWidth = height * imageAspect;
        drawX = x + (width - drawWidth) / 2;
      } else {
        drawHeight = width / imageAspect;
        drawY = y + (height - drawHeight) / 2;
      }
    }
    // 'fill' uses original dimensions

    try {
      ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    } catch (error) {
      console.error('Error drawing image:', error);
    }
  }

  /**
   * Preload multiple images
   */
  async preloadImages(urls: string[]): Promise<void> {
    const promises = urls.map(url => this.loadImage(url).catch(() => null));
    await Promise.all(promises);
  }

  /**
   * Clear image cache
   */
  clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  /**
   * Clean up cache if it exceeds limit
   */
  private cleanupCache(): void {
    if (this.cache.size <= this.maxCacheSize) return;

    // Remove oldest entries (simple LRU-like cleanup)
    const entries = Array.from(this.cache.entries());
    const toRemove = entries.slice(0, entries.length - this.maxCacheSize);
    
    toRemove.forEach(([key]) => {
      this.cache.delete(key);
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    loadedCount: number;
    loadingCount: number;
    errorCount: number;
  } {
    let loadedCount = 0;
    let loadingCount = 0;
    let errorCount = 0;

    this.cache.forEach(entry => {
      switch (entry.state) {
        case ImageLoadingState.Loaded:
          loadedCount++;
          break;
        case ImageLoadingState.Loading:
          loadingCount++;
          break;
        case ImageLoadingState.Error:
          errorCount++;
          break;
      }
    });

    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      loadedCount,
      loadingCount,
      errorCount,
    };
  }
}
