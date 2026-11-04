/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  useGroupAssets,
  useGroupById,
  useGroups,
  useJoinedGroups,
  useJoinGroup,
  useLeaveGroup,
  // useOnInterest,
  useUserAssets,
} from '@/api/group.api';
import { HiBadgeCheck } from 'react-icons/hi';
import { FiArrowLeft, FiSearch } from 'react-icons/fi';
import { useOnboarding } from '@/hooks';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import Loader from '../Loader';
// import { Link } from 'react-router-dom';
import StatusModal from '../Modals/Status';
import { IoChatbubble, IoImages, IoImagesOutline } from 'react-icons/io5';
import type { Swiper as SwiperType } from 'swiper';
import { API_BASE_URL } from '../Dashboard/Chat/utils/chatUtils';
import GalleryModal from './GalleryModal';
import { ActiveProposalsIcon } from './StatIcons';
import { BsEyeFill, BsEyeSlashFill } from 'react-icons/bs';
import { createPropertyChatApi } from '@/api/chat.api';
import { useQueryClient } from '@tanstack/react-query';
import { numberWithCommas } from '@/utils';
import { MapPinHouse, User } from 'lucide-react';

type Group = {
  id: number;
  title: string;
  description: string;
  image: string;
};

interface AssetDocument {
  documentUrl: string;
  documentType: string;
}

