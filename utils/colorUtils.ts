
// Helper to convert RGB to Hex
const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

interface ColorCount {
  color: string; // Hex
  count: number;
  r: number;
  g: number;
  b: number;
}

export const extractDominantColors = async (
  frames: { data: string }[],
  maxColors: number = 6
): Promise<string[]> => {
  if (frames.length === 0) return [];

  // Limit frames to analyze to avoid performance hit (e.g., take up to 10 evenly spaced frames)
  const sampleStep = Math.max(1, Math.floor(frames.length / 10));
  const sampleFrames = frames.filter((_, i) => i % sampleStep === 0);

  const colorMap: Record<string, ColorCount> = {};

  const processFrame = (base64: string): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = `data:image/jpeg;base64,${base64}`;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Resize to small dimensions for faster processing
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve();
          return;
        }
        
        // Small size enough for dominant color
        canvas.width = 50; 
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);

        const imageData = ctx.getImageData(0, 0, 50, 50).data;
        
        // Quantize and count
        for (let i = 0; i < imageData.length; i += 4) {
          let r = imageData[i];
          let g = imageData[i + 1];
          let b = imageData[i + 2];
          // const a = imageData[i + 3];

          // Quantize colors (round to nearest 32 to group similar shades)
          r = Math.round(r / 32) * 32;
          g = Math.round(g / 32) * 32;
          b = Math.round(b / 32) * 32;

          const hex = rgbToHex(r, g, b);
          
          if (!colorMap[hex]) {
            colorMap[hex] = { color: hex, count: 0, r, g, b };
          }
          colorMap[hex].count++;
        }
        resolve();
      };
      img.onerror = () => resolve(); // Skip errors
    });
  };

  await Promise.all(sampleFrames.map(f => processFrame(f.data)));

  // Sort by frequency
  let sortedColors = Object.values(colorMap).sort((a, b) => b.count - a.count);

  // Filter distinct colors (simple distance check to avoid multiple shades of same color)
  const distinctColors: ColorCount[] = [];
  
  for (const color of sortedColors) {
    if (distinctColors.length >= maxColors) break;

    // Check if too similar to existing
    const isTooSimilar = distinctColors.some(c => {
      const dist = Math.sqrt(
        Math.pow(c.r - color.r, 2) +
        Math.pow(c.g - color.g, 2) +
        Math.pow(c.b - color.b, 2)
      );
      return dist < 60; // Threshold for similarity
    });

    if (!isTooSimilar) {
      distinctColors.push(color);
    }
  }

  return distinctColors.map(c => c.color);
};
