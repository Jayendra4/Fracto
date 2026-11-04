import { registerAs } from '@nestjs/config';

export const storageConfigFactory = registerAs('storage', () => ({
  diskDestination: process.env.STORAGE_DIR,
  url: process.env.STORAGE_URL,
  maxFileSize: 300000000, // 300000000 Bytes = 300 MB
  fileExtensions: [
    '.png',
    '.jpg',
    '.jpeg',
    '.pdf',
    '.webm',
    '.mp4 ',
    '.jpeg',
    '.jpg',
    '.png',
    '.mov',
  ],
}));
