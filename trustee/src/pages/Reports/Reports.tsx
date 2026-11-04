import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/redux';

interface NewReportItem {
  name: string;
  endpoint: string | null;
  filename: string;
}

const newReports: NewReportItem[] = [
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
];

const Reports = () => {
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);
  const [exportingType, setExportingType] = useState<string | null>(null);
  const { trusteeAccessToken } = useAuth();

  const handleDownloadNewReport = async (report: NewReportItem) => {
    if (!report.endpoint) {
      toast.success(`Downloading report (Mock): ${report.name}`);
      return;
    }

    setDownloadingReport(report.name);
    const token = trusteeAccessToken || localStorage.getItem('trusteeAccessToken');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

    try {
      const response = await fetch(`${baseUrl}${report.endpoint}`, {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: '*/*',
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
    const token = trusteeAccessToken || localStorage.getItem('trusteeAccessToken');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    const endpoint = `/exports/${type}`;
    const filename = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: '*/*',
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
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground font-sans">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform-wide activity, KYC, funding, and revenue reports.
        </p>
      </div>

      <div className="space-y-5">
        {/* Regulatory & Activity Reports */}
        <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
          <div className="px-6 pb-2 pt-5 bg-muted/5">
            <h2 className="text-sm font-bold text-foreground">Regulatory &amp; Activity Reports</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Audit-ready document generation</p>
          </div>

          <div>
            {newReports.map((report) => {
              const isDownloading = downloadingReport === report.name;
              return (
                <div
                  key={report.name}
                  className="flex items-center justify-between border-t px-6 py-4"
                >
                  <span className="text-sm text-foreground">{report.name}</span>

                  <button
                    type="button"
                    onClick={() => handleDownloadNewReport(report)}
                    disabled={isDownloading}
                    className="text-sm font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1.5 focus:outline-none disabled:opacity-50"
                  >
                    {isDownloading ? 'Downloading...' : 'Download'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Export Data */}
        <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
          <div className="px-6 pb-4 pt-5 bg-muted/5">
            <h2 className="text-sm font-bold text-foreground">Export Data</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Raw data export for external analysis (CSV)
            </p>
          </div>

          <div className="border-t px-6 py-5">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleExport('users')}
                disabled={exportingType !== null}
                className="rounded-md border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
              >
                {exportingType === 'users' ? 'Exporting...' : 'Export Users (CSV)'}
              </button>
              <button
                type="button"
                onClick={() => handleExport('assets')}
                disabled={exportingType !== null}
                className="rounded-md border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
              >
                {exportingType === 'assets' ? 'Exporting...' : 'Export Assets (CSV)'}
              </button>
              <button
                type="button"
                onClick={() => handleExport('transactions')}
                disabled={exportingType !== null}
                className="rounded-md border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
              >
                {exportingType === 'transactions' ? 'Exporting...' : 'Export Transactions (CSV)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
