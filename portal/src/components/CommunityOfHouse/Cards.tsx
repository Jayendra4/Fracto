/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
// GroupCard.tsx
import { useJoinedGroups, useJoinGroup } from '@/api/group.api';
import { ROUTES } from '@/constants';
// import { ROUTES } from '@/constants/routes.constant';
import type { RootState } from '@/redux/store';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import StatusModal from '../Modals/Status';

type GroupCardProps = {
  id: number;
  title?: string;
  description?: string;
  image?: string;
  isLoading?: boolean;
  _count?: {
    groupMember: number;
  };
};

const GroupCard: React.FC<GroupCardProps> = ({
  id,
  title,
  description,
  image,
  _count,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.authLogin
  );
  const [statusModal, setStatusModal] = useState({
    open: false,
    status: 'error' as 'success' | 'error',
    title: '',
    message: '',
  });

  const isInvestor = user?.type == 'CorporateInvestor';

  const accountId = user?.id;
  const { mutate: joinGroup, isPending: isJoining } = useJoinGroup();

  const { data: joinedGroups } = useJoinedGroups(accountId, isAuthenticated);
  const isJoined = joinedGroups?.find((g) => g.id === id)?.isJoined ?? false;

  // ya jo lib use kar rahe ho

  const handleJoin = (groupId: number, onJoined?: () => void) => {
    joinGroup(groupId, {
      onSuccess: () => {
        setStatusModal({
          open: true,
          status: 'success',
          title: 'Success',
          message: 'Joined primary club successfully',
        });
        onJoined?.();
      },
      onError: (err: any) => {
        setStatusModal({
          open: true,
          status: 'error',
          title: 'Error',
          message: err?.message || 'Failed to join primary club',
        });
      },
    });
  };

  return (
    <div className="font-work bg-[#132436] rounded-xl p-5 md:p-6 text-center shadow-lg h-full w-full relative overflow-hidden flex flex-col justify-between select-none">
      {/* SKELETON */}
      {isLoading ? (
        <div className="animate-pulse flex flex-col items-center justify-between h-full ">
          {/* Avatar */}
          <div className="w-[80px] md:w-[100px] h-[80px] md:h-[100px] rounded-full bg-gray-700 mb-4" />

          {/* Title */}
          <div className="h-5 w-40 bg-gray-700 rounded mb-2" />

          {/* Members */}
          <div className="h-4 w-24 bg-gray-700 rounded mb-4" />

          {/* Description */}
          <div className="space-y-2 w-full px-4">
            <div className="h-3 bg-gray-700 rounded w-full" />
            <div className="h-3 bg-gray-700 rounded w-5/6" />
            <div className="h-3 bg-gray-700 rounded w-4/6" />
            <div className="h-3 bg-gray-700 rounded w-3/6" />
          </div>

          {/* Buttons */}
          <div className="w-full space-y-2 pt-6">
            <div className="h-10 bg-gray-700 rounded w-full" />
            <div className="h-10 bg-gray-700 rounded w-full" />
          </div>
        </div>
      ) : (
        <>
          {/* Background */}
          <div className="absolute inset-0 opacity-5 bg-[url('/pattern.png')] bg-cover" />

          <img
            src="/images/Community/Frame90.png"
            alt="side-img"
            className="absolute top-0 right-0 size-24 md:size-40"
          />

          {/* Avatar */}
          <img
            src={image}
            alt={title}
            className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full mx-auto mb-4 relative z-10 shrink-0"
          />

          {/* Title */}
          <h3
            className="text-white font-serif font-20 font-semibold relative z-10 cursor-pointer line-clamp-2 min-h-[56px] flex items-center justify-center leading-snug px-1 mb-1"
            title={title}
          >
            {title}
          </h3>

          {/* Members */}
          <p className="font-14 text-gray-400 mb-3 relative z-10 shrink-0">
            {_count?.groupMember || 0} members
          </p>

          {/* Description */}
          <p className="font-14 mb-4 relative z-10 text-gray-300 line-clamp-4 min-h-[96px] px-2 leading-relaxed">
            {description}
          </p>

          {/* Buttons */}
          <div className="space-y-2 relative z-10 pt-2 mt-auto w-full">
            {isJoined ? (
              <button
                type="button"
                onClick={() => {
                  navigate(ROUTES.JOIN_GROUP.replace(':id', String(id)));
                }}
                className="font-16 font-semibold bg-gradient-to-r cursor-pointer w-full py-2.5 rounded-xl from-[#3A76C0] to-[#60A5FA] text-white transition-all duration-300 hover:shadow-lg hover:brightness-110 shadow-md"
              >
                <span className="flex items-center justify-center w-full">
                  View Details
                </span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isJoining}
                onClick={() => {
                  if (isAuthenticated) {
                    handleJoin(id);
                  } else {
                    navigate('/login', {
                      state: { groupId: id },
                    });
                  }
                }}
                className="font-16 font-semibold bg-gradient-to-r cursor-pointer w-full py-2.5 rounded-xl from-[#3A76C0] to-[#60A5FA] text-white transition-all duration-300 hover:shadow-lg hover:brightness-110 shadow-md disabled:opacity-60"
              >
                <span className="flex items-center justify-center w-full">
                  {isJoining ? 'Joining...' : 'Join primary club'}
                </span>
              </button>
            )}

            {!isInvestor && (
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    if (!isJoined) {
                      handleJoin(id, () => {
                        navigate(`/dashboard/add-asset?groupId=${id}`);
                      });
                    } else {
                      navigate(`/dashboard/add-asset?groupId=${id}`);
                    }
                  } else {
                    navigate('/login', {
                      state: { groupId: id },
                    });
                  }
                }}
                className="w-full font-16 font-semibold cursor-pointer rounded-xl border border-blue-400 py-2.5 text-white transition-all duration-300 hover:shadow-lg hover:bg-white/5"
              >
                Share Your Asset
              </button>
            )}
          </div>
        </>
      )}
      <StatusModal
        open={statusModal.open}
        status={statusModal.status}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => setStatusModal((prev) => ({ ...prev, open: false }))}
        onContinue={() => setStatusModal((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
};

export default GroupCard;
