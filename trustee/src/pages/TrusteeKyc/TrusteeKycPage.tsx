import { useEffect, useState } from 'react';

import KycSuccessCard from './KycSuccessCard';
import KycSubmittedCard from './KycSubmittedCard';
import KycRejectedCard from './KycRejectedCard';
import TrusteeKycForm from './TrusteeKycForm';
import { KycRequiredModal } from './KycRequiredModal';

import { KycStatus } from '@/types';
import { useGetAdminProfileQuery } from '@/store/api/adminApi';
import { setAdminProfile } from '@/store/slices/authSlice';
import { useDispatch } from 'react-redux';
import Loader from '@/components/common/Loader';

// export default function TrusteeKycPage() {
//   const { data, isLoading } = useGetAdminProfileQuery(undefined, {
//     refetchOnMountOrArgChange: true,
//     refetchOnFocus: true,
//     refetchOnReconnect: true,
//   });
//   const [openRequired, setOpenRequired] = useState(false);

//   // ✅ Hooks must be at top level
//   useEffect(() => {
//     if (!isLoading && data?.kycStatus === KycStatus.Draft) {
//       setOpenRequired(true);
//     } else {
//       setOpenRequired(false);
//     }
//   }, [data?.kycStatus, isLoading]);

//   if (isLoading) return <div>Loading...</div>;

//   let content: JSX.Element;

//   switch (data?.kycStatus) {
//     case KycStatus.Approved:
//       content = <KycSuccessCard />;
//       break;

//     case KycStatus.Submitted:
//       content = <KycSubmittedCard />;
//       break;

//     case KycStatus.Rejected:
//       content = <KycRejectedCard />;
//       break;

//     case KycStatus.Draft:
//     default:
//       content = <TrusteeKycForm />;
//       break;
//   }

//   return (
//     <>
//       {content}

//       <KycRequiredModal open={openRequired} onClose={() => setOpenRequired(false)} />
//     </>
//   );
// }

export default function TrusteeKycPage() {
  const dispatch = useDispatch();
  const { data, isLoading } = useGetAdminProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [openRequired, setOpenRequired] = useState(false);
  const [forceForm, setForceForm] = useState(false);

  useEffect(() => {
    if (data) {
      dispatch(setAdminProfile(data));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (!isLoading && data?.kycStatus === KycStatus.Draft) {
      setOpenRequired(true);
    } else {
      setOpenRequired(false);
    }
  }, [data?.kycStatus, isLoading]);
  if (isLoading) return <Loader />;

  let content: JSX.Element;

  if (forceForm) {
    content = <TrusteeKycForm />;
  } else {
    switch (data?.kycStatus) {
      case KycStatus.Approved:
        content = <KycSuccessCard />;
        break;

      case KycStatus.Submitted:
        content = <KycSubmittedCard />;
        break;

      case KycStatus.Rejected:
        content = <KycRejectedCard onResubmit={() => setForceForm(true)} />;
        break;

      case KycStatus.Draft:
      default:
        content = <TrusteeKycForm />;
        break;
    }
  }

  return (
    <>
      {content}
      <KycRequiredModal open={openRequired} onClose={() => setOpenRequired(false)} />
    </>
  );
}
