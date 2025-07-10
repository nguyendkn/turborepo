import type { CellPosition } from '../types/cell';
import type { TableTheme } from '../types/theme';
import { drawRect, drawText, drawCheckbox, truncateText, measureText } from './base-renderer';

/**
 * Cell render context
 */
export interface CellRenderContext {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  theme: TableTheme;
  isSelected: boolean;
  isActive: boolean;
  isHovered: boolean;
  isEditing: boolean;
  position: CellPosition;
}

/**
 * Cell content interface
 */
export interface CellContent {
  type: string;
  data: unknown;
  displayValue?: string;
  readonly?: boolean;
  error?: string;
}

/**
 * Base cell renderer interface
 */
export interface CellRenderer {
  type: string;
  render(context: CellRenderContext, content: CellContent): void;
  getPreferredWidth?(content: CellContent, theme: TableTheme): number;
  getPreferredHeight?(content: CellContent, theme: TableTheme): number;
}

/**
 * Text cell renderer
 */
export class TextCellRenderer implements CellRenderer {
  type = 'text';

  render(context: CellRenderContext, content: CellContent): void {
    const { ctx, x, y, width, height, theme, isSelected, isActive } = context;
    const text = content.displayValue || String(content.data || '');

    // Draw cell background
    this.drawCellBackground(context);

    // Draw text
    if (text) {
      const padding = 8;
      const textX = x + padding;
      const textY = y + height / 2;
      const maxWidth = width - padding * 2;

      const truncated = truncateText(ctx, text, maxWidth);
      
      drawText(ctx, {
        x: textX,
        y: textY,
        text: truncated,
        fontSize: 14,
        color: theme.colors.foreground,
        baseline: 'middle',
      });
    }

    // Draw cell borders
    this.drawCellBorders(context);
  }

  getPreferredWidth(content: CellContent, theme: TableTheme): number {
    const text = content.displayValue || String(content.data || '');
    if (!text) return 60;

    // Create temporary canvas for measurement
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 60;

    const textWidth = measureText(ctx, text, undefined, 14);
    return Math.min(Math.max(textWidth + 16, 60), 300);
  }

  protected drawCellBackground(context: CellRenderContext): void {
    const { ctx, x, y, width, height, theme, isSelected, isActive } = context;

    let backgroundColor = theme.colors.background;
    
    if (isActive) {
      backgroundColor = theme.colors.accent;
    } else if (isSelected) {
      backgroundColor = theme.colors.muted;
    }

    drawRect(ctx, {
      x,
      y,
      width,
      height,
      fill: backgroundColor,
    });
  }

  protected drawCellBorders(context: CellRenderContext): void {
    const { ctx, x, y, width, height, theme, isActive } = context;

    // Draw regular border
    drawRect(ctx, {
      x,
      y,
      width,
      height,
      stroke: theme.colors.border,
      strokeWidth: 1,
    });

    // Draw active cell border
    if (isActive) {
      drawRect(ctx, {
        x: x + 1,
        y: y + 1,
        width: width - 2,
        height: height - 2,
        stroke: theme.colors.primary,
        strokeWidth: 2,
      });
    }
  }
}

/**
 * Number cell renderer
 */
export class NumberCellRenderer extends TextCellRenderer {
  type = 'number';

  render(context: CellRenderContext, content: CellContent): void {
    const { ctx, x, y, width, height, theme } = context;
    
    // Draw cell background
    this.drawCellBackground(context);

    // Format number
    let text = '';
    if (content.data !== null && content.data !== undefined) {
      const num = Number(content.data);
      if (!isNaN(num)) {
        text = content.displayValue || num.toLocaleString();
      }
    }

    // Draw text (right-aligned for numbers)
    if (text) {
      const padding = 8;
      const textX = x + width - padding;
      const textY = y + height / 2;
      const maxWidth = width - padding * 2;

      const truncated = truncateText(ctx, text, maxWidth);
      
      drawText(ctx, {
        x: textX,
        y: textY,
        text: truncated,
        fontSize: 14,
        color: theme.colors.foreground,
        align: 'right',
        baseline: 'middle',
      });
    }

    // Draw cell borders
    this.drawCellBorders(context);
  }
}

