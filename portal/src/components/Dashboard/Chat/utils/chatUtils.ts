import type { IChat } from '@/api/chat.api';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://fracto-api-lugr.onrender.com';

export const getProfilePath = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const cleanPath = path.replace(/^\/+/, '');

  return `${API_BASE_URL}/storage/${cleanPath}`;
};

export const getOtherUserRole = (chat: IChat) => {
  if ((chat.otherUser as any)?.userType)
    return (chat.otherUser as any).userType;

  const role = (chat.otherUser as any)?.type || (chat.otherUser as any)?.role;
  if (role && role !== 'Direct' && role !== 'User') return role;
  if (chat.type && chat.type !== 'Direct') return chat.type;

  return null;
};

export const isImageRegex = /\.(jpg|jpeg|png|gif|webp)$/i;

export const isUrl = (string: string) => {
  try {
    return Boolean(new URL(string));
  } catch (e) {
    return false;
  }
};
