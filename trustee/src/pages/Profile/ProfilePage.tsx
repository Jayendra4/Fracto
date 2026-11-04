import { useEffect, useState } from 'react';
import { Mail, Edit, Save, X, Shield } from 'lucide-react';
import {
  UpdateAdminPayload,
  useGetAdminProfileQuery,
  useUpdateAdminProfileMutation,
  useLazyGetAdminProfileQuery,
} from '@/store/api/adminApi';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import toast from 'react-hot-toast';
import { useGetAccountByIdQuery, useLazyGetAccountByIdQuery } from '@/store/api/accountsApi';
import { useCurrentAdmin, useUserRole } from '@/hooks/redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ProfileFormData } from '@/types';
import { useDispatch } from 'react-redux';
import { setAdminProfile } from '@/store/slices/authSlice';
import ProfileImageUpload from './ProfileImageUpload';
import { ProfileKyc } from './ProfileKyc';
// import ChangePassword from '../ChangePassword';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getApiErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Failed to save profile';
  const data = (error as { data?: { message?: string | string[]; error?: string } }).data;
  if (!data) return 'Failed to save profile';
  if (Array.isArray(data.message)) return data.message.join(', ');
  if (typeof data.message === 'string' && data.message !== 'Bad Request') return data.message;
  if (typeof data.error === 'string' && data.error !== 'Bad Request') return data.error;
  return 'Failed to save profile. Please check your details and try again.';
}

