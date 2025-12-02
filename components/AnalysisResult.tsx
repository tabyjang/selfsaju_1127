import React, { useMemo, useState } from "react";
import type {
  SajuInfo,
  Pillar,
  Ohaeng,
  DaewoonPillar,
  SewoonPillar,
  SajuAnalysisResult,
} from "../types";
import { getSewoonPillars, earthlyBranchGanInfo } from "../utils/manse";
import { cheonEulGwiInMap } from "../utils/sinsal";
import { ilganDescriptions } from "../utils/ilganDescriptions";
import { iljuDescriptions } from "../utils/iljuDescriptions";
import { sibsinDescriptions } from "../utils/sibsinDescriptions";
import { sibsinPositionDescriptions } from "../utils/sibsinPositionDescriptions";
import { InteractionsDisplay } from "./InteractionsDisplay";
import { SinsalDisplay } from "./SinsalDisplay";
import {
  DiagnosisIcon,
  PrescriptionIcon,
  PrognosisIcon,
  SparklesIcon,
  UserIcon,
  ChevronDownIcon,
  HomeIcon,
} from "./icons";

interface AnalysisResultProps {
  result: SajuAnalysisResult | null;
  sajuData: SajuInfo;
  isLoading: boolean;
  sajuImage: string | null;
  isImageLoading: boolean;
  imageError: string | null;
}

const ohaengColorMap: Record<
  Ohaeng,
  { bg: string; text: string; border?: string }
