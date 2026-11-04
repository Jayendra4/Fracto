import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';

export function RmAssignmentTab() {
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [assigneeInput, setAssigneeInput] = useState('');
  const [targetRm, setTargetRm] = useState('Riya Sharma');

  const handleReassign = (name: string) => {
    toast.success(`Reassignment form opened for ${name}`);
  };

  const handleAssign = () => {
    if (!assigneeInput.trim()) {
      toast.error('Please enter a user or asset name');
      return;
    }
    toast.success(`Assignment created for ${assigneeInput} to ${targetRm}`);
    setAssigneeInput('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">RM Assignment</h2>
        <p className="text-slate-400">
          Assign or reassign Relationship Managers to users and assets.
        </p>
      </div>

      {!showEmptyState && (
        <Card className="bg-slate-900/50 border-slate-800/80">
          <CardHeader>
            <CardTitle className="text-lg text-white font-semibold">
              Riya Sharma — Current Assignments
            </CardTitle>
            <CardDescription className="text-slate-450">
              Actively managed investor and Investor channels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto border border-slate-850 rounded-xl">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs uppercase bg-slate-850/50 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Assigned User / Asset</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  <tr className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">Mudit V. Dudhoria</td>
                    <td className="px-4 py-3 text-slate-350">Investor</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        onClick={() => handleReassign('Mudit V. Dudhoria')}
                        className="font-semibold text-xs h-8 px-3"
                      >
                        Reassign
                      </Button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">Young Attitude Group</td>
                    <td className="px-4 py-3 text-slate-355">Investor</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        onClick={() => handleReassign('Young Attitude Group')}
                        className="font-semibold text-xs h-8 px-3"
                      >
                        Reassign
                      </Button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">Raj Kumar Associates</td>
                    <td className="px-4 py-3 text-slate-355">Partner</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        onClick={() => handleReassign('Raj Kumar Associates')}
                        className="font-semibold text-xs h-8 px-3"
                      >
                        Reassign
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <p
        style={{ cursor: 'pointer' }}
        onClick={() => setShowEmptyState(!showEmptyState)}
        className="text-[11px] text-slate-500 hover:text-slate-300 underline"
      >
        Preview: an RM with no assignments yet &rarr;
      </p>

      {showEmptyState && (
        <div className="text-center py-12 border-2 border-dashed border-slate-850 rounded-xl bg-slate-900/10">
          <span className="text-3xl block mb-2">👤</span>
          <h3 className="text-sm font-bold text-white">No users assigned to this RM yet</h3>
          <p className="text-xs text-slate-450 mt-1">
            Use "Assign New User / Asset" below to give this RM their first assignment.
          </p>
        </div>
      )}

      {/* Assign Form Card */}
      <Card className="bg-slate-900/50 border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-lg text-white font-semibold">
            Assign New User / Asset
          </CardTitle>
          <CardDescription className="text-slate-400 font-medium">
            Create a relationship manager workflow route
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="assignee" className="text-xs text-slate-350 font-semibold">
                User / Investor / Partner
              </Label>
              <Input
                id="assignee"
                placeholder="Search to assign..."
                value={assigneeInput}
                onChange={(e) => setAssigneeInput(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-sm focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rm-select" className="text-xs text-slate-350 font-semibold">
                Assign to RM
              </Label>
              <select
                id="rm-select"
                value={targetRm}
                onChange={(e) => setTargetRm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
              >
                <option>Riya Sharma</option>
              </select>
            </div>
          </div>
          <Button onClick={handleAssign} className="font-semibold text-xs h-9">
            Assign
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
