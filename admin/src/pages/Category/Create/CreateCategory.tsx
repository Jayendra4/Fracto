import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/common/BackButton';
import { useCreateCategoryApiMutation } from '@/store/api/groupApi';
import toast from 'react-hot-toast';

/* -------------------- Schema -------------------- */

const groupSchema = z.object({
  name: z.string().min(2, 'Category name is required'),
});

type GroupFormData = z.infer<typeof groupSchema>;

/* -------------------- Component -------------------- */

const CreateCategory = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
    },
  });

  /* -------- Static Category (later API se aa sakta hai) -------- */

  /* -------- Submit -------- */
  const [createCategoryApi, { isLoading, error }] = useCreateCategoryApiMutation();

  const onSubmit = async (data: GroupFormData) => {
    try {
      await createCategoryApi(data).unwrap();
      navigate('/category');
    } catch (err: any) {
      toast.error(err?.data?.message);
      console.error('Create Bank Account Failed:', err);
    }

    // 👉 yaha API call lagegi
    // await createGroupApi(data)

    // navigate(-1);
  };

  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-8 xl:max-w-[60%]">
      {/* HEADER */}
      <div className="flex items-center gap-5 mb-4">
        <BackButton />
        <h2 className="text-2xl font-bold">Add Category</h2>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-10 gap-y-6">
          {/* GROUP TITLE */}
          <div className="col-span-2 space-y-2">
            <Label required>Category Name</Label>
            <Input {...register('name')} placeholder="Enter category name" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          {/* STATUS */}
          {/* <div className="space-y-2">
            <Label>Status</Label>

            <Select
              value={selectedStatus}
              onValueChange={(value) => {
                setSelectedStatus(value as 'ACTIVE' | 'INACTIVE');
                setValue('status', value as 'ACTIVE' | 'INACTIVE');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
        </div>

        {/* SUBMIT */}
        <Button disabled={isLoading} type="submit" className="mt-6">
          Add Category
        </Button>
      </form>
    </div>
  );
};

export default CreateCategory;
