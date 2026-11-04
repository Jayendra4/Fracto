import { useParams } from 'react-router-dom';
import { useGetAccountByIdQuery } from '@/store/api/accountsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BasicDetailsTab } from './BasicDetailsTab';
import { Settings, Shield, Share2 } from 'lucide-react';
import { BackButton } from '@/components/common/BackButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BankAccountDetails } from './BankAccountDetails';
import { AccountStatement } from './AccountStatement';
import { InvestedAssets } from './InvestedAssets';
import { UploadedAssets } from './UploadedAssets';
import ReferredProperties from './RefferedProperties';
import { DocCard } from '@/components/common/DocCard';

export function UserDetailPage() {
  const { id } = useParams();
  const accountId = Number(id);

  const { data, isLoading, isError } = useGetAccountByIdQuery(accountId, {
    skip: !accountId,
  });

  if (isLoading) {
    return <div className="p-6">Loading user details...</div>;
  }

  if (isError || !data) {
    return <div className="p-6 text-red-500">Failed to load user details</div>;
  }

  const { firstname, lastname, entityDocument } = data;

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-5 mb-4">
        <BackButton />
        <h2 className="text-2xl font-bold">
          User Details - {firstname} {lastname}
        </h2>
      </div>

      <Tabs defaultValue="basicDetails" className="space-y-4 w-full">
        <TabsList className="grid w-full grid-cols-6 ">
          <TabsTrigger value="basicDetails" className="flex items-center px-4">
            <Settings className="w-4 h-4 mr-1" />
            Basic Details
          </TabsTrigger>
          <TabsTrigger value="kycDocuments" className="flex items-center px-4">
            <Shield className="w-4 h-4 mr-1" />
            KYC Documents
          </TabsTrigger>
          <TabsTrigger value="bankAccountDetails" className="flex items-center px-4">
            <Shield className="w-4 h-4 mr-1" />
            Bank Details
          </TabsTrigger>
          <TabsTrigger value="accountStatement" className="flex items-center px-4">
            <Shield className="w-4 h-4 mr-1" />
            Account Statement
          </TabsTrigger>
          <TabsTrigger value="investedAssets" className="flex items-center px-4">
            <Shield className="w-4 h-4 mr-1" />
            Invested Assets
          </TabsTrigger>
          {data?.type === 'Broker' && (
            <TabsTrigger value="referredProperties" className="flex items-center px-4">
              <Share2 className="w-4 h-4 mr-1" />
              Referred Properties
            </TabsTrigger>
          )}
          {data?.type !== 'CorporateInvestor' && data?.type !== 'Broker' && (
            <TabsTrigger value="uploadedAssets" className="flex items-center px-4">
              <Shield className="w-4 h-4 mr-1" />
              Uploaded Assets
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="basicDetails" className="space-y-6">
          <BasicDetailsTab account={data} />
        </TabsContent>

        <TabsContent value="kycDocuments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{data?.type === 'Company' ? 'KYB Documents' : 'KYC Documents'}</CardTitle>
            </CardHeader>

            <CardContent>
              {entityDocument?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {entityDocument.map((doc) => (
                    <DocCard
                      key={doc.id}
                      url={doc.url}
                      label={
                        (doc as { documentName?: string }).documentName ??
                        `Document #${doc.documentTypeId}`
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No documents uploaded</p>
              )}
            </CardContent>
          </Card>

          {/* Director KYC Documents */}
          {data?.type === 'Company' &&
            (data as any)?.companies?.[0]?.directors?.[0]?.documents?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Director KYC Documents</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {(data as any).companies[0].directors[0].documents.map((doc: any) => (
                      <DocCard
                        key={doc.id}
                        url={doc.url}
                        label={doc?.documentType?.name ?? 'Director Document'}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
        </TabsContent>

        <TabsContent value="bankAccountDetails" className="space-y-6">
          <Card>
            <CardContent>
              <BankAccountDetails />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accountStatement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <AccountStatement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investedAssets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invested Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <InvestedAssets />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referredProperties" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Referred Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <ReferredProperties />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uploadedAssets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <UploadedAssets />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
