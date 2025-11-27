import React, { useState } from 'react';
import type { SajuInfo } from '../types';
import { analyzeSinsal } from '../utils/sinsal';
import { sinsalInfo } from '../utils/sinsalDescriptions';
import { Modal } from './Modal';
import { ExclamationCircleIcon, ChevronDownIcon } from './icons';

interface LocalSinsalInfo {
    title: string;
    description: string;
}

const renderDescription = (description: string) => {
    const parts = description.split(/(<table[\s\S]*?<\/table>)/g);

    return parts.map((part, index) => {
        if (part.startsWith('<table')) {
            return <div key={index} dangerouslySetInnerHTML={{ __html: part }} />;
        } else {
            return part.trim().split('\n').map((line, lineIndex) => {
                const trimmedLine = line.trim();
                if (trimmedLine) {
                    if (trimmedLine.startsWith('<b> • 해당 간지:') || trimmedLine.startsWith('<b> • 해당 글자:')) {
                        return <p key={`${index}-${lineIndex}`} dangerouslySetInnerHTML={{ __html: trimmedLine.replace(/\n/g, '<br />') }} />;
                    }
                    return <p key={`${index}-${lineIndex}`}>{trimmedLine}</p>;
                }
                return null;
            });
        }
    });
};

export const SinsalDisplay: React.FC<{ sajuInfo: SajuInfo }> = ({ sajuInfo }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedSinsal, setSelectedSinsal] = useState<LocalSinsalInfo | null>(null);
    const sinsalResult = analyzeSinsal(sajuInfo);
    const sinsalKeys = Object.keys(sinsalInfo);

    const handleSinsalClick = (sinsalKey: string) => {
        if (sinsalInfo[sinsalKey]) {
            setSelectedSinsal(sinsalInfo[sinsalKey]);
        }
    };

    const closeModal = () => {
        setSelectedSinsal(null);
    };

    return (
        <div className="mt-8 glass-card">
            <button
                className="w-full p-4 md:p-6 text-left flex justify-between items-center"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <h3 className="text-xl font-bold text-gray-800">
                    일간으로 보는 신살
                </h3>
                <ChevronDownIcon className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>

            {isOpen && (
                 <div className="p-4 md:p-6 pt-0 animate-fade-in-fast">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 text-center">
                        {sinsalKeys.map(key => {
                            const hasSinsal = sinsalResult[key] && sinsalResult[key].length > 0;
                            const locations = hasSinsal ? sinsalResult[key].join(', ') : '해당 없음';
                            
                            return (
                                <div
                                    key={key}
                                    className={`p-3 rounded-lg border transition-all cursor-pointer ${hasSinsal ? 'bg-amber-50 border-amber-200 hover:bg-amber-100' : 'bg-gray-100 border-gray-200'}`}
                                    onClick={() => handleSinsalClick(key)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSinsalClick(key)}
                                    aria-label={`${key} 상세 정보 보기`}
                                >
                                    <div className={`font-bold text-base ${hasSinsal ? 'text-amber-600' : 'text-gray-400'}`}>
                                        {key}
                                    </div>
                                    <div className="text-xs mt-1 text-gray-500 truncate" title={locations}>
                                        {locations}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
                        <ExclamationCircleIcon className="w-4 h-4 mr-1.5" />
                        <span>각 신살을 클릭하여 자세한 설명을 확인하세요.</span>
                    </div>
                 </div>
            )}

            {selectedSinsal && (
                <Modal
                    isOpen={!!selectedSinsal}
                    onClose={closeModal}
                    title={selectedSinsal.title}
                >
                    {renderDescription(selectedSinsal.description)}
                </Modal>
            )}
        </div>
    );
};