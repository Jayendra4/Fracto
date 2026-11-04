import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

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
import { useGetCategoryQuery } from '@/store/api/groupApi';
import { useCreateGroupApiMutation } from '@/store/api/allGroupApi';
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

const CreateGroup = () => {
  const navigate = useNavigate();
  const [isImageUploading, setIsImageUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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
  const { data, isError } = useGetCategoryQuery({
    skip: 0,
    take: 1000,
    categoryStatus: 'Active',
  });

  const categoryOptions = data?.data || [];

  const selectedCategory = watch('categoryId'); // ✅ correct way

  const [createGroup, { isLoading }] = useCreateGroupApiMutation();

  const onSubmit = async (data: GroupFormData) => {
    try {
      const fileName = data.image?.split('/').pop()?.split('?')[0];
      await createGroup({
        title: data.title,
        description: data.description,
        categoryId: data.categoryId, // number already
        image: fileName || '',
      }).unwrap();

      navigate(-1);
    } catch (error: any) {
      toast.error(error?.data?.message);
      console.error('Create group failed', error);
    }
  };

  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-8 xl:max-w-[60%]">
      {/* HEADER */}
      <div className="flex items-center gap-5 mb-4">
        <BackButton />
        <h2 className="text-2xl font-bold">Add Group</h2>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-10 gap-y-6">
          {/* IMAGE */}
          <div className="space-y-2">
            <UploadImage
              label="Profile Image"
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

            {isLoading ? (
              <p className="text-sm text-slate-400">Loading categories...</p>
            ) : isError ? (
              <p className="text-sm text-red-500">Failed to load categories</p>
            ) : (
              <Select
                value={selectedCategory?.toString()}
                onValueChange={(value) => {
                  setValue('categoryId', Number(value), { shouldValidate: true }); // ✅ convert
                }}
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

            {errors.categoryId && (
              <p className="text-sm text-destructive">{errors.categoryId.message}</p>
            )}
          </div>
        </div>

        {/* SUBMIT */}
        <Button disabled={isImageUploading} type="submit" className="mt-6">
          Add Group
        </Button>
      </form>
    </div>
  );
};

export default CreateGroup;
