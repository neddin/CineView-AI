import React, { useRef, useState } from 'react';
import { Language } from '../types';
import { t } from '../utils/translations';
import { CameraIcon } from './Icons';

interface VideoPlayerProps {
  videoFile: File;
  language: Language;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoFile, language }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc] = useState(() => URL.createObjectURL(videoFile));
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = async () => {
    const video = videoRef.current;
    if (!video) return;

    setIsCapturing(true);
    try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
            
            // Create download link
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `capture_${video.currentTime.toFixed(2)}s.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } catch (e) {
        console.error("Screenshot failed", e);
    } finally {
        setTimeout(() => setIsCapturing(false), 500);
    }
  };

  return (
    <div className="w-full bg-black rounded-2xl overflow-hidden border-[4px] border-white dark:border-gray-600 shadow-soft relative group transition-colors duration-300">
       <video
         ref={videoRef}
         src={videoSrc}
         controls
         className="w-full max-h-[60vh] object-contain"
       />
       
       {/* Overlay Button for Screenshot */}
       <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
           <button
             onClick={handleCapture}
             className={`flex items-center gap-2 px-3 py-2 bg-white/90 hover:bg-white text-gray-900 rounded-full shadow-lg backdrop-blur-sm transition-all ${isCapturing ? 'scale-95' : ''}`}
             title={t('screenshot', language)}
           >
             <CameraIcon />
             <span className="text-xs font-bold">{isCapturing ? t('screenshotSaved', language) : t('screenshot', language)}</span>
           </button>
       </div>
    </div>
  );
};

export default VideoPlayer;