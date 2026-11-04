import React from 'react';
import { FiDownload } from 'react-icons/fi';
import { getProfilePath, isUrl, isImageRegex } from '../../utils/chatUtils';

import ChatAvatar from '../ChatAvatar';

const IncomingMessage = React.memo(function IncomingMessage({
  text,
  time,
  sender,
  fallbackProfileImage,
  onImageClick,
}: {
  text: string;
  time: string;
  sender?: any;
  fallbackProfileImage?: string | null;
  onImageClick?: (url: string) => void;
}) {
  const showImage =
    sender?.type === 'Image' ||
    (sender?.mediaUrl && sender.mediaUrl.match(isImageRegex)) ||
    (isUrl(text) && text.match(isImageRegex));

  const imageUrl = sender?.mediaUrl || (showImage ? text : null);

  const profileImage = sender?.profileImage || fallbackProfileImage;

  return (
    <div className="flex gap-4 max-w-[85%] group animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="shrink-0 self-end mb-1">
        <ChatAvatar
          src={getProfilePath(profileImage)}
          name={sender?.firstname || sender?.name || 'User'}
          size="md"
          className="shadow-lg group-hover:scale-110 transition-transform bg-white"
        />
      </div>
      <div className="flex flex-col">
        <div className="bg-[var(--card-bg)] border border-[var(--fg)]/10 rounded-2xl rounded-bl-none px-5 py-3.5 shadow-xl shadow-black/5 hover:shadow-black/10 transition-all backdrop-blur-sm">
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
            sender?.mediaUrl && (
              <div className="mb-2">
                <a
                  href={sender.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-500 hover:underline"
                >
                  <FiDownload size={16} />
                  <span>Download Attachment</span>
                </a>
              </div>
            )
          )}

          {(!showImage || text !== imageUrl) &&
            text &&
            text != sender?.mediaUrl && (
              <p className="text-[13px] text-[var(--fg)] font-medium leading-relaxed whitespace-pre-wrap font-work">
                {text}
              </p>
            )}
        </div>
        <div className="flex items-center gap-2 mt-2 ml-1">
          <p className="text-[9px] text-[var(--fg)]/30 font-semibold tracking-tight uppercase group-hover:text-blue-500 transition-colors">
            {time}
          </p>
        </div>
      </div>
    </div>
  );
});

export default IncomingMessage;
