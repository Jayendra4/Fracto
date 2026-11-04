import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, FileText } from 'lucide-react';
import { BackButton } from '@/components/common/BackButton';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { KycActionModal } from './KycActionModal';
import { KycStatus } from '@/store/api/kycApi';
import { useGetAccountByIdQuery } from '@/store/api/accountsApi';
import Loader from '@/components/common/Loader';
import { useHasPermission } from '@/hooks/redux';

const UserKycDetails = () => {
  const { id } = useParams();
  const accountId = Number(id);
  const canApprove = useHasPermission('kyc.approve');
  const canReject = useHasPermission('kyc.reject');

  const {
    data: user,
    isLoading,
    isError,
  } = useGetAccountByIdQuery(accountId, {
    skip: !accountId,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<KycStatus | null>(null);
  const [remark, setRemark] = useState('');

  const handleAction = (type: KycStatus) => {
    setActionType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActionType(null);
  };

  if (isLoading) return <Loader />;
  if (isError || !user) return <div className="p-6 text-red-500">Failed to load KYC details</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <h2 className="text-2xl font-bold">
            {user.firstname} {user.lastname}
          </h2>
        </div>
        {(user.kycStatus === KycStatus.Submitted || user.kycStatus === KycStatus.Rejected) &&
          (canApprove || canReject) && (
          <div className="flex gap-2">
            {canApprove && (
              <Button
                variant="outline"
                disabled={user.kycStatus === KycStatus.Rejected}
                className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white dark:hover:bg-green-600 dark:hover:text-white"
                onClick={() => handleAction(KycStatus.Approved)}
              >
                Approve
              </Button>
            )}
            {canReject && (
              <Button
                variant="outline"
                disabled={user.kycStatus === KycStatus.Rejected}
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white"
                onClick={() => handleAction(KycStatus.Rejected)}
              >
                Reject
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center py-4">
              <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl mb-4">
                {user.firstname.charAt(0).toUpperCase()}
              </div>
              <p className="font-bold text-lg">
                {user.firstname} {user.lastname}
              </p>
              <p className="text-muted-foreground">{user.email}</p>
              <Badge
                className="mt-2"
                variant={
                  user.kycStatus === KycStatus.Approved
                    ? 'default'
                    : user.kycStatus === KycStatus.Rejected
                      ? 'destructive'
                      : 'secondary'
                }
              >
                {user.kycStatus}
              </Badge>
            </div>
            <div className="pt-4 border-t space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mobile:</span>
                <span>{user.mobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span>{user.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Joined:</span>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground font-medium">PAN Number</p>
                <p className="text-lg">{user.meta?.panNumber ?? '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Date of Birth</p>
                <p className="text-lg">
                  {user.meta?.dateOfBirth
                    ? new Date(user.meta.dateOfBirth).toLocaleDateString()
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Occupation</p>
                <p className="text-lg">{user.meta?.occupation ?? '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Monthly Income</p>
                <p className="text-lg">{user.meta?.monthlyIncome ?? '—'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-primary">Current Address</h4>
                <div className="text-sm p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border">
                  {user.currentAddress ? (
                    <div className="space-y-1">
                      <p>{user.currentAddress.addressLine1}</p>
                      {user.currentAddress.addressLine2 && (
                        <p>{user.currentAddress.addressLine2}</p>
                      )}
                      <p>
                        {user.currentAddress.city}, {user.currentAddress.state}
                      </p>
                      <p className="font-medium text-slate-500">{user.currentAddress.pincode}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">No current address provided</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-primary">Permanent Address</h4>
                <div className="text-sm p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border">
                  {user.permanentAddress ? (
                    <div className="space-y-1">
                      <p>{user.permanentAddress.addressLine1}</p>
                      {user.permanentAddress.addressLine2 && (
                        <p>{user.permanentAddress.addressLine2}</p>
                      )}
                      <p>
                        {user.permanentAddress.city}, {user.permanentAddress.state}
                      </p>
                      <p className="font-medium text-slate-500">{user.permanentAddress.pincode}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">No permanent address provided</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verification Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {user.entityDocument?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.entityDocument.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative block aspect-video border rounded-lg overflow-hidden bg-slate-100 hover:shadow-md transition-all"
                    >
                      {/* <img
                        src={doc.url}
                        alt="KYC Document"
                        className="h-full w-full object-cover"
                      /> */}

                      {doc.url?.toLowerCase().includes('.pdf') ? (
                        <div className="h-full w-full flex flex-col items-center justify-center bg-slate-600 gap-2">
                          <FileText className="text-slate-200 w-10 h-10" />
                          <span className="text-slate-200 font-semibold text-sm">PDF</span>
                        </div>
                      ) : (
                        <img
                          src={doc.url}
                          alt="KYC Document"
                          className="h-full w-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2">
                        <span className="text-xs mb-1 font-medium">
                          {doc.documentIdentifier || `Type #${doc.documentName}`}
                        </span>
                        <ExternalLink className="h-5 w-5" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 py-1 px-2 text-[10px] border-t">
                        Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-800">
                  <p className="text-muted-foreground italic">
                    No verification documents have been uploaded yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <KycActionModal
        open={isModalOpen}
        onClose={closeModal}
        data={user}
        action={actionType!}
        remark={remark}
        setRemark={setRemark}
      />
    </div>
  );
};

export default UserKycDetails;
