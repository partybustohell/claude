import { Language, LanguageOption } from '../types';

export const LANGUAGES: LanguageOption[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'en', name: 'English', nativeName: 'English' },
];

interface TranslationStrings {
  // Senior Screen
  iAmOk: string;
  checkInComplete: string;
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  tapToConfirm: string;
  todayCheckedIn: string;
  waitingForCheckIn: string;
  lastCheckIn: string;
  thankYou: string;
  familyNotified: string;

  // Voice feedback
  voiceConfirmation: string;
  voiceReminder: string;

  // Escalation
  reminder: string;
  pleaseCheckIn: string;
  familyContacted: string;
  callingContact: string;
  emergencyCall: string;

  // Caregiver Dashboard
  dashboard: string;
  status: string;
  contacts: string;
  settings: string;
  history: string;
  allOk: string;
  checkInPending: string;
  checkInMissed: string;
  escalationActive: string;
  lastSeen: string;
  battery: string;
  addContact: string;
  editContact: string;
  removeContact: string;
  name: string;
  phone: string;
  relationship: string;
  priority: string;
  notifyBy: string;
  sms: string;
  app: string;
  call: string;
  checkInWindow: string;
  from: string;
  to: string;
  reminderDelay: string;
  escalationDelay: string;
  minutes: string;
  language: string;
  save: string;
  cancel: string;

  // Relationships
  son: string;
  daughter: string;
  spouse: string;
  neighbor: string;
  watchman: string;
  caretaker: string;
  other: string;

  // Status messages
  statusGreen: string;
  statusYellow: string;
  statusRed: string;

  // Time
  today: string;
  yesterday: string;
  daysAgo: string;
  hoursAgo: string;
  minutesAgo: string;
  justNow: string;
}