/**
 * Boolean/Checkbox cell renderer
 */
export class CheckboxCellRenderer implements CellRenderer {
  type = 'checkbox';

  render(context: CellRenderContext, content: CellContent): void {
    const { ctx, x, y, width, height, theme } = context;
    
    // Draw cell background
    this.drawCellBackground(context);

    // Draw checkbox
    const checkboxSize = 16;
    const checkboxX = x + (width - checkboxSize) / 2;
    const checkboxY = y + (height - checkboxSize) / 2;
    const checked = Boolean(content.data);

    drawCheckbox(ctx, checkboxX, checkboxY, checkboxSize, checked, {
      borderColor: theme.colors.border,
      fillColor: checked ? theme.colors.primary : theme.colors.background,
      checkColor: theme.colors.background,
    });

    // Draw cell borders
    this.drawCellBorders(context);
  }

  protected drawCellBackground(context: CellRenderContext): void {
    const { ctx, x, y, width, height, theme, isSelected, isActive } = context;

    let backgroundColor = theme.colors.background;
    
    if (isActive) {
      backgroundColor = theme.colors.accent;
    } else if (isSelected) {
      backgroundColor = theme.colors.muted;
    }

    drawRect(ctx, {
      x,
      y,
      width,
      height,
      fill: backgroundColor,
    });
  }

  protected drawCellBorders(context: CellRenderContext): void {
    const { ctx, x, y, width, height, theme, isActive } = context;

    // Draw regular border
    drawRect(ctx, {
      x,
      y,
      width,
      height,
      stroke: theme.colors.border,
      strokeWidth: 1,
    });

    // Draw active cell border
    if (isActive) {
      drawRect(ctx, {
        x: x + 1,
        y: y + 1,
        width: width - 2,
        height: height - 2,
        stroke: theme.colors.primary,
        strokeWidth: 2,
      });
    }
  }

  getPreferredWidth(): number {
    return 60; // Fixed width for checkbox cells
  }
}

/**
 * Loading cell renderer
 */
export class LoadingCellRenderer implements CellRenderer {
  type = 'loading';

  render(context: CellRenderContext): void {
    const { ctx, x, y, width, height, theme } = context;
    
    // Draw cell background
    this.drawCellBackground(context);

    // Draw loading indicator (simple animated dots)
    const dotSize = 3;
    const dotSpacing = 8;
    const totalWidth = dotSize * 3 + dotSpacing * 2;
    const startX = x + (width - totalWidth) / 2;
    const dotY = y + height / 2;

    // Simple loading animation (would need animation frame in real implementation)
    for (let i = 0; i < 3; i++) {
      const dotX = startX + i * (dotSize + dotSpacing);
      const opacity = 0.3 + (Math.sin(Date.now() / 200 + i) + 1) * 0.35;
      
      ctx.save();
      ctx.globalAlpha = opacity;
      drawRect(ctx, {
        x: dotX,
        y: dotY - dotSize / 2,
        width: dotSize,
        height: dotSize,
        radius: dotSize / 2,
        fill: theme.colors.muted,
      });
      ctx.restore();
    }

    // Draw cell borders
    this.drawCellBorders(context);
  }

  protected drawCellBackground(context: CellRenderContext): void {
    const { ctx, x, y, width, height, theme } = context;

    drawRect(ctx, {
      x,
      y,
      width,
      height,
      fill: theme.colors.background,
    });
  }

  protected drawCellBorders(context: CellRenderContext): void {
    const { ctx, x, y, width, height, theme } = context;

    drawRect(ctx, {
      x,
      y,
      width,
      height,
      stroke: theme.colors.border,
      strokeWidth: 1,
    });
  }
}

/**
 * Rating cell renderer
 */
export class RatingCellRenderer implements CellRenderer {
  type = 'rating';

