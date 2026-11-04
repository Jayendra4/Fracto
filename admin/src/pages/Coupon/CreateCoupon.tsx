import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/common/BackButton';
import { useCreateCouponMutation } from '@/store/api/couponApi';
import { useNavigate } from 'react-router-dom';
import { ErrorBanner } from '@/components/common/ErrorBanner';

/* ===================== SCHEMA ===================== */
const requiredDate = z.preprocess(
  (val) => {
    if (typeof val === 'string' && val.trim() === '') return undefined;
    return new Date(val as string);
  },
  z.date({
    required_error: 'Date is required',
    invalid_type_error: 'Invalid date',
  })
);
const couponSchema = z
  .object({
    code: z
      .string()
      .min(3, 'Coupon code is required')
      .transform((val) => val.toUpperCase()),
    description: z.string().optional(),

    discountType: z.enum(['Percentage', 'Fixed', 'FractionBonus']),
    discountValue: z.number().min(1, 'Discount value is required'),

    bonusFractions: z.number().min(0),
    maxDiscountAmount: z.number().min(0),

    minPurchaseAmount: z.number().min(0),
    totalUsageLimit: z.number().min(1),
    perUserLimit: z.number().min(1),

    validFrom: z.string().nonempty('Date is required'),
    validTill: z.string().nonempty('Date is required'),
  })
  .superRefine((data, ctx) => {
    if (data.discountType === 'Percentage' && data.maxDiscountAmount <= 0) {
      ctx.addIssue({
        path: ['maxDiscountAmount'],
        message: 'Max discount amount is required for percentage coupons',
        code: z.ZodIssueCode.custom,
      });
    }

    if (data.discountType === 'FractionBonus' && data.bonusFractions <= 0) {
      ctx.addIssue({
        path: ['bonusFractions'],
        message: 'Bonus fractions are required',
        code: z.ZodIssueCode.custom,
      });
    }
  });

type CouponFormData = z.infer<typeof couponSchema>;

/* ===================== COMPONENT ===================== */

const CreateCoupon = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      description: '',
      discountType: 'Percentage',
      discountValue: 0,
      bonusFractions: 0,
      maxDiscountAmount: 0,
      minPurchaseAmount: 0,
      totalUsageLimit: 1,
      perUserLimit: 1,
      validFrom: '',
      validTill: '',
    },
  });
  const [createCoupon, { isLoading, error }] = useCreateCouponMutation();
  const discountType = watch('discountType');

  const onSubmit = async (data: CouponFormData) => {
    try {
      const payload = {
        code: data.code.toUpperCase(),
        description: data.description ?? '',
        discountType: data.discountType,
        discountValue: data.discountValue,
        bonusFractions: data.discountType === 'FractionBonus' ? data.bonusFractions : 0,
        maxDiscountAmount: data.discountType === 'Percentage' ? data.maxDiscountAmount : 0,
        minPurchaseAmount: data.minPurchaseAmount,
        totalUsageLimit: data.totalUsageLimit,
        perUserLimit: data.perUserLimit,
        validFrom: new Date(data.validFrom).toISOString(),
        validTill: new Date(data.validTill).toISOString(),
      };

      await createCoupon(payload).unwrap();
      navigate(-1);
    } catch (err) {
      console.error('Error Creating Coupon:', err);
    }
  };

  return (
    <div className="space-y-8 xl:max-w-[80%]">
      <div className="flex items-center gap-5 mb-4">
        <BackButton />
        <h2 className="text-2xl font-bold">Create Coupon</h2>
      </div>
      {error && (
        <ErrorBanner
          type="error"
          title="Error Creating Coupon"
          message={(error as any)?.data?.message || 'Something went wrong'}
        />
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-10 gap-y-6">
          {/* Code */}
          <div className="space-y-2">
            <Label required>Coupon Code</Label>
            <Input
              {...register('code')}
              placeholder="WELCOME10"
              onChange={(e) =>
                setValue('code', e.target.value.toUpperCase(), { shouldValidate: true })
              }
              maxLength={20}
            />
            {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Input {...register('description')} placeholder="Optional description" />
            {/* {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )} */}
          </div>

          {/* Discount Type */}
          <div className="space-y-2">
            <Label>Discount Type</Label>
            <Select
              defaultValue="Percentage"
              onValueChange={(v) => setValue('discountType', v as CouponFormData['discountType'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Percentage">Percentage (%)</SelectItem>
                <SelectItem value="Fixed">Fixed (₹)</SelectItem>
                <SelectItem value="FractionBonus">Fraction Bonus</SelectItem>
              </SelectContent>
            </Select>
            {errors.discountType && (
              <p className="text-sm text-destructive">{errors.discountType.message}</p>
            )}
          </div>

          {/* Discount Value */}
          <div className="space-y-2">
            <Label>Discount Value</Label>
            <Input type="number" {...register('discountValue', { valueAsNumber: true })} />
            {errors.discountValue && (
              <p className="text-sm text-destructive">{errors.discountValue.message}</p>
            )}
          </div>

          {/* Max Discount */}
          {discountType === 'Percentage' && (
            <div className="space-y-2">
              <Label>Max Discount Amount (₹)</Label>
              <Input type="number" {...register('maxDiscountAmount', { valueAsNumber: true })} />
              {errors.maxDiscountAmount && (
                <p className="text-sm text-destructive">{errors.maxDiscountAmount.message}</p>
              )}
            </div>
          )}

          {/* Bonus Fractions */}
          {discountType === 'FractionBonus' && (
            <div className="space-y-2">
              <Label>Bonus Fractions</Label>
              <Input type="number" {...register('bonusFractions', { valueAsNumber: true })} />
              {errors.bonusFractions && (
                <p className="text-sm text-destructive">{errors.bonusFractions.message}</p>
              )}
            </div>
          )}

          {/* Min Purchase */}
          <div className="space-y-2">
            <Label>Minimum Purchase Amount (₹)</Label>
            <Input type="number" {...register('minPurchaseAmount', { valueAsNumber: true })} />
            {errors.minPurchaseAmount && (
              <p className="text-sm text-destructive">{errors.minPurchaseAmount.message}</p>
            )}
          </div>

          {/* Usage Limit */}
          <div className="space-y-2">
            <Label>Total Usage Limit</Label>
            <Input type="number" {...register('totalUsageLimit', { valueAsNumber: true })} />
            {errors.totalUsageLimit && (
              <p className="text-sm text-destructive">{errors.totalUsageLimit.message}</p>
            )}
          </div>

          {/* Per User Limit */}
          <div className="space-y-2">
            <Label>Per User Limit</Label>
            <Input type="number" {...register('perUserLimit', { valueAsNumber: true })} />
            {errors.perUserLimit && (
              <p className="text-sm text-destructive">{errors.perUserLimit.message}</p>
            )}
          </div>

          {/* Valid From */}
          <div className="space-y-2">
            <Label>Valid From</Label>
            <Input type="datetime-local" {...register('validFrom')} />
            {errors.validFrom && (
              <p className="text-sm text-destructive">{errors.validFrom.message}</p>
            )}
          </div>

          {/* Valid Till */}
          <div className="space-y-2">
            <Label>Valid Till</Label>
            <Input type="datetime-local" {...register('validTill')} />
            {errors.validTill && (
              <p className="text-sm text-destructive">{errors.validTill.message}</p>
            )}
          </div>
        </div>

        <Button disabled={isLoading} type="submit" className="my-6">
          Create Coupon
        </Button>
      </form>
    </div>
  );
};

export default CreateCoupon;