export const translations: Record<Language, TranslationStrings> = {
  hi: {
    // Senior Screen
    iAmOk: 'मैं ठीक हूँ',
    checkInComplete: 'चेक-इन पूर्ण',
    goodMorning: 'शुभ प्रभात',
    goodAfternoon: 'शुभ दोपहर',
    goodEvening: 'शुभ संध्या',
    tapToConfirm: 'पुष्टि करने के लिए दबाएं',
    todayCheckedIn: 'आज चेक-इन हो गया',
    waitingForCheckIn: 'चेक-इन की प्रतीक्षा',
    lastCheckIn: 'अंतिम चेक-इन',
    thankYou: 'धन्यवाद',
    familyNotified: 'परिवार को सूचित कर दिया गया',

    // Voice feedback
    voiceConfirmation: 'आपका चेक-इन हो गया है। धन्यवाद।',
    voiceReminder: 'कृपया अपना दैनिक चेक-इन करें।',

    // Escalation
    reminder: 'याद दिलाना',
    pleaseCheckIn: 'कृपया चेक-इन करें',
    familyContacted: 'परिवार से संपर्क किया जा रहा है',
    callingContact: 'संपर्क को कॉल किया जा रहा है',
    emergencyCall: 'आपातकालीन कॉल',

    // Caregiver Dashboard
    dashboard: 'डैशबोर्ड',
    status: 'स्थिति',
    contacts: 'संपर्क',
    settings: 'सेटिंग्स',
    history: 'इतिहास',
    allOk: 'सब ठीक है',
    checkInPending: 'चेक-इन लंबित',
    checkInMissed: 'चेक-इन छूट गया',
    escalationActive: 'एस्केलेशन सक्रिय',
    lastSeen: 'अंतिम बार देखा',
    battery: 'बैटरी',
    addContact: 'संपर्क जोड़ें',
    editContact: 'संपर्क संपादित करें',
    removeContact: 'संपर्क हटाएं',
    name: 'नाम',
    phone: 'फोन',
    relationship: 'संबंध',
    priority: 'प्राथमिकता',
    notifyBy: 'सूचित करें',
    sms: 'एसएमएस',
    app: 'ऐप',
    call: 'कॉल',
    checkInWindow: 'चेक-इन समय',
    from: 'से',
    to: 'तक',
    reminderDelay: 'रिमाइंडर देरी',
    escalationDelay: 'एस्केलेशन देरी',
    minutes: 'मिनट',
    language: 'भाषा',
    save: 'सहेजें',
    cancel: 'रद्द करें',

    // Relationships
    son: 'बेटा',
    daughter: 'बेटी',
    spouse: 'पति/पत्नी',
    neighbor: 'पड़ोसी',
    watchman: 'चौकीदार',
    caretaker: 'देखभालकर्ता',
    other: 'अन्य',

    // Status messages
    statusGreen: 'आज चेक-इन हो गया',
    statusYellow: 'चेक-इन की प्रतीक्षा',
    statusRed: 'तत्काल ध्यान दें',

    // Time
    today: 'आज',
    yesterday: 'कल',
    daysAgo: 'दिन पहले',
    hoursAgo: 'घंटे पहले',
    minutesAgo: 'मिनट पहले',
    justNow: 'अभी',
  },

  gu: {
    // Senior Screen
    iAmOk: 'હું ઠીક છું',
    checkInComplete: 'ચેક-ઇન પૂર્ણ',
    goodMorning: 'શુભ સવાર',
    goodAfternoon: 'શુભ બપોર',
    goodEvening: 'શુભ સાંજ',
    tapToConfirm: 'પુષ્ટિ કરવા દબાવો',
    todayCheckedIn: 'આજે ચેક-ઇન થઈ ગયું',
    waitingForCheckIn: 'ચેક-ઇનની રાહ',
    lastCheckIn: 'છેલ્લું ચેક-ઇન',
    thankYou: 'આભાર',
    familyNotified: 'પરિવારને જાણ કરી દેવામાં આવી',

    // Voice feedback
    voiceConfirmation: 'તમારું ચેક-ઇન થઈ ગયું છે. આભાર.',
    voiceReminder: 'કૃપા કરીને તમારું દૈનિક ચેક-ઇન કરો.',

    // Escalation
    reminder: 'યાદ',
    pleaseCheckIn: 'કૃપા કરીને ચેક-ઇન કરો',
    familyContacted: 'પરિવારનો સંપર્ક કરવામાં આવી રહ્યો છે',
    callingContact: 'સંપર્કને કૉલ કરવામાં આવી રહ્યો છે',
    emergencyCall: 'કટોકટી કૉલ',

    // Caregiver Dashboard
    dashboard: 'ડેશબોર્ડ',
    status: 'સ્થિતિ',
    contacts: 'સંપર્કો',
    settings: 'સેટિંગ્સ',
    history: 'ઇતિહાસ',
    allOk: 'બધું ઠીક છે',
    checkInPending: 'ચેક-ઇન બાકી',
    checkInMissed: 'ચેક-ઇન ચૂકી ગયું',
    escalationActive: 'એસ્કેલેશન સક્રિય',
    lastSeen: 'છેલ્લે જોયું',
    battery: 'બેટરી',
    addContact: 'સંપર્ક ઉમેરો',
    editContact: 'સંપર્ક સંપાદિત કરો',
    removeContact: 'સંપર્ક દૂર કરો',
    name: 'નામ',
    phone: 'ફોન',
    relationship: 'સંબંધ',
    priority: 'પ્રાથમિકતા',
    notifyBy: 'જાણ કરો',
    sms: 'એસએમએસ',
    app: 'એપ',
    call: 'કૉલ',
    checkInWindow: 'ચેક-ઇન સમય',
    from: 'થી',
    to: 'સુધી',
    reminderDelay: 'રિમાઇન્ડર વિલંબ',
    escalationDelay: 'એસ્કેલેશન વિલંબ',
    minutes: 'મિનિટ',
    language: 'ભાષા',
    save: 'સાચવો',
    cancel: 'રદ કરો',

    // Relationships
    son: 'દીકરો',
    daughter: 'દીકરી',
    spouse: 'પતિ/પત્ની',
    neighbor: 'પાડોશી',
    watchman: 'ચોકીદાર',
    caretaker: 'સંભાળ રાખનાર',
    other: 'અન્ય',

    // Status messages
    statusGreen: 'આજે ચેક-ઇન થઈ ગયું',
    statusYellow: 'ચેક-ઇનની રાહ',
    statusRed: 'તાત્કાલિક ધ્યાન આપો',

    // Time
    today: 'આજે',
    yesterday: 'ગઈકાલે',
    daysAgo: 'દિવસ પહેલાં',
    hoursAgo: 'કલાક પહેલાં',
    minutesAgo: 'મિનિટ પહેલાં',
    justNow: 'હમણાં જ',
  },

  mr: {
    // Senior Screen
    iAmOk: 'मी ठीक आहे',
    checkInComplete: 'चेक-इन पूर्ण',
    goodMorning: 'शुभ प्रभात',
    goodAfternoon: 'शुभ दुपार',
    goodEvening: 'शुभ संध्याकाळ',
    tapToConfirm: 'पुष्टी करण्यासाठी दाबा',
    todayCheckedIn: 'आज चेक-इन झाले',
    waitingForCheckIn: 'चेक-इनची वाट',
    lastCheckIn: 'शेवटचे चेक-इन',
    thankYou: 'धन्यवाद',
    familyNotified: 'कुटुंबाला कळवले',

    // Voice feedback
    voiceConfirmation: 'तुमचे चेक-इन झाले आहे. धन्यवाद.',
    voiceReminder: 'कृपया तुमचे दैनिक चेक-इन करा.',

    // Escalation
    reminder: 'स्मरण',
    pleaseCheckIn: 'कृपया चेक-इन करा',
    familyContacted: 'कुटुंबाशी संपर्क केला जात आहे',
    callingContact: 'संपर्काला कॉल केला जात आहे',
    emergencyCall: 'आपत्कालीन कॉल',

    // Caregiver Dashboard
    dashboard: 'डॅशबोर्ड',
    status: 'स्थिती',
    contacts: 'संपर्क',
    settings: 'सेटिंग्ज',
    history: 'इतिहास',
    allOk: 'सर्व ठीक आहे',
    checkInPending: 'चेक-इन प्रलंबित',
    checkInMissed: 'चेक-इन चुकले',
    escalationActive: 'एस्केलेशन सक्रिय',
    lastSeen: 'शेवटी पाहिले',
    battery: 'बॅटरी',
    addContact: 'संपर्क जोडा',
    editContact: 'संपर्क संपादित करा',
    removeContact: 'संपर्क काढा',
    name: 'नाव',
    phone: 'फोन',
    relationship: 'नाते',
    priority: 'प्राधान्य',
    notifyBy: 'कळवा',
    sms: 'एसएमएस',
    app: 'अॅप',
    call: 'कॉल',
    checkInWindow: 'चेक-इन वेळ',
    from: 'पासून',
    to: 'पर्यंत',
    reminderDelay: 'स्मरण विलंब',
    escalationDelay: 'एस्केलेशन विलंब',
    minutes: 'मिनिटे',
    language: 'भाषा',
    save: 'जतन करा',
    cancel: 'रद्द करा',

    // Relationships
    son: 'मुलगा',
    daughter: 'मुलगी',
    spouse: 'पती/पत्नी',
    neighbor: 'शेजारी',
    watchman: 'वॉचमन',
    caretaker: 'काळजी घेणारा',
    other: 'इतर',

    // Status messages
    statusGreen: 'आज चेक-इन झाले',
    statusYellow: 'चेक-इनची वाट',
    statusRed: 'त्वरित लक्ष द्या',

    // Time
    today: 'आज',
    yesterday: 'काल',
    daysAgo: 'दिवसांपूर्वी',
    hoursAgo: 'तासांपूर्वी',
    minutesAgo: 'मिनिटांपूर्वी',
    justNow: 'आत्ताच',
  },

  ta: {
    // Senior Screen
    iAmOk: 'நான் நலம்',
    checkInComplete: 'செக்-இன் முடிந்தது',
    goodMorning: 'காலை வணக்கம்',
    goodAfternoon: 'மதிய வணக்கம்',
    goodEvening: 'மாலை வணக்கம்',
    tapToConfirm: 'உறுதிப்படுத்த தட்டவும்',
    todayCheckedIn: 'இன்று செக்-இன் ஆகிவிட்டது',
    waitingForCheckIn: 'செக்-இன் எதிர்பார்ப்பு',
    lastCheckIn: 'கடைசி செக்-இன்',
    thankYou: 'நன்றி',
    familyNotified: 'குடும்பத்திற்கு தெரிவிக்கப்பட்டது',

    // Voice feedback
    voiceConfirmation: 'உங்கள் செக்-இன் முடிந்தது. நன்றி.',
    voiceReminder: 'உங்கள் தினசரி செக்-இன் செய்யுங்கள்.',

    // Escalation
    reminder: 'நினைவூட்டல்',
    pleaseCheckIn: 'செக்-இன் செய்யுங்கள்',
    familyContacted: 'குடும்பத்தை தொடர்புகொள்கிறோம்',
    callingContact: 'தொடர்பை அழைக்கிறோம்',
    emergencyCall: 'அவசர அழைப்பு',

    // Caregiver Dashboard
    dashboard: 'டாஷ்போர்டு',
    status: 'நிலை',
    contacts: 'தொடர்புகள்',
    settings: 'அமைப்புகள்',
    history: 'வரலாறு',
    allOk: 'எல்லாம் நலம்',
    checkInPending: 'செக்-இன் நிலுவை',
    checkInMissed: 'செக்-இன் தவறிவிட்டது',
    escalationActive: 'எஸ்கலேஷன் செயலில்',
    lastSeen: 'கடைசியாக பார்த்தது',
    battery: 'பேட்டரி',
    addContact: 'தொடர்பு சேர்க்க',
    editContact: 'தொடர்பு திருத்த',
    removeContact: 'தொடர்பு நீக்க',
    name: 'பெயர்',
    phone: 'தொலைபேசி',
    relationship: 'உறவு',
    priority: 'முன்னுரிமை',
    notifyBy: 'தெரிவிக்க',
    sms: 'எஸ்எம்எஸ்',
    app: 'ஆப்',
    call: 'அழைப்பு',
    checkInWindow: 'செக்-இன் நேரம்',
    from: 'முதல்',
    to: 'வரை',
    reminderDelay: 'நினைவூட்டல் தாமதம்',
    escalationDelay: 'எஸ்கலேஷன் தாமதம்',
    minutes: 'நிமிடங்கள்',
    language: 'மொழி',
    save: 'சேமி',
    cancel: 'ரத்து',

    // Relationships
    son: 'மகன்',
    daughter: 'மகள்',
    spouse: 'கணவர்/மனைவி',
    neighbor: 'அண்டை வீட்டார்',
    watchman: 'காவலர்',
    caretaker: 'பராமரிப்பாளர்',
    other: 'மற்றவர்',

    // Status messages
    statusGreen: 'இன்று செக்-இன் ஆகிவிட்டது',
    statusYellow: 'செக்-இன் எதிர்பார்ப்பு',
    statusRed: 'உடனடி கவனம் தேவை',

    // Time
    today: 'இன்று',
    yesterday: 'நேற்று',
    daysAgo: 'நாட்களுக்கு முன்',
    hoursAgo: 'மணி நேரங்களுக்கு முன்',
    minutesAgo: 'நிமிடங்களுக்கு முன்',
    justNow: 'இப்போதே',
  },

  te: {
    // Senior Screen
    iAmOk: 'నేను బాగున్నాను',
    checkInComplete: 'చెక్-ఇన్ పూర్తి',
    goodMorning: 'శుభోదయం',
    goodAfternoon: 'శుభ మధ్యాహ్నం',
    goodEvening: 'శుభ సాయంత్రం',
    tapToConfirm: 'నిర్ధారించడానికి నొక్కండి',
    todayCheckedIn: 'ఈరోజు చెక్-ఇన్ అయింది',
    waitingForCheckIn: 'చెక్-ఇన్ కోసం వేచి ఉంది',
    lastCheckIn: 'చివరి చెక్-ఇన్',
    thankYou: 'ధన్యవాదాలు',
    familyNotified: 'కుటుంబానికి తెలియజేయబడింది',

    // Voice feedback
    voiceConfirmation: 'మీ చెక్-ఇన్ పూర్తయింది. ధన్యవాదాలు.',
    voiceReminder: 'దయచేసి మీ రోజువారీ చెక్-ఇన్ చేయండి.',

    // Escalation
    reminder: 'రిమైండర్',
    pleaseCheckIn: 'దయచేసి చెక్-ఇన్ చేయండి',
    familyContacted: 'కుటుంబాన్ని సంప్రదిస్తున్నాము',
    callingContact: 'సంప్రదింపుకు కాల్ చేస్తున్నాము',
    emergencyCall: 'అత్యవసర కాల్',

    // Caregiver Dashboard
    dashboard: 'డాష్‌బోర్డ్',
    status: 'స్థితి',
    contacts: 'సంప్రదింపులు',
    settings: 'సెట్టింగ్‌లు',
    history: 'చరిత్ర',
    allOk: 'అంతా బాగుంది',
    checkInPending: 'చెక్-ఇన్ పెండింగ్',
    checkInMissed: 'చెక్-ఇన్ మిస్ అయింది',
    escalationActive: 'ఎస్కలేషన్ యాక్టివ్',
    lastSeen: 'చివరిగా చూసింది',
    battery: 'బ్యాటరీ',
    addContact: 'సంప్రదింపు జోడించు',
    editContact: 'సంప్రదింపు సవరించు',
    removeContact: 'సంప్రదింపు తీసివేయి',
    name: 'పేరు',
    phone: 'ఫోన్',
    relationship: 'సంబంధం',
    priority: 'ప్రాధాన్యత',
    notifyBy: 'తెలియజేయి',
    sms: 'ఎస్ఎంఎస్',
    app: 'యాప్',
    call: 'కాల్',
    checkInWindow: 'చెక్-ఇన్ సమయం',
    from: 'నుండి',
    to: 'వరకు',
    reminderDelay: 'రిమైండర్ ఆలస్యం',
    escalationDelay: 'ఎస్కలేషన్ ఆలస్యం',
    minutes: 'నిమిషాలు',
    language: 'భాష',
    save: 'సేవ్',
    cancel: 'రద్దు',

    // Relationships
    son: 'కొడుకు',
    daughter: 'కూతురు',
    spouse: 'భార్య/భర్త',
    neighbor: 'పొరుగువారు',
    watchman: 'వాచ్‌మన్',
    caretaker: 'సంరక్షకుడు',
    other: 'ఇతర',

    // Status messages
    statusGreen: 'ఈరోజు చెక్-ఇన్ అయింది',
    statusYellow: 'చెక్-ఇన్ కోసం వేచి ఉంది',
    statusRed: 'తక్షణ శ్రద్ధ అవసరం',

    // Time
    today: 'ఈరోజు',
    yesterday: 'నిన్న',
    daysAgo: 'రోజుల క్రితం',
    hoursAgo: 'గంటల క్రితం',
    minutesAgo: 'నిమిషాల క్రితం',
    justNow: 'ఇప్పుడే',
  },

  bn: {
    // Senior Screen
    iAmOk: 'আমি ভালো আছি',
    checkInComplete: 'চেক-ইন সম্পূর্ণ',
    goodMorning: 'শুভ সকাল',
    goodAfternoon: 'শুভ দুপুর',
    goodEvening: 'শুভ সন্ধ্যা',
    tapToConfirm: 'নিশ্চিত করতে চাপুন',
    todayCheckedIn: 'আজ চেক-ইন হয়ে গেছে',
    waitingForCheckIn: 'চেক-ইনের অপেক্ষায়',
    lastCheckIn: 'শেষ চেক-ইন',
    thankYou: 'ধন্যবাদ',
    familyNotified: 'পরিবারকে জানানো হয়েছে',

    // Voice feedback
    voiceConfirmation: 'আপনার চেক-ইন হয়ে গেছে। ধন্যবাদ।',
    voiceReminder: 'অনুগ্রহ করে আপনার দৈনিক চেক-ইন করুন।',

    // Escalation
    reminder: 'মনে করিয়ে দেওয়া',
    pleaseCheckIn: 'অনুগ্রহ করে চেক-ইন করুন',
    familyContacted: 'পরিবারের সাথে যোগাযোগ করা হচ্ছে',
    callingContact: 'যোগাযোগে কল করা হচ্ছে',
    emergencyCall: 'জরুরি কল',

    // Caregiver Dashboard
    dashboard: 'ড্যাশবোর্ড',
    status: 'অবস্থা',
    contacts: 'যোগাযোগ',
    settings: 'সেটিংস',
    history: 'ইতিহাস',
    allOk: 'সব ঠিক আছে',
    checkInPending: 'চেক-ইন মুলতুবি',
    checkInMissed: 'চেক-ইন মিস হয়েছে',
    escalationActive: 'এস্কেলেশন সক্রিয়',
    lastSeen: 'সর্বশেষ দেখা',
    battery: 'ব্যাটারি',
    addContact: 'যোগাযোগ যোগ করুন',
    editContact: 'যোগাযোগ সম্পাদনা করুন',
    removeContact: 'যোগাযোগ সরান',
    name: 'নাম',
    phone: 'ফোন',
    relationship: 'সম্পর্ক',
    priority: 'অগ্রাধিকার',
    notifyBy: 'জানান',
    sms: 'এসএমএস',
    app: 'অ্যাপ',
    call: 'কল',
    checkInWindow: 'চেক-ইন সময়',
    from: 'থেকে',
    to: 'পর্যন্ত',
    reminderDelay: 'রিমাইন্ডার বিলম্ব',
    escalationDelay: 'এস্কেলেশন বিলম্ব',
    minutes: 'মিনিট',
    language: 'ভাষা',
    save: 'সংরক্ষণ',
    cancel: 'বাতিল',

    // Relationships
    son: 'ছেলে',
    daughter: 'মেয়ে',
    spouse: 'স্বামী/স্ত্রী',
    neighbor: 'প্রতিবেশী',
    watchman: 'দারোয়ান',
    caretaker: 'তত্ত্বাবধায়ক',
    other: 'অন্যান্য',

    // Status messages
    statusGreen: 'আজ চেক-ইন হয়ে গেছে',
    statusYellow: 'চেক-ইনের অপেক্ষায়',
    statusRed: 'জরুরি মনোযোগ প্রয়োজন',

    // Time
    today: 'আজ',
    yesterday: 'গতকাল',
    daysAgo: 'দিন আগে',
    hoursAgo: 'ঘণ্টা আগে',
    minutesAgo: 'মিনিট আগে',
    justNow: 'এইমাত্র',
  },

  en: {
    // Senior Screen
    iAmOk: 'I am OK',
    checkInComplete: 'Check-in Complete',
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
    tapToConfirm: 'Tap to confirm',
    todayCheckedIn: 'Checked in today',
    waitingForCheckIn: 'Waiting for check-in',
    lastCheckIn: 'Last check-in',
    thankYou: 'Thank You',
    familyNotified: 'Family has been notified',

    // Voice feedback
    voiceConfirmation: 'Your check-in is complete. Thank you.',
    voiceReminder: 'Please complete your daily check-in.',

    // Escalation
    reminder: 'Reminder',
    pleaseCheckIn: 'Please check in',
    familyContacted: 'Contacting family',
    callingContact: 'Calling contact',
    emergencyCall: 'Emergency call',

    // Caregiver Dashboard
    dashboard: 'Dashboard',
    status: 'Status',
    contacts: 'Contacts',
    settings: 'Settings',
    history: 'History',
    allOk: 'All OK',
    checkInPending: 'Check-in pending',
    checkInMissed: 'Check-in missed',
    escalationActive: 'Escalation active',
    lastSeen: 'Last seen',
    battery: 'Battery',
    addContact: 'Add contact',
    editContact: 'Edit contact',
    removeContact: 'Remove contact',
    name: 'Name',
    phone: 'Phone',
    relationship: 'Relationship',
    priority: 'Priority',
    notifyBy: 'Notify by',
    sms: 'SMS',
    app: 'App',
    call: 'Call',
    checkInWindow: 'Check-in window',
    from: 'From',
    to: 'To',
    reminderDelay: 'Reminder delay',
    escalationDelay: 'Escalation delay',
    minutes: 'minutes',
    language: 'Language',
    save: 'Save',
    cancel: 'Cancel',

    // Relationships
    son: 'Son',
    daughter: 'Daughter',
    spouse: 'Spouse',
    neighbor: 'Neighbor',
    watchman: 'Watchman',
    caretaker: 'Caretaker',
    other: 'Other',

    // Status messages
    statusGreen: 'Checked in today',
    statusYellow: 'Waiting for check-in',
    statusRed: 'Immediate attention needed',

    // Time
    today: 'Today',
    yesterday: 'Yesterday',
    daysAgo: 'days ago',
    hoursAgo: 'hours ago',
    minutesAgo: 'minutes ago',
    justNow: 'Just now',
  },
};

export function getTranslation(lang: Language) {
  return translations[lang] || translations.hi;
}

export function getGreeting(lang: Language): string {
  const hour = new Date().getHours();
  const t = getTranslation(lang);

  if (hour < 12) return t.goodMorning;
  if (hour < 17) return t.goodAfternoon;
  return t.goodEvening;
}
