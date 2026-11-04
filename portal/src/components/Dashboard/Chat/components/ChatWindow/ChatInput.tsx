import React, { useState, useRef } from 'react';
import { FiPaperclip, FiSend } from 'react-icons/fi';
import { uploadFileApi } from '@/api/common.api';

function ChatInput({
  onSend,
}: {
  onSend: (text: string, mediaUrl?: string, type?: string) => void;
}) {
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<{ url: string; type: string } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const response = await uploadFileApi(file);

      if (response.success && response.data) {
        let uploadedUrl = '';
        const data: any = response.data;

        if (typeof data === 'string') {
          uploadedUrl = data;
        } else if (data.url) {
          uploadedUrl = data.url;
        } else if (data.path) {
          uploadedUrl = data.path;
        } else if (data.file) {
          uploadedUrl = data.file;
        }

        if (uploadedUrl) {
          setPreview({
            url: uploadedUrl,
            type: file.type.startsWith('image') ? 'Image' : 'File',
          });
        }
      }
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendClick = () => {
    const finalMediaUrl = preview?.url;
    const finalType = preview?.type || 'Text';

    if (!text.trim() && !finalMediaUrl) return;

    onSend(text, finalMediaUrl, finalType);

    setText('');
    setPreview(null);
  };

  const clearPreview = () => {
    setPreview(null);
  };

  return (
    <div className="p-4 md:p-6 md:px-10 border-t border-[var(--fg)]/10 bg-[var(--bg)]/90 backdrop-blur-xl shrink-0 z-20">
      {preview && (
        <div className="mb-4 mx-2 relative inline-block group animate-in fade-in slide-in-from-bottom-2">
          {preview.type === 'Image' ? (
            <div className="relative rounded-2xl overflow-hidden border border-[var(--fg)]/10 shadow-lg bg-[var(--card-bg)]">
              <img
                src={preview.url}
                alt="Preview"
                className="h-32 object-cover"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-[var(--card-bg)] border border-[var(--fg)]/10 rounded-xl shadow-md">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                <FiPaperclip size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--fg)]">
                  File Attached
                </p>
                <p className="text-[10px] text-[var(--fg)]/50 truncate max-w-[150px]">
                  {preview.url.split('/').pop()}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={clearPreview}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors cursor-pointer z-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 bg-[var(--fg)]/5 border border-[var(--fg)]/10 rounded-3xl px-4 py-2 hover:bg-[var(--fg)]/8 transition-all group focus-within:border-blue-500/30 focus-within:ring-2 focus-within:ring-blue-500/10 relative">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`text-[var(--fg)]/40 hover:text-blue-500 transition-all shrink-0 p-2 hover:bg-blue-500/10 rounded-full ${
            isUploading ? 'animate-pulse' : ''
          }`}
          title="Attach file"
        >
          <FiPaperclip size={20} />
        </button>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 bg-transparent text-[15px] font-normal text-[var(--fg)] placeholder-[var(--fg)]/40 outline-none resize-none py-2 max-h-32 custom-scrollbar font-work leading-relaxed"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendClick();
            }
          }}
        />

        <button
          onClick={() => handleSendClick()}
          disabled={!text.trim() && !preview}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-all shrink-0 ${
            text.trim() || preview
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:scale-110 active:scale-95'
              : 'bg-[var(--fg)]/5 text-[var(--fg)]/20 cursor-not-allowed'
          }`}
        >
          <FiSend
            size={18}
            className={text.trim() || preview ? 'ml-0.5' : ''}
          />
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