const JoinGroup: React.FC = () => {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.authLogin
  );
  const swiperRef = useRef<SwiperType | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  // const [isPaying, setIsPaying] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [searchListed, setSearchListed] = useState('');
  const [assetStatus, setAssetStatus] = useState<
    'Pending' | 'Approved' | 'Rejected' | undefined
  >(undefined);
  const [page, setPage] = useState(0);
  const [pageGroup, setGroupPage] = useState(0);
  const [allSlides, setAllSlides] = useState<AssetDocument[]>([]);

  const take = 9;
  const { data, isLoading, error } = useGroups();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  // The dashboard-embedded route (/dashboard/primary-club-details/:id)
  // already has the shell's own shared back button — hide this one there
  // and keep it only on the standalone /primary-club-details/:id route.
  const isDashboardEmbedded = location.pathname.startsWith(
    '/dashboard/primary-club-details/'
  );
  const queryClient = useQueryClient();
  const { needsOnboarding } = useOnboarding();
  const groupId = Number(id);
  const [statusModal, setStatusModal] = useState({
    open: false,
    status: 'error' as 'success' | 'error',
    title: '',
    message: '',
    redirect: false,
  });
  // const hasCalled = useRef(false);
  const [leaveGroupConfirm, setLeaveGroupConfirm] = useState(false);
  const [leavePassword, setLeavePassword] = useState('');
  const [leavePasswordError, setLeavePasswordError] = useState('');
  const [showLeavePassword, setShowLeavePassword] = useState(false);
  const { data: groupDetails, isLoading: singleLoading } =
    useGroupById(groupId);

  const { mutate: joinGroup, isPending: isJoining } = useJoinGroup();
  const { mutate: leaveGroup, isPending: isLeaving } = useLeaveGroup();

  function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
  }
  const debouncedSearch = useDebounce(search, 500);
  const debouncedListedSearch = useDebounce(searchListed, 500);
  const finalSearch =
    debouncedSearch && debouncedSearch.trim().length >= 2
      ? debouncedSearch
      : undefined;
  const finalListedSearch =
    debouncedListedSearch && debouncedListedSearch.trim().length >= 2
      ? debouncedListedSearch
      : undefined;
  const isInvestor = user?.type == 'CorporateInvestor';
  const isBroker = user?.type == 'Broker';
  const accountId = user?.id;
  const { data: joinedGroups } = useJoinedGroups(accountId, isAuthenticated);
  const isAlreadyJoined =
    joinedGroups?.find((g) => g.id === groupId)?.isJoined ?? false;
  const { data: myAssets, isLoading: myAssetLoading } = useUserAssets({
    accountId,
    groupId,
    skip: page * take,
    take,
    search: finalSearch || '',
    assetStatus,
  });

  const { data: myGroupAssets, isLoading: groupAssetLoading } = useGroupAssets({
    groupId,
    skip: pageGroup * take,
    take,
    search: finalListedSearch || '',
    assetStatus: 'Approved',
  });

  // const { mutate: onInterest } = useOnInterest(groupId);
  const myAssetsList = myAssets?.data || [];
  const myAssetsTotalCount = myAssets?.count || 0;
  const myGroupAssetsCount = myGroupAssets?.count || 0;
  const group = id
    ? data?.data?.find((g: Group) => String(g.id) === id)
    : undefined;

  const handleJoinClub = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { groupId: id } });
      return;
    }

    joinGroup(groupId, {
      onSuccess: () => {
        setStatusModal({
          open: true,
          status: 'success',
          title: 'Success',
          message: 'You have successfully joined the club',
          redirect: false,
        });
      },
      onError: (err: any) => {
        setStatusModal({
          open: true,
          status: 'error',
          title: 'Error',
          message: err?.message || 'Failed to join primary club',
          redirect: false,
        });
      },
    });
  };

  const handleLeave = () => {
    if (!leavePassword.trim()) {
      setLeavePasswordError('Password is required');
      return;
    }
    setLeavePasswordError('');
    leaveGroup(
      { groupId, password: leavePassword },
      {
        onSuccess: () => {
          setLeaveGroupConfirm(false);
          setLeavePassword('');
          setStatusModal({
            open: true,
            status: 'success',
            title: 'Left Group',
            message: 'You have successfully left the group',
            redirect: false,
          });
          navigate('/');
        },
        onError: (err: any) => {
          setStatusModal({
            open: true,
            status: 'error',
            title: 'Left Group',
            message: err?.message,
            redirect: false,
          });
          setLeavePasswordError(err?.message || 'Incorrect password');
        },
      }
    );
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'ReviewReject':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const openModal = (index: number, data: AssetDocument[] = []) => {
    if (!data || data.length === 0) return;

    const assetImages = data
      .filter((d) => d.documentType === 'ASSET_IMAGE')
      .map((d) => {
        const url = d.documentUrl || '';

        return {
          ...d,
          documentUrl: url.startsWith('http')
            ? url
            : `${API_BASE_URL}/storage/${url}`,
        };
      });

    setAllSlides(assetImages);

    if (isOpen && swiperRef.current) {
      swiperRef.current.slideTo(index);
      return;
    }

    if (assetImages.length > 0) {
      setIsOpen(true);
    } else {
      setStatusModal({
        open: true,
        status: 'error',
        title: 'Error',
        message: 'Gallery Images Not Available',
        redirect: false,
      });
    }

    setTimeout(() => {
      if (swiperRef.current) {
        swiperRef.current.slideTo(index);
      }
    }, 100);
  };

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;

      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';

      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !swiperRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!swiperRef.current) return;

      if (e.key === 'ArrowRight') {
        swiperRef.current.slideNext();
      }

      if (e.key === 'ArrowLeft') {
        swiperRef.current.slidePrev();
      }

      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (isLoading) {
    return (
      <div className="bg-[#F4F6F9] dark:bg-[#0B0B0B] text-[#0B2545] dark:text-white p-10 min-h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#F4F6F9] dark:bg-[#0B0B0B] text-red-500 p-10 min-h-screen">
        Error loading group
      </div>
    );
  }

  if (!group) {
    return (
      <div className="bg-[#F4F6F9] dark:bg-[#0B0B0B] text-[#0B2545] dark:text-white p-10 min-h-screen">
        Group not found
      </div>
    );
  }

  // const handlePayment = async (groupId: number, assetId: number) => {
  //   setIsPaying(assetId);
  //   onInterest(
  //     { groupId, sharedAssetId: assetId },
  //     {
  //       onSuccess: (res: any) => {
  //         if (!res?.success) {
  //           setIsPaying(null);
  //           setStatusModal({
  //             open: true,
  //             status: 'error',
  //             title: 'Error',
  //             message: res.message || 'Failed to Processing',
  //             redirect: false,
  //           });
  //           return;
  //         }

  //         if (res?.success) {
  //           setIsPaying(null);
  //           setStatusModal({
  //             open: true,
  //             status: 'success',
  //             title: 'Congratulations',
  //             message: 'You have successfully shown interest in this property.',
  //             redirect: false,
  //           });
  //         }
  //       },

  //       onError: () => {
  //         setIsPaying(null);
  //         setStatusModal({
  //           open: true,
  //           status: 'error',
  //           title: 'Error',
  //           message: 'Failed to initiate payment',
  //           redirect: false,
  //         });
  //       },
  //     }
  //   );
  // };

  const handleStartChat = async (assetId: number) => {
    try {
      const response = await createPropertyChatApi(assetId);
      if (response.success && response.data) {
        await queryClient.invalidateQueries({ queryKey: ['my-chats'] });
        navigate('/dashboard/messages', {
          state: { newChatId: response.data.id },
        });
      }
    } catch (err) {
      console.error('❌ Chat Creation Error:', err);
    }
  };
  return (
    <>
      {singleLoading && <Loader />}
      <div className="w-full bg-[#F4F6F9] dark:bg-[#0B0B0B]">
        <div
          className={` ${needsOnboarding ? 'mt-[120px] md:mt-[100px]' : 'mt-[40px]'} max-w-[1600px]  mx-auto min-h-screen py-12 md:py-24 px-4 md:px-10 font-work`}
        >
          {/* <Link to="/primary-club"> */}{' '}
          {!isDashboardEmbedded && (
            <button
              onClick={() => navigate(-1)}
              className="mb-4 font-serif px-4 py-2 text-[#0B2545] dark:text-white w-full rounded-lg flex gap-1 text-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <FiArrowLeft className="mr-2 mt-1" />
              Back
            </button>
          )}
          {/* </Link> */}
          <div className="relative bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 shadow-sm p-6 rounded-xl flex flex-col md:flex-row items-center gap-5 min-h-[355px] overflow-hidden text-center md:text-left">
            <img
              src={groupDetails?.image || 'https://via.placeholder.com/100'}
              className="w-40 h-40 md:w-50 md:h-50 mx-auto md:mx-10 rounded-xl object-cover shadow-md"
            />

            <div className="z-10">
              <h2 className="font-serif text-xl md:text-3xl font-semibold flex items-center justify-center md:justify-start gap-2 text-[#0B2545] dark:text-white ">
                {groupDetails?.title || '-'}
                <span className="text-[#3A76C0] dark:text-[#73B7FF] text-xl md:text-2xl">
                  <HiBadgeCheck />
                </span>
              </h2>
              <span className="inline-block text-[#3A76C0] dark:text-[#73B7FF] px-2 py-0.5 rounded-full bg-[#3A76C0]/10 dark:bg-white/10 text-sm md:text-md max-w-2xl mt-1 leading-relaxed">
                #{groupDetails?.category?.name || '-'}
              </span>
              <p className="text-gray-500 dark:text-gray-400 text-sm md:text-md max-w-2xl mt-1 leading-relaxed">
                {groupDetails?.description || '-'}
              </p>

              {!isInvestor && (
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login', {
                        state: { groupId: id },
                      });
                      return;
                    }

                    if (isBroker) {
                      navigate(`/dashboard/add-asset?groupId=${groupId}`);
                      return;
                    }

                    navigate(`/dashboard/add-asset?groupId=${groupId}`);
                  }}
                  className="mt-4 px-6 py-2.5 md:px-10 md:py-2.5 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white font-16 font-semibold transition-all duration-300 hover:shadow-lg hover:brightness-110 shadow-md cursor-pointer"
                >
                  Share Your Asset
                </button>
              )}

              {!isAlreadyJoined && (
                <button
                  type="button"
                  onClick={handleJoinClub}
                  disabled={isJoining}
                  className={`mt-4 px-6 ${!isInvestor && 'ml-3'} py-2.5 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white font-16 font-semibold transition-all duration-300 hover:shadow-lg hover:brightness-110 shadow-md cursor-pointer disabled:opacity-60`}
                >
                  {isJoining ? 'Joining...' : 'Join Club'}
                </button>
              )}

              {isAuthenticated && isAlreadyJoined && (
                <button
                  type="button"
                  onClick={() => setLeaveGroupConfirm(true)}
                  className={`mt-4 px-6 ${!isInvestor && 'ml-3'} py-2.5 inline-flex items-center justify-center rounded-xl border border-red-600/50 text-red-600 font-16 font-semibold hover:shadow-lg hover:bg-red-500/10 transition-all duration-300 cursor-pointer`}
                >
                  Leave Group
                </button>
              )}
            </div>
            {/* 
            <GroupPatternIcon className="absolute -top-5 right-0 w-40 h-40 text-[#0B2545] dark:text-white opacity-20" /> */}
          </div>
          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 ">
            <div className="bg-white dark:bg-[#132436] shadow-sm rounded-xl border border-[#E3E7EE] dark:border-white/10 relative px-6 py-6 lg:px-10 lg:py-8">
              {/* <MembersIcon className="absolute top-10 right-4 w-12 h-12 text-[#0B2545] dark:text-white opacity-70" /> */}
              <User className="absolute top-10 right-4 w-12 h-12 text-[#0B2545] dark:text-white opacity-70" />
              <h3 className="text-sm text-gray-500 dark:text-gray-400 pb-8">
                Member
              </h3>
              <p className="text-2xl font-semibold text-[#0B2545] dark:text-white -pt-5">
                {groupDetails?._count?.groupMember}
              </p>
            </div>
            <div className="bg-white dark:bg-[#132436] shadow-sm rounded-xl border border-[#E3E7EE] dark:border-white/10 relative px-6 py-6 lg:px-10 lg:py-8">
              <MapPinHouse className="absolute top-10 right-4 w-12 h-12 text-[#0B2545] dark:text-white opacity-70" />
              {/* <PropertiesIcon className="absolute top-10 right-4 w-12 h-12 text-[#0B2545] dark:text-white opacity-70" /> */}
              <h3 className="text-sm text-gray-500 dark:text-gray-400 pb-8">
                Properties Listed
              </h3>
              <p className="text-2xl font-semibold text-[#0B2545] dark:text-white -pt-5">
                {myGroupAssets?.data?.length || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-[#132436] shadow-sm hidden rounded-xl border border-[#E3E7EE] dark:border-white/10 relative px-6 py-6 md:px-10 md:py-8">
              <ActiveProposalsIcon className="absolute top-10 right-4 w-12 h-12 text-[#0B2545] dark:text-white opacity-70" />
              <h3 className="text-sm text-gray-500 dark:text-gray-400 pb-8">
                Active Proposals
              </h3>
              <p className="text-lg font-semibold text-[#0B2545] dark:text-white -pt-5">
                0
              </p>
            </div>
          </div>
          {!isInvestor && (
            <div className="mt-8 p-6 rounded-xl bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 shadow-sm">
              <div className="flex flex-col sm:flex-row md:justify-between md:items-center gap-4">
                <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-semibold text-[#0B2545] dark:text-white">
                  My Listed Assets
                </h2>

                <div className="flex w-full md:w-auto items-center gap-3">
                  {/* 🔍 Search */}
                  <div className="group flex-1 md:flex-none flex items-center bg-gray-50 dark:bg-[#0d1a27] rounded-full overflow-hidden transition-all duration-500 ease-in-out w-10 md:w-10 hover:w-full md:hover:w-64 focus-within:w-full md:focus-within:w-64 border border-[#E3E7EE] dark:border-white/10 shadow-sm">
                    <div className="flex items-center justify-center w-10 h-10 text-gray-500 dark:text-gray-400 shrink-0">
                      <FiSearch size={18} />
                    </div>

                    <input
                      type="text"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(0);
                      }}
                      className="bg-transparent outline-none text-sm w-0 group-hover:w-full group-focus-within:w-full pr-3 text-[#0B2545] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-300"
                    />
                  </div>

                  {/* 🔥 STATUS FILTER */}
                  <select
                    value={assetStatus || ''}
                    onChange={(e) => {
                      const value = e.target.value as
                        | 'Pending'
                        | 'Approved'
                        | 'Rejected'
                        | '';
                      setAssetStatus(value === '' ? undefined : value);
                      setPage(0);
                    }}
                    className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-[#0d1a27] text-[#0B2545] dark:text-white border border-[#E3E7EE] dark:border-white/10 text-sm shrink-0"
                  >
                    <option value="">All</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
                Access and manage your listed assets, review their status, and
                track engagement efficiently — all in one place.
              </p>

              {!myAssetsList?.length && !myAssetLoading ? (
                <div className="flex flex-col items-center border mt-5 rounded-xl bg-gray-50 dark:bg-white/5 border-[#E3E7EE] dark:border-white/10 w-full justify-center py-10 text-[#0B2545] dark:text-white">
                  <p className="text-lg font-semibold">
                    No My Listed Assets Found
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This group has no my assets yet.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {myAssetsList.map((item, index) => {
                    const metaObj = Object.fromEntries(
                      item?.asset?.meta?.map((m) => [m.metaKey, m.metaValue]) ||
                        []
                    );

                    const location = [metaObj.city, metaObj.state]
                      .filter(Boolean)
                      .join(', ');

                    const location2 = [metaObj.country, metaObj.pincode]
                      .filter(Boolean)
                      .join(', ');

                    const landArea = metaObj.landArea;
                    const marketValue = metaObj.marketValue;

                    const validImageUrl = (item.asset?.documents ?? []).find(
                      (d) => d.documentType === 'ASSET_IMAGE'
                    )?.documentUrl;
                    const docUrl = (validImageUrl || '').startsWith('http')
                      ? validImageUrl
                      : `${import.meta.env.VITE_API_URL}/storage/${validImageUrl}`;

                    return (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 hover:scale-[1.02] transition relative"
                      >
                        <div className="relative">
                          <img
                            src={docUrl}
                            alt="Property"
                            className="w-full h-40 object-cover rounded-md"
                          />

                          <div className="absolute inset-0 bg-black/30 rounded-md"></div>

                          <span
                            className={`absolute capitalize font-bold top-3 right-3 px-3 py-1 font-11 rounded-full border backdrop-blur-sm ${getStatusStyle(
                              item.asset?.newStatus == 'ReviewReject' ||
                                item.asset?.status == 'ReviewReject'
                                ? item.asset?.newStatus
                                : item.status
                            )}`}
                            onClick={() => {
                              openModal(index, item.asset?.documents);
                            }}
                          >
                            {item.asset?.newStatus == 'ReviewReject'
                              ? 'Rejected'
                              : item.status}
                          </span>

                          <span
                            className={`absolute capitalize cursor-pointer text-white font-bold bottom-3 right-3  text-20 rounded-full backdrop-blur-sm `}
                            onClick={() => {
                              openModal(index, item.asset?.documents);
                            }}
                          >
                            <IoImagesOutline />
                          </span>
                        </div>
                        <h4
                          title={item.asset?.assetTitle}
                          className="my-3 font-serif font-20 font-semibold text-[#0B2545] dark:text-white truncate"
                        >
                          {item.asset?.assetTitle}
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400 font-12 flex justify-between">
                          Location{' '}
                          <span className="text-[#0B2545] dark:text-white">
                            {location || '-'}
                          </span>
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 font-12 flex justify-between">
                          <span className="text-[#0B2545] dark:text-white"></span>
                          <span className="text-[#0B2545] dark:text-white">
                            {location2 || '-'}
                          </span>
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 font-12 flex justify-between">
                          Area of Property{' '}
                          <span className="text-[#0B2545] dark:text-white">
                            {' '}
                            {landArea || '-'} Sq/mtr
                          </span>
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 font-12 flex justify-between">
                          Market Value{' '}
                          <span className="text-[#0B2545] dark:text-white">
                            {marketValue ? numberWithCommas(marketValue) : '-'}
                          </span>
                        </p>

                        {item.status == 'Approved' &&
                          !item.asset?.updateAsset && (
                            <button
                              disabled={item.status !== 'Approved'}
                              onClick={() =>
                                navigate(
                                  `/dashboard/add-asset?id=${item?.asset?.id}&step=2`
                                )
                              }
                              className="inline-flex items-center justify-center py-2.5 mt-6 w-full rounded-xl bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white font-16 font-semibold transition-all duration-300 hover:shadow-lg hover:brightness-110 shadow-md cursor-pointer"
                            >
                              Add More Information
                            </button>
                          )}

                        {item.status == 'Approved' &&
                          item.asset?.updateAsset &&
                          item.asset?.newStatus !== 'ReviewReject' && (
                            <button
                              disabled={item.status !== 'Approved'}
                              onClick={() =>
                                navigate(
                                  `/property-details/${item?.asset?.id}`,
                                  {
                                    state: {
                                      iconShow: 'NoIcon',
                                    },
                                  }
                                )
                              }
                              className="inline-flex items-center justify-center py-2.5 mt-6 w-full rounded-xl bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white font-16 font-semibold transition-all duration-300 hover:shadow-lg hover:brightness-110 shadow-md cursor-pointer"
                            >
                              Get More Details
                            </button>
                          )}
                        {(item.status === 'Rejected' ||
                          item.asset?.newStatus == 'ReviewReject') && (
                          <div className="mt-6 p-3 flex gap-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-12">
                            ❌{' '}
                            {/* <span className="font-semibold">Rejected:</span>{' '} */}
                            <span
                              title={item?.rejectNote || 'No reason provided'} // 👈 hover full text
                              className="block truncate cursor-pointer max-w-[320px]"
                            >
                              Rejected:{' '}
                              {item.asset?.newStatus == 'ReviewReject'
                                ? 'Rejected by Trustee'
                                : item?.rejectNote || 'No reason provided'}
                            </span>
                          </div>
                        )}

                        {item.status === 'Pending' && (
                          <div className="mt-6 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-12">
                            ⏳ <span className="font-semibold">Pending:</span>{' '}
                            Waiting for approval
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {myAssetsTotalCount > take && (
                <div className="flex justify-end items-center gap-4 mt-6">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                    disabled={page === 0}
                    className="px-4 py-2 rounded bg-[#1F4FE0] hover:bg-[#1a43c0] text-white disabled:opacity-50 transition-colors"
                  >
                    Prev
                  </button>

                  <span className="text-[#0B2545] dark:text-white">
                    Page {page + 1} of {Math.ceil(myAssetsTotalCount / take)}
                  </span>

                  <button
                    onClick={() =>
                      setPage((prev) =>
                        (prev + 1) * take < myAssetsTotalCount ? prev + 1 : prev
                      )
                    }
                    disabled={(page + 1) * take >= myAssetsTotalCount}
                    className="px-4 py-2 rounded bg-[#1F4FE0] hover:bg-[#1a43c0] text-white disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
          {/* PROPERTIES */}
          <div className="mt-8 p-6 rounded-xl bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:items-center">
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[#0B2545] dark:text-white">
                Listed Assets
              </h2>

              <div
                className="group flex items-center bg-gray-50 dark:bg-[#0d1a27] rounded-full overflow-hidden transition-all duration-500 ease-in-out 
    w-full sm:w-10 sm:hover:w-64 sm:focus-within:w-64 
    border border-[#E3E7EE] dark:border-white/10 shadow-sm"
              >
                {/* 🔍 Icon */}
                <div className="flex items-center justify-center w-10 h-10 text-gray-500 dark:text-gray-400 shrink-0">
                  <FiSearch size={18} />
                </div>

                {/* 🔤 Input */}
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchListed}
                  onChange={(e) => {
                    setSearchListed(e.target.value);
                    setGroupPage(0);
                  }}
                  className="bg-transparent outline-none text-sm 
        w-full sm:w-0 sm:group-hover:w-full sm:group-focus-within:w-full 
        pr-3 text-[#0B2545] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 
        opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 
        transition-all duration-300"
                />
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
              Explore properties listed in this group, review key details, and
              track available investment opportunities.
            </p>

            {!myGroupAssets?.data?.length && !groupAssetLoading ? (
              <div className="flex flex-col items-center border mt-5 rounded-xl bg-gray-50 dark:bg-white/5 border-[#E3E7EE] dark:border-white/10 w-full justify-center py-10 text-[#0B2545] dark:text-white">
                <p className="text-lg font-semibold">No Listed Assets Found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This group has no assets yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {myGroupAssets?.data?.map((item, index) => {
                  const asset = item?.sharedAsset?.asset;

                  const metaObj = Object.fromEntries(
                    asset?.meta?.map((m) => [m.metaKey, m.metaValue]) || []
                  );

                  const location = [metaObj.city, metaObj.state]
                    .filter(Boolean)
                    .join(', ');

                  const location2 = [metaObj.country, metaObj.pincode]
                    .filter(Boolean)
                    .join(', ');

                  const landArea = metaObj.landArea;
                  const marketValue = metaObj.marketValue;

                  const documents = asset?.documents || [];
                  const validImageUrl = documents.find(
                    (d) => d.documentType === 'ASSET_IMAGE'
                  )?.documentUrl;

                  const docUrl = (validImageUrl || '').startsWith('http')
                    ? validImageUrl
                    : `${import.meta.env.VITE_API_URL}/storage/${validImageUrl}`;

                  return (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-[#E3E7EE] dark:border-white/10 hover:scale-[1.02] transition relative w-full min-w-0 overflow-hidden"
                    >
                      <div className="relative">
                        <img
                          src={docUrl}
                          alt="Property"
                          className="w-full h-40 object-cover rounded-md"
                        />
                        <div className="absolute inset-0 bg-black/30 rounded-md"></div>

                        <span
                          title="Gallery"
                          className="absolute cursor-pointer text-white bottom-3 left-3 text-xl bg-black/40 hover:bg-[#3A76C0] hover:scale-125 hover:shadow-lg hover:shadow-[#3A76C0]/50 p-1.5 rounded-full transition-all duration-300 active:scale-95"
                          onClick={() => openModal(0, documents)}
                        >
                          <IoImages />
                        </span>
                      </div>

                      <div className="flex justify-between items-center gap-2 min-w-0">
                        <h4
                          title={asset?.assetTitle}
                          className="my-3 font-serif font-20 font-semibold text-[#0B2545] dark:text-white truncate min-w-0"
                        >
                          {asset?.assetTitle}
                        </h4>

                        <span
                          title={item?.isSpvCreated ? 'SPV Created' : 'Chat'}
                          aria-disabled={item?.isSpvCreated}
                          className={`text-white text-xl p-1.5 rounded-full transition-all duration-300 shrink-0 ${
                            item?.isSpvCreated
                              ? 'bg-black/20 opacity-40 cursor-not-allowed'
                              : 'cursor-pointer bg-black/40 hover:bg-[#3A76C0] hover:scale-125 hover:shadow-lg hover:shadow-[#3A76C0]/50 active:scale-95'
                          }`}
                          onClick={() => {
                            if (item?.isSpvCreated) return;
                            handleStartChat(item?.sharedAsset?.assetId);
                          }}
                        >
                          <IoChatbubble />
                        </span>
                      </div>

                      <p className="text-gray-500 dark:text-gray-400 font-12 flex justify-between gap-2 min-w-0">
                        Location{' '}
                        <span className="text-[#0B2545] dark:text-white break-words text-right">
                          {location || '-'}
                        </span>
                      </p>

                      <p className="text-gray-500 dark:text-gray-400 font-12 flex justify-between gap-2 min-w-0">
                        <span className="text-[#0B2545] dark:text-white"></span>
                        <span className="text-[#0B2545] dark:text-white break-words text-right">
                          {location2 || '-'}
                        </span>
                      </p>

                      <p className="text-gray-500 dark:text-gray-400 font-12 flex justify-between gap-2 min-w-0">
                        Area of Property{' '}
                        <span className="text-[#0B2545] dark:text-white text-right">
                          {landArea || '-'} Sq/mtr
                        </span>
                      </p>

                      <p className="text-gray-500 dark:text-gray-400 font-12 flex justify-between gap-2 min-w-0">
                        Market Value{' '}
                        <span className="text-[#0B2545] dark:text-white text-right">
                          {marketValue ? numberWithCommas(marketValue) : '-'}
                        </span>
                      </p>

                      <p className="text-gray-500 dark:text-gray-400 font-12 flex justify-between gap-2 min-w-0">
                        Interested Count{' '}
                        <span className="text-[#0B2545] dark:text-white text-right">
                          {item?.paidInterestCount || '0'} Member
                        </span>
                      </p>

                      {/* {item?.isSpvCreated ? (
                          <button
                            disabled
                            className="inline-flex items-center justify-center py-2 mt-6 w-full max-w-full rounded-lg bg-gray-500/40 text-white font-18 font-semibold cursor-not-allowed opacity-70"
                          >
                            SPV Created
                          </button>
                        ) : item?.isInterested ? (
                          <button
                            onClick={() =>
                              navigate(
                                `/property-details/${item?.sharedAsset?.assetId}`
                              )
                            }
                            className="group inline-flex items-center justify-center py-2 mt-6 w-full max-w-full rounded-lg bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white font-18 font-semibold transition-all duration-300 hover:brightness-110 active:scale-95 shadow-lg cursor-pointer"
                          >
                            View Details
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              handlePayment(
                                item.groupId,
                                item.sharedAsset.assetId
                              );
                            }}
                            disabled={isPaying === item.sharedAsset.assetId}
                            className="group inline-flex items-center justify-center py-2 mt-6 w-full max-w-full rounded-lg bg-gradient-to-r from-[#3A76C0] to-[#60A5FA] text-white font-18 font-semibold transition-all duration-300 hover:brightness-110 active:scale-95 shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isPaying === item.sharedAsset.assetId ? (
                              <span className="flex items-center justify-center gap-2">
                                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Intresting...
                              </span>
                            ) : (
                              `Interested`
                            )}
                          </button>
                        )} */}
                      <button
                        onClick={() =>
                          navigate(
                            `/property-details/${item?.sharedAsset?.assetId}`
                          )
                        }
                        className="inline-flex items-center justify-center mt-6 w-full max-w-full font-16 font-semibold bg-gradient-to-r cursor-pointer rounded-xl from-[#3A76C0] to-[#60A5FA] text-white py-2.5 transition-all duration-300 hover:shadow-lg hover:brightness-110 shadow-md"
                      >
                        View Details
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {myGroupAssetsCount > take && (
              <div className="flex justify-end items-center gap-4 mt-6">
                <button
                  onClick={() => setGroupPage((prev) => Math.max(prev - 1, 0))}
                  disabled={pageGroup === 0}
                  className="px-4 py-2 rounded bg-[#1F4FE0] hover:bg-[#1a43c0] text-white disabled:opacity-50 transition-colors"
                >
                  Prev
                </button>

                <span className="text-[#0B2545] dark:text-white">
                  Page {pageGroup + 1} of {Math.ceil(myGroupAssetsCount / take)}
                </span>

                <button
                  onClick={() =>
                    setGroupPage((prev) =>
                      (prev + 1) * take < myGroupAssetsCount ? prev + 1 : prev
                    )
                  }
                  disabled={(pageGroup + 1) * take >= myGroupAssetsCount}
                  className="px-4 py-2 rounded bg-[#1F4FE0] hover:bg-[#1a43c0] text-white disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
          {leaveGroupConfirm && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
              <div
                className="bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-serif text-[#0B2545] dark:text-white text-lg font-semibold mb-2">
                  Leave Group?
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
                  Are you sure you want to leave{' '}
                  <span className="text-[#0B2545] dark:text-white font-medium">
                    {groupDetails?.title}
                  </span>
                  ? You can rejoin anytime.
                </p>

                {/* Password Field */}
                <div className="mb-5">
                  <p className="text-[#0B2545] dark:text-white text-sm mb-2">
                    Enter Password <span className="text-red-500">*</span>
                  </p>
                  <div className="relative">
                    <input
                      type={showLeavePassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={leavePassword}
                      autoComplete="new-password"
                      onChange={(e) => {
                        setLeavePassword(e.target.value);
                        if (leavePasswordError) setLeavePasswordError('');
                      }}
                      className={`w-full bg-gray-50 dark:bg-[#0A1A2F] p-3 pr-10 rounded-md text-[#0B2545] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none border transition-all ${
                        leavePasswordError
                          ? 'border-red-500'
                          : 'border-[#E3E7EE] dark:border-white/10 focus:border-[#3A76C0]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLeavePassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-xs"
                    >
                      {showLeavePassword ? <BsEyeSlashFill /> : <BsEyeFill />}
                    </button>
                  </div>
                  {leavePasswordError && (
                    <p className="text-red-500 text-xs mt-1">
                      {leavePasswordError}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setLeaveGroupConfirm(false);
                      setLeavePassword('');
                      setLeavePasswordError('');
                    }}
                    className="flex-1 py-2 rounded-lg border border-[#E3E7EE] dark:border-white/20 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isLeaving}
                    onClick={handleLeave}
                    className="flex-1 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-semibold hover:bg-red-500/30 transition disabled:opacity-50"
                  >
                    {isLeaving ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        Leaving...
                      </span>
                    ) : (
                      'Yes, Leave'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
          {isOpen && (
            <GalleryModal
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              allSlides={allSlides}
              startIndex={0}
            />
          )}
          <StatusModal
            open={statusModal.open}
            status={statusModal.status}
            title={statusModal.title}
            message={statusModal.message}
            redirect={statusModal?.redirect}
            onClose={() => setStatusModal((prev) => ({ ...prev, open: false }))}
            onContinue={() => {
              setStatusModal((prev) => ({ ...prev, open: false }));
            }}
            onRedirect={() => {
              setStatusModal((prev) => ({ ...prev, open: false }));
            }}
          />
        </div>
      </div>
    </>
  );
};

export default JoinGroup;
