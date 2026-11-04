import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CustomSelect } from '@/components/ui/customSelect';
import UploadImage from '@/components/common/UploadImage';
import { documentsSchema } from '@/utils/zodSchema';
import { RWA_STORAGE_KEY } from '@/utils/constants';
import { validateRequiredDocuments } from '@/utils/helper';
import { ErrorBanner } from '@/components/common/ErrorBanner';

const ownershipSchema = z.object({
  ownershipModel: z.string().min(1, 'Ownership Model is required'),
  ownershipEntityType: z.string().min(1, 'Ownership Entity Type is required'),

  encumbranceDetails: z.string().optional(),
  propertySurveyKhasraNumber: z.string().max(50).optional(),

  currentOwnerName: z
    .string()
    .min(2, 'Minimum 2 characters required')
    .max(100, 'Maximum 100 characters allowed'),

  titleStatus: z.string().min(1, 'Title Status is required'),

  reraRegistrationNumber: z
    .string()
    .min(5, 'Minimum 5 characters required')
    .max(50, 'Maximum 50 characters allowed'),

  landArea: z.string().refine((v) => parseFloat(v) > 0, 'Land area must be greater than 0'),

  builtupArea: z.string().refine((v) => parseFloat(v) > 0, 'Builtup area must be greater than 0'),

  yearOfConstruction: z.number().min(1800).max(new Date().getFullYear()),

  assetAge: z.number().min(0).max(500).optional(),
  noc: z.string().min(1, 'Please select NOC type'),
  documents: documentsSchema,
});

type OwnershipFormData = z.infer<typeof ownershipSchema>;

type Documents = z.infer<typeof documentsSchema>;

