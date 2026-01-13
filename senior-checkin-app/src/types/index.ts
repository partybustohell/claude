// Supported Indian languages
export type Language = 'hi' | 'gu' | 'mr' | 'ta' | 'te' | 'bn' | 'en';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
}

// Senior's check-in status
export type CheckInStatus = 'ok' | 'pending' | 'missed' | 'escalating';

// Escalation levels
export type EscalationLevel =
  | 'none'
  | 'reminder'      // Level 1: Reminder to senior
  | 'family_alert'  // Level 2: Alert to family
  | 'local_contact' // Level 3: Call to neighbor/watchman
  | 'emergency';    // Level 4: Emergency services

export interface CheckIn {
  id: string;
  timestamp: Date;
  method: 'tap' | 'voice' | 'sms' | 'call';
  status: 'confirmed' | 'pending';
}

export interface Senior {
  id: string;
  name: string;
  phone: string;
  language: Language;
  checkInWindow: {
    start: string; // HH:MM format
    end: string;
  };
  voiceFeedbackEnabled: boolean;
  lastCheckIn?: CheckIn;
  batteryLevel?: number;
  status: CheckInStatus;
  escalationLevel: EscalationLevel;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  priority: number; // 1 = highest priority
  notifyViaSms: boolean;
  notifyViaApp: boolean;
  notifyViaCall: boolean;
}

export interface CaregiverSettings {
  seniorId: string;
  contacts: Contact[];
  checkInWindow: {
    start: string;
    end: string;
  };
  reminderDelayMinutes: number;
  escalationDelayMinutes: number;
  emergencyNumber: string;
  localEmergencyEnabled: boolean;
}

// Dashboard view modes
export type DashboardView = 'status' | 'contacts' | 'settings' | 'history';

// Status indicator colors for caregiver dashboard
export interface StatusIndicator {
  color: 'green' | 'yellow' | 'red';
  label: string;
  description: string;
}
