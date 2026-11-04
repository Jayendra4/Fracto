import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import CameraCapture from '@/components/CameraCapture';
import { useUploadFileMutation } from '@/store/api/uploadApi';
import { Label } from '@/components/ui/label';
import UploadImage from '@/components/common/UploadImage';
import { KYC_STORAGE_KEY } from '@/utils/constants';

/* ---------------- SCHEMA ---------------- */

const addressSchema = z.object({
  secondaryId: z.string().optional(),
  secondary_id: z.string().optional(),
  selfie_photo: z.string().nonempty('Selfie is required'),
});

export type FinalStepData = z.infer<typeof addressSchema>;

/* ---------------- COMPONENT ---------------- */

const FinalKycStep = ({
  onBack,
  onSubmitFinal,
}: {
  onBack: () => void;
  onSubmitFinal: (data: FinalStepData) => void | Promise<void>;
}) => {
  const {
    handleSubmit,
    setValue,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FinalStepData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      secondaryId: '',
      secondary_id: '',
      selfie_photo: '',
    },
  });

  const [uploadFile, { isLoading }] = useUploadFileMutation();
  const [isImageUploading, setIsImageUploading] = useState<boolean>(false);
  const [showCamera, setShowCamera] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadError, setUploadError] = useState('');
  const selectedProofType = watch('secondaryId');

  /* ---------- UPLOAD SELFIE ---------- */
  const handleFileUpload = async (file: File) => {
    try {
      setUploadError('');
      const res = await uploadFile(file).unwrap();

      setPreviewUrl(res.url);
      setValue('selfie_photo', res.url, { shouldValidate: true });
    } catch (err) {
      setUploadError('Failed to upload selfie. Please try again.');
    }
  };

  /* ---------- SUBMIT ---------- */
  const onSubmit = async (data: FinalStepData) => {
    await onSubmitFinal(data);
  };

  useEffect(() => {
    const saved = localStorage.getItem(KYC_STORAGE_KEY);
    if (!saved) return;

    const parsed = JSON.parse(saved);
    if (parsed.finalStepData) {
      reset(parsed.finalStepData);
    }
  }, [reset]);

  /* ---------- AUTO SAVE ---------- */
  useEffect(() => {
    const subscription = watch((value) => {
      const saved = JSON.parse(localStorage.getItem(KYC_STORAGE_KEY) || '{}');

      localStorage.setItem(
        KYC_STORAGE_KEY,
        JSON.stringify({
          ...saved,
          finalStepData: value,
        })
      );
    });

    return () => subscription.unsubscribe();
  }, [watch]);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-bold">Step 4 – Live Selfie</h2>

      <div>
        <label className="block mb-2 font-medium">
          Selfie Photo <span className="text-red-500">*</span>
        </label>

        {/* EMPTY STATE */}
        {!previewUrl && (
          <div
            onClick={() => !isLoading && setShowCamera(true)}
            className="flex flex-col items-center justify-center gap-3 border border-dashed border-white/20 rounded-xl px-4 py-10 cursor-pointer hover:border-white transition"
          >
            {isLoading ? (
              <p className="text-sm text-white/60">Uploading selfie...</p>
            ) : (
              <>
                <img src="/images/camera.svg" />
                <span className="px-4 py-1.5 rounded-md border border-white/20">
                  Click to capture selfie
                </span>
              </>
            )}
          </div>
        )}

        {/* PREVIEW */}
        {previewUrl && (
          <div className="flex flex-col items-center gap-3">
            <img
              src={previewUrl}
              alt="Selfie Preview"
              className="w-40 h-40 rounded-xl object-cover border"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPreviewUrl('');
                setValue('selfie_photo', '');
              }}
            >
              Retake Selfie
            </Button>
          </div>
        )}

        {errors.selfie_photo && (
          <p className="mt-2 text-sm text-red-500">{errors.selfie_photo.message}</p>
        )}

        {uploadError && <p className="mt-2 text-sm text-red-500">{uploadError}</p>}
      </div>

      {/* CAMERA */}
      {showCamera && (
        <CameraCapture
          onCapture={(file) => {
            setShowCamera(false);
            handleFileUpload(file);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}

      <div className="space-y-2">
        <Label>Secondary ID (Optional)</Label>
        <Controller
          control={control}
          name="secondaryId"
          render={({ field }) => (
            <div className="flex md:flex-row flex-col gap-6">
              {[
                { label: 'Passport', value: 'passport' },
                { label: 'License', value: 'license' },
                { label: 'Aadhaar', value: 'aadhaar' },
                { label: 'Voter', value: 'voter' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={field.name}
                    value={opt.value}
                    checked={field.value === opt.value}
                    onChange={() => field.onChange(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          )}
        />

        {errors.secondaryId && (
          <p className="text-sm text-destructive">{errors.secondaryId.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Controller
          control={control}
          name="secondary_id"
          render={({ field }) => (
            <UploadImage
              value={field.value}
              disabled={!selectedProofType}
              required={!!selectedProofType}
              onChange={(url) => field.onChange(url)}
              removeDoc={() => field.onChange('')}
              setIsImageUploading={setIsImageUploading}
            />
          )}
        />

        {errors.secondary_id && (
          <p className="text-sm text-destructive">{errors.secondary_id.message}</p>
        )}
      </div>

      <div className="flex justify-between gap-3 pt-14">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={isLoading || isImageUploading}>
          Submit KYC
        </Button>
      </div>
    </form>
  );
};

export default FinalKycStep;
