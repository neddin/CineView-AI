
import React, { useState, useCallback, useEffect } from 'react';
import { AppState, ProcessedFrame, AnalysisResult, ProcessingProgress, ShotData, Language, VideoMetadata } from './types';
import { extractFramesFromVideo } from './utils/frameExtractor';
import { analyzeVideoFrames, translateAnalysisResult, generateScreenplay, generateMoviePoster } from './services/geminiService';
import { t } from './utils/translations';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import ShotTable from './components/ShotTable';
import ColorScript from './components/ColorScript';
import VideoPlayer from './components/VideoPlayer';
import ScriptView from './components/ScriptView';
import PosterGenerator from './components/PosterGenerator';
import VideoOverview from './components/VideoOverview';
import ApiKeyModal from './components/ApiKeyModal';
import Footer from './components/Footer';
import { VideoIcon, RefreshIcon, PosterIcon, FileTextIcon, PaletteIcon, XIcon } from './components/Icons';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [frames, setFrames] = useState<ProcessedFrame[]>([]);
  const [videoMeta, setVideoMeta] = useState<VideoMetadata | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [progress, setProgress] = useState<ProcessingProgress>({ current: 0, total: 0, stage: '' });
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'colorscript' | 'script' | 'poster'>('list');
  const [initialTab, setInitialTab] = useState<'list' | 'colorscript' | 'script' | 'poster'>('list');
  const [generatingScript, setGeneratingScript] = useState(false);
  const [generatingPoster, setGeneratingPoster] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // API Key State
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Initialize
  useEffect(() => {
    // Theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Check LocalStorage for Key
    const storedKey = localStorage.getItem("gemini_api_key");
    if (storedKey) {
        setApiKey(storedKey);
    } else if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        // Fallback to env if available
        setApiKey(process.env.API_KEY);
    }
  }, [theme]);

  // Automatic Script Generation Effect
  useEffect(() => {
    const generateIfNeeded = async () => {
        if (activeTab === 'script' && analysis && !analysis.script && !generatingScript && state === AppState.COMPLETE) {
            setGeneratingScript(true);
            try {
                // Pass apiKey if available
                const scriptText = await generateScreenplay(analysis, language, apiKey || undefined);
                setAnalysis(prev => prev ? { ...prev, script: scriptText } : null);
            } catch (e) {
                console.error("Script generation failed", e);
            } finally {
                setGeneratingScript(false);
            }
        }
    };
    generateIfNeeded();
  }, [activeTab, analysis, generatingScript, language, state, apiKey]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLanguageChange = async (newLang: Language) => {
    if (newLang === language) return;
    setLanguage(newLang);

    if (analysis && state === AppState.COMPLETE) {
        const previousState = state;
        setState(AppState.ANALYZING);
        setProgress({ current: 0, total: 0, stage: t('translating', newLang) });
        
        try {
            // Pass apiKey
            const translatedAnalysis = await translateAnalysisResult(analysis, newLang, apiKey || undefined);
            if (translatedAnalysis.script) delete translatedAnalysis.script;
            setAnalysis(translatedAnalysis);
            setState(AppState.COMPLETE);
        } catch (err) {
            console.error("Translation error", err);
            setState(previousState);
        }
    }
  };

  // API Key Logic
  const checkApiKey = (): boolean => {
    // Strict validation: Must exist AND start with AIza
    if (!apiKey || !apiKey.startsWith('AIza')) {
        setShowKeyModal(true);
        return false;
    }
    return true;
  };

  const handleSaveKey = (key: string) => {
    localStorage.setItem("gemini_api_key", key);
    setApiKey(key);
    setShowKeyModal(false);
  };

  const handleFeatureClick = (tab: 'list' | 'colorscript' | 'script' | 'poster') => {
      setInitialTab(tab);
      // Check Key before opening upload modal
      if (!checkApiKey()) return;
      setShowUploadModal(true);
  };

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    // Double check key exists (Drag and drop might bypass click check if not careful, though UploadZone handles it)
    if (!checkApiKey()) return;

    try {
      setShowUploadModal(false); 
      setState(AppState.EXTRACTING_FRAMES);
      setFile(selectedFile);
      setError(null);
      setVideoMeta(null); 
      
      setProgress({ current: 0, total: 100, stage: t('processingVideo', language) });

      const { frames: extractedFrames, metadata } = await extractFramesFromVideo(
        selectedFile, 
        (current, total) => {
          setProgress({ 
            current, 
            total, 
            stage: `${t('processingVideo', language)} (${current}/${total})` 
          });
        }
      );

      setFrames(extractedFrames);
      setVideoMeta(metadata);
      
      setState(AppState.ANALYZING);
      setProgress({ current: 0, total: 100, stage: t('aiAnalysis', language) });
      
      // Pass apiKey explicitly
      const result = await analyzeVideoFrames(extractedFrames, selectedFile.name, language, apiKey || undefined);
      
      setAnalysis(result);
      setState(AppState.COMPLETE);
      setActiveTab(initialTab);

    } catch (err: any) {
      console.error(err);
      
      if (err.message === "VIDEO_TOO_LONG") {
          setError(`${t('errorVideoTooLong', language)} ${t('limitSuggestion', language)}`);
      } else if (err.message.includes("API Key")) {
          setError("Invalid API Key. Please check your key.");
          setShowKeyModal(true);
      } else {
          setError(err.message || "An unexpected error occurred");
      }
      setState(AppState.ERROR);
    }
  }, [language, initialTab, apiKey]); // Depends on apiKey to ensure closure has latest value

  const handleShotUpdate = (id: number, field: keyof ShotData, value: string) => {
    if (!analysis) return;
    const updatedShots = analysis.shots.map(shot => {
        if (shot.shotNumber === id) {
            return { ...shot, [field]: value };
        }
        return shot;
    });
    setAnalysis({ ...analysis, shots: updatedShots });
  };

  const handleScriptUpdate = (newScript: string) => {
      if (!analysis) return;
      setAnalysis({ ...analysis, script: newScript });
  };

  const handleTabChange = (tab: 'list' | 'colorscript' | 'script' | 'poster') => {
      setActiveTab(tab);
  };

  const handlePosterGenerate = async () => {
      if (!analysis || generatingPoster) return;
      setGeneratingPoster(true);
      try {
          const posters = await generateMoviePoster(
              analysis.title, 
              analysis.summary, 
              analysis.shots,
              frames,
              apiKey || undefined
          );
          setAnalysis(prev => prev ? { ...prev, poster: posters } : null);
      } catch (e) {
          console.error("Poster generation failed", e);
          alert("Failed to generate poster. Please try again.");
      } finally {
          setGeneratingPoster(false);
      }
  }

  const handleRetryScript = async () => {
      if (!analysis) return;
      setGeneratingScript(true);
      try {
         const scriptText = await generateScreenplay(analysis, language, apiKey || undefined);
         setAnalysis(prev => prev ? { ...prev, script: scriptText } : null);
      } catch (e) {
          console.error("Retry script failed", e);
      } finally {
          setGeneratingScript(false);
      }
  };

  const handleReset = () => {
    setState(AppState.IDLE);
    setFrames([]);
    setVideoMeta(null);
    setAnalysis(null);
    setError(null);
    setFile(null);
    setActiveTab('list');
    setInitialTab('list');
    setGeneratingPoster(false);
    setGeneratingScript(false);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-[#1e1f20] text-gray-900 dark:text-gray-100 font-sans selection:bg-gray-200 dark:selection:bg-gray-700 antialiased transition-colors duration-300 flex flex-col">
      
      <ApiKeyModal 
        isOpen={showKeyModal} 
        onSave={handleSaveKey} 
        language={language} 
        currentKey={apiKey || ''}
        onCancel={() => setShowKeyModal(false)} 
      />

      <Header 
        language={language} 
        onLanguageChange={handleLanguageChange} 
        theme={theme} 
        onToggleTheme={toggleTheme} 
        onHomeClick={handleReset}
        onKeyClick={() => setShowKeyModal(true)}
      />

      <main className="flex-1 w-full px-6 md:px-12 pb-0 mx-auto">
        
        {/* IDLE STATE (HOMEPAGE) */}
        {state === AppState.IDLE && (
          <div className="mt-8 md:mt-16 flex flex-col h-full">
            
            {/* Top Section: Hero & Upload */}
            <div className="space-y-8 text-center animate-fade-in mb-16">
              <div className="space-y-5">
                <h2 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tighter leading-none">
                  {t('uploadTitle', language)}
                </h2>
                <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-normal max-w-3xl mx-auto leading-relaxed">
                  {t('uploadDesc', language)}
                </p>
              </div>
              
              {/* Upload Zone - More Spacer */}
              <div className="max-w-3xl mx-auto relative z-10 w-full mt-8">
                 <UploadZone 
                    onFileSelect={handleFileSelect} 
                    language={language} 
                    onUploadClick={checkApiKey}
                 />
              </div>
            </div>

            {/* Feature Grid - Matching Reference Image Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full animate-fade-in-up mb-12">
                
                {/* Card 1: Shot List (Blue) */}
                <div 
                    onClick={() => handleFeatureClick('list')}
                    className="relative group h-[280px] rounded-[24px] p-7 flex flex-col justify-between overflow-hidden bg-[#bfdbfe] dark:bg-[#3b82f6] text-gray-900 dark:text-white transition-all hover:scale-[1.01] cursor-pointer shadow-sm hover:shadow-xl"
                >
                    <div className="relative z-10 text-left space-y-3">
                         <h3 className="text-3xl font-bold tracking-tight leading-none">{t('landingShotList', language)}</h3>
                         <p className="text-sm font-medium opacity-70 leading-relaxed max-w-[90%]">{t('landingShotListDesc', language)}</p>
                    </div>
                    
                    <div className="relative z-10 mt-auto">
                        <div className="w-12 h-12 rounded-full bg-black/10 dark:bg-white/20 flex items-center justify-center text-gray-900 dark:text-white backdrop-blur-sm">
                             <VideoIcon className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Card 2: Color Script (Yellow) */}
                <div 
                    onClick={() => handleFeatureClick('colorscript')}
                    className="relative group h-[280px] rounded-[24px] p-7 flex flex-col justify-between overflow-hidden bg-[#fde047] dark:bg-[#eab308] text-gray-900 dark:text-white transition-all hover:scale-[1.01] cursor-pointer shadow-sm hover:shadow-xl"
                >
                    <div className="relative z-10 text-left space-y-3">
                         <h3 className="text-3xl font-bold tracking-tight leading-none">{t('landingColorScript', language)}</h3>
                         <p className="text-sm font-medium opacity-70 leading-relaxed max-w-[90%]">{t('landingColorScriptDesc', language)}</p>
                    </div>
                    
                    <div className="relative z-10 mt-auto">
                        <div className="w-12 h-12 rounded-full bg-black/10 dark:bg-white/20 flex items-center justify-center text-gray-900 dark:text-white backdrop-blur-sm">
                             <PaletteIcon className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Card 3: Screenplay (Purple) */}
                <div 
                    onClick={() => handleFeatureClick('script')}
                    className="relative group h-[280px] rounded-[24px] p-7 flex flex-col justify-between overflow-hidden bg-[#e9d5ff] dark:bg-[#a855f7] text-gray-900 dark:text-white transition-all hover:scale-[1.01] cursor-pointer shadow-sm hover:shadow-xl"
                >
                    <div className="relative z-10 text-left space-y-3">
                         <h3 className="text-3xl font-bold tracking-tight leading-none">{t('landingScreenplay', language)}</h3>
                         <p className="text-sm font-medium opacity-70 leading-relaxed max-w-[90%]">{t('landingScreenplayDesc', language)}</p>
                    </div>
                    
                    <div className="relative z-10 mt-auto">
                        <div className="w-12 h-12 rounded-full bg-black/10 dark:bg-white/20 flex items-center justify-center text-gray-900 dark:text-white backdrop-blur-sm">
                             <FileTextIcon className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Card 4: Poster (Indigo/Blue-Gray) */}
                <div 
                    onClick={() => handleFeatureClick('poster')}
                    className="relative group h-[280px] rounded-[24px] p-7 flex flex-col justify-between overflow-hidden bg-[#c7d2fe] dark:bg-[#6366f1] text-gray-900 dark:text-white transition-all hover:scale-[1.01] cursor-pointer shadow-sm hover:shadow-xl"
                >
                    <div className="relative z-10 text-left space-y-3">
                         <h3 className="text-3xl font-bold tracking-tight leading-none">{t('landingPoster', language)}</h3>
                         <p className="text-sm font-medium opacity-70 leading-relaxed max-w-[90%]">{t('landingPosterDesc', language)}</p>
                    </div>
                    
                    <div className="relative z-10 mt-auto">
                        <div className="w-12 h-12 rounded-full bg-black/10 dark:bg-white/20 flex items-center justify-center text-gray-900 dark:text-white backdrop-blur-sm">
                             <PosterIcon className="w-5 h-5" />
                        </div>
                    </div>
                </div>

            </div>
          </div>
        )}

        {/* UPLOAD MODAL (Triggered by Cards) */}
        {showUploadModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in px-4">
                <div className="relative w-full max-w-2xl bg-white dark:bg-[#1b1d1f] rounded-[32px] shadow-2xl transform transition-all scale-100 border border-gray-200 dark:border-gray-700 p-1">
                     {/* Close Button */}
                     <button 
                        onClick={() => setShowUploadModal(false)} 
                        className="absolute top-5 right-5 z-10 p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                     >
                        <XIcon />
                     </button>
                     
                     <div className="p-8 pt-20">
                        <UploadZone 
                            onFileSelect={handleFileSelect} 
                            language={language} 
                            onUploadClick={checkApiKey}
                        />
                     </div>
                </div>
            </div>
        )}

        {/* PROCESSING STATES */}
        {(state === AppState.EXTRACTING_FRAMES || state === AppState.ANALYZING) && (
          <div className="flex flex-col items-center justify-center py-32 space-y-8 animate-pulse">
            {/* Large Loading Icon */}
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full border-4 border-gray-100 dark:border-gray-700"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-gray-900 dark:border-t-white animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-gray-900 dark:text-white">
                <div className="w-12 h-12">
                    <VideoIcon className="w-full h-full" />
                </div>
              </div>
            </div>
            <div className="text-center space-y-2">
              {(() => {
                  const loadingTitle = state === AppState.EXTRACTING_FRAMES 
                    ? t('processingVideo', language) 
                    : (progress.stage === t('translating', language) ? t('translating', language) : t('aiAnalysis', language));
                  
                  return (
                    <>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{loadingTitle}</h3>
                        {progress.stage && progress.stage !== loadingTitle && (
                            <p className="text-gray-900 dark:text-gray-100 font-medium text-sm bg-gray-100 dark:bg-gray-800 px-4 py-1.5 rounded-full inline-block">{progress.stage}</p>
                        )}
                    </>
                  );
              })()}
              
              {state === AppState.EXTRACTING_FRAMES && progress.total > 0 && (
                 <div className="w-64 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-6 mx-auto">
                   <div 
                    className="h-full bg-gray-900 dark:bg-gray-400 transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                   />
                 </div>
              )}
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {state === AppState.ERROR && (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 border border-red-100 dark:border-red-900/50">
              !
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('analysisFailed', language)}</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">{error}</p>
            </div>
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors font-medium shadow-sm"
            >
              <RefreshIcon /> {t('tryAgain', language)}
            </button>
          </div>
        )}

        {/* COMPLETE STATE */}
        {state === AppState.COMPLETE && analysis && (
          <div className="space-y-8 pb-8">
            {/* Video Player Section */}
            {file && (
                <div className="w-full max-w-5xl mx-auto mb-10">
                    <VideoPlayer videoFile={file} language={language} />
                </div>
            )}

            {/* Overview */}
            <VideoOverview 
                analysis={analysis} 
                frames={frames} 
                file={file} 
                language={language} 
            />

            {/* Tab Navigation */}
            <div className="sticky top-0 z-40 pt-4 pb-2 bg-[#f9fafb]/95 dark:bg-[#1e1f20]/95 backdrop-blur-sm border-b border-transparent transition-all">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    
                    <div className="flex items-center gap-3 overflow-x-auto max-w-full no-scrollbar h-10">
                        <button
                            onClick={() => handleTabChange('list')}
                            className={`flex items-center gap-2 px-5 h-full rounded-full text-sm font-semibold transition-all whitespace-nowrap border ${
                            activeTab === 'list' 
                            ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-transparent shadow-md' 
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            <span className="hidden sm:inline"><VideoIcon /></span> 
                            {t('tabShotList', language)}
                        </button>
                        <button
                            onClick={() => handleTabChange('colorscript')}
                            className={`flex items-center gap-2 px-5 h-full rounded-full text-sm font-semibold transition-all whitespace-nowrap border ${
                            activeTab === 'colorscript' 
                            ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-transparent shadow-md' 
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                             <span className="hidden sm:inline"><PaletteIcon /></span>
                            {t('tabColorScript', language)}
                        </button>
                        <button
                            onClick={() => handleTabChange('script')}
                            className={`flex items-center gap-2 px-5 h-full rounded-full text-sm font-semibold transition-all whitespace-nowrap border ${
                            activeTab === 'script' 
                            ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-transparent shadow-md' 
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                             <span className="hidden sm:inline"><FileTextIcon /></span>
                            {t('tabScript', language)}
                        </button>
                        <button
                            onClick={() => handleTabChange('poster')}
                            className={`flex items-center gap-2 px-5 h-full rounded-full text-sm font-semibold transition-all whitespace-nowrap border ${
                            activeTab === 'poster' 
                            ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-transparent shadow-md' 
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                             <span className="hidden sm:inline"><PosterIcon /></span>
                            {t('tabPoster', language)}
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="mt-8">
                {activeTab === 'list' && (
                    <ShotTable 
                        shots={analysis.shots} 
                        frames={frames} 
                        videoFile={file} 
                        videoMeta={videoMeta}
                        language={language} 
                        theme={theme}
                        onUpdateShot={handleShotUpdate}
                    />
                )}

                {activeTab === 'colorscript' && (
                    <ColorScript 
                        shots={analysis.shots} 
                        frames={frames}
                        videoMeta={videoMeta}
                        language={language}
                    />
                )}

                {activeTab === 'script' && (
                    <div className="flex flex-col items-center">
                        {generatingScript ? (
                            <div className="text-center py-20 animate-pulse">
                                <FileTextIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500">{t('generatingScript', language)}</p>
                            </div>
                        ) : (
                            <ScriptView 
                                scriptContent={analysis.script || t('scriptPlaceholder', language)} 
                                language={language} 
                                onRetry={handleRetryScript}
                                onUpdate={handleScriptUpdate}
                            />
                        )}
                    </div>
                )}

                {activeTab === 'poster' && (
                     <PosterGenerator 
                        posterUrl={analysis.poster} 
                        isGenerating={generatingPoster} 
                        language={language}
                        onGenerate={handlePosterGenerate}
                     />
                )}
            </div>

          </div>
        )}
      </main>
      
      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default App;
