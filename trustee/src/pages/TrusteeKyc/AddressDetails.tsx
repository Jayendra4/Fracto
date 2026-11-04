import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import UploadImage from '@/components/common/UploadImage';
import { KYC_STORAGE_KEY } from '@/utils/constants';
import { useGetCountriesQuery } from '@/store/api/authApi';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';

/* ---------------- SCHEMA ---------------- */

const addressSchema = z.object({
  addressLine1: z.string().nonempty('Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().nonempty('City is required'),
  state: z.string().nonempty('State is required'),
  pincode: z.string().nonempty('Pincode is required').min(6, 'Invalid pincode'),
  country: z.string().nonempty('Country is required'),

  addressProofType: z.enum(['BANK_STATEMENT', 'UTILITY_BILL', 'AADHAAR_XML'], {
    errorMap: () => ({ message: 'Select address proof type' }),
  }),

  address_proof: z.string().nonempty('Address proof document is required'),
});

export type AddressFormData = z.infer<typeof addressSchema>;

/* ---------------- COMPONENT ---------------- */

const AddressDetails = ({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: (data: AddressFormData) => void;
}) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      addressProofType: undefined,
      address_proof: '',
    },
  });
  const [isImageUploading, setIsImageUploading] = useState<boolean>(false);
  const { data: countryList } = useGetCountriesQuery();

  const selectedProofType = watch('addressProofType');

  /* ---------- LOAD SAVED DATA ---------- */
  useEffect(() => {
    const saved = localStorage.getItem(KYC_STORAGE_KEY);
    if (!saved) return;

    const parsed = JSON.parse(saved);
    if (parsed.residentialAddress) {
      reset(parsed.residentialAddress);
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
          residentialAddress: value,
        })
      );
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = (data: AddressFormData) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-bold">Step 3 – Address Details</h2>

      {/* ADDRESS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label required>Permanent Address</Label>
          <Input {...register('addressLine1')} placeholder="Building / Street / Plot No" />
          {errors.addressLine1 && (
            <p className="text-sm text-destructive">{errors.addressLine1.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Landmark / Area</Label>
          <Input {...register('addressLine2')} placeholder="Optional" />
        </div>

        <div className="space-y-2">
          <Label required>City</Label>
          <Input {...register('city')} placeholder="Enter city" />
          {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
        </div>

        <div className="space-y-2">
          <Label required>State</Label>
          <Input {...register('state')} placeholder="Enter state" />
          {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
        </div>

        <div className="space-y-2">
          <Label required>Pincode</Label>
          <Input {...register('pincode')} placeholder="Enter pincode" />
          {errors.pincode && <p className="text-sm text-destructive">{errors.pincode.message}</p>}
        </div>

        {/* <div className="space-y-2">
          <Label required>Country</Label>

          <Controller
            control={control}
            name="country"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>

                <SelectContent>
                  {countryList?.map((c: any) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.flag} {c.name} ({c.dialCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
        </div> */}
      </div>

      {/* ADDRESS PROOF TYPE */}
      <div className="space-y-2">
        <Label required>Address Proof</Label>

        <Controller
          control={control}
          name="addressProofType"
          render={({ field }) => (
            <div className="flex md:flex-row flex-col gap-6">
              {[
                { label: 'Bank Statement', value: 'BANK_STATEMENT' },
                { label: 'Utility Bill', value: 'UTILITY_BILL' },
                { label: 'Aadhaar XML', value: 'AADHAAR_XML' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={field.value === opt.value}
                    onChange={() => {
                      field.onChange(opt.value);
                      setValue('address_proof', '');
                    }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          )}
        />

        {errors.addressProofType && (
          <p className="text-sm text-destructive">{errors.addressProofType.message}</p>
        )}
      </div>

      {selectedProofType && (
        <div className="space-y-2">
          <Controller
            control={control}
            name="address_proof"
            render={({ field }) => (
              <UploadImage
                value={typeof field.value === 'string' ? field.value : ''}
                required
                onChange={(url) => field.onChange(url)}
                removeDoc={() => field.onChange('')}
                setIsImageUploading={setIsImageUploading}
                accept="image/*,application/pdf"
              />
            )}
          />

          {errors.address_proof && (
            <p className="text-sm text-destructive">{errors.address_proof.message}</p>
          )}
        </div>
      )}

      <div className="flex justify-between pt-14">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button disabled={isImageUploading} type="submit">
          Next Step
        </Button>
      </div>
    </form>
  );
};

export default AddressDetails;
