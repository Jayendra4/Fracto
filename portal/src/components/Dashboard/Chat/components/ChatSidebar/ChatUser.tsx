import React from 'react';
import { getProfilePath } from '../../utils/chatUtils';

import ChatAvatar from '../ChatAvatar';

const ChatUser = React.memo(function ChatUser({
  name,
  image,
  role,
  active,
  unreadCount,
  lastMessage,
  onClick,
}: {
  name: string;
  image: string | null | undefined;
  role: string;
  active?: boolean;
  unreadCount?: number;
  lastMessage?: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
        active
          ? 'border-blue-500/30 bg-blue-500/10 shadow-lg shadow-blue-500/5'
          : 'border-transparent hover:bg-[var(--fg)]/5'
      }`}
    >
      <div className="relative shrink-0">
        <ChatAvatar
          src={getProfilePath(image)}
          name={name || 'User'}
          size="lg"
          className="border-2 border-[var(--fg)]/5 shadow-inner"
        />
        {unreadCount ? (
          <div className="absolute -top-1 -right-1 min-w-[20px] h-[20px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-[var(--bg)] shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        ) : (
          active && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--bg)] rounded-full shadow-sm"></div>
          )
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p
            title={name}
            className={`text-sm font-semibold truncate ${active ? 'text-blue-500' : 'text-[var(--fg)]'}`}
          >
            {name}
          </p>
          <span className="text-[9px] text-blue-500/60 font-semibold uppercase tracking-tighter px-1 rounded">
            {role}
          </span>
        </div>
        <p
          className={`text-xs truncate ${unreadCount ? 'text-[var(--fg)] font-semibold' : 'text-[var(--fg)]/60'} font-work`}
        >
          {lastMessage}
        </p>
      </div>
    </div>
  );
});

export default ChatUser;
