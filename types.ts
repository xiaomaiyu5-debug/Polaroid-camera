export interface Photo {
  id: string;
  dataUrl: string; // Base64 image
  timestamp: number;
  caption: string;
  rotation: number; // For that scattered desk look
  x: number;
  y: number;
  zIndex: number;
  isGeneratingCaption?: boolean;
}

export interface CameraConfig {
  deviceId?: string;
}