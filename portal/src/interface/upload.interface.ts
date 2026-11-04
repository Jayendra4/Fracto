export type AssetFileType = 'image' | 'video';

export interface AssetFileItem {
  id: string;
  file: File;
  previewUrl: string;
  type: AssetFileType;
  filename?: {
    previewUrl?: string;
  };
}
