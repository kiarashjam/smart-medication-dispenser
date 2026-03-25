/**
 * Device event types and API - matches technical-docs/03_DATA_FORMATS.md
 */

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

export interface DeviceOnlineData {
  firmware: string;
  battery?: number;
  wifi_signal?: number;
}

export interface DeviceOfflineData {
  last_seen: string;
  reason?: string;
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

export interface TravelModeOnData {
  portable_device_id: string;
  medications_transferred: string[];
  days_loaded: number;
}

export interface TravelModeOffData {
  portable_device_id: string;
  days_away: number;
  doses_taken: number;
  doses_missed: number;
}

// ============================================
// Device Event
// ============================================

export interface DeviceEvent<T = unknown> {
  event: DeviceEventType;
  device_id: string;
  timestamp: string;
  data: T;
}

// ============================================
// Heartbeat
// ============================================

export interface HeartbeatSlot {
  slot: number;
  medication?: string;
  pills: number;
}

export interface HeartbeatData {
  device_id: string;
  timestamp?: string;
  battery?: number;
  wifi_signal?: number;
  temperature?: number;
  humidity?: number;
  firmware?: string;
  slots?: HeartbeatSlot[];
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
  days: string[];
}

export interface DeviceSchedule {
  schedules: ScheduleItem[];
}

// ============================================
// Error Codes
// ============================================

export const DeviceErrorCodes = {
  // Network errors (E001-E099)
  NETWORK_WIFI_DISCONNECTED: 'E001',
  NETWORK_API_UNREACHABLE: 'E002',
  NETWORK_AUTH_FAILED: 'E003',
  NETWORK_API_TIMEOUT: 'E004',
  NETWORK_DNS_FAILED: 'E005',
  NETWORK_TLS_FAILED: 'E006',
  NETWORK_RATE_LIMITED: 'E007',
  NETWORK_CELLULAR_NO_SIGNAL: 'E010',
  NETWORK_CELLULAR_NO_DATA: 'E011',
  NETWORK_CELLULAR_ROAMING: 'E012',

  // Hardware errors (E101-E199)
  HARDWARE_PILL_JAM: 'E101',
  HARDWARE_MOTOR_FAILURE: 'E102',
  HARDWARE_MOTOR_OVERCURRENT: 'E103',
  HARDWARE_SENSOR_FAILURE: 'E104',
  HARDWARE_TRAY_NOT_DETECTED: 'E105',
  HARDWARE_TRAY_FULL: 'E106',
  HARDWARE_SLOT_EMPTY: 'E107',
  HARDWARE_SLOT_SENSOR_BLOCKED: 'E108',
  HARDWARE_DISPLAY_FAILURE: 'E109',
  HARDWARE_TOUCH_FAILURE: 'E110',
  HARDWARE_SPEAKER_FAILURE: 'E111',
  HARDWARE_BUTTON_STUCK: 'E112',
  HARDWARE_CAROUSEL_MISALIGNED: 'E120',
  HARDWARE_GATE_STUCK_OPEN: 'E121',
  HARDWARE_GATE_STUCK_CLOSED: 'E122',

  // Power errors (E201-E299)
  POWER_BATTERY_LOW: 'E201',
  POWER_BATTERY_CRITICAL: 'E202',
  POWER_AC_LOST: 'E203',
  POWER_BATTERY_NOT_CHARGING: 'E204',
  POWER_BATTERY_OVERTEMP: 'E205',
  POWER_BATTERY_UNDERTEMP: 'E206',
  POWER_CHARGER_FAULT: 'E207',
  POWER_UPS_BATTERY_LOW: 'E210',

  // Storage / Environmental errors (E301-E399)
  STORAGE_LOCAL_FULL: 'E301',
  STORAGE_TEMP_OUT_OF_RANGE: 'E302',
  STORAGE_HUMIDITY_OUT_OF_RANGE: 'E303',
  STORAGE_SD_CARD_ERROR: 'E304',
  STORAGE_SD_CARD_FULL: 'E305',
  STORAGE_SD_CARD_MISSING: 'E306',

  // Software errors (E501-E599)
  SOFTWARE_FIRMWARE_CORRUPT: 'E501',
  SOFTWARE_CONFIG_CORRUPT: 'E502',
  SOFTWARE_SCHEDULE_SYNC_FAILED: 'E503',
  SOFTWARE_OTA_FAILED: 'E504',
  SOFTWARE_WATCHDOG_RESET: 'E505',
  SOFTWARE_OUT_OF_MEMORY: 'E506',
  SOFTWARE_TASK_CRASH: 'E507',
} as const;

// ============================================
// Helper Functions
// ============================================

export function getErrorSeverityColor(severity?: string): string {
  switch (severity) {
    case 'critical':
      return '#dc2626'; // red-600
    case 'high':
      return '#ea580c'; // orange-600
    case 'medium':
      return '#ca8a04'; // yellow-600
    case 'low':
    default:
      return '#2563eb'; // blue-600
  }
}

export function getEventDisplayName(eventType: DeviceEventType): string {
  switch (eventType) {
    case 'DOSE_DISPENSED':
      return 'Dose Dispensed';
    case 'DOSE_TAKEN':
      return 'Dose Taken';
    case 'DOSE_MISSED':
      return 'Dose Missed';
    case 'REFILL_NEEDED':
      return 'Refill Needed';
    case 'REFILL_CRITICAL':
      return 'Refill Critical';
    case 'DEVICE_ONLINE':
      return 'Device Online';
    case 'DEVICE_OFFLINE':
      return 'Device Offline';
    case 'DEVICE_ERROR':
      return 'Device Error';
    case 'BATTERY_LOW':
      return 'Battery Low';
    case 'BATTERY_CRITICAL':
      return 'Battery Critical';
    case 'TRAVEL_MODE_ON':
      return 'Travel Mode On';
    case 'TRAVEL_MODE_OFF':
      return 'Travel Mode Off';
    default:
      return eventType;
  }
}

export function getEventIcon(eventType: DeviceEventType): string {
  switch (eventType) {
    case 'DOSE_DISPENSED':
      return '💊';
    case 'DOSE_TAKEN':
      return '✅';
    case 'DOSE_MISSED':
      return '❌';
    case 'REFILL_NEEDED':
    case 'REFILL_CRITICAL':
      return '⚠️';
    case 'DEVICE_ONLINE':
      return '🟢';
    case 'DEVICE_OFFLINE':
      return '🔴';
    case 'DEVICE_ERROR':
      return '🔧';
    case 'BATTERY_LOW':
    case 'BATTERY_CRITICAL':
      return '🔋';
    case 'TRAVEL_MODE_ON':
    case 'TRAVEL_MODE_OFF':
      return '✈️';
    default:
      return '📋';
  }
}
