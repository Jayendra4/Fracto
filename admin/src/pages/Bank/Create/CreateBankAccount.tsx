import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { z } from 'zod';
import { BankAccountFormData } from '@/types';
import { useCreateBankAccountMutation } from '@/store/api/bankApi';
import { BackButton } from '@/components/common/BackButton';
import { useNavigate } from 'react-router-dom';

const bankAccountSchema = z.object({
  accountHolderName: z
    .string()
    .trim()
    .min(3, 'Account holder name must be at least 3 characters')
    .max(100, 'Account holder name is too long')
    .regex(/^[A-Za-z\s.]+$/, 'Account holder name can contain only letters and spaces'),

  bankName: z
    .string()
    .trim()
    .min(3, 'Bank name must be at least 3 characters')
    .max(100, 'Bank name is too long')
    .regex(/^[A-Za-z\s.&]+$/, 'Bank name can contain only letters'),

  accountNumber: z
    .string()
    .trim()
    .regex(/^\d+$/, 'Account number must contain only digits')
    .min(9, 'Account number must be at least 9 digits')
    .max(18, 'Account number must be at most 18 digits'),

  ifscCode: z
    .string()
    .trim()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code (e.g. SBIN0005943)')
    .transform((v) => v.toUpperCase()),
});

const CreateBankAccount = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
    },
  });

  const [createBankAccount, { isLoading, error }] = useCreateBankAccountMutation();

  const onSubmit = async (data: BankAccountFormData) => {
    try {
      await createBankAccount(data).unwrap();
      navigate('/bank-account');
    } catch (err) {
      console.error('Create Bank Account Failed:', err);
    }
  };

  return (
    <div className="space-y-8 xl:max-w-[80%]">
      <div className="flex items-center gap-5 mb-4">
        <BackButton />
        <h2 className="text-2xl font-bold">Add Bank Account</h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
        {error && (
          <ErrorBanner
            type="error"
            title="Error Creating Bank Account"
            message={(error as any)?.data?.message || 'Something went wrong'}
          />
        )}

        <div className="space-y-2">
          <Label>Account Holder Name</Label>
          <Input placeholder="Enter Account Holder Name" {...register('accountHolderName')} />
          {errors.accountHolderName && (
            <p className="text-sm text-destructive">{errors.accountHolderName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Bank Name</Label>
          <Input placeholder="Enter Bank Name" {...register('bankName')} />
          {errors.bankName && <p className="text-sm text-destructive">{errors.bankName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Account Number</Label>
          <Input placeholder="Enter Account Number" {...register('accountNumber')} />
          {errors.accountNumber && (
            <p className="text-sm text-destructive">{errors.accountNumber.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>IFSC Code</Label>
          <Input
            placeholder="Enter IFSC Code eg: SBIN0005943"
            maxLength={11}
            {...register('ifscCode', {
              onChange: (e) => {
                e.target.value = e.target.value.toUpperCase();
              },
            })}
          />
          {errors.ifscCode && <p className="text-sm text-destructive">{errors.ifscCode.message}</p>}
        </div>

        <Button disabled={isLoading} type="submit">
          Create Bank Account
        </Button>
      </form>
    </div>
  );
};

export default CreateBankAccount;
