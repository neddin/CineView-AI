
import React, { useState, useEffect, useMemo } from 'react';
import { Language } from '../types';
import { t } from '../utils/translations';
import { RefreshIcon } from './Icons';

interface ScriptViewProps {
  scriptContent: string;
  language: Language;
  onRetry?: () => void;
  onUpdate?: (newScript: string) => void;
}

// Increased from 1800 to 3000 to ensure the first page is fully filled before creating a second page
const CHARS_PER_PAGE = 3000;

const ScriptView: React.FC<ScriptViewProps> = ({ scriptContent, language, onRetry, onUpdate }) => {
  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(scriptContent);

  // Sync local edit state with prop
  useEffect(() => {
    setEditValue(scriptContent);
  }, [scriptContent]);

  // Simple pagination logic based on character count
  const pages = useMemo(() => {
    const result = [];
    let text = isEditing ? editValue : scriptContent;
    if (!text) return [];
    
    // If error message, show as one page
    if (text === "Error generating screenplay.") return [text];

    // Split by paragraphs to avoid breaking sentences
    const paragraphs = text.split('\n\n');
    let currentPageText = "";
    
    paragraphs.forEach((para) => {
        if ((currentPageText.length + para.length) > CHARS_PER_PAGE) {
            result.push(currentPageText);
            currentPageText = para + '\n\n';
        } else {
            currentPageText += para + '\n\n';
        }
    });
    if (currentPageText.trim()) {
        result.push(currentPageText);
    }
    return result.length > 0 ? result : [text];
  }, [scriptContent, editValue, isEditing]);

  const totalPages = pages.length;

  const handleCopy = (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(isEditing ? editValue : scriptContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handlePrevPage = () => {
      setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
      setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  const handleSave = () => {
      if (onUpdate) {
          onUpdate(editValue);
      }
      setIsEditing(false);
      setCurrentPage(0); // Reset to page 1 to see changes
  };

  // If script is empty or error
  if (!scriptContent || scriptContent === "Error generating screenplay.") {
       return (
           <div className="flex flex-col items-center justify-center h-64 text-center">
               <p className="text-red-500 font-medium mb-4">Error generating screenplay.</p>
               {onRetry && (
                   <button 
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full shadow-md hover:bg-black dark:hover:bg-gray-200 transition-colors"
                   >
                       <RefreshIcon /> {t('retry', language)}
                   </button>
               )}
           </div>
       )
  }

  const PaginationControls = () => (
    <div className="flex justify-center items-center gap-4 select-none">
        <button 
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className={`px-4 py-2 rounded-full text-xs font-bold border border-gray-200 dark:border-gray-700 transition-all ${currentPage === 0 ? 'opacity-30 cursor-not-allowed bg-gray-50 dark:bg-[#1e1f20]' : 'bg-white dark:bg-[#2c2d2e] hover:shadow-md cursor-pointer text-gray-900 dark:text-gray-200'}`}
        >
            {t('previousPage', language)}
        </button>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {currentPage + 1} / {totalPages}
        </span>
        <button 
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className={`px-4 py-2 rounded-full text-xs font-bold border border-gray-200 dark:border-gray-700 transition-all ${currentPage === totalPages - 1 ? 'opacity-30 cursor-not-allowed bg-gray-50 dark:bg-[#1e1f20]' : 'bg-white dark:bg-[#2c2d2e] hover:shadow-md cursor-pointer text-gray-900 dark:text-gray-200'}`}
        >
            {t('nextPage', language)}
        </button>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in-up flex flex-col gap-6 pb-20">
        
        {/* Top Pagination - Visible even for single page */}
        {!isEditing && totalPages > 0 && <PaginationControls />}

        {/* A4 Container / Editor */}
        <div 
            className="w-full bg-[#fdfbf7] dark:bg-[#1e1f20] text-black dark:text-gray-200 shadow-xl relative paper-texture dark:paper-texture-dark mx-auto transition-all group" 
            style={{ aspectRatio: '1 / 1.414' }}
            onDoubleClick={() => !isEditing && setIsEditing(true)}
        >
            {/* Copy Button (Absolute Top Right) */}
            <button 
                onClick={handleCopy}
                className="absolute top-6 right-6 z-10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded hover:bg-white dark:hover:bg-black/50 hover:text-gray-900 dark:hover:text-white transition-colors backdrop-blur-sm"
            >
               {copied ? t('copied', language) : t('copyScript', language)}
            </button>

            {isEditing ? (
                <>
                    <textarea 
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full h-full p-12 md:p-16 bg-transparent font-mono text-sm md:text-base leading-relaxed outline-none resize-none border-none focus:bg-white/50 dark:focus:bg-black/20"
                        autoFocus
                    />
                    {/* Floating Action Bar for Save/Cancel */}
                    <div className="absolute bottom-6 right-6 flex gap-2 z-20">
                        <button 
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-xs font-bold bg-white dark:bg-[#2c2d2e] text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-[#3c3d3e] transition-colors"
                        >
                            {t('cancelEdit', language)}
                        </button>
                        <button 
                            onClick={handleSave}
                            className="px-4 py-2 text-xs font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full shadow-sm hover:bg-black dark:hover:bg-gray-200 transition-colors"
                        >
                            {t('saveScript', language)}
                        </button>
                    </div>
                </>
            ) : (
                <div className="w-full h-full p-12 md:p-16 font-mono whitespace-pre-wrap leading-relaxed text-sm md:text-base overflow-hidden relative cursor-text">
                    {pages[currentPage]}
                    
                    {/* Page Footer (Always Visible) */}
                    <div className="absolute bottom-6 right-8 text-xs text-gray-400 dark:text-gray-500 font-sans select-none">
                        {t('page', language)} {currentPage + 1} {t('of', language)} {totalPages}
                    </div>
                </div>
            )}

        </div>

        {/* Bottom Pagination - Visible even for single page */}
        {!isEditing && totalPages > 0 && <PaginationControls />}
    </div>
  );
};

export default ScriptView;
