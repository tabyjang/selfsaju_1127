import React, { useState, ChangeEvent, FormEvent } from 'react';
import type { Gender, SajuInfo } from '../types';
import { WandIcon, InfoIcon } from './icons';
import { getSajuFromDate, getSajuInfoFromCharacters, birthLocations } from '../utils/manse';
import { Modal } from './Modal';

interface SajuInputFormProps {
    onAnalyze: (data: SajuInfo) => void;
    isLoading: boolean;
}

const ManseInput: React.FC<{
    birthDate: { year: string; month: string; day: string; hour: string; minute: string; };
    setBirthDate: (date: { year: string; month: string; day: string; hour: string; minute: string; }) => void;
    isLoading: boolean;
}> = ({ birthDate, setBirthDate, isLoading }) => {

    const currentYear = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    const handleChange = (field: keyof typeof birthDate) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setBirthDate({ ...birthDate, [field]: e.target.value });
    };
    
    const inputClass = "w-full p-3 bg-black/5 hover:bg-black/10 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed text-base text-center";

    return (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            <div className="text-center">
                <label className="block text-sm text-gray-500 font-medium mb-1.5">년</label>
                <input type="number" value={birthDate.year} onChange={handleChange('year')} placeholder={`${currentYear}`} className={inputClass} disabled={isLoading} min="1940" max="2050" />
            </div>
            <div className="text-center">
                <label className="block text-sm text-gray-500 font-medium mb-1.5">월</label>
                <select value={birthDate.month} onChange={handleChange('month')} className={inputClass} disabled={isLoading}>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
            <div className="text-center">
                <label className="block text-sm text-gray-500 font-medium mb-1.5">일</label>
                <select value={birthDate.day} onChange={handleChange('day')} className={inputClass} disabled={isLoading}>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>
            <div className="text-center">
                <label className="block text-sm text-gray-500 font-medium mb-1.5">시</label>
                <select value={birthDate.hour} onChange={handleChange('hour')} className={inputClass} disabled={isLoading}>
                    {hours.map(h => <option key={h} value={h}>{h.toString()}</option>)}
                </select>
            </div>
             <div className="text-center">
                <label className="block text-sm text-gray-500 font-medium mb-1.5">분</label>
                <select value={birthDate.minute} onChange={handleChange('minute')} className={inputClass} disabled={isLoading}>
                    {minutes.map(m => <option key={m} value={m}>{m.toString()}</option>)}
                </select>
            </div>
        </div>
    );
};


