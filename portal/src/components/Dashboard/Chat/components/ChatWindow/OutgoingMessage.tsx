import React from 'react';
import { FiCheckCircle, FiClock, FiDownload } from 'react-icons/fi';
import { isUrl, isImageRegex } from '../../utils/chatUtils';

const OutgoingMessage = React.memo(function OutgoingMessage({
  text,
  time,
  status,
  mediaUrl,
  type,
  onImageClick,
}: {
  text: string;
  time: string;
  status?: string;
  mediaUrl?: string | null;
  type?: string;
  onImageClick?: (url: string) => void;
}) {
  const showImage =
    type === 'Image' ||
    (mediaUrl && mediaUrl.match(isImageRegex)) ||
    (isUrl(text) && text.match(isImageRegex));

  const imageUrl = mediaUrl || (showImage ? text : null);

  return (
    <div className="flex justify-end group animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="max-w-[85%] flex flex-col items-end">
        <div className="bg-blue-600 border border-blue-400/20 rounded-2xl rounded-br-none px-5 py-3.5 shadow-2xl shadow-blue-600/10 hover:shadow-blue-600/20 transition-all">
          {showImage && imageUrl ? (
            <div className="mb-2">
              <img
                src={imageUrl}
                alt="attachment"
                className="max-w-full rounded-lg max-h-60 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => onImageClick?.(imageUrl)}
              />
            </div>
          ) : (
            mediaUrl && (
              <div className="mb-2">
                <a
                  href={mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white hover:underline"
                >
                  <FiDownload size={16} />
                  <span>Download Attachment</span>
                </a>
              </div>
            )
          )}

          {(!showImage || text !== imageUrl) && text && text != mediaUrl && (
            <p className="text-[13px] text-white font-medium leading-relaxed whitespace-pre-wrap font-work">
              {text}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2 mr-1">
          <span className="text-[9px] text-[var(--fg)]/30 font-semibold tracking-tight uppercase group-hover:text-blue-500 transition-colors">
            {time}
          </span>
          {status === 'Read' ? (
            <div className="flex" title="Read">
              <FiCheckCircle size={10} className="text-blue-500 -mr-1" />
              <FiCheckCircle size={10} className="text-blue-500" />
            </div>
          ) : status === 'Sent' ? (
            <FiCheckCircle size={10} className="text-blue-500" title="Sent" />
          ) : (
            <FiClock
              size={10}
              className="text-[var(--fg)]/20"
              title="Sending..."
            />
          )}
        </div>
      </div>
    </div>
  );
});

export default OutgoingMessage;
