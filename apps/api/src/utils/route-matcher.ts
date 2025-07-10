import type { PublicRoutePattern } from '@/config/public-routes';

/**
 * Utility class for matching routes against patterns
 */
export class RouteMatcher {
  private static instance: RouteMatcher;
  private compiledPatterns: Map<string, RegExp> = new Map();

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): RouteMatcher {
    if (!RouteMatcher.instance) {
      RouteMatcher.instance = new RouteMatcher();
    }
    return RouteMatcher.instance;
  }

  /**
   * Convert a route pattern to a regular expression
   * Supports:
   * - Exact matches: /health
   * - Wildcard matches: /docs/*
   * - Parameter matches: /users/:id (future enhancement)
   */
  private compilePattern(pattern: string): RegExp | undefined {
    if (this.compiledPatterns.has(pattern)) {
      return this.compiledPatterns.get(pattern);
    }

    let regexPattern = pattern;

    // Escape special regex characters except * and :
    regexPattern = regexPattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

    // Handle wildcard patterns
    regexPattern = regexPattern.replace(/\*/g, '.*');

    // Handle parameter patterns (for future use)
    regexPattern = regexPattern.replace(/:([^/]+)/g, '([^/]+)');

    // Ensure exact match for patterns without wildcards
    if (!pattern.includes('*') && !pattern.includes(':')) {
      regexPattern = `^${regexPattern}$`;
    } else {
      regexPattern = `^${regexPattern}`;
    }

    const regex = new RegExp(regexPattern);
    this.compiledPatterns.set(pattern, regex);
    return regex;
  }

  /**
   * Check if a path matches a pattern
   */
  public matchesPattern(path: string, pattern: string): boolean {
    const regex = this.compilePattern(pattern);
    return regex ? regex.test(path) : false;
  }

  /**
   * Check if a route (path + method) is a public route
   */
  public isPublicRoute(
    path: string,
    method: string,
    publicRoutes: PublicRoutePattern[]
  ): boolean {
    const normalizedPath = this.normalizePath(path);
    const pathWithoutApiVersion = this.removeApiVersionPrefix(normalizedPath);
    const normalizedMethod = method.toUpperCase();

    for (const route of publicRoutes) {
      // Check if path matches the pattern (try both original path and path without API version)
      const pathsToCheck = [normalizedPath, pathWithoutApiVersion];

      let pathMatches = false;
      for (const pathToCheck of pathsToCheck) {
        if (this.matchesPattern(pathToCheck, route.pattern)) {
          pathMatches = true;
          break;
        }
      }

      if (!pathMatches) {
        continue;
      }

      // If no methods specified, allow all methods
      if (!route.methods || route.methods.length === 0) {
        return true;
      }

      // Check if method is allowed
      const allowedMethods = route.methods.map(m => m.toUpperCase());
      if (allowedMethods.includes(normalizedMethod)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Normalize path by removing trailing slashes and query parameters
   */
  private normalizePath(path: string): string {
    // Remove query parameters
    const pathWithoutQuery = path.split('?')[0];

    // Remove trailing slash (except for root path)
    if (
      pathWithoutQuery &&
      pathWithoutQuery.length > 1 &&
      pathWithoutQuery.endsWith('/')
    ) {
      return pathWithoutQuery.slice(0, -1);
    }

    return pathWithoutQuery ?? '';
  }

  /**
   * Remove API version prefix from path for public route matching
   * Converts /api/v1/auth/login -> /auth/login
   * Converts /api/v2/auth/login -> /auth/login
   * Converts /api/auth/login -> /auth/login (backward compatibility)
   */
  private removeApiVersionPrefix(path: string): string {
    // Pattern to match /api/v{number}/ or /api/
    const apiVersionPattern = /^\/api(?:\/v\d+)?/;
    return path.replace(apiVersionPattern, '');
  }

  /**
   * Get matching public route pattern for debugging
   */
  public getMatchingPublicRoute(
    path: string,
    method: string,
    publicRoutes: PublicRoutePattern[]
  ): PublicRoutePattern | null {
    const normalizedPath = this.normalizePath(path);
    const pathWithoutApiVersion = this.removeApiVersionPrefix(normalizedPath);
    const normalizedMethod = method.toUpperCase();

    for (const route of publicRoutes) {
      // Check if path matches the pattern (try both original path and path without API version)
      const pathsToCheck = [normalizedPath, pathWithoutApiVersion];

      let pathMatches = false;
      for (const pathToCheck of pathsToCheck) {
        if (this.matchesPattern(pathToCheck, route.pattern)) {
          pathMatches = true;
          break;
        }
      }

      if (!pathMatches) {
        continue;
      }

      if (!route.methods || route.methods.length === 0) {
        return route;
      }

      const allowedMethods = route.methods.map(m => m.toUpperCase());
      if (allowedMethods.includes(normalizedMethod)) {
        return route;
      }
    }

    return null;
  }

  /**
   * Clear compiled patterns cache (useful for testing)
   */
  public clearCache(): void {
    this.compiledPatterns.clear();
  }
}

/**
 * Convenience function to check if a route is public
 */
export function isPublicRoute(
  path: string,
  method: string,
  publicRoutes: PublicRoutePattern[]
): boolean {
  return RouteMatcher.getInstance().isPublicRoute(path, method, publicRoutes);
}

/**
 * Convenience function to get matching public route
 */
export function getMatchingPublicRoute(
  path: string,
  method: string,
  publicRoutes: PublicRoutePattern[]
): PublicRoutePattern | null {
  return RouteMatcher.getInstance().getMatchingPublicRoute(
    path,
    method,
    publicRoutes
  );
}
