import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { SchoolRecord, BlockData, DashboardSummary, ParsedDataset } from '../types';

/**
 * Parses XLSX / XLS ArrayBuffer to extract headers, records, block groupings, and summary statistics.
 */
export function parseSchoolWorkbook(data: ArrayBuffer | Uint8Array, fileName: string = 'Blockwise_Categorised.xlsx'): ParsedDataset {
  const workbook = XLSX.read(data, { type: 'array' });
  const allRows: SchoolRecord[] = [];
  const metaLines: string[] = [];
  let detectedHeaders: string[] = ['S.No', 'AppCode', 'Udisecode', 'SchoolName', 'Block'];

  // Check if workbook has multiple block sheets or single tabular sheet
  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const sheetJson = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, blankrows: false });

    let headerIdx = -1;
    let localHeaders: string[] = [];

    // Find table header row
    for (let i = 0; i < Math.min(sheetJson.length, 10); i++) {
      const row = sheetJson[i];
      if (Array.isArray(row)) {
        const rowStr = row.map(c => String(c || '').toLowerCase()).join(' ');
        if (
          (rowStr.includes('s.no') || rowStr.includes('sno') || rowStr.includes('sl.no') || rowStr.includes('serial')) &&
          (rowStr.includes('school') || rowStr.includes('block') || rowStr.includes('udise') || rowStr.includes('appcode'))
        ) {
          headerIdx = i;
          localHeaders = row.map(c => String(c || '').trim()).filter(Boolean);
          break;
        } else if (rowStr.includes('appcode') || (rowStr.includes('udisecode') && rowStr.includes('block'))) {
          headerIdx = i;
          localHeaders = row.map(c => String(c || '').trim()).filter(Boolean);
          break;
        } else if (row[0] && String(row[0]).trim()) {
          const m = String(row[0]).trim();
          if (!metaLines.includes(m)) {
            metaLines.push(m);
          }
        }
      }
    }

    if (localHeaders.length > 0) {
      detectedHeaders = localHeaders;
    }

    const dataStartIdx = headerIdx >= 0 ? headerIdx + 1 : 0;
    const defaultBlockForSheet = sheetName === 'Blockwise_Categorised' ? 'Shambhuganj' : sheetName;

    for (let r = dataStartIdx; r < sheetJson.length; r++) {
      const row = sheetJson[r];
      if (!Array.isArray(row) || row.length === 0) continue;

      const firstCell = String(row[0] || '').trim();
      const secondCell = String(row[1] || '').trim();

      // Ensure row has actual data (e.g. S.No is digit, or appCode exists)
      if (firstCell.match(/^\d+$/) || secondCell.startsWith('APP') || row.length >= 4) {
        const record: SchoolRecord = {};
        
        if (localHeaders.length > 0) {
          localHeaders.forEach((h, colIdx) => {
            record[h] = row[colIdx] !== undefined ? String(row[colIdx]).trim() : '';
          });
        } else {
          record['S.No'] = firstCell || allRows.length + 1;
          record['AppCode'] = String(row[1] || '').trim();
          record['Udisecode'] = String(row[2] || '').trim();
          record['SchoolName'] = String(row[3] || '').trim();
          record['Block'] = String(row[4] || '').trim() || defaultBlockForSheet;
        }

        // If block column is missing or empty, assign sheet name
        const blkKey = Object.keys(record).find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === 'block') || 'Block';
        if (!record[blkKey]) {
          record[blkKey] = defaultBlockForSheet;
        }

        allRows.push(record);
      }
    }
  });

  // Convert back to CSV string for uniform state
  const csvLines = [
    metaLines.length > 0 ? metaLines.join('\n') : "fcgkj f'k{kk ifj;kstuk] ck¡dk,,,,\nfnukad 31-08-2026 rd Inspire Award ds rgr Nk=@Nk=kvksa dk Nominaton ugha djus okys fo|ky;ksa dh lwph,,,,",
    detectedHeaders.join(','),
  ];

  allRows.forEach((rec, idx) => {
    const vals = detectedHeaders.map((h, hIdx) => {
      let v = rec[h] || '';
      if (h === 'S.No' && !v) v = String(idx + 1);
      if (v.includes(',') || v.includes('"')) {
        return `"${v.replace(/"/g, '""')}"`;
      }
      return v;
    });
    csvLines.push(vals.join(','));
  });

  const rawCsv = csvLines.join('\n');
  return parseSchoolCsv(rawCsv, fileName);
}

/**
 * Parses CSV text to extract headers, records, block groupings, and summary statistics.
 */
