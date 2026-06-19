import axiosClient from '~/shared/api/axiosClient';
import type { PageResponse } from '~/types/api';
import type {
  AppointmentResponse,
  AvailabilitySummaryResponse,
  BoardingBookingResponse,
  CreateMedicalAppointmentRequest,
  GroomingBoardCardResponse,
  QueueEntryResponse,
  QuickCheckInRequest,
  RoomTypeOptionResponse,
  ServiceCatalogOptionResponse,
  TimeSlotResponse,
  VetOptionResponse,
  AppointmentStatus,
} from '~/types/appointment';
import { normalizePage } from './pageUtils';

const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? value : []);

function normalizeSlotTime(slotStart: string): string {
  if (/^\d{2}:\d{2}$/.test(slotStart)) {
    return `${slotStart}:00`;
  }
  return slotStart;
}

export const appointmentApi = {
  createMedicalAppointment: (data: CreateMedicalAppointmentRequest): Promise<AppointmentResponse> => {
    return axiosClient.post('/v1/appointments', data);
  },

  listOwnerAppointments: async (params?: { page?: number; size?: number }): Promise<PageResponse<AppointmentResponse>> => {
    const raw = await axiosClient.get<any, PageResponse<AppointmentResponse> & { data?: PageResponse<AppointmentResponse> }>(
      '/v1/appointments',
      { params }
    );
    return normalizePage<AppointmentResponse>(raw);
  },

  listTodayAppointments: async (params?: {
    date?: string;
    status?: AppointmentStatus;
    phone?: string;
    customerName?: string;
  }): Promise<AppointmentResponse[]> => {
    return asArray<AppointmentResponse>(await axiosClient.get('/v1/appointments/today', { params }));
  },

  getAvailableSlots: (date: string, vetId?: string): Promise<TimeSlotResponse[]> => {
    return axiosClient.get('/v1/appointments/slots', { params: { date, vetId } });
  },

  listAvailableVets: async (date: string, slotStart: string): Promise<VetOptionResponse[]> => {
    return asArray<VetOptionResponse>(await axiosClient.get('/v1/appointments/vets', {
      params: { date, slotStart: normalizeSlotTime(slotStart) },
    }));
  },

  listVetsOnDuty: async (date: string): Promise<VetOptionResponse[]> => {
    return asArray<VetOptionResponse>(await axiosClient.get('/v1/appointments/vets/on-duty', { params: { date } }));
  },

  getAvailabilitySummary: (
    date: string,
    slotStart?: string
  ): Promise<AvailabilitySummaryResponse> => {
    return axiosClient.get('/v1/appointments/availability', {
      params: {
        date,
        ...(slotStart ? { slotStart: normalizeSlotTime(slotStart) } : {}),
      },
    });
  },

  checkIn: (appointmentId: string): Promise<AppointmentResponse> => {
    return axiosClient.post(`/v1/appointments/${appointmentId}/check-in`);
  },

  startExam: (appointmentId: string): Promise<AppointmentResponse> => {
    return axiosClient.post(`/v1/appointments/${appointmentId}/start-exam`);
  },

  cancel: (appointmentId: string): Promise<AppointmentResponse> => {
    return axiosClient.post(`/v1/appointments/${appointmentId}/cancel`);
  },

  quickCheckIn: (data: QuickCheckInRequest): Promise<AppointmentResponse> => {
    return axiosClient.post('/v1/appointments/quick-check-in', data);
  },

  getVetQueue: async (date?: string): Promise<QueueEntryResponse[]> => {
    return asArray<QueueEntryResponse>(await axiosClient.get('/v1/appointments/queue', { params: date ? { date } : undefined }));
  },

  lookupCustomer: async (phone: string): Promise<{
    ownerId: string;
    ownerName: string;
    phone: string;
    pets: { id: string; name: string }[];
  }> => {
    const result = await axiosClient.get<unknown, {
      ownerId: string;
      ownerName: string;
      phone: string;
      pets?: { id: string; name: string }[];
    }>('/v1/appointments/customer-lookup', { params: { phone } });

    return { ...result, pets: asArray(result?.pets) };
  },

  createGroomingAppointment: (data: {
    petId: string;
    serviceCode: string;
    appointmentDate: string;
    slotStart: string;
    ownerNote?: string;
  }): Promise<AppointmentResponse> => {
    return axiosClient.post('/v1/appointments/grooming', data);
  },

  listGroomingBoard: async (date?: string): Promise<GroomingBoardCardResponse[]> => {
    return asArray<GroomingBoardCardResponse>(await axiosClient.get('/v1/appointments/grooming/board', { params: date ? { date } : undefined }));
  },

  updateGroomingStatus: (
    ticketId: string,
    status: 'PENDING' | 'CONFIRMED' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED'
  ): Promise<GroomingBoardCardResponse> => {
    return axiosClient.patch(`/v1/appointments/grooming/${ticketId}/status`, { status });
  },

  createBoardingBooking: (data: {
    petId: string;
    roomTypeId: string;
    checkinDate: string;
    checkoutDate: string;
    specialCareRequest?: string;
  }): Promise<BoardingBookingResponse> => {
    return axiosClient.post('/v1/appointments/boarding', data);
  },

  listOwnerBoardingBookings: async (): Promise<BoardingBookingResponse[]> => {
    return asArray<BoardingBookingResponse>(await axiosClient.get('/v1/appointments/boarding'));
  },

  listRoomTypes: async (): Promise<RoomTypeOptionResponse[]> => {
    return asArray<RoomTypeOptionResponse>(await axiosClient.get('/v1/appointments/room-types'));
  },

  listServices: async (category: 'MEDICAL' | 'GROOMING' | 'BOARDING'): Promise<ServiceCatalogOptionResponse[]> => {
    return asArray<ServiceCatalogOptionResponse>(await axiosClient.get('/v1/appointments/services', { params: { category } }));
  },
};
