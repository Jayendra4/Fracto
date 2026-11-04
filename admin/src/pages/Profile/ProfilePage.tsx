import React, { useEffect, useState } from 'react';
import { Mail, Edit, Save, X, Lock, Shield } from 'lucide-react';

import { useUpdateAdminProfileMutation, useLazyGetAdminProfileQuery } from '@/store/api/adminApi';
import { useCurrentAdmin, useHasPermission, useUserRole } from '@/hooks/redux';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

import { ProfileFormData } from '@/types';
import { useDispatch } from 'react-redux';
import { setAdminProfile } from '@/store/slices/authSlice';
import ProfileImageUpload from './ProfileImageUpload';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const adminDetail = useCurrentAdmin();
  const userRole = useUserRole();
  const canEdit = useHasPermission('system.edit');

  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useDispatch();
  const [updateProfile, { isLoading }] = useUpdateAdminProfileMutation();
  const [fetchAdmin] = useLazyGetAdminProfileQuery();

  const [formData, setFormData] = useState<ProfileFormData>({
    firstname: '',
    lastname: '',
    email: '',
    country: '',
    dialCode: '+91',
    phone: '',
  });

  useEffect(() => {
    if (!adminDetail) return;

    setFormData({
      firstname: adminDetail.firstname ?? '',
      lastname: adminDetail.lastname ?? '',
      email: adminDetail.email ?? '',
      country: adminDetail.country ?? '',
      dialCode: '+91',
      phone: adminDetail.mobile ?? '',
    });
  }, [adminDetail]);

  /* -------------------- SAVE PROFILE -------------------- */
  const handleSave = async () => {
    try {
      await updateProfile({
        firstname: formData.firstname,
        lastname: formData.lastname,
      }).unwrap();
      await updateLocalStorage();
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error?.data?.message);
      console.error('Update failed', error);
    }
  };

  const updateLocalStorage = async () => {
    try {
      setTimeout(async () => {
        const admin = await fetchAdmin().unwrap();
        dispatch(setAdminProfile(admin));
        // localStorage.setItem('admin', JSON.stringify(admin));
      }, 100);
    } catch (e) {
      console.error('failed to fetch admin data');
    }
  };

  /* -------------------- CANCEL -------------------- */
  const handleCancel = () => {
    if (!adminDetail) return;

    setFormData({
      firstname: adminDetail.firstname ?? '',
      lastname: adminDetail.lastname ?? '',
      email: adminDetail.email ?? '',
      country: adminDetail.country ?? '',
      dialCode: '+91',
      phone: adminDetail.mobile ?? '',
    });

    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Profile</h1>
          <p className="text-slate-400">Manage your personal information and preferences</p>
        </div>

        {!isEditing ? (
          canEdit && (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )
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

      <div className="grid gap-6 md:grid-cols-3">
        {/* PROFILE CARD */}
        <Card className="bg-slate-900/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24">
                <ProfileImageUpload
                  adminDetail={adminDetail}
                  updateLocalStorage={updateLocalStorage}
                />
              </div>

              <div className="text-center">
                <h3 className="text-xl font-semibold text-white">
                  {formData.firstname} {formData.lastname}
                </h3>
              </div>

              <Badge
                variant="secondary"
                className="bg-blue-900/30 text-blue-200 hover:bg-blue-900/50 border-blue-800"
              >
                <Shield className="w-3 h-3 mr-1" />
                {userRole}
              </Badge>

              <div className="text-sm flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="text-slate-300">{formData.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PERSONAL INFO */}
        <Card className="md:col-span-2 bg-slate-900/50 shadow-sm">
          <CardHeader className="border-b border-slate-800/50">
            <CardTitle className="text-white">Personal Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">First Name</Label>
                <Input
                  disabled={!isEditing}
                  value={formData.firstname}
                  onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Last Name</Label>
                <Input
                  disabled={!isEditing}
                  value={formData.lastname}
                  onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Email</Label>
                <Input
                  disabled
                  value={formData.email}
                  className="bg-slate-900/30 border-slate-800 text-slate-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
