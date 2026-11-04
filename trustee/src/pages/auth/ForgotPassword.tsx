import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ArrowLeft, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { OtpInput } from '@/components/ui/otpInput';
import { useForgotPasswordMutation, useResetPasswordMutation, useGetCountriesQuery } from '@/store/api/authApi';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const step1Schema = z.object({
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    mobile: z.string().min(8, 'Invalid mobile number').optional().or(z.literal('')),
    dialCode: z.string().optional(),
}).refine(data => data.email || data.mobile, {
    message: "Either email or mobile is required",
    path: ["email", "mobile"],
});

const step2Schema = z.object({
    code: z.string().length(6, 'OTP must be 6 digits'),
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Must contain at least one number')
        .regex(/[\W_]/, 'Must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

export function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1);
    const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');

    const [forgotPassword, { isLoading: isForgotLoading, error: forgotError }] = useForgotPasswordMutation();
    const [resetPassword, { isLoading: isResetLoading, error: resetError }] = useResetPasswordMutation();
    const { data: countries } = useGetCountriesQuery();

    const step1Form = useForm<Step1Data>({
        resolver: zodResolver(step1Schema),
        defaultValues: {
            email: '',
            mobile: '',
            dialCode: '+91',
        }
    });

    const step2Form = useForm<Step2Data>({
        resolver: zodResolver(step2Schema),
        defaultValues: {
            code: '',
            newPassword: '',
            confirmPassword: '',
        }
    });

    const onStep1Submit = async (data: Step1Data) => {
        try {
            const payload: any = {};
            if (activeTab === 'email') {
                payload.email = data.email?.toLowerCase();
            } else {
                payload.mobile = (data.dialCode || '') + (data.mobile?.trim() || '');
            }

            await forgotPassword(payload).unwrap();
            toast.success('OTP sent successfully!');
            setStep(2);
        } catch (err) {
            console.error('Forgot password request failed', err);
        }
    };

    const onStep2Submit = async (data: Step2Data) => {
        console.log('Attempting password reset with:', { ...data, code: otp });
        if (otp.length !== 6) {
            setOtpError('Please enter a 6-digit OTP');
            return;
        }

        try {
            const step1Data = step1Form.getValues();
            const payload: any = {
                code: otp,
                newPassword: data.newPassword,
            };

            if (activeTab === 'email') {
                payload.email = step1Data.email?.toLowerCase();
            } else {
                payload.mobile = (step1Data.dialCode || '') + (step1Data.mobile?.trim() || '');
            }

            console.log('Reset password payload:', payload);
            await resetPassword(payload).unwrap();
            toast.success('Password reset successfully!');
            navigate('/login');
        } catch (err) {
            console.error('Reset password request failed', err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => step === 1 ? navigate('/login') : setStep(1)}
                    className="rounded-full"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold">
                    {step === 1 ? 'Forgot Password' : 'Reset Password'}
                </h1>
            </div>

            {(forgotError || resetError) && (
                <ErrorBanner
                    type="error"
                    title="Action Failed"
                    message={(forgotError as any)?.data?.message || (resetError as any)?.data?.message || 'Something went wrong'}
                />
            )}

            {step === 1 ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 px-6">
                        <div
                            onClick={() => setActiveTab('email')}
                            className={`${activeTab === 'email' ? 'border border-[#412D00] text-[#FFB816]' : 'text-white'}  cursor-pointer flex items-center py-2 justify-center gap-2 text-[16px] rounded-[6px]`}
                        >
                            <Mail width={20} /> Email
                        </div>
                        <div
                            onClick={() => setActiveTab('phone')}
                            className={`${activeTab === 'phone' ? 'border border-[#412D00] text-[#FFB816]' : 'text-white'}  cursor-pointer flex items-center py-2 justify-center gap-2 text-[16px] rounded-[6px]`}
                        >
                            <Phone width={20} /> Phone Number
                        </div>
                    </div>

                    <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-4 border border-input p-4 md:p-8 lg:p-12 rounded-[20px]">
                        {activeTab === 'email' ? (
                            <div className="space-y-2">
                                <Label required>Email</Label>
                                <Input {...step1Form.register('email')} placeholder="Enter Email" />
                                {step1Form.formState.errors.email && (
                                    <p className="text-sm text-destructive">{step1Form.formState.errors.email.message}</p>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-6 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label>Dial Code</Label>
                                    <Select
                                        value={step1Form.watch('dialCode')}
                                        onValueChange={(v) => step1Form.setValue('dialCode', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countries?.map((c) => (
                                                <SelectItem key={c.id} value={String(c.dialCode)}>
                                                    {c.flag} ({c.dialCode})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="col-span-4 space-y-2">
                                    <Label required>Mobile</Label>
                                    <Input {...step1Form.register('mobile')} placeholder="Enter Mobile Number" />
                                    {step1Form.formState.errors.mobile && (
                                        <p className="text-sm text-destructive">{step1Form.formState.errors.mobile.message}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <Button type="submit" disabled={isForgotLoading} className="w-full">
                            {isForgotLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send OTP
                        </Button>
                    </form>
                </div>
            ) : (
                <form
                    onSubmit={step2Form.handleSubmit(onStep2Submit, (errs) => console.log('Step 2 Validation Errors:', errs))}
                    className="space-y-4 border border-input p-4 md:p-8 lg:p-12 rounded-[20px]"
                >
                    <div className="space-y-2">
                        <Label required>One-Time Password</Label>
                        <OtpInput value={otp} onChange={(v) => {
                            setOtp(v);
                            setOtpError('');
                            step2Form.setValue('code', v, { shouldValidate: true });
                        }} />
                        {(otpError || step2Form.formState.errors.code) && (
                            <p className="text-sm text-destructive mt-1">
                                {otpError || step2Form.formState.errors.code?.message}
                            </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">
                            Enter the 6-digit code sent to your {activeTab === 'email' ? 'email' : 'mobile'}.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label required>New Password</Label>
                        <div className="relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                {...step2Form.register('newPassword')}
                                placeholder="Enter New Password"
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff /> : <Eye />}
                            </Button>
                        </div>
                        {step2Form.formState.errors.newPassword && (
                            <p className="text-sm text-destructive">{step2Form.formState.errors.newPassword.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label required>Confirm Password</Label>
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            {...step2Form.register('confirmPassword')}
                            placeholder="Confirm New Password"
                        />
                        {step2Form.formState.errors.confirmPassword && (
                            <p className="text-sm text-destructive">{step2Form.formState.errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <Button type="submit" disabled={isResetLoading} className="w-full">
                        {isResetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Reset Password
                    </Button>
                </form>
            )}
        </div>
    );
}
