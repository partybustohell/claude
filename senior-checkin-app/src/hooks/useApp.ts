import { useState, useCallback, useEffect } from 'react';
import {
  Language,
  Senior,
  Contact,
  CheckInStatus,
  EscalationLevel,
  CaregiverSettings,
} from '../types';
import { generateId, isTodayCheckedIn } from '../utils/helpers';

// Default senior profile for demo
const defaultSenior: Senior = {
  id: 'senior-001',
  name: 'दादी जी',
  phone: '+91 98765 43210',
  language: 'hi',
  checkInWindow: {
    start: '07:00',
    end: '10:00',
  },
  voiceFeedbackEnabled: true,
  status: 'pending',
  escalationLevel: 'none',
  batteryLevel: 78,
};

// Default contacts for demo
const defaultContacts: Contact[] = [
  {
    id: 'contact-001',
    name: 'राहुल',
    phone: '+91 98765 11111',
    relationship: 'son',
    priority: 1,
    notifyViaSms: true,
    notifyViaApp: true,
    notifyViaCall: false,
  },
  {
    id: 'contact-002',
    name: 'प्रिया',
    phone: '+91 98765 22222',
    relationship: 'daughter',
    priority: 2,
    notifyViaSms: true,
    notifyViaApp: true,
    notifyViaCall: true,
  },
  {
    id: 'contact-003',
    name: 'शर्मा जी',
    phone: '+91 98765 33333',
    relationship: 'neighbor',
    priority: 3,
    notifyViaSms: false,
    notifyViaApp: false,
    notifyViaCall: true,
  },
  {
    id: 'contact-004',
    name: 'रामू',
    phone: '+91 98765 44444',
    relationship: 'watchman',
    priority: 4,
    notifyViaSms: false,
    notifyViaApp: false,
    notifyViaCall: true,
  },
];

export function useApp() {
  const [senior, setSenior] = useState<Senior>(defaultSenior);
  const [contacts, setContacts] = useState<Contact[]>(defaultContacts);
  const [settings, setSettings] = useState<CaregiverSettings>({
    seniorId: defaultSenior.id,
    contacts: defaultContacts,
    checkInWindow: defaultSenior.checkInWindow,
    reminderDelayMinutes: 30,
    escalationDelayMinutes: 60,
    emergencyNumber: '112',
    localEmergencyEnabled: true,
  });

  // Check if already checked in today on mount
  useEffect(() => {
    if (senior.lastCheckIn && isTodayCheckedIn(senior.lastCheckIn.timestamp)) {
      setSenior((prev) => ({ ...prev, status: 'ok' }));
    }
  }, [senior.lastCheckIn]);

  const performCheckIn = useCallback(() => {
    const now = new Date();
    setSenior((prev) => ({
      ...prev,
      lastCheckIn: {
        id: generateId(),
        timestamp: now,
        method: 'tap',
        status: 'confirmed',
      },
      status: 'ok' as CheckInStatus,
      escalationLevel: 'none' as EscalationLevel,
    }));
  }, []);

  const updateLanguage = useCallback((lang: Language) => {
    setSenior((prev) => ({ ...prev, language: lang }));
  }, []);

  const toggleVoiceFeedback = useCallback(() => {
    setSenior((prev) => ({
      ...prev,
      voiceFeedbackEnabled: !prev.voiceFeedbackEnabled,
    }));
  }, []);

  const updateCheckInWindow = useCallback(
    (start: string, end: string) => {
      setSenior((prev) => ({
        ...prev,
        checkInWindow: { start, end },
      }));
      setSettings((prev) => ({
        ...prev,
        checkInWindow: { start, end },
      }));
    },
    []
  );

  const addContact = useCallback((contact: Omit<Contact, 'id'>) => {
    const newContact = { ...contact, id: generateId() };
    setContacts((prev) => [...prev, newContact]);
  }, []);

  const updateContact = useCallback((id: string, updates: Partial<Contact>) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const removeContact = useCallback((id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const triggerEscalation = useCallback((level: EscalationLevel) => {
    setSenior((prev) => ({
      ...prev,
      escalationLevel: level,
      status: level === 'none' ? prev.status : 'escalating',
    }));
  }, []);

  const resetEscalation = useCallback(() => {
    setSenior((prev) => ({
      ...prev,
      escalationLevel: 'none',
      status: prev.lastCheckIn && isTodayCheckedIn(prev.lastCheckIn.timestamp)
        ? 'ok'
        : 'pending',
    }));
  }, []);

  return {
    senior,
    contacts,
    settings,
    performCheckIn,
    updateLanguage,
    toggleVoiceFeedback,
    updateCheckInWindow,
    addContact,
    updateContact,
    removeContact,
    triggerEscalation,
    resetEscalation,
    setSettings,
  };
}
