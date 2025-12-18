/**
 * ============================================
 * 오행 세력표 디스플레이 컴포넌트
 * ============================================
 * 
 * - 기본 오행 숫자 표시
 * - 가중치 적용된 세력표 토글
 * - 신강/신약 판정 결과 표시
 */

import React, { useState, useMemo } from 'react';
import type { SajuInfo, Ohaeng } from '../types';
import { analyzePhase2 } from '../utils/yongsin';
import type { SajuInput, Phase1Result, StrengthResult, OhaengScores } from '../utils/yongsin/types';

// ============================================
// 타입 정의
// ============================================

interface OhaengForceDisplayProps {
  sajuInfo: SajuInfo;
  isHourUnknown?: boolean;
}

// ============================================
// 상수 및 유틸리티
// ============================================

const ohaengColorMap: Record<Ohaeng, { bg: string; text: string; border?: string }> = {
  wood: { bg: 'bg-green-600', text: 'text-white', border: 'border-green-700' },
  fire: { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600' },
  earth: { bg: 'bg-yellow-500', text: 'text-white', border: 'border-yellow-600' },
  metal: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
  water: { bg: 'bg-gray-900', text: 'text-white', border: 'border-gray-800' },
};

const ohaengKoreanMap: Record<Ohaeng, string> = {
  wood: '목(木)',
  fire: '화(火)',
  earth: '토(土)',
  metal: '금(金)',
  water: '수(水)',
};

const ohaengColors: Record<Ohaeng, string> = {
  wood: '#00B050',
  fire: '#FF0000',
  earth: '#FEC100',
  metal: '#9CA3AF',
  water: '#000000',
};

// SajuInfo를 SajuInput으로 변환
function convertToSajuInput(sajuInfo: SajuInfo): SajuInput {
  return {
    pillars: {
      year: sajuInfo.pillars.year,
      month: sajuInfo.pillars.month,
      day: sajuInfo.pillars.day,
      hour: sajuInfo.pillars.hour,
    },
    birthDate: sajuInfo.birthDate,
  } as SajuInput;
}

// ============================================
// 오행 다이어그램 (별 모양)
// ============================================

interface OhaengDiagramProps {
  scores: OhaengScores;
  maxScore: number;
  ilganOhaeng?: Ohaeng;
  isWeighted?: boolean;
}

const OhaengDiagram: React.FC<OhaengDiagramProps> = ({
  scores,
  maxScore,
  ilganOhaeng,
  isWeighted = false,
}) => {
  // 원 크기 계산 (점수에 비례)
  const getCircleRadius = (score: number): number => {
    if (isWeighted) {
      // 가중치 적용 시: 점수 범위가 넓으므로 스케일 조정
      const ratio = Math.min(score / Math.max(maxScore, 1), 1);
      return 6 + ratio * 14; // 6 ~ 20
    } else {
      // 기본 숫자: 0~8 범위
      if (score === 0) return 4;
      if (score <= 2) return 6 + score * 2;
      return Math.min(10 + score * 1.5, 20);
    }
  };

  const getFontSize = (score: number): string => {
    const radius = getCircleRadius(score);
    if (radius <= 6) return '5px';
    if (radius <= 10) return '7px';
    return '9px';
  };

  const centerX = 50;
  const centerY = 50;
  const radius = 35;

  const ohaengOrder: Ohaeng[] = ['wood', 'fire', 'earth', 'metal', 'water'];
  
  // 일간 오행에 따라 회전
  const getRotationIndex = (): number => {
    if (!ilganOhaeng) return 0;
    const index = ohaengOrder.indexOf(ilganOhaeng);
    return index >= 0 ? index : 0;
  };

  const rotationIndex = getRotationIndex();
  const rotatedOhaengOrder = [
    ...ohaengOrder.slice(rotationIndex),
    ...ohaengOrder.slice(0, rotationIndex),
  ];

  // 십신 이름
  const getSibsinName = (ohaeng: Ohaeng): string => {
    if (!ilganOhaeng) return '';
    const ilganIndex = ohaengOrder.indexOf(ilganOhaeng);
    const targetIndex = ohaengOrder.indexOf(ohaeng);
    if (ilganIndex < 0 || targetIndex < 0) return '';

    const diff = (targetIndex - ilganIndex + 5) % 5;
    const sibsinNames = ['비겁', '식상', '재성', '관성', '인성'];
    return sibsinNames[diff];
  };

  // 오각형 위치
  const basePositions = [
    { x: centerX, y: centerY - radius },
    { x: centerX + radius * Math.sin((2 * Math.PI) / 5), y: centerY - radius * Math.cos((2 * Math.PI) / 5) },
    { x: centerX + radius * Math.sin((4 * Math.PI) / 5), y: centerY + radius * Math.cos(Math.PI / 5) },
    { x: centerX - radius * Math.sin((4 * Math.PI) / 5), y: centerY + radius * Math.cos(Math.PI / 5) },
    { x: centerX - radius * Math.sin((2 * Math.PI) / 5), y: centerY - radius * Math.cos((2 * Math.PI) / 5) },
  ];

  const ohaengPositions = rotatedOhaengOrder.map((ohaeng, idx) => ({
    ohaeng,
    korean: ohaengKoreanMap[ohaeng].charAt(0),
    x: basePositions[idx].x,
    y: basePositions[idx].y,
  }));

  // 상생/상극 경로
  const sangsaengPaths = [
    { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
    { from: 3, to: 4 }, { from: 4, to: 0 },
  ];

  const sanggeukPaths = [
    { from: 0, to: 2 }, { from: 1, to: 3 }, { from: 2, to: 4 },
    { from: 3, to: 0 }, { from: 4, to: 1 },
  ];

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 100" className="w-48 h-48 md:w-56 md:h-56">
        {/* 상생 관계 (외곽) */}
        {sangsaengPaths.map((path, idx) => {
          const from = ohaengPositions[path.from];
          const to = ohaengPositions[path.to];
          const fromRadius = getCircleRadius(scores[from.ohaeng]);
          const toRadius = getCircleRadius(scores[to.ohaeng]);
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          return (
            <line
              key={`sangsaeng-${idx}`}
              x1={from.x + (dx / dist) * fromRadius}
              y1={from.y + (dy / dist) * fromRadius}
              x2={to.x - (dx / dist) * toRadius}
              y2={to.y - (dy / dist) * toRadius}
              stroke="#666"
              strokeWidth="0.5"
            />
          );
        })}

        {/* 상극 관계 (내부 별) */}
        {sanggeukPaths.map((path, idx) => {
          const from = ohaengPositions[path.from];
          const to = ohaengPositions[path.to];
          const fromRadius = getCircleRadius(scores[from.ohaeng]);
          const toRadius = getCircleRadius(scores[to.ohaeng]);
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          return (
            <line
              key={`sanggeuk-${idx}`}
              x1={from.x + (dx / dist) * fromRadius}
              y1={from.y + (dy / dist) * fromRadius}
              x2={to.x - (dx / dist) * toRadius}
              y2={to.y - (dy / dist) * toRadius}
              stroke="#999"
              strokeWidth="0.3"
              strokeDasharray="2,2"
            />
          );
        })}

        {/* 오행 원들 */}
        {ohaengPositions.map((pos, idx) => {
          const color = ohaengColors[pos.ohaeng];
          const score = scores[pos.ohaeng];
          const circleRadius = getCircleRadius(score);
          const fontSize = getFontSize(score);
          const sibsinName = getSibsinName(pos.ohaeng);
          const isIlgan = idx === 0;

          const textOffsets = [
            { x: 0, y: -circleRadius - 6 },
            { x: circleRadius + 8, y: 0 },
            { x: circleRadius + 4, y: 6 },
            { x: -circleRadius - 4, y: 6 },
            { x: -circleRadius - 8, y: 0 },
          ];
          const textOffset = textOffsets[idx];

          return (
            <g key={pos.ohaeng}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={circleRadius}
                fill={color}
                stroke={pos.ohaeng === 'metal' ? '#666' : color}
                strokeWidth={isIlgan ? 2 : 1}
              />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={pos.ohaeng === 'metal' ? '#333' : 'white'}
                fontSize={fontSize}
                fontWeight="bold"
              >
                {pos.korean}
              </text>
              {/* 점수/숫자 */}
              <text
                x={pos.x}
                y={pos.y + circleRadius + 4}
                textAnchor="middle"
                fill="#666"
                fontSize="6px"
                fontWeight="bold"
              >
                {isWeighted ? score.toFixed(1) : score}
              </text>
              {/* 십신 */}
              <text
                x={pos.x + textOffset.x}
                y={pos.y + textOffset.y}
                textAnchor="middle"
                fill={isIlgan ? '#4F46E5' : '#666'}
                fontSize="5px"
                fontWeight={isIlgan ? 'bold' : 'normal'}
              >
                {sibsinName}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 text-center">
        <h5 className="text-sm font-semibold text-gray-700">
          {isWeighted ? '가중치 적용 오행표' : '오행 상생·상극 관계'}
        </h5>
      </div>
    </div>
  );
};

// ============================================
// 오행 점수 바 차트
// ============================================

interface OhaengBarChartProps {
  scores: OhaengScores;
  percentages: OhaengScores;
  isWeighted?: boolean;
}

const OhaengBarChart: React.FC<OhaengBarChartProps> = ({
  scores,
  percentages,
  isWeighted = false,
}) => {
  const ohaengOrder: Ohaeng[] = ['wood', 'fire', 'earth', 'metal', 'water'];

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
              {ohaengKoreanMap[ohaeng].charAt(0)}
            </div>
            {/* 바 차트 */}
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">
                  {ohaengKoreanMap[ohaeng]}
                </span>
                <span className="font-bold text-gray-900">
                  {isWeighted ? score.toFixed(1) : score} ({pct.toFixed(1)}%)
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
// 신강/신약 결과 표시
// ============================================

interface StrengthDisplayProps {
  strength: StrengthResult;
}

const StrengthDisplay: React.FC<StrengthDisplayProps> = ({ strength }) => {
  const levelConfig = {
    extreme_strong: { emoji: '🔥🔥', label: '태왕 (극신강)', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-300' },
    strong: { emoji: '🔥', label: '신강 (身强)', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-300' },
    neutral: { emoji: '⚖️', label: '중화 (中和)', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-300' },
    weak: { emoji: '💧', label: '신약 (身弱)', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-300' },
    extreme_weak: { emoji: '💧💧', label: '태약 (극신약)', color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-300' },
  };

  const config = levelConfig[strength.level];

  const interpretations = {
    extreme_strong: '일간이 극도로 강합니다. 종왕격/종강격 가능성이 있으며, 설기(식상)나 재관으로 기운을 분산시키는 것이 좋습니다.',
    strong: '일간이 강합니다. 재물이나 관직 운에서 힘을 발휘할 수 있으며, 식상이나 재성 운에서 성과를 낼 수 있습니다.',
    neutral: '일간이 중화 상태로 가장 이상적인 균형입니다. 대운과 세운의 흐름에 따라 유연하게 대응할 수 있습니다.',
    weak: '일간이 약합니다. 인성이나 비겁의 도움이 필요하며, 무리한 확장보다는 내실을 다지는 것이 좋습니다.',
    extreme_weak: '일간이 극도로 약합니다. 종격(종재/종살/종아) 가능성이 있으며, 강한 오행을 따르는 것이 유리할 수 있습니다.',
  };

  return (
    <div className={`rounded-xl border-2 ${config.borderColor} ${config.bgColor} p-5`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-gray-800">신강/신약 판정</h4>
        <div className={`text-2xl font-bold ${config.color} flex items-center gap-2`}>
          <span>{config.emoji}</span>
          <span>{config.label}</span>
        </div>
      </div>

      {/* 지수 바 */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">신강약 지수</span>
          <span className="font-bold">{strength.index.toFixed(1)}</span>
        </div>
        <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          {/* 중화 범위 표시 */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1/5 h-full bg-green-200 opacity-50" />
          {/* 지수 표시 */}
          <div
            className={`absolute top-0 h-full w-1 ${config.color.replace('text', 'bg')}`}
            style={{
              left: `${Math.min(Math.max((strength.index + 50) / 100 * 100, 0), 100)}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>태약 (-50)</span>
          <span>중화 (0)</span>
          <span>태왕 (+50)</span>
        </div>
      </div>

      {/* 3대 요소 */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-sm text-gray-600 mb-1">득령</div>
          <div className={`text-lg font-bold ${strength.deukryeong ? 'text-green-600' : 'text-gray-400'}`}>
            {strength.deukryeong ? '✓' : '✗'}
          </div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-sm text-gray-600 mb-1">득지</div>
          <div className={`text-lg font-bold ${strength.deukji ? 'text-green-600' : 'text-gray-400'}`}>
            {strength.deukji ? '✓' : '✗'}
          </div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-sm text-gray-600 mb-1">득세</div>
          <div className={`text-lg font-bold ${strength.deukseScore >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {strength.deukseScore >= 0 ? '+' : ''}{strength.deukseScore.toFixed(1)}
          </div>
        </div>
      </div>

      {/* 점수 상세 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-white rounded-lg shadow-sm">
          <div className="text-sm text-gray-600">아군 (인성+비겁)</div>
          <div className="text-xl font-bold text-blue-600">{strength.supportScore.toFixed(1)}</div>
        </div>
        <div className="p-3 bg-white rounded-lg shadow-sm">
          <div className="text-sm text-gray-600">적군 (식상+재관)</div>
          <div className="text-xl font-bold text-red-500">{strength.opposeScore.toFixed(1)}</div>
        </div>
      </div>

      {/* 해석 */}
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <p className="text-sm text-gray-700 leading-relaxed">
          {interpretations[strength.level]}
        </p>
      </div>
    </div>
  );
};

// ============================================
// 합/충 표시
// ============================================

interface InteractionsDisplayProps {
  phase1: Phase1Result;
}

const InteractionsDisplay: React.FC<InteractionsDisplayProps> = ({ phase1 }) => {
  const { habs, chungs } = phase1.interactions;

  if (habs.length === 0 && chungs.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h5 className="text-sm font-bold text-gray-700 mb-3">합(合)/충(沖) 상호작용</h5>
      <div className="space-y-2 text-sm">
        {habs.map((hab, idx) => (
          <div key={`hab-${idx}`} className="flex items-center gap-2 text-green-700">
            <span className="text-green-500">✓</span>
            <span>{hab.description}</span>
          </div>
        ))}
        {chungs.map((chung, idx) => (
          <div key={`chung-${idx}`} className="flex items-center gap-2 text-red-700">
            <span className="text-red-500">✗</span>
            <span>{chung.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// 메인 컴포넌트
// ============================================

const OhaengForceDisplay: React.FC<OhaengForceDisplayProps> = ({
  sajuInfo,
  isHourUnknown = false,
}) => {
  const [showWeighted, setShowWeighted] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const { pillars } = sajuInfo;
  const ilganOhaeng = pillars.day.cheonGan.ohaeng;

  // 기본 오행 숫자 계산
  const basicCounts = useMemo(() => {
    const counts: OhaengScores = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    
    (Object.keys(pillars) as Array<keyof typeof pillars>).forEach((key) => {
      const pillar = pillars[key];
      if (key === 'hour' && isHourUnknown) return;
      counts[pillar.cheonGan.ohaeng]++;
      counts[pillar.jiJi.ohaeng]++;
    });
    
    return counts;
  }, [pillars, isHourUnknown]);

  // 기본 오행 백분율
  const basicPercentages = useMemo(() => {
    const total = Object.values(basicCounts).reduce((a, b) => a + b, 0);
    const pct: OhaengScores = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    if (total > 0) {
      (Object.keys(basicCounts) as Ohaeng[]).forEach((k) => {
        pct[k] = (basicCounts[k] / total) * 100;
      });
    }
    return pct;
  }, [basicCounts]);

  // Phase 2 분석 결과
  const analysisResult = useMemo(() => {
    try {
      const input = convertToSajuInput(sajuInfo);
      return analyzePhase2(input);
    } catch (e) {
      console.error('Phase 2 분석 오류:', e);
      return null;
    }
  }, [sajuInfo]);

  // 가중치 적용된 점수
  const weightedScores = analysisResult?.phase1.adjustedScores || basicCounts;
  
  // 가중치 적용된 백분율
  const weightedPercentages = useMemo(() => {
    const total = Object.values(weightedScores).reduce((a, b) => a + b, 0);
    const pct: OhaengScores = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    if (total > 0) {
      (Object.keys(weightedScores) as Ohaeng[]).forEach((k) => {
        pct[k] = (weightedScores[k] / total) * 100;
      });
    }
    return pct;
  }, [weightedScores]);

  // 현재 표시할 점수/백분율
  const currentScores = showWeighted ? weightedScores : basicCounts;
  const currentPercentages = showWeighted ? weightedPercentages : basicPercentages;
  const maxScore = Math.max(...Object.values(currentScores));

  return (
    <div className="mt-8 glass-card">
      {/* 헤더 */}
      <button
        className="w-full p-4 md:p-6 text-left flex justify-between items-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border-2 border-indigo-200 relative z-10"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
          오행 세력 분석
        </h3>
        <svg
          className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="p-4 md:p-6 pt-0 animate-fade-in-fast">
          {/* 토글 버튼 */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-white shadow-sm">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  !showWeighted
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setShowWeighted(false)}
              >
                기본 오행
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  showWeighted
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setShowWeighted(true)}
              >
                가중치 적용
              </button>
            </div>
          </div>

          {/* 메인 컨텐츠 */}
          <div className="bg-white/80 p-6 rounded-xl border-2 border-indigo-200 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 왼쪽: 다이어그램 */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">
                  {showWeighted ? '가중치 적용 오행표' : '기본 오행표'}
                </h4>
                <div className="flex items-center justify-center">
                  <OhaengDiagram
                    scores={currentScores}
                    maxScore={maxScore}
                    ilganOhaeng={ilganOhaeng}
                    isWeighted={showWeighted}
                  />
                </div>
              </div>

              {/* 오른쪽: 바 차트 */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 p-6">
                <h4 className="text-lg font-bold text-indigo-800 mb-4 text-center">
                  오행별 세력
                </h4>
                <OhaengBarChart
                  scores={currentScores}
                  percentages={currentPercentages}
                  isWeighted={showWeighted}
                />
              </div>
            </div>

            {/* 합/충 표시 (가중치 적용 시에만) */}
            {showWeighted && analysisResult && (
              <InteractionsDisplay phase1={analysisResult.phase1} />
            )}
          </div>

          {/* 신강/신약 판정 (가중치 적용 시에만) */}
          {showWeighted && analysisResult && (
            <div className="mt-6">
              <StrengthDisplay strength={analysisResult.strength} />
            </div>
          )}

          {/* 안내 문구 */}
          {!showWeighted && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                💡 <strong>가중치 적용</strong> 버튼을 누르면 위치별 영향력, 지장간, 합/충 등을 반영한
                정밀한 오행 세력과 신강/신약 판정 결과를 확인할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OhaengForceDisplay;
