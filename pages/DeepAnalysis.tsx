import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SajuInfo, Ohaeng, Pillar } from '../types';
import { GyeokgukDisplay } from '../components/GyeokgukDisplay';
import OhaengForceDisplay from '../yongsin/OhaengForceDisplay';
import { earthlyBranchGanInfo } from '../utils/manse';
import { sibsinDescriptions } from '../utils/sibsinDescriptions';
import { sibsinPositionDescriptions } from '../utils/sibsinPositionDescriptions';
import { unseongDescriptions } from '../utils/unseongDescriptions';
import { ChevronDownIcon } from '../components/icons';

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

// CharBox 컴포넌트
const CharBox: React.FC<{ char: string }> = ({ char }) => {
  const ganInfo = earthlyBranchGanInfo[char];
  if (!ganInfo) return null;
  const color = ohaengColorMap[ganInfo.ohaeng];

  return (
    <div
      className={`inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 text-2xl font-bold rounded shadow-md ${
        color.bg
      } ${color.text} ${color.border ?? ""} saju-char-outline-small`}
    >
      {char}
    </div>
  );
};

// 십신 설명에서 [성격] 이전 부분만 추출하는 함수
const getSibsinDescriptionBeforePersonality = (description: string): string => {
  const personalityIndex = description.indexOf("[성격]");
  if (personalityIndex === -1) return description;
  return description.substring(0, personalityIndex).trim();
};

