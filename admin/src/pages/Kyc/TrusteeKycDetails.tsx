import { useParams } from 'react-router-dom';
import { useGetAccountByIdQuery } from '@/store/api/accountsApi';
import Loader from '@/components/common/Loader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, FileText } from 'lucide-react';
import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { KycStatus } from '@/store/api/kycApi';
import { KycActionModal } from './KycActionModal';
import { useHasPermission } from '@/hooks/redux';

const TrusteeKycDetails = () => {
  const { id } = useParams();
  const accountId = Number(id);
  const canApprove = useHasPermission('kyc.approve');
  const canReject = useHasPermission('kyc.reject');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [actionType, setActionType] = useState<KycStatus | null>();
  const [remark, setRemark] = useState('');
  const { data, isLoading, isError } = useGetAccountByIdQuery(accountId, {
    skip: !accountId,
  });

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !data) {
    return <div className="p-6 text-red-500">Failed to load user details</div>;
  }

  const {
    firstname,
    lastname,
    email,
    mobile,
    status,
    type,
    isVerified,
    entityDocument,
    meta,
    currentAddress,
    permanentAddress,
    kycStatus,
    kyc,
  } = data;

  const openActionModal = (data: any, action: KycStatus) => {
    setSelectedRequest(data);
    setActionType(action);
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setActionType(null);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-5 mb-4">
          <BackButton />
          <h2 className="text-2xl font-bold">
            Trustee Details - {firstname} {lastname}
          </h2>
        </div>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Mobile:</strong> {mobile}
            </div>
            <div>
              <strong>Email:</strong> {email}
            </div>
            <div>
              <strong>Type:</strong> {type}
            </div>
            <div>
              <strong>Status:</strong>{' '}
              <Badge variant={status === 'Active' ? 'default' : 'secondary'}>{status}</Badge>
            </div>
            <div>
              <strong>KYC:</strong>{' '}
              <Badge variant={kycStatus === KycStatus.Approved ? 'default' : 'destructive'}>
                {kycStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Meta Info */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>PAN:</strong> {meta?.panNumber ?? '—'}
            </div>
            <div>
              <strong>DOB:</strong>{' '}
              {meta?.dateOfBirth ? new Date(meta.dateOfBirth).toLocaleDateString() : '—'}
            </div>
            <div>
              <strong>Occupation:</strong> {meta?.occupation ?? '—'}
            </div>
            <div>
              <strong>Monthly Income:</strong> {meta?.monthlyIncome ?? '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address Details</CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {/* Current Address */}
            <div className="md:col-span-2">
              <strong>Current Address</strong>
            </div>

            <div>
              <strong>Address Line 1:</strong> {currentAddress?.addressLine1 ?? '—'}
            </div>

            <div>
              <strong>Address Line 2:</strong> {currentAddress?.addressLine2 ?? '—'}
            </div>

            <div>
              <strong>City:</strong> {currentAddress?.city ?? '—'}
            </div>

            <div>
              <strong>State:</strong> {currentAddress?.state ?? '—'}
            </div>

            <div>
              <strong>Pincode:</strong> {currentAddress?.pincode ?? '—'}
            </div>

            {/* Permanent Address */}
            <div className="md:col-span-2 mt-4">
              <strong>Permanent Address</strong>
            </div>

            {permanentAddress ? (
              <>
                <div>
                  <strong>Address Line 1:</strong> {permanentAddress.addressLine1}
                </div>
                <div>
                  <strong>Address Line 2:</strong> {permanentAddress.addressLine2 ?? '—'}
                </div>
                <div>
                  <strong>City:</strong> {permanentAddress.city}
                </div>
                <div>
                  <strong>State:</strong> {permanentAddress.state}
                </div>
                <div>
                  <strong>Pincode:</strong> {permanentAddress.pincode}
                </div>
              </>
            ) : (
              <div className="md:col-span-2 text-muted-foreground">
                Permanent address not provided
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>KYC Documents</CardTitle>
              {(kycStatus === KycStatus.Submitted || kycStatus === KycStatus.Rejected) &&
              (canApprove || canReject) ? (
                <div className="flex gap-2">
                  {canApprove && (
                    <Button size="sm" onClick={() => openActionModal(data, KycStatus.Approved)}>
                      Approve
                    </Button>
                  )}

                  {canReject && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openActionModal(data, KycStatus.Rejected)}
                    >
                      Reject
                    </Button>
                  )}
                </div>
              ) : (
                <Badge variant={kycStatus === KycStatus.Approved ? 'default' : 'destructive'}>
                  {kycStatus}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {entityDocument?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {entityDocument.map((doc) => {
                  const isPdf = doc.url?.toLowerCase().endsWith('.pdf');
                  return (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative border rounded-md overflow-hidden"
                    >
                      {isPdf ? (
                        <div className="h-48 w-full flex flex-col items-center justify-center bg-black/40 gap-2">
                          <FileText className="h-12 w-12 text-slate-400" />
                          <span className="text-sm text-slate-400 font-medium">PDF</span>
                        </div>
                      ) : (
                        <img src={doc.url} alt="Document" className="h-48 w-full object-cover" />
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <ExternalLink className="text-white h-6 w-6" />
                      </div>

                      <div className="p-2 text-xs flex justify-between items-center bg-muted">
                        <span>Document #{doc.documentTypeId}</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No documents uploaded</p>
            )}
          </CardContent>
        </Card>
      </div>

      <KycActionModal
        open={!!selectedRequest}
        onClose={closeModal}
        data={selectedRequest}
        action={actionType!}
        remark={remark}
        setRemark={setRemark}
      />
    </>
  );
};

export default TrusteeKycDetails;
