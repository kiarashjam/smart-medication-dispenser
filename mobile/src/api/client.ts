/**
 * API client: axios with base URL from env/Expo config. Token stored in authToken (set by AuthContext);
 * request interceptor adds Bearer; 401 clears token.
 */
import axios from 'axios'
import Constants from 'expo-constants'

const baseURL = Constants.expoConfig?.extra?.apiUrl ?? process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000'

/** Current JWT; set by AuthContext after login/register, cleared on logout or 401. */
export let authToken: string | null = null
export function setAuthToken(token: string | null) {
  authToken = token
}

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) authToken = null
    return Promise.reject(err)
  }
)

export type AuthResponse = { token: string; email: string; fullName: string; role: string; userId: string }
export type MeResponse = { id: string; email: string; fullName: string; role: string }
// Device types - matches technical-docs/01_DEVICE_HARDWARE.md
export type DeviceDto = { 
  id: string; 
  userId: string; 
  name: string; 
  type: 'Main' | 'Portable'; 
  status: 'Active' | 'Paused'; 
  timeZoneId?: string; 
  lastHeartbeatAtUtc?: string;
  firmwareVersion?: string;
  isOnline: boolean;
  batteryLevel?: number;
  wifiSignal?: number;
  temperature?: number;
  humidity?: number;
}
export type TodayScheduleItemDto = { scheduleId: string; containerId: string; slotNumber: number; medicationName: string; medicationImageUrl?: string; pillsPerDose: number; scheduledAtUtc: string; notes?: string }
export type DispenseEventDto = { id: string; deviceId: string; containerId: string; scheduleId: string; scheduledAtUtc: string; status: string; dispensedAtUtc?: string; confirmedAtUtc?: string; missedMarkedAtUtc?: string; medicationName?: string; pillsPerDose?: number }
export type NotificationDto = { id: string; type: string; title: string; body: string; isRead: boolean; createdAtUtc: string }

export type MeProfileResponse = { userId: string; email: string; fullName: string; role: string; devices: { deviceId: string; name: string; type: string; status: string }[] }

export const authApi = {
  register: (body: { email: string; password: string; fullName: string; role: string }) => api.post<AuthResponse>('/api/auth/register', body),
  login: (body: { email: string; password: string }) => api.post<AuthResponse>('/api/auth/login', body),
  me: () => api.get<MeResponse>('/api/auth/me'),
  meProfile: () => api.get<MeProfileResponse>('/api/auth/me/profile'),
}

export const devicesApi = {
  list: () => api.get<DeviceDto[]>('/api/devices'),
  get: (id: string) => api.get<DeviceDto>(`/api/devices/${id}`),
  pause: (id: string) => api.patch<DeviceDto>(`/api/devices/${id}/pause`),
  resume: (id: string) => api.patch<DeviceDto>(`/api/devices/${id}/resume`),
}

// Container types
export type ContainerDto = { id: string; deviceId: string; slotNumber: number; medicationName: string; medicationImageUrl?: string; quantity: number; pillsPerDose: number; lowStockThreshold: number; sourceContainerId?: string }
export type ScheduleDto = { id: string; containerId: string; timeOfDay: string; daysOfWeekBitmask: number; startDate: string; endDate?: string; notes?: string; timeZoneId?: string }
export type AdherenceSummaryDto = { totalScheduled: number; confirmed: number; missed: number; pending: number; adherencePercent: number }

export const containersApi = {
  listByDevice: (deviceId: string) => api.get<ContainerDto[]>(`/api/devices/${deviceId}/containers`),
  create: (deviceId: string, body: { slotNumber: number; medicationName: string; quantity: number; pillsPerDose: number; lowStockThreshold: number }) => api.post<ContainerDto>(`/api/devices/${deviceId}/containers`, body),
  update: (id: string, body: { slotNumber: number; medicationName: string; quantity: number; pillsPerDose: number; lowStockThreshold: number }) => api.put<ContainerDto>(`/api/containers/${id}`, body),
  delete: (id: string) => api.delete(`/api/containers/${id}`),
}

export const schedulesApi = {
  today: (deviceId: string, timeZoneId?: string) => api.get<TodayScheduleItemDto[]>(`/api/devices/${deviceId}/today-schedule`, { params: { timeZoneId } }),
  listByContainer: (containerId: string) => api.get<ScheduleDto[]>(`/api/containers/${containerId}/schedules`),
  create: (containerId: string, body: { timeOfDay: string; daysOfWeekBitmask: number; startDate: string; endDate?: string; notes?: string }) => api.post<ScheduleDto>(`/api/containers/${containerId}/schedules`, body),
  update: (id: string, body: { timeOfDay: string; daysOfWeekBitmask: number; startDate: string; endDate?: string; notes?: string }) => api.put<ScheduleDto>(`/api/schedules/${id}`, body),
  delete: (id: string) => api.delete(`/api/schedules/${id}`),
}

export const adherenceApi = {
  me: (params?: { fromUtc?: string; toUtc?: string }) => api.get<AdherenceSummaryDto>('/api/patients/me/adherence', { params }),
}

export const travelApi = {
  start: (body: { portableDeviceId: string; days: number }) => api.post('/api/travel/start', body),
  end: () => api.post('/api/travel/end'),
}

export const dispensingApi = {
  dispense: (deviceId: string, body: { scheduleId?: string }) => api.post<DispenseEventDto>(`/api/devices/${deviceId}/dispense`, body ?? {}),
  confirm: (eventId: string) => api.post<DispenseEventDto>(`/api/dispense-events/${eventId}/confirm`),
  delay: (eventId: string, body: { minutes: number }) => api.post<DispenseEventDto>(`/api/dispense-events/${eventId}/delay`, body),
}

export const historyApi = {
  events: (deviceId: string, params?: { fromUtc?: string; toUtc?: string; limit?: number }) => api.get<DispenseEventDto[]>(`/api/devices/${deviceId}/events`, { params }),
}

export const notificationsApi = {
  list: (limit?: number) => api.get<NotificationDto[]>('/api/notifications', { params: { limit } }),
  markRead: (id: string) => api.post(`/api/notifications/${id}/read`),
}

/** Extract a user-friendly message from an API error. */
export function getApiErrorMessage(err: unknown): string {
  const e = err as { response?: { data?: string | { message?: string; detail?: string; errors?: Record<string, string[]> } }; message?: string }
  const data = e.response?.data
  if (!data) return e.message ?? 'Something went wrong.'
  if (typeof data === 'string') return data
  if (data.detail) return data.detail
  if (data.message) return data.message
  if (data.errors && typeof data.errors === 'object') {
    const first = Object.entries(data.errors)[0]
    if (first) return first[1]?.[0] ?? first[0]
  }
  return e.message ?? 'Something went wrong.'
}
