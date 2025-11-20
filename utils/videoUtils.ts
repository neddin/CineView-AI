
import { ShotData, ProcessedFrame, VideoMetadata } from "../types";

/**
 * Captures a frame from the provided video file at a specific timestamp
 * at the video's full original resolution.
 */
export const captureHighResFrame = async (videoFile: File, timeInSeconds: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const url = URL.createObjectURL(videoFile);
        
        video.src = url;
        video.muted = true;
        video.playsInline = true;
        video.crossOrigin = "anonymous";

        video.onloadedmetadata = () => {
            video.currentTime = timeInSeconds;
        };

        video.onseeked = () => {
            try {
                const canvas = document.createElement('canvas');
                // Use original video dimensions
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }

                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.95); // High quality
                
                // Cleanup
                URL.revokeObjectURL(url);
                resolve(dataUrl);
            } catch (e) {
                reject(e);
            }
        };

        video.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Error loading video for capture"));
        };

        // video.load() is usually not needed after src assignment but good for safety
        video.load();
    });
};

/**
 * Triggers a download of a base64 string
 */
export const downloadBase64Image = (base64Data: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Triggers a download of the video file
 */
export const downloadVideoFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Crops a base64 image to a 9:16 vertical aspect ratio (center crop).
 * Used to force the AI model to generate vertical posters from horizontal video frames.
 */
export const cropToVertical9_16 = async (base64Data: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
                reject(new Error("No canvas context"));
                return;
            }

            const srcW = img.width;
            const srcH = img.height;
            
            // Target: 9:16
            // We want to keep the full height usually (since video is wide), 
            // and crop the width to match the ratio.
            const targetRatio = 9 / 16;
            
            let cropH = srcH;
            let cropW = srcH * targetRatio;
            
            // If by some chance the source is already taller than 9:16 (unlikely for video), handle that
            if (cropW > srcW) {
                cropW = srcW;
                cropH = srcW / targetRatio;
            }
            
            // Center the crop
            const startX = (srcW - cropW) / 2;
            const startY = (srcH - cropH) / 2;

            canvas.width = cropW;
            canvas.height = cropH;

            ctx.drawImage(
                img, 
                startX, startY, cropW, cropH, // Source rect
                0, 0, cropW, cropH // Dest rect
            );

            // Return raw base64 without prefix for API usage
            const result = canvas.toDataURL('image/jpeg', 0.9);
            resolve(result.split(',')[1]);
        };
        img.onerror = (e) => reject(e);
        img.src = `data:image/jpeg;base64,${base64Data}`;
    });
};

/**
 * Generates a large tiled image of the color script.
 * Returns a Base64 data URL.
 */
export const generateTiledImage = async (
    shots: ShotData[],
    frames: ProcessedFrame[],
    videoMeta: VideoMetadata | null,
    columns: number,
    showLabels: boolean = true
): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!shots.length || !frames.length) {
            reject(new Error("No content"));
            return;
        }

        // Constants
        const GAP = 10;
        const TOTAL_WIDTH = 3000; // Fixed High-Res Width
        const frameW = (TOTAL_WIDTH - (columns - 1) * GAP) / columns;
        
        // Determine aspect ratio
        const metaRatio = videoMeta ? videoMeta.width / videoMeta.height : 16 / 9;
        const frameH = frameW / metaRatio;
        
        const rows = Math.ceil(shots.length / columns);
        const TOTAL_HEIGHT = rows * frameH + (rows - 1) * GAP;

        const canvas = document.createElement('canvas');
        canvas.width = TOTAL_WIDTH;
        canvas.height = TOTAL_HEIGHT;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            reject(new Error("No canvas"));
            return;
        }

        // Fill background
        ctx.fillStyle = "#111827"; // Dark background
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let loaded = 0;
        const imagesToLoad = shots.map(s => {
            let frame = frames[0];
            if (frames[s.thumbnailIndex]) frame = frames[s.thumbnailIndex];
            return frame.data;
        });

        const loadAndDrawImage = (base64: string, index: number): Promise<void> => {
            return new Promise((res) => {
                const img = new Image();
                img.onload = () => {
                    const col = index % columns;
                    const row = Math.floor(index / columns);
                    const x = col * (frameW + GAP);
                    const y = row * (frameH + GAP);
                    ctx.drawImage(img, x, y, frameW, frameH);
                    
                    // Optional: Draw Shot Number
                    if (showLabels) {
                        ctx.fillStyle = "rgba(0,0,0,0.5)";
                        ctx.fillRect(x, y, 40, 20);
                        ctx.fillStyle = "#ffffff";
                        ctx.font = "bold 12px Arial";
                        ctx.fillText(`#${shots[index].shotNumber}`, x + 5, y + 15);
                    }
                    
                    res();
                };
                img.onerror = () => res(); // Skip on error
                img.src = `data:image/jpeg;base64,${base64}`;
            });
        };

        Promise.all(imagesToLoad.map((data, idx) => loadAndDrawImage(data, idx)))
            .then(() => {
                resolve(canvas.toDataURL('image/jpeg', 0.9));
            })
            .catch(reject);
    });
};
