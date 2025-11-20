
import React from 'react';
import { MailIcon } from './Icons';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-8 mt-auto select-none animate-fade-in">
      <div className="flex items-center justify-center gap-3 text-sm text-gray-400 dark:text-gray-500">
        <span className="font-bold tracking-tight">© CineView AI</span>
        <span className="h-3 w-px bg-gray-300 dark:bg-gray-700"></span>
        <div className="group relative inline-block">
          <span className="cursor-default hover:text-gray-600 dark:hover:text-gray-300 transition-colors font-medium">
            Created by Eddy Chen
          </span>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none z-50">
            <div className="bg-[#111827] dark:bg-black text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl flex items-center gap-2 whitespace-nowrap border border-gray-800/50">
                <MailIcon className="w-3.5 h-3.5" />
                <span className="tracking-wide">eddyse@gmail.com</span>
            </div>
            {/* Tooltip Arrow */}
            <div className="w-2 h-2 bg-[#111827] dark:bg-black absolute left-1/2 -translate-x-1/2 -bottom-1 rotate-45 border-r border-b border-gray-800/50"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
