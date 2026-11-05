import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'react-hot-toast';

interface AssetProfitState {
  id: string;
  name: string;
  badge: string;
  badgeType: 'draft' | 'funding' | 'live' | 'review';
  rental: boolean;
  rentalDesc: string;
  timeshare: boolean;
  timeshareDesc: string;
  exit: boolean;
  exitDesc: string;
}

export function ProfitMechanismTab() {
  const [assets, setAssets] = useState<AssetProfitState[]>([
    {
      id: 'heritage',
      name: 'Heritage Court, Udaipur',
      badge: 'Pipeline — pre-vote',
      badgeType: 'draft',
      rental: false,
      rentalDesc: 'Recurring income from a tenant/lease',
      timeshare: true,
      timeshareDesc: 'Short-stay/usage-based revenue (heritage boutique hospitality)',
      exit: true,
      exitDesc: 'One-time capital gain when the Club exits'
    },
    {
      id: 'marinabay',
      name: 'Marina Bay Residency, Dubai',
      badge: 'FRACTO-SPV-027 · Subscription Open',
      badgeType: 'funding',
      rental: true,
      rentalDesc: 'Recurring income from a tenant/lease',
      timeshare: true,
      timeshareDesc: 'Short-stay/usage-based revenue (Marina waterfront unit)',
      exit: true,
      exitDesc: 'One-time capital gain when the Club exits'
    },
    {
      id: 'soraheights',
      name: 'Sora Heights, Jaipur',
      badge: 'FRACTO-SPV-014 · Managed',
      badgeType: 'live',
      rental: true,
      rentalDesc: 'Recurring income from a tenant/lease',
      timeshare: true,
      timeshareDesc: 'Short-stay/usage-based revenue (select units)',
      exit: true,
      exitDesc: 'One-time capital gain when the Club exits'
    },
    {
      id: 'crescent',
      name: 'Crescent Business Park, Gurugram',
      badge: 'FRACTO-SPV-021 · Exit In Progress',
      badgeType: 'review',
      rental: true,
      rentalDesc: 'Recurring income from a tenant/lease',
      timeshare: false,
      timeshareDesc: 'Not applicable — single-tenant commercial office park',
      exit: true,
      exitDesc: 'One-time capital gain when the Club exits'
    },
    {
      id: 'lakeview',
      name: 'Lakeview Commercial, Udaipur',
      badge: 'Preliminary Review',
      badgeType: 'draft',
      rental: true,
      rentalDesc: 'Recurring income from a tenant/lease',
      timeshare: false,
      timeshareDesc: 'Not applicable — single-tenant commercial',
      exit: true,
      exitDesc: 'One-time capital gain when the Club exits'
    }
  ]);

  const handleToggle = (assetId: string, type: 'rental' | 'timeshare' | 'exit', currentVal: boolean) => {
    const nextVal = !currentVal;
    setAssets(prev => prev.map(asset => {
      if (asset.id === assetId) {
        return { ...asset, [type]: nextVal };
      }
      return asset;
    }));
    const typeLabel = type === 'rental' ? 'Rental Distribution' : type === 'timeshare' ? 'Timeshare Income' : 'Post-Launch Sale Profit';
    const asset = assets.find(a => a.id === assetId);
    toast.success(`${typeLabel} ${nextVal ? 'enabled' : 'disabled'} for ${asset?.name}`);
  };

  const getBadgeStyle = (type: 'draft' | 'funding' | 'live' | 'review') => {
    switch (type) {
      case 'live':
        return 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/25';
      case 'review':
      case 'funding':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/25';
      default:
        return 'bg-slate-800 text-slate-400 border border-slate-700/60';
    }
  };

  // KPI calculations
  const totalTagged = assets.length;
  const rentalCount = assets.filter(a => a.rental).length;
  const timeshareCount = assets.filter(a => a.timeshare).length;
  const exitCount = assets.filter(a => a.exit).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">Profit Mechanism Tagging</h2>
        <p className="text-slate-400">Every asset can carry one or more of three profit types. Toggle which apply — dashboards only show the mechanisms relevant to each asset.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900/50 border-slate-800/80">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Total Assets Tagged</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-display">{totalTagged}</div>
            <p className="text-[11px] text-slate-400 mt-1">Across pipeline &amp; managed</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800/80">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Rental Distribution</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-display">{rentalCount}</div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Assets with recurring lease income</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800/80">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Timeshare Income</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-display">{timeshareCount}</div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Assets suited to short-stay/usage revenue</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800/80">
          <CardHeader className="pb-2">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Post-Launch Sale Profit</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-display">{exitCount}</div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">All assets — eventual Club exit</p>
          </CardContent>
        </Card>
      </div>

      {/* Asset List cards */}
      <div className="space-y-4">
        {assets.map(asset => (
          <Card key={asset.id} className="bg-slate-900/50 border-slate-800/80">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base text-white font-semibold flex items-center">
                {asset.name}
                <span className={`ml-2.5 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${getBadgeStyle(asset.badgeType)}`}>
                  {asset.badge}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Toggle row 1 */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/20 border border-slate-850">
                <div>
                  <div className="text-sm font-semibold text-slate-200">Rental Distribution</div>
                  <div className="text-xs text-slate-450 mt-0.5">{asset.rentalDesc}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={asset.rental}
                    onCheckedChange={() => handleToggle(asset.id, 'rental', asset.rental)}
                    className="data-[state=checked]:bg-primary border-slate-700"
                  />
                </div>
              </div>

              {/* Toggle row 2 */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/20 border border-slate-850">
                <div>
                  <div className="text-sm font-semibold text-slate-200">Timeshare Income</div>
                  <div className="text-xs text-slate-450 mt-0.5">{asset.timeshareDesc}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={asset.timeshare}
                    onCheckedChange={() => handleToggle(asset.id, 'timeshare', asset.timeshare)}
                    className="data-[state=checked]:bg-primary border-slate-700"
                  />
                </div>
              </div>

              {/* Toggle row 3 */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/20 border border-slate-850">
                <div>
                  <div className="text-sm font-semibold text-slate-200">Post-Launch Sale Profit</div>
                  <div className="text-xs text-slate-450 mt-0.5">{asset.exitDesc}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={asset.exit}
                    onCheckedChange={() => handleToggle(asset.id, 'exit', asset.exit)}
                    className="data-[state=checked]:bg-primary border-slate-700"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
