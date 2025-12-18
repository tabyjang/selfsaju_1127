import React, { useState, useEffect } from 'react';
import type { SajuInfo, Ohaeng, Pillar } from '../types';
import { GyeokgukDisplay } from './GyeokgukDisplay';
import OhaengForceDisplay from '../yongsin/OhaengForceDisplay';

// 사주 원국 표시 컴포넌트 (AnalysisResult에서 복사)
const ohaengColorMap: Record<Ohaeng, { bg: string; text: string; border?: string }> = {
  wood: {
    bg: "bg-[#00B050]",
    text: "text-white",
    border: "border border-gray-800",
  },
  fire: {
    bg: "bg-[#FF0000]",
    text: "text-white",
    border: "border border-gray-800",
  },
  earth: {
    bg: "bg-[#FEC100]",
    text: "text-white",
    border: "border border-gray-800",
  },
  metal: {
    bg: "bg-slate-200",
    text: "text-white",
    border: "border border-gray-800",
  },
  water: {
    bg: "bg-black",
    text: "text-white",
    border: "border border-gray-800",
  },
};

export const DeepAnalysis: React.FC = () => {
  const [sajuData, setSajuData] = useState<SajuInfo | null>(null);

  useEffect(() => {
    // localStorage에서 사주 데이터 불러오기
    const savedData = localStorage.getItem('deepAnalysisSajuData');
    if (savedData) {
      setSajuData(JSON.parse(savedData));
    }
  }, []);

  if (!sajuData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">사주 데이터를 불러오는 중...</h2>
          <p className="text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  const renderPillar = (pillar: Pillar, isEmpty: boolean = false, isMonthPillar: boolean = false) => {
    if (isEmpty) {
      return (
        <div className="flex flex-col text-center text-sm md:text-base">
          <div className="font-bold text-gray-400 py-2.5">시주</div>
          <div className="py-2 h-14 flex items-center justify-center border-t border-gray-200">
            <span className="text-gray-400 text-sm">-</span>
          </div>
          <div className="flex justify-center items-center py-1.5 px-2 h-24 md:h-28">
            <div className="saju-char-outline w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-4xl md:text-5xl font-bold rounded-lg shadow-lg bg-gray-100 text-gray-300 border border-gray-300">
              -
            </div>
          </div>
          <div className="flex justify-center items-center py-1.5 px-2 h-24 md:h-28">
            <div className="saju-char-outline w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-4xl md:text-5xl font-bold rounded-lg shadow-lg bg-gray-100 text-gray-300 border border-gray-300">
              -
            </div>
          </div>
          <div className="py-2 h-14 flex items-center justify-center font-semibold text-gray-400 text-base">
            -
          </div>
          <div className="py-2 flex-grow bg-black/5 border-t border-b border-gray-200 flex flex-col justify-center min-h-[110px]">
            <div className="font-semibold text-xs text-gray-400 mb-1">지장간(支藏干)</div>
            <div className="text-gray-400 text-sm">-</div>
          </div>
          <div className="py-2 font-semibold text-gray-400">-</div>
        </div>
      );
    }

    const ganColor = ohaengColorMap[pillar.cheonGan.ohaeng];
    const jiColor = ohaengColorMap[pillar.jiJi.ohaeng];

    return (
      <div className="flex flex-col text-center text-sm md:text-base">
        <div className="font-bold text-gray-700 py-2.5">
          {pillar.label}
          <span className="font-normal text-gray-400">({pillar.ganji})</span>
        </div>

        <div className="py-2 h-14 flex items-center justify-center border-t border-gray-200">
          <span className={`font-semibold text-base saju-text-outline ${pillar.cheonGan.sibsin.name === "일간" ? "text-amber-600" : "text-gray-700"}`}>
            {pillar.cheonGan.sibsin.name === "일간" ? "일간(日干)" : pillar.cheonGan.sibsin.name}
          </span>
        </div>

        <div className="flex justify-center items-center py-1.5 px-2 h-24 md:h-28">
          <div className={`saju-char-outline flex items-center justify-center font-bold rounded-lg shadow-lg ${
            pillar.cheonGan.sibsin.name === "일간"
              ? "w-20 h-20 md:w-24 md:h-24 text-5xl md:text-6xl animate-heartbeat border-4 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)]"
              : "w-16 h-16 md:w-20 md:h-20 text-4xl md:text-5xl"
          } ${ganColor.bg} ${ganColor.text} ${pillar.cheonGan.sibsin.name === "일간" ? "" : ganColor.border ?? ""}`}>
            {pillar.cheonGan.char}
          </div>
        </div>

        <div className="flex justify-center items-center py-1.5 px-2 h-24 md:h-28">
          <div className={`saju-char-outline flex items-center justify-center font-bold rounded-lg shadow-lg ${
            isMonthPillar
              ? "w-20 h-20 md:w-24 md:h-24 text-5xl md:text-6xl animate-heartbeat border-4 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.6)]"
              : "w-16 h-16 md:w-20 md:h-20 text-4xl md:text-5xl"
          } ${jiColor.bg} ${jiColor.text} ${isMonthPillar ? "" : jiColor.border ?? ""}`}>
            {pillar.jiJi.char}
          </div>
        </div>

        <div className="py-2 h-14 flex items-center justify-center font-semibold text-gray-700 text-base saju-text-outline">
          {pillar.jiJi.sibsin.name}
        </div>

        <div className="py-2 flex-grow bg-black/5 border-t border-b border-gray-200 flex flex-col justify-center min-h-[110px]">
          <div className="font-semibold text-xs text-gray-400 mb-1 saju-text-outline">지장간(支藏干)</div>
          {pillar.jiJi.jijanggan.map((j, index) => (
            <div key={index} className="text-gray-700 text-base my-1 saju-text-outline">
              {j.char} <span className="text-gray-500 font-medium text-sm">{j.sibsin.name}</span>
            </div>
          ))}
        </div>

        <div className="py-2 font-semibold text-gray-700 saju-text-outline">
          {pillar.jiJi.unseong.name}
          <span className="text-gray-400 text-xs ml-1 font-normal">({pillar.jiJi.unseong.hanja})</span>
        </div>
      </div>
    );
  };

  const isHourUnknown = sajuData.pillars.hour.cheonGan.char === "-" || sajuData.pillars.hour.jiJi.char === "-";
  const pillarOrder: (keyof SajuInfo["pillars"])[] = ["hour", "day", "month", "year"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <button
            onClick={() => window.history.back()}
            className="mb-4 text-purple-600 hover:text-purple-800 font-semibold"
          >
            ← 돌아가기
          </button>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-2">
            심층 사주 분석
          </h1>
          <p className="text-gray-600">오행 가중치·신강신약·용신 기반 정밀 분석</p>
        </div>

        {/* 사주 원국 정보 */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-5 text-center">사주 원국 정보</h2>
          <div className="p-1 md:p-2 glass-card">
            <div className="grid grid-cols-4 divide-x divide-gray-200">
              {pillarOrder.map((key) => {
                if (key === "hour" && isHourUnknown) {
                  return <React.Fragment key="hour-empty">{renderPillar(sajuData.pillars[key], true, false)}</React.Fragment>;
                }
                return <React.Fragment key={key}>{renderPillar(sajuData.pillars[key], false, key === "month")}</React.Fragment>;
              })}
            </div>
          </div>
        </div>

        {/* 격국(格局) 분석 */}
        <GyeokgukDisplay sajuInfo={sajuData} />

        {/* 오행 가중치 분석 및 신강신약 판단 */}
        <OhaengForceDisplay
          sajuInfo={sajuData}
          isHourUnknown={isHourUnknown}
        />

        {/* 용신 추출 (개발 예정) */}
        <div className="glass-card p-6 text-center mt-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">🚧 용신 추출 기능</h3>
          <p className="text-gray-600 mb-4">
            신강신약 판정을 기반으로 한 용신 추출 기능이<br />
            곧 추가될 예정입니다.
          </p>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-bold text-blue-900 mb-2">🎯 용신 추출</h4>
            <p className="text-sm text-blue-700">Coming Soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};
