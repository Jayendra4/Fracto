import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function StatusLegendTab() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">Status Legend</h2>
        <p className="text-slate-400">
          Canonical status taxonomy used across the platform. Badges seen elsewhere (vote outcomes,
          governance status, sharing status) are contextual indicators layered on top of these — not
          separate taxonomies.
        </p>
      </div>

      {/* Asset Lifecycle Status Card */}
      <Card className="bg-slate-900/50 border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-lg text-white font-semibold">
            Asset Lifecycle & RWA Status
          </CardTitle>
          <CardDescription className="text-slate-450">
            The canonical lifecycle stages of an asset listing and its Real World Asset (RWA)
            compliance review process.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1  gap-8">
            {/* Column 1: Asset Marketplace Status */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                Asset Marketplace Status
              </h3>
              <p className="text-xs text-slate-400">
                Represents the active stage of the listing on the marketplace/platform.
              </p>
              <div className="overflow-x-auto border border-slate-850 rounded-xl">
                <table className="w-full text-sm text-left text-slate-300">
                  <thead className="text-xs uppercase bg-slate-850/50 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3 w-1/3">Status</th>
                      <th className="px-4 py-3 w-2/3">Meaning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {[
                      {
                        badge: 'Draft',
                        desc: 'Asset onboarding or listing details are under compilation by the owner and have not been submitted.',
                      },
                      {
                        badge: 'Reviewed',
                        desc: 'Asset details have been preliminary reviewed and approved by the platform administrators.',
                      },
                      {
                        badge: 'RequestLive',
                        display: 'Request Live',
                        desc: 'Owner has requested the asset to go live on the marketplace.',
                      },
                      {
                        badge: 'Available',
                        display: 'Live',
                        desc: 'The asset is live, visible on the marketplace, and open for investor subscription.',
                      },
                      {
                        badge: 'Funded',
                        desc: 'The investment target has been fully reached, subscription is closed, and SPV allotment is underway.',
                      },
                      {
                        badge: 'Exited',
                        desc: 'The physical asset has been liquidated/sold, and proceeds are distributed to co-owners.',
                      },
                      {
                        badge: 'Rejected',
                        desc: 'Asset onboarding or listing request was rejected by the admin.',
                      },
                      {
                        badge: 'LegalReviewed',
                        display: 'Legal Reviewed',
                        desc: "The asset's legal documents have been successfully verified.",
                      },
                      {
                        badge: 'ValuationReviewed',
                        display: 'Valuation Reviewed',
                        desc: "The asset's valuation report has been verified and approved.",
                      },
                      {
                        badge: 'DueDiligence',
                        display: 'Due Diligence',
                        desc: 'Final due diligence checks (ownership, commercial, tenant verification) have completed.',
                      },
                    ].map((st, idx) => {
                      const assetStatusStyles: Record<string, string> = {
                        Draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
                        Available: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                        Funded: 'bg-green-500/10 text-green-400 border-green-500/20',
                        Exited: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                        LegalReviewed: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                        ValuationReviewed: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                        DueDiligence: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                        RequestLive: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                        Rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
                        Reviewed: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
                      };
                      return (
                        <tr key={idx} className="hover:bg-slate-800/10 transition-colors">
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                                assetStatusStyles[st.badge] ||
                                'bg-slate-800 text-slate-400 border-slate-700/60'
                              }`}
                            >
                              {st.display || st.badge}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-350 text-xs leading-relaxed">
                            {st.desc}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Column 2: RWA Verification Status */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                RWA Verification Status
              </h3>
              <p className="text-xs text-slate-400">
                Represents compliance, legal, valuation, and due diligence checks of the physical
                asset.
              </p>
              <div className="overflow-x-auto border border-slate-850 rounded-xl">
                <table className="w-full text-sm text-left text-slate-300">
                  <thead className="text-xs uppercase bg-slate-850/50 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3 w-1/3">Status</th>
                      <th className="px-4 py-3 w-2/3">Meaning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {[
                      {
                        badge: 'Draft',
                        desc: 'RWA verification process has started but compliance details are not yet submitted.',
                      },
                      {
                        badge: 'Submitted',
                        desc: 'Preliminary asset details and required documents have been submitted to the admin.',
                      },
                      {
                        badge: 'Under_Review',
                        display: 'Under Review',
                        desc: 'RWA verification and compliance documents are under active review by the admin.',
                      },
                      {
                        badge: 'LegalReviewed',
                        display: 'Legal Reviewed',
                        desc: 'The asset has passed full legal verification check by the Legal department.',
                      },
                      {
                        badge: 'LegalRejected',
                        display: 'Legal Rejected',
                        desc: "The asset's legal documentation failed to clear verification.",
                      },
                      {
                        badge: 'ValuationReviewed',
                        display: 'Valuation Reviewed',
                        desc: 'The physical asset valuation and site report are verified and approved.',
                      },
                      {
                        badge: 'ValuationRejected',
                        display: 'Valuation Rejected',
                        desc: 'The asset valuation check failed or report was rejected.',
                      },
                      {
                        badge: 'DueDiligence',
                        display: 'Due Diligence',
                        desc: 'All final due diligence verification checks have successfully passed.',
                      },
                      {
                        badge: 'DueDiligenceRejected',
                        display: 'Due Diligence Rejected',
                        desc: 'The final due diligence check failed due to verification issues.',
                      },
                      {
                        badge: 'Approved',
                        desc: 'RWA compliance checks are fully approved; the asset is cleared for listing.',
                      },
                      {
                        badge: 'Rejected',
                        desc: 'The RWA verification process has been rejected.',
                      },
                    ].map((st, idx) => {
                      const rwaStatusStyles: Record<string, string> = {
                        Submitted: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
                        Approved: 'bg-green-500/10 text-green-500 border-green-500/20',
                        Rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
                        LegalReviewed: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
                        ValuationReviewed: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                        DueDiligence: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
                        Draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
                        Under_Review: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
                        LegalRejected: 'bg-red-500/10 text-red-500 border-red-500/20',
                        ValuationRejected: 'bg-red-500/10 text-red-500 border-red-500/20',
                        DueDiligenceRejected: 'bg-red-500/10 text-red-500 border-red-500/20',
                      };
                      return (
                        <tr key={idx} className="hover:bg-slate-800/10 transition-colors">
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                                rwaStatusStyles[st.badge] ||
                                'bg-slate-800 text-slate-400 border-slate-700/60'
                              }`}
                            >
                              {st.display || st.badge}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-355 text-xs leading-relaxed">
                            {st.desc}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 leading-normal">
            <b>Note on "Frozen":</b> not a lifecycle stage — it's an administrative override flag
            (like Risk Flagged) that can be applied at any stage via Admin's Freeze Asset action,
            halting all club voting, group sharing, and investor access until lifted.
          </p>
        </CardContent>
      </Card>

      {/* KYC Status Card */}
      <Card className="bg-slate-900/50 border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-lg text-white font-semibold">KYC Status (4 states)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border border-slate-850 rounded-xl">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs uppercase bg-slate-850/50 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {[
                  {
                    badge: 'Submitted',
                    type: 'review',
                    desc: 'All steps completed, awaiting review (in case of broker)',
                  },
                  { badge: 'Draft', type: 'draft', desc: 'All steps completed, awaiting review' },
                  {
                    badge: 'Approved',
                    type: 'live',
                    desc: 'KYC cleared — full platform access per role',
                  },
                  { badge: 'Rejected', type: 'flag', desc: 'KYC failed — access blocked' },
                ].map((st, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
                          st.type === 'live'
                            ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/25'
                            : st.type === 'flag'
                              ? 'bg-rose-500/10 text-rose-455 border border-rose-500/25'
                              : st.type === 'review'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                                : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                        }`}
                      >
                        {st.badge}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-355">{st.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 leading-normal">
            All "KYC Verified" references have been standardized to "KYC Approved" across the
            platform to match this canonical state.
          </p>
        </CardContent>
      </Card>

      {/* Document Status Card */}
      {/* <Card className="bg-slate-900/50 border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-lg text-white font-semibold">
            Document Status (7 states)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border border-slate-850 rounded-xl">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs uppercase bg-slate-850/50 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {[
                  { badge: 'Not Uploaded', type: 'draft', desc: 'Required, not yet provided' },
                  { badge: 'Uploaded', type: 'review', desc: 'Provided, not yet reviewed' },
                  { badge: 'Under Review', type: 'review', desc: 'Reviewer actively checking' },
                  { badge: 'Approved', type: 'live', desc: 'Cleared' },
                  { badge: 'Rejected', type: 'flag', desc: 'Did not pass review' },
                  {
                    badge: 'Expired',
                    type: 'flag',
                    desc: 'Validity period lapsed — needs refresh',
                  },
                  {
                    badge: 'Re-upload Required',
                    type: 'flag',
                    desc: 'Unclear/incomplete — needs resubmission',
                  },
                ].map((st, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
                          st.type === 'live'
                            ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/25'
                            : st.type === 'flag'
                              ? 'bg-rose-500/10 text-rose-455 border border-rose-500/25'
                              : st.type === 'review'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                                : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                        }`}
                      >
                        {st.badge}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-355">{st.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card> */}

      {/* Payment Status Card */}
      <Card className="bg-slate-900/50 border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-lg text-white font-semibold">
            Payment Status (3 states)
          </CardTitle>
          <CardDescription className="text-slate-450">
            Applies to any money movement on the platform — subscriptions, distributions, commission
            payouts, asset acquisition payouts, and refunds. All payments flow through verified bank
            accounts only; House of Frac never holds funds itself.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border border-slate-850 rounded-xl">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs uppercase bg-slate-850/50 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {[
                  {
                    badge: 'Pending',
                    type: 'review',
                    desc: 'Payment instruction generated, transfer not yet initiated',
                  },
                  // {
                  //   badge: 'Processing',
                  //   type: 'funding',
                  //   desc: 'Transfer initiated/received, awaiting bank confirmation or matching',
                  // },
                  {
                    badge: 'Completed',
                    type: 'live',
                    desc: 'Confirmed received/disbursed and reconciled',
                  },
                  {
                    badge: 'Failed',
                    type: 'flag',
                    desc: 'Transfer did not complete — bounced, mismatched, or expired',
                  },
                  // { badge: 'Refunded', type: 'draft', desc: 'Amount returned to original payer' },
                ].map((st, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
                          st.type === 'live'
                            ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/25'
                            : st.type === 'flag'
                              ? 'bg-rose-500/10 text-rose-455 border border-rose-500/25'
                              : st.type === 'funding'
                                ? 'bg-primary/10 text-primary border border-primary/25'
                                : st.type === 'review'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                        }`}
                      >
                        {st.badge}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-355">{st.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Partner Lead Status Card */}
      <Card className="bg-slate-900/50 border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-lg text-white font-semibold">
            Partner Lead Status (7 states)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border border-slate-850 rounded-xl">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs uppercase bg-slate-850/50 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {[
                  { badge: 'New', type: 'draft', desc: 'Just submitted' },
                  { badge: 'Contacted', type: 'review', desc: 'RM/Admin has reached out' },
                  { badge: 'Qualified', type: 'review', desc: 'Genuine interest/fit confirmed' },
                  {
                    badge: 'Converted',
                    type: 'live',
                    desc: 'Completed KYC / subscribed / onboarded',
                  },
                  {
                    badge: 'Commission Eligible',
                    type: 'funding',
                    desc: 'Conversion event met, commission calculated',
                  },
                  { badge: 'Paid', type: 'live', desc: 'Commission disbursed' },
                  { badge: 'Rejected', type: 'flag', desc: 'Lead did not qualify or declined' },
                ].map((st, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
                          st.type === 'live'
                            ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/25'
                            : st.type === 'flag'
                              ? 'bg-rose-500/10 text-rose-455 border border-rose-500/25'
                              : st.type === 'funding'
                                ? 'bg-primary/10 text-primary border border-primary/25'
                                : st.type === 'review'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                        }`}
                      >
                        {st.badge}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-355">{st.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
