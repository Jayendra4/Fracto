import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  CheckSquare,
  User,
  Calendar,
  FileText,
  Globe,
} from 'lucide-react';
import { useGetLeadByIdQuery } from '@/store/api/brokerApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils';
import Loader from '@/components/common/Loader';

export function LeadDetails() {
  const { id, userType, userId } = useParams();
  const navigate = useNavigate();
  const leadId = id ? parseInt(id, 10) : undefined;

  const {
    data: lead,
    isLoading,
    isError,
    error,
  } = useGetLeadByIdQuery(leadId as number, {
    skip: !leadId,
  });

  const errorMessage =
    (error as any)?.data?.message || (error as any)?.error || 'Something went wrong';

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !lead) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <FileText className="w-16 h-16 mb-4 opacity-20" />
        {/* <p className="text-lg font-medium">Lead details not found</p> */}

        <p className="mt-2 text-lg text-red-400">{errorMessage}</p>
        <p className="text-sm text-slate-400">
          These details will be visible after the user completes their KYC.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  const actualData = lead?.data || lead;
  const userData = actualData?.user;
  const kycData = actualData?.user?.kyc;

  const handleBack = () => {
    // Pass the options object as the second argument
    navigate(`/users/${userType}/detail/${userId}?tab=leads`, { replace: true });
  };

  return (
    <div className="p-6 pb-20 space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            className="w-10 h-10 transition-colors rounded-full border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
              {userData?.name || 'Lead Details'}
              <Badge
                variant="outline"
                className="text-xs font-normal text-slate-400 border-slate-700"
              >
                ID: {userData?.id}
              </Badge>
            </h1>
            <p className="flex items-center gap-2 text-sm text-slate-400">
              <span className="inline-block mt-1 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              Active Lead
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="bg-slate-900/50 md:col-span-1 h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-slate-200">Profile Overview</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-6">
            <div className="flex flex-col items-center pb-6 border-b border-slate-800/50">
              <div className="w-24 h-24 p-1 mb-4 rounded-full shadow-xl bg-primary">
                <div className="relative flex items-center justify-center w-full h-full overflow-hidden rounded-full bg-slate-950">
                  {userData?.profileImage ? (
                    <img
                      src={userData.profileImage}
                      alt="profile"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-primary">
                      {userData?.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white">{userData?.name}</h3>
              <p className="text-sm text-slate-400">{userData?.email}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium tracking-wider uppercase text-slate-500">
                    Contact Number
                  </p>
                  <p className="font-medium text-slate-200">{userData?.mobile || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 text-purple-400 rounded-lg bg-purple-500/10">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium tracking-wider uppercase text-slate-500">
                    Location
                  </p>
                  <p className="font-medium text-slate-200">
                    {kycData?.address?.city || '—'}, {kycData?.address?.state || ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 text-orange-400 rounded-lg bg-orange-500/10">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium tracking-wider uppercase text-slate-500">
                    Language
                  </p>
                  <p className="font-medium text-slate-200">English (US)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Section */}
        <div className="space-y-6 md:col-span-2">
          {/* Status Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="transition-colors bg-slate-900/50 hover:bg-slate-800/50">
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase text-slate-400">User Status</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">Active</span>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                </div>
                <div className="p-3 rounded-full bg-green-500/10">
                  <User className="w-5 h-5 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="transition-colors bg-slate-900/50 hover:bg-slate-800/50">
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase text-slate-400">KYC Status</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">Verified</span>
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <CheckSquare className="w-5 h-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline / Activity */}
          <Card className="bg-slate-900/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-medium text-slate-200">
                <Clock className="w-5 h-5 text-primary" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
                {/* Item 1 */}
                <div className="relative group">
                  <div className="absolute -left-[32px] top-1 h-5 w-5 rounded-full bg-slate-950 border-2 border-green-500 group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                  <div className="flex flex-col justify-between gap-1 mb-1 sm:flex-row sm:items-center">
                    <p className="text-sm font-semibold text-white">KYC Approved</p>
                    <span className="text-xs text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {kycData?.submittedAt ? formatDate(new Date(kycData.submittedAt)) : 'N/A'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Identity verification completed successfully.
                  </p>
                </div>

                {/* Item 2 */}
                <div className="relative group">
                  <div className="absolute -left-[32px] top-1 h-5 w-5 rounded-full bg-slate-950 border-2 border-primary group-hover:scale-110 transition-transform z-10" />
                  <div className="flex flex-col justify-between gap-1 mb-1 sm:flex-row sm:items-center">
                    <p className="text-sm font-semibold text-white">Account Created</p>
                    <span className="text-xs text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {actualData?.firstUsedAt
                        ? formatDate(new Date(actualData.firstUsedAt))
                        : 'N/A'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">User registered via referral link.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
