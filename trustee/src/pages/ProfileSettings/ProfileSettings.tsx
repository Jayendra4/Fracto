import { useState } from 'react';

import { Switch } from '@/components/ui/switch';

const ProfileSettings = () => {
  const [fullName, setFullName] = useState('Trustee & Governance Officer');
  const [email, setEmail] = useState('trustee@example.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const handleSaveChanges = () => {
    console.log('Save profile changes:', { fullName, email });
  };

  const handleUpdatePassword = () => {
    console.log('Update password');
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Profile & Settings</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Personal info, security, and notification preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-xl border bg-background p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-sm font-bold text-foreground">Personal Information</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-10 w-full rounded-md border bg-muted/30 px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-md border bg-muted/30 px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveChanges}
            className="mt-4 h-10 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Save Changes
          </button>
        </div>

        <div className="rounded-xl border bg-background p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-foreground">Security</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                placeholder='••••••••'
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-10 w-full rounded-md border bg-muted/30 px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                placeholder='••••••••'
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 w-full rounded-md border bg-muted/30 px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleUpdatePassword}
            className="mt-4 h-10 rounded-md border bg-background px-4 text-sm font-semibold text-foreground hover:bg-muted"
          >
            Update Password
          </button>

          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <div>
              <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Extra OTP step at login</p>
            </div>

            <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border bg-background shadow-sm">
        <div className="px-6 pb-4 pt-5">
          <h2 className="text-sm font-bold text-foreground">Notification Preferences</h2>
        </div>

        <div className="flex items-center justify-between border-t px-6 py-4">
          <div>
            <p className="text-sm font-medium text-foreground">In-app notifications</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Votes, compliance deadlines, distributions
            </p>
          </div>

          <Switch checked={inAppNotifications} onCheckedChange={setInAppNotifications} />
        </div>

        <div className="flex items-center justify-between border-t px-6 py-4">
          <div>
            <p className="text-sm font-medium text-foreground">Email notifications</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Same events, sent to registered email
            </p>
          </div>

          <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
