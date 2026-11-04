import Form from '@/components/Form';

export default function SignupStep2Form({
  loading,
  onSubmit,
  initialValues,
  fields,
}: any) {
  return (
    <Form
      fields={fields}
      onSubmit={onSubmit}
      width="w-full"
      button={{
        label: loading ? (
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Loading...
          </div>
        ) : (
          'Continue'
        ),
        variant: 'formButton',
      }}
      extraText=""
      initialValues={initialValues}
      className='!max-w-[500px]'
    />
  );
}
