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
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { validateRequiredDocuments } from '@/utils/helper';

export const valuationSchema = z.object({
  marketValue: z.string().min(1, 'Market Value is required'),

  currency: z.enum(['INR', 'USD', 'EUR', 'AED'], {
    errorMap: () => ({ message: 'Currency is required' }),
  }),

  valuationAgencyName: z
    .string()
    .min(3, 'Minimum 3 characters required')
    .max(100, 'Maximum 100 characters allowed'),

  valuationReportDate: z
    .string()
    .refine((v) => !v || new Date(v) <= new Date(), 'Date cannot be in the future'),

  lastPurchasePrice: z.string().optional(),

  rentalIncomeMonthly: z.string().min(1, 'Rental Income Monthly is required'),

  leaseTenureRemainingMonths: z.number().min(0, 'Lease tenure cannot be negative'),

  last3YearRevenue: z.string().min(1, 'Last 3 Year Revenue is required'),

  operationalExpensesAnnual: z.string().optional(),

  netOperationalIncome: z.string().optional(),

  expectedYieldPercentage: z.string().optional(),

  expectedAppreciationPercentage: z.string().optional(),
  financials: z.string().min(1, 'Please select Financial type'),
  valuationDocuments: documentsSchema,
});

export type ValuationFormData = z.infer<typeof valuationSchema>;

type Documents = z.infer<typeof documentsSchema>;

