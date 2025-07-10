import type { ThemeConfig, TableTheme, ThemeVariant } from '../types/theme';
import { getCurrentTheme, themeToCSSVariables, applyThemeToElement } from '../configs/theme';

/**
 * Manager for theme state and operations
 */
export class ThemeManager {
  private config: ThemeConfig;
  private currentTheme: TableTheme;
  private appliedElements: Set<HTMLElement> = new Set();

  constructor(config: ThemeConfig) {
    this.config = config;
    this.currentTheme = getCurrentTheme(config);
  }

  /**
   * Get current theme configuration
   */
  getConfig(): ThemeConfig {
    return { ...this.config };
  }

  /**
   * Get current active theme
   */
  getCurrentTheme(): TableTheme {
    return { ...this.currentTheme };
  }

  /**
   * Update theme variant
   */
  setVariant(variant: ThemeVariant): void {
    this.config.variant = variant;
    this.currentTheme = getCurrentTheme(this.config);
    this.applyToAllElements();
  }

  /**
   * Update custom theme overrides
   */
  setCustomTheme(customTheme: Partial<TableTheme>): void {
    this.config.custom = customTheme;
    
    // Apply custom overrides to current theme
    this.currentTheme = {
      ...this.currentTheme,
      ...customTheme,
    };
    
    this.applyToAllElements();
  }

  /**
   * Apply theme to an element
   */
  applyToElement(element: HTMLElement): void {
    applyThemeToElement(element, this.currentTheme);
    this.appliedElements.add(element);
  }

  /**
   * Remove theme from an element
   */
  removeFromElement(element: HTMLElement): void {
    const cssVariables = themeToCSSVariables(this.currentTheme);
    
    Object.keys(cssVariables).forEach(property => {
      element.style.removeProperty(property);
    });
    
    this.appliedElements.delete(element);
  }

  /**
   * Apply theme to all tracked elements
   */
  private applyToAllElements(): void {
    this.appliedElements.forEach(element => {
      applyThemeToElement(element, this.currentTheme);
    });
  }

  /**
   * Get CSS variables for current theme
   */
  getCSSVariables(): Record<string, string> {
    return themeToCSSVariables(this.currentTheme);
  }

  /**
   * Listen for system theme changes (auto mode)
   */
  enableAutoTheme(): (() => void) {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = () => {
        if (this.config.variant === 'auto') {
          this.currentTheme = getCurrentTheme(this.config);
          this.applyToAllElements();
        }
      };

      mediaQuery.addEventListener('change', handleChange);

      // Return cleanup function
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }

    return () => {};
  }

  /**
   * Clean up all applied themes
   */
  cleanup(): void {
    this.appliedElements.forEach(element => {
      this.removeFromElement(element);
    });
    this.appliedElements.clear();
  }
}
