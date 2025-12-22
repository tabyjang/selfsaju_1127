import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  SajuInfo,
  Pillar,
  Ohaeng,
  SajuAnalysisResult,
} from "../types";
import {
  earthlyBranchGanInfo,
} from "../utils/manse";
import { cheonEulGwiInMap } from "../utils/sinsal";
import { ilganDescriptions } from "../utils/ilganDescriptions";
import { sibsinDescriptions } from "../utils/sibsinDescriptions";
import { unseongDescriptions } from "../utils/unseongDescriptions";
import { loadIljuBundle } from "../utils/ilju/loadIljuBundle";
import type { IljuBundle } from "../utils/ilju/types";
import { InteractionsDisplay } from "./InteractionsDisplay";
import { SinsalDisplay } from "./SinsalDisplay";
import { MonthlyIljuCalendar } from "./MonthlyIljuCalendar";
import { SaveSajuButton } from "./SaveSajuButton";
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
  onLoginRequired?: () => void;
}

export const ohaengColorMap: Record<
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

export const SajuInfoSummary: React.FC<{ sajuInfo: SajuInfo }> = ({ sajuInfo }) => {
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
    // 시주가 없을 경우(시간 모름) 시주를 제외하고 계산
    const isHourUnknown =
      pillars.hour.cheonGan.char === "-" || pillars.hour.jiJi.char === "-";

    Object.entries(pillars).forEach(([key, pillar]: [string, Pillar]) => {
      // 시주가 없으면 제외
      if (key === "hour" && isHourUnknown) {
        return;
      }
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

export const SajuPillarsDisplay: React.FC<{ sajuInfo: SajuInfo }> = ({ sajuInfo }) => {
  // 시주가 없을 경우(시간 모름) 확인
  const isHourUnknown =
    sajuInfo.pillars.hour.cheonGan.char === "-" ||
    sajuInfo.pillars.hour.jiJi.char === "-";
  const pillarOrder: (keyof SajuInfo["pillars"])[] = [
    "hour",
    "day",
    "month",
    "year",
  ];

  const renderPillar = (pillar: Pillar, isEmpty: boolean = false) => {
    // 빈 칸인 경우
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
            <div className="font-semibold text-xs text-gray-400 mb-1">
              지장간(支藏干)
            </div>
            <div className="text-gray-400 text-sm">-</div>
          </div>
          <div className="py-2 font-semibold text-gray-400">-</div>
        </div>
      );
    }
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

        <div className="flex justify-center items-center py-1.5 px-2 h-24 md:h-28">
          <div
            className={`saju-char-outline flex items-center justify-center font-bold rounded-lg ${
              pillar.cheonGan.sibsin.name === "일간"
                ? "w-20 h-20 md:w-24 md:h-24 text-5xl md:text-6xl animate-heartbeat border-4 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)]"
                : "w-16 h-16 md:w-20 md:h-20 text-4xl md:text-5xl shadow-lg"
            } ${ganColor.bg} ${ganColor.text} ${pillar.cheonGan.sibsin.name === "일간" ? "" : ganColor.border ?? ""}`}
          >
            {pillar.cheonGan.char}
          </div>
        </div>

        <div className="flex justify-center items-center py-1.5 px-2 h-24 md:h-28">
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
        {pillarOrder.map((key) => {
          if (key === "hour" && isHourUnknown) {
            return (
              <React.Fragment key="hour-empty">
                {renderPillar(sajuInfo.pillars[key], true)}
              </React.Fragment>
            );
          }
          return (
            <React.Fragment key={key}>
              {renderPillar(sajuInfo.pillars[key], false)}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// 오행 다이어그램 컴포넌트
const OhaengDiagram: React.FC<{
  ohaengCounts: Record<Ohaeng, number>;
  ilganOhaeng: Ohaeng | undefined;
}> = ({ ohaengCounts, ilganOhaeng }) => {
  // 오행 실제 색상 값 (SVG용)
  const ohaengColors: Record<Ohaeng, string> = {
    wood: "#00B050", // 녹색
    fire: "#FF0000", // 빨간색
    earth: "#FEC100", // 노란색
    metal: "#cbd5e1", // slate-200
    water: "#000000", // 검은색
  };

  // 오행 숫자에 따른 원 크기 계산 함수
  const getCircleRadius = (count: number): number => {
    const baseRadius = 6; // 기준 크기 (숫자 1)
    if (count === 0) {
      return baseRadius * 0.5; // 절반 크기 (원 크기는 그대로)
    } else if (count === 1) {
      return baseRadius; // 기준 크기
    } else if (count === 2) {
      return baseRadius * 1.4; // 1.4배
    } else if (count === 3) {
      return baseRadius * 1.8; // 1.8배
    } else {
      return baseRadius * 2.2; // 2.2배 (4 이상)
    }
  };

  // 오행 숫자에 따른 폰트 크기 계산
  const getFontSize = (count: number): string => {
    if (count === 0) {
      return "5px"; // 글씨만 더 작게
    } else if (count === 1) {
      return "8px"; // 그대로 유지
    } else if (count === 2) {
      return "10px"; // 1.4배에 맞춰 조정
    } else if (count === 3) {
      return "12px"; // 1.8배에 맞춰 조정
    } else {
      return "14px"; // 2.2배에 맞춰 조정 (4 이상)
    }
  };

  // 오행 위치 (오각형 배치) - 더 넓은 간격으로 조정
  const centerX = 50;
  const centerY = 50;
  const radius = 35; // 반지름 증가

  // 기본 오행 순서: 목(0) → 화(1) → 토(2) → 금(3) → 수(4)
  const ohaengOrder: Ohaeng[] = ["wood", "fire", "earth", "metal", "water"];
  const ohaengKoreans: Record<Ohaeng, string> = {
    wood: "목",
    fire: "화",
    earth: "토",
    metal: "금",
    water: "수",
  };

  // 일간 오행에 따라 회전할 인덱스 계산
  const getRotationIndex = (): number => {
    if (!ilganOhaeng) return 0;
    const index = ohaengOrder.indexOf(ilganOhaeng);
    return index >= 0 ? index : 0;
  };

  const rotationIndex = getRotationIndex();

  // 회전된 오행 순서 생성 (일간 오행이 상단에 오도록)
  const rotatedOhaengOrder = [
    ...ohaengOrder.slice(rotationIndex),
    ...ohaengOrder.slice(0, rotationIndex),
  ];

  // 일간 오행에 따른 십신 매핑 (상생 순서: 비겁→식상→재성→관성→인성)
  const getSibsinName = (ohaeng: Ohaeng): string => {
    if (!ilganOhaeng) return "";
    const ilganIndex = ohaengOrder.indexOf(ilganOhaeng);
    const targetIndex = ohaengOrder.indexOf(ohaeng);
    if (ilganIndex < 0 || targetIndex < 0) return "";

    // 회전된 순서에서의 인덱스
    const rotatedIndex = (targetIndex - ilganIndex + 5) % 5;

    const sibsinNames = ["일간/비겁", "식상", "재성", "관성", "인성"];
    return sibsinNames[rotatedIndex];
  };

  // 오각형 위치 계산 (5개 위치)
  const basePositions = [
    { x: centerX, y: centerY - radius }, // 상단 (0)
    {
      x: centerX + radius * 0.951,
      y: centerY - radius * 0.309,
    }, // 우상단 (1)
    {
      x: centerX + radius * 0.588,
      y: centerY + radius * 0.809,
    }, // 우하단 (2)
    {
      x: centerX - radius * 0.588,
      y: centerY + radius * 0.809,
    }, // 좌하단 (3)
    {
      x: centerX - radius * 0.951,
      y: centerY - radius * 0.309,
    }, // 좌상단 (4)
  ];

  // 회전된 순서에 따라 오행 위치 매핑
  const ohaengPositions: Array<{
    ohaeng: Ohaeng;
    korean: string;
    x: number;
    y: number;
  }> = rotatedOhaengOrder.map((ohaeng, idx) => ({
    ohaeng,
    korean: ohaengKoreans[ohaeng],
    x: basePositions[idx].x,
    y: basePositions[idx].y,
  }));

  // 상생 관계 (외곽 오각형): 회전된 순서에 맞춰 조정
  // 기본: 0→1→2→3→4→0 (목→화→토→금→수→목)
  const sangsaengPaths = [
    { from: 0, to: 1 }, // 첫번째→두번째
    { from: 1, to: 2 }, // 두번째→세번째
    { from: 2, to: 3 }, // 세번째→네번째
    { from: 3, to: 4 }, // 네번째→다섯번째
    { from: 4, to: 0 }, // 다섯번째→첫번째
  ];

  // 상극 관계 (내부 별): 회전된 순서에 맞춰 조정
  // 기본: 0→2, 1→3, 2→4, 3→0, 4→1
  const sanggeukPaths = [
    { from: 0, to: 2 }, // 첫번째→세번째
    { from: 1, to: 3 }, // 두번째→네번째
    { from: 2, to: 4 }, // 세번째→다섯번째
    { from: 3, to: 0 }, // 네번째→첫번째
    { from: 4, to: 1 }, // 다섯번째→두번째
  ];

  // 선 두께 조정 (더 얇게)
  const sangsaengStrokeWidth = 0.8; // 더 얇게
  const sanggeukStrokeWidth = 0.7; // 더 얇게
  const borderColor = "#1f2937"; // gray-800 색상
  const borderWidth = 0.8; // 테두리 두께 (더 얇게)

  return (
    <div className="w-full max-w-md mx-auto" style={{ marginTop: "16px" }}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-auto"
        style={{ maxHeight: "400px" }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker
            id="arrowhead-sangsaeng"
            markerWidth="6"
            markerHeight="6"
            refX="5.5"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon points="0 0, 6 3, 0 6" fill="#000" />
          </marker>
          <marker
            id="arrowhead-sanggeuk"
            markerWidth="5"
            markerHeight="5"
            refX="4.5"
            refY="2.5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon points="0 0, 5 2.5, 0 5" fill="#666" />
          </marker>
        </defs>

        {/* 상생 관계 (외곽 오각형) - 얇은 실선 */}
        {sangsaengPaths.map((path, idx) => {
          const from = ohaengPositions[path.from];
          const to = ohaengPositions[path.to];
          // 원의 가장자리에서 시작하도록 조정 (각 원의 크기에 맞춰)
          const fromRadius = getCircleRadius(ohaengCounts[from.ohaeng]);
          const toRadius = getCircleRadius(ohaengCounts[to.ohaeng]);
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const offsetXFrom = (dx / dist) * fromRadius;
          const offsetYFrom = (dy / dist) * fromRadius;
          const offsetXTo = (dx / dist) * toRadius;
          const offsetYTo = (dy / dist) * toRadius;

          return (
            <line
              key={`sangsaeng-${idx}`}
              x1={from.x + offsetXFrom}
              y1={from.y + offsetYFrom}
              x2={to.x - offsetXTo}
              y2={to.y - offsetYTo}
              stroke="#000"
              strokeWidth={sangsaengStrokeWidth}
              markerEnd="url(#arrowhead-sangsaeng)"
            />
          );
        })}

        {/* 상극 관계 (내부 별) - 얇은 점선 */}
        {sanggeukPaths.map((path, idx) => {
          const from = ohaengPositions[path.from];
          const to = ohaengPositions[path.to];
          // 원의 가장자리에서 시작하도록 조정 (각 원의 크기에 맞춰)
          const fromRadius = getCircleRadius(ohaengCounts[from.ohaeng]);
          const toRadius = getCircleRadius(ohaengCounts[to.ohaeng]);
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const offsetXFrom = (dx / dist) * fromRadius;
          const offsetYFrom = (dy / dist) * fromRadius;
          const offsetXTo = (dx / dist) * toRadius;
          const offsetYTo = (dy / dist) * toRadius;

          return (
            <line
              key={`sanggeuk-${idx}`}
              x1={from.x + offsetXFrom}
              y1={from.y + offsetYFrom}
              x2={to.x - offsetXTo}
              y2={to.y - offsetYTo}
              stroke="#666"
              strokeWidth={sanggeukStrokeWidth}
              strokeDasharray="2,2"
              markerEnd="url(#arrowhead-sanggeuk)"
            />
          );
        })}

        {/* 오행 원들 - 사주 원국과 동일한 스타일, 숫자에 따라 크기 조정 */}
        {ohaengPositions.map((pos, idx) => {
          const color = ohaengColors[pos.ohaeng];
          const count = ohaengCounts[pos.ohaeng];
          const radius = getCircleRadius(count);
          const fontSize = getFontSize(count);
          const sibsinName = getSibsinName(pos.ohaeng);

          // 원의 위치에서 십신 텍스트 위치 계산 (오른쪽으로 돌아가면서)
          // 각 위치에 맞는 오프셋 계산
          const textOffsets = [
            { x: 0, y: -radius - 18 }, // 상단: 위쪽 (일간/비겁용, 3줄 공간 확보)
            { x: radius + 4, y: -radius * 0.5 }, // 우상단: 오른쪽, 위쪽으로, 안쪽으로
            { x: radius + 8, y: radius * 0.8 }, // 우하단: 오른쪽
            { x: -radius - 8, y: radius * 0.8 }, // 좌하단: 왼쪽
            { x: -radius - 4, y: -radius * 0.5 }, // 좌상단: 왼쪽, 위쪽으로, 안쪽으로
          ];

          const textOffset = textOffsets[idx];
          const isIlgan = idx === 0; // 첫 번째 원이 일간/비겁

          // 모든 오행은 흰색 텍스트 사용 (사주 원국과 동일)
          return (
            <g key={pos.ohaeng}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={radius}
                fill={color}
                stroke={borderColor}
                strokeWidth={borderWidth}
              />
              <text
                x={pos.x}
                y={pos.y + 0.5}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ffffff"
                style={{
                  fontSize: fontSize,
                  fontWeight: "bold",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                {pos.korean}
              </text>
              {/* 십신 이름 표시 (일간/비겁은 제외) */}
              {!isIlgan && (
                <text
                  x={pos.x + textOffset.x}
                  y={pos.y + textOffset.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#333"
                  style={{
                    fontSize: "6px",
                    fontWeight: "semibold",
                    fontFamily: "Arial, sans-serif",
                  }}
                >
                  {sibsinName}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="mt-4 text-center">
        <h5 className="text-base font-bold text-gray-800">
          오행 상생·상극 관계
        </h5>
      </div>
    </div>
  );
};

// 강약 판단 함수
const getStrengthLevel = (count: number): "부족" | "적정" | "과다" => {
  if (count === 0) return "부족";
  if (count >= 1 && count <= 2) return "적정";
  return "과다"; // 3 이상
};

// 상위 3개 오행 선택 함수
const getTopThreeOhaeng = (
  ohaengCounts: Record<Ohaeng, number>,
  ilganOhaeng?: Ohaeng,
  wollyeongOhaeng?: Ohaeng
): Ohaeng[] => {
  const entries = Object.entries(ohaengCounts) as [Ohaeng, number][];
  const selected: Ohaeng[] = [];

  // 1순위: 과다한 것들 (3개 이상)
  const 과다 = entries.filter(([, c]) => c >= 3);

  if (과다.length > 0) {
    // 과다한 것들을 개수 순으로 정렬
    const sorted과다 = 과다.sort(([, a], [, b]) => b - a);

    // 일간이 과다하면 일간 선택
    if (ilganOhaeng && 과다.some(([o]) => o === ilganOhaeng)) {
      selected.push(ilganOhaeng);

      // 일간이 가장 강하지 않으면, 가장 강한 것도 추가
      if (sorted과다[0][0] !== ilganOhaeng && selected.length < 3) {
        selected.push(sorted과다[0][0]);
      }

      // 두 번째로 강한 것도 추가 (3개까지)
      if (
        sorted과다.length > 1 &&
        sorted과다[1][0] !== ilganOhaeng &&
        selected.length < 3
      ) {
        if (!selected.includes(sorted과다[1][0])) {
          selected.push(sorted과다[1][0]);
        }
      }
    }
    // 월령이 과다하면 월령 선택 (일간이 과다하지 않을 때)
    else if (wollyeongOhaeng && 과다.some(([o]) => o === wollyeongOhaeng)) {
      selected.push(wollyeongOhaeng);

      // 월령이 가장 강하지 않으면, 가장 강한 것도 추가
      if (sorted과다[0][0] !== wollyeongOhaeng && selected.length < 3) {
        selected.push(sorted과다[0][0]);
      }

      // 두 번째로 강한 것도 추가 (3개까지)
      if (
        sorted과다.length > 1 &&
        sorted과다[1][0] !== wollyeongOhaeng &&
        selected.length < 3
      ) {
        if (!selected.includes(sorted과다[1][0])) {
          selected.push(sorted과다[1][0]);
        }
      }
    }
    // 둘 다 과다하면 둘 다 선택
    else if (
      과다.length >= 2 &&
      ilganOhaeng &&
      wollyeongOhaeng &&
      과다.some(([o]) => o === ilganOhaeng) &&
      과다.some(([o]) => o === wollyeongOhaeng)
    ) {
      selected.push(ilganOhaeng);
      selected.push(wollyeongOhaeng);

      // 가장 강한 것도 추가 (3개까지)
      if (
        sorted과다[0][0] !== ilganOhaeng &&
        sorted과다[0][0] !== wollyeongOhaeng &&
        selected.length < 3
      ) {
        selected.push(sorted과다[0][0]);
      }
    }
    // 그 외에는 가장 강한 과다한 것들 선택 (최대 3개)
    else {
      selected.push(...sorted과다.slice(0, 3).map(([o]) => o));
    }
  }

  // 2순위: 부족한 것 (0개)
  const 부족 = entries.filter(([, c]) => c === 0);
  if (부족.length > 0 && selected.length < 3) {
    // 부족한 것들을 모두 추가 (최대 3개까지)
    for (const [ohaeng] of 부족) {
      if (selected.length >= 3) break;
      if (!selected.includes(ohaeng)) {
        selected.push(ohaeng);
      }
    }
  }

  // 3순위: 적정 범위 중 선택
  if (selected.length < 3) {
    const 적정 = entries
      .filter(([o, c]) => c >= 1 && c <= 2 && !selected.includes(o))
      .sort(([o1, a], [o2, b]) => {
        // 일간 우선
        if (ilganOhaeng && o1 === ilganOhaeng) return -1;
        if (ilganOhaeng && o2 === ilganOhaeng) return 1;
        // 월령 우선
        if (wollyeongOhaeng && o1 === wollyeongOhaeng) return -1;
        if (wollyeongOhaeng && o2 === wollyeongOhaeng) return 1;
        // 적은 것부터
        return a - b;
      });

    for (const [ohaeng] of 적정) {
      if (selected.length >= 3) break;
      selected.push(ohaeng);
    }
  }

  // 4순위: 그래도 부족하면 가장 많은 것
  if (selected.length < 3) {
    const sorted = entries
      .filter(([o]) => !selected.includes(o))
      .sort(([, a], [, b]) => b - a);
    for (const [ohaeng] of sorted) {
      if (selected.length >= 3) break;
      selected.push(ohaeng);
    }
  }

  return selected.slice(0, 3);
};

const OhaengEnergyDisplay: React.FC<{
  ilganChar: string;
  sajuInfo: SajuInfo;
}> = ({ ilganChar, sajuInfo }) => {
  const [isOpen, setIsOpen] = useState(true);
  const ganInfo = earthlyBranchGanInfo[ilganChar];
  const ilganOhaeng = ganInfo?.ohaeng;
  const { pillars } = sajuInfo;

  // 월령 오행 가져오기
  const wollyeongOhaeng = pillars.month.jiJi.ohaeng;

  // 오행 숫자 계산 (사주 원국과 동일한 로직)
  const ohaengCounts = useMemo(() => {
    const counts: Record<Ohaeng, number> = {
      wood: 0,
      fire: 0,
      earth: 0,
      metal: 0,
      water: 0,
    };
    // 시주가 없을 경우(시간 모름) 시주를 제외하고 계산
    const isHourUnknown =
      pillars.hour.cheonGan.char === "-" || pillars.hour.jiJi.char === "-";

    Object.entries(pillars).forEach(([key, pillar]: [string, Pillar]) => {
      // 시주가 없으면 제외
      if (key === "hour" && isHourUnknown) {
        return;
      }
      counts[pillar.cheonGan.ohaeng]++;
      counts[pillar.jiJi.ohaeng]++;
    });
    return counts;
  }, [pillars]);

  // 오행 한글명과 설명
  const ohaengInfo: Record<
    Ohaeng,
    { name: string; korean: string; description: string; emoji: string }
  > = {
    wood: {
      name: "wood",
      korean: "木 (목)",
      description: "성장과 발전의 기운",
      emoji: "🌳",
    },
    fire: {
      name: "fire",
      korean: "火 (화)",
      description: "열정과 활동의 기운",
      emoji: "🔥",
    },
    earth: {
      name: "earth",
      korean: "土 (토)",
      description: "안정과 수렴의 기운",
      emoji: "⛰️",
    },
    metal: {
      name: "metal",
      korean: "金 (금)",
      description: "정리와 완성의 기운",
      emoji: "⚙️",
    },
    water: {
      name: "water",
      korean: "水 (수)",
      description: "유동과 지혜의 기운",
      emoji: "💧",
    },
  };

  // 오행 강약 설명 템플릿
  const ohaengStrengthDescriptions: Record<
    Ohaeng,
    Record<"부족" | "적정" | "과다", string>
  > = {
    wood: {
      부족: "목 기운이 부족하여 성장과 발전의 동력이 약합니다. 새로운 도전과 학습을 통해 보완하세요. 인내심을 갖고 꾸준히 노력하면 목 기운을 키울 수 있습니다.",
      적정: "목 기운이 적절하여 성장과 발전의 기운이 균형잡혀 있습니다. 새로운 기회를 잘 포착하고 발전시킬 수 있는 좋은 상태입니다.",
      과다: "목 기운이 강하여 성장과 발전의 기운이 넘칩니다. 때로는 성급하거나 경쟁심이 과할 수 있습니다. 차분함과 여유를 갖는 것이 중요합니다.",
    },
    fire: {
      부족: "화 기운이 부족하여 열정과 활동력이 약합니다. 적극적인 행동과 도전 정신을 키우세요. 작은 목표부터 시작하여 성취감을 느끼며 동력을 얻을 수 있습니다.",
      적정: "화 기운이 적절하여 열정과 활동의 기운이 균형잡혀 있습니다. 적절한 열정으로 목표를 향해 꾸준히 나아갈 수 있는 좋은 기운입니다.",
      과다: "화 기운이 강하여 열정과 활동력이 넘칩니다. 때로는 성급하거나 화를 잘 낼 수 있습니다. 감정을 조절하고 차분한 판단력을 기르는 것이 필요합니다.",
    },
    earth: {
      부족: "토 기운이 부족하여 안정감과 수렴력이 약합니다. 계획성과 꾸준함을 기르세요. 작은 것부터 차근차근 쌓아가는 습관이 토 기운을 강화시킵니다.",
      적정: "토 기운이 적절하여 안정과 수렴의 기운이 균형잡혀 있습니다. 안정적인 기반 위에서 꾸준히 발전할 수 있는 좋은 상태입니다.",
      과다: "토 기운이 강하여 안정감이 넘칩니다. 때로는 보수적이거나 변화를 두려워할 수 있습니다. 새로운 시도와 변화에 열린 마음을 갖는 것이 도움이 됩니다.",
    },
    metal: {
      부족: "금 기운이 부족하여 정리와 완성의 기운이 약합니다. 원칙과 규율을 세우는 것이 좋습니다. 작은 것부터 정리하고 완성하는 습관이 금 기운을 키워줍니다.",
      적정: "금 기운이 적절하여 정리와 완성의 기운이 균형잡혀 있습니다. 원칙을 지키면서도 유연하게 대처할 수 있는 좋은 기운입니다.",
      과다: "금 기운이 강하여 정리와 완성의 기운이 넘칩니다. 때로는 완벽주의나 고집이 세질 수 있습니다. 때로는 완벽하지 않아도 괜찮다는 여유를 갖는 것이 중요합니다.",
    },
    water: {
      부족: "수 기운이 부족하여 유동성과 지혜가 약합니다. 유연한 사고와 적응력을 키우세요. 다양한 경험과 학습을 통해 지혜를 쌓아가는 것이 도움이 됩니다.",
      적정: "수 기운이 적절하여 유동과 지혜의 기운이 균형잡혀 있습니다. 상황에 맞게 유연하게 대처하면서도 중심을 잃지 않을 수 있는 좋은 상태입니다.",
      과다: "수 기운이 강하여 유동성과 지혜가 넘칩니다. 때로는 변덕스럽거나 결정을 미룰 수 있습니다. 한 가지에 집중하고 결단력을 기르는 연습이 필요합니다.",
    },
  };

  // 상위 3개 오행 선택
  const topThreeOhaeng = useMemo(() => {
    return getTopThreeOhaeng(ohaengCounts, ilganOhaeng, wollyeongOhaeng);
  }, [ohaengCounts, ilganOhaeng, wollyeongOhaeng]);

  // 일간의 오행 색상
  const ilganColor = ilganOhaeng
    ? ohaengColorMap[ilganOhaeng]
    : {
        bg: "bg-gray-200",
        text: "text-gray-800",
        border: "border-gray-300",
      };

  return (
    <div className="mt-8 glass-card">
      <button
        className="w-full p-4 md:p-6 text-left flex justify-between items-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border-2 border-indigo-200 relative z-10"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
          오행의 기운
        </h3>
        <ChevronDownIcon
          className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="p-4 md:p-6 pt-0 animate-fade-in-fast">
          <div className="bg-white/80 p-6 rounded-xl border-2 border-indigo-200 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 왼쪽: 오행 다이어그램 */}
              <div
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200"
                style={{
                  padding: "calc(1.5rem - 2px)",
                  paddingLeft: "calc(1.5rem + 20px - 2px)",
                  paddingRight: "calc(1.5rem + 20px - 2px)",
                }}
              >
                <h4 className="text-xl font-bold text-gray-800 mb-4 text-center">
                  일간/비겁
                </h4>
                <div className="flex items-center justify-center">
                  <OhaengDiagram
                    ohaengCounts={ohaengCounts}
                    ilganOhaeng={ilganOhaeng}
                  />
                </div>
              </div>

              {/* 오른쪽: 오행 설명 */}
              <div
                className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200"
                style={{
                  padding: "calc(1.5rem - 10px)",
                }}
              >
                <h4 className="text-xl font-bold text-indigo-800 mb-4 text-center">
                  오행의 의미
                </h4>
                <div className="space-y-4 text-base font-normal leading-relaxed text-gray-700">
                  {(Object.keys(ohaengInfo) as Ohaeng[]).map((ohaeng) => {
                    const info = ohaengInfo[ohaeng];
                    const color = ohaengColorMap[ohaeng];
                    const count = ohaengCounts[ohaeng];
                    const strength = getStrengthLevel(count);
                    const isSelected = topThreeOhaeng.includes(ohaeng);

                    return (
                      <div key={ohaeng} className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-10 h-10 flex items-center justify-center text-lg font-bold rounded-lg shadow-md ${
                            color.bg
                          } ${color.text} ${color.border ?? ""}`}
                        >
                          {info.korean.split(" ")[0]}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 mb-1">
                            {info.korean}{" "}
                            <span className="text-indigo-600 font-bold">
                              {count}
                            </span>{" "}
                            - {info.description}
                          </p>
                          {/* 모든 오행에 상세 설명 표시 */}
                          <p className="text-sm text-gray-700 leading-relaxed mt-1">
                            {ohaengStrengthDescriptions[ohaeng][strength]}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const IlganPersonalityDisplay: React.FC<{ ilganChar: string }> = ({
  ilganChar,
}) => {
  const [isOpen, setIsOpen] = useState(true);
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
    <div className="mt-8 glass-card">
      <button
        className="w-full p-4 md:p-6 text-left flex justify-between items-center bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl border-2 border-amber-200 relative z-10"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-400 rounded-full shadow-lg">
            <span className="text-2xl">✨</span>
          </div>
          <h4 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-500 bg-clip-text text-transparent">
            일간(日干) - 나의 본질
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
          <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl border-2 border-amber-200 shadow-lg">
            <div className="text-center">
              <div className="bg-white/80 p-6 rounded-xl border-2 border-amber-200 shadow-lg">
                <div className="space-y-4 text-base font-normal leading-relaxed text-gray-700">
                  <p>사주 팔자는 네 개의 기둥으로 이루어져 있습니다.</p>
                  <p>
                    <strong className="text-amber-700 font-bold">
                      年柱(년주)
                    </strong>
                    는 조상의 기운과 뿌리를,
                  </p>
                  <p>
                    <strong className="text-amber-700 font-bold">
                      月柱(월주)
                    </strong>
                    는 부모와 사회의 영향을,
                  </p>
                  <p>
                    <strong className="text-amber-700 font-bold">
                      日柱(일주)
                    </strong>
                    는 바로 나 자신의 본질을,
                  </p>
                  <p>
                    <strong className="text-amber-700 font-bold">
                      時柱(시주)
                    </strong>
                    는 자식과 내 미래의 방향을 담고 있습니다.
                  </p>
                  <p>
                    그 중심에 나를 나타내는{" "}
                    <strong className="text-amber-800 font-extrabold">
                      日干(일간)
                    </strong>
                    이 있습니다.
                  </p>
                </div>
              </div>

              {!showInfo && (
                <div className="mt-6 animate-fade-in">
                  <button
                    onClick={() => setShowInfo(true)}
                    className="btn-primary flex items-center gap-3 py-4 px-8 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 mx-auto"
                  >
                    <UserIcon className="w-6 h-6" />
                    <span className="text-lg font-bold">
                      일간(나)의 성격 확인하기
                    </span>
                    <ChevronDownIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {showInfo && (
              <div className="mt-8 pt-8 border-t-2 border-amber-300 animate-fade-in-fast">
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
                  <p className="text-base font-normal leading-relaxed text-gray-700 text-center word-keep-all">
                    {data.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h5 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>{" "}
                      장점
                    </h5>
                    <ul className="space-y-1">
                      {data.pros.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-base font-normal text-gray-700"
                        >
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <h5 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>{" "}
                      단점
                    </h5>
                    <ul className="space-y-1">
                      {data.cons.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-base font-normal text-gray-700"
                        >
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="hidden bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-center">
                  <h5 className="font-bold text-yellow-800 mb-2">
                    💡 족집게 조언
                  </h5>
                  <p className="text-gray-800 font-medium word-keep-all">
                    {data.advice}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ILJI_SIBSIN_INTRO = {
  title: "일지 십신이란?",
  description:
    "사주 여덟 글자 중, 나(日干) 바로 밑에 있는 글자를 **'일지(日支)'**라고 합니다. 이곳은 나의 **'안방(영역)'**이자, 나의 **'몸'**이며, 내 **'배우자'**가 머무는 자리입니다.\n\nQ. 그냥 십신과 무엇이 다른가요? 사회(월지)에서는 리더십 있는 '장군(편관)'일지라도, 집(일지)에 돌아오면 다정한 '엄마(정인)' 같은 사람이 될 수 있습니다. 일지 십신이 바로 당신의 **'꾸밈없는 진짜 모습'**이자 **'내밀한 행복의 열쇠'**입니다.\n\n이 자리에 어떤 별(십신)이 떠 있는지를 보면 두 가지 핵심 비밀을 알 수 있습니다.\n\n1. 나는 어떤 배우자에게 이끌리는가?  내가 어떤 사람에게 끌리는지, 내 배우자는 어떤 성향의 사람인지, 그리고 결혼 생활의 분위기는 어떨지가 이 글자 하나에 담겨 있습니다.\n\n2. 나의 속마음은 무엇인가? 남들은 모르는 나의 외로움, 욕망, 그리고 내가 진정으로 추구하는 삶의 가치가 무엇인지 보여줍니다.",
} as const;

const IljuAnalysisDisplay: React.FC<{
  iljuGanji: string;
  sajuInfo: SajuInfo;
}> = ({ iljuGanji, sajuInfo }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [showIljiSibsin, setShowIljiSibsin] = useState(false);
  const [showIljiSibsinSpecial, setShowIljiSibsinSpecial] = useState(false);
  const [showIljiUnseong, setShowIljiUnseong] = useState(false);
  const [showIljiUnseongSpecial, setShowIljiUnseongSpecial] = useState(false);
  const [iljuData, setIljuData] = useState<IljuBundle | null>(null);
  const [iljuDataLoading, setIljuDataLoading] = useState(false);
  const [iljuDataError, setIljuDataError] = useState<string | null>(null);

  // 일지 십신 정보
  const iljiSibsin =
    iljuData?.ilji?.sibsin?.name ?? sajuInfo.pillars.day.jiJi.sibsin.name;
  const iljiChar = sajuInfo.pillars.day.jiJi.char;

  // 일지 십이운성 정보
  const iljiUnseong = sajuInfo.pillars.day.jiJi.unseong?.name ?? "";

  useEffect(() => {
    // 간지가 바뀌면 로드 상태 초기화
    setIljuData(null);
    setIljuDataLoading(false);
    setIljuDataError(null);
    setShowIljiSibsin(false);
    setShowIljiSibsinSpecial(false);
    setShowIljiUnseong(false);
  }, [iljuGanji]);

  useEffect(() => {
    if (!showInfo) return;

    let cancelled = false;
    setIljuDataLoading(true);
    setIljuDataError(null);

    (async () => {
      try {
        const loaded = await loadIljuBundle(iljuGanji);
        if (cancelled) return;
        if (!loaded) {
          setIljuData(null);
          setIljuDataError(`일주 DB 파일이 준비되지 않았습니다: ${iljuGanji}`);
          return;
        }
        setIljuData(loaded);
      } catch (e) {
        if (cancelled) return;
        setIljuData(null);
        setIljuDataError(
          e instanceof Error
            ? e.message
            : "일주 DB 로드 중 오류가 발생했습니다."
        );
      } finally {
        if (cancelled) return;
        setIljuDataLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [iljuGanji, showInfo]);

  const [gan, ji] = iljuGanji.split("");

  const ganInfo = earthlyBranchGanInfo[gan];
  const jiInfo = earthlyBranchGanInfo[ji];

  const ganColor = ganInfo
    ? ohaengColorMap[ganInfo.ohaeng]
    : { bg: "bg-gray-200", text: "text-gray-800", border: "border-gray-300" };
  const jiColor = jiInfo
    ? ohaengColorMap[jiInfo.ohaeng]
    : { bg: "bg-gray-200", text: "text-gray-800", border: "border-gray-300" };

  return (
    <>
      <div className="mt-8 glass-card">
      <button
        className="w-full p-4 md:p-6 text-left flex justify-between items-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-2xl border-2 border-emerald-200 relative z-10"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-400 rounded-full shadow-lg">
            <span className="text-2xl">🏠</span>
          </div>
          <h4 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-500 bg-clip-text text-transparent">
            일주(日柱) - 나와 배우자
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
          <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-2xl border-2 border-emerald-200 shadow-lg">
            <div className="text-center">
              <div className="bg-white/80 p-6 rounded-xl border-2 border-emerald-200 shadow-lg">
                <div className="space-y-4 text-base font-normal leading-relaxed text-gray-700">
                  <p>
                    <strong className="text-emerald-700 font-bold">
                      일주(日柱)
                    </strong>
                    는 나 자신의 핵심이자 배우자의 궁입니다.
                  </p>
                  <p>
                    <strong className="text-emerald-600 font-semibold">
                      일간(日干)
                    </strong>
                    은 내{" "}
                    <strong className="text-emerald-700 font-bold">영혼</strong>
                    을,{" "}
                    <strong className="text-emerald-600 font-semibold">
                      일지(日支)
                    </strong>
                    는 내{" "}
                    <strong className="text-emerald-700 font-bold">
                      몸과 배우자
                    </strong>
                    를 상징합니다.
                  </p>
                  <p>
                    일주를 통해 나의 본성과 배우자와의 인연, 그리고 인생의
                    안정감을 읽어낼 수 있습니다.
                  </p>
                </div>
              </div>

              {!showInfo && (
                <div className="mt-6 animate-fade-in">
                  <button
                    onClick={() => setShowInfo(true)}
                    className="btn-primary flex items-center gap-3 py-4 px-8 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 mx-auto bg-emerald-500 hover:bg-emerald-600"
                    style={{ backgroundColor: "#10b981" }}
                  >
                    <HomeIcon className="w-6 h-6" />
                    <span className="text-lg font-bold">
                      일주(나와 배우자) 분석 보기
                    </span>
                    <ChevronDownIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {showInfo && (
              <div className="mt-8 pt-8 border-t-2 border-emerald-300 animate-fade-in-fast">
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
                    <span>{iljuData?.name ?? iljuGanji}</span>
                  </h3>
                  <p className="text-lg text-gray-600 mt-2 font-medium">
                    "
                    {renderBoldMarkdown(
                      iljuData?.general.nature ?? "",
                      "font-extrabold text-emerald-800"
                    )}
                    "
                  </p>
                </div>

                <div className="space-y-6">
                  {iljuDataLoading && (
                    <div className="bg-white/60 p-4 rounded-xl border border-emerald-200 text-center text-gray-700">
                      일주 DB 내용을 불러오는 중입니다...
                    </div>
                  )}
                  {iljuDataError && (
                    <div className="bg-white/60 p-4 rounded-xl border border-red-200 text-center text-red-700">
                      {iljuDataError}
                    </div>
                  )}

                  <div className="bg-white/60 p-5 rounded-xl border border-gray-200">
                    <h4 className="text-lg font-bold text-emerald-700 mb-2 flex items-center gap-2">
                      💎 핵심 특징
                    </h4>
                    <p className="text-base md:text-lg font-normal leading-relaxed text-gray-800 word-keep-all mb-4 whitespace-pre-line">
                      {renderBoldMarkdown(
                        iljuData?.general.characteristic ?? "",
                        "font-extrabold text-emerald-800"
                      )}
                    </p>
                  </div>

                  <div className="bg-white/60 p-5 rounded-xl border border-gray-200">
                    <h4 className="text-lg font-bold text-pink-700 mb-2 flex items-center gap-2">
                      💕 배우자
                    </h4>
                    <p className="text-base md:text-lg font-normal leading-relaxed text-gray-800 word-keep-all whitespace-pre-line">
                      {renderBoldMarkdown(
                        iljuData?.general.spouse ?? "",
                        "font-extrabold text-pink-900"
                      )}
                    </p>
                  </div>

                  <div className="bg-white/60 p-5 rounded-xl border border-gray-200">
                    <h4 className="text-lg font-bold text-blue-700 mb-2 flex items-center gap-2">
                      💼 직업 · 재물운
                    </h4>
                    <p className="text-base md:text-lg font-normal leading-relaxed text-gray-800 word-keep-all whitespace-pre-line">
                      {renderBoldMarkdown(
                        iljuData?.general.jobWealth ?? "",
                        "font-extrabold text-blue-900"
                      )}
                    </p>
                  </div>

                  <div className="bg-white/60 p-5 rounded-xl border border-gray-200">
                    <h4 className="text-lg font-bold text-emerald-800 mb-2 flex items-center gap-2">
                      🍀 족집게 조언
                    </h4>
                    <p className="text-base md:text-lg text-gray-800 font-medium word-keep-all whitespace-pre-line">
                      {renderBoldMarkdown(
                        iljuData?.general.advice ?? "",
                        "font-extrabold text-emerald-800"
                      )}
                    </p>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* 일주 박스 바깥: 일주 십신/십이운성 전용 섹션 */}
      {showInfo && (
        <div className="mt-6 space-y-6">
          {/* 십신(十神) 소개 + 일주 십신 분석 */}
          <div className="bg-gradient-to-br from-pink-50 via-white to-pink-50 p-6 rounded-2xl border-2 border-pink-200">
            <div className="bg-white/80 p-6 rounded-xl border-2 border-pink-200 shadow-lg">
              <div className="inline-block px-3 py-1 bg-pink-100 text-pink-900 rounded-full text-sm font-semibold mb-3">
                일지 십신이란?
              </div>
              <h4 className="text-xl md:text-2xl font-extrabold text-pink-900 mb-3">
                {ILJI_SIBSIN_INTRO.title}
              </h4>
              <p className="text-base md:text-lg font-normal leading-relaxed text-gray-800 whitespace-pre-line word-keep-all">
                {renderBoldMarkdown(
                  ILJI_SIBSIN_INTRO.description,
                  "font-extrabold text-pink-900"
                )}
              </p>
              <p className="mt-4 text-gray-700 text-base md:text-lg">
                아래 버튼을 누르면,{" "}
                <strong className="text-pink-900 font-extrabold">
                  {iljiSibsin}
                </strong>
                의 일반적인 해설과 함께 이 일주만의 특별한 해석을 보여드릴게요.
              </p>
            </div>

            {/* 첫 번째 버튼: sibsinDescriptions의 일반 해설 (항상 표시) */}
            {!showIljiSibsin && (
              <div className="mt-6 animate-fade-in text-center">
                <button
                  type="button"
                  onClick={() => setShowIljiSibsin(true)}
                  className="btn-primary flex items-center gap-3 py-4 px-8 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 mx-auto bg-pink-600 hover:bg-pink-700"
                >
                  <span className="text-lg font-bold">{iljiSibsin} 해설 보기</span>
                  <ChevronDownIcon className="w-5 h-5" />
                </button>
              </div>
            )}

            {showIljiSibsin && (
              <div className="mt-6 animate-fade-in-fast">
                <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-pink-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-pink-500 text-white px-3 py-1.5 rounded-lg font-bold text-sm">
                      일지 (日支)
                    </div>
                    <h4 className="text-xl md:text-2xl font-bold text-pink-900">
                      {iljiSibsin}
                    </h4>
                    <CharBox char={iljiChar} />
                  </div>

                  <button
                    type="button"
                    className="px-4 py-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm shadow-sm"
                    onClick={() => {
                      setShowIljiSibsin(false);
                      setShowIljiSibsinSpecial(false);
                    }}
                  >
                    닫기
                  </button>
                </div>

                <div className="bg-gradient-to-r from-pink-100/50 to-white p-5 rounded-xl border border-pink-300">
                  {(() => {
                    const base = sibsinDescriptions[iljiSibsin];

                    // sibsinDescriptions에서 가져오기 (우선)
                    const title = base?.title ?? iljiSibsin;
                    const keywords = base?.keywords ?? [];
                    const description = base?.description ?? "";

                    // 데이터가 없는 경우
                    if (!base || !description) {
                      return (
                        <div className="text-center py-8">
                          <p className="text-gray-600 mb-2">
                            아직 <strong className="text-pink-900">{iljiSibsin}</strong>의 일반 해설이 준비되지 않았습니다.
                          </p>
                          <p className="text-sm text-gray-500">
                            sibsinDescriptions.ts에 "{iljiSibsin}" 항목을 확인해주세요.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <>
                  <h5 className="font-bold text-pink-900 mb-3 flex items-center gap-2 text-lg">
                    <span>📕</span> {title}
                  </h5>

                  {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {keywords.map((k) => (
                        <span
                          key={k}
                          className="px-2.5 py-1 rounded-full bg-pink-100 text-pink-900 border border-pink-200 text-xs md:text-sm font-semibold"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-base md:text-lg font-normal leading-relaxed text-gray-800 whitespace-pre-line word-keep-all bg-white/70 p-4 rounded-lg">
                    {renderBoldMarkdown(
                      description,
                      "font-extrabold text-pink-900"
                    )}
                  </p>

                  {/* 일주별 십신 특별 해설 버튼: 일반 해설 박스 안에 표시 */}
                  {iljuData?.ilji?.sibsin?.special_analysis && !showIljiSibsinSpecial && (
                    <div className="mt-5 text-center">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 text-white font-extrabold shadow-lg hover:shadow-xl transition-all duration-300 animate-sparkle"
                        onClick={() => setShowIljiSibsinSpecial(true)}
                      >
                        <span className="text-2xl">✨</span>
                        <span>{iljuGanji}의 {iljiSibsin} 특별 해설 보기</span>
                        <span className="text-2xl">✨</span>
                        <ChevronDownIcon className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                      </>
                    );
                  })()}
                </div>

                {iljuData?.ilji?.sibsin?.special_analysis && showIljiSibsinSpecial && (
                  <div className="mt-5 bg-white/80 p-5 rounded-xl border-2 border-pink-300 shadow-sm animate-border-sparkle">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="inline-block px-3 py-1 bg-pink-100 text-pink-900 rounded-full text-sm font-semibold">
                        ✨ 일주 십신 특별 해설 ✨
                      </div>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm shadow-sm"
                        onClick={() => setShowIljiSibsinSpecial(false)}
                      >
                        닫기
                      </button>
                    </div>

                    <h6 className="text-lg md:text-xl font-extrabold text-pink-900 mb-3">
                      {iljuData.ilji.sibsin.special_analysis.title}
                    </h6>

                    <p className="text-base md:text-lg font-normal leading-relaxed text-gray-800 whitespace-pre-line word-keep-all bg-white/70 p-4 rounded-lg">
                      {renderBoldMarkdown(
                        iljuData.ilji.sibsin.special_analysis.description,
                        "font-extrabold text-pink-900"
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 십이운성(十二運星) 소개 + 일주 십이운성 분석 */}
          <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-6 rounded-2xl border-2 border-amber-200">
            <div className="bg-white/80 p-6 rounded-xl border-2 border-amber-200 shadow-lg">
              <div className="inline-block px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-sm font-semibold mb-3">
                십이운성(十二運星) 소개
              </div>

              <div className="space-y-4 text-base md:text-lg font-normal leading-relaxed text-gray-800">
                <p>
                  <strong className="text-amber-800 font-extrabold">
                    십이운성(十二運星)
                  </strong>
                  은 마치 <strong className="text-amber-800 font-extrabold">'사람의 인생 주기'</strong>와 같습니다.
                  자연에 봄, 여름, 가을, 겨울이 있듯이, 우리 사주에 있는 글자(에너지)들도 태어나서, 왕성하게 활동하다가, 약해지고, 다시 사라지는 순환 과정을 겪습니다.
                  이 에너지의 강약과 상태를 12단계로 나눈 것이 바로 십이운성입니다.
                </p>

                <p>
                  초보자도 이해하기 쉽게 <strong className="text-amber-800 font-extrabold">'사람의 일생'</strong>에 비유하여 4단계로 나누어 설명해 드릴게요.
                </p>

                <div className="bg-white/90 p-5 rounded-xl border border-amber-300 shadow-sm">
                  <h4 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
                    <span>💡</span>
                    <span>한눈에 보는 요약</span>
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm md:text-base">
                      <thead>
                        <tr className="bg-amber-100">
                          <th className="border border-amber-300 px-3 py-2 text-amber-900 font-bold">시기</th>
                          <th className="border border-amber-300 px-3 py-2 text-amber-900 font-bold">단계</th>
                          <th className="border border-amber-300 px-3 py-2 text-amber-900 font-bold">핵심 키워드</th>
                          <th className="border border-amber-300 px-3 py-2 text-amber-900 font-bold">에너지 상태</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white hover:bg-amber-50 transition-colors">
                          <td className="border border-amber-300 px-3 py-2 font-semibold text-center">성장</td>
                          <td className="border border-amber-300 px-3 py-2">장생, 목욕, 관대</td>
                          <td className="border border-amber-300 px-3 py-2">시작, 후원, 호기심, 패기</td>
                          <td className="border border-amber-300 px-3 py-2 text-center">📈 상승</td>
                        </tr>
                        <tr className="bg-white hover:bg-amber-50 transition-colors">
                          <td className="border border-amber-300 px-3 py-2 font-semibold text-center">전성</td>
                          <td className="border border-amber-300 px-3 py-2">건록, 제왕, 쇠</td>
                          <td className="border border-amber-300 px-3 py-2">독립, 권력, 노련미</td>
                          <td className="border border-amber-300 px-3 py-2 text-center">🔝 최상</td>
                        </tr>
                        <tr className="bg-white hover:bg-amber-50 transition-colors">
                          <td className="border border-amber-300 px-3 py-2 font-semibold text-center">정신</td>
                          <td className="border border-amber-300 px-3 py-2">병, 사, 묘</td>
                          <td className="border border-amber-300 px-3 py-2">배려, 연구, 저장, 정신</td>
                          <td className="border border-amber-300 px-3 py-2 text-center">📉 하강 (내면 강화)</td>
                        </tr>
                        <tr className="bg-white hover:bg-amber-50 transition-colors">
                          <td className="border border-amber-300 px-3 py-2 font-semibold text-center">준비</td>
                          <td className="border border-amber-300 px-3 py-2">절, 태, 양</td>
                          <td className="border border-amber-300 px-3 py-2">단절, 잉태, 준비, 보호</td>
                          <td className="border border-amber-300 px-3 py-2 text-center">🔄 순환 (잠재력)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                  <p className="font-semibold text-amber-900">
                    ⚠️ 이것만 기억하세요!
                  </p>
                  <p className="mt-2">
                    십이운성은 <strong className="text-amber-800">"좋다/나쁘다"</strong>가 아니라 <strong className="text-amber-800">"어떤 스타일의 힘인가?"</strong>를 보여줍니다.
                  </p>
                  <ul className="mt-2 ml-5 space-y-1 list-disc text-gray-700">
                    <li>제왕이라고 무조건 성공하는 것이 아니고 (너무 강해 부러질 수 있음)</li>
                    <li>절이라고 망하는 것이 아닙니다 (오히려 끊고 맺음이 확실해 매력적일 수 있음)</li>
                  </ul>
                </div>

                <p>
                  일지에 걸린 운성은 특히{" "}
                  <strong className="text-amber-800 font-extrabold">
                    관계·일상·몸
                  </strong>
                  의 체감과 연결되어, 내가 어떤 리듬으로 사람과 상황을 대하는지
                  보여줍니다.
                </p>

                <p className="text-gray-700">
                  아래 버튼을 누르면,{" "}
                  <strong className="text-amber-800 font-extrabold">
                    {iljiUnseong}
                  </strong>
                  의 일반적인 해설을 보여드릴게요.
                </p>
              </div>
            </div>

            {/* 첫 번째 버튼: unseongDescriptions의 일반 해설 (항상 표시) */}
            {!showIljiUnseong && (
              <div className="mt-6 animate-fade-in text-center">
                <button
                  type="button"
                  onClick={() => setShowIljiUnseong(true)}
                  className="btn-primary flex items-center gap-3 py-4 px-8 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 mx-auto bg-amber-500 hover:bg-amber-600"
                >
                  <span className="text-lg font-bold">{iljiUnseong} 해설 보기</span>
                  <ChevronDownIcon className="w-5 h-5" />
                </button>
              </div>
            )}

            {showIljiUnseong && (
              <div className="mt-6 animate-fade-in-fast">
                <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-500 text-white px-3 py-1.5 rounded-lg font-bold text-sm">
                      십이운성 (十二運星)
                    </div>
                    <h4 className="text-xl md:text-2xl font-bold text-amber-900">
                      {iljiUnseong}
                    </h4>
                  </div>

                  <button
                    type="button"
                    className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-sm"
                    onClick={() => {
                      setShowIljiUnseong(false);
                      setShowIljiUnseongSpecial(false);
                    }}
                  >
                    닫기
                  </button>
                </div>

                <div className="bg-gradient-to-r from-amber-100/50 to-white p-5 rounded-xl border border-amber-300">
                  {(() => {
                    const base = unseongDescriptions[iljiUnseong];

                    // unseongDescriptions에서 가져오기
                    const title = base?.title ?? iljiUnseong;
                    const keywords = base?.keywords ?? [];
                    const description = base?.description ?? "";

                    // 데이터가 없는 경우
                    if (!base || !description) {
                      return (
                        <div className="text-center py-8">
                          <p className="text-gray-600 mb-2">
                            아직 <strong className="text-amber-900">{iljiUnseong}</strong>의 일반 해설이 준비되지 않았습니다.
                          </p>
                          <p className="text-sm text-gray-500">
                            unseongDescriptions.ts에 "{iljiUnseong}" 항목을 확인해주세요.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <>
                        <h5 className="font-bold text-amber-900 mb-3 flex items-center gap-2 text-lg">
                          <span>📘</span> {title}
                        </h5>

                        {keywords.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {keywords.map((k) => (
                              <span
                                key={k}
                                className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs md:text-sm font-semibold"
                              >
                                {k}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-base md:text-lg font-normal leading-relaxed text-gray-800 whitespace-pre-line word-keep-all bg-white/70 p-4 rounded-lg">
                          {renderBoldMarkdown(
                            description,
                            "font-extrabold text-amber-900"
                          )}
                        </p>

                        {/* 일지 운성 추가 설명 (일지 전용) */}
                        {base?.일지 && (
                          <div className="mt-4 bg-amber-50 p-4 rounded-lg border border-amber-200">
                            <h6 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                              <span>💑</span> {base.일지.title}
                            </h6>
                            <p className="text-base leading-relaxed text-gray-800 whitespace-pre-line word-keep-all">
                              {renderBoldMarkdown(
                                base.일지.description,
                                "font-extrabold text-amber-900"
                              )}
                            </p>
                          </div>
                        )}

                        {/* 일주별 십이운성 특별 해설 버튼: 일반 해설 박스 안에 표시 */}
                        {iljuData?.ilji?.unseong?.description && !showIljiUnseongSpecial && (
                          <div className="mt-5 text-center">
                            <button
                              type="button"
                              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold shadow-lg hover:shadow-xl transition-all duration-300 animate-sparkle"
                              onClick={() => setShowIljiUnseongSpecial(true)}
                            >
                              <span className="text-2xl">✨</span>
                              <span>{iljuGanji}의 {iljiUnseong} 특별 해설 보기</span>
                              <span className="text-2xl">✨</span>
                              <ChevronDownIcon className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* 일주별 십이운성 특별 해설 내용 */}
                {iljuData?.ilji?.unseong?.description && showIljiUnseongSpecial && (
                  <div className="mt-5 bg-white/80 p-5 rounded-xl border-2 border-amber-300 shadow-sm animate-border-sparkle">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="inline-block px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-sm font-semibold">
                        ✨ 일주 십이운성 특별 해설 ✨
                      </div>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-sm"
                        onClick={() => setShowIljiUnseongSpecial(false)}
                      >
                        닫기
                      </button>
                    </div>

                    <h6 className="text-lg md:text-xl font-extrabold text-amber-900 mb-3">
                      {iljuData.ilji.unseong.title ?? `${iljuGanji}의 ${iljiUnseong}`}
                    </h6>

                    {iljuData.ilji.unseong.keywords && iljuData.ilji.unseong.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {iljuData.ilji.unseong.keywords.map((k: string) => (
                          <span
                            key={k}
                            className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs md:text-sm font-semibold"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="bg-white/70 p-4 rounded-lg">
                      <p className="text-base md:text-lg font-normal leading-relaxed text-gray-800 whitespace-pre-line word-keep-all">
                        {renderBoldMarkdown(
                          iljuData.ilji.unseong.description,
                          "font-extrabold text-amber-900"
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const renderBoldMarkdown = (
  text: string,
  strongClassName: string
): React.ReactNode => {
  const regex = /\*\*(.+?)\*\*/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;

  for (let match = regex.exec(text); match; match = regex.exec(text)) {
    const start = match.index;
    const full = match[0];
    const inner = match[1];

    if (start > lastIndex) nodes.push(text.slice(lastIndex, start));
    nodes.push(
      <strong key={`b-${start}`} className={strongClassName}>
        {inner}
      </strong>
    );

    lastIndex = start + full.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return <>{nodes}</>;
};

// [성격] 이전 부분만 추출하는 함수
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
  onLoginRequired,
}) => {
  const navigate = useNavigate();
  const { birthDate, gender, daewoon, daewoonNumber, birthRegion } = sajuData;
  const ilganChar = sajuData.pillars.day.cheonGan.char;
  const iljuGanji = sajuData.pillars.day.ganji; // e.g., "甲子"
  const [showAiDetails, setShowAiDetails] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

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

  // 직접 입력 여부 확인 (month가 1이고 day가 1이고 hour가 12이거나 -1이면 직접 입력으로 간주)
  const isDirectInput =
    birthDate.month === 1 &&
    birthDate.day === 1 &&
    (birthDate.hour === 12 || birthDate.hour === -1);
  const isHourUnknown = birthDate.hour === -1 || birthDate.minute === -1;
  const birthDateString = isDirectInput
    ? `${birthDate.year}년` // 직접 입력 시 년도만 표시
    : isHourUnknown
    ? `${birthDate.year}년 ${birthDate.month}월 ${birthDate.day}일 (시간 모름)`
    : `${birthDate.year}년 ${birthDate.month}월 ${birthDate.day}일 ${String(
        birthDate.hour
      ).padStart(2, "0")}:${String(birthDate.minute).padStart(2, "0")}`;

  return (
    <div className="mt-10 animate-fade-in">
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center sm:text-left flex-1">
            사주 원국 정보
          </h2>
          {/* <SaveSajuButton sajuData={sajuData} onLoginRequired={onLoginRequired} /> */}
        </div>

        {/* 사용자 정보 표시 부분 숨김 처리 (데이터는 유지, 나중에 저장용) */}
        {/* <div className="mb-8 p-4 md:p-6 glass-card">
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
        </div> */}

        <div className="p-1 md:p-2 glass-card">
          <SajuPillarsDisplay sajuInfo={sajuData} />
          <SajuInfoSummary sajuInfo={sajuData} />
        </div>

        <InteractionsDisplay sajuInfo={sajuData} />
        <SinsalDisplay sajuInfo={sajuData} />

        {/* 오행의 기운 섹션 */}
        <OhaengEnergyDisplay ilganChar={ilganChar} sajuInfo={sajuData} />

        {/* 일간 성격 확인 섹션 */}
        <IlganPersonalityDisplay ilganChar={ilganChar} />

        {/* 일주 분석 섹션 */}
        <IljuAnalysisDisplay iljuGanji={iljuGanji} sajuInfo={sajuData} />

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
