import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks';
import { useHasPermission } from '@/hooks/redux';
import { Loader2 } from 'lucide-react';

interface ReportItem {
  name: string;
  endpoint: string | null;
  filename: string;
}

export function ComplianceReportsTab() {
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);
  const [exportingType, setExportingType] = useState<string | null>(null);
  const { accessToken } = useAuth();
  const canExportUsers = useHasPermission('compliance_report.user_export');
  const canExportAssets = useHasPermission('compliance_report.asset_export');
  const canExportTransactions = useHasPermission('compliance_report.transaction_export');
  const canExportAny = canExportUsers || canExportAssets || canExportTransactions;

  const reports: ReportItem[] = [
    {
      name: 'Platform Activity Report — Last 30 Days',
      endpoint: '/reports/platform-activity',
      filename: 'platform_activity_last_30_days.csv',
    },
    {
      name: 'KYC Status Report — All Users',
      endpoint: '/reports/kyc-status',
      filename: 'kyc_status_all_users.csv',
    },
    {
      name: 'Asset Pipeline Report',
      endpoint: '/reports/asset-pipeline',
      filename: 'asset_pipeline_report.csv',
    },
    {
      name: 'Funding Pipeline Report',
      endpoint: '/reports/funding-pipeline',
      filename: 'funding_pipeline_report.csv',
    },
    {
      name: 'Broker Performance Report',
      endpoint: '/reports/broker-performance',
      filename: 'broker_performance_report.csv',
    },
    {
      name: 'Compliance Red Flags Summary',
      endpoint: null,
      filename: 'compliance_red_flags_summary.csv',
    },
  ];

  const handleDownload = async (report: ReportItem) => {
    if (!report.endpoint) {
      toast.success(`Downloading report (Mock): ${report.name}`);
      return;
    }

    setDownloadingReport(report.name);
    const token = accessToken || localStorage.getItem('accessToken');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

    try {
      const response = await fetch(`${baseUrl}${report.endpoint}`, {
        method: 'GET',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Accept': '*/*',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', report.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`${report.name} downloaded successfully`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`Failed to download: ${report.name}`);
    } finally {
      setDownloadingReport(null);
    }
  };

  const handleExport = async (type: 'users' | 'assets' | 'transactions') => {
    setExportingType(type);
    const token = accessToken || localStorage.getItem('accessToken');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    const endpoint = `/exports/${type}`;
    const filename = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Accept': '*/*',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${type} successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export ${type}`);
    } finally {
      setExportingType(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">Compliance Reports</h2>
        <p className="text-slate-400">Platform-wide activity, KYC, funding, and revenue reports.</p>
      </div>

      {/* Reports Download Card */}
      <Card className="bg-slate-900/50 border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-lg text-white font-semibold">Regulatory &amp; Activity Reports</CardTitle>
          <CardDescription className="text-slate-400">Audit-ready document generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3.5">
          {reports.map((report, idx) => {
            const isDownloading = downloadingReport === report.name;
            return (
              <div 
                key={idx} 
                className="flex items-center justify-between p-3 rounded-lg bg-slate-950/20 border border-slate-850 hover:bg-slate-800/10 transition-colors"
              >
                <span className="text-sm font-semibold text-slate-300">{report.name}</span>
                <button 
                  onClick={() => handleDownload(report)}
                  disabled={isDownloading}
                  className={`text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1.5 focus:outline-none ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isDownloading && <Loader2 className="h-3 w-3 animate-spin" />}
                  {isDownloading ? 'Downloading...' : 'Download'}
                </button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Export Card */}
      {canExportAny && (
      <Card className="bg-slate-900/50 border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-lg text-white font-semibold">Export Data</CardTitle>
          <CardDescription className="text-slate-400">Raw data export for external analysis (CSV)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {canExportUsers && (
              <Button
                variant="outline"
                onClick={() => handleExport('users')}
                disabled={exportingType !== null}
                className="font-semibold text-xs h-9 flex items-center gap-1.5"
              >
                {exportingType === 'users' && <Loader2 className="h-3 w-3 animate-spin" />}
                {exportingType === 'users' ? 'Exporting...' : 'Export Users (CSV)'}
              </Button>
            )}
            {canExportAssets && (
              <Button
                variant="outline"
                onClick={() => handleExport('assets')}
                disabled={exportingType !== null}
                className="font-semibold text-xs h-9 flex items-center gap-1.5"
              >
                {exportingType === 'assets' && <Loader2 className="h-3 w-3 animate-spin" />}
                {exportingType === 'assets' ? 'Exporting...' : 'Export Assets (CSV)'}
              </Button>
            )}
            {canExportTransactions && (
              <Button
                variant="outline"
                onClick={() => handleExport('transactions')}
                disabled={exportingType !== null}
                className="font-semibold text-xs h-9 flex items-center gap-1.5"
              >
                {exportingType === 'transactions' && <Loader2 className="h-3 w-3 animate-spin" />}
                {exportingType === 'transactions' ? 'Exporting...' : 'Export Transactions (CSV)'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}

