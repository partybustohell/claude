import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  Settings,
  Clock,
  Battery,
  Phone,
  MessageSquare,
  Bell,
  ChevronRight,
  Plus,
  ArrowLeft,
  Globe,
  Volume2,
  Trash2,
} from 'lucide-react';
import { useAppContext } from '../App';
import { getTranslation, LANGUAGES } from '../i18n/translations';
import { formatRelativeTime, getBatteryColor, isTodayCheckedIn } from '../utils/helpers';
import type { DashboardView, Contact, Language } from '../types';

export function CaregiverDashboard() {
  const navigate = useNavigate();
  const {
    senior,
    contacts,
    settings,
    updateLanguage,
    updateCheckInWindow,
    addContact,
    updateContact,
    removeContact,
    setSettings,
  } = useAppContext();

  const t = getTranslation(senior.language);
  const [activeView, setActiveView] = useState<DashboardView>('status');
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);

  // Determine status color
  const getStatusInfo = () => {
    const isCheckedIn = senior.lastCheckIn && isTodayCheckedIn(senior.lastCheckIn.timestamp);

    if (senior.escalationLevel !== 'none') {
      return {
        color: 'red' as const,
        label: t.escalationActive,
        bgClass: 'bg-danger-red-500',
        borderClass: 'border-danger-red-500',
      };
    }
    if (isCheckedIn) {
      return {
        color: 'green' as const,
        label: t.allOk,
        bgClass: 'bg-safe-green-500',
        borderClass: 'border-safe-green-500',
      };
    }
    return {
      color: 'yellow' as const,
      label: t.checkInPending,
      bgClass: 'bg-alert-amber-500',
      borderClass: 'border-alert-amber-500',
    };
  };

  const statusInfo = getStatusInfo();

  // Navigation tabs
  const tabs = [
    { id: 'status' as const, icon: Home, label: t.status },
    { id: 'contacts' as const, icon: Users, label: t.contacts },
    { id: 'settings' as const, icon: Settings, label: t.settings },
  ];

  return (
    <div className="min-h-screen-safe safe-area-inset flex flex-col bg-neutral-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-neutral-600" />
          </button>
          <h1 className="text-lg font-semibold text-neutral-800">
            {t.dashboard}
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeView === 'status' && (
          <StatusView
            senior={senior}
            statusInfo={statusInfo}
            t={t}
          />
        )}

        {activeView === 'contacts' && (
          <ContactsView
            contacts={contacts}
            t={t}
            onEdit={setEditingContact}
            onRemove={removeContact}
            onAdd={() => setShowAddContact(true)}
          />
        )}

        {activeView === 'settings' && (
          <SettingsView
            senior={senior}
            settings={settings}
            t={t}
            onLanguageChange={updateLanguage}
            onWindowChange={updateCheckInWindow}
            onSettingsChange={setSettings}
          />
        )}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 safe-area-inset">
        <div className="flex justify-around py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`
                flex flex-col items-center py-2 px-4 rounded-lg
                transition-colors
                ${activeView === tab.id
                  ? 'text-safe-green-600'
                  : 'text-neutral-500 hover:text-neutral-700'
                }
              `}
            >
              <tab.icon className="w-6 h-6" />
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Contact edit modal */}
      {(editingContact || showAddContact) && (
        <ContactModal
          contact={editingContact}
          t={t}
          onSave={(contact) => {
            if (editingContact) {
              updateContact(editingContact.id, contact);
            } else {
              addContact(contact as Omit<Contact, 'id'>);
            }
            setEditingContact(null);
            setShowAddContact(false);
          }}
          onClose={() => {
            setEditingContact(null);
            setShowAddContact(false);
          }}
        />
      )}
    </div>
  );
}

// Status View Component
function StatusView({
  senior,
  statusInfo,
  t,
}: {
  senior: ReturnType<typeof useAppContext>['senior'];
  statusInfo: { color: string; label: string; bgClass: string; borderClass: string };
  t: ReturnType<typeof getTranslation>;
}) {
  return (
    <div className="p-4 space-y-4">
      {/* Main status card */}
      <div className={`p-6 rounded-xl bg-white border-l-4 ${statusInfo.borderClass} shadow-sm`}>
        <div className="flex items-center space-x-4">
          <div className={`w-16 h-16 rounded-full ${statusInfo.bgClass} flex items-center justify-center`}>
            {statusInfo.color === 'green' && (
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {statusInfo.color === 'yellow' && (
              <Clock className="w-10 h-10 text-white" />
            )}
            {statusInfo.color === 'red' && (
              <Bell className="w-10 h-10 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-neutral-800">{senior.name}</h2>
            <p className={`text-lg font-medium ${
              statusInfo.color === 'green' ? 'text-safe-green-600' :
              statusInfo.color === 'yellow' ? 'text-alert-amber-600' :
              'text-danger-red-600'
            }`}>
              {statusInfo.label}
            </p>
          </div>
        </div>
      </div>

      {/* Last check-in info */}
      <div className="p-4 rounded-xl bg-white shadow-sm">
        <div className="flex items-center space-x-3 text-neutral-600">
          <Clock className="w-5 h-5" />
          <span className="font-medium">{t.lastSeen}</span>
        </div>
        <p className="text-lg font-semibold text-neutral-800 mt-2">
          {senior.lastCheckIn
            ? formatRelativeTime(senior.lastCheckIn.timestamp, senior.language)
            : '-'
          }
        </p>
        {senior.lastCheckIn && (
          <p className="text-sm text-neutral-500 mt-1">
            {senior.lastCheckIn.timestamp.toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        )}
      </div>

      {/* Battery level */}
      {senior.batteryLevel !== undefined && (
        <div className="p-4 rounded-xl bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Battery className={`w-5 h-5 ${getBatteryColor(senior.batteryLevel)}`} />
              <span className="font-medium text-neutral-600">{t.battery}</span>
            </div>
            <span className={`text-lg font-semibold ${getBatteryColor(senior.batteryLevel)}`}>
              {senior.batteryLevel}%
            </span>
          </div>
          {/* Battery bar */}
          <div className="mt-3 h-3 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                senior.batteryLevel > 50 ? 'bg-safe-green-500' :
                senior.batteryLevel > 20 ? 'bg-alert-amber-500' :
                'bg-danger-red-500'
              }`}
              style={{ width: `${senior.batteryLevel}%` }}
            />
          </div>
        </div>
      )}

      {/* Check-in window */}
      <div className="p-4 rounded-xl bg-white shadow-sm">
        <div className="flex items-center space-x-3 text-neutral-600 mb-2">
          <Clock className="w-5 h-5" />
          <span className="font-medium">{t.checkInWindow}</span>
        </div>
        <p className="text-lg font-semibold text-neutral-800">
          {senior.checkInWindow.start} - {senior.checkInWindow.end}
        </p>
      </div>
    </div>
  );
}

