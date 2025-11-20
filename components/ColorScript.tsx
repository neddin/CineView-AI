
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ShotData, ProcessedFrame, Language, VideoMetadata } from '../types';
import { t } from '../utils/translations';
import { PaletteIcon, MaximizeIcon, XIcon, DownloadIcon, ZoomOutIcon, ZoomInIcon } from './Icons';
import { extractDominantColors } from '../utils/colorUtils';
import { generateTiledImage, downloadBase64Image } from '../utils/videoUtils';

interface ColorScriptProps {
  shots: ShotData[];
  frames: ProcessedFrame[];
  videoMeta: VideoMetadata | null;
  language: Language;
}

const ColorScript: React.FC<ColorScriptProps> = ({ shots, frames, videoMeta, language }) => {
  // Zoom Level: 1 to 8, default 4 per request
  const [gridCols, setGridCols] = useState(4); 
  const [palette, setPalette] = useState<string[]>([]);
  const [loadingPalette, setLoadingPalette] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const loadColors = async () => {
      if (frames.length === 0) return;
      setLoadingPalette(true);
      try {
        const colors = await extractDominantColors(frames, 7);
        setPalette(colors);
      } catch (e) {
        console.error("Failed to extract colors", e);
      } finally {
        setLoadingPalette(false);
      }
    };
    loadColors();
  }, [frames]);

  const aspectRatio = videoMeta ? `${videoMeta.width} / ${videoMeta.height}` : '16 / 9';

  const handleExport = async () => {
      setIsExporting(true);
      try {
          // Generate tiled image without labels (clean image)
          const base64 = await generateTiledImage(shots, frames, videoMeta, gridCols, false);
          downloadBase64Image(base64, `ColorScript_Export_${Date.now()}.jpg`);
      } catch (e) {
          console.error("Export failed", e);
          alert("Export failed");
      } finally {
          setIsExporting(false);
      }
  };

  // Common Grid Content
  const GridContent = () => (
      <div 
        className="grid gap-1 transition-all duration-300 ease-in-out w-full"
        style={{ 
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` 
        }}
      >
        {shots.map((shot) => {
          // Resolve thumbnail
          let frameSrc = "";
          if (frames[shot.thumbnailIndex]) {
            frameSrc = `data:image/jpeg;base64,${frames[shot.thumbnailIndex].data}`;
          } else if (frames.length > 0) {
            frameSrc = `data:image/jpeg;base64,${frames[0].data}`;
          }

          return (
            <div 
                key={shot.shotNumber} 
                className={`relative group overflow-hidden cursor-pointer transition-all duration-200 ${isFullscreen ? 'bg-gray-900' : 'bg-gray-100 dark:bg-gray-800 hover:z-10 hover:scale-105 hover:shadow-xl hover:rounded-lg'}`}
                style={{ aspectRatio: aspectRatio }}
            >
              <img 
                src={frameSrc} 
                alt={`Shot ${shot.shotNumber}`} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Show labels only in Normal View, hide in Fullscreen for cleaner look if desired, 
                  or keep small. Let's keep small label but clean image on export. */}
              <div className="absolute top-1 left-1 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white font-mono opacity-50 group-hover:opacity-100 transition-opacity">
                #{shot.shotNumber}
              </div>
              
              {/* Hover Tooltip Overlay */}
              <div className="absolute inset-0 bg-gray-900/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-center p-3 text-xs pointer-events-none">
                 <div className="space-y-1">
                    <div className="flex justify-between text-white font-bold border-b border-gray-600 pb-1 mb-1">
                        <span>#{shot.shotNumber}</span>
                        <span>{shot.duration}s</span>
                    </div>
                    {/* Show more info if zoomed in (fewer columns) */}
                    {gridCols <= 6 && (
                        <>
                            <div className="grid grid-cols-3 gap-1 text-[10px] text-gray-400">
                            <span>{t('time', language)}:</span>
                            <span className="col-span-2 text-gray-200">{shot.startTime}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1 text-[10px] text-gray-400">
                            <span>{t('size', language)}:</span>
                            <span className="col-span-2 text-gray-200">{shot.size}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1 text-[10px] text-gray-400">
                            <span>{t('movement', language)}:</span>
                            <span className="col-span-2 text-gray-200 truncate">{shot.movement}</span>
                            </div>
                        </>
                    )}
                 </div>
              </div>
            </div>
          );
        })}
      </div>
  );

  // Modal Content to be rendered via Portal
  const ModalContent = () => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center font-sans">
       <style>{`
          .custom-scrollbar-dark::-webkit-scrollbar {
            width: 10px;
          }
          .custom-scrollbar-dark::-webkit-scrollbar-track {
            background: #1b1d1f;
          }
          .custom-scrollbar-dark::-webkit-scrollbar-thumb {
            background: #444746;
            border-radius: 5px;
            border: 2px solid #1b1d1f;
          }
          .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
            background: #5e5e5e;
          }
        `}</style>
        
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsFullscreen(false)}
        ></div>

        {/* Modal Container - AI Studio Style (Dark, Rounded, Inset) */}
        <div className="relative w-[95vw] h-[90vh] bg-[#1b1d1f] rounded-3xl border border-gray-800 shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
            
            {/* Header - Sticky within Modal */}
            <div className="shrink-0 w-full bg-[#1b1d1f]/95 border-b border-gray-800 px-6 py-4 flex items-center justify-between z-20">
                <div className="flex items-center gap-3 text-gray-200">
                    <div className="p-2 bg-gray-800 rounded-full text-gray-400">
                       <PaletteIcon />
                    </div>
                    <h3 className="font-bold text-lg tracking-tight">{t('tabColorScript', language)}</h3>
                </div>
                
                <div className="flex items-center gap-6">
                    {/* Slider in Modal */}
                    <div className="hidden md:flex items-center gap-3 bg-black/30 rounded-full px-4 py-2 border border-gray-700">
                      <div className="text-gray-500"><ZoomOutIcon /></div>
                      <input 
                          type="range" 
                          min="1" 
                          max="8" 
                          step="1"
                          value={9 - gridCols}
                          onChange={(e) => setGridCols(9 - parseInt(e.target.value))}
                          className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                      <div className="text-gray-500"><ZoomInIcon /></div>
                    </div>

                    <div className="h-6 w-px bg-gray-800"></div>

                    <button 
                      onClick={handleExport}
                      disabled={isExporting}
                      className="flex items-center gap-2 px-5 py-2 bg-white text-gray-900 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 shadow-lg"
                    >
                        {isExporting ? (
                            <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <DownloadIcon />
                        )}
                        {t('exportImage', language)}
                    </button>

                    <button 
                      onClick={() => setIsFullscreen(false)}
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors border border-gray-700"
                      title={t('exitFullscreen', language)}
                    >
                        <XIcon />
                    </button>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar-dark">
                <div className="max-w-[2400px] mx-auto">
                   <GridContent />
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="w-full space-y-6 animate-fade-in-up pb-16">
      
      {/* Controls Header (Normal View) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-[#1e1f20] p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-soft dark:shadow-none transition-colors duration-300">
        
        {/* Color Palette Section */}
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
             <PaletteIcon />
             <span>{t('colorPalette', language)}</span>
           </div>
           
           {loadingPalette ? (
             <span className="text-xs text-gray-400 animate-pulse">{t('extractingColors', language)}</span>
           ) : (
             <div className="flex items-center gap-2">
               {palette.map((color, index) => (
                 <div 
                   key={index} 
                   className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm hover:scale-110 transition-transform cursor-help relative group"
                   style={{ backgroundColor: color }}
                 >
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                        {color}
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* Right Controls: Slider & Fullscreen */}
        <div className="flex items-center gap-6">
            
            {/* Zoom Slider (Inline) */}
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#2c2d2e] rounded-full px-4 py-1.5 border border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400"><ZoomOutIcon /></span>
                <input 
                    type="range" 
                    min="1" 
                    max="8" 
                    step="1"
                    value={9 - gridCols}
                    onChange={(e) => setGridCols(9 - parseInt(e.target.value))}
                    className="w-24 h-1 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-gray-900 dark:accent-white hover:accent-black"
                />
                <span className="text-gray-500 dark:text-gray-400"><ZoomInIcon /></span>
            </div>

            {/* Fullscreen Button */}
            <button 
                onClick={() => setIsFullscreen(true)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
                <MaximizeIcon />
                <span className="hidden sm:inline">{t('fullscreen', language)}</span>
            </button>

        </div>
      </div>

      {/* Normal Grid */}
      <GridContent />

      {/* Render Modal via Portal to ensure it's above everything and covers screen */}
      {isFullscreen && ReactDOM.createPortal(<ModalContent />, document.body)}

    </div>
  );
};

export default ColorScript;