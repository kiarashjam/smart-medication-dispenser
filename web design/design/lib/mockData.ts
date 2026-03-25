// Mock data for the medication dispenser app

export const mockUsers = [
  {
    id: 1,
    email: 'demo@example.com',
    password: 'password123',
    fullName: 'Alex Johnson',
    role: 'Patient',
  },
  {
    id: 2,
    email: 'caregiver@example.com',
    password: 'password123',
    fullName: 'Sarah Smith',
    role: 'Caregiver',
  },
];

export const mockDevices = [
  {
    id: 1,
    userId: 1,
    name: 'Main Dispenser',
    type: 'Smart Dispenser Pro',
    status: 'active',
    lastHeartbeat: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    timeZone: 'America/New_York',
    isPaused: false,
  },
  {
    id: 2,
    userId: 1,
    name: 'Portable Unit',
    type: 'Travel Dispenser Mini',
    status: 'idle',
    lastHeartbeat: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    timeZone: 'America/New_York',
    isPaused: false,
  },
];

export const mockContainers = [
  {
    id: 1,
    deviceId: 1,
    slotNumber: 1,
    medicationName: 'Aspirin',
    imageUrl: null,
    quantity: 45,
    pillsPerDose: 1,
    lowStockThreshold: 10,
  },
  {
    id: 2,
    deviceId: 1,
    slotNumber: 2,
    medicationName: 'Vitamin D',
    imageUrl: null,
    quantity: 8,
    pillsPerDose: 1,
    lowStockThreshold: 10,
  },
  {
    id: 3,
    deviceId: 1,
    slotNumber: 3,
    medicationName: 'Blood Pressure Med',
    imageUrl: null,
    quantity: 30,
    pillsPerDose: 2,
    lowStockThreshold: 15,
  },
  {
    id: 4,
    deviceId: 1,
    slotNumber: 4,
    medicationName: 'Omega-3',
    imageUrl: null,
    quantity: 5,
    pillsPerDose: 1,
    lowStockThreshold: 10,
  },
];

export const mockSchedules = [
  {
    id: 1,
    containerId: 1,
    timeOfDay: '08:00',
    daysOfWeek: 127, // All days
    startDate: '2026-01-01',
    endDate: null,
    notes: 'Take with breakfast',
    timeZone: 'America/New_York',
  },
  {
    id: 2,
    containerId: 2,
    timeOfDay: '08:00',
    daysOfWeek: 127,
    startDate: '2026-01-01',
    endDate: null,
    notes: null,
    timeZone: 'America/New_York',
  },
  {
    id: 3,
    containerId: 3,
    timeOfDay: '09:00',
    daysOfWeek: 127,
    startDate: '2026-01-01',
    endDate: null,
    notes: 'Morning dose',
    timeZone: 'America/New_York',
  },
  {
    id: 4,
    containerId: 3,
    timeOfDay: '21:00',
    daysOfWeek: 127,
    startDate: '2026-01-01',
    endDate: null,
    notes: 'Evening dose',
    timeZone: 'America/New_York',
  },
  {
    id: 5,
    containerId: 4,
    timeOfDay: '12:00',
    daysOfWeek: 127,
    startDate: '2026-01-01',
    endDate: null,
    notes: 'With lunch',
    timeZone: 'America/New_York',
  },
];

// Generate more comprehensive history data for better visualization
const generateHistoryData = () => {
  const history = [];
  const today = new Date();
  
  // Generate data for the past 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Morning doses
    history.push({
      id: history.length + 1,
      deviceId: 1,
      containerId: 1,
      scheduledTime: new Date(date.setHours(8, 0, 0, 0)).toISOString(),
      status: Math.random() > 0.1 ? 'Confirmed' : 'Missed',
      confirmedTime: Math.random() > 0.1 ? new Date(date.setHours(8, Math.floor(Math.random() * 10), 0, 0)).toISOString() : null,
      medicationName: 'Aspirin',
      pillsDispensed: Math.random() > 0.1 ? 1 : 0,
    });
    
    history.push({
      id: history.length + 1,
      deviceId: 1,
      containerId: 2,
      scheduledTime: new Date(date.setHours(8, 0, 0, 0)).toISOString(),
      status: Math.random() > 0.15 ? 'Confirmed' : 'Missed',
      confirmedTime: Math.random() > 0.15 ? new Date(date.setHours(8, Math.floor(Math.random() * 10), 0, 0)).toISOString() : null,
      medicationName: 'Vitamin D',
      pillsDispensed: Math.random() > 0.15 ? 1 : 0,
    });
    
    // Midday dose
    history.push({
      id: history.length + 1,
      deviceId: 1,
      containerId: 3,
      scheduledTime: new Date(date.setHours(9, 0, 0, 0)).toISOString(),
      status: Math.random() > 0.12 ? 'Confirmed' : 'Missed',
      confirmedTime: Math.random() > 0.12 ? new Date(date.setHours(9, Math.floor(Math.random() * 15), 0, 0)).toISOString() : null,
      medicationName: 'Blood Pressure Med',
      pillsDispensed: Math.random() > 0.12 ? 2 : 0,
    });
    
    history.push({
      id: history.length + 1,
      deviceId: 1,
      containerId: 4,
      scheduledTime: new Date(date.setHours(12, 0, 0, 0)).toISOString(),
      status: Math.random() > 0.18 ? 'Confirmed' : 'Missed',
      confirmedTime: Math.random() > 0.18 ? new Date(date.setHours(12, Math.floor(Math.random() * 15), 0, 0)).toISOString() : null,
      medicationName: 'Omega-3',
      pillsDispensed: Math.random() > 0.18 ? 1 : 0,
    });
    
    // Evening dose
    history.push({
      id: history.length + 1,
      deviceId: 1,
      containerId: 3,
      scheduledTime: new Date(date.setHours(21, 0, 0, 0)).toISOString(),
      status: Math.random() > 0.2 ? 'Confirmed' : 'Missed',
      confirmedTime: Math.random() > 0.2 ? new Date(date.setHours(21, Math.floor(Math.random() * 20), 0, 0)).toISOString() : null,
      medicationName: 'Blood Pressure Med',
      pillsDispensed: Math.random() > 0.2 ? 2 : 0,
    });
  }
  
  return history;
};

export const mockHistory = generateHistoryData();

export const mockNotifications = [
  {
    id: 1,
    userId: 1,
    type: 'low_stock',
    title: 'Low Stock Alert',
    body: 'Vitamin D is running low (8 pills remaining)',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 2,
    userId: 1,
    type: 'low_stock',
    title: 'Low Stock Alert',
    body: 'Omega-3 is running low (5 pills remaining)',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 3,
    userId: 1,
    type: 'missed_dose',
    title: 'Missed Dose',
    body: 'Blood Pressure Med was not taken at 9:00 PM',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 4,
    userId: 1,
    type: 'device_offline',
    title: 'Device Status',
    body: 'Portable Unit has been offline for 2 hours',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

export const mockWebhooks = [
  {
    id: 1,
    userId: 1,
    url: 'https://example.com/webhook',
    secret: 'secret_abc123',
    description: 'Send alerts to my server',
    lastTriggered: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: 'success',
  },
];

export const mockApiKeys = [
  {
    id: 1,
    userId: 1,
    deviceId: 1,
    name: 'Integration Key',
    keyPreview: 'sk_...xyz789',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];