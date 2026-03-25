/**
 * API client: axios instance with base URL from env, JWT on requests, 401 → logout and redirect to login.
 */
import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || ''

export const api = axios.create({
  baseURL: baseURL || (typeof window !== 'undefined' ? '' : 'http://localhost:5000'),
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT from localStorage to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401, clear token and send user to login.
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export type AuthResponse = { token: string; email: string; fullName: string; role: string; userId: string }
export type MeResponse = { id: string; email: string; fullName: string; role: string }
export type DeviceDto = { id: string; userId: string; name: string; type: string; status: string; timeZoneId?: string; lastHeartbeatAtUtc?: string; batteryLevel?: number; wifiSignal?: number }
export type ContainerDto = { id: string; deviceId: string; slotNumber: number; medicationName: string; medicationImageUrl?: string; quantity: number; pillsPerDose: number; lowStockThreshold: number; sourceContainerId?: string }
export type ScheduleDto = { id: string; containerId: string; timeOfDay: string; daysOfWeekBitmask: number; startDate: string; endDate?: string; notes?: string; timeZoneId?: string }
export type TodayScheduleItemDto = { scheduleId: string; containerId: string; slotNumber: number; medicationName: string; medicationImageUrl?: string; pillsPerDose: number; scheduledAtUtc: string; notes?: string }
export type DispenseEventDto = { id: string; deviceId: string; containerId: string; scheduleId: string; scheduledAtUtc: string; status: string; dispensedAtUtc?: string; confirmedAtUtc?: string; missedMarkedAtUtc?: string; medicationName?: string; pillsPerDose?: number }
export type NotificationDto = { id: string; type: string; title: string; body: string; isRead: boolean; createdAtUtc: string }
export type AdherenceSummaryDto = { totalScheduled: number; confirmed: number; missed: number; pending: number; adherencePercent: number }
export type TravelSessionDto = { id: string; mainDeviceId: string; portableDeviceId: string; startedAtUtc: string; endedAtUtc?: string; plannedEndDateUtc: string }

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
  create: (body: { name: string; type: string; timeZoneId?: string }) => api.post<DeviceDto>('/api/devices', body),
  pause: (id: string) => api.patch<DeviceDto>(`/api/devices/${id}/pause`),
  resume: (id: string) => api.patch<DeviceDto>(`/api/devices/${id}/resume`),
  heartbeat: (id: string) => api.post(`/api/devices/${id}/heartbeat`),
}

export const containersApi = {
  listByDevice: (deviceId: string) => api.get<ContainerDto[]>(`/api/devices/${deviceId}/containers`),
  create: (deviceId: string, body: { slotNumber: number; medicationName: string; medicationImageUrl?: string; quantity: number; pillsPerDose: number; lowStockThreshold: number; sourceContainerId?: string }) => api.post<ContainerDto>(`/api/devices/${deviceId}/containers`, body),
  update: (id: string, body: { slotNumber: number; medicationName: string; medicationImageUrl?: string; quantity: number; pillsPerDose: number; lowStockThreshold: number }) => api.put<ContainerDto>(`/api/containers/${id}`, body),
  delete: (id: string) => api.delete(`/api/containers/${id}`),
}

export const schedulesApi = {
  listByContainer: (containerId: string) => api.get<ScheduleDto[]>(`/api/containers/${containerId}/schedules`),
  create: (containerId: string, body: { timeOfDay: string; daysOfWeekBitmask: number; startDate: string; endDate?: string; notes?: string; timeZoneId?: string }) => api.post<ScheduleDto>(`/api/containers/${containerId}/schedules`, body),
  update: (id: string, body: { timeOfDay: string; daysOfWeekBitmask: number; startDate: string; endDate?: string; notes?: string; timeZoneId?: string }) => api.put<ScheduleDto>(`/api/schedules/${id}`, body),
  delete: (id: string) => api.delete(`/api/schedules/${id}`),
  today: (deviceId: string, timeZoneId?: string) => api.get<TodayScheduleItemDto[]>(`/api/devices/${deviceId}/today-schedule`, { params: { timeZoneId } }),
}

export const dispensingApi = {
  dispense: (deviceId: string, body: { scheduleId?: string }) => api.post<DispenseEventDto>(`/api/devices/${deviceId}/dispense`, body ?? {}),
  confirm: (eventId: string) => api.post<DispenseEventDto>(`/api/dispense-events/${eventId}/confirm`),
  delay: (eventId: string, body: { minutes: number }) => api.post<DispenseEventDto>(`/api/dispense-events/${eventId}/delay`, body),
}

export const travelApi = {
  start: (body: { portableDeviceId: string; days: number }) => api.post<TravelSessionDto>('/api/travel/start', body),
  end: () => api.post<TravelSessionDto>('/api/travel/end'),
}

export const historyApi = {
  events: (deviceId: string, params?: { fromUtc?: string; toUtc?: string; limit?: number }) => api.get<DispenseEventDto[]>(`/api/devices/${deviceId}/events`, { params }),
}

export const adherenceApi = {
  me: (params?: { fromUtc?: string; toUtc?: string }) => api.get<AdherenceSummaryDto>('/api/patients/me/adherence', { params }),
}

export const notificationsApi = {
  list: (limit?: number) => api.get<NotificationDto[]>('/api/notifications', { params: { limit } }),
  markRead: (id: string) => api.post(`/api/notifications/${id}/read`),
}

// Integrations: webhooks (outgoing) and device API keys (for cloud/hardware).
export type WebhookEndpointDto = { id: string; url: string; isActive: boolean; description?: string; lastTriggeredAtUtc?: string; lastStatus?: string; createdAtUtc: string }
export type DeviceApiKeyDto = { id: string; name?: string; createdAtUtc: string; lastUsedAtUtc?: string }
export type CreateDeviceApiKeyResult = { apiKeyId: string; plainKey: string }

export const integrationsApi = {
  getWebhooks: () => api.get<WebhookEndpointDto[]>('/api/integrations/webhooks'),
  createWebhook: (body: { url: string; secret?: string; description?: string }) => api.post<WebhookEndpointDto>('/api/integrations/webhooks', body),
  deleteWebhook: (id: string) => api.delete(`/api/integrations/webhooks/${id}`),
  getDeviceApiKeys: (deviceId: string) => api.get<DeviceApiKeyDto[]>(`/api/integrations/devices/${deviceId}/api-keys`),
  createDeviceApiKey: (deviceId: string, body?: { name?: string }) => api.post<CreateDeviceApiKeyResult>(`/api/integrations/devices/${deviceId}/api-keys`, body ?? {}),
  deleteDeviceApiKey: (deviceId: string, apiKeyId: string) => api.delete(`/api/integrations/devices/${deviceId}/api-keys/${apiKeyId}`),
}
