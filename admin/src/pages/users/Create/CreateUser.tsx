import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

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

import { useGetCountriesQuery, useRegisterUserMutation } from '@/store/api/accountsApi';
import toast from 'react-hot-toast';

/* -------------------- Schema -------------------- */

const investorSchema = z.object({
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Minimum 6 characters'),
  mobile: z.string().min(8, 'Mobile number is required'),
  countryId: z.number(),
  dialCode: z.string(),
  accountType: z.enum([
    'Company',
    'Developer',
    'Spv',
    'Broker',
    'CorporateInvestor',
    'Trustee',
    'AssetOwner',
    'Director',
  ]),
});

type InvestorFormData = z.infer<typeof investorSchema>;

const accountTypeArr: InvestorFormData['accountType'][] = [
  'Company',
  'Broker',
  'CorporateInvestor',
  'Trustee',
  'AssetOwner',
  'Director',
];

/* -------------------- Component -------------------- */

const CreateUser = () => {
  const navigate = useNavigate();
  const { userType } = useParams<{ userType: InvestorFormData['accountType'] }>();

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

  const { data: countryList } = useGetCountriesQuery();
  const [registerUser, { isLoading, error }] = useRegisterUserMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState('1');
  const [selectedAccountType, setSelectedAccountType] =
    useState<InvestorFormData['accountType']>('AssetOwner');

  /* -------- Sync userType param -------- */
  useEffect(() => {
    if (userType && accountTypeArr.includes(userType)) {
      setSelectedAccountType(userType);
      setValue('accountType', userType);
    }
  }, [userType, setValue]);

  /* -------- Country change handler -------- */
  const handleCountryChange = (value: string) => {
    const country = countryList?.find((c) => String(c.id) === value);
    if (!country) return;

    setSelectedCountryId(value);
    setValue('countryId', country.id);
    setValue('dialCode', country.dialCode);
  };

  /* -------- Submit -------- */
  const onSubmit = async (data: InvestorFormData) => {
    try {
      const payload = {
        ...data,
        email: data.email.toLowerCase(),
        mobile: data.dialCode + data.mobile.trim(),
      };

      await registerUser(payload).unwrap();
      navigate(-1);
    } catch (error: any) {
      toast.error(error?.data?.message);
      console.error('Update failed', error);
    }
  };

  /* -------------------- UI -------------------- */

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
          message={(error as any)?.data?.message || 'Something went wrong'}
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
            <Select value={selectedCountryId} onValueChange={handleCountryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countryList?.map((country) => (
                  <SelectItem key={country.id} value={String(country.id)}>
                    {country.flag} {country.name} ({country.dialCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* User Type */}
          <div className="space-y-2">
            <Label>User Type</Label>
            <Select
              value={selectedAccountType}
              onValueChange={(value) => {
                setSelectedAccountType(value as InvestorFormData['accountType']);
                setValue('accountType', value as InvestorFormData['accountType']);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                {accountTypeArr.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
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
              <Input {...register('mobile')} />
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
                className="absolute top-0 right-0 h-full"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="my-5">
          Add User
        </Button>
      </form>
    </div>
  );
};

export default CreateUser;
