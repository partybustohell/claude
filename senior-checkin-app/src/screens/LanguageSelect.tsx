import { useAppContext } from '../App';
import { LANGUAGES } from '../i18n/translations';
import { Language } from '../types';

interface LanguageSelectProps {
  onComplete: () => void;
}

export function LanguageSelect({ onComplete }: LanguageSelectProps) {
  const { senior, updateLanguage } = useAppContext();

  const handleSelect = (lang: Language) => {
    updateLanguage(lang);
    onComplete();
  };

  return (
    <div className="min-h-screen-safe safe-area-inset flex flex-col bg-white">
      {/* Header */}
      <header className="px-6 py-8 bg-safe-green-600 text-white">
        <h1 className="text-senior-xl font-bold text-center">
          भाषा चुनें
        </h1>
        <p className="text-senior-base text-center mt-2 opacity-90">
          Select Language
        </p>
      </header>

      {/* Language options */}
      <main className="flex-1 p-6">
        <div className="space-y-4 max-w-md mx-auto">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`
                w-full p-6 rounded-senior text-left
                transition-all duration-200
                border-2
                ${senior.language === lang.code
                  ? 'bg-safe-green-50 border-safe-green-500 shadow-senior'
                  : 'bg-white border-neutral-200 hover:border-safe-green-300 hover:bg-neutral-50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-senior-lg font-semibold text-neutral-800">
                    {lang.nativeName}
                  </p>
                  <p className="text-senior-sm text-neutral-500">
                    {lang.name}
                  </p>
                </div>

                {senior.language === lang.code && (
                  <div className="w-8 h-8 rounded-full bg-safe-green-500 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Continue button */}
      <footer className="p-6 bg-white border-t border-neutral-200">
        <button
          onClick={onComplete}
          className="w-full btn-senior-primary"
        >
          <span>आगे बढ़ें</span>
          <span className="block text-senior-sm font-normal opacity-80">
            Continue
          </span>
        </button>
      </footer>
    </div>
  );
}
