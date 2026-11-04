import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CMSListingTab() {
  const [listingTitle, setListingTitle] = useState('Heritage Court — Lakefront Commercial, Udaipur');
  const [visibility, setVisibility] = useState('Member Preview');
  const [investorSummary, setInvestorSummary] = useState('Lakefront commercial property near the city centre, currently under valuation and legal review.');
  const [showEmptyState, setShowEmptyState] = useState(false);

  const handleSaveDraft = () => {
    toast.success('Listing content saved as draft');
  };

  const handleApproveContent = () => {
    toast.success('Listing content approved — ready for Listing Approval once Legal/Valuation/DD clears');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">Listing Content (CMS)</h2>
        <p className="text-slate-400">Edit and approve investor-facing listing copy before it reaches Listing Approval.</p>
      </div>

      {!showEmptyState && (
        <Card className="bg-slate-900/50 border-slate-800/80">
          <CardHeader>
            <CardTitle className="text-lg text-white">Heritage Court, Udaipur — Listing Draft</CardTitle>
            <CardDescription className="text-slate-400">Investor-facing marketplace listing copy details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="listing-title" className="text-xs text-slate-355 font-semibold">Public Listing Title</Label>
                <Input 
                  id="listing-title" 
                  value={listingTitle} 
                  onChange={e => setListingTitle(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-sm focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="visibility" className="text-xs text-slate-355 font-semibold">Listing Visibility</Label>
                <select 
                  id="visibility"
                  value={visibility}
                  onChange={e => setVisibility(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                >
                  <option>Member Preview</option>
                  <option>Club Member View</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="summary" className="text-xs text-slate-355 font-semibold">Investor Summary</Label>
              <Input 
                id="summary" 
                value={investorSummary} 
                onChange={e => setInvestorSummary(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-sm focus-visible:ring-primary"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSaveDraft}
                className="font-semibold text-xs h-9"
              >
                Save Draft
              </Button>
              <Button 
                type="button" 
                variant="default" 
                onClick={handleApproveContent}
                className="font-semibold text-xs h-9"
              >
                Approve Content
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <p 
        style={{ cursor: 'pointer' }}
        onClick={() => setShowEmptyState(!showEmptyState)}
        className="text-[11px] text-slate-500 hover:text-slate-300 underline"
      >
        Preview: no listings ready for content editing &rarr;
      </p>

      {showEmptyState && (
        <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/10">
          <span className="text-3xl block mb-2">📝</span>
          <h3 className="text-sm font-bold text-white">No listings ready for content editing</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Listing content can be edited once an asset has Preliminary Approval and an Asset Story has been entered by the owner.
          </p>
        </div>
      )}
    </div>
  );
}
