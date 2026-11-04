import { uploadFileApi } from '@/api';
import { useState } from 'react';
import type { IUploadedDoc } from './useAssetForm';

export const useImageUpload = () => {
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<IUploadedDoc[]>([]);
  const [imageError, setImageError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from(files);

    setImageError('');

    if (images.length + fileArray.length > 25) {
      setImageError('Max 25 images');
      return;
    }

    const previews = fileArray.map((f) => URL.createObjectURL(f));
    setPreviewImages((prev) => [...prev, ...previews]);
    setImages((prev) => [...prev, ...fileArray]);

    setIsUploading(true); // ✅ start
    try {
      const uploaded = await Promise.all(
        fileArray.map(async (file) => {
          const res = await uploadFileApi(file);
          return {
            documentType: 'ASSET_IMAGE',
            documentName: file.name,
            documentUrl: res.success ? (res.data?.url ?? '') : '',
            remarks: '',
          };
        })
      );
      setUploadedDocs((prev) => [...prev, ...uploaded]);
    } catch {
      setImageError('Upload failed');
    } finally {
      setIsUploading(false); // ✅ stop — hamesha
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files).filter((f) =>
      f.type.startsWith('image/')
    );

    setImageError('');

    if (images.length + fileArray.length > 25) {
      setImageError('Max 25 images');
      return;
    }

    const previews = fileArray.map((f) => URL.createObjectURL(f));
    setPreviewImages((prev) => [...prev, ...previews]);
    setImages((prev) => [...prev, ...fileArray]);

    setIsUploading(true); // ✅ start
    try {
      const uploaded = await Promise.all(
        fileArray.map(async (file) => {
          const res = await uploadFileApi(file);
          return {
            documentType: 'ASSET_IMAGE',
            documentName: file.name,
            documentUrl: res.success ? (res.data?.url ?? '') : '',
            remarks: '',
          };
        })
      );
      setUploadedDocs((prev) => [...prev, ...uploaded]);
    } catch {
      setImageError('Upload failed');
    } finally {
      setIsUploading(false); // ✅ stop
    }
  };

  // 🔥 REMOVE FUNCTION ADD
  const removeImage = (index: number) => {
    // previewImages/uploadedDocs can be longer than images when existing
    // (already-uploaded) documents were prefilled without a matching File —
    // map the removed index onto the newly-added File, if any.
    const existingCount = previewImages.length - images.length;
    const fileIndex = index - existingCount;

    if (fileIndex >= 0) {
      setImages((prev) => prev.filter((_, i) => i !== fileIndex));
    }

    setPreviewImages((prev) => {
      URL.revokeObjectURL(prev[index]); // memory cleanup (no-op for non-blob URLs)
      return prev.filter((_, i) => i !== index);
    });

    setUploadedDocs((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    images,
    previewImages,
    uploadedDocs,
    imageError,
    isUploading,
    handleFileChange,
    removeImage, // ✅ expose
    setPreviewImages,
    setImages,
    setUploadedDocs,
    handleDrop,
    isDragging,
    setIsDragging,
  };
};