export function parseSchoolCsv(csvContent: string, fileName: string = 'Blockwise_Categorised.csv'): ParsedDataset {
  if (!csvContent || !csvContent.trim()) {
    throw new Error('CSV content is empty');
  }

  // Split into raw lines to detect any pre-header metadata
  const lines = csvContent.split(/\r?\n/);
  const metaLines: string[] = [];
  let headerLineIndex = -1;

  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i];
    // Check if this line looks like the tabular header
    const lower = line.toLowerCase();
    if (
      (lower.includes('s.no') || lower.includes('sno') || lower.includes('sl.no') || lower.includes('serial')) &&
      (lower.includes('school') || lower.includes('block') || lower.includes('udise') || lower.includes('appcode'))
    ) {
      headerLineIndex = i;
      break;
    } else if (lower.includes('appcode') || (lower.includes('udisecode') && lower.includes('block'))) {
      headerLineIndex = i;
      break;
    } else if (line.trim().length > 0) {
      // Clean trailing commas from metadata line
      const cleanedMeta = line.replace(/,+$/, '').trim();
      if (cleanedMeta) {
        metaLines.push(cleanedMeta);
      }
    }
  }

  // If no explicit header line found by keyword, fallback to first non-empty line
  const effectiveCsv = headerLineIndex > 0 ? lines.slice(headerLineIndex).join('\n') : csvContent;

  const parsed = Papa.parse<Record<string, string>>(effectiveCsv, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header: string) => header.trim(),
  });

  const rawHeaders = parsed.meta.fields || [];
  // Filter out empty header fields
  const headers = rawHeaders.filter(h => h && h.trim().length > 0);

  if (headers.length === 0) {
    throw new Error('No valid column headers found in CSV');
  }

  // Identify the block column key
  let blockColumnKey = headers.find(h => {
    const lower = h.toLowerCase().replace(/[^a-z0-9]/g, '');
    return lower === 'block' || lower === 'blockname' || lower === 'block_name' || lower === 'blocks';
  });

  if (!blockColumnKey) {
    // If not named 'Block', inspect columns to find one with repeated textual block identifiers
    blockColumnKey = headers[headers.length - 1] || headers[0];
  }

  // Extract clean records preserving all original field values
  const records: SchoolRecord[] = [];
  parsed.data.forEach((row, idx) => {
    // Check if row has any values
    const hasValues = Object.values(row).some(v => v !== null && v !== undefined && String(v).trim().length > 0);
    if (!hasValues) return;

    const cleanRecord: SchoolRecord = {};
    headers.forEach(h => {
      cleanRecord[h] = row[h] !== undefined ? String(row[h]).trim() : '';
    });

    // Ensure S.No is set if missing
    if (!cleanRecord['S.No'] && !cleanRecord['s.no'] && !cleanRecord['SNo']) {
      cleanRecord['S.No'] = idx + 1;
    }

    records.push(cleanRecord);
  });

  // Group records by Block
  const blockMap = new Map<string, SchoolRecord[]>();

  records.forEach(record => {
    let blockName = (record[blockColumnKey!] || 'Unassigned').trim();
    if (!blockName) blockName = 'Unassigned';
    
    if (!blockMap.has(blockName)) {
      blockMap.set(blockName, []);
    }
    blockMap.get(blockName)!.push(record);
  });

  const totalPendingSchools = records.length;
  const blocks: BlockData[] = [];

  blockMap.forEach((blockRecords, name) => {
    const count = blockRecords.length;
    const percentageOfTotal = totalPendingSchools > 0 ? Number(((count / totalPendingSchools) * 100).toFixed(1)) : 0;
    blocks.push({
      name,
      count,
      records: blockRecords,
      percentageOfTotal,
    });
  });

  // Sort blocks alphabetically by default
  blocks.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

  // Compute highest & lowest pending blocks
  let highestBlock = { name: 'N/A', count: 0 };
  let lowestBlock = { name: 'N/A', count: Infinity };

  if (blocks.length > 0) {
    blocks.forEach(b => {
      if (b.count > highestBlock.count) {
        highestBlock = { name: b.name, count: b.count };
      }
      if (b.count < lowestBlock.count) {
        lowestBlock = { name: b.name, count: b.count };
      }
    });
  } else {
    lowestBlock = { name: 'N/A', count: 0 };
  }

  const summary: DashboardSummary = {
    totalBlocks: blocks.length,
    totalPendingSchools,
    highestBlock,
    lowestBlock: lowestBlock.count === Infinity ? { name: 'N/A', count: 0 } : lowestBlock,
    averagePerBlock: blocks.length > 0 ? Math.round(totalPendingSchools / blocks.length) : 0,
    metaLines,
  };

  return {
    headers,
    records,
    blocks,
    summary,
    rawCsv: csvContent,
    fileName,
    blockColumnKey,
    metaLines,
    loadedAt: new Date(),
  };
}
