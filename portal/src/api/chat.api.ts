import { axiosRequest } from '@/services/api.service';
import type { IApiResponse } from '@/interface';

export interface ICreateChatPayload {
  type: 'Direct' | 'Group';
  participantIds: number[];
}

export interface IChatMember {
  id: number;
  chatroomId: number;
  accountId: number;
  lastReadAt: string | null;
  isMuted: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    role: string;
  };
}

export interface IChatMessage {
  id: number;
  content: string;
  text?: string; // Optional for backward compatibility
  mediaUrl: string | null;
  type: string;
  status?: string;
  createdAt: string;
  senderId: number;
  chatroomId?: number;
  chatId?: number;
  sender?: {
    id: number;
    firstname: string;
    lastname: string;
    profileImage: string | null;
  };
}

export interface IChat {
  id: number;
  name: string | null;
  type: string;
  createdById: number;
  lastMessageId: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  lastMessage: IChatMessage | null;
  otherUser: {
    id: number;
    firstname: string;
    lastname: string;
    profileImage: string | null;
    userType?: string;
    email?: string;
  } | null;
  asset: {
    id: number;
    assetTitle: string;
  };
  members?: IChatMember[];
  messages?: IChatMessage[];
  isBlocked?: boolean;
  blockedBy?: number;
}

export interface IPaginatedResponse<T> {
  count: number;
  skip: number;
  take: number;
  data: T[];
}

export const createChatApi = async (
  payload: ICreateChatPayload
): Promise<IApiResponse<IChat>> => {
  return axiosRequest<IChat>({
    method: 'POST',
    endpoint: '/chats',
    data: payload,
  });
};

export const createPropertyChatApi = async (
  assetId: number
): Promise<IApiResponse<IChat>> => {
  return axiosRequest<IChat>({
    method: 'POST',
    endpoint: `/chats/asset/${assetId}`,
  });
};

export const getMyChatsApi = async (
  accountId: number,
  skip: number = 0,
  take: number = 20,
  search?: string
): Promise<IApiResponse<IPaginatedResponse<IChat>>> => {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
  return axiosRequest<IPaginatedResponse<IChat>>({
    method: 'GET',
    endpoint: `/chats?skip=${skip}&take=${take}${searchParam}&accountId=${accountId}`,
  });
};

export const getChatDetailsApi = async (
  chatId: number
): Promise<IApiResponse<IChat>> => {
  return axiosRequest<IChat>({
    method: 'GET',
    endpoint: `/chats/${chatId}`,
  });
};

export const getChatMessagesApi = async (
  accountId: number,
  chatRoomId: number,
  skip: number = 0,
  take: number = 20,
  search?: string
): Promise<IApiResponse<IPaginatedResponse<IChatMessage>>> => {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
  return axiosRequest<IPaginatedResponse<IChatMessage>>({
    method: 'GET',
    endpoint: `/chats/message?skip=${skip}&take=${take}${searchParam}&accountId=${accountId}&chatRoomId=${chatRoomId}`,
  });
};

export const getAssetChatMessagesApi = async (
  assetId: number,
  skip: number = 0,
  take: number = 20,
  search?: string
): Promise<IApiResponse<IPaginatedResponse<IChatMessage>>> => {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
  return axiosRequest<IPaginatedResponse<IChatMessage>>({
    method: 'GET',
    endpoint: `/chats/asset/${assetId}?skip=${skip}&take=${take}${searchParam}`,
  });
};

export interface IAvailableUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  profileImage: string | null;
  type: string;
}

export const getAvailableUsersApi = async (
  accountId: number,
  skip: number = 0,
  take: number = 20,
  search?: string
): Promise<IApiResponse<IPaginatedResponse<IAvailableUser>>> => {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
  return axiosRequest<IPaginatedResponse<IAvailableUser>>({
    method: 'GET',
    endpoint: `/chats/available-users?skip=${skip}&take=${take}${searchParam}&accountId=${accountId}`,
  });
};

export const deleteChatApi = async (
  chatId: number
): Promise<IApiResponse<any>> => {
  return axiosRequest<any>({
    method: 'DELETE',
    endpoint: `/chats/${chatId}`,
  });
};

export const clearChatApi = async (
  chatId: number
): Promise<IApiResponse<any>> => {
  return axiosRequest<any>({
    method: 'POST', // Changed to POST as per common pattern for actions, verify if DELETE was intended from URL structure alone (usually key is method) but user provided standard URL
    endpoint: `/chats/${chatId}/clear`,
  });
};

export const blockUserApi = async (
  chatId: number
): Promise<IApiResponse<any>> => {
  return axiosRequest<any>({
    method: 'POST',
    endpoint: `/chats/${chatId}/block`,
  });
};

export const unblockUserApi = async (
  chatId: number
): Promise<IApiResponse<any>> => {
  return axiosRequest<any>({
    method: 'DELETE',
    endpoint: `/chats/${chatId}/unblock`,
  });
};

export const markAsReadApi = async (
  chatId: number
): Promise<IApiResponse<any>> => {
  return axiosRequest<any>({
    method: 'POST',
    endpoint: `/chats/${chatId}/mark-as-read`,
  });
};
