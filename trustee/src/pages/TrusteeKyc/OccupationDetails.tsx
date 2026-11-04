import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { incomeOptions, KYC_STORAGE_KEY } from '@/utils/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const occupationSchema = z.object({
  occupation: z.string().nonempty('Occupation is required'),
  industry: z.string().nonempty('Industry is required'),
  monthlyIncome: z.string().nonempty('Monthly income is required'),
});

export type OccupationFormData = z.infer<typeof occupationSchema>;

const OccupationDetails = ({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: (data: OccupationFormData) => void;
}) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<OccupationFormData>({
    resolver: zodResolver(occupationSchema),
    defaultValues: {
      occupation: '',
      industry: '',
      monthlyIncome: '',
    },
  });

  /* ---------- LOAD SAVED DATA ---------- */
  useEffect(() => {
    const saved = localStorage.getItem(KYC_STORAGE_KEY);
    if (!saved) return;

    const parsed = JSON.parse(saved);
    if (parsed.occupationInfo) {
      reset(parsed.occupationInfo);
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
          occupationInfo: value,
        })
      );
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = (data: OccupationFormData) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-bold">Step 2 – Occupation Details</h2>

      {/* OCCUPATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label required>Occupation</Label>
          <Input {...register('occupation')} placeholder="Enter occupation" />
          {errors.occupation && (
            <p className="text-sm text-destructive">{errors.occupation.message}</p>
          )}
        </div>

        {/* INDUSTRY */}
        <div className="space-y-2">
          <Label required>Industry</Label>
          <Input {...register('industry')} placeholder="Enter industry" />
          {errors.industry && <p className="text-sm text-destructive">{errors.industry.message}</p>}
        </div>
      </div>

      {/* MONTHLY INCOME */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label required>Monthly Income</Label>

          <Controller
            control={control}
            name="monthlyIncome"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select income range" />
                </SelectTrigger>

                <SelectContent>
                  {incomeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          {errors.monthlyIncome && (
            <p className="text-sm text-destructive">{errors.monthlyIncome.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-14">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Next Step</Button>
      </div>
    </form>
  );
};

export default OccupationDetails;
