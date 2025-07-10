/**
 * Color configuration interface
 */
export interface ColorConfig {
  /** Primary color */
  primary: string;
  /** Secondary color */
  secondary: string;
  /** Background color */
  background: string;
  /** Foreground color */
  foreground: string;
  /** Muted color */
  muted: string;
  /** Accent color */
  accent: string;
  /** Border color */
  border: string;
  /** Error color */
  error: string;
  /** Warning color */
  warning: string;
  /** Success color */
  success: string;
}

/**
 * Typography configuration interface
 */
export interface TypographyConfig {
  /** Font family */
  fontFamily: string;
  /** Font size */
  fontSize: string;
  /** Font weight */
  fontWeight: string;
  /** Line height */
  lineHeight: string;
}

/**
 * Spacing configuration interface
 */
export interface SpacingConfig {
  /** Extra small spacing */
  xs: string;
  /** Small spacing */
  sm: string;
  /** Medium spacing */
  md: string;
  /** Large spacing */
  lg: string;
  /** Extra large spacing */
  xl: string;
}

/**
 * Border configuration interface
 */
export interface BorderConfig {
  /** Border width */
  width: string;
  /** Border radius */
  radius: string;
  /** Border style */
  style: string;
}

/**
 * Shadow configuration interface
 */
export interface ShadowConfig {
  /** Small shadow */
  sm: string;
  /** Medium shadow */
  md: string;
  /** Large shadow */
  lg: string;
}

/**
 * Table theme interface
 */
export interface TableTheme {
  /** Color configuration */
  colors: ColorConfig;
  /** Typography configuration */
  typography: TypographyConfig;
  /** Spacing configuration */
  spacing: SpacingConfig;
  /** Border configuration */
  border: BorderConfig;
  /** Shadow configuration */
  shadow: ShadowConfig;
  /** Row height */
  rowHeight: number;
  /** Column header height */
  columnHeaderHeight: number;
  /** Cell padding */
  cellPadding: string;
  /** Header padding */
  headerPadding: string;
}

/**
 * Theme variant types
 */
export type ThemeVariant = 'light' | 'dark' | 'auto';

/**
 * Theme configuration interface
 */
export interface ThemeConfig {
  /** Current theme variant */
  variant: ThemeVariant;
  /** Light theme */
  light: TableTheme;
  /** Dark theme */
  dark: TableTheme;
  /** Custom theme overrides */
  custom?: Partial<TableTheme>;
}
