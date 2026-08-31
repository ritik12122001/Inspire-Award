/**
 * Type definitions for INSPIRE Award Blockwise Pending School Dashboard
 */

export interface SchoolRecord {
  'S.No'?: string | number;
  AppCode?: string;
  Udisecode?: string;
  SchoolName?: string;
  Block?: string;
  [key: string]: any;
}

export interface BlockData {
  name: string;
  count: number;
  records: SchoolRecord[];
  percentageOfTotal: number;
}

export interface DashboardSummary {
  totalBlocks: number;
  totalPendingSchools: number;
  highestBlock: {
    name: string;
    count: number;
  };
  lowestBlock: {
    name: string;
    count: number;
  };
  averagePerBlock: number;
  metaLines: string[];
}

export interface ParsedDataset {
  headers: string[];
  records: SchoolRecord[];
  blocks: BlockData[];
  summary: DashboardSummary;
  rawCsv: string;
  fileName: string;
  blockColumnKey: string;
  metaLines: string[];
  loadedAt: Date;
}

export type SortOrder = 'name-asc' | 'name-desc' | 'count-desc' | 'count-asc';
