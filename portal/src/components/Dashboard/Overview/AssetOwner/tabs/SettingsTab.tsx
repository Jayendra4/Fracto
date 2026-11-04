import { useState, type JSX } from 'react';
import { useChangePassword } from '@/api/changePassword.api';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';

export default function SettingsTab(): JSX.Element {
  const changePasswordMutation = useChangePassword();
  const user = useSelector((state: RootState) => state.authLogin.user);

  const [securityCurrentPassword, setSecurityCurrentPassword] = useState('');
  const [securityNewPassword, setSecurityNewPassword] = useState('');

  const submitChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityCurrentPassword || !securityNewPassword) {
      toast.error('Please enter current and new passwords');
      return;
    }
    changePasswordMutation.mutate(
      {
        oldPassword: securityCurrentPassword,
        newPassword: securityNewPassword,
      },
      {
        onSuccess: (res: any) => {
          const isSuccess = res?.success !== false;
          if (isSuccess) {
            toast.success('Password changed successfully');
            setSecurityCurrentPassword('');
            setSecurityNewPassword('');
          } else {
            toast.error(res.message || 'Failed to change password');
          }
        },
        onError: () => {
          toast.error('Server error changing password');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="pagehead">
        <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
          Profile &amp; Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-14 mt-1">
          Personal info, security, notification preferences, and the bank
          account funds are paid into.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Form */}
        <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-4">
          <h3 className="font-semibold font-14 md:font-16 text-[#0B2545] dark:text-white">
            Personal / Entity Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-12 text-gray-500 font-medium">
                Full Name / Entity
              </label>
              <input
                type="text"
                defaultValue={
                  user?.firstName
                    ? `${user.firstName} ${user.lastName || ''}`
                    : 'Young Attitude Group'
                }
                className="px-3 py-2 border border-[#E3E7EE] dark:border-white/10 rounded-lg font-12 md:font-14 bg-transparent"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-12 text-gray-500 font-medium">Email</label>
              <input
                type="text"
                defaultValue={user?.email || 'owner@youngattitude.example'}
                className="px-3 py-2 border border-[#E3E7EE] dark:border-white/10 rounded-lg font-12 md:font-14 bg-transparent font-sans"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-12 text-gray-500 font-medium">
                Mobile Number
              </label>
              <input
                type="text"
                defaultValue={user?.mobile || '+91 98XXXXXX21'}
                className="px-3 py-2 border border-[#E3E7EE] dark:border-white/10 rounded-lg font-12 md:font-14 bg-transparent"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-12 text-gray-500 font-medium">
                Owner Type
              </label>
              <input
                type="text"
                defaultValue="Company"
                className="px-3 py-2 border border-[#E3E7EE] dark:border-white/10 rounded-lg font-12 md:font-14 bg-gray-50 dark:bg-white/5 cursor-not-allowed"
                readOnly
              />
            </div>
          </div>
          <button
            onClick={() => toast.success('Profile changes saved')}
            className="bg-[#1F4FE0] text-white px-4 py-2 rounded-lg font-12 font-semibold hover:bg-[#153eb2] shadow"
          >
            Save Changes
          </button>
        </div>

        {/* Security */}
        <form
          onSubmit={submitChangePassword}
          className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-4"
        >
          <h3 className="font-semibold font-14 md:font-16 text-[#0B2545] dark:text-white">
            Security
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-12 text-gray-500 font-medium">
                Current Password
              </label>
              <input
                type="password"
                required
                value={securityCurrentPassword}
                onChange={(e) => setSecurityCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="px-3 py-2 border border-[#E3E7EE] dark:border-white/10 rounded-lg font-12 bg-transparent"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-12 text-gray-500 font-medium">
                New Password
              </label>
              <input
                type="password"
                required
                value={securityNewPassword}
                onChange={(e) => setSecurityNewPassword(e.target.value)}
                placeholder="••••••••"
                className="px-3 py-2 border border-[#E3E7EE] dark:border-white/10 rounded-lg font-12 bg-transparent"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-[#1F4FE0] text-white px-4 py-2 rounded-lg font-12 font-semibold hover:bg-[#153eb2] shadow flex items-center gap-2"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
