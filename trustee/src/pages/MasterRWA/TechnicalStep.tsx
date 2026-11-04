import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CustomSelect } from '@/components/ui/customSelect';
import { z } from 'zod';
import { documentsSchema } from '@/utils/zodSchema';
import UploadImage from '@/components/common/UploadImage';
import { RWA_STORAGE_KEY } from '@/utils/constants';
import { validateRequiredDocuments } from '@/utils/helper';
import { ErrorBanner } from '@/components/common/ErrorBanner';

export const technicalSchema = z.object({
  storeType: z
    .string()
    .min(3, 'Minimum 3 characters required')
    .max(50, 'Maximum 50 characters allowed'),

  brandAffiliation: z.string().min(1, 'Brand Affiliation is required'),
  averageMonthlySales: z.string().min(1, 'Average Monthly Sales is required'),
  footFallData: z.string().refine((v) => Number(v) > 0, 'Footfall must be greater than zero'),
  leaseRentPerMonth: z.string().min(1, 'Lease Rent Per Month is required'),
  staffCount: z.number().min(1, 'Staff count must be at least 1'),
  techDocuments: documentsSchema,
});

type Documents = z.infer<typeof documentsSchema>;
export type TechnicalFormData = z.infer<typeof technicalSchema>;

const TechnicalStep = ({
  onBack,
  onSubmitFinal,
}: {
  onBack: () => void;
  onSubmitFinal: (data: TechnicalFormData) => void | Promise<void>;
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TechnicalFormData>({
    resolver: zodResolver(technicalSchema),
  });
  const [docError, setDocError] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState<boolean>(false);
  const [techDocuments, setTechDocuments] = useState<Documents>([
    {
      id: 'franchiseAgreement',
      label: 'Franchise Agreement',
      documentType: 'FRANCHISE_AGREEMENT',
      required: true,
      documentName: '',
      documentUrl: '',
    },

    {
      id: 'businessLicense',
      label: 'Business License',
      helperText: '(If Leased)',
      required: true,
      documentName: '',
      documentType: 'BUSINESS_LICENSE',
      documentUrl: '',
    },

    {
      id: 'gstReturns',
      label: 'GST Returns',
      helperText: '(Last 12 Months)',
      required: true,
      documentName: '',
      documentType: 'GST_RETURNS',
      documentUrl: '',
    },

    {
      id: 'salesReports',
      label: 'Sales Reports',
      required: true,
      documentName: '',
      documentType: 'SALES_REPORTS',
      documentUrl: '',
    },
  ]);

  const onSubmit = async (data: TechnicalFormData) => {
    const { isValid } = validateRequiredDocuments(techDocuments);

    if (!isValid) {
      setDocError('Please upload required documents');
      return;
    }

    setDocError(null);
    await onSubmitFinal({ ...data, techDocuments });
  };

  useEffect(() => {
    const saved = localStorage.getItem(RWA_STORAGE_KEY);
    if (!saved) return;

    const parsed = JSON.parse(saved);
    if (parsed.technicalInfo) {
      reset(parsed.technicalInfo);
    }
    if (parsed.techDocuments) {
      setTechDocuments(parsed.techDocuments);
    }
    reset(parsed.technicalInfo);
  }, [reset]);

  useEffect(() => {
    const subscription = watch((value) => {
      const saved = JSON.parse(localStorage.getItem(RWA_STORAGE_KEY) || '{}');
      localStorage.setItem(
        RWA_STORAGE_KEY,
        JSON.stringify({
          ...saved,
          technicalInfo: value,
        })
      );
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const handleDocumentChange = (url: string, docId: string) => {
    setTechDocuments((prev: any[]) => {
      const index = prev.findIndex((d) => d.id === docId);

      const newDoc = {
        documentName: url.split('/').pop() || docId,
        documentUrl: url,
        remarks: '',
      };

      let updatedDocuments: any[];

      if (index !== -1) {
        updatedDocuments = [...prev];
        updatedDocuments[index] = {
          ...updatedDocuments[index],
          ...newDoc,
        };
      } else {
        updatedDocuments = [...prev, newDoc];
      }

      const saved = JSON.parse(localStorage.getItem(RWA_STORAGE_KEY) || '{}');

      localStorage.setItem(
        RWA_STORAGE_KEY,
        JSON.stringify({
          ...saved,
          techDocuments: updatedDocuments,
        })
      );
      setDocError(null);
      return updatedDocuments;
    });
  };

  const handleRemoveDoc = (docId: string) => {
    setTechDocuments((prev: any[]) => {
      const index = prev.findIndex((d) => d.id === docId);

      const newDoc = {
        documentName: '',
        documentUrl: '',
        remarks: '',
      };

      let updatedDocuments: any[];

      if (index !== -1) {
        updatedDocuments = [...prev];
        updatedDocuments[index] = {
          ...updatedDocuments[index],
          ...newDoc,
        };
      } else {
        updatedDocuments = [...prev, newDoc];
      }

      const saved = JSON.parse(localStorage.getItem(RWA_STORAGE_KEY) || '{}');

      localStorage.setItem(
        RWA_STORAGE_KEY,
        JSON.stringify({
          ...saved,
          techDocuments: updatedDocuments,
        })
      );

      return updatedDocuments;
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      <h2 className="text-xl font-bold">Step 4 – Engineering / Technical Details</h2>

      {/* ================= BASIC ================= */}
      <div className="grid grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label>Store Type</Label>
          <Input {...register('storeType')} />
          {errors.storeType && (
            <p className="text-sm text-destructive">{errors.storeType.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Brand Affiliation</Label>
          <CustomSelect {...register('brandAffiliation')} defaultValue="">
            <option value="" disabled>
              Select Brand Affiliation
            </option>
            <option value="brand_a">Brand A</option>
            <option value="brand_b">Brand B</option>
            <option value="brand_c">Brand C</option>
            <option value="independent">Independent</option>
          </CustomSelect>
          {errors.brandAffiliation && (
            <p className="text-sm text-destructive">{errors.brandAffiliation.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Average Monthly Sales</Label>
          <Input {...register('averageMonthlySales')} />
          {errors.averageMonthlySales && (
            <p className="text-sm text-destructive">{errors.averageMonthlySales.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Foot Fall Data</Label>
          <Input {...register('footFallData')} />
          {errors.footFallData && (
            <p className="text-sm text-destructive">{errors.footFallData.message}</p>
          )}
        </div>
      </div>

      {/* ================= FINANCIAL ================= */}
      <div className="grid grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label>Lease Rent Per Month</Label>
          <Input {...register('leaseRentPerMonth')} />
          {errors.leaseRentPerMonth && (
            <p className="text-sm text-destructive">{errors.leaseRentPerMonth.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Staff Count</Label>
          <Input type="number" {...register('staffCount', { valueAsNumber: true })} />
          {errors.staffCount && (
            <p className="text-sm text-destructive">{errors.staffCount.message}</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold">Documents</h2>

        <div className="grid grid-cols-3 gap-6">
          {techDocuments.map((doc) => {
            return (
              <div className="col-span-1">
                <UploadImage
                  key={doc.id}
                  removeDoc={() => handleRemoveDoc(doc.id)}
                  value={doc.documentUrl}
                  required={doc.required}
                  label={`${doc.label} ${doc.helperText ?? ''}`}
                  onChange={(url) => {
                    handleDocumentChange(url, doc.id);
                  }}
                  setIsImageUploading={setIsImageUploading}
                />
              </div>
            );
          })}
        </div>
      </div>
      {docError && <ErrorBanner type="error" title="Submission Failed" message={docError} />}
      {/* ================= ACTIONS ================= */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button disabled={isImageUploading} type="submit">
          Submit Asset
        </Button>
      </div>
    </form>
  );
};

export default TechnicalStep;
