import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Phone, Users, AlertTriangle, Check, X } from 'lucide-react';
import { useAppContext } from '../App';
import { getTranslation } from '../i18n/translations';
import { speakText, vibrate } from '../utils/helpers';
import type { EscalationLevel } from '../types';

interface EscalationStep {
  level: EscalationLevel;
  icon: React.ReactNode;
  title: string;
  description: string;
  isActive: boolean;
  isComplete: boolean;
}

export function EscalationScreen() {
  const navigate = useNavigate();
  const {
    senior,
    contacts,
    performCheckIn,
    triggerEscalation,
    resetEscalation,
  } = useAppContext();

  const t = getTranslation(senior.language);
  const [currentLevel, setCurrentLevel] = useState<EscalationLevel>(senior.escalationLevel);
  const showCheckInPrompt = true; // Always show check-in prompt during escalation

  // Get escalation steps based on current state
  const getSteps = (): EscalationStep[] => {
    const levelOrder: EscalationLevel[] = ['reminder', 'family_alert', 'local_contact', 'emergency'];
    const currentIndex = levelOrder.indexOf(currentLevel);

    return [
      {
        level: 'reminder',
        icon: <Bell className="w-8 h-8" />,
        title: t.reminder,
        description: t.pleaseCheckIn,
        isActive: currentLevel === 'reminder',
        isComplete: currentIndex > 0,
      },
      {
        level: 'family_alert',
        icon: <Users className="w-8 h-8" />,
        title: t.familyContacted,
        description: contacts.filter(c => c.priority <= 2).map(c => c.name).join(', '),
        isActive: currentLevel === 'family_alert',
        isComplete: currentIndex > 1,
      },
      {
        level: 'local_contact',
        icon: <Phone className="w-8 h-8" />,
        title: t.callingContact,
        description: contacts.find(c => c.relationship === 'neighbor' || c.relationship === 'watchman')?.name || '',
        isActive: currentLevel === 'local_contact',
        isComplete: currentIndex > 2,
      },
      {
        level: 'emergency',
        icon: <AlertTriangle className="w-8 h-8" />,
        title: t.emergencyCall,
        description: '112',
        isActive: currentLevel === 'emergency',
        isComplete: false,
      },
    ];
  };

  // Auto-escalate for demo (in production this would be server-side)
  useEffect(() => {
    if (currentLevel === 'none') return;

    const timer = setTimeout(() => {
      const levelOrder: EscalationLevel[] = ['reminder', 'family_alert', 'local_contact', 'emergency'];
      const currentIndex = levelOrder.indexOf(currentLevel);

      if (currentIndex < levelOrder.length - 1) {
        const nextLevel = levelOrder[currentIndex + 1];
        setCurrentLevel(nextLevel);
        triggerEscalation(nextLevel);

        // Voice alert
        if (senior.voiceFeedbackEnabled) {
          speakText(t.voiceReminder, senior.language);
        }

        // Vibration pattern intensifies with escalation
        vibrate([200, 100, 200, 100, 200]);
      }
    }, 5000); // 5 seconds for demo, would be longer in production

    return () => clearTimeout(timer);
  }, [currentLevel, triggerEscalation, senior.voiceFeedbackEnabled, senior.language, t.voiceReminder]);

  const handleCheckIn = () => {
    vibrate([100, 50, 100]);
    performCheckIn();
    resetEscalation();
    navigate('/');
  };

  const handleCancel = () => {
    resetEscalation();
    navigate('/');
  };

  const steps = getSteps();
  const activeStep = steps.find(s => s.isActive);

  return (
    <div className="min-h-screen-safe safe-area-inset flex flex-col bg-neutral-100">
      {/* Header - urgent but not alarming */}
      <header className={`px-6 py-6 ${
        currentLevel === 'emergency'
          ? 'bg-danger-red-600'
          : currentLevel === 'local_contact' || currentLevel === 'family_alert'
          ? 'bg-alert-amber-500'
          : 'bg-safe-green-600'
      } text-white transition-colors duration-500`}>
        <div className="flex items-center justify-between">
          <h1 className="text-senior-xl font-bold">
            {activeStep?.title || t.reminder}
          </h1>
          <button
            onClick={handleCancel}
            className="p-3 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col p-6">
        {/* Check-in prompt - most prominent */}
        {showCheckInPrompt && (
          <div className="mb-8">
            <button
              onClick={handleCheckIn}
              className={`
                w-full py-8 px-6 rounded-senior
                bg-safe-green-500 text-white
                font-bold shadow-senior-lg
                active:scale-95 transition-transform
                escalation-pulse
              `}
            >
              <div className="flex items-center justify-center space-x-4">
                <Check className="w-12 h-12" strokeWidth={3} />
                <span className="text-senior-2xl">{t.iAmOk}</span>
              </div>
            </button>
            <p className="text-center text-senior-base text-neutral-500 mt-4">
              {t.tapToConfirm}
            </p>
          </div>
        )}

        {/* Escalation steps visualization */}
        <div className="space-y-4">
          <h2 className="text-senior-base font-medium text-neutral-600 mb-4">
            {t.escalationActive}
          </h2>

          {steps.map((step, index) => (
            <div
              key={step.level}
              className={`
                flex items-center space-x-4 p-4 rounded-senior
                transition-all duration-300
                ${step.isActive
                  ? 'bg-white shadow-senior border-l-4 border-alert-amber-500 escalation-pulse'
                  : step.isComplete
                  ? 'bg-safe-green-50 border-l-4 border-safe-green-500'
                  : 'bg-neutral-50 border-l-4 border-neutral-200 opacity-50'
                }
              `}
            >
              {/* Step icon */}
              <div className={`
                w-14 h-14 rounded-full flex items-center justify-center
                ${step.isActive
                  ? 'bg-alert-amber-500 text-white'
                  : step.isComplete
                  ? 'bg-safe-green-500 text-white'
                  : 'bg-neutral-200 text-neutral-400'
                }
              `}>
                {step.isComplete ? (
                  <Check className="w-8 h-8" />
                ) : (
                  step.icon
                )}
              </div>

              {/* Step info */}
              <div className="flex-1">
                <p className={`text-senior-base font-semibold ${
                  step.isActive ? 'text-neutral-800' : 'text-neutral-600'
                }`}>
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-senior-sm text-neutral-500">
                    {step.description}
                  </p>
                )}
              </div>

              {/* Step number */}
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                text-senior-base font-bold
                ${step.isActive
                  ? 'bg-alert-amber-100 text-alert-amber-700'
                  : step.isComplete
                  ? 'bg-safe-green-100 text-safe-green-700'
                  : 'bg-neutral-100 text-neutral-400'
                }
              `}>
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer with emergency call option */}
      {currentLevel === 'emergency' && (
        <footer className="p-6 bg-danger-red-50 border-t border-danger-red-200">
          <a
            href="tel:112"
            className="w-full btn-senior flex items-center justify-center space-x-3 bg-danger-red-600 text-white"
          >
            <Phone className="w-8 h-8" />
            <span>{t.emergencyCall}: 112</span>
          </a>
        </footer>
      )}
    </div>
  );
}
