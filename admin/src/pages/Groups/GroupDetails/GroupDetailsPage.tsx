import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // new updatek
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Shield } from 'lucide-react';
import { BackButton } from '@/components/common/BackButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Loader from '@/components/common/Loader';
import { useEffect, useRef, useState } from 'react';
import { GroupMembers } from './GroupMembers';
import { Properties } from './Properties';
import { useGetGroupByIdQuery } from '@/store/api/allGroupApi';

export function GroupDetailsPage() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'basicDetails';
  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value }); // 👈 update URL when tab changes
  };

  const {
    data: groupData,
    isLoading,
    isError,
  } = useGetGroupByIdQuery(Number(id), {
    skip: !isEdit,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, []);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !groupData) {
    return <div className="p-6 text-red-500">Failed to load user details</div>;
  }

  const { title, description, image, category, groupStatus, _count } = groupData;

  return (
    <div className="w-full p-6 pb-20 space-y-6 animate-fade-in">
      <div className="flex items-center gap-5 mb-4">
        <BackButton />
        <h2 className="text-2xl font-bold">Group Details - {title}</h2>
      </div>

      <Tabs
        value={activeTab} // 👈 controlled value
        onValueChange={handleTabChange}
        // defaultValue="basicDetails"
        className="w-full space-y-4"
      >
        {/* <TabsList className="grid w-full grid-cols-7"> */}
        <div className="relative flex items-center w-full">
          {/* LEFT ARROW */}
          <button
            onClick={scrollLeft}
            className={`mr-2 p-1 rounded-full transition cursor-pointer
      ${canScrollLeft ? 'hover:bg-slate-800' : 'opacity-30'}
    `}
          >
            <ChevronLeft className="w-4 h-4 ml-2" />
          </button>

          <div
            ref={scrollRef}
            onScroll={updateScrollButtons}
            className="flex overflow-x-auto hide-scrollbar"
          >
            <TabsList className="flex gap-3">
              {/* new 5 update */}
              <TabsTrigger
                value="basicDetails"
                className="flex items-center px-4 border-b border-transparent
             data-[state=active]:border-white
             data-[state=active]:text-white"
              >
                <Settings className="w-4 h-4 mr-1 shrink-0" />
                Basic Details
              </TabsTrigger>

              <TabsTrigger
                value="accountStatement"
                className="flex items-center px-4 border-b border-transparent
             data-[state=active]:border-white
             data-[state=active]:text-white"
              >
                <Shield className="w-4 h-4 mr-1 shrink-0" />
                Group Member
              </TabsTrigger>
              <TabsTrigger
                value="investedAssets"
                className="flex items-center px-4 border-b border-transparent
             data-[state=active]:border-white
             data-[state=active]:text-white"
              >
                <Shield className="w-4 h-4 mr-1 shrink-0" />
                Properties
              </TabsTrigger>
            </TabsList>
          </div>

          {/* RIGHT ARROW */}
          <button
            onClick={scrollRight}
            className={`ml-2 p-1 rounded-full transition cursor-pointer
      ${canScrollRight ? 'hover:bg-slate-800' : 'opacity-30'}
    `}
          >
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>
        {/* Basic Details */}
        <TabsContent value="basicDetails" className="space-y-6">
          <Card className="shadow-sm border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-4 border-b border-slate-800/50">
              <CardTitle className="text-lg font-medium text-slate-200">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 p-6 text-sm md:grid-cols-2">
              <div className="md:col-span-2">
                <strong className="block mb-1 text-slate-400">Group Image</strong>

                {image ? (
                  <img
                    src={image}
                    alt="Group"
                    className="w-20 h-20 rounded-full object-cover border border-slate-700"
                  />
                ) : (
                  <span className="text-slate-400">No Image</span>
                )}
              </div>
              <div>
                <strong className="block mb-1 text-slate-400">Group Name</strong>
                <span className="text-slate-200">{title}</span>
              </div>
              <div>
                <strong className="block mb-1 text-slate-400">Category</strong>
                <span className="text-slate-200">{category?.name}</span>
              </div>
              <div>
                <strong className="block mb-1 text-slate-400">Group Member</strong>
                <span className="text-slate-200">{_count?.groupMember}</span>
              </div>
              <div>
                <strong className="block mb-1 text-slate-400">Properties</strong>
                <span className="text-slate-200">{_count?.sharedAssetGroups}</span>
              </div>
              <div>
                <strong className="block mb-1 text-slate-400">Status</strong>
                <Badge
                  variant={groupStatus === 'Active' ? 'default' : 'secondary'}
                  className="text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20"
                >
                  {groupStatus}
                </Badge>
              </div>
              <div>
                <strong className="block mb-1 text-slate-400">Description</strong>
                <span className="text-slate-200">{description}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KYC Documents */}

        {/* Bank Account Details */}

        <TabsContent value="accountStatement" className="space-y-6">
          <Card className="shadow-sm border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-4 border-b border-slate-800/50">
              <CardTitle className="text-lg font-medium text-slate-200">Group Members</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <GroupMembers />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investedAssets" className="space-y-6">
          <Card className="shadow-sm border-slate-800 bg-slate-900/50">
            <CardHeader className="pb-4 border-b border-slate-800/50">
              <CardTitle className="text-lg flex gap-3 font-medium text-slate-200">
                Properties{' '}
              </CardTitle>{' '}
            </CardHeader>
            <CardContent className="p-0">
              <Properties />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
