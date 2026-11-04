/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
import { splitCamelCase, type User } from '@/types/userDashboard';
import { useForm, Controller } from 'react-hook-form';
import { useUpdateProfile } from '@/api/auth.api';
import { useFetchUserDataFlow } from '@/hooks/useFetchUserDataFlow';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import CustomSelect from '@/components/Base/CustomSelect';
import { useOnboarding } from '@/hooks';

// <input type="date"> only accepts strict YYYY-MM-DD — a raw ISO datetime
// string (e.g. "1990-05-15T00:00:00.000Z") is silently rejected and the
// field renders blank, matches the same helper in Kyc/index.tsx.
const toDateInputValue = (value?: string | null) =>
  value ? value.split('T')[0] : '';

// Kept in sync with the KYC flow's income options (Kyc/Step2.tsx) so a
// value saved from either place shows/selects consistently in the other.
const MONTHLY_INCOME_OPTIONS = [
  { label: '₹25,000 or Less', value: '0-25000' },
  { label: '₹25,000 - ₹50,000', value: '25000-50000' },
  { label: '₹50,000 - ₹100,000', value: '50000-100000' },
  { label: '₹100,000 - ₹200,000', value: '100000-200000' },
  { label: '₹200,000 - ₹300,000', value: '200000-300000' },
  { label: '₹300,000 - ₹400,000', value: '300000-400000' },
  { label: '₹400,000 - ₹1,000,000', value: '400000-1000000' },
];

function Item({
  label,
  name,
  register,
  control,
  disabled,
  error,
  type = 'text',
  isEditing,
  value,
  options,
  min,
  max,
}: {
  label: string;
  name: string;
  register: any;
  control?: any;
  disabled?: boolean;
  error?: string;
  type?: string;
  isEditing: boolean;
  value?: string | null;
  options?: { label: string; value: string }[];
  min?: string;
  max?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[#E3E7EE] dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 transition-all duration-300 flex flex-col gap-1.5 group ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-white/10'} ${type === 'select' && isEditing ? '!p-2' : ''}`}
    >
      {!(type === 'select' && isEditing) && (
        <label className="font-14 uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
          {label}
        </label>
      )}
      {isEditing && !disabled ? (
        type === 'select' && options && control ? (
          <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value } }) => (
              <CustomSelect
                label={label}
                value={value || ''}
                onChange={onChange}
                options={options}
                placeholder={`Select ${label}`}
              />
            )}
          />
        ) : (
          <input
            {...register(name)}
            type={type}
            className="bg-transparent border-none p-0 font-16 font-medium text-[#0B2545] dark:text-white focus:outline-none outline-none w-full placeholder:text-gray-300 dark:placeholder:text-gray-600 shadow-none ring-0"
            autoFocus={name === 'firstname'}
            {...(type === 'date'
              ? { min: min ?? '1900-01-01', max: max ?? '2099-12-31' }
              : {})}
          />
        )
      ) : (
        <p className="font-16 font-medium text-[#0B2545] dark:text-white leading-relaxed truncate">
          {value || '-'}
        </p>
      )}
      {error && (
        <span className="text-red-500 text-[11px] font-medium animate-in fade-in slide-in-from-top-1">
          {error}
        </span>
      )}
    </div>
  );
}

