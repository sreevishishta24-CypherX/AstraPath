import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Helper function for deep cloning and merging
const merge = (base, override) => {
    const newObj = JSON.parse(JSON.stringify(base));
    for (const key in override) {
        if (typeof override[key] === 'object' && override[key] !== null && !Array.isArray(override[key]) && newObj[key]) {
            newObj[key] = merge(newObj[key], override[key]);
        } else {
            newObj[key] = override[key];
        }
    }
    return newObj;
};

const en = {
  common: {
    cancel: 'Cancel',
    submit: 'Submit',
    error: 'Error',
    close: 'Close',
  },
  header: {
    fakeCall: 'Fake Call',
    companion: 'Companion',
    sos: 'SOS',
    activateCompanion: 'Activate Safe Companion Mode',
    deactivateCompanion: 'Deactivate Safe Companion Mode',
    companionActive: 'Safe Companion is Active',
  },
  routeInput: {
    startPlaceholder: 'Starting point',
    endPlaceholder: 'Destination',
    useCurrentLocation: 'Use current location',
    modes: {
      walking: 'Walking',
      bike: 'Bike',
      car: 'Car',
    },
    loadingButton: 'Finding Route...',
    submitButton: 'Find Route',
  },
  map: {
    title: 'Route Visualization',
    safety: 'Safety',
    roadIssues: 'Road Issues',
    placeholderTitle: 'Your route will appear here',
    placeholderSubtitle: 'Enter a start and end point to begin.',
    start: 'Start',
    end: 'End',
  },
  routeDetails: {
    loading: {
      title: 'Crafting Your Route...',
      subtitle: 'Our AI is analyzing safety data and road conditions to find you the best path.',
    },
    placeholder: {
      title: 'Ready to Go?',
      subtitle: 'Fill in your journey details above.',
    },
    title: 'Route Details',
    overview: 'Overview',
    safetyInsights: 'Safety Insights',
    directions: 'Directions',
    trends: {
        improving: 'Improving',
        stable: 'Stable',
        declining: 'Declining',
        trend: 'Trend'
    },
    recentReports: 'recent report(s)',
    report: {
      safetyConcern: 'Safety Concern',
      roadIssue: 'Road Issue',
      descriptionPlaceholder: 'Briefly describe the issue...',
      reportIssue: 'Report an issue',
      reportSubmitted: 'Report submitted. Thank you!',
    }
  },
  sosModal: {
    title: 'Confirm SOS Alert',
    description: 'You are about to send an emergency alert. This action is irreversible and should only be used in a genuine emergency.',
    locationNotice: 'Your current location will be sent:',
    confirmButton: 'Confirm Alert',
  },
  sosConfirmation: {
    title: 'Alert Sent',
    description: "Help is on the way. Your location has been shared with local authorities. Stay safe.",
    shareTitle: 'Share Live Location',
    shareDescription: 'Send a live tracking link to an emergency contact.',
    phonePlaceholder: '+91 Enter phone number',
    whatsappButton: 'WhatsApp',
    messageButton: 'Message',
    sharingInitiatedTitle: 'Sharing Initiated!',
    sharingInitiatedDescription: 'Your browser has been prompted to share a tracking link with {{phoneNumber}} via {{method}}.',
    shareMessage: `Emergency! I've activated an SOS alert from AstraPath. My current location is approximately {{lat}}, {{lng}}. Please track my location here: {{url}}`
  },
  companionMode: {
    title: 'Activate Safe Companion Mode?',
    description: "When activated, AstraPath will use your device's microphone to listen for distress keywords. This feature is designed to provide hands-free help in an emergency.",
    listensFor: 'It will listen for keywords like:',
    keywords: ['help', 'stop', 'leave me'],
    ifDetected: 'If a keyword is detected, it will automatically:',
    actions: [
        'Share your live location with authorities.',
        'Start recording audio and video.',
        'Initiate a call to emergency services (112).'
    ],
    privacyNotice: 'This feature requires microphone and camera permissions to function. Your privacy is important; audio is processed on-device and is not stored unless a distress signal is confirmed.',
    activateButton: 'Activate Mode'
  },
  distressModal: {
    title: 'Distress Signal Detected!',
    subtitle: 'Initiating emergency protocol in...',
    actions: [
        'Sharing location with emergency contacts.',
        'Starting audio & video recording.',
        'Contacting emergency services (112).'
    ],
    cancelButton: 'CANCEL ALERT',
    confirmedTitle: 'Emergency Protocol Activated',
    confirmedSubtitle: 'Authorities have been notified, and recording has begun. A call to 112 has been initiated.',
    locationShared: 'Location Shared',
    locationError: 'Could not retrieve location.',
  },
  fakeCall: {
    title: 'Setup Smart Fake Call',
    voice: 'Voice',
    female: 'Female',
    male: 'Male',
    tone: 'Tone',
    calm: 'Calm',
    urgent: 'Urgent',
    scenario: 'Scenario',
    startButton: 'Start Call',
    callerName: 'Mom',
    callerType: 'Mobile',
    decline: 'Decline',
    scenarios: [
        "I'm waiting outside, come fast.",
        "Your cab is nearby, please come down now.",
        "Hey, are you done? I'm getting late and need to leave.",
        "The movie is about to start, where are you?"
    ]
  },
  alerts: {
    enterStartAndEnd: "Please enter both a starting point and a destination.",
    routeGenerationError: "Sorry, we couldn't generate a route. The model may be unavailable or the request was invalid. Please try again.",
    locationRetrievalError: "Could not retrieve your location. Please enable location services to use the SOS feature.",
    geolocationNotSupported: "Geolocation is not supported by this browser.",
    micPermissionDenied: "Microphone permission denied. Safe Companion mode has been disabled.",
    companionStartError: "Could not start Safe Companion mode. Please try again.",
    micCamPermissionRequired: "Microphone and Camera permissions are required for Safe Companion mode.",
    locationGenericError: "Could not retrieve your location. Please ensure location services are enabled and permissions are granted in your browser settings.",
    locationPermissionDenied: "Location permission denied. Please enable it in your browser settings to use this feature.",
    locationUnavailable: "Location information is currently unavailable. Please check your device's GPS or try again.",
    locationTimeout: "The request to get your location timed out. Please try again."
  }
};

