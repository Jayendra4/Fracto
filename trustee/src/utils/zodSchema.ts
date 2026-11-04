import { z } from 'zod';

const documentOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const documentSchema = z.object({
  id: z.string(),
  label: z.string(),
  required: z.boolean(),

  helperText: z.string().optional(),
  type: z.string().optional(),

  documentType: z.string(),
  documentName: z.string(),
  documentUrl: z.string(),

  remarks: z.string().optional(),

  options: z.array(documentOptionSchema).optional(),

  validation: z
    .object({
      required: z.string().optional(),
    })
    .optional(),
});

export const documentsSchema = z.array(documentSchema).default([]);
