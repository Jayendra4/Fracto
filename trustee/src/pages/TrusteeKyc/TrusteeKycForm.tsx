import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { KYC_STORAGE_KEY } from '@/utils/constants';
import PanDetails from './PanDetails';
import OccupationDetails from './OccupationDetails';
import AddressDetails from './AddressDetails';
import FinalKycStep from './FinalKycStep';
import { useCurrentAdmin } from '@/hooks/redux';
import { useCreateKycMutation } from '@/store/api/kycApi';
import { useUpdateAdminProfileMutation } from '@/store/api/adminApi';
import { buildKycPayload } from '@/utils/buildKycPayload';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const steps = ['asset', 'ownership', 'financial', 'review'] as const;
const TrusteeKycForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [formKey, setFormKey] = useState(0);
  const [createKyc, { isLoading, isError, error, data }] = useCreateKycMutation();
  const [updateProfile] = useUpdateAdminProfileMutation();
  const adminDetail = useCurrentAdmin();

  const next = (data?: any) => {
    if (data) {
      setFormData((prev: any) => ({ ...prev, ...data }));
    }
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const back = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const resetForm = () => {
    localStorage.removeItem(KYC_STORAGE_KEY);
    setFormData({});
    setCurrentStep(0);
    setFormKey((k) => k + 1);
  };

  const submitFinal = async (finalStepData: any) => {
    try {
      const payload = buildKycPayload({
        adminDetail,
        formData,
        finalStepData,
      });
      await createKyc(payload).unwrap();

      // Sync pan/dob into account meta so profile page can display them
      try {
        await updateProfile({
          firstname: adminDetail?.firstname ?? '',
          lastname: adminDetail?.lastname ?? '',
          email: adminDetail?.email ?? '',
          pan: formData.panNumber ?? '',
          dateOfBirth: formData.dateOfBirth ?? '',
          occupation: formData.occupation ?? '',
          monthlyIncome: formData.monthlyIncome ?? '',
          meta: {
            panNumber: formData.panNumber ?? '',
            dateOfBirth: formData.dateOfBirth ?? '',
            passportNumber: formData.passportNumber ?? null,
            occupation: formData.occupation ?? '',
            monthlyIncome: formData.monthlyIncome ?? '',
          },
        }).unwrap();
      } catch (metaErr) {
        console.warn('Meta sync failed (non-critical):', metaErr);
      }

      toast.success('Kyc request successful!');
      resetForm();
      window.location.reload();
    } catch (err) {
      console.error('Create kyc failed', err);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-5 mb-8">
        <div className="flex gap-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`px-4 py-2 rounded ${
                index === currentStep ? 'bg-primary text-white' : 'bg-muted'
              }`}
            >
              Step {index + 1}
            </div>
          ))}
        </div>

        <Button variant="destructive" size="sm" onClick={resetForm}>
          <Trash2 className="mr-2 h-4 w-4" />
          Reset Form
        </Button>
      </div>
      {error && (
        <ErrorBanner
          type="error"
          title="Kyc Failed"
          message={(error as any)?.data?.message || 'Invalid email or password'}
        />
      )}

      {currentStep === 0 && <PanDetails key={formKey} onNext={next} />}
      {currentStep === 1 && <OccupationDetails key={formKey} onNext={next} onBack={back} />}
      {currentStep === 2 && <AddressDetails key={formKey} onNext={next} onBack={back} />}
      {currentStep === 3 && (
        <FinalKycStep key={formKey} onBack={back} onSubmitFinal={submitFinal} />
      )}
    </>
  );
};

export default TrusteeKycForm;
