import type { GroupPoint, GroupCollection } from '../types/grid';

/**
 * Internal group point interface (extends the base interface)
 */
export interface InternalGroupPoint extends GroupPoint {
  rowIndex: number;
  isCollapsed: boolean;
  childCount: number;
  parentId?: string;
}

/**
 * Internal group collection interface
 */
export interface InternalGroupCollection {
  groups: Map<string, InternalGroupPoint>;
  rootGroups: string[];
  maxLevel: number;
}

/**
 * Group configuration
 */
export interface GroupConfig {
  /** Initial collapsed group IDs */
  collapsedGroupIds?: Set<string>;
  /** Maximum nesting level */
  maxLevel?: number;
  /** Group change callback */
  onGroupChange?: (collection: InternalGroupCollection) => void;
  /** Collapse change callback */
  onCollapseChange?: (collapsedIds: Set<string>) => void;
}

/**
 * Manager for handling row grouping functionality
 */
export class GroupManager {
  private groups: Map<string, InternalGroupPoint> = new Map();
  private rootGroups: string[] = [];
  private collapsedGroups: Set<string> = new Set();
  private maxLevel = 0;
  private config: GroupConfig;

  constructor(config: GroupConfig = {}) {
    this.config = config;
    this.collapsedGroups = config.collapsedGroupIds || new Set();
  }

  /**
   * Set group collection
   */
  setGroupCollection(collection: InternalGroupCollection): void {
    this.groups = new Map(collection.groups);
    this.rootGroups = [...collection.rootGroups];
    this.maxLevel = collection.maxLevel;
    this.config.onGroupChange?.(this.getGroupCollection());
  }

  /**
   * Get current group collection
   */
  getGroupCollection(): InternalGroupCollection {
    return {
      groups: new Map(this.groups),
      rootGroups: [...this.rootGroups],
      maxLevel: this.maxLevel,
    };
  }

  /**
   * Add a group
   */
  addGroup(group: InternalGroupPoint): void {
    this.groups.set(group.id, group);
    
    if (!group.parentId) {
      this.rootGroups.push(group.id);
    }
    
    this.maxLevel = Math.max(this.maxLevel, group.level);
    this.config.onGroupChange?.(this.getGroupCollection());
  }

  /**
   * Remove a group
   */
  removeGroup(groupId: string): void {
    const group = this.groups.get(groupId);
    if (!group) return;

    // Remove from parent's children or root groups
    if (!group.parentId) {
      this.rootGroups = this.rootGroups.filter(id => id !== groupId);
    }

    // Remove from collapsed groups
    this.collapsedGroups.delete(groupId);

    // Remove the group
    this.groups.delete(groupId);

    // Recalculate max level
    this.recalculateMaxLevel();
    
    this.config.onGroupChange?.(this.getGroupCollection());
    this.config.onCollapseChange?.(new Set(this.collapsedGroups));
  }

  /**
   * Get group by ID
   */
  getGroup(groupId: string): InternalGroupPoint | undefined {
    return this.groups.get(groupId);
  }

  /**
   * Get group at row index
   */
  getGroupAtRow(rowIndex: number): InternalGroupPoint | undefined {
    for (const group of this.groups.values()) {
      if (group.rowIndex === rowIndex) {
        return group;
      }
    }
    return undefined;
  }

  /**
   * Check if group is collapsed
   */
  isGroupCollapsed(groupId: string): boolean {
    return this.collapsedGroups.has(groupId);
  }

  /**
   * Collapse a group
   */
  collapseGroup(groupId: string): void {
    if (this.groups.has(groupId)) {
      this.collapsedGroups.add(groupId);
      this.config.onCollapseChange?.(new Set(this.collapsedGroups));
    }
  }

  /**
   * Expand a group
   */
  expandGroup(groupId: string): void {
    this.collapsedGroups.delete(groupId);
    this.config.onCollapseChange?.(new Set(this.collapsedGroups));
  }

  /**
   * Toggle group collapse state
   */
  toggleGroup(groupId: string): void {
    if (this.isGroupCollapsed(groupId)) {
      this.expandGroup(groupId);
    } else {
      this.collapseGroup(groupId);
    }
  }

  /**
   * Collapse all groups
   */
  collapseAll(): void {
    this.collapsedGroups = new Set(this.groups.keys());
    this.config.onCollapseChange?.(new Set(this.collapsedGroups));
  }

  /**
   * Expand all groups
   */
  expandAll(): void {
    this.collapsedGroups.clear();
    this.config.onCollapseChange?.(new Set(this.collapsedGroups));
  }

  /**
   * Get collapsed group IDs
   */
  getCollapsedGroups(): Set<string> {
    return new Set(this.collapsedGroups);
  }

  /**
   * Set collapsed group IDs
   */
  setCollapsedGroups(collapsedIds: Set<string>): void {
    this.collapsedGroups = new Set(collapsedIds);
    this.config.onCollapseChange?.(new Set(this.collapsedGroups));
  }

  /**
   * Get visible rows considering collapsed groups
   */
  getVisibleRows(totalRows: number): number[] {
    const visibleRows: number[] = [];
    
    for (let i = 0; i < totalRows; i++) {
      if (this.isRowVisible(i)) {
        visibleRows.push(i);
      }
    }
    
    return visibleRows;
  }

  /**
   * Check if row is visible (not hidden by collapsed group)
   */
  isRowVisible(rowIndex: number): boolean {
    // Find if this row belongs to any collapsed group
    for (const group of this.groups.values()) {
      if (this.isGroupCollapsed(group.id)) {
        // Check if row is within this collapsed group's range
        const groupEndRow = group.rowIndex + group.childCount;
        if (rowIndex > group.rowIndex && rowIndex <= groupEndRow) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Get group children
   */
  getGroupChildren(groupId: string): InternalGroupPoint[] {
    const children: InternalGroupPoint[] = [];

    for (const group of this.groups.values()) {
      if (group.parentId === groupId) {
        children.push(group);
      }
    }

    return children.sort((a, b) => a.rowIndex - b.rowIndex);
  }

  /**
   * Get group hierarchy path
   */
  getGroupPath(groupId: string): InternalGroupPoint[] {
    const path: InternalGroupPoint[] = [];
    let currentGroup = this.groups.get(groupId);
    
    while (currentGroup) {
      path.unshift(currentGroup);
      currentGroup = currentGroup.parentId 
        ? this.groups.get(currentGroup.parentId) 
        : undefined;
    }
    
    return path;
  }

  /**
   * Clear all groups
   */
  clear(): void {
    this.groups.clear();
    this.rootGroups = [];
    this.collapsedGroups.clear();
    this.maxLevel = 0;
    
    this.config.onGroupChange?.(this.getGroupCollection());
    this.config.onCollapseChange?.(new Set(this.collapsedGroups));
  }

  /**
   * Recalculate maximum level
   */
  private recalculateMaxLevel(): void {
    this.maxLevel = 0;
    for (const group of this.groups.values()) {
      this.maxLevel = Math.max(this.maxLevel, group.level);
    }
  }

  /**
   * Get group statistics
   */
  getStatistics(): {
    totalGroups: number;
    collapsedGroups: number;
    maxLevel: number;
    rootGroups: number;
  } {
    return {
      totalGroups: this.groups.size,
      collapsedGroups: this.collapsedGroups.size,
      maxLevel: this.maxLevel,
      rootGroups: this.rootGroups.length,
    };
  }
}
