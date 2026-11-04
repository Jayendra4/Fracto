import React, { useState } from 'react';

export default function ProfileSettingsTab() {
  const [fullName, setFullName] = useState('Raj Kumar Associates');
  const [email, setEmail] = useState('raj@example.com');
  const [tfa, setTfa] = useState(true);
  const [inApp, setInApp] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [whatsapp, setWhatsapp] = useState(false);

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const updatePassword = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-serif font-semibold text-[#0B2545] dark:text-white">
          Profile &amp; Settings
        </h1>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Personal info, security, notification preferences, and payout bank
          account.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile info */}
        <div className="bg-white dark:bg-[#132436] p-6 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-semibold text-[#0B2545] dark:text-white border-b border-gray-300 dark:border-white/5 pb-2">
            Personal / Entity Information
          </h3>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Full Name / Entity
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-gray-55 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg py-2 px-3 text-xs md:text-sm font-normal text-gray-850 dark:text-white focus:outline-none focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0]"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-55 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg py-2 px-3 text-xs md:text-sm font-normal text-gray-850 dark:text-white focus:outline-none focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0]"
                />
              </div>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#1F4FE0] hover:bg-[#153eb2] text-white text-xs md:text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition cursor-pointer"
            >
              Save Changes
            </button>
          </form>
        </div>

        {/* Security info */}
        <div className="bg-white dark:bg-[#132436] p-6 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-semibold text-[#0B2545] dark:text-white border-b border-gray-300 dark:border-white/5 pb-2">
            Security
          </h3>
          <form onSubmit={updatePassword} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="bg-gray-55 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg py-2 px-3 text-xs md:text-sm font-normal text-gray-850 dark:text-white focus:outline-none focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0]"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="bg-gray-55 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg py-2 px-3 text-xs md:text-sm font-normal text-gray-850 dark:text-white focus:outline-none focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0]"
                />
              </div>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-250 dark:border-white/10 hover:bg-gray-55 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 text-xs md:text-sm font-semibold px-4 py-2.5 rounded-lg transition cursor-pointer"
            >
              Update Password
            </button>
          </form>

          {/* 2FA Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
            <div>
              <div className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">
                Two-Factor Authentication
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Extra OTP step at login
              </div>
            </div>
            <div
              className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                tfa ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-white/10'
              }`}
              onClick={() => {
                setTfa(!tfa);
              }}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  tfa ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications card */}
      <div className="bg-white dark:bg-[#132436] p-6 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-4">
        <h3 className="font-serif text-lg font-semibold text-[#0B2545] dark:text-white border-b border-gray-300 dark:border-white/5 pb-2">
          Notification Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-gray-300 dark:border-white/5 last:border-0 pb-3">
            <div>
              <div className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">
                In-app notifications
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Lead conversions, payouts, asset status
              </div>
            </div>
            <div
              className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                inApp ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-white/10'
              }`}
              onClick={() => setInApp(!inApp)}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  inApp ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-300 dark:border-white/5 last:border-0 pb-3">
            <div>
              <div className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">
                Email notifications
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Same events, sent to your registered email
              </div>
            </div>
            <div
              className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                emailNotif ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-white/10'
              }`}
              onClick={() => setEmailNotif(!emailNotif)}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  emailNotif ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-2 last:border-0">
            <div>
              <div className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">
                WhatsApp notifications
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Optional — lead and payout alerts
              </div>
            </div>
            <div
              className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                whatsapp ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-white/10'
              }`}
              onClick={() => setWhatsapp(!whatsapp)}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  whatsapp ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bank Account card */}
      <div className="bg-white dark:bg-[#132436] p-6 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-4">
        <h3 className="font-serif text-lg font-semibold text-[#0B2545] dark:text-white border-b border-gray-300 dark:border-white/5 pb-2">
          Payout Bank Account
        </h3>
        <div className="flex items-center justify-between text-xs md:text-sm text-gray-700 dark:text-gray-300 py-3 border-b border-gray-300 dark:border-white/5">
          <span>ICICI Bank — XXXX5512 (Verified)</span>
          <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
            Verified
          </span>
        </div>
        <button className="flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-250 dark:border-white/10 hover:bg-gray-55 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 text-xs md:text-sm font-semibold px-4 py-2.5 rounded-lg transition cursor-pointer">
          Update Bank Account
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          This is the same account verified during onboarding/renewal — updating
          it here updates it everywhere.
        </p>
      </div>
    </div>
  );
}
