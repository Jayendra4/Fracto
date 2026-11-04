import Form from '@/components/Form';

export default function SignupStep1({
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
        label: loading ? 'Loading...' : 'Submit',
        variant: 'formButton',
      }}
      extraText=""
      initialValues={initialValues}
      className='!max-w-[500px]'
    />
  );
}
