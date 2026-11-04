import Form from '@/components/Form';

export default function SignupStep3Password({
  loading,
  onSubmit,
  initialValues,
  fields,
}: any) {
  return (
    <div className="flex flex-col gap-8 w-full">
      <Form
        isSignup={true}
        fields={fields}
        onSubmit={onSubmit}
        width="w-full"
        className="!max-w-[500px] pt-4"
        button={{
          label: loading ? 'Loading...' : 'Confirm',
          variant: 'formButton',
        }}
        extraText=""
        initialValues={initialValues}
      />

      <div className="flex items-start w-full max-w-[500px] mx-auto">
        <div className="flex flex-col gap-2 text-[var(--fg)] font-normal font-16 leading-[100%]">
          <p className="text-left">Passwords should have:</p>
          <ul className="list-disc pl-8 flex flex-col gap-2">
            <li>Minimum length at 8 characters</li>
            <li>At least one uppercase character is required</li>
            <li>At least one lowercase character is required</li>
            <li>Number character(s) is required</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
