import { useEffect, useRef, useState } from 'react';

type BaseOptions<TId extends string> = {
  documentIds: TId[];
  validateFile: (file: File) => string | null;
  buildMeta: (file: File) => any;
  uploadFile: (file: File) => Promise<string>;
  typeCodeMap?: Record<string, string>;
  mode: 'company' | 'user';
  isRadioImage?: (id: TId) => boolean;
  initialFilesMeta?: Record<string, any>;
};

const UPLOAD_BASE_URL = import.meta.env.VITE_API_URL;

export const useBaseDocumentsUpload = <TId extends string>({
  // documentIds,
  validateFile,
  buildMeta,
  uploadFile,
  typeCodeMap,
  mode,
  isRadioImage,
  initialFilesMeta,
}: BaseOptions<TId>) => {
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [filesMeta, setFilesMeta] = useState<Record<string, any | null>>(
    initialFilesMeta || {}
  );

  const [fileError, setFileError] = useState<Partial<Record<TId, string>>>({});
  const [isUploading, setIsUploading] = useState(false);
  // useEffect(() => {
  //   if (!initialFilesMeta) return;

  //   setFilesMeta((prev) => ({
  //     ...prev,
  //     ...initialFilesMeta,
  //   }));
  // }, [initialFilesMeta]);

  const isInitialized = useRef(false);

  useEffect(() => {
    if (!initialFilesMeta || isInitialized.current) return;

    setFilesMeta(initialFilesMeta);
    isInitialized.current = true;
  }, [initialFilesMeta]);

  const hydrateFromMeta = (
    docs: any[],
    docFields: { id: string; documentType?: string }[]
  ) => {
    const meta: Record<string, any> = {};

    docs.forEach((backendDoc) => {
      const matchedField = docFields.find(
        (df) =>
          df.id === backendDoc.documentName ||
          df.documentType === backendDoc.documentType ||
          df.id === backendDoc.documentIdentifier
      );

      if (!matchedField) return;

      const rawUrl = backendDoc.documentUrl ?? backendDoc.url;

      if (!rawUrl) return;

      meta[matchedField.id] = {
        url: rawUrl.startsWith('http')
          ? rawUrl
          : `${UPLOAD_BASE_URL}/storage/${rawUrl}`,
        isExisting: true,
      };
    });

    setFilesMeta(meta);
  };

  // const handleFileSelected = async (docId: TId, file: File) => {
  //   const error = validateFile(file);
  //   if (error) {
  //     setFileError((prev) => ({ ...prev, [docId]: error }));
  //     return;
  //   }

  //   try {
  //     setIsUploading(true);
  //     setFileError((prev) => ({ ...prev, [docId]: undefined }));

  //     const uploadedUrl = await uploadFile(file);

  //     setFiles((prev) => ({
  //       ...prev,
  //       [docId]: file,
  //     }));

  //     setFilesMeta((prev) => ({
  //       ...prev,
  //       [docId]: {
  //         ...buildMeta(file),
  //         url: uploadedUrl,
  //       },
  //     }));
  //   } catch {
  //     setFileError((prev) => ({
  //       ...prev,
  //       [docId]: 'File upload failed',
  //     }));
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  // const handleClearFile = (docId: TId, required = false) => {
  //   setFiles((prev) => ({ ...prev, [docId]: null }));
  //   setFilesMeta((prev) => ({ ...prev, [docId]: null }));

  //   if (required) {
  //     setFileError((prev) => ({
  //       ...prev,
  //       [docId]: 'This document is required',
  //     }));
  //   } else {
  //     setFileError((prev) => ({ ...prev, [docId]: undefined }));
  //   }
  // };

  const handleFileSelected = async (docId: TId, file: File) => {
    if (isUploading) return; // 🔥 IMPORTANT
    setUploadingDocId(docId);
    const error = validateFile(file);
    if (error) {
      setFileError((prev) => ({ ...prev, [docId]: error }));
      return;
    }

    try {
      setIsUploading(true);

      const uploadedUrl = await uploadFile(file);

      setFiles((prev) => ({
        ...prev,
        [docId]: file,
      }));

      setFilesMeta((prev) => ({
        ...prev,
        [docId]: {
          ...buildMeta(file),
          url: uploadedUrl,
        },
      }));

      // setFilesMeta((prev) => ({
      //   ...prev,
      //   [docId]: {
      //     ...buildMeta(file),
      //     url: uploadedUrl,
      //   },
      // }));
    } catch {
      setFileError((prev) => ({
        ...prev,
        [docId]: 'File upload failed',
      }));
    } finally {
      setIsUploading(false);
      setUploadingDocId(null);
    }
  };

  const handleClearFile = (docId: TId, required = false) => {
    setFiles((prev) => ({ ...prev, [docId]: null }));

    setFilesMeta((prev) => {
      const updated = { ...prev };
      delete updated[docId]; // ✅ null ki jagah delete
      return updated;
    });

    if (required) {
      setFileError((prev) => ({
        ...prev,
        [docId]: 'This document is required',
      }));
    } else {
      setFileError((prev) => ({ ...prev, [docId]: undefined }));
    }
  };

  const handleSubmitAll = async (onSubmit: any, extra: any) => {
    const documents: any[] = [];

    for (const key of Object.keys(filesMeta) as TId[]) {
      const meta = filesMeta[key];
      if (!meta?.url) continue;

      const filename = meta.url.split('/').pop()?.split('?')[0];

      if (!filename) continue;

      if (mode === 'user') {
        documents.push({
          developerName: key,
          filename,
        });
      } else {
        documents.push({
          documentTypeCode: typeCodeMap?.[key] || key,
          documentIdentifier: key,
          documentUrl: filename,
          apiVerified: true,
        });
      }
    }

    await onSubmit({ documents, extra });
  };

  return {
    files,
    filesMeta,
    fileError,
    isUploading,
    handleFileSelected,
    handleClearFile,
    hasDocFile: (id: string) =>
      Object.keys(filesMeta).some(
        (key) => key.startsWith(id) && filesMeta[key]?.url
      ),
    handleSubmitAll,
    isRadioImage,
    hydrateFromMeta,
    uploadingDocId,
  };
};
