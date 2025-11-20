
import React from 'react';
import { Language } from '../types';
import { t } from '../utils/translations';
import { DownloadIcon, PosterIcon, RefreshIcon } from './Icons';
import { downloadBase64Image } from '../utils/videoUtils';

interface PosterGeneratorProps {
  posterUrl?: string[];
  isGenerating: boolean;
  language: Language;
  onGenerate: () => void;
}

const PosterGenerator: React.FC<PosterGeneratorProps> = ({ posterUrl, isGenerating, language, onGenerate }) => {
  
  const handleDownload = (base64: string, index: number) => {
      const fullDataUrl = `data:image/jpeg;base64,${base64}`;
      downloadBase64Image(fullDataUrl, `Movie_Poster_Var${index + 1}_${Date.now()}.jpg`);
  };

  const hasPosters = posterUrl && posterUrl.length > 0;

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-10 animate-fade-in-up pb-20">
        
        {/* Header / Call to Action */}
        <div className="text-center space-y-4 mt-4">
            {!hasPosters && !isGenerating && (
                <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto shadow-lg">
                    <PosterIcon />
                </div>
            )}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('tabPoster', language)}</h2>
            
            {/* Show button if not generating */}
            {!isGenerating && (
                <div className="flex flex-col items-center gap-4">
                    <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                        {hasPosters ? t('selectPoster', language) : t('posterPrompt', language)}
                    </p>
                    <button 
                        onClick={onGenerate}
                        className="px-8 py-3 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-gray-900 text-base font-bold rounded-full shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                    >
                        {hasPosters ? <RefreshIcon /> : <PosterIcon />}
                        {hasPosters ? t('tryAgain', language) : t('generatePosterBtn', language)}
                    </button>
                </div>
            )}
        </div>

        {/* Loading State - Vertical Skeleton Grid */}
        {isGenerating && (
            <div className="w-full max-w-7xl px-4">
                 <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 font-medium animate-pulse">
                        <div className="w-4 h-4 border-2 border-gray-400 dark:border-gray-500 border-t-gray-900 dark:border-t-white rounded-full animate-spin"></div>
                        {t('generatingPoster', language)}
                    </div>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="relative aspect-[9/16] bg-gray-100 dark:bg-[#1e1f20] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 animate-pulse">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 dark:to-white/5"></div>
                            <div className="absolute bottom-4 left-4 w-2/3 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="absolute bottom-10 left-4 w-1/2 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                    ))}
                 </div>
            </div>
        )}

        {/* Result Grid - 4 Equal Columns */}
        {hasPosters && !isGenerating && (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                {posterUrl.map((poster, idx) => (
                    <div key={idx} className="group relative flex flex-col gap-3">
                        {/* Poster Card - Force 9:16 Aspect Ratio */}
                        <div className="relative aspect-[9/16] bg-gray-100 dark:bg-[#1e1f20] rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 group-hover:shadow-xl group-hover:scale-[1.02] transition-all duration-300">
                            <img 
                                src={`data:image/jpeg;base64,${poster}`} 
                                alt={`Poster Variation ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />
                            
                            {/* Overlay Download Button */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <button 
                                    onClick={() => handleDownload(poster, idx)}
                                    className="px-6 py-3 bg-white text-gray-900 rounded-full font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 hover:bg-gray-50"
                                >
                                    <DownloadIcon />
                                    <span>Download</span>
                                </button>
                            </div>
                        </div>
                        <p className="text-center text-xs text-gray-400 dark:text-gray-500 font-mono uppercase tracking-widest">Variation {idx + 1}</p>
                    </div>
                ))}
            </div>
        )}

        {hasPosters && !isGenerating && (
             <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 opacity-60">{t('posterDisclaimer', language)}</p>
        )}

    </div>
  );
};

export default PosterGenerator;