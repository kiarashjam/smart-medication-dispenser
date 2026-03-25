/**
 * Device types and event types - matches technical-docs/03_DATA_FORMATS.md
 */

// ============================================
// Device Types
// ============================================

export type DeviceType = 'main' | 'portable';

export interface Device {
  id: string;
  userId: string;
  name: string;
  type: DeviceType;
  status: 'active' | 'paused' | 'offline';
  firmwareVersion?: string;
  lastHeartbeat?: string;
  batteryLevel?: number;
  wifiSignal?: number;
  temperature?: number;
  humidity?: number;
}

// ============================================
// Event Types
// ============================================

export type DeviceEventType =
  | 'DOSE_DISPENSED'
  | 'DOSE_TAKEN'
  | 'DOSE_MISSED'
  | 'REFILL_NEEDED'
  | 'REFILL_CRITICAL'
  | 'DEVICE_ONLINE'
  | 'DEVICE_OFFLINE'
  | 'DEVICE_ERROR'
  | 'BATTERY_LOW'
  | 'BATTERY_CRITICAL'
  | 'TRAVEL_MODE_ON'
  | 'TRAVEL_MODE_OFF';

// ============================================
// Event Data Types
// ============================================

export interface DoseDispensedData {
  medication: string;
  slot: number;
  pills_dispensed: number;
  pills_remaining: number;
  scheduled_time?: string;
}

export interface DoseTakenData {
  medication: string;
  pills_taken: number;
  seconds_to_take?: number;
  on_time: boolean;
}

export interface DoseMissedData {
  medication: string;
  scheduled_time: string;
  pills_not_taken?: number;
}

export interface RefillNeededData {
  medication: string;
  slot: number;
  pills_remaining: number;
  days_remaining: number;
  daily_usage?: number;
}

