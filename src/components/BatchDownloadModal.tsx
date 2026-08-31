import React, { useState } from 'react';
import { 
  X, 
  FileDown, 
  Archive, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  Info,
  Layers,
  FileCheck
} from 'lucide-react';
import { BlockData, DashboardSummary } from '../types';
import { 
  downloadAllBlockPdfsSequentially, 
  downloadAllBlockPdfsAsZip,
  downloadDistrictSummaryPdf 
} from '../utils/pdfGenerator';

interface BatchDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: BlockData[];
  headers: string[];
  summary: DashboardSummary;
}

export const BatchDownloadModal: React.FC<BatchDownloadModalProps> = ({
  isOpen,
  onClose,
  blocks,
  headers,
  summary,
}) => {
  const [status, setStatus] = useState<'idle' | 'processing-sequential' | 'processing-zip' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState({ current: 0, total: blocks.length, blockName: '' });
  const [downloadMode, setDownloadMode] = useState<'sequential' | 'zip' | null>(null);

  if (!isOpen) return null;

  const handleStartSequential = async () => {
    try {
      setStatus('processing-sequential');
      setDownloadMode('sequential');
      setProgress({ current: 0, total: blocks.length, blockName: 'Starting...' });

      await downloadAllBlockPdfsSequentially(blocks, headers, (current, total, blockName) => {
        setProgress({ current, total, blockName });
      });

      setStatus('completed');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const handleStartZip = async () => {
    try {
      setStatus('processing-zip');
      setDownloadMode('zip');
      setProgress({ current: 0, total: blocks.length, blockName: 'Starting packaging...' });

      await downloadAllBlockPdfsAsZip(blocks, headers, (current, total, blockName) => {
        setProgress({ current, total, blockName });
      });

      setStatus('completed');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const handleDownloadSummary = () => {
    downloadDistrictSummaryPdf(summary, blocks, headers);
  };

  const isBusy = status === 'processing-sequential' || status === 'processing-zip';

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4"
      id="batch-download-modal"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1e3a8a] text-white px-6 py-4 border-b border-blue-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-blue-700/80 border border-blue-500/30 flex items-center justify-center text-white font-bold shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white uppercase tracking-tight">
                Download All Block PDFs
              </h3>
              <p className="text-xs text-blue-100">
                Generating {blocks.length} individual block reports
              </p>
            </div>
          </div>

          {!isBusy && (
            <button
              type="button"
              onClick={onClose}
              className="text-blue-200 hover:text-white p-1 rounded transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {status === 'idle' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-0.5">Separate PDF for each of the {blocks.length} blocks</p>
                  <p className="text-blue-700 leading-relaxed">
                    In compliance with official reporting requirements, each block receives its own formatted PDF file (e.g. <code>Block_Shambhuganj.pdf</code>).
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {/* Option 1: Sequential Individual Downloads */}
                <button
                  type="button"
                  id="btn-download-sequential"
                  onClick={handleStartSequential}
                  className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        <FileDown className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition">
                          Download {blocks.length} Individual PDF Files
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Browser triggers {blocks.length} sequential downloads with progress tracking
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Option 2: 1-Click ZIP Bundle */}
                <button
                  type="button"
                  id="btn-download-zip"
                  onClick={handleStartZip}
                  className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                        <Archive className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition">
                          Download All as ZIP Archive
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          1-Click package containing all {blocks.length} separate block PDFs
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Option 3: District Summary */}
                <button
                  type="button"
                  id="btn-download-district-summary"
                  onClick={handleDownloadSummary}
                  className="w-full text-left p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-800">
                        Download 1-Page District Summary Overview PDF
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Consolidated statistics and block comparisons
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {isBusy && (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>

              <div>
                <h4 className="font-bold text-base text-slate-900">
                  {status === 'processing-sequential' ? 'Generating & Downloading Block PDFs' : 'Packaging Block PDFs into ZIP'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Processing Block {progress.current} of {progress.total}: <strong className="text-blue-700">{progress.blockName}</strong>
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400">
                Please keep this window open while PDFs are generated in your browser.
              </p>
            </div>
          )}

          {status === 'completed' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-bold text-base text-slate-900">
                  {downloadMode === 'zip' ? 'ZIP Archive Generated Successfully!' : 'All 11 Block PDFs Generated!'}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  All individual block-wise PDF files have been generated and sent to your downloads folder.
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                >
                  Download Again
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-bold text-base text-slate-900">
                  Download Encountered an Issue
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Some browser pop-up blockers may restrict bulk downloads. Try downloading as a ZIP archive instead.
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={handleStartZip}
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition cursor-pointer"
                >
                  Try Download as ZIP
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {status === 'idle' && (
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
