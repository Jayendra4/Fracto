import { useChangePassword } from '@/api/changePassword.api';
import ChangePasswordForm from './ChangePasswordForm';
import { changePasswordFields } from './changePassword.fields';
import StatusModal from '@/components/Modals/Status';
import { useState } from 'react';
import CommonModal from '@/components/CommonModal';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: Props) {
  const changePassword = useChangePassword();

  const [status, setStatus] = useState({
    open: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: '',
  });

  const closeStatus = () => {
    setStatus((s) => ({ ...s, open: false }));
  };

  const handleSubmit = (data: any) => {
    changePassword.mutate(
      {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: (res: any) => {
          const isSuccess = res?.success !== false;

          if (isSuccess) {
            onClose();
            setStatus({
              open: true,
              type: 'success',
              title: 'Success',
              message: res?.message || 'Password updated successfully',
            });
          } else {
            setStatus({
              open: true,
              type: 'error',
              title: 'Error',
              message: res.message || 'Failed to update password',
            });
          }
        },
        onError: (err: any) =>
          setStatus({
            open: true,
            type: 'error',
            title: 'Error',
            message:
              err?.response?.data?.message || 'Failed to update password',
          }),
      }
    );
  };

  return (
    <>
      <CommonModal
        isOpen={open}
        onClose={onClose}
        title="Change Password"
        className="max-w-[520px]"
        contentClassName="p-6 relative"
      >
        {changePassword.isPending && (
          <div className="absolute inset-[-1.5rem] z-50 flex flex-col items-center justify-center bg-[var(--bg)]/60 backdrop-blur-sm rounded-b-xl border border-[var(--fg)]/5">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
            <p className="mt-4 font-16 font-semibold text-[var(--fg)] tracking-wide">Updating Password...</p>
          </div>
        )}
        <div className="h-[1px] bg-[var(--fg)]/10 mb-6" />

        <ChangePasswordForm
          fields={changePasswordFields}
          onSubmit={handleSubmit}
          button={{
            label: 'Reset Password',
          }}
        />
      </CommonModal>

      <StatusModal
        open={status.open}
        status={status.type}
        title={status.title}
        message={status.message}
        onClose={closeStatus}
        onContinue={closeStatus}
      />
    </>
  );
}
