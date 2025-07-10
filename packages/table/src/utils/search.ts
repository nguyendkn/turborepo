/**
 * Search match interface
 */
export interface SearchMatch {
  start: number;
  end: number;
  text: string;
}

/**
 * Search options
 */
export interface SearchOptions {
  /** Case sensitive search */
  caseSensitive?: boolean;
  /** Whole word matching */
  wholeWord?: boolean;
  /** Regular expression search */
  regex?: boolean;
  /** Maximum number of matches to return */
  maxMatches?: number;
}

/**
 * Search result
 */
export interface SearchResult {
  matches: SearchMatch[];
  totalMatches: number;
  hasMore: boolean;
}

/**
 * Find all matches of a search term in text
 */
export function findMatches(
  text: string,
  searchTerm: string,
  options: SearchOptions = {}
): SearchResult {
  const {
    caseSensitive = false,
    wholeWord = false,
    regex = false,
    maxMatches = 100,
  } = options;

  if (!text || !searchTerm) {
    return { matches: [], totalMatches: 0, hasMore: false };
  }

  const matches: SearchMatch[] = [];
  let searchPattern: RegExp;

  try {
    if (regex) {
      const flags = caseSensitive ? 'g' : 'gi';
      searchPattern = new RegExp(searchTerm, flags);
    } else {
      const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = wholeWord ? `\\b${escapedTerm}\\b` : escapedTerm;
      const flags = caseSensitive ? 'g' : 'gi';
      searchPattern = new RegExp(pattern, flags);
    }
  } catch (error) {
    // Invalid regex, return empty result
    return { matches: [], totalMatches: 0, hasMore: false };
  }

  let match;
  let totalMatches = 0;

  while ((match = searchPattern.exec(text)) !== null) {
    totalMatches++;
    
    if (matches.length < maxMatches) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
      });
    }

    // Prevent infinite loop on zero-length matches
    if (match[0].length === 0) {
      searchPattern.lastIndex++;
    }
  }

  return {
    matches,
    totalMatches,
    hasMore: totalMatches > maxMatches,
  };
}

/**
 * Highlight search matches in text
 */
export function highlightMatches(
  text: string,
  matches: SearchMatch[],
  highlightClass: string = 'search-highlight'
): string {
  if (!matches.length) return text;

  // Sort matches by start position (descending) to avoid index shifting
  const sortedMatches = [...matches].sort((a, b) => b.start - a.start);
  
  let result = text;
  
  for (const match of sortedMatches) {
    const before = result.substring(0, match.start);
    const highlighted = `<span class="${highlightClass}">${match.text}</span>`;
    const after = result.substring(match.end);
    result = before + highlighted + after;
  }

  return result;
}

/**
 * Get text segments with highlight information
 */
export interface TextSegment {
  text: string;
  isHighlight: boolean;
  matchIndex?: number;
}

export function getTextSegments(text: string, matches: SearchMatch[]): TextSegment[] {
  if (!matches.length) {
    return [{ text, isHighlight: false }];
  }

  const segments: TextSegment[] = [];
  const sortedMatches = [...matches].sort((a, b) => a.start - b.start);
  
  let lastEnd = 0;
  
  sortedMatches.forEach((match, index) => {
    // Add text before match
    if (match.start > lastEnd) {
      segments.push({
        text: text.substring(lastEnd, match.start),
        isHighlight: false,
      });
    }
    
    // Add highlighted match
    segments.push({
      text: match.text,
      isHighlight: true,
      matchIndex: index,
    });
    
    lastEnd = match.end;
  });
  
  // Add remaining text
  if (lastEnd < text.length) {
    segments.push({
      text: text.substring(lastEnd),
      isHighlight: false,
    });
  }
  
  return segments;
}

/**
 * Search within table data
 */
export interface TableSearchOptions extends SearchOptions {
  /** Columns to search in (if not specified, search all) */
  columns?: string[];
  /** Include row index in search */
  includeRowIndex?: boolean;
}

export interface TableSearchResult {
  rowIndex: number;
  columnId: string;
  cellValue: string;
  matches: SearchMatch[];
}

/**
 * Search within table data
 */
export function searchTableData<T = unknown>(
  data: T[],
  searchTerm: string,
  getColumnValue: (row: T, columnId: string) => string,
  columnIds: string[],
  options: TableSearchOptions = {}
): TableSearchResult[] {
  const {
    columns = columnIds,
    includeRowIndex = false,
    ...searchOptions
  } = options;

  const results: TableSearchResult[] = [];

  data.forEach((row, rowIndex) => {
    // Search in row index if enabled
    if (includeRowIndex) {
      const rowIndexStr = String(rowIndex);
      const searchResult = findMatches(rowIndexStr, searchTerm, searchOptions);
      
      if (searchResult.matches.length > 0) {
        results.push({
          rowIndex,
          columnId: '__rowIndex__',
          cellValue: rowIndexStr,
          matches: searchResult.matches,
        });
      }
    }

    // Search in specified columns
    columns.forEach(columnId => {
      const cellValue = getColumnValue(row, columnId);
      if (cellValue) {
        const searchResult = findMatches(cellValue, searchTerm, searchOptions);
        
        if (searchResult.matches.length > 0) {
          results.push({
            rowIndex,
            columnId,
            cellValue,
            matches: searchResult.matches,
          });
        }
      }
    });
  });

  return results;
}

/**
 * Navigate through search results
 */
export class SearchNavigator {
  private results: TableSearchResult[] = [];
  private currentIndex = -1;

  constructor(results: TableSearchResult[] = []) {
    this.results = results;
  }

  setResults(results: TableSearchResult[]): void {
    this.results = results;
    this.currentIndex = results.length > 0 ? 0 : -1;
  }

  get totalResults(): number {
    return this.results.length;
  }

  get currentResult(): TableSearchResult | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.results.length) {
      return this.results[this.currentIndex] || null;
    }
    return null;
  }

  get currentPosition(): number {
    return this.currentIndex + 1;
  }

  next(): TableSearchResult | null {
    if (this.results.length === 0) return null;
    
    this.currentIndex = (this.currentIndex + 1) % this.results.length;
    return this.currentResult;
  }

  previous(): TableSearchResult | null {
    if (this.results.length === 0) return null;
    
    this.currentIndex = this.currentIndex <= 0 
      ? this.results.length - 1 
      : this.currentIndex - 1;
    return this.currentResult;
  }

  goTo(index: number): TableSearchResult | null {
    if (index < 0 || index >= this.results.length) return null;
    
    this.currentIndex = index;
    return this.currentResult;
  }

  clear(): void {
    this.results = [];
    this.currentIndex = -1;
  }
}
