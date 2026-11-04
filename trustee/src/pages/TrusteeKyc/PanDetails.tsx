import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { KYC_STORAGE_KEY } from '@/utils/constants';
import UploadImage from '@/components/common/UploadImage';

const panSchema = z.object({
  panNumber: z
    .string()
    .nonempty('PAN is required')
    .regex(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, 'Invalid PAN format'),

  dateOfBirth: z
    .string()
    .nonempty('Date of birth is required')
    .refine((value) => {
      const selectedDate = new Date(value);
      const today = new Date();

      // Remove time part for accurate comparison
      today.setHours(0, 0, 0, 0);

      return selectedDate <= today;
    }, 'Date of birth cannot be in the future'),

  pan_indian: z.string().nonempty('PAN document is required'),
});

export type PanFormData = z.infer<typeof panSchema>;

const PanDetails = ({ onNext }: { onNext: (data: PanFormData) => void }) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PanFormData>({
    resolver: zodResolver(panSchema),
    defaultValues: {
      panNumber: '',
      dateOfBirth: '',
      pan_indian: '',
    },
  });
  const [isImageUploading, setIsImageUploading] = useState<boolean>(false);

  /* ---------- LOAD SAVED DATA ---------- */
  useEffect(() => {
    const saved = localStorage.getItem(KYC_STORAGE_KEY);
    if (!saved) return;

    const parsed = JSON.parse(saved);
    if (parsed.panInfo) {
      reset(parsed.panInfo);
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
          panInfo: value,
        })
      );
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = (data: PanFormData) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-bold">Step 1 – PAN Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label required>PAN Number</Label>
          <Input
            placeholder="ABCDE1234F"
            className="uppercase"
            maxLength={10}
            {...register('panNumber', {
              onChange: (e) => {
                e.target.value = e.target.value.toUpperCase();
              },
            })}
          />
          {errors.panNumber && (
            <p className="text-sm text-destructive">{errors.panNumber.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label required>Date of Birth</Label>
          <Input type="date" {...register('dateOfBirth')} />
          {errors.dateOfBirth && (
            <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>
          )}
        </div>
      </div>

      {/* PAN FILE UPLOAD */}
      <div className="space-y-2">
        <Label required>Upload PAN Document</Label>

        <Controller
          control={control}
          name="pan_indian"
          render={({ field }) => (
            <UploadImage
              value={field.value}
              required
              onChange={(url) => field.onChange(url)}
              removeDoc={() => field.onChange('')}
              setIsImageUploading={setIsImageUploading}
              accept="image/*,application/pdf"
            />
          )}
        />

        {errors.pan_indian && (
          <p className="text-sm text-destructive">{errors.pan_indian.message}</p>
        )}
      </div>

      <div className="flex justify-end pt-14">
        <Button disabled={isImageUploading} type="submit">
          Next
        </Button>
      </div>
    </form>
  );
};

export default PanDetails;
