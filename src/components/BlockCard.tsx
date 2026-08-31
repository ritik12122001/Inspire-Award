import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  Download, 
  AlertCircle,
  CheckCircle2,
  School,
  Loader2
} from 'lucide-react';
import { BlockData } from '../types';

interface BlockCardProps {
  block: BlockData;
  index: number;
  totalDistrictSchools: number;
  onViewDetails: (block: BlockData) => void;
  onDownloadPdf: (block: BlockData) => Promise<void> | void;
}

export const BlockCard: React.FC<BlockCardProps> = ({
  block,
  index,
  totalDistrictSchools,
  onViewDetails,
  onDownloadPdf,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsDownloading(true);
      await onDownloadPdf(block);
    } finally {
      setTimeout(() => setIsDownloading(false), 500);
    }
  };

  // Severity indicators
  const isHighPending = block.count >= 50;
  const isMediumPending = block.count >= 30 && block.count < 50;

  const leftBorderAccent = isHighPending
    ? 'border-l-4 border-l-red-500'
    : isMediumPending
    ? 'border-l-4 border-l-amber-500'
    : 'border-l-4 border-l-blue-600';

  const badgeElement = isHighPending ? (
    <span className="text-[11px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold uppercase tracking-wide inline-flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      Action Needed
    </span>
  ) : isMediumPending ? (
    <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold uppercase tracking-wide">
      Moderate
    </span>
  ) : (
    <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
      ID: #{index + 101}
    </span>
  );

  const meterBarColor = isHighPending
    ? 'bg-red-500'
    : isMediumPending
    ? 'bg-amber-500'
    : 'bg-blue-600';

  return (
    <div
      id={`block-card-${block.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      className={`bg-white border border-slate-200 rounded-lg p-5 shadow-xs ${leftBorderAccent} flex flex-col justify-between hover:border-blue-300 hover:shadow-sm transition-all group`}
    >
      {/* Top Header */}
      <div>
        <div className="flex justify-between items-start mb-2 gap-2">
          <div>
            <h3 className="font-bold text-slate-800 uppercase text-lg leading-tight tracking-tight group-hover:text-blue-700 transition">
              {block.name}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Banka District • Block #{index + 1}
            </p>
          </div>
          <div className="shrink-0">
            {badgeElement}
          </div>
        </div>

        {/* Count Metric */}
        <div className="mt-4 mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {block.count}
            </span>
            <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">
              Pending Schools
            </span>
          </div>

          {/* Progress / Share Meter */}
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-slate-500 font-medium mb-1">
              <span>District Share</span>
              <span className="font-semibold text-slate-700">{block.percentageOfTotal}% ({block.count}/{totalDistrictSchools})</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${meterBarColor} rounded-full transition-all duration-500`}
                style={{ width: `${Math.max(block.percentageOfTotal, 5)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-4 pt-3.5 border-t border-slate-100">
        <button
          type="button"
          id={`view-details-btn-${block.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
          onClick={() => onViewDetails(block)}
          className="flex-1 py-2 bg-slate-800 text-white rounded text-xs font-bold uppercase tracking-wide hover:bg-slate-700 active:bg-slate-900 transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-slate-300" />
          <span>View Details</span>
        </button>

        <button
          type="button"
          id={`download-pdf-btn-${block.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex-1 py-2 border border-slate-300 text-slate-700 bg-white rounded text-xs font-bold uppercase tracking-wide hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-75"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-blue-700" />
              <span>Download PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