const resources = {
  en: { translation: en },
  hi: { translation: merge(en, {
    common: { cancel: 'रद्द करें', submit: 'सबमिट करें', error: 'त्रुटि', close: 'बंद करें' },
    header: { fakeCall: 'फेक कॉल', companion: 'सुरक्षित साथी', sos: 'एसओएस' },
    routeInput: { startPlaceholder: 'शुरुआती बिंदु', endPlaceholder: 'गंतव्य', modes: { walking: 'पैदल', bike: 'बाइक', car: 'कार' }, submitButton: 'मार्ग खोजें' },
    companionMode: { keywords: ['मदद', 'रुको', 'मुझे छोड़ दो'] },
    fakeCall: { callerName: 'माँ', female: 'महिला', male: 'पुरुष' },
  })},
  es: { translation: merge(en, {
    common: { cancel: 'Cancelar', submit: 'Enviar', error: 'Error', close: 'Cerrar' },
    header: { fakeCall: 'Llamada Falsa', companion: 'Compañero', sos: 'SOS' },
    routeInput: { startPlaceholder: 'Punto de partida', endPlaceholder: 'Destino', useCurrentLocation: 'Usar ubicación actual', modes: { walking: 'Caminando', bike: 'Bicicleta', car: 'Coche' }, loadingButton: 'Buscando Ruta...', submitButton: 'Buscar Ruta' },
    map: { title: 'Visualización de Ruta', safety: 'Seguridad', roadIssues: 'Problemas de Carretera', placeholderTitle: 'Tu ruta aparecerá aquí', placeholderSubtitle: 'Introduce un punto de partida y destino para comenzar.', start: 'Inicio', end: 'Fin' },
    routeDetails: { title: 'Detalles de la Ruta', overview: 'Resumen', safetyInsights: 'Información de Seguridad', directions: 'Direcciones' },
    sosModal: { title: 'Confirmar Alerta SOS', description: 'Estás a punto de enviar una alerta de emergencia. Esta acción es irreversible y solo debe usarse en una emergencia genuina.', locationNotice: 'Se enviará tu ubicación actual:', confirmButton: 'Confirmar Alerta' },
    companionMode: { title: '¿Activar Modo Compañero Seguro?', keywords: ['ayuda', 'para', 'déjame'], activateButton: 'Activar Modo' },
    distressModal: { title: '¡Señal de Socorro Detectada!', cancelButton: 'CANCELAR ALERTA', confirmedTitle: 'Protocolo de Emergencia Activado' },
    fakeCall: { title: 'Configurar Llamada Falsa Inteligente', voice: 'Voz', female: 'Femenina', male: 'Masculina', tone: 'Tono', calm: 'Calmado', urgent: 'Urgente', scenario: 'Escenario', startButton: 'Iniciar Llamada', callerName: 'Mamá', callerType: 'Móvil', decline: 'Rechazar' },
  })},
  fr: { translation: merge(en, {
    common: { cancel: 'Annuler', submit: 'Soumettre', error: 'Erreur', close: 'Fermer' },
    header: { fakeCall: 'Faux Appel', companion: 'Compagnon', sos: 'SOS' },
    routeInput: { startPlaceholder: 'Point de départ', endPlaceholder: 'Destination', useCurrentLocation: 'Utiliser la position actuelle', modes: { walking: 'À pied', bike: 'Vélo', car: 'Voiture' }, loadingButton: 'Recherche d\'itinéraire...', submitButton: 'Trouver un itinéraire' },
    map: { title: "Visualisation d'itinéraire", safety: 'Sécurité', roadIssues: 'Problèmes de route' },
    routeDetails: { title: "Détails de l'itinéraire", overview: 'Aperçu', safetyInsights: 'Infos sécurité', directions: 'Instructions' },
    companionMode: { title: 'Activer le mode Compagnon de sécurité ?', keywords: ['aide', 'arrêtez', 'laissez-moi'], activateButton: "Activer le mode" },
    fakeCall: { title: 'Configurer un faux appel', voice: 'Voix', female: 'Féminine', male: 'Masculine', tone: 'Ton', calm: 'Calme', urgent: 'Urgent', startButton: "Démarrer l'appel", callerName: 'Maman' },
  })},
  de: { translation: merge(en, { common: { cancel: 'Abbrechen', submit: 'Senden' }, header: { fakeCall: 'Täuschungsanruf', companion: 'Begleiter' }, companionMode: { keywords: ['hilfe', 'stopp', 'lass mich'] } }) },
  it: { translation: merge(en, { common: { cancel: 'Annulla', submit: 'Invia' }, header: { fakeCall: 'Chiamata Finta', companion: 'Compagno' }, companionMode: { keywords: ['aiuto', 'fermati', 'lasciami'] } }) },
  ja: { translation: merge(en, { common: { cancel: 'キャンセル', submit: '送信' }, header: { fakeCall: '偽の電話', companion: 'コンパニオン' }, companionMode: { keywords: ['助けて', 'やめて', '離して'] } }) },
  ko: { translation: merge(en, { common: { cancel: '취소', submit: '제출' }, header: { fakeCall: '가짜 전화', companion: '컴패니언' }, companionMode: { keywords: ['도와주세요', '멈춰', '나를 내버려 둬'] } }) },
  zh: { translation: merge(en, { common: { cancel: '取消', submit: '提交' }, header: { fakeCall: '虚拟来电', companion: '伴侣模式' }, companionMode: { keywords: ['救命', '停止', '放开我'] } }) },
  ta: { translation: merge(en, { common: { cancel: 'ரத்துசெய்', submit: 'சமர்ப்பி' }, header: { fakeCall: 'போலி அழைப்பு', companion: 'துணை' } }) },
  kn: { translation: merge(en, { common: { cancel: 'ರದ್ದುಮಾಡಿ', submit: 'ಸಲ್ಲಿಸಿ' }, header: { fakeCall: 'ನಕಲಿ ಕರೆ', companion: 'ಸಹಚರ' } }) },
  te: { translation: merge(en, { common: { cancel: 'రద్దు చేయండి', submit: 'సమర్పించు' }, header: { fakeCall: 'నకిలీ కాల్', companion: 'సహచరుడు' } }) },
  ml: { translation: merge(en, { common: { cancel: 'റദ്ദാക്കുക', submit: 'സമർപ്പിക്കുക' }, header: { fakeCall: 'വ്യാജ കോൾ', companion: 'സഹചാരി' } }) },
  pa: { translation: merge(en, { common: { cancel: 'ਰੱਦ ਕਰੋ', submit: 'ਜਮ੍ਹਾਂ ਕਰੋ' }, header: { fakeCall: 'ਜਾਅਲੀ ਕਾਲ', companion: 'ਸਾਥੀ' } }) },
  gu: { translation: merge(en, { common: { cancel: 'રદ કરો', submit: 'સબમિટ કરો' }, header: { fakeCall: 'નકલી કોલ', companion: 'સાથી' } }) },
  mr: { translation: merge(en, { common: { cancel: 'रद्द करा', submit: 'प्रस्तुत करणे' }, header: { fakeCall: 'फेक कॉल', companion: 'सोबती' } }) },
};


i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'en',
    debug: false,
    resources,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18next;
