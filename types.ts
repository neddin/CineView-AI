
export enum AppState {
  IDLE = 'IDLE',
  EXTRACTING_FRAMES = 'EXTRACTING_FRAMES',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

export type Language = 'en' | 'zh';

export interface ProcessedFrame {
  timestamp: number;
  data: string; // Base64 image string
}

export interface VideoMetadata {
  width: number;
  height: number;
  duration: number;
}

export interface ShotData {
  shotNumber: number;
  startTime: string;
  endTime: string;
  duration: number | string; // Allow both but prefer number
  size: string; // e.g., MCU, Wide, ECU
  movement: string; // e.g., Pan Left, Static, Dolly In
  description: string;
  audio: string; // Dialogue or voiceover
  sfx: string; // Sound effects
  thumbnailIndex: number; // Index in the frames array
}

export interface AnalysisResult {
  shots: ShotData[];
  summary: string;
  title: string;
  script?: string; // Cache for the generated screenplay
  poster?: string[]; // Cache for generated posters (array of base64)
}

export type ProcessingProgress = {
  current: number;
  total: number;
  stage: string;
};
