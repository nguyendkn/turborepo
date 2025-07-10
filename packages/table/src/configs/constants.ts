/**
 * Default table configuration constants
 */
export const TABLE_DEFAULTS = {
  // Row configuration
  rowHeight: 40,
  minRowHeight: 24,
  maxRowHeight: 200,
  
  // Column configuration
  columnHeaderHeight: 40,
  minColumnWidth: 60,
  maxColumnWidth: 500,
  defaultColumnWidth: 120,
  
  // Padding and spacing
  cellPadding: 8,
  headerPadding: 12,
  columnHeadPadding: 8,
  
  // Resize handlers
  columnResizeHandlerWidth: 4,
  columnFreezeHandlerWidth: 2,
  
  // Scroll configuration
  scrollBuffer: 100,
  scrollBarWidth: 16,
  
  // Virtualization
  overscan: 5,
  estimatedRowHeight: 40,
  
  // Group configuration
  groupHeaderHeight: 32,
  groupIndentWidth: 20,
  
  // Statistics
  columnStatisticHeight: 32,
  minColumnStatisticWidth: 80,
  
  // Icons and controls
  rowHeadIconPaddingTop: 8,
  iconSize: 16,
  checkboxSize: 16,
  
  // Animation
  animationDuration: 200,
  
  // Touch
  touchScrollSensitivity: 1.5,
  
  // Selection
  selectionBorderWidth: 2,
  activeCellBorderWidth: 2,
} as const;

/**
 * CSS class names
 */
export const CSS_CLASSES = {
  // Table structure
  table: 'table-root',
  tableContainer: 'table-container',
  tableHeader: 'table-header',
  tableBody: 'table-body',
  tableFooter: 'table-footer',
  
  // Rows and cells
  row: 'table-row',
  cell: 'table-cell',
  headerCell: 'table-header-cell',
  
  // States
  selected: 'selected',
  active: 'active',
  editing: 'editing',
  loading: 'loading',
  disabled: 'disabled',
  readonly: 'readonly',
  
  // Interactions
  resizing: 'resizing',
  dragging: 'dragging',
  hovering: 'hovering',
  
  // Virtualization
  virtual: 'virtual',
  virtualRow: 'virtual-row',
  virtualCell: 'virtual-cell',
  
  // Scrolling
  scrolling: 'scrolling',
  scrollbar: 'scrollbar',
  
  // Grid specific
  grid: 'data-grid',
  gridCanvas: 'grid-canvas',
  gridOverlay: 'grid-overlay',
} as const;

/**
 * Event names
 */
export const EVENTS = {
  // Selection events
  selectionChange: 'selectionChange',
  activeCellChange: 'activeCellChange',
  
  // Cell events
  cellClick: 'cellClick',
  cellDoubleClick: 'cellDoubleClick',
  cellEdit: 'cellEdit',
  cellChange: 'cellChange',
  
  // Row events
  rowClick: 'rowClick',
  rowDoubleClick: 'rowDoubleClick',
  rowSelect: 'rowSelect',
  
  // Column events
  columnResize: 'columnResize',
  columnMove: 'columnMove',
  columnSort: 'columnSort',
  columnFilter: 'columnFilter',
  
  // Scroll events
  scroll: 'scroll',
  scrollEnd: 'scrollEnd',
  
  // Keyboard events
  keyDown: 'keyDown',
  keyUp: 'keyUp',
  
  // Mouse events
  mouseDown: 'mouseDown',
  mouseUp: 'mouseUp',
  mouseMove: 'mouseMove',
  
  // Touch events
  touchStart: 'touchStart',
  touchEnd: 'touchEnd',
  touchMove: 'touchMove',
  
  // Drag events
  dragStart: 'dragStart',
  dragEnd: 'dragEnd',
  drop: 'drop',
} as const;

/**
 * Z-index layers
 */
export const Z_INDEX = {
  base: 1,
  header: 10,
  selection: 20,
  activeCell: 25,
  editor: 30,
  dropdown: 40,
  modal: 50,
  tooltip: 60,
} as const;

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Performance thresholds
 */
export const PERFORMANCE = {
  // Maximum number of rows to render without virtualization
  maxRowsWithoutVirtualization: 100,
  
  // Maximum number of columns to render without virtualization
  maxColumnsWithoutVirtualization: 20,
  
  // Debounce delays
  resizeDebounce: 100,
  scrollDebounce: 16,
  searchDebounce: 300,
  
  // Throttle limits
  scrollThrottle: 16,
  resizeThrottle: 100,
} as const;