export interface DeviceErrorData {
  error_code: string;
  error_type: string;
  slot?: number;
  message: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface BatteryLowData {
  battery_level: number;
  estimated_hours?: number;
}

// ============================================
// Device Event
// ============================================

export interface DeviceEvent<T = unknown> {
  id: string;
  event: DeviceEventType;
  device_id: string;
  timestamp: string;
  data: T;
}

// ============================================
// Slot/Container
// ============================================

export interface Slot {
  slot: number;
  medication?: string;
  medicationId?: string;
  pills: number;
  capacity: number;
  lowStockThreshold: number;
  pillsPerDose: number;
}

// ============================================
// Schedule
// ============================================

export interface ScheduleItem {
  id: string;
  medication: string;
  slot: number;
  pills: number;
  times: string[];
  days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  notes?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================
// Error Codes
// ============================================

export const DeviceErrorCodes = {
  // Network errors (E001-E099)
  E001: { type: 'Network', description: 'WiFi disconnected', severity: 'warning' },
  E002: { type: 'Network', description: 'API unreachable', severity: 'warning' },
  E003: { type: 'Network', description: 'Authentication failed', severity: 'error' },
  E004: { type: 'Network', description: 'API timeout', severity: 'warning' },
  E005: { type: 'Network', description: 'DNS resolution failed', severity: 'error' },
  E006: { type: 'Network', description: 'TLS handshake failed', severity: 'critical' },
  E007: { type: 'Network', description: 'Rate limited', severity: 'info' },
  E010: { type: 'Network', description: 'No cellular signal', severity: 'warning' },
  E011: { type: 'Network', description: 'No cellular data', severity: 'warning' },
  E012: { type: 'Network', description: 'Cellular roaming', severity: 'info' },

  // Hardware errors (E101-E199)
  E101: { type: 'Hardware', description: 'Pill jam detected', severity: 'warning' },
  E102: { type: 'Hardware', description: 'Motor failure', severity: 'error' },
  E103: { type: 'Hardware', description: 'Motor overcurrent', severity: 'critical' },
  E104: { type: 'Hardware', description: 'Sensor failure', severity: 'error' },
  E105: { type: 'Hardware', description: 'Tray not detected', severity: 'warning' },
  E106: { type: 'Hardware', description: 'Tray full', severity: 'warning' },
  E107: { type: 'Hardware', description: 'Slot empty', severity: 'warning' },
  E108: { type: 'Hardware', description: 'Slot sensor blocked', severity: 'error' },
  E109: { type: 'Hardware', description: 'Display failure', severity: 'error' },
  E110: { type: 'Hardware', description: 'Touch failure', severity: 'error' },
  E111: { type: 'Hardware', description: 'Speaker failure', severity: 'error' },
  E112: { type: 'Hardware', description: 'Button stuck', severity: 'warning' },
  E120: { type: 'Hardware', description: 'Carousel misaligned', severity: 'error' },
  E121: { type: 'Hardware', description: 'Gate stuck open', severity: 'error' },
  E122: { type: 'Hardware', description: 'Gate stuck closed', severity: 'error' },

  // Power errors (E201-E299)
  E201: { type: 'Power', description: 'Battery low (<20%)', severity: 'warning' },
  E202: { type: 'Power', description: 'Battery critical (<5%)', severity: 'critical' },
  E203: { type: 'Power', description: 'AC power lost', severity: 'warning' },
  E204: { type: 'Power', description: 'Battery not charging', severity: 'error' },
  E205: { type: 'Power', description: 'Battery overtemperature', severity: 'critical' },
  E206: { type: 'Power', description: 'Battery undertemperature', severity: 'warning' },
  E207: { type: 'Power', description: 'Charger fault', severity: 'error' },
  E210: { type: 'Power', description: 'UPS battery low', severity: 'warning' },

  // Storage / Environmental errors (E301-E399)
  E301: { type: 'Storage', description: 'Local storage full', severity: 'warning' },
  E302: { type: 'Storage', description: 'Temperature out of range', severity: 'warning' },
  E303: { type: 'Storage', description: 'Humidity out of range', severity: 'warning' },
  E304: { type: 'Storage', description: 'SD card error', severity: 'error' },
  E305: { type: 'Storage', description: 'SD card full', severity: 'warning' },
  E306: { type: 'Storage', description: 'SD card missing', severity: 'warning' },

  // Software errors (E501-E599)
  E501: { type: 'Software', description: 'Firmware corrupt', severity: 'critical' },
  E502: { type: 'Software', description: 'Configuration corrupt', severity: 'error' },
  E503: { type: 'Software', description: 'Schedule sync failed', severity: 'error' },
  E504: { type: 'Software', description: 'OTA update failed', severity: 'error' },
  E505: { type: 'Software', description: 'Watchdog reset', severity: 'error' },
  E506: { type: 'Software', description: 'Out of memory', severity: 'critical' },
  E507: { type: 'Software', description: 'Task crash', severity: 'critical' },
} as const;

export type ErrorCode = keyof typeof DeviceErrorCodes;

// ============================================
// Notification Types
// ============================================

export type NotificationType =
  | 'dose_dispensed'
  | 'dose_taken'
  | 'dose_missed'
  | 'refill_needed'
  | 'refill_critical'
  | 'device_online'
  | 'device_offline'
  | 'device_error'
  | 'battery_low'
  | 'travel_mode';

// ============================================
// Helper Functions
// ============================================

export function getEventDisplayName(eventType: DeviceEventType): string {
  const names: Record<DeviceEventType, string> = {
    DOSE_DISPENSED: 'Dose Dispensed',
    DOSE_TAKEN: 'Dose Taken',
    DOSE_MISSED: 'Dose Missed',
    REFILL_NEEDED: 'Refill Needed',
    REFILL_CRITICAL: 'Refill Critical',
    DEVICE_ONLINE: 'Device Online',
    DEVICE_OFFLINE: 'Device Offline',
    DEVICE_ERROR: 'Device Error',
    BATTERY_LOW: 'Battery Low',
    BATTERY_CRITICAL: 'Battery Critical',
    TRAVEL_MODE_ON: 'Travel Mode On',
    TRAVEL_MODE_OFF: 'Travel Mode Off',
  };
  return names[eventType] || eventType;
}

export function getEventColor(eventType: DeviceEventType): string {
  const colors: Record<DeviceEventType, string> = {
    DOSE_DISPENSED: 'blue',
    DOSE_TAKEN: 'green',
    DOSE_MISSED: 'red',
    REFILL_NEEDED: 'yellow',
    REFILL_CRITICAL: 'orange',
    DEVICE_ONLINE: 'green',
    DEVICE_OFFLINE: 'red',
    DEVICE_ERROR: 'red',
    BATTERY_LOW: 'yellow',
    BATTERY_CRITICAL: 'orange',
    TRAVEL_MODE_ON: 'purple',
    TRAVEL_MODE_OFF: 'purple',
  };
  return colors[eventType] || 'gray';
}

export function getEventIcon(eventType: DeviceEventType): string {
  const icons: Record<DeviceEventType, string> = {
    DOSE_DISPENSED: '💊',
    DOSE_TAKEN: '✅',
    DOSE_MISSED: '❌',
    REFILL_NEEDED: '⚠️',
    REFILL_CRITICAL: '🚨',
    DEVICE_ONLINE: '🟢',
    DEVICE_OFFLINE: '🔴',
    DEVICE_ERROR: '🔧',
    BATTERY_LOW: '🔋',
    BATTERY_CRITICAL: '🪫',
    TRAVEL_MODE_ON: '✈️',
    TRAVEL_MODE_OFF: '🏠',
  };
  return icons[eventType] || '📋';
}

export function getSeverityColor(severity?: string): string {
  switch (severity) {
    case 'critical':
      return 'red';
    case 'high':
      return 'orange';
    case 'medium':
      return 'yellow';
    case 'low':
    default:
      return 'blue';
  }
}

export function getErrorDescription(code: string): string {
  const error = DeviceErrorCodes[code as ErrorCode];
  return error?.description || `Unknown error: ${code}`;
}

export function formatBatteryLevel(level?: number): string {
  if (level === undefined) return 'Unknown';
  if (level <= 5) return `${level}% (Critical)`;
  if (level <= 20) return `${level}% (Low)`;
  return `${level}%`;
}

export function formatSlotStatus(pills: number, threshold: number): 'ok' | 'low' | 'critical' | 'empty' {
  if (pills === 0) return 'empty';
  if (pills <= threshold / 2) return 'critical';
  if (pills <= threshold) return 'low';
  return 'ok';
}
