import { useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './hooks/useApp';
import { SeniorScreen } from './screens/SeniorScreen';
import { CaregiverDashboard } from './screens/CaregiverDashboard';
import { EscalationScreen } from './screens/EscalationScreen';
import { LanguageSelect } from './screens/LanguageSelect';
import type {
  Language,
  Senior,
  Contact,
  CaregiverSettings,
  EscalationLevel,
} from './types';

// App context for global state
interface AppContextType {
  senior: Senior;
  contacts: Contact[];
  settings: CaregiverSettings;
  performCheckIn: () => void;
  updateLanguage: (lang: Language) => void;
  toggleVoiceFeedback: () => void;
  updateCheckInWindow: (start: string, end: string) => void;
  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  removeContact: (id: string) => void;
  triggerEscalation: (level: EscalationLevel) => void;
  resetEscalation: () => void;
  setSettings: React.Dispatch<React.SetStateAction<CaregiverSettings>>;
}

const AppContext = createContext<AppContextType | null>(null);

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

function App() {
  const appState = useApp();
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);

  // Show language selection on first launch
  if (isFirstLaunch) {
    return (
      <AppContext.Provider value={appState}>
        <LanguageSelect onComplete={() => setIsFirstLaunch(false)} />
      </AppContext.Provider>
    );
  }

  return (
    <AppContext.Provider value={appState}>
      <BrowserRouter>
        <Routes>
          {/* Senior's main screen - default */}
          <Route path="/" element={<SeniorScreen />} />

          {/* Escalation screen */}
          <Route path="/escalation" element={<EscalationScreen />} />

          {/* Caregiver dashboard - separate UI */}
          <Route path="/caregiver" element={<CaregiverDashboard />} />

          {/* Language selection */}
          <Route
            path="/language"
            element={<LanguageSelect onComplete={() => window.history.back()} />}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;
