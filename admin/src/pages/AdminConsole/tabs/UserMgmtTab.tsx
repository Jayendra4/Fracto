import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface UserMgmtTabProps {
  accountsLoading: boolean;
  realAccounts: any[];
  openUserDetail: (user: any) => void;
}

export function UserMgmtTab({ accountsLoading, realAccounts, openUserDetail }: UserMgmtTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showEmptyState, setShowEmptyState] = useState(false);
  const navigate = useNavigate();

  // HTML defined users list
  const htmlAccounts = [
    { id: 101, name: 'Mudit V. Dudhoria', email: 'mudit@fractest.in', mobile: '9876543210', type: 'Investor', status: 'KYC Approved', assignedRm: 'Riya Sharma', key: 'investor' },
    { id: 102, name: 'Young Attitude Group', email: 'info@youngattitude.in', mobile: '8765432109', type: 'Prospective Co-owner', status: 'Approved', assignedRm: 'Riya Sharma', key: 'assetowner' },
    { id: 103, name: 'Raj Kumar Associates', email: 'rajkumar@broker.in', mobile: '7654321098', type: 'Partner', status: 'Renewal Under Review', assignedRm: 'Riya Sharma', key: 'broker' },
    { id: 104, name: 'HOF-LEAD-0039', email: 'lead39@fractest.in', mobile: '6543210987', type: 'Investor (Onboarding)', status: 'Stalled (6 days)', assignedRm: 'Riya Sharma', key: 'lead' },
    { id: 105, name: 'Trustee & Governance Officer', email: 'trustee@frac.in', mobile: '—', type: 'Trustee', status: 'Active', assignedRm: '—', key: 'trustee' },
    { id: 106, name: 'Legal / Valuation Reviewer', email: 'reviewer@legal.in', mobile: '—', type: 'Legal/Valuation/DD', status: 'Active', assignedRm: '—', key: 'legal' },
    { id: 107, name: 'Riya Sharma', email: 'riya.sharma@frac.in', mobile: '—', type: 'RM', status: 'Active', assignedRm: '—', key: 'rm' }
  ];

  const accountsSource = realAccounts.length > 0 
    ? realAccounts.map(acc => ({
        id: acc.id,
        name: `${acc.firstname || ''} ${acc.lastname || ''}`.trim() || acc.email,
        email: acc.email,
        mobile: acc.mobile || '—',
        type: acc.type === 'CorporateInvestor' ? 'Investor' : acc.type === 'AssetOwner' ? 'Prospective Co-owner' : acc.type || 'Investor',
        status: acc.status === 'Active' ? 'Active' : acc.status || 'Active',
        assignedRm: acc.assignedRm || '—',
        key: acc.key || 'investor'
      }))
    : htmlAccounts;

  const filteredAccounts = showEmptyState ? [] : accountsSource.filter(account => {
    const nameMatch = account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      account.email.toLowerCase().includes(searchQuery.toLowerCase());
    const roleMatch = !roleFilter || roleFilter === 'All Roles' || account.type === roleFilter;
    const statusMatch = !statusFilter || statusFilter === 'All Statuses' || 
                        (statusFilter === 'Active' && (account.status === 'Active' || account.status === 'KYC Approved' || account.status === 'Approved')) ||
                        (statusFilter === 'KYC Pending' && account.status === 'KYC Pending') ||
                        (statusFilter === 'Suspended' && account.status === 'Suspended') ||
                        (statusFilter === 'Renewal Under Review' && account.status === 'Renewal Under Review');
    return nameMatch && roleMatch && statusMatch;
  });

  const getStatusBadge = (status: string) => {
    if (status === 'KYC Approved' || status === 'Approved' || status === 'Active') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-450 border border-emerald-500/25">
          {status}
        </span>
      );
    }
    if (status === 'Renewal Under Review' || status === 'KYC Pending') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-455 border border-rose-500/25">
        {status}
      </span>
    );
  };

  const handleAction = (account: any) => {
    if (account.type === 'RM') {
      navigate('/rmassignment');
    } else if (account.type === 'Partner' || account.type === 'Broker') {
      navigate('/brokermgmt');
    } else {
      openUserDetail(account);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">User Management</h2>
        <p className="text-slate-400">All users across every role on the platform.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input 
            placeholder="Search by name, ID, or email…" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-900/50 border-slate-800 text-slate-200 text-sm focus-visible:ring-primary"
          />
        </div>
        <select 
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="bg-slate-900/50 border border-slate-800 text-slate-350 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
        >
          <option>All Roles</option>
          <option>Investor</option>
          <option>Asset Owner</option>
          <option>Partner</option>
          <option>Trustee</option>
          <option>Legal/Valuation/DD</option>
          <option>RM</option>
          <option>Admin</option>
        </select>
        <select 
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-slate-900/50 border border-slate-800 text-slate-350 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
        >
          <option>All Statuses</option>
          <option>Active</option>
          <option>KYC Pending</option>
          <option>Suspended</option>
        </select>
      </div>

      <Card className="bg-slate-900/50 border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-lg text-white">Registered Users</CardTitle>
          <CardDescription className="text-slate-400">System account roles and verification status</CardDescription>
        </CardHeader>
        <CardContent>
          {accountsLoading ? (
            <div className="py-8 text-center text-slate-400">Loading accounts from database...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-350">
                <thead className="text-xs uppercase bg-slate-850/50 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Assigned RM</th>
                    <th className="px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredAccounts.map(account => (
                    <tr key={account.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3 font-bold text-white">
                        {account.name}
                      </td>
                      <td className="px-4 py-3 text-slate-350">{account.type}</td>
                      <td className="px-4 py-3">{getStatusBadge(account.status)}</td>
                      <td className="px-4 py-3 text-slate-350">{account.assignedRm}</td>
                      <td className="px-4 py-3 text-right">
                        <span 
                          onClick={() => handleAction(account)}
                          className="text-primary hover:underline cursor-pointer text-xs font-semibold"
                        >
                          {account.type === 'RM' ? 'View Assignments' : 'View'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <p 
        style={{ cursor: 'pointer' }}
        onClick={() => setShowEmptyState(!showEmptyState)}
        className="text-[11px] text-slate-500 hover:text-slate-300 underline"
      >
        Preview: no results for a search →
      </p>

      {showEmptyState && (
        <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/10">
          <span className="text-3xl block mb-2">🔍</span>
          <h3 className="text-sm font-bold text-white">No users match your search</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Try a different name, ID, or adjust your role/status filters.
          </p>
        </div>
      )}
    </div>
  );
}