// Contacts View Component
function ContactsView({
  contacts,
  t,
  onEdit,
  onRemove,
  onAdd,
}: {
  contacts: Contact[];
  t: ReturnType<typeof getTranslation>;
  onEdit: (contact: Contact) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) {
  const sortedContacts = [...contacts].sort((a, b) => a.priority - b.priority);

  return (
    <div className="p-4 space-y-4">
      {/* Add contact button */}
      <button
        onClick={onAdd}
        className="w-full p-4 rounded-xl bg-safe-green-50 border-2 border-dashed border-safe-green-300 text-safe-green-600 hover:bg-safe-green-100 transition-colors flex items-center justify-center space-x-2"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">{t.addContact}</span>
      </button>

      {/* Contact list */}
      {sortedContacts.map((contact, index) => (
        <div
          key={contact.id}
          className="p-4 rounded-xl bg-white shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {/* Priority badge */}
              <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-bold text-neutral-600">
                {index + 1}
              </div>
              <div>
                <h3 className="font-semibold text-neutral-800">{contact.name}</h3>
                <p className="text-sm text-neutral-500">{contact.phone}</p>
                <p className="text-sm text-neutral-400 capitalize">
                  {t[contact.relationship as keyof typeof t] || contact.relationship}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onRemove(contact.id)}
                className="p-2 rounded-lg hover:bg-danger-red-50 transition-colors text-neutral-400 hover:text-danger-red-500"
                aria-label="Remove contact"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => onEdit(contact)}
                className="p-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-500"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notification methods */}
          <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-neutral-100">
            <div className={`flex items-center space-x-1 ${contact.notifyViaSms ? 'text-safe-green-600' : 'text-neutral-300'}`}>
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs">{t.sms}</span>
            </div>
            <div className={`flex items-center space-x-1 ${contact.notifyViaApp ? 'text-safe-green-600' : 'text-neutral-300'}`}>
              <Bell className="w-4 h-4" />
              <span className="text-xs">{t.app}</span>
            </div>
            <div className={`flex items-center space-x-1 ${contact.notifyViaCall ? 'text-safe-green-600' : 'text-neutral-300'}`}>
              <Phone className="w-4 h-4" />
              <span className="text-xs">{t.call}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Settings View Component
function SettingsView({
  senior,
  settings,
  t,
  onLanguageChange,
  onWindowChange,
  onSettingsChange,
}: {
  senior: ReturnType<typeof useAppContext>['senior'];
  settings: ReturnType<typeof useAppContext>['settings'];
  t: ReturnType<typeof getTranslation>;
  onLanguageChange: (lang: Language) => void;
  onWindowChange: (start: string, end: string) => void;
  onSettingsChange: React.Dispatch<React.SetStateAction<typeof settings>>;
}) {
  const [windowStart, setWindowStart] = useState(settings.checkInWindow.start);
  const [windowEnd, setWindowEnd] = useState(settings.checkInWindow.end);

  const handleWindowSave = () => {
    onWindowChange(windowStart, windowEnd);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Language setting */}
      <div className="p-4 rounded-xl bg-white shadow-sm">
        <div className="flex items-center space-x-3 mb-3">
          <Globe className="w-5 h-5 text-neutral-600" />
          <span className="font-medium text-neutral-800">{t.language}</span>
        </div>
        <select
          value={senior.language}
          onChange={(e) => onLanguageChange(e.target.value as Language)}
          className="w-full p-3 rounded-lg border border-neutral-200 bg-white text-neutral-800 focus:border-safe-green-500 focus:ring-2 focus:ring-safe-green-200"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName} ({lang.name})
            </option>
          ))}
        </select>
      </div>

      {/* Voice feedback */}
      <div className="p-4 rounded-xl bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Volume2 className="w-5 h-5 text-neutral-600" />
            <span className="font-medium text-neutral-800">Voice Feedback</span>
          </div>
          <button
            onClick={() => {}}
            className={`w-12 h-7 rounded-full transition-colors ${
              senior.voiceFeedbackEnabled ? 'bg-safe-green-500' : 'bg-neutral-300'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
              senior.voiceFeedbackEnabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      {/* Check-in window */}
      <div className="p-4 rounded-xl bg-white shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <Clock className="w-5 h-5 text-neutral-600" />
          <span className="font-medium text-neutral-800">{t.checkInWindow}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-neutral-500 mb-1 block">{t.from}</label>
            <input
              type="time"
              value={windowStart}
              onChange={(e) => setWindowStart(e.target.value)}
              className="w-full p-3 rounded-lg border border-neutral-200 bg-white text-neutral-800 focus:border-safe-green-500"
            />
          </div>
          <div>
            <label className="text-sm text-neutral-500 mb-1 block">{t.to}</label>
            <input
              type="time"
              value={windowEnd}
              onChange={(e) => setWindowEnd(e.target.value)}
              className="w-full p-3 rounded-lg border border-neutral-200 bg-white text-neutral-800 focus:border-safe-green-500"
            />
          </div>
        </div>
        <button
          onClick={handleWindowSave}
          className="mt-4 w-full py-3 bg-safe-green-600 text-white rounded-lg font-medium hover:bg-safe-green-700 transition-colors"
        >
          {t.save}
        </button>
      </div>

      {/* Escalation delays */}
      <div className="p-4 rounded-xl bg-white shadow-sm space-y-4">
        <div>
          <label className="text-sm text-neutral-500 mb-1 block">{t.reminderDelay}</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={settings.reminderDelayMinutes}
              onChange={(e) => onSettingsChange(prev => ({
                ...prev,
                reminderDelayMinutes: parseInt(e.target.value) || 30
              }))}
              className="w-20 p-3 rounded-lg border border-neutral-200 bg-white text-neutral-800 text-center"
              min={5}
              max={120}
            />
            <span className="text-neutral-500">{t.minutes}</span>
          </div>
        </div>
        <div>
          <label className="text-sm text-neutral-500 mb-1 block">{t.escalationDelay}</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={settings.escalationDelayMinutes}
              onChange={(e) => onSettingsChange(prev => ({
                ...prev,
                escalationDelayMinutes: parseInt(e.target.value) || 60
              }))}
              className="w-20 p-3 rounded-lg border border-neutral-200 bg-white text-neutral-800 text-center"
              min={15}
              max={180}
            />
            <span className="text-neutral-500">{t.minutes}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Contact Modal Component
function ContactModal({
  contact,
  t,
  onSave,
  onClose,
}: {
  contact: Contact | null;
  t: ReturnType<typeof getTranslation>;
  onSave: (contact: Partial<Contact>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    phone: contact?.phone || '',
    relationship: contact?.relationship || 'other',
    priority: contact?.priority || 1,
    notifyViaSms: contact?.notifyViaSms ?? true,
    notifyViaApp: contact?.notifyViaApp ?? true,
    notifyViaCall: contact?.notifyViaCall ?? false,
  });

  const relationships = ['son', 'daughter', 'spouse', 'neighbor', 'watchman', 'caretaker', 'other'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {contact ? t.editContact : t.addContact}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-1 block">{t.name}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 rounded-lg border border-neutral-200 focus:border-safe-green-500 focus:ring-2 focus:ring-safe-green-200"
              placeholder="Enter name"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-1 block">{t.phone}</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full p-3 rounded-lg border border-neutral-200 focus:border-safe-green-500 focus:ring-2 focus:ring-safe-green-200"
              placeholder="+91 98765 43210"
            />
          </div>

          {/* Relationship */}
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-1 block">{t.relationship}</label>
            <select
              value={formData.relationship}
              onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
              className="w-full p-3 rounded-lg border border-neutral-200 focus:border-safe-green-500"
            >
              {relationships.map((rel) => (
                <option key={rel} value={rel}>
                  {t[rel as keyof typeof t] || rel}
                </option>
              ))}
            </select>
          </div>

          {/* Notification methods */}
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 block">{t.notifyBy}</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notifyViaSms}
                  onChange={(e) => setFormData(prev => ({ ...prev, notifyViaSms: e.target.checked }))}
                  className="w-5 h-5 rounded border-neutral-300 text-safe-green-600 focus:ring-safe-green-500"
                />
                <span>{t.sms}</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notifyViaApp}
                  onChange={(e) => setFormData(prev => ({ ...prev, notifyViaApp: e.target.checked }))}
                  className="w-5 h-5 rounded border-neutral-300 text-safe-green-600 focus:ring-safe-green-500"
                />
                <span>{t.app}</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notifyViaCall}
                  onChange={(e) => setFormData(prev => ({ ...prev, notifyViaCall: e.target.checked }))}
                  className="w-5 h-5 rounded border-neutral-300 text-safe-green-600 focus:ring-safe-green-500"
                />
                <span>{t.call}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-neutral-200 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-neutral-200 rounded-lg font-medium text-neutral-700 hover:bg-neutral-50"
          >
            {t.cancel}
          </button>
          <button
            onClick={() => onSave(formData)}
            className="flex-1 py-3 bg-safe-green-600 text-white rounded-lg font-medium hover:bg-safe-green-700"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}
