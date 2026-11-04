import React, { useState } from 'react';
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
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useRegisterInvestorMutation } from '@/store/api/accountsApi';

const COUNTRIES = [
  { id: 1, name: 'India', dialCode: '+91' },
  { id: 2, name: 'UAE', dialCode: '+971' },
];

const investorSchema = z.object({
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  mobile: z.string().min(8, 'Mobile number is required'),
  countryId: z.number(),
  dialCode: z.string(),
  accountType: z.enum(['Company', 'Developer', 'Spv', 'Trustee', 'AssetOwner']),
});

type InvestorFormData = z.infer<typeof investorSchema>;

const CreateInvestor = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InvestorFormData>({
    resolver: zodResolver(investorSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      mobile: '',
      countryId: 1,
      dialCode: '+91',
      accountType: 'AssetOwner',
    },
  });

  const [registerInvestor, { isLoading, error }] = useRegisterInvestorMutation();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleCountryChange = (value: string) => {
    const country = COUNTRIES.find((c) => c.id === Number(value));
    if (!country) return;

    setValue('countryId', country.id);
    setValue('dialCode', country.dialCode);
  };

  const onSubmit = async (data: InvestorFormData) => {
    try {
      const payload = {
        ...data,
        mobile: data?.dialCode + data.mobile.trim(),
        email: data.email.toLowerCase(),
      };

      await registerInvestor(payload).unwrap();

      // success redirect
      navigate(-1);
    } catch (err) {
      console.error('Register User Failed:', err);
    }
  };
  return (
    <div className="space-y-8 xl:max-w-[80%]">
      <div className="flex items-center gap-5 mb-4">
        <BackButton />
        <h2 className="text-2xl font-bold">Add User</h2>
      </div>
      {error && (
        <ErrorBanner
          type="error"
          title="Error Creating User"
          message={(error as any)?.data?.message || 'Something Went Wrong'}
        />
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-10 gap-y-6">
          {/* First Name */}
          <div className="space-y-2">
            <Label>First Name</Label>
            <Input {...register('firstname')} />
            {errors.firstname && (
              <p className="text-sm text-destructive">{errors.firstname.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label>Last Name</Label>
            <Input {...register('lastname')} />
            {errors.lastname && (
              <p className="text-sm text-destructive">{errors.lastname.message}</p>
            )}
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label>Country</Label>
            <Select defaultValue="1" onValueChange={handleCountryChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">India</SelectItem>
                <SelectItem value="2">UAE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dial Code + Mobile */}
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Dial Code</Label>
              <Input {...register('dialCode')} disabled />
            </div>

            <div className="col-span-3 space-y-2">
              <Label>Mobile Number</Label>
              <Input {...register('mobile')} maxLength={14} />
              {errors.mobile && <p className="text-sm text-destructive">{errors.mobile.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} {...register('password')} />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
        </div>

        <Button disabled={isLoading} className="my-5" type="submit">
          Add User
        </Button>
      </form>
      <Button onClick={() => navigate('/create-investor/kyc/23')}>Temp KYC Button</Button>
    </div>
  );
};

export default CreateInvestor;