export default function ProfileDetails({
  user,
  isEditing,
  setIsEditing,
}: {
  user: User;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
}) {
  const { isCompany } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const { mutateAsync: updateProfile } = useUpdateProfile();
  const { run: runUserFetchFlow } = useFetchUserDataFlow();
  const token =
    useSelector((state: RootState) => state.authLogin.token) ||
    Cookies.get('hof_token') ||
    '';
  const director = user.companies?.[0]?.directors?.[0];
  const directorMeta = director?.directorMeta;

  const { register, handleSubmit, reset, control } = useForm({
    // defaultValues: {
    //   firstname: user.firstname || '',
    //   lastname: user.lastname || '',
    //   'meta.occupation': user.meta?.occupation || '',
    //   'meta.monthlyIncome': user.meta?.monthlyIncome || '',
    //   'meta.panNumber': user.meta?.panNumber || '',
    //   'meta.passportNumber': user.meta?.passportNumber || '',
    //   'meta.emiratiId': user.meta?.emiratiId || '',
    //   'meta.dateOfBirth': user.meta?.dateOfBirth || '',
    // },
    defaultValues: {
      firstname: user.firstname || director?.firstName || '',
      lastname: user.lastname || director?.lastName || '',
      // 'meta.occupation': user.meta?.occupation || '',
      'meta.monthlyIncome': user.meta?.monthlyIncome || '',
      'meta.panNumber': user.meta?.panNumber || directorMeta?.panNumber || '',
      'meta.passportNumber':
        user.meta?.passportNumber || directorMeta?.passportNumber || '',
      'meta.emiratiId':
        user.meta?.emiratiId || directorMeta?.emiratesIdNumber || '',
      'meta.dateOfBirth': toDateInputValue(
        user.meta?.dateOfBirth || director?.dateOfBirth
      ),
    },
  });

  // `defaultValues` above are only applied once, at mount — if `user` is
  // still incomplete then (e.g. the fuller profile arrives from /accounts/me
  // after this component has already mounted), fields like Date of Birth
  // stay frozen blank forever. Re-sync whenever `user` changes, as long as
  // the form isn't actively being edited (so we don't wipe in-progress edits).
  useEffect(() => {
    if (isEditing) return;
    reset({
      firstname: user.firstname || director?.firstName || '',
      lastname: user.lastname || director?.lastName || '',
      // 'meta.occupation': user.meta?.occupation || '',
      'meta.monthlyIncome': user.meta?.monthlyIncome || '',
      'meta.panNumber': user.meta?.panNumber || directorMeta?.panNumber || '',
      'meta.passportNumber':
        user.meta?.passportNumber || directorMeta?.passportNumber || '',
      'meta.emiratiId':
        user.meta?.emiratiId || directorMeta?.emiratesIdNumber || '',
      'meta.dateOfBirth': toDateInputValue(
        user.meta?.dateOfBirth || director?.dateOfBirth
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync on user/isEditing changes, not on every reset/director identity change
  }, [user, isEditing]);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      // The API replaces the whole `meta` object rather than merging it, so
      // any field not sent here gets wiped out — spread the user's existing
      // meta first, then overlay the edited fields on top of it.
      const payload: any = {
        firstname: data.firstname,
        lastname: data.lastname,
        meta: {
          ...user.meta,
          // Occupation field is hidden from this form now — omit it here so
          // the spread above keeps the existing value instead of it being
          // overwritten with undefined.
          monthlyIncome: data.meta.monthlyIncome,
          // PAN Number's field is disabled (read-only), so it's never
          // registered by react-hook-form and data.meta.panNumber is always
          // undefined — fall back to the existing value so it isn't dropped.
          panNumber:
            data.meta.panNumber ||
            user.meta?.panNumber ||
            directorMeta?.panNumber,
          passportNumber: data.meta.passportNumber,
          emiratiId: data.meta.emiratiId,
          dateOfBirth: data.meta.dateOfBirth,
        },
      };

      const res = await updateProfile(payload);
      if (res?.success) {
        toast.success('Profile updated successfully');
        await runUserFetchFlow(token);
        setIsEditing(false);
      } else {
        toast.error(res?.message || 'Update failed');
      }
    } catch (err: any) {
      toast.error(err?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm bg-white dark:bg-[#132436] p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-150 dark:border-white/5">
        <h3 className="font-serif text-base md:text-lg font-semibold text-[#0B2545] dark:text-white">
          Personal Information
        </h3>
        {isEditing && (
          <button
            onClick={() => {
              setIsEditing(false);
              reset();
            }}
            className="text-gray-400 dark:text-gray-500 hover:text-[#0B2545] dark:hover:text-white transition text-sm font-medium"
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <button
          type="submit"
          id="profile-save-btn"
          className="hidden"
          disabled={loading}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Item
            label="First Name"
            name="firstname"
            register={register}
            isEditing={isEditing}
            value={user.firstname}
          />
          <Item
            label="Last Name"
            name="lastname"
            register={register}
            isEditing={isEditing}
            value={user.lastname}
          />
          <Item
            label="Mobile"
            name="mobile"
            register={register}
            isEditing={isEditing}
            value={user.mobile}
            disabled
          />
          {/* <Item
            label="Occupation"
            name="meta.occupation"
            register={register}
            isEditing={isEditing}
            value={user.meta?.occupation || '-'}
          /> */}
          <Item
            label="Monthly Income"
            name="meta.monthlyIncome"
            register={register}
            control={control}
            isEditing={isEditing}
            value={
              MONTHLY_INCOME_OPTIONS.find(
                (o) => o.value === user.meta?.monthlyIncome
              )?.label ||
              user.meta?.monthlyIncome ||
              '-'
            }
            type="select"
            options={MONTHLY_INCOME_OPTIONS}
          />
          {/* <Item
            label="PAN Number"
            name="meta.panNumber"
            register={register}
            isEditing={isEditing}
            value={user.meta?.panNumber || '-'}
            disabled
          />
          <Item
            label="Passport Number"
            name="meta.passportNumber"
            register={register}
            isEditing={isEditing}
            value={user.meta?.passportNumber || '-'}
          />

          <Item
            label="Date of Birth"
            name="meta.dateOfBirth"
            register={register}
            isEditing={isEditing}
            value={
              user.meta?.dateOfBirth
                ? !isEditing
                  ? new Intl.DateTimeFormat('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    }).format(new Date(user.meta.dateOfBirth as string))
                  : user.meta.dateOfBirth
                : '-'
            }
            type="date"
          /> */}

          <Item
            label="PAN Number"
            name="meta.panNumber"
            register={register}
            isEditing={isEditing}
            value={user.meta?.panNumber || directorMeta?.panNumber || '-'}
            disabled
          />

          <Item
            label="Passport Number"
            name="meta.passportNumber"
            register={register}
            isEditing={isEditing}
            value={
              user.meta?.passportNumber || directorMeta?.passportNumber || '-'
            }
          />

          <Item
            label="Date of Birth"
            name="meta.dateOfBirth"
            register={register}
            isEditing={isEditing}
            value={(() => {
              const dob = user.meta?.dateOfBirth || director?.dateOfBirth;
              if (!dob) return '-';
              if (!isEditing) {
                return new Intl.DateTimeFormat('en-IN', {
                  timeZone: 'Asia/Kolkata',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }).format(new Date(dob as string));
              }
              return dob;
            })()}
            type="date"
            max={new Date().toISOString().slice(0, 10)}
          />

          <div className="rounded-xl border border-[#E3E7EE] dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 opacity-80">
            <p className="font-14 uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-1">
              Status
            </p>
            <p className="font-16 font-medium text-[#0B2545] dark:text-white">
              {user.status}
            </p>
          </div>
          <div className="rounded-xl border border-[#E3E7EE] dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 opacity-80">
            <p className="font-14 uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-1">
              Account Type
            </p>
            <p className="font-16 font-medium text-[#0B2545] dark:text-white">
              {splitCamelCase(user.type)}
            </p>
          </div>
          {user.type === 'Broker' && user.hasLicense && (
            <>
              <div className="rounded-xl border border-[#E3E7EE] dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 opacity-80">
                <p className="font-14 uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-1">
                  License Number
                </p>
                <p className="font-16 font-medium text-[#0B2545] dark:text-white">
                  {user.licenseNumber || '-'}
                </p>
              </div>
              <div className="rounded-xl border border-[#E3E7EE] dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 opacity-80">
                <p className="font-14 uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-1">
                  License Expiry
                </p>
                <p className="font-16 font-medium text-[#0B2545] dark:text-white">
                  {user.licenseExpiry
                    ? new Intl.DateTimeFormat('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      }).format(new Date(user.licenseExpiry))
                    : '-'}
                </p>
              </div>
            </>
          )}
          {isCompany && (
            <>
              <div className="rounded-xl border border-[#E3E7EE] dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 opacity-80">
                <p className="font-14 uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-1">
                  KYB Status
                </p>
                <p className="font-16 font-medium text-[#0B2545] dark:text-white">
                  {user.kybStatus || 'Draft'}
                </p>
              </div>
              <div className="rounded-xl border border-[#E3E7EE] dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 opacity-80">
                <p className="font-14 uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-1">
                  Company ID
                </p>
                <p className="font-16 font-medium text-[#0B2545] dark:text-white">
                  {user.companyId || '-'}
                </p>
              </div>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
