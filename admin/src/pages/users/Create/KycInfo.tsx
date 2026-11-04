import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router-dom';
import UploadImage from '@/components/common/UploadImage';
import { useSubmitKycMutation } from '@/store/api/kycApi';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { BackButton } from '@/components/common/BackButton';
import DateInput from '@/components/common/DateInput';

/* ---------------------------------- */
/* ZOD SCHEMA */
/* ---------------------------------- */
const kycSchema = z.object({
  panNumber: z
    .string()
    .length(10, 'PAN must be exactly 10 characters')
    .regex(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, 'Invalid PAN format'),
  dob: z.string().min(1, 'Date of birth is required'),
  occupation: z.string().min(1, 'Occupation is required'),
  industry: z.string().min(1, 'Industry is required'),
  monthlyIncome: z.string().min(1, 'Monthly income is required'),
  addressLine1: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  pincode: z.string().min(4, 'Invalid pincode'),

  panDocument: z.any(),
  addressProofType: z.enum(['Bank Statement', 'Utility Bill', 'Aadhar']),
  addressProofFile: z.any(),

  secondaryIdType: z.enum(['Passport', 'Driving License', 'Aadhar', 'Voter ID']).optional(),
  secondaryIdFile: z.any().optional(),
});

type KycFormData = z.infer<typeof kycSchema>;

type Option = {
  label: string;
  value: string;
};

const occupationOptions: Option[] = [
  { label: 'Employed', value: 'employed' },
  { label: 'Self Employed', value: 'self_employed' },
  { label: 'Student', value: 'student' },
  { label: 'Homemaker', value: 'homemaker' },
  { label: 'Retired', value: 'retired' },
];

const industryOptions: Option[] = [
  { label: 'Agriculture', value: 'agriculture' },
  { label: 'Arms and Ammunition', value: 'arms' },
  { label: 'Art and Entertainment', value: 'entertainment' },
  { label: 'Aviation', value: 'aviation' },
  { label: 'Banking & Financial Services', value: 'banking' },
  { label: 'Construction', value: 'construction' },
  { label: 'Education', value: 'education' },
  { label: 'Energy', value: 'energy' },
  { label: 'Food & Beverage', value: 'food' },
];

const incomeOptions: Option[] = [
  { label: '₹25,000 or Less', value: '<25000' },
  { label: '₹25,000 - ₹50,000', value: '25000-50000' },
  { label: '₹50,000 - ₹100,000', value: '50000-100000' },
  { label: '₹100,000 - ₹200,000', value: '100000-200000' },
  { label: '₹200,000 - ₹300,000', value: '200000-300000' },
  { label: '₹300,000 - ₹400,000', value: '300000-400000' },
  { label: '₹400,000 - ₹1,000,000', value: '400000-1000000' },
];

const KycInfo = () => {
  const { id } = useParams(); // investor id
  const navigate = useNavigate();
  const [panUrl, setPanUrl] = React.useState('');
  const [addressProofUrl, setAddressProofUrl] = React.useState('');
  const [secondaryIdUrl, setSecondaryIdUrl] = React.useState('');
  const [submitKyc, { isLoading }] = useSubmitKycMutation();
  const [isImageUploading, setIsImageUploading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<KycFormData>({
    resolver: zodResolver(kycSchema),
  });

  const onSubmit = async (data: KycFormData) => {
    try {
      if (!id) return;

      const payload = {
        panNumber: data.panNumber,
        dob: data.dob,
        occupation: data.occupation,
        monthlyIncome: data.monthlyIncome,
        addressLine1: data.addressLine1,
        city: data.city,
        state: data.state,
        country: data.country,
        pincode: data.pincode,

        documents: [
          {
            type: 'PAN',
            url: panUrl,
          },
          {
            type: data.addressProofType,
            url: addressProofUrl,
          },
          ...(data.secondaryIdType && secondaryIdUrl
            ? [
                {
                  type: data.secondaryIdType,
                  url: secondaryIdUrl,
                },
              ]
            : []),
        ],
      };

      await submitKyc({ id, payload }).unwrap();

      navigate('/investors');
    } catch (error) {
      console.error('KYC submission failed', error);
    }
  };

  return (
    <div className="space-y-8 max-w-[90%]">
      <div className="flex items-center gap-5 mb-4">
        <BackButton />
        <h2 className="text-2xl font-bold">Complete KYC</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* PAN + DOB */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>PAN Number</Label>
            <Input {...register('panNumber')} />
            {errors.panNumber && (
              <p className="text-sm text-destructive">{errors.panNumber.message}</p>
            )}
          </div>
          <DateInput
            label="Date of Birth"
            name="dob"
            register={register}
            error={errors.dob?.message}
            max={new Date().toISOString().split('T')[0]}
          />
          <div className="space-y-2 ">
            <UploadImage
              label="PAN Upload"
              onChange={setPanUrl}
              setIsImageUploading={setIsImageUploading}
            />
          </div>
          <div></div>
        </div>

        {/* Occupation + Income */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Occupation</Label>

            <Select
              onValueChange={(value) => setValue('occupation', value, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select occupation" />
              </SelectTrigger>

              <SelectContent>
                {occupationOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.occupation && (
              <p className="text-sm text-destructive">{errors.occupation.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Industry</Label>

            <Select
              onValueChange={(value) => setValue('industry', value, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>

              <SelectContent>
                {industryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.industry && (
              <p className="text-sm text-destructive">{errors.industry.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Monthly Income</Label>

            <Select
              onValueChange={(value) => setValue('monthlyIncome', value, { shouldValidate: true })}
            >
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

            {errors.monthlyIncome && (
              <p className="text-sm text-destructive">{errors.monthlyIncome.message}</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="space-y-4">
          <Label>Permanent Address</Label>
          <Input {...register('addressLine1')} placeholder="Address line" />

          <div className="grid grid-cols-4 gap-4">
            <Input placeholder="City" {...register('city')} />
            <Input placeholder="State" {...register('state')} />
            <Input placeholder="Country" {...register('country')} />
            <Input placeholder="Pincode" {...register('pincode')} />
          </div>
        </div>

        {/* Documents */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Address Proof Type</Label>
            <Select onValueChange={(v) => setValue('addressProofType', v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select proof" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bank Statement">Bank Statement</SelectItem>
                <SelectItem value="Utility Bill">Utility Bill</SelectItem>
                <SelectItem value="Aadhar">Aadhar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <UploadImage
              label="Address Proof Upload"
              onChange={setAddressProofUrl}
              setIsImageUploading={setIsImageUploading}
            />
          </div>
        </div>

        {/* Secondary ID (Optional) */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Secondary ID Type (Optional)</Label>
            <Select onValueChange={(v) => setValue('secondaryIdType', v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select ID type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Passport">Passport</SelectItem>
                <SelectItem value="Driving License">Driving License</SelectItem>
                <SelectItem value="Aadhar">Aadhar</SelectItem>
                <SelectItem value="Voter ID">Voter ID</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <UploadImage
              label="Secondary ID Upload"
              onChange={setSecondaryIdUrl}
              setIsImageUploading={setIsImageUploading}
            />
          </div>
        </div>

        <Button disabled={isLoading || isImageUploading} type="submit">
          Submit KYC
        </Button>
      </form>
    </div>
  );
};

export default KycInfo;
