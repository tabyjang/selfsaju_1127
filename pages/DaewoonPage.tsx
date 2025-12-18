import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SajuInfo, Ohaeng, DaewoonPillar, SewoonPillar, WolwoonPillar } from '../types';
import { ohaengColorMap } from '../components/AnalysisResult';
import { getSewoonPillars, getWolwoonPillars } from '../utils/manse';
import { ChevronDownIcon } from '../components/icons';

const DaewoonPage: React.FC = () => {
  const navigate = useNavigate();
  const [sajuData, setSajuData] = useState<SajuInfo | null>(null);
  const [showWolwoon, setShowWolwoon] = useState(false);

  useEffect(() => {
    // localStorage에서 사주 데이터 불러오기
    const savedData = localStorage.getItem('currentSajuData');
    if (savedData) {
      setSajuData(JSON.parse(savedData));
    } else {
      // 데이터가 없으면 입력 페이지로 리다이렉트
      navigate('/input');
    }
  }, [navigate]);

  const currentYear = new Date().getFullYear();
  const koreanAge = sajuData ? currentYear - sajuData.birthDate.year + 1 : 0;
  const ilGan = sajuData?.pillars.day.cheonGan.char || '';

  const sewoonPillars = useMemo(
    () => sajuData ? getSewoonPillars(currentYear, 10, ilGan) : [],
    [currentYear, ilGan, sajuData]
  );

  const wolwoonPillars = useMemo(
    () => sajuData ? getWolwoonPillars(2026, ilGan) : [],
    [ilGan, sajuData]
  );

  if (!sajuData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 page-fade-in">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">사주 데이터를 불러오는 중...</h2>
          <p className="text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  const renderDaewoonPillar = (pillar: DaewoonPillar) => {
    const ganColor = ohaengColorMap[pillar.cheonGan.ohaeng];
    const jiColor = ohaengColorMap[pillar.jiJi.ohaeng];
    const isActive = koreanAge >= pillar.age && koreanAge < pillar.age + 10;

    return (
      <div
        key={pillar.age}
        className={`flex flex-col text-center text-xs md:text-sm p-1.5 bg-gray-900/5 rounded-lg border-2 shadow-md flex-shrink-0 w-[80px] md:w-[90px] ${
          isActive ? "border-yellow-500" : "border-gray-200"
        }`}
      >
        <div
          className={`font-bold py-1 saju-text-outline ${
            isActive ? "text-yellow-600" : "text-gray-800"
          }`}
        >
          {pillar.age}세
          <span className="block text-xs font-normal text-gray-800">
            ({pillar.ganji})
          </span>
        </div>

        <div className="py-1 h-9 flex items-center justify-center font-semibold text-gray-800 text-xs md:text-sm saju-text-outline">
          {pillar.cheonGan.sibsin.name}
        </div>

        <div className="flex justify-center py-0.5">
          <div
            className={`saju-char-outline-small w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-2xl md:text-3xl font-bold rounded-md shadow-md ${
              ganColor.bg
            } ${ganColor.text} ${ganColor.border ?? ""}`}
          >
            {pillar.cheonGan.char}
          </div>
        </div>

        <div className="flex justify-center py-0.5">
          <div
            className={`saju-char-outline-small w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-2xl md:text-3xl font-bold rounded-md shadow-md ${
              jiColor.bg
            } ${jiColor.text} ${jiColor.border ?? ""}`}
          >
            {pillar.jiJi.char}
          </div>
        </div>

        <div className="py-1 h-9 flex items-center justify-center font-semibold text-gray-800 text-xs md:text-sm saju-text-outline">
          {pillar.jiJi.sibsin.name}
        </div>
        <div className="py-1 h-9 flex items-center justify-center font-semibold text-gray-800 text-xs md:text-sm border-t border-gray-400/30 mt-1 saju-text-outline">
          {pillar.jiJi.unseong.name}
        </div>
      </div>
    );
  };

  const renderSewoonPillar = (pillar: SewoonPillar) => {
    const ganColor = ohaengColorMap[pillar.cheonGan.ohaeng];
    const jiColor = ohaengColorMap[pillar.jiJi.ohaeng];

    return (
      <div
        key={pillar.year}
        className={`flex flex-col text-center text-xs md:text-sm p-1.5 bg-gray-900/5 rounded-lg border-2 flex-shrink-0 w-[80px] md:w-[90px] shadow-md ${
          pillar.year === currentYear ? "border-yellow-500" : "border-gray-200"
        }`}
      >
        <div
          className={`font-bold py-1 saju-text-outline ${
            pillar.year === currentYear ? "text-yellow-600" : "text-gray-800"
          }`}
        >
          {pillar.year}년
          <span className="block text-xs font-normal text-gray-800">
            ({pillar.ganji})
          </span>
        </div>

        <div className="py-1 h-9 flex items-center justify-center font-semibold text-gray-800 text-xs md:text-sm saju-text-outline">
          {pillar.cheonGan.sibsin.name}
        </div>

        <div className="flex justify-center py-0.5">
          <div
            className={`saju-char-outline-small w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-2xl md:text-3xl font-bold rounded-md shadow-md ${
              ganColor.bg
            } ${ganColor.text} ${ganColor.border ?? ""}`}
          >
            {pillar.cheonGan.char}
          </div>
        </div>

        <div className="flex justify-center py-0.5">
          <div
            className={`saju-char-outline-small w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-2xl md:text-3xl font-bold rounded-md shadow-md ${
              jiColor.bg
            } ${jiColor.text} ${jiColor.border ?? ""}`}
          >
            {pillar.jiJi.char}
          </div>
        </div>

        <div className="py-1 h-9 flex items-center justify-center font-semibold text-gray-800 text-xs md:text-sm saju-text-outline">
          {pillar.jiJi.sibsin.name}
        </div>
        <div className="py-1 h-9 flex items-center justify-center font-semibold text-gray-800 text-xs md:text-sm border-t border-gray-400/30 mt-1 saju-text-outline">
          {pillar.jiJi.unseong.name}
        </div>
      </div>
    );
  };

  const renderWolwoonPillar = (pillar: WolwoonPillar) => {
    const ganColor = ohaengColorMap[pillar.cheonGan.ohaeng];
    const jiColor = ohaengColorMap[pillar.jiJi.ohaeng];

    return (
      <div
        key={pillar.monthName}
        className="flex flex-col text-center text-xs md:text-sm p-1.5 bg-gray-900/5 rounded-lg border-2 border-gray-200 flex-shrink-0 w-[80px] md:w-[90px] shadow-md"
      >
        <div className="font-bold py-1 text-gray-800 saju-text-outline">
          {pillar.month}월
          <span className="block text-xs font-normal text-gray-600">
            ({pillar.monthName})
          </span>
        </div>

        <div className="py-1 h-9 flex items-center justify-center font-semibold text-gray-800 text-xs md:text-sm saju-text-outline">
          {pillar.cheonGan.sibsin.name}
        </div>

        <div className="flex justify-center py-0.5">
          <div
            className={`saju-char-outline-small w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-2xl md:text-3xl font-bold rounded-md shadow-md ${
              ganColor.bg
            } ${ganColor.text} ${ganColor.border ?? ""}`}
          >
            {pillar.cheonGan.char}
          </div>
        </div>

        <div className="flex justify-center py-0.5">
          <div
            className={`saju-char-outline-small w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-2xl md:text-3xl font-bold rounded-md shadow-md ${
              jiColor.bg
            } ${jiColor.text} ${jiColor.border ?? ""}`}
          >
            {pillar.jiJi.char}
          </div>
        </div>

        <div className="py-1 h-9 flex items-center justify-center font-semibold text-gray-800 text-xs md:text-sm saju-text-outline">
          {pillar.jiJi.sibsin.name}
        </div>
        <div className="py-1 h-9 flex items-center justify-center font-semibold text-gray-800 text-xs md:text-sm border-t border-gray-400/30 mt-1 saju-text-outline">
          {pillar.jiJi.unseong.name}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 py-8 px-4 page-transition">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate("/result")}
            className="mb-4 text-purple-600 hover:text-purple-800 font-semibold"
          >
            ← 돌아가기
          </button>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 mb-2">
            대운·세운·월운 흐름
          </h1>
          <p className="text-gray-600">인생의 큰 물결, 한 해의 운세, 매월의 기운을 확인하세요</p>
        </div>

        {/* 대운·세운·월운 설명 섹션 */}
        <div className="mb-8 p-6 bg-white rounded-2xl border-2 border-purple-200 shadow-lg glass-card">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-md">
              <span className="text-3xl">🌊</span>
            </div>
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-800 mb-3">
                대운·세운·월운이란?
              </h4>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                  <p className="font-semibold text-purple-900 mb-2">🌊 대운(大運)</p>
                  <p className="text-sm md:text-base">
                    인생을 <strong className="text-purple-700">10년 단위</strong>로 나누어 각 시기의 흐름과 방향성을 보여주는 운명의 큰 물결입니다.
                    대운의 변화는 인생의 전환점이 되며, 각 시기마다 다른 기운이 작용합니다.
                  </p>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-400">
                  <p className="font-semibold text-pink-900 mb-2">📅 세운(歲運)</p>
                  <p className="text-sm md:text-base">
                    <strong className="text-pink-700">한 해</strong>의 운세를 나타내며, 매년 변화하는 기운을 보여줍니다.
                    대운의 큰 흐름 속에서 한 해 한 해의 세밀한 변화를 확인할 수 있습니다.
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                  <p className="font-semibold text-orange-900 mb-2">🗓️ 월운(月運)</p>
                  <p className="text-sm md:text-base">
                    <strong className="text-orange-700">매월</strong>의 기운과 흐름을 나타냅니다.
                    세운보다 더 짧은 주기로 변화하는 운의 흐름을 파악할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 대운 흐름 표시 */}
        <div className="mt-6 p-4 md:p-6 glass-card animate-fade-in">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
            대운의 흐름{" "}
            <span className="text-base font-medium text-gray-500">
              (한국 나이 기준)
            </span>
            <span className="block text-sm font-normal text-gray-500 mt-1">
              현재 나이: {koreanAge}세 | 대운 방향:{" "}
              {sajuData.daewoon === "sunhaeng" ? "순행" : "역행"}
            </span>
          </h3>
          <div className="overflow-x-auto pb-3 custom-scrollbar">
            <div className="flex flex-row justify-start md:justify-center">
              <div className="inline-flex gap-2">
                {sajuData.daewoonPillars.map((p) => renderDaewoonPillar(p))}
              </div>
            </div>
          </div>
        </div>

        {/* 세운 흐름 표시 */}
        <div className="mt-6 p-4 md:p-6 glass-card animate-fade-in">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
            세운의 흐름{" "}
            <span className="text-base font-medium text-gray-500">
              (최근 10년)
            </span>
            <span className="block text-sm font-normal text-gray-500 mt-1">
              현재: {currentYear}년
            </span>
          </h3>
          <div className="overflow-x-auto pb-3 custom-scrollbar">
            <div className="flex flex-row justify-start md:justify-center">
              <div className="inline-flex gap-2">
                {sewoonPillars.map((p) => renderSewoonPillar(p))}
              </div>
            </div>
          </div>
        </div>

        {/* 2026년 월운 보기 버튼 */}
        {!showWolwoon && (
          <div className="mt-8 flex justify-center animate-fade-in">
            <button
              onClick={() => setShowWolwoon(true)}
              className="flex items-center gap-3 py-4 px-8 bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <span className="text-2xl">📅</span>
              <span className="text-lg">2026년 병오년 월운 보기</span>
              <ChevronDownIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* 2026년 월운 표시 */}
        {showWolwoon && (
          <div className="mt-8 p-4 md:p-6 glass-card animate-fade-in">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              2026년 병오년 월운의 흐름
              <span className="block text-sm font-normal text-gray-500 mt-1">
                (입춘 기준, 인월부터 축월까지)
              </span>
            </h3>
            <div className="overflow-x-auto pb-3 custom-scrollbar">
              <div className="flex flex-row justify-start md:justify-center">
                <div className="inline-flex gap-2">
                  {wolwoonPillars.map((p) => renderWolwoonPillar(p))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2026년 월별 달력 보기 버튼 */}
        {showWolwoon && (
          <div className="mt-8 flex justify-center animate-fade-in">
            <button
              onClick={() => {
                localStorage.setItem('calendarSajuData', JSON.stringify(sajuData));
                navigate('/calendar', { state: { sajuData } });
              }}
              className="flex items-center gap-3 py-4 px-8 bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white font-bold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <span className="text-2xl">🗓️</span>
              <span className="text-lg">사주 캘린더 보기</span>
              <ChevronDownIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DaewoonPage;
