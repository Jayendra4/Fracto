import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { BackButton } from '@/components/common/BackButton';
import UploadImage from '@/components/common/UploadImage';

import { useCreateUpiAccountMutation } from '@/store/api/upiApi';
import { UpiAccountFormData } from '@/types';

const upiAccountSchema = z.object({
  upiId: z
    .string()
    .min(3, 'UPI ID is required')
    .regex(/^[\w.-]+@[\w.-]+$/, 'Invalid UPI ID'),

  qrCode: z.string().min(1, 'QR Code is required'),
});

const CreateUpiAccount = () => {
  const [isImageUploading, setIsImageUploading] = useState<boolean>(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpiAccountFormData>({
    resolver: zodResolver(upiAccountSchema),
    defaultValues: {
      upiId: '',
      qrCode: '',
    },
  });

  const [createUpiAccount, { isLoading, error }] = useCreateUpiAccountMutation();

  const onSubmit = async (data: UpiAccountFormData) => {
    try {
      await createUpiAccount({
        upiId: data.upiId.trim().toLowerCase(),
        qrCode: data.qrCode,
      }).unwrap();

      navigate('/upi');
    } catch (err) {
      console.error('Create UPI Account Failed:', err);
    }
  };

  return (
    <div className="space-y-8 xl:max-w-[80%]">
      <div className="flex items-center gap-5 mb-4">
        <BackButton />
        <h2 className="text-2xl font-bold">Add UPI Account</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
        {error && (
          <ErrorBanner
            type="error"
            title="Error Creating UPI Account"
            message={(error as any)?.data?.message || 'Something went wrong'}
          />
        )}

        {/* UPI ID */}
        <div className="space-y-2">
          <Label>UPI ID</Label>
          <Input placeholder="user@upi" {...register('upiId')} />
          {errors.upiId && <p className="text-sm text-destructive">{errors.upiId.message}</p>}
        </div>

        <div className="space-y-2">
          <UploadImage
            label="QR Code Image"
            onChange={(url) => {
              setValue('qrCode', url, { shouldValidate: true });
            }}
            setIsImageUploading={setIsImageUploading}
          />

          {errors.qrCode && <p className="text-sm text-destructive">{errors.qrCode.message}</p>}
        </div>

        <Button disabled={isLoading || isImageUploading} type="submit">
          Create UPI Account
        </Button>
      </form>
    </div>
  );
};

export default CreateUpiAccount;
