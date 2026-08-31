import React from 'react';
import { 
  FileDown, 
  RefreshCw, 
  Calendar
} from 'lucide-react';
import { DashboardSummary } from '../types';

interface HeaderProps {
  summary: DashboardSummary;
  onDownloadAllClick: () => void;
  onRefreshClick: () => void;
  isRefreshing: boolean;
  lastSyncedTime: string;
}

export const ONEDRIVE_SOURCE_URL = 'https://1drv.ms/x/c/81537c2af549ad15/IQDOikIEQSPyQpKWksPqxKl8AUeYCEYNGPdmo7e4gpI1y-Q?e=38Nq1F';

export const Header: React.FC<HeaderProps> = ({
  summary,
  onDownloadAllClick,
  onRefreshClick,
  isRefreshing,
  lastSyncedTime,
}) => {
  return (
    <header className="bg-[#1e3a8a] text-white shadow-md sticky top-0 z-30" id="official-header">
      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-6 py-4 sm:py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Title */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight uppercase text-white flex items-center gap-2.5">
              <span>Inspire Award — Blockwise Pending School Count</span>
            </h1>
          </div>

          {/* Right Header: Last Updated & Utility Buttons */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-between lg:justify-end">
            <div className="text-left lg:text-right border-l lg:border-l-0 pl-3 lg:pl-0 border-blue-700/60">
              <p className="text-[10px] uppercase text-blue-200 tracking-wider font-semibold opacity-85">
                Live Source Sync
              </p>
              <p className="font-mono font-bold text-xs sm:text-sm text-white flex items-center gap-1 lg:justify-end">
                <Calendar className="w-3.5 h-3.5 text-amber-300 inline" />
                {lastSyncedTime || '31 Aug 2026 10:45 AM'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="refresh-onedrive-button"
                onClick={onRefreshClick}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded bg-blue-800/90 hover:bg-blue-700 text-white border border-blue-500/50 transition shadow-xs cursor-pointer disabled:opacity-60"
                title="Sync and refresh latest records from OneDrive"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-200 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Syncing...' : 'Sync Live Data'}</span>
              </button>

              <button
                type="button"
                id="download-all-pdfs-header-button"
                onClick={onDownloadAllClick}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-xs cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                Download All PDFs
              </button>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
