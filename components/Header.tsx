import React from 'react';
import { FilmIcon, SunIcon, MoonIcon, KeyIcon } from './Icons';
import { Language } from '../types';
import { t } from '../utils/translations';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onHomeClick: () => void;
  onKeyClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ language, onLanguageChange, theme, onToggleTheme, onHomeClick, onKeyClick }) => {
  return (
    <header className="w-full py-4 px-6 md:px-12 bg-transparent transition-colors duration-300 select-none">
      <div className="w-full flex items-center justify-between">
        {/* Left: Branding - Clickable to Reset */}
        <button 
          onClick={onHomeClick}
          className="flex items-center gap-3 hover:opacity-70 transition-opacity cursor-pointer focus:outline-none group"
          title={t('appTitle', language)}
        >
          <div className="w-8 h-8 text-gray-900 dark:text-white transition-transform duration-500 group-hover:rotate-90">
             <FilmIcon />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter text-gray-900 dark:text-white transition-colors">
            {t('appTitle', language)}
          </h1>
        </button>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 md:gap-4">
            
            {/* Key Toggle */}
            <button
              onClick={onKeyClick}
              className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95"
              title={t('changeKey', language)}
            >
              <KeyIcon />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95"
              title="Toggle Theme"
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>

            {/* Language Toggle - Pill Style */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-full p-1 transition-colors">
              <button 
                onClick={() => onLanguageChange('en')}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${language === 'en' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
              >
                EN
              </button>
              <button 
                onClick={() => onLanguageChange('zh')}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${language === 'zh' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
              >
                中
              </button>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;