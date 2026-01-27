import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Volume2, VolumeX } from 'lucide-react';
import { useAppContext } from '../App';
import { getTranslation, getGreeting } from '../i18n/translations';
import { formatTime, speakText, vibrate, isTodayCheckedIn } from '../utils/helpers';

export function SeniorScreen() {
  const navigate = useNavigate();
  const {
    senior,
    performCheckIn,
    toggleVoiceFeedback,
    triggerEscalation,
  } = useAppContext();

  const t = getTranslation(senior.language);
  const greeting = getGreeting(senior.language);
  const isCheckedIn = senior.lastCheckIn && isTodayCheckedIn(senior.lastCheckIn.timestamp);

  const [isPressed, setIsPressed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCheckIn = useCallback(() => {
    // Tactile feedback
    vibrate([100, 50, 100]);

    // Visual feedback
    setIsPressed(true);
    setShowSuccess(true);

    // Perform check-in
    performCheckIn();

    // Voice feedback if enabled
    if (senior.voiceFeedbackEnabled) {
      speakText(t.voiceConfirmation, senior.language);
    }

    // Reset visual state
    setTimeout(() => {
      setIsPressed(false);
    }, 200);
  }, [performCheckIn, senior.voiceFeedbackEnabled, senior.language, t.voiceConfirmation]);

  // Demo: Show escalation after 3 seconds if not checked in (for demo purposes)
  const handleDemoEscalation = useCallback(() => {
    triggerEscalation('reminder');
    navigate('/escalation');
  }, [triggerEscalation, navigate]);

  return (
    <div className="min-h-screen-safe safe-area-inset flex flex-col bg-neutral-100">
      {/* Header - minimal */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <div>
          <p className="text-senior-base font-medium text-neutral-700">
            {greeting}
          </p>
        </div>

        {/* Voice toggle - accessible */}
        <button
          onClick={toggleVoiceFeedback}
          className="p-4 rounded-full hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
          aria-label={senior.voiceFeedbackEnabled ? 'Disable voice' : 'Enable voice'}
        >
          {senior.voiceFeedbackEnabled ? (
            <Volume2 className="w-8 h-8 text-safe-green-600" strokeWidth={2.5} />
          ) : (
            <VolumeX className="w-8 h-8 text-neutral-400" strokeWidth={2.5} />
          )}
        </button>
      </header>

      {/* Main content - full screen check-in button */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        {showSuccess && isCheckedIn ? (
          // Success state - calm, reassuring
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="w-40 h-40 rounded-full bg-safe-green-500 flex items-center justify-center shadow-senior-lg check-animate">
              <Check className="w-24 h-24 text-white" strokeWidth={3} />
            </div>

            <div className="space-y-4">
              <h1 className="text-senior-2xl font-bold text-safe-green-700">
                {t.thankYou}
              </h1>
              <p className="text-senior-lg text-neutral-600">
                {t.familyNotified}
              </p>
              {senior.lastCheckIn && (
                <p className="text-senior-base text-neutral-500">
                  {formatTime(senior.lastCheckIn.timestamp)}
                </p>
              )}
            </div>

            {/* Allow re-tap even after check-in */}
            <button
              onClick={() => setShowSuccess(false)}
              className="mt-8 text-senior-base text-neutral-500 underline"
            >
              {t.tapToConfirm}
            </button>
          </div>
        ) : (
          // Check-in button - large, prominent, single tap
          <div className="flex flex-col items-center text-center space-y-8 w-full max-w-md">
            <button
              onClick={handleCheckIn}
              onTouchStart={() => setIsPressed(true)}
              onTouchEnd={() => setIsPressed(false)}
              className={`
                w-full aspect-square max-w-xs
                rounded-full
                flex items-center justify-center
                text-white font-bold
                transition-all duration-200
                shadow-senior-lg
                ${isPressed
                  ? 'bg-safe-green-800 scale-95 shadow-senior-pressed'
                  : 'bg-safe-green-600 hover:bg-safe-green-700 checkin-button-pulse'
                }
              `}
              aria-label={t.iAmOk}
            >
              <span className="text-senior-3xl text-center px-4 leading-tight">
                {t.iAmOk}
              </span>
            </button>

            <p className="text-senior-lg text-neutral-500">
              {t.tapToConfirm}
            </p>
          </div>
        )}
      </main>

      {/* Footer - status info */}
      <footer className="px-6 py-4 bg-white border-t border-neutral-200">
        <div className="flex items-center justify-between">
          <div>
            {isCheckedIn ? (
              <p className="text-senior-sm text-safe-green-600 font-medium">
                {t.todayCheckedIn}
              </p>
            ) : (
              <p className="text-senior-sm text-neutral-500">
                {t.waitingForCheckIn}
              </p>
            )}
          </div>

          {/* Demo button - for testing escalation flow */}
          <button
            onClick={handleDemoEscalation}
            className="text-sm text-neutral-400 px-3 py-2"
          >
            Demo
          </button>
        </div>
      </footer>
    </div>
  );
}
