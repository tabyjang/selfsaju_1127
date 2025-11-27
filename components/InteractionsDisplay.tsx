import React, { useState } from 'react';
import type { SajuInfo, Ohaeng } from '../types';
import { analyzeInteractions } from '../utils/interactions';
import { earthlyBranchGanInfo } from '../utils/manse';
import { ChevronDownIcon } from './icons';

const ohaengColorMap: Record<Ohaeng, { bg: string; text: string; border?: string }> = {
    wood:  { bg: 'bg-[#00B050]', text: 'text-white' },
    fire:  { bg: 'bg-[#FF0000]', text: 'text-white' },
    earth: { bg: 'bg-[#FEC100]', text: 'text-white' },
    metal: { bg: 'bg-slate-300', text: 'text-white', border: 'border border-slate-400/50' },
    water: { bg: 'bg-black', text: 'text-white', border: 'border-2 border-slate-500' },
};

const CharBox: React.FC<{ char: string }> = ({ char }) => {
    const ganInfo = earthlyBranchGanInfo[char];
    if (!ganInfo) return null;
    const color = ohaengColorMap[ganInfo.ohaeng];

    return (
        <div className={`inline-flex items-center justify-center w-7 h-7 text-base font-bold rounded shadow-md ${color.bg} ${color.text} ${color.border ?? ''} saju-char-outline-small`}>
            {char}
        </div>
    );
};

const InteractionItem: React.FC<{ text: string }> = ({ text }) => {
    const match = text.match(/^([·\u4e00-\u9fff]+)\s(.+)$/);

    if (!match) {
        return <span className="text-gray-700 text-base font-semibold">{text}</span>;
    }

    const chars = match[1].split('·');
    const description = match[2];

    return (
        <div className="flex items-center justify-center gap-2">
            <div className="flex gap-1.5">
                {chars.map((char, i) => <CharBox key={i} char={char} />)}
            </div>
            <span className="text-gray-700 text-base font-semibold">{description}</span>
        </div>
    );
};

export const InteractionsDisplay: React.FC<{ sajuInfo: SajuInfo }> = ({ sajuInfo }) => {
    const [isOpen, setIsOpen] = useState(false);
    const interactions = analyzeInteractions(sajuInfo.pillars);
    const hasInteractions = Object.values(interactions).some(arr => arr.length > 0);

    const InteractionCategory: React.FC<{ title: string; items: string[] }> = ({ title, items }) => {
        return (
            <div className="p-4 border-b border-gray-200 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
                <h4 className="text-sm font-bold text-amber-600 mb-3 tracking-wider">{title}</h4>
                {items.length > 0 ? (
                    <ul className="space-y-2.5">
                        {items.map((item, index) => (
                            <li key={index}>
                                <InteractionItem text={item} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 text-sm mt-3">해당 없음</p>
                )}
            </div>
        );
    };

    return (
        <div className="mt-8 glass-card">
            <button
                className="w-full p-4 md:p-6 text-left flex justify-between items-center"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <h3 className="text-xl font-bold text-gray-800">
                    지지의 형충회합 (刑冲會合)
                </h3>
                <ChevronDownIcon className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 md:p-6 pt-0 animate-fade-in-fast">
                    {hasInteractions ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 text-center bg-black/5 rounded-lg">
                            <InteractionCategory title="형 (刑)" items={interactions.hyeong} />
                            <InteractionCategory title="충 (冲)" items={interactions.chung} />
                            <InteractionCategory title="회 (會)" items={interactions.hoe} />
                            <InteractionCategory title="합 (合)" items={interactions.hab} />
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-4">원국 내 특별한 형충회합 관계가 없습니다.</p>
                    )}
                </div>
            )}
        </div>
    );
};