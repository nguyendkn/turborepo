import type { TableTheme, ThemeConfig, ThemeVariant } from '../types/theme';
import { TABLE_DEFAULTS } from './constants';

/**
 * Default light theme
 */
export const lightTheme: TableTheme = {
  colors: {
    primary: 'hsl(222.2 84% 4.9%)',
    secondary: 'hsl(210 40% 96%)',
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(222.2 84% 4.9%)',
    muted: 'hsl(210 40% 96%)',
    accent: 'hsl(210 40% 96%)',
    border: 'hsl(214.3 31.8% 91.4%)',
    error: 'hsl(0 84.2% 60.2%)',
    warning: 'hsl(38 92% 50%)',
    success: 'hsl(142.1 76.2% 36.3%)',
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '1.5',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  border: {
    width: '1px',
    radius: '6px',
    style: 'solid',
  },
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
  rowHeight: TABLE_DEFAULTS.rowHeight,
  columnHeaderHeight: TABLE_DEFAULTS.columnHeaderHeight,
  cellPadding: `${TABLE_DEFAULTS.cellPadding}px`,
  headerPadding: `${TABLE_DEFAULTS.headerPadding}px`,
};

/**
 * Default dark theme
 */
export const darkTheme: TableTheme = {
  colors: {
    primary: 'hsl(210 40% 98%)',
    secondary: 'hsl(222.2 84% 4.9%)',
    background: 'hsl(222.2 84% 4.9%)',
    foreground: 'hsl(210 40% 98%)',
    muted: 'hsl(217.2 32.6% 17.5%)',
    accent: 'hsl(217.2 32.6% 17.5%)',
    border: 'hsl(217.2 32.6% 17.5%)',
    error: 'hsl(0 62.8% 30.6%)',
    warning: 'hsl(38 92% 50%)',
    success: 'hsl(142.1 70.6% 45.3%)',
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '1.5',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  border: {
    width: '1px',
    radius: '6px',
    style: 'solid',
  },
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
  rowHeight: TABLE_DEFAULTS.rowHeight,
  columnHeaderHeight: TABLE_DEFAULTS.columnHeaderHeight,
  cellPadding: `${TABLE_DEFAULTS.cellPadding}px`,
  headerPadding: `${TABLE_DEFAULTS.headerPadding}px`,
};

/**
 * Default theme configuration
 */
export const defaultThemeConfig: ThemeConfig = {
  variant: 'light',
  light: lightTheme,
  dark: darkTheme,
};

/**
 * Create theme configuration
 */
export const createThemeConfig = (
  variant: ThemeVariant = 'light',
  customTheme?: Partial<TableTheme>
): ThemeConfig => {
  const baseConfig = { ...defaultThemeConfig, variant };
  
  if (customTheme) {
    const mergedLight = { ...baseConfig.light, ...customTheme };
    const mergedDark = { ...baseConfig.dark, ...customTheme };
    
    return {
      ...baseConfig,
      light: mergedLight,
      dark: mergedDark,
      custom: customTheme,
    };
  }
  
  return baseConfig;
};

/**
 * Get current theme based on variant
 */
export const getCurrentTheme = (config: ThemeConfig): TableTheme => {
  switch (config.variant) {
    case 'dark':
      return config.dark;
    case 'light':
      return config.light;
    case 'auto':
      // Check system preference
      if (typeof window !== 'undefined' && window.matchMedia) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? config.dark : config.light;
      }
      return config.light;
    default:
      return config.light;
  }
};

/**
 * Convert theme to CSS variables
 */
export const themeToCSSVariables = (theme: TableTheme): Record<string, string> => {
  return {
    '--table-color-primary': theme.colors.primary,
    '--table-color-secondary': theme.colors.secondary,
    '--table-color-background': theme.colors.background,
    '--table-color-foreground': theme.colors.foreground,
    '--table-color-muted': theme.colors.muted,
    '--table-color-accent': theme.colors.accent,
    '--table-color-border': theme.colors.border,
    '--table-color-error': theme.colors.error,
    '--table-color-warning': theme.colors.warning,
    '--table-color-success': theme.colors.success,
    
    '--table-font-family': theme.typography.fontFamily,
    '--table-font-size': theme.typography.fontSize,
    '--table-font-weight': theme.typography.fontWeight,
    '--table-line-height': theme.typography.lineHeight,
    
    '--table-spacing-xs': theme.spacing.xs,
    '--table-spacing-sm': theme.spacing.sm,
    '--table-spacing-md': theme.spacing.md,
    '--table-spacing-lg': theme.spacing.lg,
    '--table-spacing-xl': theme.spacing.xl,
    
    '--table-border-width': theme.border.width,
    '--table-border-radius': theme.border.radius,
    '--table-border-style': theme.border.style,
    
    '--table-shadow-sm': theme.shadow.sm,
    '--table-shadow-md': theme.shadow.md,
    '--table-shadow-lg': theme.shadow.lg,
    
    '--table-row-height': `${theme.rowHeight}px`,
    '--table-column-header-height': `${theme.columnHeaderHeight}px`,
    '--table-cell-padding': theme.cellPadding,
    '--table-header-padding': theme.headerPadding,
  };
};

/**
 * Apply theme to element
 */
export const applyThemeToElement = (element: HTMLElement, theme: TableTheme): void => {
  const cssVariables = themeToCSSVariables(theme);
  
  Object.entries(cssVariables).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
};
