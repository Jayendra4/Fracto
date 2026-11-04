import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Pencil } from 'lucide-react';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useUploadFileMutation } from '@/store/api/uploadApi';
import { useChangeProfileImageMutation } from '@/store/api/adminApi';
import { Admin } from '@/types';
import { extractFileName } from '@/utils/helper';

const MAX_FILE_SIZE_MB = 20;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

interface ProfileImageUploadProps {
  adminDetail: Admin | null;
  updateLocalStorage: () => void;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  adminDetail,
  updateLocalStorage,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [uploadFile, { isLoading }] = useUploadFileMutation();
  const [changeProfileImage, { isLoading: imageUploading }] = useChangeProfileImageMutation();
  //   console.log(adminDetail, 'adminDetail');
  /* -------------------- INIT PROFILE IMAGE -------------------- */
  useEffect(() => {
    if (adminDetail?.profileImage) {
      setPreview(adminDetail.profileImage);
    }
  }, [adminDetail?.profileImage]);

  /* -------------------- OPEN PICKER -------------------- */
  const openFilePicker = () => {
    inputRef.current?.click();
  };

  /* -------------------- FILE CHANGE -------------------- */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Only PNG and JPG images are allowed');
      return;
    }

    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > MAX_FILE_SIZE_MB) {
      setUploadError(`File size must be less than ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    try {
      // 1. Upload image
      const res = await uploadFile(file).unwrap();
      setPreview(res.url);

      // 2. Update profile image
      await changeProfileImage({
        profileImage: extractFileName(res.url),
      }).unwrap();

      updateLocalStorage();
    } catch (err: any) {
      setUploadError(err?.data?.message || 'Profile image upload failed');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>Profile Image</Label>

      {uploadError && <ErrorBanner type="error" title="Upload Failed" message={uploadError} />}

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg"
        hidden
        onChange={handleFileChange}
      />

      {/* Image Wrapper */}
      <div className="relative w-48 h-48">
        {preview ? (
          <>
            <img
              src={preview}
              alt="Profile"
              className="w-full h-full rounded-full object-cover border"
            />

            {/* Edit Button */}
            <Button
              type="button"
              size="icon"
              className="absolute bottom-1 right-1 rounded-full"
              onClick={openFilePicker}
              disabled={isLoading || imageUploading}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div
            onClick={openFilePicker}
            className="flex flex-col items-center justify-center w-full h-full
                       rounded-full border-2 border-dashed cursor-pointer
                       text-muted-foreground hover:border-primary transition"
          >
            <Upload className="h-6 w-6" />
            <span className="text-xs mt-1">Upload</span>
          </div>
        )}
      </div>

      {(isLoading || imageUploading) && (
        <p className="text-sm text-muted-foreground">Uploading...</p>
      )}
    </div>
  );
};

export default ProfileImageUpload;
