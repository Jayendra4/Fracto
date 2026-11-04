import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function TicketsTab() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">Tickets</h2>
        <p className="text-slate-400">Escalated tickets across all RMs.</p>
      </div>

      <Card className="bg-slate-900/50 border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-lg text-white font-semibold">Active Support Tickets</CardTitle>
          <CardDescription className="text-slate-400">Tickets requiring administrator or RM intervention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border border-slate-850 rounded-xl">
            <table className="w-full text-sm text-left text-slate-350">
              <thead className="text-xs uppercase bg-slate-850/50 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Raised By</th>
                  <th className="px-4 py-3">Assigned RM</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                <tr className="hover:bg-slate-800/10 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">Mudit V. Dudhoria</td>
                  <td className="px-4 py-3 text-slate-350">Riya Sharma</td>
                  <td className="px-4 py-3 text-slate-300">Bank proof re-upload clarification</td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                      In Progress
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/10 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">Young Attitude Group</td>
                  <td className="px-4 py-3 text-slate-355">Riya Sharma</td>
                  <td className="px-4 py-3 text-slate-300">Encumbrance certificate clarification</td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                      In Progress
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
