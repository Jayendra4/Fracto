import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FolderOpen, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

import Loader from '@/components/common/Loader';
import { FileViewerModal } from '@/components/common/FileViewerModal';
import { useDebounce } from '@/hooks';
import { useGetSpvAssetsDocumentsQuery, SPVAssetsDocumentsRecord } from '@/store/api/spvApi';

const DocumentVault = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Pagination states
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(10);

  // Selected SPV state for drill-down
  const [selectedSpvId, setSelectedSpvId] = useState<number | null>(null);

  // Modal states for preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Reset pagination on search change
  useEffect(() => {
    setSkip(0);
  }, [debouncedSearch]);

  const { data, isLoading, isError } = useGetSpvAssetsDocumentsQuery({
    skip,
    take,
    search: debouncedSearch || undefined,
  });

  const spvList = data?.data || [];
  const totalCount = data?.count || 0;

  // Find the currently selected SPV record reactively
  const selectedSpv = useMemo(() => {
    if (selectedSpvId === null) return null;
    return spvList.find((spv) => spv.spvId === selectedSpvId) || null;
  }, [selectedSpvId, spvList]);

  const handleViewDocument = (url: string) => {
    if (!url) {
      toast.error('Document URL is not available.');
      return;
    }
    setPreviewUrl(url);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewUrl(null);
  };

  const formatDocName = (name: string) => {
    if (!name || String(name).trim() === '') return '—';
    return name
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]/g, ' ')
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive bg-destructive/5 p-6 text-center text-sm text-destructive">
        Failed to load document vault. Please try again.
      </div>
    );
  }

  const currentPage = Math.floor(skip / take) + 1;
  const totalPages = Math.ceil(totalCount / take) || 1;

  return (
    <div className="w-full min-w-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Document Vault</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All SPV-level legal, governance, and financial documents.
        </p>
      </div>

      {selectedSpv ? (
        // --- DRILL DOWN: SPV DOCUMENTS VIEW ---
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setSelectedSpvId(null)}
            className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to SPV List
          </button>

          <div className="overflow-hidden rounded-xl border border-border bg-background">
            <div className="border-b border-border bg-muted/20 px-5 py-4">
              <h2 className="text-base font-bold text-foreground">
                {selectedSpv.spvName} ({selectedSpv.spvCode})
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Listing all documents grouped by asset
              </p>
            </div>

            {selectedSpv.assets && selectedSpv.assets.length > 0 ? (
              <div className="divide-y divide-border">
                {selectedSpv.assets.map((asset) => (
                  <div key={asset.assetId} className="bg-background">
                    <div className="bg-muted/10 px-5 py-2.5 border-b border-border">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {asset.assetTitle}
                      </h3>
                    </div>

                    {asset.documents && asset.documents.length > 0 ? (
                      <div className="divide-y divide-border">
                        {asset.documents.map((doc) => (
                          <div
                            key={doc.documentId}
                            className="flex min-h-[48px] items-center justify-between gap-4 px-5 py-3 "
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground ">
                                {formatDocName(doc.name)}
                              </p>
                              <div className="flex flex-wrap gap-x-2 gap-y-1 mt-0.5 text-xs text-muted-foreground">
                                {/* <span>Type: {doc.type}</span> */}
                                <span>
                                  Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                </span>
                                {doc.remark && (
                                  <>
                                    <span>•</span>
                                    <span className="italic text-yellow-600 dark:text-yellow-400">
                                      Remark: {doc.remark}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleViewDocument(doc.url)}
                                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <Eye className="h-3.5 w-3.5" /> View
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-5 py-6 text-center text-sm text-muted-foreground">
                        No documents found for this asset.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                No assets or documents found for this SPV.
              </div>
            )}
          </div>
        </div>
      ) : (
        // --- MAIN VIEW: SPV LIST ---
        <div className="space-y-4">
          <div className="flex w-full items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SPVs by name or code..."
              className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-background">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      SPV Name
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      SPV Code
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Assets
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Documents
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {spvList.length > 0 ? (
                    spvList.map((spv) => {
                      const totalDocs =
                        spv.assets?.reduce(
                          (sum, asset) => sum + (asset.documents?.length || 0),
                          0
                        ) || 0;

                      return (
                        <tr key={spv.spvId} className="">
                          <td className="px-5 py-3 text-sm font-medium text-foreground">
                            {spv.spvName}
                          </td>
                          <td className="px-5 py-3 text-sm text-muted-foreground">{spv.spvCode}</td>
                          <td className="px-5 py-3 text-sm text-muted-foreground">
                            {spv.assets?.length || 0}
                          </td>
                          <td className="px-5 py-3 text-sm text-muted-foreground">{totalDocs}</td>
                          <td className="px-5 py-3 text-right text-sm">
                            <button
                              type="button"
                              onClick={() => navigate(`/document-vault-list?spvId=${spv.spvId}`)}
                              className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <FolderOpen className="h-4 w-4" /> View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-sm text-muted-foreground"
                      >
                        No SPVs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between border-t border-border pt-4 mt-6">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{skip + 1}</span> to{' '}
                <span className="font-medium text-foreground">
                  {Math.min(skip + take, totalCount)}
                </span>{' '}
                of <span className="font-medium text-foreground">{totalCount}</span> SPVs
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">SPVs per page</p>
                  <select
                    value={take}
                    onChange={(e) => {
                      setTake(Number(e.target.value));
                      setSkip(0);
                    }}
                    className="h-8 w-[70px] rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
                  >
                    {[5, 10, 20, 50].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSkip((prev) => Math.max(0, prev - take))}
                    disabled={skip === 0}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-foreground transition-colors hover:bg-muted/50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setSkip((prev) => prev + take)}
                    disabled={skip + take >= totalCount}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-foreground transition-colors hover:bg-muted/50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Document Viewer Modal */}
      <FileViewerModal open={isPreviewOpen} onClose={handleClosePreview} url={previewUrl} />
    </div>
  );
};

export default DocumentVault;
