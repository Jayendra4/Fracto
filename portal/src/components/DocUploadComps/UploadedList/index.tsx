type FileMeta = {
  name: string;
  type: string;
  size: number;
};

type DocumentConfig = {
  id: string;
  label: string;
  required?: boolean;
  optionalNote?: string;
  isTextField?: boolean;
  type?: string;
  externalConditionalShow?: {
    key: string;
    value: any;
  };
};

type UploadedListProps = {
  filesMeta: Record<string, FileMeta | null>;
  documents: DocumentConfig[];
  watch?: (name: string) => any;
  externalValues?: Record<string, any>;
};

export default function UploadedList({
  filesMeta,
  documents,
  watch,
  externalValues,
}: UploadedListProps) {
  const isDocumentVisible = (doc: DocumentConfig) => {
    const condition = doc.externalConditionalShow;
    if (!condition) return true;

    if (externalValues && condition.key in externalValues) {
      return externalValues[condition.key] === condition.value;
    }
    if (watch) {
      return watch(condition.key) === condition.value;
    }

    return true;
  };

  const uploadedDocs = documents
    .filter(isDocumentVisible)
    .map((doc) => {
      const metaKey = Object.keys(filesMeta).find(
        (k) => k === doc.id || k.startsWith(`${doc.id}_`)
      );

      if (!metaKey || !filesMeta[metaKey]) return null;

      return {
        key: metaKey,
        label: doc.label,
      };
    })
    .filter(Boolean) as { key: string; label: string }[];

  if (uploadedDocs.length === 0) return null;

  return (
    <div className="border-t border-inactive-gray px-4 py-3 text-xs text-white">
      <p className="mb-2 text-dark-grey">Uploaded documents</p>

      <div className="flex flex-wrap gap-2">
        {uploadedDocs.map((doc) => (
          <div
            key={doc.key}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#111113]"
          >
            <span className="h-2 w-2 rounded-full bg-green" />
            <span>{doc.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
