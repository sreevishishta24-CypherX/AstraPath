import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ExclamationTriangleIcon, ShareIcon, MicrophoneIcon, VideoCameraIcon, PhoneIcon, CheckCircleIcon } from './icons';

interface DistressDetectedModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    location: { lat: number; lng: number } | null;
}

export const DistressDetectedModal: React.FC<DistressDetectedModalProps> = ({ isOpen, onClose, onConfirm, location }) => {
    const { t } = useTranslation();
    const [countdown, setCountdown] = useState(10);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const handleCancel = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onClose();
    };
    
    useEffect(() => {
        if (isOpen && !isConfirmed) {
            setCountdown(10);
            intervalRef.current = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isOpen, isConfirmed]);

    useEffect(() => {
        if (countdown <= 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (!isConfirmed) {
                setIsConfirmed(true);
                onConfirm();
            }
        }
    }, [countdown, onConfirm, isConfirmed]);

    useEffect(() => {
        if (!isOpen) {
            setIsConfirmed(false);
            setCountdown(10);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const progress = (countdown / 10) * 100;
    const actions = t('distressModal.actions', { returnObjects: true }) as string[];


    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-900 rounded-2xl shadow-2xl border-2 border-red-500/50 w-full max-w-lg animate-fade-in relative overflow-hidden">
                {!isConfirmed && (
                    <div style={{ width: `${progress}%`}} className="absolute bottom-0 left-0 h-2 bg-red-500 transition-all duration-1000 linear"></div>
                )}
                <div className="p-8 text-center">
                    {!isConfirmed ? (
                        <>
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-900/50 border-2 border-red-500/50 mb-4">
                                <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">{t('distressModal.title')}</h3>
                            <p className="text-gray-300 mt-2">{t('distressModal.subtitle')}</p>
                            <div className="text-7xl font-bold text-red-400 my-4">{countdown}</div>
                            <div className="text-left bg-gray-800/50 p-4 rounded-lg space-y-3 text-sm">
                                <p className="flex items-center gap-3"><ShareIcon className="w-5 h-5 text-indigo-400"/><span>{actions[0]}</span></p>
                                <p className="flex items-center gap-3"><VideoCameraIcon className="w-5 h-5 text-indigo-400"/><span>{actions[1]}</span></p>
                                <p className="flex items-center gap-3"><PhoneIcon className="w-5 h-5 text-indigo-400"/><span>{actions[2]}</span></p>
                            </div>
                            <button
                                onClick={handleCancel}
                                className="mt-8 w-full bg-gray-200 text-gray-900 font-bold py-4 rounded-lg text-lg hover:bg-white transition-colors"
                            >
                                {t('distressModal.cancelButton')}
                            </button>
                        </>
                    ) : (
                        <>
                            <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white">{t('distressModal.confirmedTitle')}</h3>
                             <p className="text-gray-300 mt-2 mb-6">
                                {t('distressModal.confirmedSubtitle')}
                            </p>
                             {location ? (
                                <div className="bg-gray-800/50 p-4 rounded-lg text-sm mb-6">
                                    <p className="font-semibold text-indigo-300">{t('distressModal.locationShared')}:</p>
                                    <p className="font-mono text-white mt-1">
                                        Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                                    </p>
                                </div>
                             ) : (
                                 <div className="bg-gray-800/50 p-4 rounded-lg text-sm mb-6">
                                    <p className="font-semibold text-yellow-400">{t('distressModal.locationError')}</p>
                                </div>
                             )}
                            <button
                                onClick={onClose}
                                className="mt-4 w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                {t('common.close')}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};