import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheckIcon } from './icons';

interface CompanionModeModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const CompanionModeModal: React.FC<CompanionModeModalProps> = ({ isOpen, onConfirm, onCancel }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    const keywords = t('companionMode.keywords', { returnObjects: true }) as string[];
    const actions = t('companionMode.actions', { returnObjects: true }) as string[];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700/50 w-full max-w-lg animate-fade-in">
                <div className="p-8">
                    <div className="flex flex-col items-center text-center">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-900/50">
                            <ShieldCheckIcon className="h-7 w-7 text-green-400" aria-hidden="true" />
                        </div>
                        <div className="mt-4">
                            <h3 className="text-xl font-bold leading-6 text-white" id="modal-title">
                                {t('companionMode.title')}
                            </h3>
                            <div className="mt-4 space-y-3 text-sm text-gray-300">
                                <p>
                                    {t('companionMode.description')}
                                </p>
                                <div className="text-left bg-gray-900/50 p-4 rounded-lg">
                                    <p className="font-semibold text-indigo-300">{t('companionMode.listensFor')}</p>
                                    <ul className="list-disc list-inside mt-2 text-gray-400">
                                        {keywords.map((keyword, index) => <li key={index}>{keyword}</li>)}
                                    </ul>
                                </div>
                                <div className="text-left bg-gray-900/50 p-4 rounded-lg">
                                    <p className="font-semibold text-red-400">{t('companionMode.ifDetected')}</p>
                                    <ul className="list-disc list-inside mt-2 text-gray-400">
                                       {actions.map((action, index) => <li key={index}>{action}</li>)}
                                    </ul>
                                </div>
                                <p className="text-xs text-gray-500 pt-2">
                                    {t('companionMode.privacyNotice')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-800/50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 rounded-b-xl">
                    <button
                        type="button"
                        className="w-full justify-center rounded-md bg-gray-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-600 sm:w-auto transition-colors"
                        onClick={onCancel}
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="button"
                        className="w-full justify-center rounded-md bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 sm:w-auto transition-colors"
                        onClick={onConfirm}
                    >
                        {t('companionMode.activateButton')}
                    </button>
                </div>
            </div>
        </div>
    );
};