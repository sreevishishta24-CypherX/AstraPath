import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from './components/Header';
import { RouteInputForm } from './components/RouteInputForm';
import { MapDisplay } from './components/MapDisplay';
import { RouteDetails } from './components/RouteDetails';
import { fetchSafeRoute } from './services/geminiService';
import type { RouteData, TransportMode, MapView, FakeCallOptions } from './types';
import { SosModal } from './components/SosModal';
import { SosConfirmation } from './components/SosConfirmation';
import { CompanionModeModal } from './components/CompanionModeModal';
import { DistressDetectedModal } from './components/DistressDetectedModal';
import { FakeCallModal } from './components/FakeCallModal';
import { FakeCallScreen } from './components/FakeCallScreen';

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

const App: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [routeData, setRouteData] = useState<RouteData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [mapView, setMapView] = useState<MapView>('safety');

    const [showSosModal, setShowSosModal] = useState<boolean>(false);
    const [showSosConfirmation, setShowSosConfirmation] = useState<boolean>(false);
    const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
    
    // State for Safe Companion Mode
    const [isCompanionModeActive, setIsCompanionModeActive] = useState<boolean>(false);
    const [showCompanionModal, setShowCompanionModal] = useState<boolean>(false);
    const [showDistressModal, setShowDistressModal] = useState<boolean>(false);
    
    const recognitionRef = useRef<any>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const isIntentionallyStoppingRef = useRef<boolean>(false);

    // State for Fake Call
    const [showFakeCallModal, setShowFakeCallModal] = useState<boolean>(false);
    const [isFakeCallActive, setIsFakeCallActive] = useState<boolean>(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    // Load voices for Speech Synthesis
    useEffect(() => {
        const loadVoices = () => {
            setVoices(window.speechSynthesis.getVoices());
        };
        // Some browsers load voices asynchronously.
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
        loadVoices(); // For browsers that load immediately
    }, []);


    const handleFindRoute = useCallback(async (start: string, end: string, mode: TransportMode) => {
        if (!start || !end) {
            setError(t('alerts.enterStartAndEnd'));
            return;
        }
        setIsLoading(true);
        setError(null);
        setRouteData(null);

        try {
            const data = await fetchSafeRoute(start, end, mode);
            setRouteData(data);
        } catch (e) {
            console.error(e);
            setError(t('alerts.routeGenerationError'));
        } finally {
            setIsLoading(false);
        }
    }, [t]);
    
    const handleSosClick = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setShowSosModal(true);
                },
                () => {
                    alert(t('alerts.locationRetrievalError'));
                }
            );
        } else {
            alert(t('alerts.geolocationNotSupported'));
        }
    };

    const handleSosConfirm = () => {
        setShowSosModal(false);
        console.log("SOS Alert confirmed for location:", userLocation);
        setShowSosConfirmation(true);
    };
    
    const handleSosClose = () => {
        setShowSosModal(false);
        setShowSosConfirmation(false);
        setUserLocation(null);
    };
    
    // --- Safe Companion Mode Logic ---

    const handleDistressSignal = useCallback(() => {
        if (isCompanionModeActive && !showDistressModal) {
            isIntentionallyStoppingRef.current = true;
            recognitionRef.current?.stop();
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    setShowDistressModal(true);
                },
                () => {
                    setUserLocation(null);
                    setShowDistressModal(true);
                    console.warn("Could not retrieve location for distress signal.");
                }
            );
        }
    }, [isCompanionModeActive, showDistressModal]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Speech Recognition not supported.");
            return;
        }

        if (isCompanionModeActive) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = i18n.language;

            recognitionRef.current.onresult = (event: any) => {
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        const transcript = event.results[i][0].transcript.toLowerCase().trim();
                        const keywords = t('companionMode.keywords', { returnObjects: true }) as string[];
                        if (keywords.some(keyword => transcript.includes(keyword))) {
                            handleDistressSignal();
                        }
                    }
                }
            };

            recognitionRef.current.onend = () => {
                if (isIntentionallyStoppingRef.current) {
                    isIntentionallyStoppingRef.current = false;
                    return;
                }
                if (isCompanionModeActive) {
                     try {
                       recognitionRef.current?.start();
                    } catch (e) {
                        console.error("Error restarting recognition in onend handler:", e);
                    }
                }
            };
            
            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error);
                if (event.error === 'no-speech' || event.error === 'audio-capture') {
                    return;
                }
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    setIsCompanionModeActive(false);
                    alert(t('alerts.micPermissionDenied'));
                }
            };
            
            try {
                recognitionRef.current.start();
            } catch (e: any) {
                console.error("Failed to start speech recognition:", e);
                if (e.name !== 'InvalidStateError') {
                    setIsCompanionModeActive(false);
                    alert(t('alerts.companionStartError'));
                }
            }
        } else {
            if (recognitionRef.current) {
                isIntentionallyStoppingRef.current = true;
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
        }

        return () => {
            if (recognitionRef.current) {
                isIntentionallyStoppingRef.current = true;
                recognitionRef.current.stop();
            }
        };
    }, [isCompanionModeActive, handleDistressSignal, t, i18n.language]);

    const handleToggleCompanionMode = () => {
        if (isCompanionModeActive) {
            setIsCompanionModeActive(false);
        } else {
            setShowCompanionModal(true);
        }
    };

    const handleConfirmCompanionMode = () => {
        setShowCompanionModal(false);
        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then(stream => {
                stream.getTracks().forEach(track => track.stop());
                setIsCompanionModeActive(true);
            })
            .catch(() => {
                alert(t('alerts.micCamPermissionRequired'));
            });
    };
    
    const handleDistressConfirm = async () => {
        console.log("Distress confirmed. Taking action.");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.start();
            console.log("Recording started.");
        } catch (err) {
            console.error("Could not start recording:", err);
        }
        window.location.href = 'tel:112';
    };

    const handleDistressClose = () => {
        setShowDistressModal(false);
        mediaRecorderRef.current?.stop();
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        if (isCompanionModeActive) {
            try {
                recognitionRef.current?.start();
            } catch (e) {
                console.error("Failed to restart recognition after closing distress modal:", e);
            }
        }
    };
    
    // --- Fake Call Logic ---
    const handleFakeCallClick = () => {
        setShowFakeCallModal(true);
    };

    const handleStartFakeCall = (options: FakeCallOptions) => {
        speechSynthesis.cancel(); // Cancel any previous speech

        const utterance = new SpeechSynthesisUtterance(options.message);

        // Find a suitable voice
        const desiredVoice = voices.find(voice => {
            const name = voice.name.toLowerCase();
            const lang = voice.lang.toLowerCase();
            const currentLang = i18n.language.split('-')[0];

            const femaleKeywords = ['female', 'zira', 'samantha', 'susan', 'femme', 'mujer', 'महिला'];
            const maleKeywords = ['male', 'david', 'mark', 'tom', 'homme', 'hombre', 'पुरुष'];

            const keywords = options.voice === 'female' ? femaleKeywords : maleKeywords;

            return keywords.some(kw => name.includes(kw)) && lang.includes(currentLang);
        });
        
        if (desiredVoice) {
            utterance.voice = desiredVoice;
        } else {
             // Fallback for current language if specific gender not found
            const fallbackVoice = voices.find(voice => voice.lang.split('-')[0] === i18n.language.split('-')[0]);
            if (fallbackVoice) utterance.voice = fallbackVoice;
        }
        utterance.lang = i18n.language;


        if (options.tone === 'urgent') {
            utterance.pitch = 1.2; // Higher pitch
            utterance.rate = 1.1;  // Faster rate
        } else {
            utterance.pitch = 1;
            utterance.rate = 1;
        }

        utterance.onend = () => {
            setIsFakeCallActive(false);
        };

        speechSynthesis.speak(utterance);
        setShowFakeCallModal(false);
        setIsFakeCallActive(true);
    };

    const handleEndFakeCall = () => {
        speechSynthesis.cancel();
        setIsFakeCallActive(false);
    };


    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col antialiased">
            <Header 
                onSosClick={handleSosClick}
                onToggleCompanionMode={handleToggleCompanionMode}
                isCompanionModeActive={isCompanionModeActive}
                onFakeCallClick={handleFakeCallClick}
            />
            <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 p-4 lg:p-8 overflow-hidden">
                {/* Left Column */}
                <div className="md:col-span-5 lg:col-span-4 xl:col-span-3 flex flex-col gap-6 overflow-y-auto">
                    <RouteInputForm onFindRoute={handleFindRoute} isLoading={isLoading} />
                    <div className="flex-grow flex flex-col overflow-hidden min-h-0">
                      <RouteDetails routeData={routeData} isLoading={isLoading} error={error} />
                    </div>
                </div>
                {/* Right Column */}
                <div className="md:col-span-7 lg:col-span-8 xl:col-span-9 min-h-[400px] md:min-h-0">
                    <MapDisplay routeData={routeData} mapView={mapView} setMapView={setMapView} />
                </div>
            </main>
            {showSosModal && userLocation && (
                <SosModal 
                    isOpen={showSosModal}
                    onConfirm={handleSosConfirm}
                    onCancel={handleSosClose}
                    location={userLocation}
                />
            )}
            {showSosConfirmation && userLocation && (
                <SosConfirmation 
                    isOpen={showSosConfirmation}
                    onClose={handleSosClose}
                    location={userLocation}
                />
            )}
            <CompanionModeModal
                isOpen={showCompanionModal}
                onConfirm={handleConfirmCompanionMode}
                onCancel={() => setShowCompanionModal(false)}
            />
            <DistressDetectedModal
                isOpen={showDistressModal}
                onClose={handleDistressClose}
                onConfirm={handleDistressConfirm}
                location={userLocation}
            />
            <FakeCallModal
                isOpen={showFakeCallModal}
                onStart={handleStartFakeCall}
                onCancel={() => setShowFakeCallModal(false)}
            />
            <FakeCallScreen
                isOpen={isFakeCallActive}
                onEndCall={handleEndFakeCall}
            />
        </div>
    );
};

export default App;
