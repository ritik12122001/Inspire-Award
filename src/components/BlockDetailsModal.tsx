import React, { useState, useMemo } from 'react';
import { 
  X, 
  Download, 
  Search, 
  School, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  ArrowUpDown,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { BlockData, SchoolRecord } from '../types';

interface BlockDetailsModalProps {
  block: BlockData | null;
  headers: string[];
  onClose: () => void;
  onDownloadPdf: (block: BlockData) => void;
}

export const BlockDetailsModal: React.FC<BlockDetailsModalProps> = ({
  block,
  headers,
  onClose,
  onDownloadPdf,
}) => {
  const [internalSearch, setInternalSearch] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);

  if (!block) return null;

  // Filter records within this block based on search term
  const filteredRecords = useMemo(() => {
    let result = block.records;
    if (internalSearch.trim()) {
      const q = internalSearch.toLowerCase().trim();
      result = result.filter(rec => {
        return Object.values(rec).some(val => {
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    if (sortColumn) {
      result = [...result].sort((a, b) => {
        const valA = a[sortColumn] !== undefined ? String(a[sortColumn]) : '';
        const valB = b[sortColumn] !== undefined ? String(b[sortColumn]) : '';
        
        // Numerical compare if possible
        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '') {
          return sortDirection === 'asc' ? numA - numB : numB - numA;
        }

        return sortDirection === 'asc' 
          ? valA.localeCompare(valB, undefined, { sensitivity: 'base' })
          : valB.localeCompare(valA, undefined, { sensitivity: 'base' });
      });
    }

    return result;
  }, [block.records, internalSearch, sortColumn, sortDirection]);

  // Pagination calculations
  const totalPages = pageSize === -1 ? 1 : Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = useMemo(() => {
    if (pageSize === -1) return filteredRecords;
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const copyRowData = (record: SchoolRecord, index: number) => {
    const text = headers.map(h => `${h}: ${record[h] || ''}`).join(' | ');
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const exportBlockCsv = () => {
    const csvRows = [];
    csvRows.push(headers.join(','));
    block.records.forEach(rec => {
      const row = headers.map(h => {
        let val = rec[h] !== undefined ? String(rec[h]) : '';
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Block_${block.name}_Pending_Schools.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      id="block-details-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-block-title"
    >
      <div 
        className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#1e3a8a] text-white px-6 py-4 border-b border-blue-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-blue-700/80 border border-blue-500/30 flex items-center justify-center text-white font-bold shrink-0">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 id="modal-block-title" className="text-lg font-bold tracking-tight text-white uppercase">
                  Block: {block.name}
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-amber-400 text-slate-950 uppercase tracking-wide">
                  {block.count} Pending Schools
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                INSPIRE Award Non-Compliance School Roster • District: Banka
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="modal-download-pdf-btn"
              onClick={() => onDownloadPdf(block)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded text-slate-950 bg-amber-400 hover:bg-amber-300 transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Block PDF
            </button>

            <button
              type="button"
              id="modal-export-csv-btn"
              onClick={exportBlockCsv}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-slate-100 bg-blue-950/80 hover:bg-blue-950 border border-blue-800 transition cursor-pointer"
              title="Export Block CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              CSV
            </button>

            <button
              type="button"
              id="close-modal-button"
              onClick={onClose}
              className="p-1 rounded text-blue-200 hover:text-white hover:bg-blue-800 transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Search inside block & page info */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search within records */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="modal-internal-search"
              value={internalSearch}
              onChange={(e) => {
                setInternalSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={`Search within ${block.name} (School Name, UDISE, AppCode)...`}
              className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {internalSearch && (
              <button
                type="button"
                onClick={() => {
                  setInternalSearch('');
                  setCurrentPage(1);
                }}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Counts and Page size */}
          <div className="flex items-center gap-3 justify-between sm:justify-end text-xs text-slate-600">
            <div className="font-medium">
              Showing <span className="font-bold text-slate-900">{filteredRecords.length}</span> of {block.records.length} records
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-700"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={-1}>All ({block.records.length})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table View (Responsive Horizontal Scroll) */}
        <div className="flex-1 overflow-auto p-0 border-b border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/90 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200 shadow-2xs">
              <tr>
                <th className="py-3 px-3.5 w-12 text-center text-slate-500 font-semibold border-r border-slate-200">
                  #
                </th>
                {headers.map((col) => (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="py-3 px-3.5 cursor-pointer hover:bg-slate-200/70 transition border-r border-slate-200 last:border-r-0 select-none"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate">{col}</span>
                      <ArrowUpDown className={`w-3 h-3 ${sortColumn === col ? 'text-blue-600' : 'text-slate-400'}`} />
                    </div>
                  </th>
                ))}
                <th className="py-3 px-3 w-16 text-center text-slate-500 font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((record, idx) => {
                  const absoluteIndex = pageSize === -1 ? idx + 1 : (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-blue-50/40 transition duration-75 group"
                    >
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px] border-r border-slate-100">
                        {absoluteIndex}
                      </td>
                      {headers.map((col) => {
                        const val = record[col];
                        const isSchoolName = col.toLowerCase().includes('school') || col.toLowerCase().includes('name');
                        const isUdise = col.toLowerCase().includes('udise');
                        const isAppCode = col.toLowerCase().includes('app');

                        return (
                          <td
                            key={col}
                            className={`py-2.5 px-3.5 border-r border-slate-100 last:border-r-0 ${
                              isSchoolName
                                ? 'font-semibold text-slate-900 min-w-[220px]'
                                : isUdise
                                ? 'font-mono text-blue-800'
                                : isAppCode
                                ? 'font-mono text-slate-600 text-[11px]'
                                : 'text-slate-700'
                            }`}
                          >
                            {val !== undefined && val !== null && String(val).trim() !== '' ? (
                              String(val)
                            ) : (
                              <span className="text-slate-300 italic">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => copyRowData(record, idx)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          title="Copy row data"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={headers.length + 2} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-medium">No records match &quot;{internalSearch}&quot;</p>
                    <p className="text-xs text-slate-400 mt-1">Try searching with a different term or clear the filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Footer with Pagination & Actions */}
        <div className="bg-white px-6 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDownloadPdf(block)}
              className="sm:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-500 transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Block PDF
            </button>
            <span className="text-xs text-slate-500">
              Block: <span className="font-semibold text-slate-800">{block.name}</span> ({block.count} schools)
            </span>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
