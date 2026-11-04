import { MdClose, MdPictureAsPdf } from 'react-icons/md';

type PreviewPanelProps = {
  activeDoc: string | null;
  previewUrl: string | null;
  tempFile: File | null;
  files: Record<string, File | null>;
  fileError: string | null;

  handleClearFile: () => void;
  handleChooseFileClick: () => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleUpdate: (extra?: Record<string, any>) => void;
  isUploading?: boolean;
  retryUpload?: () => void;
  failedFile?: File | null;
};

export default function PreviewPanel({
  activeDoc,
  previewUrl,
  tempFile,
  files,
  fileError,
  handleClearFile,
  handleChooseFileClick,
  handleDrop,
  handleDragOver,
  handleUpdate,
  isUploading,
  retryUpload,
  failedFile,
}: PreviewPanelProps) {
  if (!activeDoc) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-dark-grey text-sm">
        Nothing to show up
      </div>
    );
  }

  const fileToShow = tempFile || files[activeDoc];

  if (!fileToShow) {
    return (
      <div
        onDrop={(e) => {
          if (isUploading) return;
          handleDrop(e);
        }}
        onDragOver={handleDragOver}
        onClick={() => !isUploading && handleChooseFileClick()}
        className="flex min-h-[500px] flex-col items-center justify-center border-2 border-dashed border-inactive-gray px-6 cursor-pointer"
      >
        <p className="text-white text-sm font-medium mb-2">
          Drag & Drop or Choose File
        </p>
        <p className="text-dark-grey text-xs">
          Supported formats: images, PDF and documents
        </p>
      </div>
    );
  }

  const isImage = fileToShow.type.startsWith('image/');
  const isPdf = fileToShow.type === 'application/pdf';

  return (
    <div className="flex min-h-[400px] md:min-h-[500px] flex-col h-full relative">
      <button
        type="button"
        disabled={isUploading}
        onClick={handleClearFile}
        className={`absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full
    ${isUploading ? 'bg-black/30 cursor-not-allowed' : 'bg-black/60'}
    text-white`}
      >
        <MdClose size={18} />
      </button>

      <div className="flex-1 h-full flex items-center justify-center w-full p-4">
        {isImage && previewUrl ? (
          <img
            src={previewUrl}
            className="max-h-[320px] max-w-full rounded-[16px] object-contain"
          />
        ) : isPdf ? (
          <div className="flex flex-col items-center justify-center text-center border border-inactive-gray rounded-[16px] px-6 py-10 bg-[#05070B]">
            <MdPictureAsPdf size={40} className="text-[#FF5252] mb-3" />
            <span className="text-sm text-white mb-2">PDF Document</span>
            <p className="text-xs text-dark-grey break-all">
              {fileToShow.name}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border border-inactive-gray rounded-[16px] px-6 py-10">
            <span className="text-sm mb-2 text-white">Selected file</span>
            <p className="text-xs text-dark-grey break-all">
              {fileToShow.name}
            </p>
          </div>
        )}
      </div>

      <div className="w-full pb-4 px-4 flex flex-col gap-2">
        {fileError && (
          <p className="text-red text-xs text-center mb-1">{fileError}</p>
        )}

        <button
          type="button"
          disabled={isUploading}
          onClick={() =>
            handleUpdate({
              baseDocId: activeDoc,
              selectedOption: null,
            })
          }
          className={`w-full py-2.5 rounded-md text-white text-sm font-medium
            ${isUploading ? 'bg-white/30 cursor-not-allowed' : 'bg-[#2F5BCC]'}
          `}
        >
          {isUploading ? 'Uploading…' : 'Update'}
        </button>

        {fileError && failedFile && retryUpload && (
          <button
            type="button"
            onClick={retryUpload}
            className="w-full py-2.5 rounded-md bg-red-600 text-white text-sm font-medium"
          >
            Retry Upload
          </button>
        )}
      </div>
      {isUploading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm rounded-lg">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mb-3" />
          <p className="text-white text-sm font-medium">Uploading document…</p>
        </div>
      )}
    </div>
  );
}
