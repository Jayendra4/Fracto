import { useState } from 'react';
import { BackButton } from '@/components/common/BackButton';
import { Check } from 'lucide-react';
import {
  useGetGroupListByAssetQuery,
  useGetGroupsQuery,
  useShareAssetInGroupMutation,
} from '@/store/api/allGroupApi';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';

export default function ShareToGroups() {
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const { id } = useParams();
  const { data } = useGetGroupsQuery({
    skip: 0,
    take: 1000,
    groupStatus: 'Active',
  });

  const toggleGroup = (id: number) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id]
    );
  };

  const [shareAssetInGroup, { isLoading }] = useShareAssetInGroupMutation();

  const { data: alreadyShared } = useGetGroupListByAssetQuery({
    assetId: Number(id),
  });

  const sharedIds = new Set(alreadyShared?.groupShares?.map((g: any) => g.groupId) || []);

  const filteredGroups = data?.data?.filter((group: any) => !sharedIds.has(group.id)) || [];

  console.log(alreadyShared?.groupShares, 'alreadyShared');

  const handleShare = async () => {
    try {
      await shareAssetInGroup({
        sharedAssetId: Number(id),
        groupIds: selectedGroups, // array
      }).unwrap();

      toast.success('Asset shared successfully');
      setSelectedGroups([]);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Error');
    }
  };

  return (
    <div className="w-full p-6 pb-24 space-y-6 bg-slate-950 text-white min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4">
        <BackButton />
        <h2 className="text-2xl font-bold">Share to Groups</h2>
      </div>

      {/* Group List */}
      <div className="space-y-3">
        {!filteredGroups?.length ? (
          <div className="text-center py-10 text-slate-400">No groups found</div>
        ) : (
          filteredGroups.map((group) => {
            const isSelected = selectedGroups.includes(group.id);

            return (
              <div
                key={group.id}
                onClick={() => toggleGroup(group.id)}
                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition border
        ${
          isSelected
            ? 'bg-blue-500/10 border-blue-500'
            : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
        }`}
              >
                {/* Group Name */}
                <span className="text-lg">
                  {group?.title} ( {group?._count?.groupMember} Members )
                </span>

                {/* Checkbox */}
                <div
                  className={`w-6 h-6 flex items-center justify-center rounded-full border
          ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-600'}`}
                >
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Submit Button */}
      <div className="fixed flex justify-end bottom-0 left-0 w-full p-4 bg-slate-950 border-t border-slate-800">
        <button
          onClick={handleShare}
          className="w-[150px] py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-semibold"
        >
          Share Now
        </button>
      </div>
    </div>
  );
}
