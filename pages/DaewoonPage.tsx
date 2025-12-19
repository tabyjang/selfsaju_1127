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
        className="flex flex-col text-center text-xs md:text-sm p-1.5 bg-gray-900/5 rounded-lg border-2 border-gray-200 w-full max-w-[90px] lg:max-w-[105px] shadow-md"
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

        {/* 대운 상세 설명 */}
        <div className="mb-8 space-y-6">
          {/* 대운의 본질 */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 md:p-8 rounded-xl border-2 border-indigo-200 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                1
              </div>
              <h4 className="text-2xl md:text-3xl font-bold text-indigo-900">대운의 본질</h4>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p className="bg-white/70 p-5 rounded-lg text-base md:text-lg">
                <strong className="text-indigo-800">대운(大運)</strong>은 단순히 '운이 좋다'는 의미가 아니라,
                한 사람의 인생에서 <strong className="text-indigo-700">10년 주기</strong>로 변화하는 환경과 계절을 의미합니다.
              </p>
              <div className="bg-indigo-100/50 p-5 rounded-lg border-l-4 border-indigo-400">
                <p className="font-semibold text-indigo-900 mb-2 text-base md:text-lg">💡 비유로 이해하기</p>
                <p className="text-base md:text-lg">
                  원국(사주팔자)이 <strong>자동차</strong>라는 하드웨어라면,
                  대운은 그 자동차가 달리는 <strong>도로의 상태나 날씨</strong>와 같습니다.
                </p>
              </div>
              <div className="bg-white/70 p-5 rounded-lg">
                <p className="font-semibold text-indigo-800 mb-2 text-base md:text-lg">📍 월주(月柱)의 확장</p>
                <p className="text-base md:text-lg">
                  대운은 태어난 달의 기운인 <strong>월주</strong>에서 시작됩니다.
                  사주에서 월지는 내가 태어난 계절의 환경을 결정하므로,
                  대운은 <strong className="text-indigo-700">"내가 살아가는 계절이 어떻게 흘러가는가"</strong>를 보는 것입니다.
                </p>
              </div>
              <div className="bg-white/70 p-5 rounded-lg">
                <p className="font-semibold text-indigo-800 mb-2 text-base md:text-lg">🔄 방합(方合)의 흐름</p>
                <p className="text-base md:text-lg">
                  대운은 계절의 흐름(봄→여름→가을→겨울)을 따르고, 역행은 그 반대의 흐름을 따릅니다.
                  <strong className="text-indigo-700">30년 단위</strong>로 계절(木-火-金-水)이 크게 바뀌는데,
                  이를 <strong>'방운'</strong>이라고 하며 <strong className="text-red-600">인생의 큰 변곡점</strong>이 됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* 대운에서 중요한 요소 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 md:p-8 rounded-xl border-2 border-purple-200 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                2
              </div>
              <h4 className="text-2xl md:text-3xl font-bold text-purple-900">대운 분석의 핵심 요소</h4>
            </div>
            <div className="space-y-4">
              {/* 지지가 우선 */}
              <div className="bg-white/70 p-5 rounded-lg border-l-4 border-purple-400">
                <div className="flex items-start gap-3">
                  <span className="text-3xl flex-shrink-0">①</span>
                  <div className="flex-1">
                    <p className="font-bold text-purple-900 text-xl md:text-2xl mb-3">천간보다 '지지(地支)'가 우선</p>
                    <p className="text-base md:text-lg text-gray-700 mb-3">
                      많은 술사님들께서 강조하시듯, 대운은 <strong className="text-purple-700">지지를 7~8할로</strong> 봅니다.
                    </p>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-base md:text-lg mb-2"><strong>이유:</strong></p>
                      <p className="text-base md:text-lg text-gray-700">
                        천간은 명분이나 생각, 외부로 드러나는 현상을 의미하지만,
                        <strong className="text-purple-700">지지는 실제 내가 발 딛고 있는 환경, 현실적인 기반, 계절의 온도</strong>를 결정하기 때문입니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 접목운 */}
              <div className="bg-white/70 p-5 rounded-lg border-l-4 border-red-400">
                <div className="flex items-start gap-3">
                  <span className="text-3xl flex-shrink-0">②</span>
                  <div className="flex-1">
                    <p className="font-bold text-red-900 text-xl md:text-2xl mb-3">접목운(接木運): 계절이 바뀌는 시기</p>
                    <p className="text-base md:text-lg text-gray-700 mb-3">
                      대운 분석에서 <strong className="text-red-600">가장 위험하면서도 중요한 시기</strong>가 바로 접목운입니다.
                    </p>
                    <div className="bg-red-50 p-4 rounded-lg mb-3">
                      <p className="text-base md:text-lg font-semibold text-red-900 mb-1">환절기 대운:
                      <p className="text-base md:text-lg text-gray-700">
                        진(辰), 미(未), 술(戌), 축(丑) 대운이 끝날 때</p><br/>
                        "접목운에서 가장 무서운 것은 익숙함과의 결별입니다."
                      </p>
                    </div>
                    <p className="text-base md:text-lg text-gray-700">
                      30년 주기로 환경이 완전히 뒤바뀌기 때문에, 이때
                      <strong className="text-red-600"> 직업 변경, 거주지 이동, 건강 악화, 가치관의 대전환</strong> 등
                      인생의 큰 풍파나 변화가 찾아오는 경우가 많습니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 형충회합 */}
              <div className="bg-white/70 p-5 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-start gap-3">
                  <span className="text-3xl flex-shrink-0">③</span>
                  <div className="flex-1">
                    <p className="font-bold text-blue-900 text-xl md:text-2xl mb-3">원국과의 형·충·회·합 (刑·沖·會·合)</p>
                    <p className="text-base md:text-lg text-gray-700 mb-3">
                      대운의 글자가 내 사주 원국과 어떤 상호작용을 하는지 살펴야 합니다.
                    </p>
                    <div className="space-y-2">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-base md:text-lg">
                          <strong className="text-blue-800">합(合):</strong> 새로운 환경과의 결합, 협력, 합거에 따른 변화
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-base md:text-lg">
                          <strong className="text-blue-800">충(沖):</strong> 기존 환경의 파괴, 이동, 분리, 충돌을 통한 역동적인 변화
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 조후 */}
              <div className="bg-white/70 p-5 rounded-lg border-l-4 border-amber-400">
                <div className="flex items-start gap-3">
                  <span className="text-3xl flex-shrink-0">④</span>
                  <div className="flex-1">
                    <p className="font-bold text-amber-900 text-xl md:text-2xl mb-3">조후(調喉)의 해결</p>
                    <p className="text-base md:text-lg text-gray-700 mb-3">
                      사주가 너무 차갑거나(냉습), 너무 뜨겁다면(조열),
                      대운에서 이를 해결해 주는 글자가 올 때 비로소 <strong className="text-amber-700">삶이 안정</strong>을 찾습니다.
                    </p>
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <p className="text-base md:text-lg text-gray-700">
                        격국(사회적 성취)이 좋아도 <strong className="text-amber-700">조후(심리적·환경적 편안함)</strong>가 맞지 않으면
                        본인은 매우 고통스러울 수 있습니다. 대운은 이 조후를 해결해 주는 가장 강력한 수단입니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 대운을 보는 관점 */}
          <div className="bg-gradient-to-r from-rose-50 to-orange-50 p-6 md:p-8 rounded-xl border-2 border-rose-200 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                3
              </div>
              <h4 className="text-2xl md:text-3xl font-bold text-rose-900">대운을 보는 올바른 관점</h4>
            </div>
            <div className="space-y-4">
              <div className="bg-white/70 p-5 rounded-lg text-center">
                <p className="text-xl md:text-2xl font-bold text-rose-800 mb-5">
                  "원국이 불변의 명(命)이라면,<br/>대운은 가변의 운(運)이다."
                </p>
                <div className="text-left space-y-3 text-gray-700">
                  <p className="bg-rose-50 p-5 rounded-lg text-base md:text-lg">
                    아무리 좋은 사주라도 <strong className="text-rose-700">대운이 험난하면 능력을 발휘하기 어렵고</strong>,
                    사주 원국이 조금 부족해도 <strong className="text-rose-700">대운이 돕는다면 큰 성취를 이룰 수 있습니다</strong>.
                  </p>
                  <div className="bg-gradient-to-r from-rose-100 to-orange-100 p-5 rounded-lg border-l-4 border-rose-400">
                    <p className="font-semibold text-rose-900 mb-3 text-base md:text-lg">📌 핵심 원리</p>
                    <p className="text-base md:text-lg">
                      <strong className="text-rose-700">대운은 '성패'를 결정</strong>하고,
                      <strong className="text-orange-700">세운(1년 운)은 '득실'을 결정</strong>한다는 말이 있습니다.
                    </p>
                    <p className="mt-3 text-base md:text-lg">
                      즉, <strong className="text-rose-700">10년이라는 큰 흐름 속에서 내가 나아가야 할지, 멈춰야 할지</strong>를
                      결정하는 것이 대운 분석의 핵심입니다.
                    </p>
                  </div>
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
            {/* 그리드 레이아웃으로 모든 월운을 한눈에 표시 */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 md:gap-2.5 lg:gap-2 justify-items-center max-w-[1600px] mx-auto">
              {wolwoonPillars.map((p) => renderWolwoonPillar(p))}
            </div>
          </div>
        )}

        {/* 대시보드로 가기 버튼 */}
        {showWolwoon && (
          <div className="mt-8 flex justify-center animate-fade-in">
            <button
              onClick={() => {
                navigate('/dashboard');
              }}
              className="flex items-center gap-3 py-4 px-8 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <span className="text-2xl">🏠</span>
              <span className="text-lg">대시보드로 가기</span>
              <ChevronDownIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DaewoonPage;
