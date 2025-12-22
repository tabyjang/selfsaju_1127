/**
 * ============================================
 * 나의 에너지 페이지
 * ============================================
 *
 * Phase 1: 기초 오행 카운트 (가중치 없음)
 * Phase 2: 위치별 가중치 적용
 * Phase 3: 통근/투간 적용 → 절대질량
 *
 * 모든 Phase를 스크롤로 확인 가능
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import type { SajuInfo, Ohaeng } from '../types';
import { analyzeOhaengEnergy } from '../utils/ohyaeng/energyCalculator';
import type { OhaengScores, OhaengEnergyAnalysis, EnergyMatrixCell, PositionKey } from '../utils/ohyaeng/types';
import { getUserSajuRecords } from '../utils/sajuStorage';
import { SajuPillarsDisplay } from '../components/AnalysisResult';

// ============================================
// 상수 및 색상 정의 (ResultPage와 동일)
// ============================================

const ohaengColors: Record<Ohaeng, string> = {
  wood: "#00B050",
  fire: "#FF0000",
  earth: "#FEC100",
  metal: "#9CA3AF",
  water: "#000000",
};

const ohaengKoreanMap: Record<Ohaeng, string> = {
  wood: "목(木)",
  fire: "화(火)",
  earth: "토(土)",
  metal: "금(金)",
  water: "수(水)",
};

const ohaengShortMap: Record<Ohaeng, string> = {
  wood: "목",
  fire: "화",
  earth: "토",
  metal: "금",
  water: "수",
};

const stemKoreanPosition: Record<string, string> = {
  year: '년간',
  month: '월간',
  day: '일간',
  hour: '시간',
};

const branchKoreanPosition: Record<string, string> = {
  year: '년지',
  month: '월지',
  day: '일지',
  hour: '시지',
};

const ohaengColorMap: Record<Ohaeng, { bg: string; text: string; border: string }> = {
  wood: { bg: 'bg-[#00B050]', text: 'text-white', border: 'border-[#008F40]' },
  fire: { bg: 'bg-[#FF0000]', text: 'text-white', border: 'border-[#CC0000]' },
  earth: { bg: 'bg-[#FEC100]', text: 'text-white', border: 'border-[#D9A600]' },
  metal: { bg: 'bg-[#9CA3AF]', text: 'text-gray-800', border: 'border-[#6B7280]' },
  water: { bg: 'bg-[#000000]', text: 'text-white', border: 'border-[#333333]' },
};

// ============================================
// 오각형 레이더 차트 컴포넌트
// ============================================

interface OhaengPentagonProps {
  scores: OhaengScores;
  maxScore: number;
  title: string;
  ilganOhaeng?: Ohaeng;
  showPercentage?: boolean;
}

const OhaengPentagon: React.FC<OhaengPentagonProps> = ({
  scores,
  maxScore,
  title,
  ilganOhaeng,
  showPercentage = false,
}) => {
  const ohaengOrder: Ohaeng[] = ["wood", "fire", "earth", "metal", "water"];

  // 일간 오행에 따라 회전
  const getRotationIndex = (): number => {
    if (!ilganOhaeng) return 0;
    const index = ohaengOrder.indexOf(ilganOhaeng);
    return index >= 0 ? index : 0;
  };

  const rotationIndex = getRotationIndex();
  const rotatedOrder = [
    ...ohaengOrder.slice(rotationIndex),
    ...ohaengOrder.slice(0, rotationIndex),
  ];

  const centerX = 50;
  const centerY = 50;
  const radius = 35; // 오각형 반지름

  // 점수에 따른 원 크기 계산 (선형 보간 - 0.1 단위로 정밀하게 적용)
  const getCircleRadius = (score: number): number => {
    const baseRadius = 6;
    const minRadius = baseRadius * 0.5; // 최소 크기 (점수 0일 때)
    const maxRadius = baseRadius * 2.5; // 최대 크기 (점수 maxScore일 때)

    if (maxScore <= 0) return baseRadius;

    // 선형 보간: score에 비례하여 원 크기 증가
    const ratio = Math.min(score / maxScore, 1); // 0 ~ 1 사이 비율
    return minRadius + (maxRadius - minRadius) * ratio;
  };

  // 점수에 따른 폰트 크기 계산 (선형 보간)
  const getFontSize = (score: number): number => {
    const minFontSize = 5; // 최소 폰트 크기
    const maxFontSize = 14; // 최대 폰트 크기

    if (maxScore <= 0) return 8;

    // 선형 보간: score에 비례하여 폰트 크기 증가
    const ratio = Math.min(score / maxScore, 1);
    return minFontSize + (maxFontSize - minFontSize) * ratio;
  };

  // 오각형 위치 계산 (5개 위치)
  const basePositions = [
    { x: centerX, y: centerY - radius }, // 상단 (0)
    { x: centerX + radius * 0.951, y: centerY - radius * 0.309 }, // 우상단 (1)
    { x: centerX + radius * 0.588, y: centerY + radius * 0.809 }, // 우하단 (2)
    { x: centerX - radius * 0.588, y: centerY + radius * 0.809 }, // 좌하단 (3)
    { x: centerX - radius * 0.951, y: centerY - radius * 0.309 }, // 좌상단 (4)
  ];

  // 회전된 순서에 따라 오행 위치 매핑
  const ohaengPositions = rotatedOrder.map((ohaeng, idx) => ({
    ohaeng,
    korean: ohaengShortMap[ohaeng],
    x: basePositions[idx].x,
    y: basePositions[idx].y,
    score: scores[ohaeng],
  }));

  // 상생 관계 (외곽 오각형)
  const sangsaengPaths = [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 4, to: 0 },
  ];

  // 상극 관계 (내부 별)
  const sanggeukPaths = [
    { from: 0, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 4 },
    { from: 3, to: 0 },
    { from: 4, to: 1 },
  ];

  const sangsaengStrokeWidth = 0.8;
  const sanggeukStrokeWidth = 0.7;
  const borderColor = "#1f2937";
  const borderWidth = 0.8;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 100" className="w-56 h-56 md:w-64 md:h-64">
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

        {/* 상생 관계 (외곽 오각형) - 실선 화살표 */}
        {sangsaengPaths.map((path, idx) => {
          const from = ohaengPositions[path.from];
          const to = ohaengPositions[path.to];
          const fromRadius = getCircleRadius(from.score);
          const toRadius = getCircleRadius(to.score);
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

        {/* 상극 관계 (내부 별) - 점선 화살표 */}
        {sanggeukPaths.map((path, idx) => {
          const from = ohaengPositions[path.from];
          const to = ohaengPositions[path.to];
          const fromRadius = getCircleRadius(from.score);
          const toRadius = getCircleRadius(to.score);
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

        {/* 오행 원들 - 점수에 따라 크기 조정 */}
        {ohaengPositions.map((pos, idx) => {
          const color = ohaengColors[pos.ohaeng];
          const circleRadius = getCircleRadius(pos.score);
          const fontSize = getFontSize(pos.score);

          return (
            <g key={pos.ohaeng}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={circleRadius}
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
                  fontSize: `${fontSize}px`,
                  fontWeight: "bold",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                {pos.korean}
              </text>
              {/* 점수 표시 (원 아래) */}
              <text
                x={pos.x}
                y={pos.y + circleRadius + 10}
                textAnchor="middle"
                fill="#374151"
                style={{
                  fontSize: "6px",
                  fontWeight: "bold",
                }}
              >
                {showPercentage ? `${pos.score.toFixed(1)}%` : pos.score.toFixed(1)}
              </text>
            </g>
          );
        })}
      </svg>
      <h4 className="mt-4 text-sm font-semibold text-gray-700">{title}</h4>
    </div>
  );
};

// ============================================
// 오행 바 차트 컴포넌트
// ============================================

interface OhaengBarChartProps {
  scores: OhaengScores;
  percentages: OhaengScores;
  showDecimal?: boolean;
}

const OhaengBarChart: React.FC<OhaengBarChartProps> = ({
  scores,
  percentages,
  showDecimal = true,
}) => {
  const ohaengOrder: Ohaeng[] = ["wood", "fire", "earth", "metal", "water"];

  return (
    <div className="space-y-3">
      {ohaengOrder.map((ohaeng) => {
        const color = ohaengColorMap[ohaeng];
        const score = scores[ohaeng];
        const pct = percentages[ohaeng];

        return (
          <div key={ohaeng} className="flex items-center gap-3">
            {/* 오행 아이콘 */}
            <div
              className={`flex-shrink-0 w-10 h-10 flex items-center justify-center text-sm font-bold rounded-lg shadow-md ${color.bg} ${color.text}`}
            >
              {ohaengShortMap[ohaeng]}
            </div>
            {/* 바 차트 */}
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">
                  {ohaengKoreanMap[ohaeng]}
                </span>
                <span className="font-bold text-gray-900">
                  {showDecimal ? score.toFixed(2) : score} ({pct.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${color.bg}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================
// Phase 카드 컴포넌트
// ============================================

interface PhaseCardProps {
  phase: number;
  title: string;
  subtitle: string;
  description: string;
  children: React.ReactNode;
  color: 'blue' | 'purple' | 'green';
}

const PhaseCard: React.FC<PhaseCardProps> = ({
  phase,
  title,
  subtitle,
  description,
  children,
  color,
}) => {
  const colorClasses = {
    blue: {
      bg: 'from-blue-50 via-sky-50 to-cyan-50',
      border: 'border-blue-200',
      badge: 'bg-blue-600',
      text: 'text-blue-800',
    },
    purple: {
      bg: 'from-purple-50 via-indigo-50 to-violet-50',
      border: 'border-purple-200',
      badge: 'bg-purple-600',
      text: 'text-purple-800',
    },
    green: {
      bg: 'from-green-50 via-emerald-50 to-teal-50',
      border: 'border-green-200',
      badge: 'bg-green-600',
      text: 'text-green-800',
    },
  };

  const classes = colorClasses[color];

  return (
    <div className={`bg-gradient-to-br ${classes.bg} rounded-2xl border-2 ${classes.border} p-6 md:p-8 shadow-lg animate-fade-in`}>
      {/* 헤더 */}
      <div className="flex items-start gap-4 mb-6">
        <div className={`flex-shrink-0 w-12 h-12 ${classes.badge} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
          {phase}
        </div>
        <div>
          <h2 className={`text-xl md:text-2xl font-bold ${classes.text}`}>{title}</h2>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>
      </div>

      {/* 설명 */}
      <p className="text-gray-700 mb-6 leading-relaxed">{description}</p>

      {/* 콘텐츠 */}
      {children}
    </div>
  );
};

// ============================================
// 변화 표시 컴포넌트
// ============================================

interface ChangeIndicatorProps {
  changes: OhaengScores;
  fromPhase: number;
  toPhase: number;
}

const ChangeIndicator: React.FC<ChangeIndicatorProps> = ({ changes, fromPhase, toPhase }) => {
  const ohaengOrder: Ohaeng[] = ["wood", "fire", "earth", "metal", "water"];

  return (
    <div className="mt-4 p-4 bg-white/80 rounded-xl border border-gray-200">
      <h5 className="text-sm font-bold text-gray-700 mb-3">
        Phase {fromPhase} → Phase {toPhase} 변화량
      </h5>
      <div className="grid grid-cols-5 gap-2">
        {ohaengOrder.map((ohaeng) => {
          const change = changes[ohaeng];
          const isPositive = change > 0;
          const isNegative = change < 0;

          return (
            <div key={ohaeng} className="text-center">
              <div
                className={`w-8 h-8 mx-auto flex items-center justify-center text-xs font-bold rounded-full ${ohaengColorMap[ohaeng].bg} ${ohaengColorMap[ohaeng].text}`}
              >
                {ohaengShortMap[ohaeng]}
              </div>
              <div className={`text-xs mt-1 font-medium ${
                isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
              }`}>
                {isPositive ? '+' : ''}{change.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// 지장간 원국 표시 컴포넌트
// ============================================

interface JijangganPillarsDisplayProps {
  finalMatrix: EnergyMatrixCell[];
  sajuInfo: SajuInfo;
}

const JijangganPillarsDisplay: React.FC<JijangganPillarsDisplayProps> = ({
  finalMatrix,
  sajuInfo,
}) => {
  const { pillars } = sajuInfo;

  // 시주가 없을 경우(시간 모름) 확인
  const isHourUnknown =
    pillars.hour.cheonGan.char === '-' || pillars.hour.jiJi.char === '-';

  const pillarOrder: ('hour' | 'day' | 'month' | 'year')[] = ['hour', 'day', 'month', 'year'];

  // 최대 점수 계산 (크기 정규화용)
  const maxScore = Math.max(...finalMatrix.map((cell) => cell.finalScore), 1);

  // 위치별 천간 셀 찾기
  const getStemCell = (position: PositionKey): EnergyMatrixCell | undefined => {
    return finalMatrix.find((cell) => cell.position === position);
  };

  // 위치별 지장간 셀들 찾기
  const getHiddenStemCells = (position: PositionKey): EnergyMatrixCell[] => {
    return finalMatrix.filter((cell) => cell.position === position);
  };

  // 천간 크기 계산 (고정)
  const getStemSize = (): number => {
    return 80; // 고정 크기
  };

  // 지장간 높이 계산 (점수에 비례)
  const getHiddenStemHeight = (score: number): number => {
    const ratio = Math.min(score / maxScore, 1);
    const minHeight = 20;
    const maxHeight = 80;
    return minHeight + ratio * (maxHeight - minHeight);
  };

  const renderPillar = (pillarKey: 'hour' | 'day' | 'month' | 'year', isEmpty: boolean = false) => {
    if (isEmpty) {
      return (
        <div className="flex flex-col text-center text-sm md:text-base">
          <div className="font-bold text-gray-400 py-2.5">시주</div>
          <div className="py-2 h-14 flex items-center justify-center border-t border-gray-200">
            <span className="text-gray-400 text-sm">-</span>
          </div>
          <div className="flex justify-center items-center py-4 min-h-[120px]">
            <div className="w-20 h-20 flex items-center justify-center text-4xl font-bold rounded shadow-md bg-gray-100 text-gray-300 border border-gray-300">
              -
            </div>
          </div>
          <div className="flex flex-col justify-end items-center gap-1 py-4 min-h-[180px]">
            <div className="w-12 h-12 flex items-center justify-center text-2xl font-bold rounded shadow-md bg-gray-100 text-gray-300 border border-gray-300">
              -
            </div>
          </div>
        </div>
      );
    }

    const pillar = pillars[pillarKey];
    const pillarLabels = {
      year: '년주',
      month: '월주',
      day: '일주',
      hour: '시주',
    };
    const ganjiLabels = {
      year: '甲子',
      month: '戊寅',
      day: '戊寅',
      hour: '丁巳',
    };

    const positionKeyMap = {
      year: { stem: 'YEAR_STEM', branch: 'YEAR_BRANCH' },
      month: { stem: 'MONTH_STEM', branch: 'MONTH_BRANCH' },
      day: { stem: 'DAY_STEM', branch: 'DAY_BRANCH' },
      hour: { stem: 'HOUR_STEM', branch: 'HOUR_BRANCH' },
    } as const;

    const stemCell = getStemCell(positionKeyMap[pillarKey].stem as PositionKey);
    const hiddenStemCells = getHiddenStemCells(positionKeyMap[pillarKey].branch as PositionKey);

    const ganColor = ohaengColorMap[pillar.cheonGan.ohaeng];
    const isDayMaster = pillarKey === 'day';

    // 천간 크기 (고정)
    const stemSize = getStemSize();

    return (
      <div key={pillarKey} className="flex flex-col text-center text-sm md:text-base">
        <div className="font-bold text-gray-700 py-2.5">
          {pillarLabels[pillarKey]}
          <span className="font-normal text-gray-400 text-xs ml-1">
            ({pillar.cheonGan.char}
            {pillar.jiJi.char})
          </span>
        </div>

        {/* 십신 */}
        <div className="py-2 h-14 flex items-center justify-center border-t border-gray-200">
          <span
            className={`font-semibold text-base ${
              isDayMaster ? 'text-amber-600' : 'text-gray-700'
            }`}
          >
            {isDayMaster ? '일간(日干)' : pillar.cheonGan.sibsin.name}
          </span>
        </div>

        {/* 천간 (고정 크기) */}
        <div className="flex justify-center items-center py-4 min-h-[120px]">
          <div
            className={`flex items-center justify-center font-bold rounded shadow-md saju-char-outline-small ${
              isDayMaster
                ? 'animate-heartbeat border-4 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)]'
                : ''
            } ${ganColor.bg} ${pillar.cheonGan.ohaeng === 'metal' ? 'text-gray-800' : ganColor.text} ${ganColor.border ?? ''}`}
            style={{
              width: `${stemSize}px`,
              height: `${stemSize}px`,
              fontSize: '3rem',
            }}
          >
            {pillar.cheonGan.char}
          </div>
        </div>

        {/* 지장간 (세로로 쌓기, 높이만 조정) */}
        <div className="flex flex-col justify-end items-center gap-1 py-4 min-h-[180px]">
          {hiddenStemCells.map((cell, idx) => {
            // char 형식: "子(癸)" -> "癸"만 추출
            const match = cell.char.match(/\((.)\)/);
            const hiddenStemChar = match ? match[1] : cell.char;
            const hiddenColor = ohaengColorMap[cell.ohaeng];
            const height = getHiddenStemHeight(cell.finalScore);

            // metal의 경우 text 색상 명시적으로 지정
            const textColorClass = cell.ohaeng === 'metal' ? 'text-gray-800' : hiddenColor.text;

            return (
              <div
                key={idx}
                className={`flex items-center justify-center font-bold rounded shadow-md saju-char-outline-small ${hiddenColor.bg} ${textColorClass} ${hiddenColor.border ?? ''}`}
                style={{
                  width: '48px',
                  height: `${height}px`,
                  fontSize: '1.25rem',
                }}
              >
                {hiddenStemChar}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-1 md:p-2 bg-white rounded-xl border-2 border-indigo-300 shadow-lg">
      <div className="grid grid-cols-4 divide-x divide-gray-200">
        {pillarOrder.map((key) => {
          if (key === 'hour' && isHourUnknown) {
            return (
              <React.Fragment key="hour-empty">
                {renderPillar(key, true)}
              </React.Fragment>
            );
          }
          return (
            <React.Fragment key={key}>{renderPillar(key, false)}</React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// 통근/투간 정보 표시 컴포넌트
// ============================================

interface RootingDisplayProps {
  analysis: OhaengEnergyAnalysis;
}

const RootingDisplay: React.FC<RootingDisplayProps> = ({ analysis }) => {
  const { rootingInfos, touganInfos } = analysis.phase3;

  if (rootingInfos.length === 0 && touganInfos.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 space-y-4">
      {/* 각 천간별 통근(뿌리) 정보 */}
      {rootingInfos.length > 0 && (
        <div className="p-4 bg-white/80 rounded-xl border border-green-200">
          <h5 className="text-sm font-bold text-green-800 mb-4 flex items-center gap-2">
            <span className="text-lg">🌱</span>
            천간별 통근(뿌리) 정보
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rootingInfos.map((info, idx) => {
              const positionKorean = stemKoreanPosition[info.position] || info.position;
              const isDayMaster = info.position === 'day';

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    isDayMaster ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  {/* 천간 정보 */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-8 h-8 flex items-center justify-center rounded font-bold text-lg ${
                        ohaengColorMap[info.stemOhaeng].bg
                      } ${ohaengColorMap[info.stemOhaeng].text}`}
                    >
                      {info.stem}
                    </span>
                    <span className={`font-bold ${isDayMaster ? 'text-amber-700' : 'text-gray-700'}`}>
                      {positionKorean}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({ohaengShortMap[info.stemOhaeng]})
                    </span>
                  </div>

                  {/* 뿌리 상태 */}
                  {info.hasRoot ? (
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-green-600 font-medium mb-1">
                        <span>뿌리 있음</span>
                        {!isDayMaster && (
                          <span className="text-xs text-gray-500">
                            (계수: {info.bestRootCoefficient.toFixed(1)})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 space-y-0.5">
                        {info.rootingBranches.map((root, rIdx) => (
                          <div key={rIdx} className="flex items-center gap-1">
                            <span className="text-gray-400">└</span>
                            <span className="font-medium">
                              {branchKoreanPosition[root.branchPosition]}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                                ohaengColorMap[root.hiddenStemOhaeng].bg
                              } ${ohaengColorMap[root.hiddenStemOhaeng].text}`}
                            >
                              {root.hiddenStem}
                            </span>
                            <span className="text-gray-500">
                              ({ohaengShortMap[root.hiddenStemOhaeng]})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm">
                      <span className="text-red-500 font-medium">
                        뿌리 없음 (무근)
                      </span>
                      {!isDayMaster && (
                        <span className="text-xs text-gray-500 ml-1">
                          (계수: 0.7)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 투간 정보 */}
      {touganInfos.length > 0 && (
        <div className="p-4 bg-white/80 rounded-xl border border-blue-200">
          <h5 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
            <span className="text-lg">🔼</span>
            투간(透干) 정보
          </h5>
          <div className="space-y-2 text-sm">
            {touganInfos.map((info, idx) => (
              <div key={idx} className="flex items-center gap-2 text-gray-700">
                <span className="text-xs text-gray-500">
                  {branchKoreanPosition[info.branchPosition]}
                </span>
                <span>의 지장간</span>
                <span className={`px-2 py-0.5 rounded ${ohaengColorMap[info.hiddenStemOhaeng].bg} ${ohaengColorMap[info.hiddenStemOhaeng].text} text-xs font-bold`}>
                  {info.hiddenStem}
                </span>
                <span className="mx-1">→</span>
                <span className="text-blue-600 font-medium">
                  {stemKoreanPosition[info.stemPosition]}에 투출 (x{info.multiplier.toFixed(1)})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// 메인 컴포넌트
// ============================================

const MyEnergyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  const [sajuData, setSajuData] = useState<SajuInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHourUnknown, setIsHourUnknown] = useState(false);

  // 페이지 로드 시 스크롤을 최상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // localStorage 및 DB에서 사주 데이터 불러오기
  useEffect(() => {
    const loadSajuData = async () => {
      // 1. 먼저 localStorage에서 사주 데이터 확인
      const savedData = localStorage.getItem('currentSajuData');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          setSajuData(data);
          // 시간 모름 여부 확인
          if (data.pillars?.hour?.cheonGan?.char === '-' ||
              data.birthTime === '모름' ||
              data.birthTime === '') {
            setIsHourUnknown(true);
          }
          setIsLoading(false);
          return; // localStorage에 데이터 있으면 종료
        } catch (e) {
          console.error('사주 데이터 로드 오류:', e);
        }
      }

      // 2. localStorage가 비어있고 로그인된 경우, DB에서 불러오기
      if (isSignedIn && user) {
        try {
          console.log('로그인 상태: DB에서 사주 데이터 조회 중...');
          const result = await getUserSajuRecords(user.id);

          if (result.success && result.data && result.data.length > 0) {
            console.log(`✅ DB에서 사주 데이터 ${result.data.length}개 발견!`);
            const latestRecord = result.data[0];
            const sajuInfo = latestRecord.saju_data as SajuInfo;

            // localStorage에 저장
            localStorage.setItem('currentSajuData', JSON.stringify(sajuInfo));
            console.log('✅ localStorage에 사주 데이터 저장 완료');

            setSajuData(sajuInfo);
            // 시간 모름 여부 확인
            if (sajuInfo.pillars?.hour?.cheonGan?.char === '-' ||
                sajuInfo.birthTime === '모름' ||
                sajuInfo.birthTime === '') {
              setIsHourUnknown(true);
            }
          } else {
            console.log('DB에 저장된 사주 데이터가 없습니다.');
          }
        } catch (error) {
          console.error('DB에서 사주 데이터 조회 오류:', error);
        }
      }

      setIsLoading(false);
    };

    loadSajuData();
  }, [isSignedIn, user]);

  // 오행 에너지 분석 실행
  const analysis = useMemo<OhaengEnergyAnalysis | null>(() => {
    if (!sajuData) return null;
    try {
      return analyzeOhaengEnergy(sajuData, isHourUnknown);
    } catch (e) {
      console.error('오행 에너지 분석 오류:', e);
      return null;
    }
  }, [sajuData, isHourUnknown]);

  // 백분율 계산
  const toPercentages = (scores: OhaengScores): OhaengScores => {
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    if (total === 0) return { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    return {
      wood: (scores.wood / total) * 100,
      fire: (scores.fire / total) * 100,
      earth: (scores.earth / total) * 100,
      metal: (scores.metal / total) * 100,
      water: (scores.water / total) * 100,
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!sajuData || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🔮</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">사주 데이터가 없습니다</h2>
          <p className="text-gray-600 mb-6">먼저 사주 정보를 입력해주세요.</p>
          <button
            onClick={() => navigate('/input')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
          >
            사주 입력하러 가기
          </button>
        </div>
      </div>
    );
  }

  const { phase1, phase2, phase3 } = analysis;
  const ilganOhaeng = sajuData.pillars.day.cheonGan.ohaeng;

  // Phase 1 백분율
  const phase1Percentages = toPercentages(phase1.detailedCounts);
  // Phase 2 백분율
  const phase2Percentages = phase2.weightedPercentages;
  // Phase 3 백분율
  const phase3Percentages = phase3.absolutePercentages;

  // Phase 1→2 변화량
  const phase1to2Changes: OhaengScores = {
    wood: phase2.weightedScores.wood - phase1.detailedCounts.wood,
    fire: phase2.weightedScores.fire - phase1.detailedCounts.fire,
    earth: phase2.weightedScores.earth - phase1.detailedCounts.earth,
    metal: phase2.weightedScores.metal - phase1.detailedCounts.metal,
    water: phase2.weightedScores.water - phase1.detailedCounts.water,
  };

  const maxScore = Math.max(
    ...Object.values(phase1.detailedCounts),
    ...Object.values(phase2.weightedScores),
    ...Object.values(phase3.absoluteMass)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 page-transition">
      {/* 헤더 - 데스크톱 */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="아사주달 로고"
                className="h-10 w-auto object-contain cursor-pointer"
                onClick={() => navigate('/')}
              />
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  아사주달
                </h1>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => navigate('/input', { state: { skipAutoLoad: true } })}
                className="hidden md:block px-4 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition text-sm font-bold border border-indigo-200"
              >
                다른 사주 입력
              </button>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-bold shadow-md cursor-pointer">
                    로그인
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/input" />
              </SignedIn>
            </div>
          </div>
        </div>
      </div>

      {/* 헤더 - 모바일 */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50 md:hidden">
        <div className="flex justify-between items-center px-4 h-12">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="아사주달 로고"
              className="h-8 w-auto object-contain cursor-pointer"
              onClick={() => navigate('/')}
            />
            <div className="flex items-center gap-1 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <h1 className="text-base font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                아사주달
              </h1>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-xs font-bold shadow-md cursor-pointer">
                  로그인
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/input" />
            </SignedIn>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* 페이지 타이틀 */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            나의 오행 에너지 분석
          </h1>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed">
            위치별 가중치와 통근·투간을 반영한<br/>
            <span className="font-bold text-indigo-700">정밀 오행 에너지 분석</span> 결과입니다
          </p>
          {sajuData.name && (
            <p className="mt-2 text-gray-700 font-medium">{sajuData.name}님의 사주</p>
          )}
          {isHourUnknown && (
            <p className="mt-1 text-amber-600 text-sm font-medium">(시간 모름 - 6글자 분석)</p>
          )}
        </div>

        {/* 사주 원국 표시 (ResultPage 컴포넌트 사용) */}
        <div className="mb-8 animate-fade-in">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <SajuPillarsDisplay sajuInfo={sajuData} />
          </div>
        </div>

        {/* Phase 1 */}
        <div className="mb-8">
          <PhaseCard
            phase={1}
            title="기초 오행 에너지"
            subtitle="지장간 분해 포함, 가중치 미적용"
            description="사주 8글자의 순수한 오행 분포입니다. 지지는 지장간(초기·중기·본기)으로 분해하여 계산했습니다. 아직 위치별 영향력은 반영되지 않은 상태입니다."
            color="blue"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/80 rounded-xl p-6 border border-blue-100">
                <OhaengPentagon
                  scores={phase1.detailedCounts}
                  maxScore={maxScore}
                  title="기초 오행 분포"
                  ilganOhaeng={ilganOhaeng}
                />
              </div>
              <div className="bg-white/80 rounded-xl p-6 border border-blue-100">
                <h4 className="text-lg font-bold text-blue-800 mb-4 text-center">오행별 기초 점수</h4>
                <OhaengBarChart
                  scores={phase1.detailedCounts}
                  percentages={phase1Percentages}
                />
              </div>
            </div>
          </PhaseCard>
        </div>

        {/* 화살표 */}
        <div className="flex justify-center mb-8 animate-bounce">
          <div className="text-4xl text-purple-500">↓</div>
        </div>

        {/* Phase 2 */}
        <div className="mb-8">
          <PhaseCard
            phase={2}
            title="가중치 적용 오행 에너지"
            subtitle="위치별 가중치 + 월령 사령 보너스"
            description={`위치별 영향력(월지 3.0, 일지 1.5 등)을 적용했습니다. 월령 사령 오행(${ohaengKoreanMap[phase2.saryeongOhaeng]})에는 1.5배 보너스가 적용됩니다.`}
            color="purple"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/80 rounded-xl p-6 border border-purple-100">
                <OhaengPentagon
                  scores={phase2.weightedScores}
                  maxScore={maxScore}
                  title="가중치 적용 분포"
                  ilganOhaeng={ilganOhaeng}
                />
              </div>
              <div className="bg-white/80 rounded-xl p-6 border border-purple-100">
                <h4 className="text-lg font-bold text-purple-800 mb-4 text-center">가중치 적용 점수</h4>
                <OhaengBarChart
                  scores={phase2.weightedScores}
                  percentages={phase2Percentages}
                />
              </div>
            </div>

            {/* 적용된 가중치 정보 */}
            <div className="mt-6 p-4 bg-white/80 rounded-xl border border-purple-100">
              <h5 className="text-sm font-bold text-purple-800 mb-3">적용된 가중치</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-2 bg-purple-50 rounded text-center">
                  <div className="text-gray-600">월지</div>
                  <div className="font-bold text-purple-700">×3.0</div>
                </div>
                <div className="p-2 bg-purple-50 rounded text-center">
                  <div className="text-gray-600">일지</div>
                  <div className="font-bold text-purple-700">×1.5</div>
                </div>
                <div className="p-2 bg-purple-50 rounded text-center">
                  <div className="text-gray-600">월간</div>
                  <div className="font-bold text-purple-700">×1.2</div>
                </div>
                <div className="p-2 bg-purple-50 rounded text-center">
                  <div className="text-gray-600">사령 보너스</div>
                  <div className="font-bold text-purple-700">×1.5</div>
                </div>
              </div>
            </div>

            {/* 월령 사령 계산 설명 */}
            {phase2.saryeongDetail && phase2.saryeongDetail.description && (
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">📅</span>
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-bold text-purple-800 mb-1">월령 사령 계산</h5>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {phase2.saryeongDetail.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <ChangeIndicator changes={phase1to2Changes} fromPhase={1} toPhase={2} />
          </PhaseCard>
        </div>

        {/* 화살표 */}
        <div className="flex justify-center mb-8 animate-bounce">
          <div className="text-4xl text-green-500">↓</div>
        </div>

        {/* Phase 3 */}
        <div className="mb-8">
          <PhaseCard
            phase={3}
            title="절대질량 (최종 에너지)"
            subtitle="통근·투간 적용"
            description="천간의 통근(뿌리) 여부와 지장간의 투간 여부를 반영한 최종 오행 에너지입니다. 통근이 있으면 에너지가 증폭되고, 없으면 감소합니다(무근 0.7배)."
            color="green"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/80 rounded-xl p-6 border border-green-100">
                <OhaengPentagon
                  scores={phase3.absoluteMass}
                  maxScore={maxScore}
                  title="절대질량 분포"
                  ilganOhaeng={ilganOhaeng}
                />
              </div>
              <div className="bg-white/80 rounded-xl p-6 border border-green-100">
                <h4 className="text-lg font-bold text-green-800 mb-4 text-center">절대질량 점수</h4>
                <OhaengBarChart
                  scores={phase3.absoluteMass}
                  percentages={phase3Percentages}
                />
              </div>
            </div>

            {/* 통근/투간 정보 */}
            <RootingDisplay analysis={analysis} />

            <ChangeIndicator changes={phase3.changeFromPhase2} fromPhase={2} toPhase={3} />
          </PhaseCard>
        </div>

        {/* 요약 비교 */}
        <div className="mb-8 p-6 md:p-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-2xl border-2 border-gray-200 shadow-lg animate-fade-in">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 text-center">
            Phase별 에너지 비교
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <OhaengPentagon
                scores={phase1.detailedCounts}
                maxScore={maxScore}
                title="Phase 1: 기초"
                ilganOhaeng={ilganOhaeng}
              />
            </div>
            <div className="text-center">
              <OhaengPentagon
                scores={phase2.weightedScores}
                maxScore={maxScore}
                title="Phase 2: 가중치"
                ilganOhaeng={ilganOhaeng}
              />
            </div>
            <div className="text-center">
              <OhaengPentagon
                scores={phase3.absoluteMass}
                maxScore={maxScore}
                title="Phase 3: 절대질량"
                ilganOhaeng={ilganOhaeng}
              />
            </div>
          </div>
        </div>

        {/* 지장간 원국 (최종 질량 반영) */}
        <div className="mb-8 animate-fade-in">
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border-2 border-indigo-300 p-6 md:p-8 shadow-xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                최종 질량 원국 (지장간 분해)
              </h2>
              <p className="text-base md:text-lg text-gray-600">
                통근·투간이 반영된 최종 에너지를 <span className="font-bold text-indigo-700">크기</span>로 표현합니다
              </p>
              <p className="text-sm text-gray-500 mt-2">
                천간은 큰 네모, 지지는 지장간별 작은 네모로 표시됩니다
              </p>
            </div>
            <JijangganPillarsDisplay
              finalMatrix={phase3.finalMatrix}
              sajuInfo={sajuData}
            />
          </div>
        </div>

        {/* 대시보드로 돌아가기 버튼 */}
        <div className="text-center animate-fade-in">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>대시보드로 돌아가기</span>
          </button>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              아사주달의 분석을 통해 건강과 행복이 함께 하시길 기원합니다.
            </p>
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} asajudal.com. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MyEnergyPage;
