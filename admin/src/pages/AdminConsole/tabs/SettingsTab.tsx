import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

export function SettingsTab() {
  const [fullName, setFullName] = useState('Platform Admin');
  const [email, setEmail] = useState('admin@example.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [tfaEnabled, setTfaEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile changes saved');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in both password fields');
      return;
    }
    toast.success('Password updated');
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">
          Profile &amp; Settings
        </h2>
        <p className="text-slate-400">Personal info, security, and notification preferences.</p>
      </div>

      {/* ── Row 1: 2-col grid ── */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* Personal Information */}
        <Card className="bg-slate-900/50 border-slate-800/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-white">Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* form-row: 2 side-by-side fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="s-fullname" className="text-xs font-semibold text-slate-400 block">
                    Full Name
                  </Label>
                  <Input
                    id="s-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-slate-950/60 border-slate-800 text-slate-200 text-sm h-9 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s-email" className="text-xs font-semibold text-slate-400 block">
                    Email
                  </Label>
                  <Input
                    id="s-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-950/60 border-slate-800 text-slate-200 text-sm h-9 focus-visible:ring-primary"
                  />
                </div>
              </div>
              <Button type="submit" className="font-semibold text-xs h-9 px-5">
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-slate-900/50 border-slate-800/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-white">Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {/* form-row: 2 side-by-side password fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="s-curr-pw" className="text-xs font-semibold text-slate-400 block">
                    Current Password
                  </Label>
                  <Input
                    id="s-curr-pw"
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-slate-950/60 border-slate-800 text-slate-200 text-sm h-9 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s-new-pw" className="text-xs font-semibold text-slate-400 block">
                    New Password
                  </Label>
                  <Input
                    id="s-new-pw"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-slate-950/60 border-slate-800 text-slate-200 text-sm h-9 focus-visible:ring-primary"
                  />
                </div>
              </div>
              <Button type="submit" variant="outline" className="font-semibold text-xs h-9 px-5">
                Update Password
              </Button>
            </form>

            {/* 2FA toggle — sits below the password form inside Security card */}
            <div className="flex items-center justify-between pt-1 mt-1 border-t border-slate-800/60">
              <div className="space-y-0.5 pt-3">
                <p className="text-sm font-semibold text-white">Two-Factor Authentication</p>
                <p className="text-xs text-slate-400">Extra OTP step at login</p>
              </div>
              <div className="pt-3">
                <Switch
                  id="tfa-toggle"
                  checked={tfaEnabled}
                  onCheckedChange={(val) => {
                    setTfaEnabled(val);
                    toast.success(val ? '2FA enabled' : '2FA disabled');
                  }}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 2: full-width Notification Preferences ── */}
      <Card className="bg-slate-900/50 border-slate-800/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-white">Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 divide-y divide-slate-800/60">

          {/* In-app notifications */}
          <div className="flex items-center justify-between py-4">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-white">In-app notifications</p>
              <p className="text-xs text-slate-400">Pending approvals, escalated tickets, compliance deadlines</p>
            </div>
            <Switch
              id="in-app-toggle"
              checked={inAppEnabled}
              onCheckedChange={(val) => {
                setInAppEnabled(val);
                toast.success(val ? 'In-app notifications on' : 'In-app notifications off');
              }}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {/* Email notifications */}
          <div className="flex items-center justify-between py-4">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-white">Email notifications</p>
              <p className="text-xs text-slate-400">Same events, sent to registered email</p>
            </div>
            <Switch
              id="email-toggle"
              checked={emailEnabled}
              onCheckedChange={(val) => {
                setEmailEnabled(val);
                toast.success(val ? 'Email notifications on' : 'Email notifications off');
              }}
              className="data-[state=checked]:bg-primary"
            />
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
