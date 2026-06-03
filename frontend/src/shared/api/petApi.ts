import axiosClient from '~/shared/api/axiosClient';
import type { PetResponse, PetRequest } from '~/types/pet';
import type { PageResponse } from '~/types/api';

export const petApi = {
  getPets: (params?: { page?: number; size?: number; isActive?: boolean }): Promise<PageResponse<PetResponse>> => {
    return axiosClient.get('/v1/pets', { params });
  },

  getPetById: (id: string): Promise<PetResponse> => {
    return axiosClient.get(`/v1/pets/${id}`);
  },

  createPet: (data: PetRequest): Promise<PetResponse> => {
    return axiosClient.post('/v1/pets', data);
  },

  updatePet: (id: string, data: PetRequest): Promise<PetResponse> => {
    return axiosClient.put(`/v1/pets/${id}`, data);
  },
  
  deletePet: (id: string): Promise<void> => {
    return axiosClient.delete(`/v1/pets/${id}`);
  }
};
