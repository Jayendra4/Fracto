import Form from '@/components/Form';
import type { IFieldConfig } from '@/interface';
import Congrats from '../Congrats';
import { useQueryClient } from '@tanstack/react-query';

export default function BankStep({
  hasBankAccounts,
  bankSubmitted,
  bankLoading,
  submitBankMutation,
  determineInitialStep,
  setCurrentStep,
  isValidStep,
  rwaStep,
  isStepCompleted,
  handleRouteForStep,
}: any) {
  const queryClient = useQueryClient();

  const ACCOUNT_HOLDER_NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
  const ACCOUNT_NUMBER_REGEX = /^[0-9]{6,18}$/;
  const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

  const BANK_FIELDS: IFieldConfig[] = [
    {
      name: 'accountHolderName',
      label: 'Account Holder Name',
      type: 'text',
      placeholder: 'Enter account holder name',
      required: true,
      validation: {
        required: 'Account holder name is required',
        pattern: {
          value: ACCOUNT_HOLDER_NAME_REGEX,
          message: 'Only alphabets allowed, single spaces between words',
        },
        minLength: { value: 3, message: 'Name must be at least 3 characters' },
        maxLength: { value: 100, message: 'Name cannot exceed 100 characters' },
      },
    },
    {
      name: 'bankName',
      label: 'Bank Name',
      type: 'text',
      placeholder: 'Enter bank name',
      required: true,
      validation: {
        required: 'Bank name is required',
        pattern: {
          value: ACCOUNT_HOLDER_NAME_REGEX,
          message: 'Only alphabets allowed, single spaces between words',
        },
        minLength: { value: 3, message: 'Name must be at least 3 characters' },
        maxLength: { value: 100, message: 'Name cannot exceed 100 characters' },
      },
    },
    {
      name: 'accountNumber',
      label: 'Bank Account Number',
      type: 'text',
      placeholder: 'Enter your bank account number',
      required: true,
      validation: {
        required: 'Account number is required',
        pattern: {
          value: ACCOUNT_NUMBER_REGEX,
          message: 'Account number must be 6–18 digits',
        },
      },
    },
    {
      name: 'ifscCode',
      label: 'IFSC Code',
      type: 'text',
      placeholder: 'Enter IFSC code',
      required: true,
      validation: {
        required: 'IFSC code is required',
        pattern: {
          value: IFSC_REGEX,
          message: 'Enter a valid IFSC code (e.g. HDFC0001234)',
        },
      },
    },
  ];

  if (bankSubmitted || hasBankAccounts) {
    return (
      <Congrats
        title="Bank Details"
        highlightText="Your bank details have been submitted."
        showNext={isValidStep(rwaStep) && !isStepCompleted(rwaStep)}
        onNext={() => isValidStep(rwaStep) && handleRouteForStep(rwaStep)}
      />
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4   ">
        <div>
          <h2 className="text-[32px] text-white font-medium">Bank Details</h2>
          <p className="font-normal text-[14px] text-white/50">
            Bank Details have something text.
          </p>
        </div>
      </div>

      <div className="w-full h-[1px] bg-white/10 mb-8" />

      <div className="  md:p-4 lg:p-8 xl:p-10">
        <Form
          fields={BANK_FIELDS}
          onSubmit={async (formData: any) => {
            await submitBankMutation(formData);
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            setCurrentStep(determineInitialStep());
          }}
          width="w-full"
          button={{
            label: bankLoading ? 'Submitting...' : 'Submit',
            variant: 'formButton',
          }}
          initialValues={{}}
        />
      </div>
    </>
  );
}
