import { useState } from 'react';
import { FaBuilding, FaUserTie } from 'react-icons/fa';
import { useUpdateUserType } from '@/api/me.api';
import Button from '@/components/UI/Button';
import Loader from '@/components/Loader';
import Cookies from 'js-cookie';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { updateAuthToken } from '@/redux/slices/authLoginSlice';
import CommonModal from '@/components/CommonModal';

interface RoleSelectionModalProps {
  onSuccess: () => void;
}

export default function RoleSelectionModal({
  onSuccess,
}: RoleSelectionModalProps) {
  // Mounted logging removed

  const [selectedRole, setSelectedRole] = useState<
    'AssetOwner' | 'Company' | null
  >(null);

  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useUpdateUserType();

  const handleConfirm = async () => {
    if (!selectedRole) return;

    try {
      const res = await mutateAsync({ type: selectedRole });

      if (!res.success || !res.data?.accessToken) return;

      Cookies.set('hof_token', res.data.accessToken, {
        secure: true,
        sameSite: 'strict',
      });

      dispatch(updateAuthToken(res.data.accessToken));

      await queryClient.invalidateQueries({ queryKey: ['me'] });
      await queryClient.refetchQueries({ queryKey: ['me'] });

      onSuccess();
    } catch (err) {
      console.error('Failed to update role', err);
    }
  };

  return (
    <CommonModal
      isOpen={true}
      onClose={() => { }}
      hideCloseButton={true}
      className="max-w-[500px] text-center"
    >
      <h2 className="font-30 font-bold text-[var(--fg)] mb-2">
        Choose Your Role
      </h2>
      <p className="text-[var(--fg)]/60 mb-8">
        Please select how you would like to proceed as a business user.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <RoleOption
          icon={<FaUserTie size={32} />}
          label="Individual"
          selected={selectedRole === 'AssetOwner'}
          onClick={() => setSelectedRole('AssetOwner')}
        />
        <RoleOption
          icon={<FaBuilding size={32} />}
          label="Company"
          selected={selectedRole === 'Company'}
          onClick={() => setSelectedRole('Company')}
        />
      </div>

      <Button
        disabled={!selectedRole || isPending}
        onClick={handleConfirm}
        className="w-full h-12 rounded-xl flex items-center justify-center gap-2"
      >
        {isPending ? <Loader /> : 'Confirm Selection'}
      </Button>
    </CommonModal>
  );
}

function RoleOption({
  icon,
  label,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center gap-4 p-6 rounded-xl border-2 transition-all
        ${selected
          ? 'border-blue-500 bg-blue-500/10 text-blue-500 shadow-lg shadow-blue-500/20'
          : 'border-[var(--fg)]/10 bg-[var(--fg)]/3 text-[var(--fg)]/60 hover:border-[var(--fg)]/30 hover:bg-[var(--fg)]/5'
        }
      `}
    >
      <div className={`${selected ? 'text-blue-500' : 'text-[var(--fg)]/40'}`}>
        {icon}
      </div>
      <span className="font-bold text-sm tracking-tight">{label}</span>
    </button>
  );
}
