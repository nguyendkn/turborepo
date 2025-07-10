/**
 * Rectangle interface for drawing
 */
export interface DrawRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

/**
 * Text drawing options
 */
export interface DrawTextOptions {
  x: number;
  y: number;
  text: string;
  font?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  maxWidth?: number;
}

/**
 * Line drawing options
 */
export interface DrawLineOptions {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  width?: number;
  dash?: number[];
}

/**
 * Draw a rectangle on canvas
 */
export function drawRect(ctx: CanvasRenderingContext2D, options: DrawRectangle): void {
  const { x, y, width, height, radius = 0, fill, stroke, strokeWidth = 1 } = options;

  ctx.save();

  if (radius > 0) {
    // Draw rounded rectangle
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  } else {
    // Draw regular rectangle
    ctx.beginPath();
    ctx.rect(x, y, width, height);
  }

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw text on canvas
 */
export function drawText(ctx: CanvasRenderingContext2D, options: DrawTextOptions): void {
  const {
    x,
    y,
    text,
    font,
    fontSize = 14,
    fontWeight = 'normal',
    color = '#000000',
    align = 'left',
    baseline = 'top',
    maxWidth,
  } = options;

  ctx.save();

  // Set font
  if (font) {
    ctx.font = font;
  } else {
    ctx.font = `${fontWeight} ${fontSize}px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  }

  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;

  if (maxWidth !== undefined) {
    ctx.fillText(text, x, y, maxWidth);
  } else {
    ctx.fillText(text, x, y);
  }

  ctx.restore();
}

/**
 * Draw a line on canvas
 */
export function drawLine(ctx: CanvasRenderingContext2D, options: DrawLineOptions): void {
  const { x1, y1, x2, y2, color = '#000000', width = 1, dash } = options;

  ctx.save();

  ctx.strokeStyle = color;
  ctx.lineWidth = width;

  if (dash) {
    ctx.setLineDash(dash);
  }

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw a circle on canvas
 */
export function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  options: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  } = {}
): void {
  const { fill, stroke, strokeWidth = 1 } = options;

  ctx.save();

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Measure text width
 */
export function measureText(
  ctx: CanvasRenderingContext2D,
  text: string,
  font?: string,
  fontSize?: number,
  fontWeight?: string
): number {
  ctx.save();

  if (font) {
    ctx.font = font;
  } else {
    const size = fontSize || 14;
    const weight = fontWeight || 'normal';
    ctx.font = `${weight} ${size}px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  }

  const metrics = ctx.measureText(text);
  ctx.restore();

  return metrics.width;
}

/**
 * Truncate text to fit within width
 */
export function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  ellipsis: string = '...'
): string {
  if (measureText(ctx, text) <= maxWidth) {
    return text;
  }

  const ellipsisWidth = measureText(ctx, ellipsis);
  const availableWidth = maxWidth - ellipsisWidth;

  if (availableWidth <= 0) {
    return ellipsis;
  }

  let truncated = text;
  while (truncated.length > 0 && measureText(ctx, truncated) > availableWidth) {
    truncated = truncated.slice(0, -1);
  }

  return truncated + ellipsis;
}

/**
 * Draw checkbox on canvas
 */
export function drawCheckbox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  checked: boolean,
  options: {
    borderColor?: string;
    fillColor?: string;
    checkColor?: string;
    borderWidth?: number;
  } = {}
): void {
  const {
    borderColor = '#d1d5db',
    fillColor = checked ? '#3b82f6' : '#ffffff',
    checkColor = '#ffffff',
    borderWidth = 1,
  } = options;

  // Draw checkbox background
  drawRect(ctx, {
    x,
    y,
    width: size,
    height: size,
    radius: 2,
    fill: fillColor,
    stroke: borderColor,
    strokeWidth: borderWidth,
  });

  // Draw checkmark if checked
  if (checked) {
    ctx.save();
    ctx.strokeStyle = checkColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const checkSize = size * 0.6;
    const checkX = x + (size - checkSize) / 2;
    const checkY = y + (size - checkSize) / 2;

    ctx.beginPath();
    ctx.moveTo(checkX + checkSize * 0.2, checkY + checkSize * 0.5);
    ctx.lineTo(checkX + checkSize * 0.45, checkY + checkSize * 0.75);
    ctx.lineTo(checkX + checkSize * 0.8, checkY + checkSize * 0.25);
    ctx.stroke();

    ctx.restore();
  }
}