const OwnershipStep = ({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: (data: OwnershipFormData) => void;
}) => {
  const [documents, setDocuments] = useState<Documents>([
    {
      id: 'registeredTitleDeed',
      label: 'Registered Title Deed / Sale Deed',
      documentType: 'REGISTERED_TITLE_DEED',
      required: true,
      documentName: '',
      documentUrl: '',
    },

    {
      id: 'encumbranceCertificate',
      label: 'Encumbrance Certificate',
      helperText: '(EC)',
      required: true,
      documentName: '',
      documentType: 'EC',
      documentUrl: '',
    },

    {
      id: 'propertyTaxReceipts',
      label: 'Property Tax Receipts',
      helperText: '(Last 2 yrs)',
      required: true,
      documentName: '',
      documentType: 'PROPERTY_TAX_RECEIPTS',
      documentUrl: '',
    },

    {
      id: 'mutationRecords',
      label: 'Mutation Records',
      required: true,
      documentName: '',
      documentType: 'MUTATION_RECORDS',
      documentUrl: '',
    },

    {
      id: 'ownershipChainDocs',
      label: 'Ownership Chain Documents',
      helperText: '(Last 15 yrs if possible)',
      required: true,
      documentName: '',
      documentType: 'OWNERSHIP_CHAIN_DOCUMENTS',
      documentUrl: '',
    },

    {
      id: 'reraRegistrationCert',
      label: 'RERA Registration Certificate',
      helperText: '(if applicable)',
      required: false,
      documentName: '',
      documentType: 'RERA_CERTIFICATE',
      documentUrl: '',
    },

    {
      id: 'occupancyCertificate',
      label: 'Occupancy Certificate',
      helperText: '(OC)',
      required: true,
      documentName: '',
      documentType: 'OCCUPANCY_CERTIFICATE',
      documentUrl: '',
    },

    {
      id: 'completionCertificate',
      label: 'Completion Certificate',
      helperText: '(CC)',
      required: true,
      documentName: '',
      documentType: 'COMPLETION_CERTIFICATE',
      documentUrl: '',
    },

    {
      id: 'electricityBill',
      label: 'Latest Electricity Bill',
      helperText: '(For address verification)',
      required: true,
      documentName: '',
      documentType: 'ELECTRICITY_BILL',
      documentUrl: '',
    },

    {
      id: 'noc',
      label: 'NOCs',
      type: 'radio-image',
      required: true,
      documentName: '',
      documentType: 'NOC_DOCUMENT',
      documentUrl: '',
      options: [
        { label: 'Society NOC', value: 'society' },
        { label: 'Builder NOC', value: 'builder' },
        { label: 'Fire NOC (for commercial)', value: 'fire' },
        { label: 'Environmental NOC (if required)', value: 'environmental' },
      ],
      validation: {
        required: 'Please select NOC type',
      },
    },
  ]);
  const [docError, setDocError] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<OwnershipFormData>({
    resolver: zodResolver(ownershipSchema),
  });

  const onSubmit = (data: OwnershipFormData) => {
    const { isValid } = validateRequiredDocuments(documents);

    if (!isValid) {
      setDocError('Please upload required documents');
      return;
    }

    setDocError(null);
    onNext({ ...data, documents });
  };

  useEffect(() => {
    const saved = localStorage.getItem(RWA_STORAGE_KEY);
    if (!saved) return;

    const parsed = JSON.parse(saved);

    if (parsed.ownershipInfo) {
      reset(parsed.ownershipInfo);
    }

    if (parsed.documents) {
      setDocuments(parsed.documents);
    }
  }, [reset]);

  useEffect(() => {
    const subscription = watch((value) => {
      const saved = JSON.parse(localStorage.getItem(RWA_STORAGE_KEY) || '{}');

      localStorage.setItem(
        RWA_STORAGE_KEY,
        JSON.stringify({
          ...saved,
          ownershipInfo: value,
        })
      );
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  const handleDocumentChange = (url: string, docId: string) => {
    setDocuments((prev: any[]) => {
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
          documents: updatedDocuments,
        })
      );
      setDocError(null);
      return updatedDocuments;
    });
  };

  const handleRemoveDoc = (docId: string) => {
    setDocuments((prev: any[]) => {
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
          documents: updatedDocuments,
        })
      );

      return updatedDocuments;
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 150 }, (_, i) => currentYear - i);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      <h2 className="text-xl font-bold">Step 2 – Ownership & Title Details</h2>

      {/* ================= OWNERSHIP ================= */}
      <div className="grid grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label required>Ownership Model</Label>
          <CustomSelect {...register('ownershipModel')} defaultValue="">
            <option value="" disabled>
              Select Ownership Model
            </option>
            <option value="DeveloperOwned">Developer Owned</option>
            <option value="SPVOwned">SPV Owned</option>
            <option value="PlatformOwned">Platform Owned</option>
            <option value="SingleOwner">Single Owner</option>
            <option value="Leasehold">Leasehold</option>
            <option value="Freehold">Freehold</option>
          </CustomSelect>
          {errors.ownershipModel && (
            <p className="text-sm text-destructive">{errors.ownershipModel.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label required>Ownership Entity Type</Label>

          <CustomSelect {...register('ownershipEntityType')} defaultValue="">
            <option value="" disabled>
              Select Ownership Entity Type
            </option>
            <option value="individual">Individual</option>
            <option value="company">Company</option>
            <option value="trust">Trust</option>
            <option value="partnership">Partnership</option>
            <option value="government">Government</option>
          </CustomSelect>
          {errors.ownershipEntityType && (
            <p className="text-sm text-destructive">{errors.ownershipEntityType.message}</p>
          )}
        </div>

        <div className="col-span-2 space-y-2">
          <Label required>Current Owner Name</Label>
          <Input {...register('currentOwnerName')} />
          {errors.currentOwnerName && (
            <p className="text-sm text-destructive">{errors.currentOwnerName.message}</p>
          )}
        </div>
      </div>

      {/* ================= TITLE & LEGAL ================= */}
      <div className="grid grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label required>Title Status</Label>
          <CustomSelect {...register('titleStatus')} defaultValue="">
            <option value="" disabled>
              Select Title Status
            </option>
            <option value="clear">Clear Title</option>
            <option value="disputed">Disputed</option>
            <option value="litigation">Under Litigation</option>
            <option value="others">Others</option>
          </CustomSelect>
          {errors.titleStatus && (
            <p className="text-sm text-destructive">{errors.titleStatus.message}</p>
          )}
        </div>

        <div className="space-y-2 col-span-3">
          <Label required>RERA Registration Number</Label>
          <Input {...register('reraRegistrationNumber')} />
          {errors.reraRegistrationNumber && (
            <p className="text-sm text-destructive">{errors.reraRegistrationNumber.message}</p>
          )}
        </div>
      </div>

      {/* ================= LAND DETAILS ================= */}
      <div className="grid grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label required>Land Area (Sq.ft / Meter)</Label>
          <Input {...register('landArea')} />
          {errors.landArea && <p className="text-sm text-destructive">{errors.landArea.message}</p>}
        </div>

        <div className="space-y-2">
          <Label required>Builtup Area (Sq.ft / Meter)</Label>
          <Input {...register('builtupArea')} />
          {errors.builtupArea && (
            <p className="text-sm text-destructive">{errors.builtupArea.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Year of Construction</Label>
          <CustomSelect
            {...register('yearOfConstruction', {
              valueAsNumber: true,
              required: 'Year is required',
            })}
            className="w-full border rounded-md px-3 py-2 bg-background"
          >
            <option value="">Select year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </CustomSelect>
          {errors.yearOfConstruction && (
            <p className="text-sm text-destructive">{errors.yearOfConstruction.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Asset Age (Optional)</Label>
          <Input type="number" {...register('assetAge', { valueAsNumber: true })} />
          {errors.assetAge && <p className="text-sm text-destructive">{errors.assetAge.message}</p>}
        </div>
      </div>

      {/* ================= OPTIONAL ================= */}
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-2 space-y-2">
          <Label>Encumbrance Details (Optional)</Label>
          <Input {...register('encumbranceDetails')} />
          {errors.encumbranceDetails && (
            <p className="text-sm text-destructive">{errors.encumbranceDetails.message}</p>
          )}
        </div>

        <div className="col-span-2 space-y-2">
          <Label>Property Survey / Khasra No. (Optional)</Label>
          <Input {...register('propertySurveyKhasraNumber')} />
          {errors.propertySurveyKhasraNumber && (
            <p className="text-sm text-destructive">{errors.propertySurveyKhasraNumber.message}</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold">Documents</h2>

        <div className="grid grid-cols-3 gap-6">
          {documents.map((doc) => {
            return (
              <div className="col-span-1">
                <div className={`${doc.id !== 'noc' ? 'hidden' : ''}`}>
                  <Label required>NOC Type</Label>
                  <div className="flex gap-6 mt-2">
                    {['society', 'builder', 'fire', 'environmental'].map((opt) => (
                      <label key={opt} className="flex gap-2 items-center">
                        <input type="radio" value={opt} {...register('noc')} />
                        {opt.toUpperCase()}
                      </label>
                    ))}
                  </div>
                  {errors.noc && <p className="text-sm text-destructive">{errors.noc.message}</p>}
                </div>

                <UploadImage
                  key={doc.id}
                  removeDoc={() => handleRemoveDoc(doc.id)}
                  value={doc.documentUrl}
                  required={doc.id !== 'noc' ? doc.required : false}
                  label={doc.id !== 'noc' ? `${doc.label} ${doc.helperText ?? ''}` : ''}
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

export default OwnershipStep;