const ValuationStep = ({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: (data: ValuationFormData) => void;
}) => {
  const [docError, setDocError] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ValuationFormData>({
    resolver: zodResolver(valuationSchema),
  });
  const [valuationDocuments, setValuationDocuments] = useState<Documents>([
    {
      id: 'registeredValuationReport',
      label: 'Registered Valuation Report',
      documentType: 'REGISTERED_VALUATION_REPORT',
      required: true,
      documentName: '',
      documentUrl: '',
    },

    {
      id: 'rentalAgreement',
      label: 'Rental Agreement',
      helperText: '(If Leased)',
      required: true,
      documentName: '',
      documentType: 'RENTAL_AGREEMENT',
      documentUrl: '',
    },

    {
      id: 'rentLedger',
      label: 'Rent Ledger',
      helperText: '(Last 12 Months)',
      required: true,
      documentName: '',
      documentType: 'RENT_LEDGER',
      documentUrl: '',
    },

    {
      id: 'projectedCashFlow',
      label: 'Projected Cash Flow Statement',
      required: true,
      documentName: '',
      documentType: 'PROJECTED_CASH_FLOW',
      documentUrl: '',
    },

    {
      id: 'financials',
      label: 'Financials',
      type: 'radio-image',
      helperText: '(if business asset)',
      required: true,
      documentName: '',
      documentType: 'FINANCIALS',
      documentUrl: '',
      options: [
        { label: 'P&L', value: 'pl' },
        { label: 'Balance Sheet', value: 'balanceSheet' },
        { label: 'GST Filings', value: 'gstFilings' },
        { label: 'Bank Statements', value: 'bankStatements' },
      ],
      validation: {
        required: 'Please select a Financials document type',
      },
    },
  ]);

  const onSubmit = (data: ValuationFormData) => {
    const { isValid } = validateRequiredDocuments(valuationDocuments);

    if (!isValid) {
      setDocError('Please upload required documents');
      return;
    }

    setDocError(null);
    onNext({ ...data, valuationDocuments });
  };

  useEffect(() => {
    const saved = localStorage.getItem(RWA_STORAGE_KEY);
    if (!saved) return;

    const parsed = JSON.parse(saved);

    if (parsed.valuationInfo) {
      reset(parsed.valuationInfo);
    }
    if (parsed.valuationDocuments) {
      setValuationDocuments(parsed.valuationDocuments);
    }
  }, [reset]);

  useEffect(() => {
    const subscription = watch((value) => {
      const saved = JSON.parse(localStorage.getItem(RWA_STORAGE_KEY) || '{}');
      localStorage.setItem(
        RWA_STORAGE_KEY,
        JSON.stringify({
          ...saved,
          valuationInfo: value,
        })
      );
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const handleDocumentChange = (url: string, docId: string) => {
    setValuationDocuments((prev: any[]) => {
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
          valuationDocuments: updatedDocuments,
        })
      );
      setDocError(null);
      return updatedDocuments;
    });
  };

  const handleRemoveDoc = (docId: string) => {
    setValuationDocuments((prev: any[]) => {
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
          valuationDocuments: updatedDocuments,
        })
      );

      return updatedDocuments;
    });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      <h2 className="text-xl font-bold">Step 3 – Financial & Valuation Details</h2>

      {/* ================= BASIC ================= */}
      <div className="grid grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label required>Market Value</Label>
          <Input {...register('marketValue')} />
          {errors.marketValue && (
            <p className="text-sm text-destructive">{errors.marketValue.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label required>Currency</Label>
          <CustomSelect {...register('currency')} defaultValue="">
            <option value="" disabled>
              Select Currency
            </option>
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="AED">AED</option>
          </CustomSelect>
          {errors.currency && <p className="text-sm text-destructive">{errors.currency.message}</p>}
        </div>

        <div className="col-span-2 space-y-2">
          <Label required>Valuation Agency Name</Label>
          <Input {...register('valuationAgencyName')} />
          {errors.valuationAgencyName && (
            <p className="text-sm text-destructive">{errors.valuationAgencyName.message}</p>
          )}
        </div>
      </div>

      {/* ================= DATES ================= */}
      <div className="grid grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label required>Valuation Report Date</Label>
          <Input type="date" {...register('valuationReportDate')} />
          {errors.valuationReportDate && (
            <p className="text-sm text-destructive">{errors.valuationReportDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label required>Last Purchase Price (Optional)</Label>
          <Input {...register('lastPurchasePrice')} />
        </div>
      </div>

      {/* ================= INCOME ================= */}
      <div className="grid grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label required>Rental Income (Monthly)</Label>
          <Input {...register('rentalIncomeMonthly')} />
          {errors.rentalIncomeMonthly && (
            <p className="text-sm text-destructive">{errors.rentalIncomeMonthly.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label required>Lease Tenure Remaining (Months)</Label>
          <Input
            type="number"
            {...register('leaseTenureRemainingMonths', {
              valueAsNumber: true,
            })}
          />
          {errors.leaseTenureRemainingMonths && (
            <p className="text-sm text-destructive">{errors.leaseTenureRemainingMonths.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label required>Last 3 Year Revenue</Label>
          <Input {...register('last3YearRevenue')} />
          {errors.last3YearRevenue && (
            <p className="text-sm text-destructive">{errors.last3YearRevenue.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Operational Expenses (Annual)</Label>
          <Input {...register('operationalExpensesAnnual')} />
        </div>
      </div>

      {/* ================= RETURNS ================= */}
      <div className="grid grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label>Net Operational Income</Label>
          <Input {...register('netOperationalIncome')} />
        </div>

        <div className="space-y-2">
          <Label>Expected Yield (%)</Label>
          <Input {...register('expectedYieldPercentage')} />
        </div>

        <div className="space-y-2">
          <Label>Expected Appreciation (%)</Label>
          <Input {...register('expectedAppreciationPercentage')} />
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold">Documents</h2>

        <div className="grid grid-cols-3 gap-6">
          {valuationDocuments.map((doc) => {
            return (
              <div className="col-span-1">
                <div className={`${doc.id !== 'financials' ? 'hidden' : ''}`}>
                  <Label required>Financials</Label>
                  <div className="flex gap-6 mt-2">
                    {['pl', 'balanceSheet', 'gstFilings', 'bankStatements'].map((opt) => (
                      <label key={opt} className="flex gap-2 items-center">
                        <input type="radio" value={opt} {...register('financials')} />
                        {opt.toUpperCase()}
                      </label>
                    ))}
                  </div>
                  {errors.financials && (
                    <p className="text-sm text-destructive">{errors.financials.message}</p>
                  )}
                </div>

                <UploadImage
                  key={doc.id}
                  required={doc.id !== 'financials' ? doc.required : false}
                  removeDoc={() => handleRemoveDoc(doc.id)}
                  value={doc.documentUrl}
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
          Next Step
        </Button>
      </div>
    </form>
  );
};

export default ValuationStep;
// {
//   id: 'financials',
//   label: 'Financials',
//   type: 'radio-image',
//   helperText: '(if business asset)',
//   required: true,
//   documentName: '',
//   documentType: 'FINANCIALS',
//   documentUrl: '',
//   options: [
//     { label: 'P&L', value: 'pl' },
//     { label: 'Balance Sheet', value: 'balanceSheet' },
//     { label: 'GST Filings', value: 'gstFilings' },
//     { label: 'Bank Statements', value: 'bankStatements' },
//   ],
//   validation: {
//     required: 'Please select a Financials document type',
//   },
// },
