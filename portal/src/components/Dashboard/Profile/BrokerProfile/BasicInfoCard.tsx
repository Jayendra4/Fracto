/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed props, matches the pattern in rwa.api.ts */
import { FaRegEdit } from 'react-icons/fa';
import type { User } from '@/types/userDashboard';
import { useForm, Controller } from 'react-hook-form';
import { useUpdateProfile } from '@/api/auth.api';
import { useFetchUserDataFlow } from '@/hooks/useFetchUserDataFlow';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useState } from 'react';
// import Loader from '@/components/Loader';
import CustomSelect from '@/components/Base/CustomSelect';

function Field({
  label,
  name,
  register,
  control,
  disabled,
  type = 'text',
  isEditing,
  value,
  options,
}: any) {
  return (
    <div className="flex flex-col">
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 px-0.5">
        {label}
      </label>
      {isEditing ? (
        disabled ? (
          <div className="bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg py-2 px-3 text-xs md:text-sm font-medium text-gray-400 dark:text-gray-500 min-h-[38px] flex items-center cursor-not-allowed">
            {value || '-'}
          </div>
        ) : type === 'select' && options && control ? (
          <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value } }) => (
              <div className="[&_button]:py-2! [&_button]:px-3! [&_button]:rounded-lg! [&_button]:text-xs! [&_button]:font-normal! [&_button]:bg-gray-50! [&_button]:dark:bg-white/5! [&_button]:border-gray-300! [&_button]:dark:border-white/10! md:[&_button]:text-sm!">
                <CustomSelect
                  value={value || ''}
                  onChange={onChange}
                  options={options.map((opt: string) => ({
                    label: opt,
                    value: opt,
                  }))}
                  placeholder={`Select ${label}`}
                />
              </div>
            )}
          />
        ) : (
          <input
            {...register(name)}
            type={type}
            className="w-full bg-gray-55 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg py-2 px-3 text-xs md:text-sm font-normal text-gray-850 dark:text-white focus:outline-none focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0]"
            autoFocus={name === 'firstname'}
          />
        )
      ) : (
        <div className="bg-gray-55 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200 min-h-[38px] flex items-center">
          {value || '-'}
        </div>
      )}
    </div>
  );
}

export default function BasicInfoCard({ user }: { user: User }) {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { mutateAsync: updateProfile } = useUpdateProfile();
  const { run: runUserFetchFlow } = useFetchUserDataFlow();
  const token =
    useSelector((state: RootState) => state.authLogin.token) ||
    Cookies.get('hof_token') ||
    '';

  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: {
      firstname: user.firstname || '',
      lastname: user.lastname || '',
      mobile: user.mobile || '',
      email: user.email || '',
      permanentAddress: user.permanentAddress || '',
      // 'meta.occupation': user.meta?.occupation || '',
      'meta.monthlyIncome': user.meta?.monthlyIncome || '',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      const payload: any = {
        firstname: data.firstname,
        lastname: data.lastname,
        permanentAddress: data.permanentAddress,
        meta: {
          // Occupation field is hidden from this form now — preserve the
          // existing value instead of overwriting it with undefined.
          occupation: user.meta?.occupation,
          monthlyIncome: data.meta.monthlyIncome,
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
    <div className="p-6 bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 shadow-sm rounded-xl">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-150 dark:border-white/5">
        <h3 className="font-serif text-lg font-semibold text-[#0B2545] dark:text-white">
          Basic Information
        </h3>
        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              onClick={() => {
                setIsEditing(false);
                reset();
              }}
              className="text-gray-500 hover:text-gray-800 dark:hover:text-white transition text-xs md:text-sm font-semibold mr-2 cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => {
              if (isEditing) {
                handleSubmit(onSubmit)();
              } else {
                setIsEditing(true);
              }
            }}
            disabled={loading}
            className="flex items-center gap-2 font-14 md:text-sm font-semibold bg-[#1F4FE0] hover:bg-[#153eb2] text-white px-5 py-2.5 rounded-lg transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {loading ? (
              // <Loader isFullPage={false} />
              'Updating...'
            ) : (
              <>
                <FaRegEdit size={16} />
                {isEditing ? 'Update' : 'Edit Profile'}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="First Name"
          name="firstname"
          register={register}
          isEditing={isEditing}
          value={user.firstname}
        />
        <Field
          label="Last Name"
          name="lastname"
          register={register}
          isEditing={isEditing}
          value={user.lastname}
        />
        <Field
          label="Phone"
          name="mobile"
          register={register}
          disabled
          isEditing={isEditing}
          value={user.mobile}
        />
        <Field
          label="Email"
          name="email"
          register={register}
          disabled
          isEditing={isEditing}
          value={user.email}
        />
        {/* <Field
          label="Occupation"
          name="meta.occupation"
          register={register}
          isEditing={isEditing}
          value={user.meta?.occupation}
        /> */}
        <Field
          label="Monthly Income"
          name="meta.monthlyIncome"
          register={register}
          control={control}
          isEditing={isEditing}
          value={user.meta?.monthlyIncome}
          type="select"
          options={[
            '₹25,000 or Less',
            '₹25,000 - ₹50,000',
            '₹50,000 - ₹100,000',
            '₹100,000 - ₹200,000',
            '₹200,000 - ₹300,000',
            '₹300,000 - ₹400,000',
            '₹400,000 - ₹1,000,000',
          ]}
        />
      </div>
    </div>
  );
}
