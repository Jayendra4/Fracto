import type { AssetFileItem, AssetFileType } from '@/interface';

export const createPreviewItem = (
  file: File,
  type: AssetFileType
): AssetFileItem => ({
  id: `${type}-${file.name}-${file.lastModified}-${Math.random()
    .toString(36)
    .slice(2)}`,
  file,
  previewUrl: URL.createObjectURL(file),
  type,
});