function buildProfileUpdatePayload(formData: ProfileFormData): UpdateAdminPayload {
  const payload: UpdateAdminPayload = {
    firstname: formData.firstname.trim(),
    lastname: formData.lastname.trim(),
    email: formData.email.trim(),
  };

  const meta: UpdateAdminPayload['meta'] = {};
  if (formData.meta.occupation?.trim()) meta.occupation = formData.meta.occupation.trim();
  if (formData.meta.monthlyIncome?.trim()) meta.monthlyIncome = formData.meta.monthlyIncome.trim();
  if (formData.meta.panNumber?.trim()) meta.panNumber = formData.meta.panNumber.trim();
  if (formData.meta.dateOfBirth?.trim()) meta.dateOfBirth = formData.meta.dateOfBirth.trim();
  if (formData.passport?.trim()) meta.passportNumber = formData.passport.trim();

  if (Object.keys(meta).length > 0) payload.meta = meta;

  return payload;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const adminDetail = useCurrentAdmin();
  const userRole = useUserRole();
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [updateProfile, { isLoading }] = useUpdateAdminProfileMutation();
  const [fetchAccountById] = useLazyGetAccountByIdQuery();
  const [fetchAdmin] = useLazyGetAdminProfileQuery();

  const { data: meProfile, isLoading: isLoadingMe, refetch: refetchMe } = useGetAdminProfileQuery();

  const { data: accountDetail, isLoading: isFetchingProfile } = useGetAccountByIdQuery(
    adminDetail?.id ?? 0,
    { skip: !adminDetail?.id }
  );

  const [formData, setFormData] = useState<ProfileFormData>({
    firstname: '',
    lastname: '',
    email: '',
    mobile: '',
    passport: '',
    accountType: '',
    meta: {
      dateOfBirth: '',
      occupation: '',
      monthlyIncome: '',
      panNumber: '',
    },
  });

  const buildFormData = (
    admin: typeof adminDetail,
    detail: typeof accountDetail
  ): ProfileFormData => {
    const accountMeta = detail?.meta;
    const adminMeta = (admin as any)?.meta;

    const pick = (...vals: any[]): string => {
      for (const v of vals) {
        const s = String(v ?? '').trim();
        if (s && s !== 'undefined' && s !== 'null') return s;
      }
      return '';
    };

    const dobRaw =
      accountMeta?.dateOfBirth ??
      adminMeta?.dateOfBirth ??
      (admin as any)?.dateOfBirth ??
      (detail as any)?.dateOfBirth;
    const dob: string = dobRaw ? new Date(dobRaw as string).toISOString().slice(0, 10) : '';

    const rawMobile = String((detail as any)?.mobile ?? admin?.mobile ?? '');

    return {
      firstname: (detail as any)?.firstname ?? admin?.firstname ?? '',
      lastname: (detail as any)?.lastname ?? admin?.lastname ?? '',
      email: (detail as any)?.email ?? admin?.email ?? '',
      mobile: rawMobile.replace(/^\+?(\d{1,3})?[-.\s]?/, ''),
      passport: pick((accountMeta as any)?.passportNumber, (adminMeta as any)?.passportNumber),
      accountType: (detail as any)?.type ?? (admin as any)?.type ?? '',
      meta: {
        dateOfBirth: dob,
        occupation: pick(accountMeta?.occupation, adminMeta?.occupation),
        monthlyIncome: pick(accountMeta?.monthlyIncome, adminMeta?.monthlyIncome),
        panNumber: pick(accountMeta?.panNumber, adminMeta?.panNumber, (admin as any)?.pan),
      },
    };
  };

  useEffect(() => {
    const admin = meProfile ?? adminDetail;
    if (!admin || isFetchingProfile) return;
    setFormData(buildFormData(admin, accountDetail));
  }, [meProfile, adminDetail, accountDetail, isFetchingProfile]);

  const handleSave = async () => {
    setSaveError('');
    try {
      const updatedAdmin = await updateProfile(buildProfileUpdatePayload(formData)).unwrap();
      const freshAccount = await fetchAccountById(adminDetail?.id ?? updatedAdmin.id ?? 0).unwrap();
      const { data: freshAdmin = updatedAdmin } = await refetchMe();

      dispatch(setAdminProfile(freshAdmin));
      setFormData(buildFormData(freshAdmin, freshAccount));
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: unknown) {
      const message = getApiErrorMessage(error);
      setSaveError(message);
      toast.error(message);
    }
  };

  const handleCancel = () => {
    const admin = meProfile ?? adminDetail;
    if (!admin) return;
    setFormData(buildFormData(admin, accountDetail));
    setSaveError('');
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and preferences</p>
        </div>

        {isFetchingProfile || isLoadingMe ? (
          <span className="text-sm text-muted-foreground">Loading profile...</span>
        ) : !isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      {saveError && <ErrorBanner type="error" title="Could not save profile" message={saveError} />}

      <div className="grid gap-6 ">
        {/* Avatar Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex  items-center justify-around space-y-4">
              <div className="w-24 mr-5 text-right">
                <ProfileImageUpload
                  adminDetail={adminDetail}
                  updateLocalStorage={async () => {
                    try {
                      setTimeout(async () => {
                        const admin = await fetchAdmin().unwrap();
                        dispatch(setAdminProfile(admin));
                      }, 150);
                    } catch {
                      console.error('Failed to refresh admin data');
                    }
                  }}
                />
              </div>
              <div className="Space-y-6">
                <div className="text-center flex items-center justify-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">
                    {formData.firstname} {formData.lastname}
                  </h3>
                </div>
                <div className="mb-4">
                  {adminDetail?.kycStatus === 'Approved' && (
                    <span className="px-2 py-0.5 text-xs font-medium tracking-wide text-emerald-700 bg-emerald-100 rounded-full dark:bg-emerald-500/20 dark:text-emerald-400">
                      Verified
                    </span>
                  )}
                </div>
                <Badge variant="secondary">
                  <Shield className="w-3 h-3 mr-1" />
                  {userRole}
                </Badge>

                <div className="text-sm flex items-center gap-2 my-4">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{formData.email}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* 
        <ChangePassword /> */}
        {/* Personal Info Card */}
      </div>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input
                disabled={!isEditing}
                value={formData.firstname}
                onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
              />
            </div>

            <div>
              <Label>Last Name</Label>
              <Input
                disabled={!isEditing}
                value={formData.lastname}
                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
              />
            </div>

            <div>
              <Label>Mobile</Label>
              <Input disabled value={formData.mobile} />
            </div>

            <div>
              <Label>Email</Label>
              <Input disabled value={formData.email} />
            </div>

            <div>
              <Label>Occupation</Label>
              <Input
                disabled={!isEditing}
                value={formData.meta.occupation ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    meta: { ...formData.meta, occupation: e.target.value },
                  })
                }
              />
            </div>

            <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                disabled={!isEditing}
                value={formData.meta.dateOfBirth ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    meta: { ...formData.meta, dateOfBirth: e.target.value },
                  })
                }
              />
            </div>

            <div>
              <Label>Account Type</Label>
              <Input disabled value={formData.accountType} />
            </div>

            <div>
              <Label>Monthly Income</Label>
              <Input
                disabled={!isEditing}
                value={formData.meta.monthlyIncome ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    meta: { ...formData.meta, monthlyIncome: e.target.value },
                  })
                }
              />
            </div>

            <div>
              <Label>PAN</Label>
              <Input disabled value={formData.meta.panNumber ?? ''} />
            </div>

            <div>
              <Label>Passport Number</Label>
              <Input
                disabled={!isEditing}
                value={formData.passport}
                onChange={(e) => setFormData({ ...formData, passport: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <ProfileKyc />
    </div>
  );
}