  render(context: CellRenderContext, content: CellContent): void {
    const { ctx, x, y, width, height, theme } = context;
    const rating = Number(content.data) || 0;
    const maxRating = 5;

    // Draw cell background
    this.drawCellBackground(context);

    // Draw stars
    const starSize = 16;
    const starSpacing = 2;
    const totalWidth = maxRating * starSize + (maxRating - 1) * starSpacing;
    const startX = x + (width - totalWidth) / 2;
    const startY = y + (height - starSize) / 2;

    for (let i = 0; i < maxRating; i++) {
      const starX = startX + i * (starSize + starSpacing);
      const filled = i < rating;

      // Draw star
      this.drawStar(ctx, starX, startY, starSize, filled, theme.colors.primary);
    }

    // Draw cell borders
    this.drawCellBorders(context);
  }

  private drawStar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    filled: boolean,
    color: string
  ): void {
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const outerRadius = size / 2;
    const innerRadius = outerRadius * 0.4;

    ctx.save();
    ctx.beginPath();

    // Draw 5-pointed star
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const pointX = centerX + Math.cos(angle - Math.PI / 2) * radius;
      const pointY = centerY + Math.sin(angle - Math.PI / 2) * radius;

      if (i === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    }

    ctx.closePath();

    if (filled) {
      ctx.fillStyle = color;
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  }

  protected drawCellBackground(context: CellRenderContext): void {
    const { ctx, x, y, width, height, theme, isSelected, isActive } = context;

    let backgroundColor = theme.colors.background;

    if (isActive) {
      backgroundColor = theme.colors.accent;
    } else if (isSelected) {
      backgroundColor = theme.colors.muted;
    }

    drawRect(ctx, {
      x,
      y,
      width,
      height,
      fill: backgroundColor,
    });
  }

  protected drawCellBorders(context: CellRenderContext): void {
    const { ctx, x, y, width, height, theme, isActive } = context;

    drawRect(ctx, {
      x,
      y,
      width,
      height,
      stroke: theme.colors.border,
      strokeWidth: 1,
    });

    if (isActive) {
      drawRect(ctx, {
        x: x + 1,
        y: y + 1,
        width: width - 2,
        height: height - 2,
        stroke: theme.colors.primary,
        strokeWidth: 2,
      });
    }
  }

  getPreferredWidth(): number {
    return 120; // Fixed width for rating cells
  }
}

/**
 * Link cell renderer
 */
export class LinkCellRenderer extends TextCellRenderer {
  type = 'link';

  render(context: CellRenderContext, content: CellContent): void {
    const { ctx, x, y, width, height, theme } = context;
    const text = content.displayValue || String(content.data || '');

    // Draw cell background
    this.drawCellBackground(context);

    // Draw link text
    if (text) {
      const padding = 8;
      const textX = x + padding;
      const textY = y + height / 2;
      const maxWidth = width - padding * 2;

      const truncated = truncateText(ctx, text, maxWidth);

      drawText(ctx, {
        x: textX,
        y: textY,
        text: truncated,
        fontSize: 14,
        color: theme.colors.primary, // Use primary color for links
        baseline: 'middle',
      });

      // Draw underline
      const textWidth = measureText(ctx, truncated, undefined, 14);
      drawRect(ctx, {
        x: textX,
        y: textY + 8,
        width: Math.min(textWidth, maxWidth),
        height: 1,
        fill: theme.colors.primary,
      });
    }

    // Draw cell borders
    this.drawCellBorders(context);
  }
}

/**
 * Cell renderer registry
 */
export class CellRendererRegistry {
  private renderers: Map<string, CellRenderer> = new Map();

  constructor() {
    // Register default renderers
    this.register(new TextCellRenderer());
    this.register(new NumberCellRenderer());
    this.register(new CheckboxCellRenderer());
    this.register(new LoadingCellRenderer());
    this.register(new RatingCellRenderer());
    this.register(new LinkCellRenderer());
  }

  register(renderer: CellRenderer): void {
    this.renderers.set(renderer.type, renderer);
  }

  get(type: string): CellRenderer | undefined {
    return this.renderers.get(type);
  }

  getOrDefault(type: string): CellRenderer {
    return this.renderers.get(type) || this.renderers.get('text')!;
  }

  getTypes(): string[] {
    return Array.from(this.renderers.keys());
  }
}
