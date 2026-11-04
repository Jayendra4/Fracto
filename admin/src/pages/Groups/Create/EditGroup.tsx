import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/common/BackButton';
import UploadImage from '@/components/common/UploadImage';
import { useGetCategoryQuery, useUpdateGroupMutation } from '@/store/api/groupApi';
import { useGetGroupByIdQuery } from '@/store/api/allGroupApi';
import toast from 'react-hot-toast';

/* -------------------- Schema -------------------- */

const groupSchema = z.object({
  title: z.string().min(2, 'Group title is required'),
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(400, 'Description cannot exceed 400 characters'),
  categoryId: z.number({
    required_error: 'Category is required',
  }),
  image: z.string().min(1, 'Image is required'),
});

type GroupFormData = z.infer<typeof groupSchema>;

/* -------------------- Component -------------------- */

const EditGroup = () => {
  const navigate = useNavigate();
  const [isImageUploading, setIsImageUploading] = useState(false);
  const { id } = useParams();
  const isEdit = Boolean(id);

  const {
    data,
    isLoading: isCategoryLoading,
    isError,
  } = useGetCategoryQuery({
    skip: 0,
    take: 1000,
    categoryStatus: 'Active',
  });

  const groupId = id ? Number(id) : null;

  const { data: groupData } = useGetGroupByIdQuery(groupId as number, {
    skip: !groupId,
    refetchOnMountOrArgChange: true,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: undefined,
      image: '',
    },
  });

  /* -------- CATEGORY API -------- */

  const categoryOptions = data?.data || [];

  useEffect(() => {
    if (groupData && categoryOptions.length > 0) {
      reset({
        title: groupData.title,
        description: groupData.description,
        categoryId: groupData.categoryId,
        image: groupData.image || '',
      });
    }
  }, [groupData, categoryOptions, reset]);

  // const selectedCategory = watch('categoryId');

  const [updateGroup] = useUpdateGroupMutation();

  const onSubmit = async (data: GroupFormData) => {
    try {
      const fileName = data.image?.split('/').pop()?.split('?')[0];

      const oldFileName = groupData?.image?.split('/').pop()?.split('?')[0];

      const payload: any = {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
      };

      // ✅ only send image if changed
      if (fileName && fileName !== oldFileName) {
        payload.image = fileName;
      }

      await updateGroup({
        id: Number(id),
        body: payload,
      }).unwrap();

      navigate(-1);
    } catch (error: any) {
      toast.error(error?.data?.message);
      console.error('Update failed', error);
    }
  };
  // const selectedCategory = watch('categoryId');

  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-8 xl:max-w-[60%]">
      {/* HEADER */}
      <div className="flex items-center gap-5 mb-4">
        <BackButton />
        <h2 className="text-2xl font-bold">Edit Group</h2>
      </div>

      {/* FORM */}
      <form key={groupId} onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-10 gap-y-6">
          {/* IMAGE */}
          <div className="space-y-2">
            <UploadImage
              label="Profile Image"
              value={watch('image')}
              onChange={(url) => {
                setValue('image', url, { shouldValidate: true });
              }}
              setIsImageUploading={setIsImageUploading}
            />
            {errors.image && <p className="text-sm text-destructive">{errors.image.message}</p>}
          </div>

          {/* TITLE */}
          <div className="col-span-2 space-y-2">
            <Label required>Group Title</Label>
            <Input {...register('title')} placeholder="Enter group title" />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          {/* DESCRIPTION */}
          {/* <div className="col-span-2 space-y-2">
            <Label required>Description</Label>
            <Textarea {...register('description')} rows={4} />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div> */}

          <div className="col-span-2 space-y-2">
            <Label required>Description</Label>
            <Textarea {...register('description')} rows={4} />

            {/* Character Counter */}
            <div className="flex justify-between items-center">
              {errors.description ? (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              ) : (
                <span />
              )}
              <p
                className={`text-xs ml-auto ${
                  (watch('description')?.length ?? 0) > 400
                    ? 'text-red-500'
                    : (watch('description')?.length ?? 0) < 50
                      ? 'text-gray-400'
                      : 'text-green-500'
                }`}
              >
                {watch('description')?.length ?? 0}/300
              </p>
            </div>
          </div>

          {/* CATEGORY */}
          <div className="space-y-2">
            <Label required>Category</Label>

            {isCategoryLoading ? (
              <p className="text-sm text-slate-400">Loading categories...</p>
            ) : isError ? (
              <p className="text-sm text-red-500">Failed to load categories</p>
            ) : (
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>

                    <SelectContent>
                      {categoryOptions.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name?.trim() || 'N/A'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}

            {errors.categoryId && (
              <p className="text-sm text-destructive">{errors.categoryId.message}</p>
            )}
          </div>
        </div>

        {/* SUBMIT */}
        <Button disabled={isImageUploading} type="submit" className="mt-6">
          Edit Group
        </Button>
      </form>
    </div>
  );
};

export default EditGroup;
