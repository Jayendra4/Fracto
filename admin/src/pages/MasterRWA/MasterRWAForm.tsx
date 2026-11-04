import React, { useState } from 'react';
import AssetInfo from './AssetInfo';
import OwnershipStep from './OwnershipStep';
import ValuationStep from './ValuationStep';
// import TechnicalStep from './TechnicalStep';

import { buildAssetPayload } from '@/utils/buildAssetPayload';
import { useCreateAssetMutation } from '@/store/api/masterRwaFormApi';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { RWA_STORAGE_KEY } from '@/utils/constants';
import toast from 'react-hot-toast';

const steps = ['asset', 'ownership', 'financial'] as const;
const MasterRwaForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [formKey, setFormKey] = useState(0);
  const [createAsset] = useCreateAssetMutation();

  const next = (data?: any) => {
    if (data) {
      setFormData((prev: any) => ({ ...prev, ...data }));
    }
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const back = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const resetForm = () => {
    localStorage.removeItem(RWA_STORAGE_KEY);
    setFormData({});
    setCurrentStep(0);
    setFormKey((k) => k + 1);
  };

  const submitFinal = async (valuationData: any) => {
    try {
      const payload = buildAssetPayload({ ...formData, ...valuationData });
      await createAsset(payload).unwrap();
      toast.success('Asset Created successfully!');
      resetForm();
    } catch (error: any) {
      toast.error(error?.data?.message);
      console.error('Create group failed', error);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
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

      {currentStep === 0 && <AssetInfo key={formKey} onNext={next} />}
      {currentStep === 1 && <OwnershipStep key={formKey} onNext={next} onBack={back} />}
      {currentStep === 2 && (
        <ValuationStep key={formKey} onSubmitFinal={submitFinal} onBack={back} />
      )}
      {/* {currentStep === 3 && (
        <TechnicalStep key={formKey} onBack={back} onSubmitFinal={submitFinal} />
      )} */}
    </>
  );
};

export default MasterRwaForm;
