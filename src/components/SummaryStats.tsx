import React from 'react';
import { 
  Building, 
  School, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  CheckCircle,
  FileCheck2
} from 'lucide-react';
import { DashboardSummary } from '../types';

interface SummaryStatsProps {
  summary: DashboardSummary;
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({ summary }) => {
  return (
    <section className="mb-6" id="dashboard-summary-section" aria-label="Dashboard Summary Statistics">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Blocks */}
        <div 
          id="stat-card-total-blocks"
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs hover:border-slate-300 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase text-slate-500 font-bold tracking-wider">
              Total Blocks
            </span>
            <div className="w-8 h-8 rounded bg-blue-50 text-[#1e3a8a] flex items-center justify-center font-bold">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {summary.totalBlocks}
            </span>
            <span className="text-xs font-medium text-slate-500">
              Admin Blocks
            </span>
          </div>
          <div className="mt-2.5 text-[11px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100 font-medium">
            <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
            <span>100% parsed dynamically</span>
          </div>
        </div>

        {/* Total Pending Schools */}
        <div 
          id="stat-card-total-pending"
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs hover:border-slate-300 transition border-l-4 border-l-red-500"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase text-slate-500 font-bold tracking-wider">
              Total Pending Schools
            </span>
            <div className="w-8 h-8 rounded bg-red-50 text-red-600 flex items-center justify-center">
              <School className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-red-600 tracking-tight">
              {summary.totalPendingSchools.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase">
              backlog
            </span>
          </div>
          <div className="mt-2.5 text-[11px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100 font-medium">
            <BarChart3 className="w-3.5 h-3.5 text-red-500" />
            <span>Avg {summary.averagePerBlock} schools per block</span>
          </div>
        </div>

        {/* Highest Pending Block */}
        <div 
          id="stat-card-highest-pending"
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs hover:border-slate-300 transition border-l-4 border-l-amber-500"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase text-slate-500 font-bold tracking-wider">
              Highest Pending
            </span>
            <div className="w-8 h-8 rounded bg-amber-50 text-amber-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 truncate uppercase" title={summary.highestBlock.name}>
              {summary.highestBlock.name}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
            <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded text-[11px]">
              {summary.highestBlock.count} Pending
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Critical focus</span>
          </div>
        </div>

        {/* Lowest Pending Block */}
        <div 
          id="stat-card-lowest-pending"
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs hover:border-slate-300 transition border-l-4 border-l-emerald-500"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase text-slate-500 font-bold tracking-wider">
              Lowest Pending
            </span>
            <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 truncate uppercase" title={summary.lowestBlock.name}>
              {summary.lowestBlock.name}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
              {summary.lowestBlock.count} Pending
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Lowest backlog</span>
          </div>
        </div>

      </div>
    </section>
  );
};
