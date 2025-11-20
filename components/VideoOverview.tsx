import React from 'react';
import { ProcessedFrame, AnalysisResult, Language } from '../types';
import { t } from '../utils/translations';

interface VideoOverviewProps {
  analysis: AnalysisResult;
  frames: ProcessedFrame[];
  file: File | null;
  language: Language;
}

const VideoOverview: React.FC<VideoOverviewProps> = ({ analysis, frames, file, language }) => {
  const totalDuration = analysis.shots.length > 0 ? analysis.shots[analysis.shots.length-1].endTime : "00:00";

  return (
    <div className="w-full bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none animate-fade-in-up mb-8 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between gap-6 items-start">
        
        {/* Main Info: Title & Summary */}
        <div className="flex-1">
             <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight mb-2">
                {analysis.title || "Untitled Sequence"}
             </h2>
             <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm max-w-3xl font-normal antialiased">
                {analysis.summary}
             </p>
        </div>

        {/* Key Metrics Pills - More subtle */}
        <div className="flex flex-wrap gap-2 shrink-0">
             <div className="px-4 py-2 bg-gray-50 dark:bg-[#2c2d2e] rounded-lg border border-gray-100 dark:border-gray-600 flex flex-col items-center min-w-[80px]">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mb-0.5">{t('duration', language)}</span>
                <span className="text-sm font-mono font-semibold text-gray-700 dark:text-gray-200">{totalDuration}</span>
             </div>
             <div className="px-4 py-2 bg-gray-50 dark:bg-[#2c2d2e] rounded-lg border border-gray-100 dark:border-gray-600 flex flex-col items-center min-w-[80px]">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mb-0.5">{t('totalShots', language)}</span>
                <span className="text-sm font-mono font-semibold text-gray-700 dark:text-gray-200">{analysis.shots.length}</span>
             </div>
             <div className="px-4 py-2 bg-gray-50 dark:bg-[#2c2d2e] rounded-lg border border-gray-100 dark:border-gray-600 flex flex-col items-center min-w-[80px]">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mb-0.5">{t('fileName', language)}</span>
                <span className="text-xs font-mono text-gray-500 dark:text-gray-300 truncate max-w-[100px]" title={file?.name}>{file?.name}</span>
             </div>
        </div>

      </div>
    </div>
  );
};

export default VideoOverview;