import { useApproveOrRejectCommissionMutation } from '@/store/api/commissionPctApi';

export default function CommissionModal({ data, onClose }: { data: any; onClose: () => void }) {
  const [approveOrReject, { isLoading }] = useApproveOrRejectCommissionMutation();

  const handleAction = async (status: 'Approved' | 'Rejected') => {
    await approveOrReject({
      assetOwnerInviteId: data.id,
      status,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-2xl p-6 bg-slate-900 rounded-xl">
        <h2 className="mb-4 text-xl font-bold text-white">Commission Details</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-slate-300">
          <div className="p-3.5 rounded-lg border  transition-all shadow-sm">
            <p className="text-lg font-semibold">Asset</p>
            <p> {data.propertyDetails?.assetTitle}</p>
          </div>
          <div className="p-3.5 rounded-lg border  transition-all shadow-sm">
            <p className="text-lg font-semibold">City:</p>
            <p> {data.propertyDetails?.city}</p>
          </div>
          <div className="p-3.5 rounded-lg border  transition-all shadow-sm">
            <p className="text-lg font-semibold">Owner:</p>
            <p>
              {data.assetOwnerDetails?.firstName} {data.assetOwnerDetails?.lastName}
            </p>
          </div>
          <div className="p-3.5 rounded-lg border  transition-all shadow-sm">
            <p className="text-lg font-semibold">Proposed %:</p>
            <p>{data.proposedCommissionPct}%</p>
          </div>
          <div className="p-3.5 rounded-lg border  transition-all shadow-sm">
            <p className="text-lg font-semibold">Final %:</p>
            <p> {data.finalCommissionPct}%</p>
          </div>
          <div className="p-3.5 rounded-lg border  transition-all shadow-sm">
            <p className="text-lg font-semibold">Status:</p>
            <p> {data.adminStatus}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg border  transition-all shadow-sm mt-4">
          <p className="text-lg font-semibold">Broker Note:</p>
          <p>{data.brokerNote}</p>
        </div>
        {/* Buttons */}
        {data.adminStatus === 'Pending' && (
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => handleAction('Rejected')}
              disabled={isLoading}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Reject
            </button>

            <button
              onClick={() => handleAction('Approved')}
              disabled={isLoading}
              className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              Approve
            </button>
          </div>
        )}

        <div className="mt-4 text-right">
          <button onClick={onClose} className="font-serif text-lg text-slate-400 hover:text-white">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
