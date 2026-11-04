import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';

import { EmailLoginForm } from './EmailLoginForm';
import { MobileLoginForm } from './MobileLoginForm';

export function LoginPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('email');

  const handleTabChange = (tab: 'email' | 'phone') => {
    setActiveTab(tab);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 px-6">
        <div
          onClick={() => handleTabChange('email')}
          className={`${activeTab === 'email' ? 'border border-[#412D00] text-[#FFB816]' : 'text-white'}  cursor-pointer flex items-center py-2 justify-center gap-2 text-[16px] rounded-[6px]`}
        >
          <Mail width={20} /> Email
        </div>
        <div
          onClick={() => handleTabChange('phone')}
          className={`${activeTab === 'phone' ? 'border border-[#412D00] text-[#FFB816]' : 'text-white'}  cursor-pointer flex items-center py-2 justify-center gap-2 text-[16px] rounded-[6px]`}
        >
          <Phone width={20} /> Phone Number
        </div>
      </div>

      {activeTab === 'email' ? <EmailLoginForm /> : <MobileLoginForm />}

      <div className="text-center text-sm text-muted-foreground">
        Don’t have an account?{' '}
        <span
          onClick={() => navigate('/register')}
          className="cursor-pointer font-medium text-[#FFB816] hover:underline"
        >
          Create one
        </span>
      </div>
    </div>
  );
}