// 월령 분석 컴포넌트
const SibsinPositionDisplay: React.FC<{ sajuInfo: SajuInfo }> = ({
  sajuInfo,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const { pillars } = sajuInfo;

  // 월령(월주 지지)의 십신
  const wollyeongSibsin = pillars.month.jiJi.sibsin.name; // 월령 십신
  const wollyeongChar = pillars.month.jiJi.char; // 월령 글자
  const wollyeongUnseong = pillars.month.jiJi.unseong; // 월주 십이운성

  return (
    <div className="mt-8 glass-card">
      <button
        type="button"
        className="w-full p-4 md:p-6 text-left flex justify-between items-center bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 rounded-2xl border-2 border-purple-200 relative z-10"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full shadow-lg">
            <span className="text-2xl">📋</span>
          </div>
          <h4 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">
            월령(月令) - 운명을 지휘하는{" "}
            <span className="text-red-600 font-bold">사령관</span>
          </h4>
        </div>
        <ChevronDownIcon
          className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="p-4 md:p-6 pt-0 animate-fade-in-fast">
          <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 rounded-2xl border-2 border-purple-200 shadow-lg">
            <div className="text-center">
              <div className="bg-white/80 p-6 rounded-xl border-2 border-purple-200 shadow-lg">
                <div className="space-y-4 text-lg font-normal leading-relaxed text-gray-700">
                  <p>
                    <strong className="text-purple-700 font-bold">
                      월령(月令)
                    </strong>
                    은 사주 8글자 중에서 가장 강력한 권한을 가진 자리이자,
                    운명의 사령탑입니다.
                  </p>
                  <p>
                    내가 세상에 나올 때{" "}
                    <strong className="text-purple-600 font-semibold">
                      자연으로부터 부여받은 '특명'
                    </strong>
                    과 같습니다.
                    <p>
                      봄의 생명력(木), 여름의 열정(火), 가을의 결실(金), 겨울의
                      지혜(水) 중 어떤 계절의 힘을 주무기로 삼아야 하는지를
                      결정합니다.
                    </p>
                  </p>
                  <div className="mt-4 space-y-2">
                    <p>
                      <strong className="text-purple-700 font-bold">
                        운명의 뿌리:
                      </strong>{" "}
                      나의 사회적 성공, 직업, 부귀빈천을 결정짓는{" "}
                      <strong className="text-purple-600 font-semibold">
                        '격국(格局)'
                      </strong>
                      이 바로 이곳에서 탄생합니다.
                    </p>
                    <p>
                      <strong className="text-purple-700 font-bold">
                        환경의 지배자:
                      </strong>{" "}
                      내가 평생을 살아가며 활동해야 할 무대의 성격을 규정합니다.
                    </p>
                  </div>
                  <p className="mt-4 font-semibold text-purple-800">
                    월령을 장악했다는 것은, 내 인생의 주도권을 쥐고 세상의
                    흐름을 내 편으로 만들 준비가 되었음을 의미합니다.
                  </p>
                </div>
              </div>

              {!showInfo && (
                <div className="mt-6 animate-fade-in">
                  <button
                    type="button"
                    onClick={() => setShowInfo(true)}
                    className="btn-primary flex items-center gap-3 py-4 px-8 rounded-full shadow-xl transition-all duration-300 mx-auto bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 animate-rainbow-glow"
                  >
                    <span className="text-2xl">🌟</span>
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                    <span className="text-xl font-bold">월령 십신 보기</span>
                    <span className="text-2xl">🌟</span>
                    <ChevronDownIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {showInfo && (
              <div className="mt-8 pt-8 border-t-2 border-purple-300 animate-fade-in-fast">
                <div className="text-center mb-8">
                  <div className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold mb-2">
                    핵심 십신 분석
                  </div>
                  <h3 className="text-3xl font-extrabold text-gray-800">
                    월령(月令) - 계절의 기운이 만든 나의 운명
                  </h3>
                  <p className="text-gray-600 mt-2 text-lg">
                    월령은 태어난 달의 계절 기운으로, 나의 직업운과 사회적
                    성공을 결정합니다. 봄의 따뜻함, 여름의 열정, 가을의 차분함,
                    겨울의 침착함이 각각 다른 기운을 만들어냅니다.
                  </p>
                </div>

                <div className="space-y-10">
                  {/* 월령 십신 */}
                  <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6 rounded-2xl border-2 border-blue-300 shadow-lg">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold text-sm">
                          월령 (月令)
                        </div>
                        <h4 className="text-3xl font-bold text-blue-900">
                          {wollyeongSibsin}
                        </h4>
                        <CharBox char={wollyeongChar} />
                      </div>
                    </div>

                    {/* 십신 기본 정보 - 숨김 */}
                    {sibsinDescriptions[wollyeongSibsin] && (
                      <div className="hidden bg-white/80 p-5 rounded-xl mb-5 border border-blue-200">
                        <h5 className="font-bold text-blue-800 mb-3 flex items-center gap-2 text-xl">
                          <span>📘</span>{" "}
                          {sibsinDescriptions[wollyeongSibsin].title}
                        </h5>
                        <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line word-keep-all">
                          {getSibsinDescriptionBeforePersonality(
                            sibsinDescriptions[wollyeongSibsin].description
                          )}
                        </p>
                      </div>
                    )}

                    {/* 월주 위치별 해석 */}
                    {sibsinPositionDescriptions[wollyeongSibsin] && (
                      <div className="bg-gradient-to-r from-blue-100/50 to-white p-5 rounded-xl border border-blue-300 mb-5">
                        <h5 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-xl">
                          <span>🎯</span> 월주에 위치한 의미
                        </h5>
                        <div className="space-y-3">
                          <div>
                            <p className="font-bold text-blue-800 text-lg mb-2">
                              {
                                sibsinPositionDescriptions[wollyeongSibsin][
                                  "월주"
                                ].meaning
                              }
                            </p>
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {sibsinPositionDescriptions[wollyeongSibsin][
                                "월주"
                              ].keywords.map((kw, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-blue-200 text-blue-900 rounded-full text-xs font-semibold"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-lg font-normal leading-relaxed text-gray-700 whitespace-pre-line word-keep-all bg-white/70 p-4 rounded-lg">
                            {
                              sibsinPositionDescriptions[wollyeongSibsin][
                                "월주"
                              ].detail
                            }
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 월주 십이운성 정보 */}
                    {unseongDescriptions[wollyeongUnseong.name] && (
                      <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-6 rounded-xl border-2 border-amber-200">
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-amber-200">
                          <div className="bg-amber-500 text-white px-3 py-1.5 rounded-lg font-bold text-sm">
                            십이운성 (十二運星)
                          </div>
                          <h4 className="text-2xl font-bold text-amber-900">
                            {wollyeongUnseong.name} ({wollyeongUnseong.hanja})
                          </h4>
                        </div>

                        <div className="bg-white/80 p-4 rounded-lg border border-amber-200 mb-4">
                          <h5 className="font-bold text-amber-800 mb-2 flex items-center gap-2 text-xl">
                            <span>⭐</span>{" "}
                            {unseongDescriptions[wollyeongUnseong.name].title}
                          </h5>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {unseongDescriptions[
                              wollyeongUnseong.name
                            ].keywords.map((kw, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full text-xs font-semibold"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                          <p className="text-lg font-normal leading-relaxed text-gray-700 whitespace-pre-line word-keep-all">
                            {
                              unseongDescriptions[wollyeongUnseong.name]
                                .description
                            }
                          </p>
                        </div>

                        {/* 월지 십이운성 정보 */}
                        {unseongDescriptions[wollyeongUnseong.name].월지 && (
                          <div className="bg-gradient-to-r from-blue-100/50 to-amber-100/50 p-5 rounded-xl border border-blue-300">
                            <h5 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-xl">
                              <span>🌙</span>{" "}
                              {
                                unseongDescriptions[wollyeongUnseong.name].월지
                                  .title
                              }
                            </h5>
                            <p className="text-lg font-normal leading-relaxed text-gray-700 whitespace-pre-line word-keep-all bg-white/70 p-4 rounded-lg">
                              {
                                unseongDescriptions[wollyeongUnseong.name].월지
                                  .description
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const DeepAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [sajuData, setSajuData] = useState<SajuInfo | null>(null);

  useEffect(() => {
    // localStorage에서 사주 데이터 불러오기
    const savedData = localStorage.getItem('deepAnalysisSajuData');
    if (savedData) {
      setSajuData(JSON.parse(savedData));
    } else {
      // 데이터가 없으면 입력 페이지로 리다이렉트
      navigate('/input');
    }
  }, [navigate]);

  if (!sajuData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 page-fade-in">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">사주 데이터를 불러오는 중...</h2>
          <p className="text-gray-600 text-lg">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  const renderPillar = (pillar: Pillar, isEmpty: boolean = false, isMonthPillar: boolean = false) => {
    if (isEmpty) {
      return (
        <div className="flex flex-col text-center text-base md:text-lg">
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
      <div className="flex flex-col text-center text-base md:text-lg">
        <div className="font-bold text-gray-700 py-2.5">
          {pillar.label}
          <span className="font-normal text-gray-400">({pillar.ganji})</span>
        </div>

        <div className="py-2 h-14 flex items-center justify-center border-t border-gray-200">
          <span className={`font-semibold text-lg saju-text-outline ${pillar.cheonGan.sibsin.name === "일간" ? "text-amber-600" : "text-gray-700"}`}>
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

        <div className="py-2 h-14 flex items-center justify-center font-semibold text-gray-700 text-lg saju-text-outline">
          {pillar.jiJi.sibsin.name}
        </div>

        <div className="py-2 flex-grow bg-black/5 border-t border-b border-gray-200 flex flex-col justify-center min-h-[110px]">
          <div className="font-semibold text-sm text-gray-400 mb-1 saju-text-outline">지장간(支藏干)</div>
          {pillar.jiJi.jijanggan.map((j, index) => (
            <div key={index} className="text-gray-700 text-lg my-1 saju-text-outline">
              {j.char} <span className="text-gray-500 font-medium text-base">{j.sibsin.name}</span>
            </div>
          ))}
        </div>

        <div className="py-2 font-semibold text-gray-700 text-lg saju-text-outline">
          {pillar.jiJi.unseong.name}
          <span className="text-gray-400 text-sm ml-1 font-normal">({pillar.jiJi.unseong.hanja})</span>
        </div>
      </div>
    );
  };

  const isHourUnknown = sajuData.pillars.hour.cheonGan.char === "-" || sajuData.pillars.hour.jiJi.char === "-";
  const pillarOrder: (keyof SajuInfo["pillars"])[] = ["hour", "day", "month", "year"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 py-8 px-4 page-transition">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate("/result")}
            className="mb-4 text-purple-600 hover:text-purple-800 font-semibold text-lg"
          >
            ← 돌아가기
          </button>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-2">
            심층 사주 분석
          </h1>
          <p className="text-gray-600 text-lg">오행 가중치·신강신약·용신 기반 정밀 분석</p>
        </div>

        {/* 사주 원국 정보 */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-5 text-center">사주 원국 정보</h2>
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

        {/* 월령(月令) 분석 */}
        <SibsinPositionDisplay sajuInfo={sajuData} />

        {/* 격국(格局) 분석 */}
        <GyeokgukDisplay sajuInfo={sajuData} />

        {/* 오행 가중치 분석 및 신강신약 판단 */}
        <OhaengForceDisplay
          sajuInfo={sajuData}
          isHourUnknown={isHourUnknown}
        />

        {/* 용신 추출 (개발 예정) */}
        <div className="glass-card p-6 text-center mt-8">
          <h3 className="text-3xl font-bold text-gray-800 mb-4">🚧 용신 추출 기능</h3>
          <p className="text-gray-600 text-lg mb-4">
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

export default DeepAnalysis;
