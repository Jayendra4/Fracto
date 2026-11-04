import { BankAccount, UpiAccount } from '@/types';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetUserBankAccountsQuery, useGetUserUpiAccountsQuery } from '@/store/api/accountsApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function BankAccountCard({ account }: { account: BankAccount }) {
  return (
    <Card className="border border-input hover:shadow-sm transition">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-lg">{account.bankName ?? '—'}</CardTitle>
          <p className="text-sm text-muted-foreground">IFSC: {account.ifscCode ?? '—'}</p>
        </div>

        <Badge variant={account.isActive ? 'default' : 'secondary'}>
          {account.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3">
        <Info label="Account Holder" value={account.accountHolderName} />
        <Info label="Account Number" value={account.accountNumber} />
        <Info
          label="Created On"
          value={account.createdAt ? new Date(account.createdAt).toLocaleDateString() : '—'}
        />
      </CardContent>
    </Card>
  );
}

function UpiAccountCard({ account }: { account: UpiAccount }) {
  return (
    <Card className="border border-input hover:shadow-sm transition">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-lg">{account.upiId}</CardTitle>
          <p className="text-sm text-muted-foreground">UPI ID</p>
        </div>

        <Badge variant={account.isActive ? 'default' : 'secondary'}>
          {account.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3">
        <Info label="Created On" value={new Date(account.createdAt).toLocaleDateString()} />

        {account.qrCode ? (
          <img
            src={account.qrCode}
            alt="UPI QR"
            className="h-32 w-32 object-contain border rounded"
          />
        ) : (
          <p className="text-xs text-muted-foreground">No QR code</p>
        )}
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value ?? '—'}</p>
    </div>
  );
}

export function BankAccountDetails() {
  const { id } = useParams<{ id: string }>();
  const accountId = Number(id);
  const isValidId = Number.isInteger(accountId) && accountId > 0;

  const {
    data: bankAccounts,
    isLoading: isBankLoading,
    isError: isBankError,
  } = useGetUserBankAccountsQuery(accountId, {
    skip: !isValidId,
  });

  const {
    data: upiAccounts,
    isLoading: isUpiLoading,
    isError: isUpiError,
  } = useGetUserUpiAccountsQuery(accountId, {
    skip: !isValidId,
  });

  if (!isValidId) {
    return <div className="text-sm text-red-500">Invalid account id</div>;
  }

  return (
    <Tabs defaultValue="bankAccount" className="space-y-4 w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-xl">
        <TabsTrigger value="bankAccount">Bank Account</TabsTrigger>
        <TabsTrigger value="upiAccount">UPI Account</TabsTrigger>
      </TabsList>

      {/* BANK ACCOUNTS */}
      <TabsContent value="bankAccount">
        {isBankLoading && <p className="text-sm text-muted-foreground">Loading bank accounts...</p>}
        {isBankError && <p className="text-sm text-red-500">Failed to load bank accounts</p>}
        {!isBankLoading && (!bankAccounts || bankAccounts.length === 0) && (
          <p className="text-sm text-muted-foreground">No bank accounts found</p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bankAccounts?.map((account) => (
            <BankAccountCard key={account.id} account={account} />
          ))}
        </div>
      </TabsContent>

      {/* UPI ACCOUNTS */}
      <TabsContent value="upiAccount">
        {isUpiLoading && <p className="text-sm text-muted-foreground">Loading UPI accounts...</p>}
        {isUpiError && <p className="text-sm text-red-500">Failed to load UPI accounts</p>}
        {!isUpiLoading && (!upiAccounts || upiAccounts.length === 0) && (
          <p className="text-sm text-muted-foreground">No UPI accounts found</p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {upiAccounts?.map((account) => (
            <UpiAccountCard key={account.id} account={account} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
