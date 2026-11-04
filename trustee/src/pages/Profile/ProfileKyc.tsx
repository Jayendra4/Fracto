import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DocCard } from '@/components/common/DocCard';
import { useCurrentAdmin } from '@/hooks/redux';
import { useGetAccountByIdQuery } from '@/store/api/accountsApi';

export const ProfileKyc = () => {
  const adminDetail = useCurrentAdmin();

  const { data: accountDetail, isLoading } = useGetAccountByIdQuery(
    adminDetail?.id ?? 0,
    { skip: !adminDetail?.id }
  );

  const entityDocument = (accountDetail as any)?.entityDocument;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KYC Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading documents...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>KYC Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {entityDocument?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {entityDocument.map((doc: any) => (
              <DocCard
                key={doc.id}
                url={doc.url}
                label={doc.documentName ?? `Document #${doc.documentTypeId}`}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No documents uploaded</p>
        )}
      </CardContent>
    </Card>
  );
};