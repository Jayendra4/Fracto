import { type JSX } from 'react';
import type { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import UserProfile from './UserProfile';
import BrokerProfile from './BrokerProfile';
import { companyRoles } from '@/types/roles';

export default function Profile(): JSX.Element {
  const { role } = useSelector((state: RootState) => state.authLogin);
  const normalizedRole = role?.toLowerCase() || '';

  return (
    <div className="w-full text-white font-work">
      {normalizedRole === 'corporateinvestor' && <UserProfile />}
      {companyRoles.includes(normalizedRole as (typeof companyRoles)[number]) && (
        <UserProfile />
      )}
      {normalizedRole === 'broker' && <BrokerProfile />}
    </div>
  );
}
