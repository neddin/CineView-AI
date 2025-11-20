import React from 'react';
import { ShotData, Language } from '../types';
import { t } from '../utils/translations';
import AnalysisCharts from './AnalysisCharts';

interface ShotTableStatsProps {
  shots: ShotData[];
  language: Language;
  theme: 'light' | 'dark';
}

const ShotTableStats: React.FC<ShotTableStatsProps> = ({ shots, language, theme }) => {
  const totalDurationSeconds = shots.reduce((acc, s) => acc + parseFloat(String(s.duration)), 0);
  const avgShotLength = shots.length > 0 ? (totalDurationSeconds / shots.length).toFixed(1) : '0';
  const totalShots = shots.length;
  const durationStr = shots.length > 0 ? shots[shots.length-1].endTime : "00:00";

  return (
    <div className="w-full bg-white dark:bg-[#1e1f20] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none overflow-hidden transition-colors duration-300">
        <div className="flex flex-col lg:flex-row h-full items-stretch">
            
            {/* Left: Shot Size Distribution Chart */}
            <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-700 flex flex-col">
                <AnalysisCharts shots={shots} theme={theme} />
            </div>

            {/* Right: Detailed Metadata Stats */}
            <div className="w-full lg:w-[320px] shrink-0 bg-gray-50/50 dark:bg-[#1b1d1f] p-6 flex flex-col">
                <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 mb-5 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 pb-3">
                    {t('metadata', language)}
                </h3>
                
                <div className="space-y-1 flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-center p-2.5 rounded hover:bg-white dark:hover:bg-[#2c2d2e] transition-colors">
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('duration', language)}</span>
                        <span className="text-gray-900 dark:text-gray-100 font-mono font-semibold">{durationStr}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 rounded hover:bg-white dark:hover:bg-[#2c2d2e] transition-colors">
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('totalShots', language)}</span>
                        <span className="text-gray-900 dark:text-gray-100 font-mono font-semibold">{totalShots}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 rounded hover:bg-white dark:hover:bg-[#2c2d2e] transition-colors">
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('avgShotLength', language)}</span>
                        <span className="text-gray-900 dark:text-gray-100 font-mono font-bold">{avgShotLength}s</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 rounded hover:bg-white dark:hover:bg-[#2c2d2e] transition-colors">
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Resolution</span>
                        <span className="text-gray-400 dark:text-gray-500 font-mono text-xs bg-white dark:bg-[#2c2d2e] border border-gray-200 dark:border-gray-600 px-2 py-0.5 rounded">Source Quality</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 rounded hover:bg-white dark:hover:bg-[#2c2d2e] transition-colors">
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Format</span>
                        <span className="text-gray-400 dark:text-gray-500 font-mono text-xs bg-white dark:bg-[#2c2d2e] border border-gray-200 dark:border-gray-600 px-2 py-0.5 rounded">Auto-Detected</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ShotTableStats;