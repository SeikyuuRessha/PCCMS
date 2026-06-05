import axiosClient from '~/shared/api/axiosClient';
import type { PageResponse } from '~/types/api';
import type { CreateUserRequest, UpdateUserRequest, UserResponse } from '~/types/user';

interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}

export const userAdminApi = {
  getUsers: async (params?: GetUsersParams): Promise<PageResponse<UserResponse>> => {
    const response = await axiosClient.get<PageResponse<UserResponse>>('/api/v1/admin/accounts', { params });
    return response as unknown as PageResponse<UserResponse>;
  },

  createUser: async (data: CreateUserRequest): Promise<UserResponse> => {
    const response = await axiosClient.post<UserResponse>('/api/v1/admin/accounts', data);
    return response as unknown as UserResponse;
  },

  updateUser: async (id: string, data: UpdateUserRequest): Promise<UserResponse> => {
    const response = await axiosClient.put<UserResponse>(`/api/v1/admin/accounts/${id}`, data);
    return response as unknown as UserResponse;
  },

  lockUser: async (id: string): Promise<void> => {
    await axiosClient.patch(`/api/v1/admin/accounts/${id}/lock`);
  },

  disableUser: async (id: string): Promise<void> => {
    await axiosClient.patch(`/api/v1/admin/accounts/${id}/disable`);
  },
};