export const SajuInputForm: React.FC<SajuInputFormProps> = ({ onAnalyze, isLoading }) => {
    const [gender, setGender] = useState<Gender>('female');
    const [dateError, setDateError] = useState<string | null>(null);
    const [location, setLocation] = useState(birthLocations[0].name);
    const [yajasiOption, setYajasiOption] = useState<'none' | 'apply'>('none');
    const [isYajasiInfoOpen, setIsYajasiInfoOpen] = useState<boolean>(false);
    
    const [birthDate, setBirthDate] = useState({
        year: new Date().getFullYear().toString(),
        month: (new Date().getMonth() + 1).toString(),
        day: new Date().getDate().toString(),
        hour: new Date().getHours().toString(),
        minute: '0',
    });
    
    const inputClass = "w-full p-3 bg-white/50 hover:bg-white/80 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed text-base";


    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setDateError(null);

        if (!birthDate.year || !birthDate.month || !birthDate.day || !birthDate.hour || !birthDate.minute) {
            alert('생년월일시를 모두 입력해주세요.');
            return;
        }

        try {
            const date = new Date(
                parseInt(birthDate.year),
                parseInt(birthDate.month) - 1,
                parseInt(birthDate.day),
                parseInt(birthDate.hour),
                parseInt(birthDate.minute)
            );

            if (isNaN(date.getTime()) || date.getFullYear() !== parseInt(birthDate.year) || date.getMonth() !== parseInt(birthDate.month) - 1 || date.getDate() !== parseInt(birthDate.day)) {
                const errorMsg = '유효하지 않은 날짜입니다. (예: 2월 30일)';
                setDateError(errorMsg);
                alert(errorMsg);
                return;
            }

            if (parseInt(birthDate.year) < 1940 || parseInt(birthDate.year) > 2050) {
                 const errorMsg = '유효한 날짜를 입력해주세요. (1940년 ~ 2050년)';
                 setDateError(errorMsg);
                 alert(errorMsg);
                 return;
            }

            const selectedLocation = birthLocations.find(l => l.name === location) || birthLocations[0];
            const timeOffset = selectedLocation.offsetMinutes;
            const isYajasiApplied = yajasiOption === 'apply';

            const derivedSajuData = getSajuFromDate(date, gender, timeOffset, isYajasiApplied);

            const numericBirthDate = {
                year: parseInt(birthDate.year),
                month: parseInt(birthDate.month),
                day: parseInt(birthDate.day),
                hour: parseInt(birthDate.hour),
                minute: parseInt(birthDate.minute),
            };
            
            const sajuInfo = getSajuInfoFromCharacters(derivedSajuData.characters, gender, derivedSajuData.daewoon, derivedSajuData.daewoonNumber, numericBirthDate, location);
            onAnalyze(sajuInfo);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "";
            setDateError(errorMessage);
            if (errorMessage) {
                alert(errorMessage);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8">
            <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left Column: Gender */}
                    <div>
                        <label className="block text-base font-semibold text-gray-800 mb-3">성별</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button type="button" onClick={() => setGender('male')} disabled={isLoading} className={`flex items-center justify-center p-4 rounded-xl transition-all duration-200 border-2 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 ${gender === 'male' ? 'bg-sky-400 text-white border-sky-400 shadow-lg' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200'}`}>
                                남성
                            </button>
                            <button type="button" onClick={() => setGender('female')} disabled={isLoading} className={`flex items-center justify-center p-4 rounded-xl transition-all duration-200 border-2 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 ${gender === 'female' ? 'bg-pink-400 text-white border-pink-400 shadow-lg' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200'}`}>
                               여성
                            </button>
                        </div>
                    </div>
                    {/* Right Column: Location & Yajasi */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-base font-semibold text-gray-800 mb-3">
                                출생 지역
                            </label>
                            <select 
                                value={location} 
                                onChange={(e) => setLocation(e.target.value)}
                                className={`${inputClass} h-14`}
                                disabled={isLoading}
                            >
                                {birthLocations.map((loc) => (
                                    <option key={loc.name} value={loc.name}>{loc.name}</option>
                                ))}
                            </select>
                            <p className="text-gray-500 text-xs mt-2 px-1">
                                정확한 시간 계산을 위해 반영됩니다.
                            </p>
                        </div>
                         <div>
                            <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                야자시 적용
                                <button 
                                    type="button" 
                                    onClick={() => setIsYajasiInfoOpen(true)} 
                                    className="text-gray-400 hover:text-gray-700 transition-colors"
                                    aria-label="야자시 정보"
                                >
                                  <InfoIcon className="w-5 h-5" />
                                </button>
                            </label>
                            <select
                                value={yajasiOption}
                                onChange={(e) => setYajasiOption(e.target.value as 'none' | 'apply')}
                                className={`${inputClass} h-14`}
                                disabled={isLoading}
                            >
                                <option value="none">적용 안 함 (표준 명리)</option>
                                <option value="apply">야자시 적용</option>
                            </select>
                             <p className="text-gray-500 text-xs mt-2 px-1">
                                23:30~23:59 출생 시 선택합니다.
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                     <label className="block text-base font-bold text-gray-800 mb-3 text-center">
                        생년월일시
                     </label>
                     <div className="p-4 bg-black/5 rounded-xl border border-gray-200">
                        <ManseInput birthDate={birthDate} setBirthDate={setBirthDate} isLoading={isLoading} />
                     </div>
                     {dateError && <p className="text-red-500 text-sm mt-2 text-center">{dateError}</p>}
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="btn-primary mt-10 w-full flex items-center justify-center gap-3 py-4 px-4 rounded-xl duration-300 disabled:opacity-60 disabled:cursor-not-allowed transform focus:outline-none focus:ring-4 focus:ring-yellow-400/50"
            >
                <WandIcon className="w-6 h-6" />
                <span className="text-lg">{isLoading ? '분석 중...' : '분석 시작하기'}</span>
            </button>

            {isYajasiInfoOpen && (
                <Modal
                    isOpen={isYajasiInfoOpen}
                    onClose={() => setIsYajasiInfoOpen(false)}
                    title="야자시 (夜子時) 설명"
                >
                    <div className="space-y-4">
                        <p>
                          명리학에서 하루의 시작은 00시가 아닌 자시(子時, 23:00~01:00)입니다. 따라서 전통적으로 23시 이후 출생자는 다음 날의 일주(日柱)로 간주합니다.
                        </p>
                        <p>
                          하지만 '야자시'는 23:00~23:59 사이 출생자의 일주를 당일로 유지해야 한다는 학설입니다. 특히 동지(冬至)와 가까운 시기에는 해가 짧아져 이 학설을 적용하기도 합니다.
                        </p>
                        <p className="font-bold text-amber-700 mt-4 p-3 bg-yellow-100 rounded-lg border border-yellow-200">
                          이 옵션을 체크하면, 23:30 ~ 23:59 사이에 태어난 경우 일주가 다음 날로 넘어가지 않고 당일의 일주를 유지하여 사주를 계산합니다.
                        </p>
                        <p>
                          본인의 출생 시간에 야자시 적용 여부가 확실하지 않다면, 체크하지 않은 결과와 체크한 결과를 모두 참고하여 자신에게 더 잘 맞는 것을 선택하는 것이 좋습니다.
                        </p>
                    </div>
                </Modal>
            )}
        </form>
    );
};