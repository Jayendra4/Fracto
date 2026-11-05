import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface AuditEntry {
  time: string;
  desc: string;
}

export function AuditLogsTab() {
  const [searchQuery, setSearchQuery] = useState('');

  const logs: AuditEntry[] = [
    { time: '22 Jun 2026, 14:02', desc: 'RM flagged FRACTO-LEAD-0039 as stalled — escalated to Admin' },
    { time: '21 Jun 2026, 09:15', desc: 'DD Summary (partial) submitted for Heritage Court by Legal/Valuation/DD team' },
    { time: '15 Jun 2026, 11:40', desc: 'Admin approved investor access — FRACTO-INV-0098, Heritage Court' },
    { time: '08 Jun 2026, 10:00', desc: 'Club vote opened — Heritage Court, Rajasthan Commercial' },
    { time: '10 Jun 2026, 16:20', desc: 'Admin approved Group Sharing — Heritage Court → Rajasthan Commercial' },
    { time: '04 Mar 2025, 09:00', desc: 'Admin approved KYC — Mudit V. Dudhoria' }
  ];

  const filteredLogs = logs.filter(log =>
    log.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.time.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">Audit Logs</h2>
        <p className="text-slate-400">Every approval, rejection, and state change across the platform.</p>
      </div>

      {/* Search Bar */}
      <Input
        placeholder="Search audit log…"
        value={searchQuery}
        onChange={e => {
          setSearchQuery(e.target.value);
          if (e.target.value) {
            toast.success(`Filtering for: ${e.target.value}`, { id: 'audit-filter' });
          }
        }}
        className="bg-slate-900/50 border-slate-800 text-slate-200 text-sm focus-visible:ring-primary w-full sm:max-w-md"
      />

      {/* Audit Log Card */}
      <Card className="bg-slate-900/50 border-slate-800/80">
        <CardContent className="pt-6 space-y-4">
          <div className="divide-y divide-slate-800/60">
            {filteredLogs.map((log, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center py-3.5 gap-2 sm:gap-6 text-sm">
                <span className="text-xs text-slate-500 font-mono font-medium shrink-0 min-w-[140px]">
                  {log.time}
                </span>
                <span className="text-slate-250 font-medium">
                  {log.desc}
                </span>
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <div className="py-6 text-center text-slate-500 text-sm">
                No matching audit entries found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
