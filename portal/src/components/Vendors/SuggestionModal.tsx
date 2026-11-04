import { useState } from 'react';
import Loader from '@/components/Loader';
import {
  useCreateVendorSuggestion,
  type IVendorSuggestionPayload,
} from '@/api/vendors.api';
import StatusModal from '@/components/Modals/Status';
import Form from '@/components/Form';
import type { IFieldConfig } from '@/interface';
import CommonModal from '@/components/CommonModal';

interface SuggestionModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SuggestionModal({
  open,
  onClose,
}: SuggestionModalProps) {
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    status: 'success' | 'error';
    message?: string;
  }>({ open: false, status: 'success' });

  const { mutate: submitSuggestion, isPending } = useCreateVendorSuggestion();

  const fields: IFieldConfig[] = [
    {
      name: 'vendorName',
      label: 'Vendor Name',
      type: 'text',
      placeholder: 'Enter vendor name',
      validation: {
        required: 'Vendor name is required',
        pattern: {
          value: /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/,
          message:
            'Vendor name can only contain letters and single spaces between words',
        },
      },
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      placeholder: 'Select category',
      options: [
        { label: 'Legal', value: 'Legal' },
        { label: 'Valuation', value: 'Valuation' },
        { label: 'Audit', value: 'Audit' },
        { label: 'Trustee', value: 'Trustee' },
        { label: 'Compliance', value: 'Compliance' },
      ],

      validation: { required: 'Category is required' },
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Brief description of services...',
      rows: 3,
    },
    {
      name: 'website',
      label: 'Website',
      type: 'text',
      placeholder: 'https://example.com',
      validation: {
        pattern: {
          value: /^(https?:\/\/)?([\w\d-]+\.)+[\w\d]{2,}(\/.*)?$/,
          message: 'Please enter a valid website URL',
        },
      },
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'contact@example.com',
      validation: {
        required: 'Email is required',
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: 'Please enter a valid email address',
        },
      },
    },
    {
      name: 'mobile',
      label: 'Mobile',
      type: 'contact',
      placeholder: 'Enter mobile number',
      validation: {
        required: 'Mobile number is required',
        pattern: {
          value: /^(\+91[6-9]\d{9}|\+9715\d{8})$/,
          message: 'Enter a valid +91 or +971 mobile number',
        },
      },
    },
  ];

  const handleFormSubmit = (data: any) => {
    submitSuggestion(data as IVendorSuggestionPayload, {
      onSuccess: () => {
        setStatusModal({
          open: true,
          status: 'success',
          message:
            'Your suggestion has been submitted successfully. It will appear in the list once approved by the admin.',
        });
      },
      onError: () => {
        setStatusModal({
          open: true,
          status: 'error',
          message:
            'Something went wrong while submitting your suggestion. Please try again.',
        });
      },
    });
  };

  const handleStatusClose = () => {
    setStatusModal((prev) => ({ ...prev, open: false }));
    if (statusModal.status === 'success') {
      onClose();
    }
  };

  return (
    <>
      <CommonModal
        isOpen={open}
        onClose={onClose}
        title="Add a Suggestion"
        className="max-w-[600px]"
      >
        <Form
          isVendorSuggestion
          fields={fields}
          onSubmit={handleFormSubmit}
          button={{
            label: isPending ? <Loader /> : 'Submit Suggestion',
            variant: 'formButton',
            disabled: isPending,
          }}
          className="!max-w-[500px] w-full mx-auto"
        />
      </CommonModal>

      <StatusModal
        open={statusModal.open}
        status={statusModal.status}
        message={statusModal.message}
        onClose={handleStatusClose}
        onContinue={handleStatusClose}
      />
    </>
  );
}
