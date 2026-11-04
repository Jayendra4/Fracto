import {
  // AccountStep,
  KybStep,
  DirectorsOrUserKycStep,
  BankStep,
  RwaStep,
} from '@/components/CompleteProfile';

export default function StepContent(props: any) {
  switch (props.stepKey) {
    // case 'account':
    //   return <AccountStep {...props} />;
    case 'kyb':
      return <KybStep {...props} />;
    case 'directors':
    case 'userKyc':
      return <DirectorsOrUserKycStep {...props} />;
    case 'bank':
      return <BankStep {...props} />;
    case 'rwa':
      return <RwaStep {...props} />;
    default:
      return null;
  }
}
