export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  OWNER: {
    DASHBOARD: '/owner',
    PETS: '/owner/pets',
    BOOKING: '/owner/book',
    BOARDING_TRACKING: '/owner/boarding/tracking',
    PAYMENTS: '/owner/payments',
    PROFILE: '/owner/profile',
  },
  RECEPTION: {
    DASHBOARD: '/reception',
    APPOINTMENTS: '/reception/appointments',
    GROOMING_BOARD: '/reception/grooming-board',
    BOARDING_LOG: '/reception/boarding-log',
  },
  DOCTOR: {
    DASHBOARD: '/doctor',
    QUEUE: '/doctor/queue',
    MEDICAL_RECORD: '/doctor/medical-record',
  },
  ADMIN: {
    DASHBOARD: '/admin',
    ACCOUNTS: '/admin/accounts',
    CATALOG: '/admin/catalog',
    ROOMS: '/admin/rooms',
    SCHEDULE: '/admin/schedule',
    REPORTS: '/admin/reports',
  },
} as const;
