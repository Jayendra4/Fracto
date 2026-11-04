import { type JSX } from 'react';
import Referrals from '@/components/Dashboard/Referrals';

interface MyReferralsTabProps {
  showToast?: (msg: string) => void;
}

export default function MyReferralsTab({ showToast }: MyReferralsTabProps): JSX.Element {
  void showToast;
  return (
    <div className="[&>section]:pt-0! [&>section]:pb-0! [&>section]:mt-0! [&>section]:min-h-0! [&>section]:bg-transparent!">
      <Referrals />
    </div>
  );
}
