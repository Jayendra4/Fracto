import Form from '@/components/Form';

export default function SignupStep4OTP({
  loading,
  onSubmit,
  initialValues,
  fields,
  emailMask,
  mobileMask,
  emailResendPayload,
  mobileResendPayload,
  otpSentKey,
  autoFocus,
}: any) {
  return (
    <Form
      fields={fields}
      onSubmit={onSubmit}
      emailMask={emailMask}
      mobileMask={mobileMask}
      emailResendPayload={emailResendPayload}
      mobileResendPayload={mobileResendPayload}
      otpSentKey={otpSentKey}
      autoFocus={autoFocus}
      isSignup
      width="w-full"
      button={{
        label: loading ? 'Loading...' : 'Let’s Go!',
        variant: 'formButton',
      }}
      extraText=""
      initialValues={initialValues}
      className="!max-w-[500px]"
    />
  );
}