> = {
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

const ohaengKoreanMap: Record<string, Ohaeng> = {
  木: "wood",
  火: "fire",
  土: "earth",
  金: "metal",
  水: "water",
};

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

const OhaengDisplayItem: React.FC<{ char: string; count: number }> = ({
  char,
  count,
}) => {
  const ohaeng = ohaengKoreanMap[char];
  if (!ohaeng) return null;
  const color = ohaengColorMap[ohaeng];

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 text-2xl font-bold rounded shadow-md ${
          color.bg
        } ${color.text} ${color.border ?? ""} saju-char-outline-small`}
      >
        {char}
      </div>
      <span className="text-gray-700 font-semibold text-lg">{count}</span>
    </div>
  );
};

const SajuInfoSummary: React.FC<{ sajuInfo: SajuInfo }> = ({ sajuInfo }) => {
  const { pillars } = sajuInfo;
  const ilgan = pillars.day.cheonGan.char;
  const cheonEulGwiInCharsArray = cheonEulGwiInMap[ilgan] || [];

  const ohaengCounts = useMemo(() => {
    const counts: Record<Ohaeng, number> = {
      wood: 0,
      fire: 0,
      earth: 0,
      metal: 0,
      water: 0,
    };
    Object.values(pillars).forEach((pillar: Pillar) => {
      counts[pillar.cheonGan.ohaeng]++;
      counts[pillar.jiJi.ohaeng]++;
    });
    return counts;
  }, [pillars]);

  const wollyeong = pillars.month.jiJi.char;

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 text-center text-lg font-bold">
      <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-1">
          <strong className="text-gray-500 font-bold">오행:</strong>
        </div>
        <OhaengDisplayItem char="木" count={ohaengCounts.wood} />
        <OhaengDisplayItem char="火" count={ohaengCounts.fire} />
        <OhaengDisplayItem char="土" count={ohaengCounts.earth} />
        <OhaengDisplayItem char="金" count={ohaengCounts.metal} />
        <OhaengDisplayItem char="水" count={ohaengCounts.water} />
        <span className="text-gray-300 hidden md:inline">|</span>
        <div className="flex items-center gap-2">
          <strong className="text-gray-500 font-bold">월령:</strong>
          <CharBox char={wollyeong} />
        </div>
        <span className="text-gray-300 hidden md:inline">|</span>
        <div className="flex items-center gap-2">
          <strong className="text-gray-500 font-bold">천을귀인:</strong>
          {cheonEulGwiInCharsArray.length > 0 ? (
            <div className="flex items-center gap-1.5">
              {cheonEulGwiInCharsArray.map((char) => (
                <CharBox key={char} char={char} />
              ))}
            </div>
          ) : (
            <span className="text-gray-700 font-semibold text-base">없음</span>
          )}
        </div>
      </div>
    </div>
  );
};

const SajuPillarsDisplay: React.FC<{ sajuInfo: SajuInfo }> = ({ sajuInfo }) => {
  const pillarOrder: (keyof SajuInfo["pillars"])[] = [
    "hour",
    "day",
    "month",
    "year",
  ];

  const renderPillar = (pillar: Pillar) => {
    const ganColor = ohaengColorMap[pillar.cheonGan.ohaeng];
    const jiColor = ohaengColorMap[pillar.jiJi.ohaeng];

    return (
      <div
        key={pillar.label}
        className="flex flex-col text-center text-sm md:text-base"
      >
        <div className="font-bold text-gray-700 py-2.5">
          {pillar.label}
          <span className="font-normal text-gray-400">({pillar.ganji})</span>
        </div>

        <div className="py-2 h-14 flex items-center justify-center border-t border-gray-200">
          <span
            className={`font-semibold text-base saju-text-outline ${
              pillar.cheonGan.sibsin.name === "일간"
                ? "text-amber-600"
                : "text-gray-700"
            }`}
          >
            {pillar.cheonGan.sibsin.name === "일간"
              ? "일간(日干)"
              : pillar.cheonGan.sibsin.name}
          </span>
        </div>

        <div className="flex justify-center py-1.5 px-2">
          <div
            className={`saju-char-outline w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-4xl md:text-5xl font-bold rounded-lg shadow-lg ${
              ganColor.bg
            } ${ganColor.text} ${ganColor.border ?? ""}`}
          >
            {pillar.cheonGan.char}
          </div>
        </div>

        <div className="flex justify-center py-1.5 px-2">
          <div
            className={`saju-char-outline w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-4xl md:text-5xl font-bold rounded-lg shadow-lg ${
              jiColor.bg
            } ${jiColor.text} ${jiColor.border ?? ""}`}
          >
            {pillar.jiJi.char}
          </div>
        </div>

        <div className="py-2 h-14 flex items-center justify-center font-semibold text-gray-700 text-base saju-text-outline">
          {pillar.jiJi.sibsin.name}
        </div>

        <div className="py-2 flex-grow bg-black/5 border-t border-b border-gray-200 flex flex-col justify-center min-h-[110px]">
          <div className="font-semibold text-xs text-gray-400 mb-1 saju-text-outline">
            지장간(支藏干)
          </div>
          {pillar.jiJi.jijanggan.map((j, index) => (
            <div
              key={index}
              className="text-gray-700 text-base my-1 saju-text-outline"
            >
              {j.char}{" "}
              <span className="text-gray-500 font-medium text-sm">
                {j.sibsin.name}
              </span>
            </div>
          ))}
        </div>

        <div className="py-2 font-semibold text-gray-700 saju-text-outline">
          {pillar.jiJi.unseong.name}
          <span className="text-gray-400 text-xs ml-1 font-normal">
            ({pillar.jiJi.unseong.hanja})
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-1 md:p-2 glass-card">
      <div className="grid grid-cols-4 divide-x divide-gray-200">
        {pillarOrder.map((key) => renderPillar(sajuInfo.pillars[key]))}
      </div>
    </div>
  );
};

const DaewoonDisplay: React.FC<{ sajuInfo: SajuInfo; onShowDaewoon: (show: boolean) => void }> = ({ sajuInfo, onShowDaewoon }) => {
  const [typedText, setTypedText] = useState("");
  const [showButton, setShowButton] = useState(false);

  const fullText = "인생을 10년 단위로 나누어 각 시기의 흐름과 방향성을 보여주는 운명의 큰 물결입니다. 대운의 변화는 인생의 전환점이 되며, 각 시기마다 다른 기운이 작용합니다.";

  React.useEffect(() => {
    let index = 0;
    let isMounted = true;

    const typingInterval = setInterval(() => {
      if (!isMounted) {
        clearInterval(typingInterval);
        return;
      }

      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(typingInterval);
        setShowButton(true);
      }
    }, 50); // 50ms마다 한 글자씩

    return () => {
      isMounted = false;
      clearInterval(typingInterval);
    };
  }, [fullText]);

  return (
    <div className="mt-8">
      {/* 대운 설명 섹션 */}
      <div className="p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 rounded-2xl border-2 border-purple-200 shadow-lg animate-fade-in glass-card">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mb-4 animate-pulse shadow-lg">
            <span className="text-4xl">🌊</span>
          </div>
          <h4 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-5">
            대운(大運)이란?
          </h4>
          <div className="min-h-[120px] flex items-center justify-center">
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-medium max-w-3xl mx-auto">
              {typedText}
              {typedText.length < fullText.length && (
                <span className="inline-block w-0.5 h-6 bg-purple-600 ml-1 animate-pulse"></span>
              )}
            </p>
          </div>

          {showButton && (
            <div className="mt-6 animate-fade-in">
              <button
                onClick={() => onShowDaewoon(true)}
                className="btn-primary flex items-center gap-3 py-4 px-8 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 mx-auto"
              >
                <span className="text-4xl">🌊</span>
                <span className="text-lg font-bold">대운·세운의 흐름 보기</span>
                <ChevronDownIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DaewoonFlowDisplay: React.FC<{ sajuInfo: SajuInfo }> = ({ sajuInfo }) => {
  const { daewoonPillars, daewoon, birthDate } = sajuInfo;
  const currentYear = new Date().getFullYear();
  const koreanAge = currentYear - birthDate.year + 1;

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

  return (
    <div className="mt-6 p-4 md:p-6 glass-card animate-fade-in">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        대운의 흐름{" "}
        <span className="text-base font-medium text-gray-500">
          (한국 나이 기준)
        </span>
        <span className="block text-sm font-normal text-gray-500 mt-1">
          현재 나이: {koreanAge}세 | 대운 방향:{" "}
          {daewoon === "sunhaeng" ? "순행" : "역행"}
        </span>
      </h3>
      <div className="overflow-x-auto pb-3 custom-scrollbar">
        <div className="flex flex-row justify-start md:justify-center">
          <div className="inline-flex flex-row-reverse gap-2">
            {daewoonPillars.map((p) => renderDaewoonPillar(p))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SewoonDisplay: React.FC<{ sajuInfo: SajuInfo }> = ({ sajuInfo }) => {
  const currentYear = new Date().getFullYear();
  const ilGan = sajuInfo.pillars.day.cheonGan.char;
  const sewoonPillars = useMemo(
    () => getSewoonPillars(currentYear, 10, ilGan),
    [currentYear, ilGan]
  );

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

  return (
    <div className="mt-8 p-4 md:p-6 glass-card">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        세운의 흐름 (앞으로 10년)
      </h3>
      <div className="overflow-x-auto pb-3 custom-scrollbar">
        <div className="flex flex-row justify-start md:justify-center">
          <div className="inline-flex flex-row-reverse gap-2">
            {sewoonPillars.map((p) => renderSewoonPillar(p))}
          </div>
        </div>
      </div>
    </div>
  );
};

const IlganPersonalityDisplay: React.FC<{ ilganChar: string }> = ({
  ilganChar,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const data = ilganDescriptions[ilganChar];

  // 일간 오행 정보 가져오기
  const ganInfo = earthlyBranchGanInfo[ilganChar];
  // 오행 색상 적용 (없을 경우 기본값)
  const ganColor = ganInfo
    ? ohaengColorMap[ganInfo.ohaeng]
    : {
        bg: "bg-white",
        text: "text-gray-900",
        border: "border border-gray-200",
      };

  if (!data) return null;

  return (
    <div className="mt-10 flex flex-col items-center animate-fade-in">
      {!showInfo ? (
        <button
          onClick={() => setShowInfo(true)}
          className="btn-primary flex items-center gap-3 py-4 px-8 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <UserIcon className="w-6 h-6" />
          <span className="text-lg font-bold">일간(나)의 성격 확인하기</span>
        </button>
      ) : (
        <div className="glass-card p-6 md:p-8 w-full max-w-3xl border-t-4 border-yellow-400 animate-fade-in-fast">
          <div className="text-center mb-6">
            <div className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold mb-2">
              나를 나타내는 글자 (일간)
            </div>
            <h3 className="text-3xl font-extrabold text-gray-800 flex items-center justify-center gap-3">
              {/* 오행 색상 적용된 박스 */}
              <div
                className={`saju-char-outline w-12 h-12 flex items-center justify-center text-3xl rounded shadow-sm ${
                  ganColor.bg
                } ${ganColor.text} ${ganColor.border ?? ""}`}
              >
                {data.char}
              </div>
              <span>{data.name}</span>
            </h3>
            <p className="text-lg text-gray-600 mt-2 font-medium">
              "{data.nature}"
            </p>
          </div>

          <div className="mb-6 bg-white/50 p-4 rounded-xl border border-gray-100">
            <h4 className="text-xl font-bold text-center text-amber-600 mb-3">
              "{data.title}"
            </h4>
            <p className="text-gray-700 leading-relaxed text-center word-keep-all">
              {data.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h5 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> 장점
              </h5>
              <ul className="space-y-1">
                {data.pros.map((item, idx) => (
                  <li key={idx} className="text-gray-700 text-sm">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <h5 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> 단점
              </h5>
              <ul className="space-y-1">
                {data.cons.map((item, idx) => (
                  <li key={idx} className="text-gray-700 text-sm">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-center">
            <h5 className="font-bold text-yellow-800 mb-2">💡 족집게 조언</h5>
            <p className="text-gray-800 font-medium word-keep-all">
              {data.advice}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const IljuAnalysisDisplay: React.FC<{ iljuGanji: string }> = ({
  iljuGanji,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const data = iljuDescriptions[iljuGanji];

  if (!data) return null;

  const [gan, ji] = data.ganji.split("");

  const ganInfo = earthlyBranchGanInfo[gan];
  const jiInfo = earthlyBranchGanInfo[ji];

  const ganColor = ganInfo
    ? ohaengColorMap[ganInfo.ohaeng]
    : { bg: "bg-gray-200", text: "text-gray-800", border: "border-gray-300" };
  const jiColor = jiInfo
    ? ohaengColorMap[jiInfo.ohaeng]
    : { bg: "bg-gray-200", text: "text-gray-800", border: "border-gray-300" };

  return (
    <div className="mt-10 flex flex-col items-center animate-fade-in">
      <div className="text-center mb-6">
        <p className="text-gray-500 text-sm">나와 배우자, 나의 영역</p>
        <h3 className="text-xl font-bold text-gray-800 mt-1">일주 (日柱)</h3>
      </div>

      {!showInfo ? (
        <button
          onClick={() => setShowInfo(true)}
          className="btn-primary flex items-center gap-3 py-4 px-8 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 bg-emerald-400 hover:bg-emerald-500 text-white focus:ring-emerald-400/50"
          style={{ backgroundColor: "#10b981", color: "white" }}
        >
          <HomeIcon className="w-6 h-6" />
          <span className="text-lg font-bold">일주(나와 배우자) 분석 보기</span>
        </button>
      ) : (
        <div className="glass-card p-6 md:p-8 w-full max-w-3xl border-t-4 border-emerald-400 animate-fade-in-fast">
          <div className="text-center mb-6">
            <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold mb-2">
              나의 일주 (Day Pillar)
            </div>
            <h3 className="text-3xl font-extrabold text-gray-800 flex items-center justify-center gap-3">
              <div className="flex gap-1">
                <div
                  className={`saju-char-outline w-10 h-10 flex items-center justify-center text-2xl rounded shadow-sm ${
                    ganColor.bg
                  } ${ganColor.text} ${ganColor.border ?? ""}`}
                >
                  {gan}
                </div>
                <div
                  className={`saju-char-outline w-10 h-10 flex items-center justify-center text-2xl rounded shadow-sm ${
                    jiColor.bg
                  } ${jiColor.text} ${jiColor.border ?? ""}`}
                >
                  {ji}
                </div>
              </div>
              <span>{data.name}</span>
            </h3>
            <p className="text-lg text-gray-600 mt-2 font-medium">
              "{data.nature}"
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white/60 p-5 rounded-xl border border-gray-200">
              <h4 className="text-lg font-bold text-emerald-700 mb-2 flex items-center gap-2">
                💎 핵심 특징
              </h4>
              <p className="text-gray-700 leading-relaxed word-keep-all">
                {data.characteristic}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-pink-50 p-5 rounded-xl border border-pink-100">
                <h4 className="text-lg font-bold text-pink-600 mb-2 flex items-center gap-2">
                  ❤️ 배우자운
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed word-keep-all">
                  {data.spouse}
                </p>
              </div>
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <h4 className="text-lg font-bold text-blue-600 mb-2 flex items-center gap-2">
                  💼 직업 & 재물
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed word-keep-all">
                  {data.jobWealth}
                </p>
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center">
              <h5 className="font-bold text-emerald-800 mb-2">
                🍀 족집게 조언
              </h5>
              <p className="text-gray-800 font-medium word-keep-all">
                {data.advice}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SibsinPositionDisplay: React.FC<{ sajuInfo: SajuInfo }> = ({
  sajuInfo,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const { pillars } = sajuInfo;

  // 월령(월주 지지)과 일지(일주 지지)의 십신
  const wollyeongSibsin = pillars.month.jiJi.sibsin.name; // 월령 십신
  const iljiSibsin = pillars.day.jiJi.sibsin.name; // 일지 십신
  const wollyeongChar = pillars.month.jiJi.char; // 월령 글자
  const iljiChar = pillars.day.jiJi.char; // 일지 글자

  return (
    <div className="mt-10 flex flex-col items-center animate-fade-in">
      <div className="text-center mb-6">
        <p className="text-gray-500 text-sm">사주에서 가장 중요한 두 가지</p>
        <h3 className="text-xl font-bold text-gray-800 mt-1">
          월령과 일지 십신
        </h3>
      </div>

      {!showInfo ? (
        <button
          onClick={() => setShowInfo(true)}
          className="btn-primary flex items-center gap-3 py-4 px-8 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 bg-purple-500 hover:bg-purple-600 text-white focus:ring-purple-400/50"
        >
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
          <span className="text-lg font-bold">월령과 일지 십신 보기</span>
        </button>
      ) : (
        <div className="glass-card p-6 md:p-8 w-full max-w-4xl border-t-4 border-purple-400 animate-fade-in-fast">
          <div className="text-center mb-8">
            <div className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold mb-2">
              핵심 십신 분석
            </div>
            <h3 className="text-2xl font-extrabold text-gray-800">
              월령과 일지 - 사주의 양대 산맥
            </h3>
            <p className="text-gray-600 mt-2">
              월령은 직업과 사회생활을, 일지는 배우자와 가정을 나타냅니다
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
                  <h4 className="text-2xl font-bold text-blue-900">
                    {wollyeongSibsin}
                  </h4>
                  <CharBox char={wollyeongChar} />
                </div>
                <div className="text-sm text-blue-700 font-medium bg-blue-100 px-3 py-1 rounded-full">
                  직업·사회생활 (20~40세)
                </div>
              </div>

              {/* 십신 기본 정보 */}
              {sibsinDescriptions[wollyeongSibsin] && (
                <div className="bg-white/80 p-5 rounded-xl mb-5 border border-blue-200">
                  <h5 className="font-bold text-blue-800 mb-3 flex items-center gap-2 text-lg">
                    <span>📘</span> {sibsinDescriptions[wollyeongSibsin].title}
                  </h5>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {sibsinDescriptions[wollyeongSibsin].keywords.map(
                      (kw, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          #{kw}
                        </span>
                      )
                    )}
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line word-keep-all">
                    {sibsinDescriptions[wollyeongSibsin].description}
                  </p>
                </div>
              )}

              {/* 월주 위치별 해석 */}
              {sibsinPositionDescriptions[wollyeongSibsin] && (
                <div className="bg-gradient-to-r from-blue-100/50 to-white p-5 rounded-xl border border-blue-300">
                  <h5 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-lg">
                    <span>🎯</span> 월주에 위치한 의미
                  </h5>
                  <div className="space-y-3">
                    <div>
                      <p className="font-bold text-blue-800 text-base mb-2">
                        {
                          sibsinPositionDescriptions[wollyeongSibsin]["월주"]
                            .meaning
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
                    <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line word-keep-all bg-white/70 p-4 rounded-lg">
                      {
                        sibsinPositionDescriptions[wollyeongSibsin]["월주"]
                          .detail
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 일지 십신 */}
            <div className="bg-gradient-to-br from-pink-50 via-white to-pink-50 p-6 rounded-2xl border-2 border-pink-300 shadow-lg">
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-pink-200">
                <div className="flex items-center gap-3">
                  <div className="bg-pink-500 text-white px-3 py-1.5 rounded-lg font-bold text-sm">
                    일지 (日支)
                  </div>
                  <h4 className="text-2xl font-bold text-pink-900">
                    {iljiSibsin}
                  </h4>
                  <CharBox char={iljiChar} />
                </div>
                <div className="text-sm text-pink-700 font-medium bg-pink-100 px-3 py-1 rounded-full">
                  배우자·가정 (40~60세)
                </div>
              </div>

              {/* 십신 기본 정보 */}
              {sibsinDescriptions[iljiSibsin] && (
                <div className="bg-white/80 p-5 rounded-xl mb-5 border border-pink-200">
                  <h5 className="font-bold text-pink-800 mb-3 flex items-center gap-2 text-lg">
                    <span>📕</span> {sibsinDescriptions[iljiSibsin].title}
                  </h5>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {sibsinDescriptions[iljiSibsin].keywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line word-keep-all">
                    {sibsinDescriptions[iljiSibsin].description}
                  </p>
                </div>
              )}

              {/* 일주 위치별 해석 */}
              {sibsinPositionDescriptions[iljiSibsin] && (
                <div className="bg-gradient-to-r from-pink-100/50 to-white p-5 rounded-xl border border-pink-300">
                  <h5 className="font-bold text-pink-900 mb-3 flex items-center gap-2 text-lg">
                    <span>🎯</span> 일주에 위치한 의미
                  </h5>
                  <div className="space-y-3">
                    <div>
                      <p className="font-bold text-pink-800 text-base mb-2">
                        {sibsinPositionDescriptions[iljiSibsin]["일주"].meaning}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {sibsinPositionDescriptions[iljiSibsin][
                          "일주"
                        ].keywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-pink-200 text-pink-900 rounded-full text-xs font-semibold"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line word-keep-all bg-white/70 p-4 rounded-lg">
                      {sibsinPositionDescriptions[iljiSibsin]["일주"].detail}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 p-5 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 text-center">
            <p className="text-purple-900 font-bold text-base mb-2">
              💡 왜 월령과 일지가 중요한가?
            </p>
            <p className="text-purple-800 text-sm leading-relaxed">
              <strong>월령(月令)</strong>은 사회적 성공과 직업운을,{" "}
              <strong>일지(日支)</strong>는 배우자와의 관계 및 가정의 행복을
              결정짓는 핵심 요소입니다. 이 두 가지를 이해하면 인생의 큰 그림을
              볼 수 있습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const renderResult = (text: string) => {
  if (!text) return null;

  const lines = text.split("\n").filter((line) => line.trim() !== "");

  return lines.map((line, index) => {
    line = line.trim();

    if (line.startsWith("## ")) {
      return (
        <h2
          key={index}
          className="text-3xl font-bold mt-8 mb-4 pb-2 border-b-2 border-gray-200"
        >
          {line.replace("## ", "")}
        </h2>
      );
    }
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <h4
          key={index}
          className="text-xl font-semibold mt-6 mb-2 text-amber-600"
        >
          {line.replace(/\*\*/g, "")}
        </h4>
      );
    }

    const renderedLine = line.split("**").map((part, i) =>
      i % 2 === 1 ? (
        <strong key={i} className="font-bold text-gray-800">
          {part}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );

    return (
      <p key={index} className="my-3 text-base leading-relaxed">
        {renderedLine}
      </p>
    );
  });
};

const SajuImageDisplay: React.FC<{
  image: string | null;
  isLoading: boolean;
  error: string | null;
}> = ({ image, isLoading, error }) => {
  if (!isLoading && !image && !error) return null;

  return (
    <div className="my-10 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        사주 심상 (四柱 心象): 시각화
      </h2>
      <div className="glass-card p-4 md:p-6 flex items-center justify-center min-h-[300px] aspect-square max-w-lg mx-auto">
        {isLoading && (
          <div className="w-full h-full flex flex-col items-center justify-center text-center">
            <div className="animate-pulse flex flex-col items-center justify-center">
              <SparklesIcon className="w-16 h-16 text-yellow-400/50 mb-4" />
              <div className="h-6 bg-gray-300 rounded w-48"></div>
            </div>
            <p className="text-gray-500 mt-4">
              일주를 상징하는 이미지를 생성 중입니다...
            </p>
          </div>
        )}
        {error && (
          <div className="text-center p-4">
            <p className="font-bold text-lg text-red-600">이미지 생성 오류</p>
            <p className="text-red-700 mt-2">{error}</p>
          </div>
        )}
        {image && !isLoading && (
          <img
            src={image}
            alt="사주 심상 이미지"
            className="rounded-lg shadow-2xl object-cover w-full h-full"
          />
        )}
      </div>
    </div>
  );
};

const AnalysisCardPlaceholder: React.FC = () => (
  <div className="glass-card p-6 md:p-8 overflow-hidden relative border border-gray-200">
    <div className="flex items-start gap-5 animate-pulse">
      <div className="flex-shrink-0 w-12 h-12 bg-gray-300 rounded-lg"></div>
      <div className="flex-grow">
        <div className="h-7 bg-gray-300 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  </div>
);

export const AnalysisResult: React.FC<AnalysisResultProps> = ({
  result,
  sajuData,
  isLoading,
  sajuImage,
  isImageLoading,
  imageError,
}) => {
  const { birthDate, gender, daewoon, daewoonNumber, birthRegion } = sajuData;
  const ilganChar = sajuData.pillars.day.cheonGan.char;
  const iljuGanji = sajuData.pillars.day.ganji; // e.g., "甲子"
  const [showAiDetails, setShowAiDetails] = useState(false);
  const [showDaewoon, setShowDaewoon] = useState(false);

  const stageInfo = useMemo(
    () =>
      result
        ? [
            {
              id: "stage1",
              title: "1단계: 오행과 일간의 강약",
              content: result.stage1,
              Icon: DiagnosisIcon,
              borderColor: "border-blue-200",
            },
            {
              id: "stage2",
              title: "2단계: 용신과 개운법",
              content: result.stage2,
              Icon: PrescriptionIcon,
              borderColor: "border-emerald-200",
            },
            {
              id: "stage3",
              title: "3단계: 대운의 흐름 분석",
              content: result.stage3,
              Icon: PrognosisIcon,
              borderColor: "border-amber-200",
            },
          ]
        : [],
    [result]
  );

  const birthDateString = `${birthDate.year}년 ${birthDate.month}월 ${
    birthDate.day
  }일 ${String(birthDate.hour).padStart(2, "0")}:${String(
    birthDate.minute
  ).padStart(2, "0")}`;

  return (
    <div className="mt-10 animate-fade-in">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-5 text-center">
          사주 원국 정보
        </h2>

        <div className="mb-8 p-4 md:p-6 glass-card">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-2">
              <div className="text-gray-500 text-sm mb-1">성별</div>
              <div className="font-semibold text-gray-800 text-lg">
                {gender === "male" ? "남성" : "여성"}
              </div>
            </div>
            <div className="p-2">
              <div className="text-gray-500 text-sm mb-1">대운 방향</div>
              <div className="font-semibold text-gray-800 text-lg">
                {daewoon === "sunhaeng" ? "순행" : "역행"}
              </div>
            </div>
            <div className="p-2">
              <div className="text-gray-500 text-sm mb-1">대운수</div>
              <div className="font-semibold text-gray-800 text-lg">
                {daewoonNumber}세
              </div>
            </div>
            <div className="p-2">
              <div className="text-gray-500 text-sm mb-1">출생 지역</div>
              <div className="font-semibold text-gray-800 text-lg">
                {birthRegion}
              </div>
            </div>
            <div className="col-span-2 sm:col-span-4 p-2 mt-4 border-t border-gray-200">
              <div className="text-gray-500 text-sm mb-1">생년월일 (양력)</div>
              <div className="font-semibold text-gray-800 text-lg">
                {birthDateString}
              </div>
            </div>
          </div>
        </div>

        <div className="p-1 md:p-2 glass-card">
          <SajuPillarsDisplay sajuInfo={sajuData} />
          <SajuInfoSummary sajuInfo={sajuData} />
        </div>

        <InteractionsDisplay sajuInfo={sajuData} />
        <SinsalDisplay sajuInfo={sajuData} />

        <DaewoonDisplay sajuInfo={sajuData} onShowDaewoon={setShowDaewoon} />

        {showDaewoon && (
          <>
            <DaewoonFlowDisplay sajuInfo={sajuData} />
            <SewoonDisplay sajuInfo={sajuData} />
          </>
        )}

        {/* 일간 성격 확인 섹션 (세운 아래에 배치) */}
        <IlganPersonalityDisplay ilganChar={ilganChar} />

        {/* 일주 분석 섹션 (일간 아래에 배치) */}
        <IljuAnalysisDisplay iljuGanji={iljuGanji} />

        {/* 십신 위치별 해석 섹션 (일주 아래에 배치) */}
        <SibsinPositionDisplay sajuInfo={sajuData} />

        {/*  상세 분석 결과 토글 버튼 */}
        {result && !showAiDetails && (
          <div className="mt-12 flex justify-center animate-fade-in">
            <button
              onClick={() => setShowAiDetails(true)}
              className="btn-primary flex items-center gap-3 py-4 px-8 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 group"
            >
              <SparklesIcon className="w-6 h-6 group-hover:animate-pulse" />
              <span className="text-lg font-bold">
                {" "}
                심층 분석 결과 전체 보기
              </span>
              <ChevronDownIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {showAiDetails && (isLoading || result) && (
        <div className="animate-fade-in">
          <div className="mt-12 border-t-2 border-gray-100 pt-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              사주 분석 상세 결과
            </h2>
            <div className="space-y-8">
              {isLoading && !result ? (
                <>
                  <AnalysisCardPlaceholder />
                  <AnalysisCardPlaceholder />
                  <AnalysisCardPlaceholder />
                </>
              ) : (
                stageInfo.map(
                  (stage) =>
                    stage.content && (
                      <div
                        key={stage.id}
                        className={`glass-card p-6 md:p-8 overflow-hidden relative border ${stage.borderColor}`}
                      >
                        <div className="flex items-start gap-5">
                          <div className="flex-shrink-0 w-12 h-12 bg-gray-100/50 rounded-lg flex items-center justify-center border border-gray-200">
                            <stage.Icon className="w-7 h-7 text-gray-600" />
                          </div>
                          <div className="flex-grow">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                              {stage.title}
                            </h3>
                            <div className="prose max-w-none prose-lg text-gray-600">
                              {renderResult(stage.content)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                )
              )}
            </div>
          </div>

          <SajuImageDisplay
            image={sajuImage}
            isLoading={isImageLoading}
            error={imageError}
          />
        </div>
      )}
    </div>
  );
};
