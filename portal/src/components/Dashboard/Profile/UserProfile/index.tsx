import { useMyBankAccounts } from '@/api';
import { useUpdateBankStatus } from '@/api/bank.api';
import BankDetailsCard from './BankDetailsCard';
import AddBankAccountModal from '../../Wallet/AddBankAccountModal';
import { useState } from 'react';
import ProfileHeader from './ProfileHeader';
import ProfileDetails from './ProfileDetails';
// import { useLocalUser } from '@/hooks/useLocalUser';
import KycDocuments from './KycDocuments';
import { useMyUpiAccount, useUpdateUpiStatus } from '@/api/upi.api';
import AddUpiModal from './AddUpiModal';
import UpiDetailsCard from './UpiDetailCard';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { motion } from 'framer-motion';
// import { useOnboarding } from '@/hooks';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function UserProfile() {
  // const user = useLocalUser();
  const user = useSelector((state: RootState) => state.authLogin.user);

  console.log(user, 'user');

  const { data } = useMyBankAccounts();
  const { mutate: updateBankStatus } = useUpdateBankStatus();
  const [openAddBank, setOpenAddBank] = useState(false);
  const { data: upiRes } = useMyUpiAccount();
  const { mutate: updateUpiStatus } = useUpdateUpiStatus();
  const [openAddUpi, setOpenAddUpi] = useState(false);

  const upis = upiRes?.success && Array.isArray(upiRes.data) ? upiRes.data : [];

  const banks = data?.success && Array.isArray(data.data) ? data.data : [];

  // const { role } = useSelector((state: RootState) => state.authLogin);
  const [isEditing, setIsEditing] = useState(false);
  // const { isApproved } = useOnboarding();

  if (!user) {
    return <p className="text-[var(--fg)] p-10">No user data found</p>;
  }

  return (
    <section
      // className={`w-full px-4 md:px-10 text-[var(--fg)] min-h-screen pb-10 ${role === `CorporateInvestor` ? 'pt-20 lg:pt-28' : 'pt-34.5 md:pt-35 lg:pt-44'}`}
      className="w-full px-4 md:px-10 text-[var(--fg)] min-h-screen pb-10 pt-34.5 md:pt-35 lg:pt-44"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1600px] mx-auto space-y-6 mt-4 lg:mt-0"
      >
        <motion.div variants={itemVariants}>
          <ProfileHeader
            user={user ?? null}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <ProfileDetails
            user={user}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />
        </motion.div>
        {/* {!isApproved && ( */}
        <motion.div variants={itemVariants}>
          <KycDocuments
            isDocumentUploaded={user.isDocumentUploaded}
            documents={user.entityDocument}
          />
        </motion.div>
        {/* )} */}
        <motion.div variants={itemVariants}>
          <BankDetailsCard
            banks={banks}
            onAddBank={() => setOpenAddBank(true)}
            onSetActive={(id, isActive) =>
              updateBankStatus({ bankId: id, payload: { isActive } })
            }
            onDelete={(id) =>
              updateBankStatus({ bankId: id, payload: { isDeleted: true } })
            }
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <UpiDetailsCard
            upis={upis}
            onAddUpi={() => setOpenAddUpi(true)}
            onSetActive={(id, isActive) =>
              updateUpiStatus({ upiId: id, payload: { isActive } })
            }
            onDelete={(id) =>
              updateUpiStatus({ upiId: id, payload: { isDeleted: true } })
            }
          />
        </motion.div>
      </motion.div>

      {openAddBank && (
        <AddBankAccountModal
          open={openAddBank}
          onClose={() => setOpenAddBank(false)}
        />
      )}
      {openAddUpi && (
        <AddUpiModal open={openAddUpi} onClose={() => setOpenAddUpi(false)} />
      )}
    </section>
  );
}
