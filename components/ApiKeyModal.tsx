
import React, { useState } from 'react';
import { KeyIcon, XIcon } from './Icons';
import { Language } from '../types';
import { t } from '../utils/translations';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
  language: Language;
  currentKey?: string;
  onCancel?: () => void; 
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave, language, currentKey, onCancel }) => {
  const [inputValue, setInputValue] = useState(currentKey || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const key = inputValue.trim();
    if (!key.startsWith('AIza') || key.length < 30) {
        setError(t('invalidKey', language));
        return;
    }
    onSave(key);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 font-sans animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-[#1b1d1f] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 transform transition-all scale-100">
        
        {/* Close Button */}
        {onCancel && (
            <button 
                onClick={onCancel}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <XIcon />
            </button>
        )}
        
        <div className="flex flex-col items-center text-center gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
            <KeyIcon />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t('apiKeyRequired', language)}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {t('apiKeyDesc', language)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
           <div>
              <input 
                type="password"
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    setError('');
                }}
                placeholder={t('enterApiKey', language)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#2c2d2e] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-mono"
              />
              {error && <p className="text-red-500 text-xs mt-2 ml-1">{error}</p>}
           </div>

           <div className="flex flex-col gap-3">
                <button 
                    type="submit"
                    className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold shadow-lg hover:scale-[1.02] transition-all"
                >
                    {t('saveKey', language)}
                </button>
                
                <div className="flex justify-center items-center mt-2">
                     <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                        {t('getApiKey', language)} ↗
                    </a>
                </div>
           </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;
