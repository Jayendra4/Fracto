/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed error handling, matches the pattern in rwa.api.ts */
import { useState, useRef, useEffect } from 'react';
import CommonModal from '@/components/CommonModal';
import { uploadFileApi } from '@/api';
import { useUpdateProfileImage } from '@/api/profileImage.api';
import { useFetchUserDataFlow } from '@/hooks/useFetchUserDataFlow';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { FiCamera, FiCheck } from 'react-icons/fi';

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage: string;
  initials: string;
}

export default function ProfilePictureModal({
  isOpen,
  onClose,
  currentImage,
  initials,
}: ProfilePictureModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token =
    useSelector((state: RootState) => state.authLogin.token) ||
    Cookies.get('hof_token') ||
    '';
  const { run: runUserFetchFlow } = useFetchUserDataFlow();
  const { mutateAsync: updateProfileImage } = useUpdateProfileImage();

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleClose = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setPreviewUrl(null);
    setSelectedFile(null);

    onClose();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const extractFileName = (url: string) => url.split('/').pop() || '';

  const handleUpdate = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const uploadRes = await uploadFileApi(selectedFile);

      if (!uploadRes?.success) {
        throw new Error(uploadRes?.message || 'Image upload failed');
      }

      const imageUrl = uploadRes?.data?.url ?? '';
      const filename = extractFileName(imageUrl);

      const res = await updateProfileImage({
        profileImage: filename,
      });

      if (!res?.success) {
        throw new Error(res?.message || 'Profile image update failed');
      }

      toast.success('Profile picture updated successfully');
      await runUserFetchFlow(token);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Profile Picture"
      className="max-w-md"
    >
      <div className="flex flex-col items-center gap-8 py-4 px-2 relative">
        {uploading && (
          <div className="absolute inset-[-1.5rem] z-50 flex flex-col items-center justify-center bg-[var(--bg)]/60 backdrop-blur-sm rounded-b-xl">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
            <p className="mt-4 font-16 font-semibold text-[var(--fg)] tracking-wide">
              Updating Photo...
            </p>
          </div>
        )}

        <div className="relative w-64 h-64 group">
          <div className="w-full h-full rounded-2xl overflow-hidden border-4 border-white/10 shadow-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm">
            {previewUrl || currentImage ? (
              <img
                src={previewUrl || currentImage}
                alt="Profile"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl font-bold text-white bg-gradient-to-br from-blue-500 to-indigo-600 shadow-inner">
                {initials || '?'}
              </div>
            )}
          </div>

          <button
            onClick={handleUploadClick}
            className="absolute bottom-4 right-4 p-4 rounded-full bg-[#2F5BCC] text-white shadow-lg hover:scale-110 active:scale-95 transition-all z-20"
          >
            <FiCamera size={24} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <div className="w-full space-y-4">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-[var(--fg)]">
              Update your photo
            </h4>
            <p className="text-sm text-[var(--fg)]/50">
              Show your best self to the community
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleClose}
              disabled={uploading}
              className="flex-1 py-3 px-6 rounded-xl border border-[var(--fg)]/10 text-[var(--fg)] font-medium hover:bg-[var(--fg)]/5 transition-all duration-300 disabled:opacity-50 active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={!selectedFile || uploading}
              className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white font-semibold shadow-lg hover:shadow-blue-500/20 hover:brightness-110 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <FiCheck size={18} />
              Update Photo
            </button>
          </div>
        </div>
      </div>
    </CommonModal>
  );
}
