/**
 * ============================================
 * 오행 에너지 분석 타입 정의
 * ============================================
 */

import type { Ohaeng, Pillar, SajuInfo } from '../../types';

// ============================================
// 기본 타입
// ============================================

/** 오행별 점수 (목/화/토/금/수) */
export interface OhaengScores {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

/** 8글자 위치 키 */
export type PositionKey =
  | 'YEAR_STEM' | 'YEAR_BRANCH'
  | 'MONTH_STEM' | 'MONTH_BRANCH'
  | 'DAY_STEM' | 'DAY_BRANCH'
  | 'HOUR_STEM' | 'HOUR_BRANCH';

// ============================================
// Phase 1: 기초 오행 카운트
// ============================================

/** Phase 1 결과: 순수 오행 개수 */
export interface Phase1Result {
  /** 천간/지지별 오행 개수 (가중치 없음) */
  basicCounts: OhaengScores;
  /** 지장간까지 분해한 오행 비율 (가중치 없음) */
  detailedCounts: OhaengScores;
  /** 각 위치별 오행 정보 */
  positionOhaeng: Record<PositionKey, {
    char: string;
    ohaeng: Ohaeng;
    score: number;
  }>;
}

// ============================================
// Phase 2: 위치별 가중치 적용
// ============================================

/** 위치별 에너지 매트릭스 셀 */
export interface EnergyMatrixCell {
  position: PositionKey;
  char: string;
  ohaeng: Ohaeng;
  baseScore: number;      // 기본 점수 (천간 1.0, 지지는 지장간 비율)
  positionWeight: number; // 위치 가중치
  weightedScore: number;  // 가중치 적용 점수
  isSaryeong?: boolean;   // 월령 사령 여부
  saryeongBonus?: number; // 사령 보너스
  finalScore: number;     // 최종 점수
}

/** 월령 사령 계산 상세 정보 */
export interface SaryeongDetail {
  /** 절입일 (예: "1975-02-04") */
  jeolipDate: string;
  /** 절기 이름 (예: "입춘") */
  jeolgiName: string;
  /** 절입일로부터 경과일수 */
  daysFromJeolip: number;
  /** 해당 지장간 구간 */
  jijangganPeriod: 'initial' | 'middle' | 'main';
  /** 해당 지장간 천간 */
  jijangganStem: string;
  /** 사령 오행 */
  saryeongOhaeng: Ohaeng;
  /** 설명 메시지 */
  description: string;
}

/** Phase 2 결과: 위치별 가중치 적용 */
export interface Phase2Result {
  /** 에너지 매트릭스 (8글자 각각의 상세 정보) */
  matrix: EnergyMatrixCell[];
  /** 가중치 적용 오행 점수 */
  weightedScores: OhaengScores;
  /** 가중치 적용 오행 백분율 */
  weightedPercentages: OhaengScores;
  /** 월지 사령 오행 */
  saryeongOhaeng: Ohaeng;
  /** 월령 사령 계산 상세 정보 */
  saryeongDetail: SaryeongDetail;
  /** 적용된 가중치 정보 (디버깅/표시용) */
  appliedWeights: {
    positionWeights: Record<PositionKey, number>;
    saryeongMultiplier: number;
  };
}

// ============================================
// Phase 3: 통근/투간 적용 - 절대질량
// ============================================

/** 천간 통근 정보 */
export interface RootingInfo {
  stem: string;           // 천간 글자
  stemOhaeng: Ohaeng;     // 천간 오행
  position: 'year' | 'month' | 'day' | 'hour'; // 천간 위치
  rootingBranches: {      // 통근하는 지지들
    branch: string;
    branchPosition: 'year' | 'month' | 'day' | 'hour';
    hiddenStem: string;   // 뿌리가 되는 지장간 천간
    hiddenStemOhaeng: Ohaeng; // 지장간 오행
    coefficient: number;  // 통근 계수 (월지 1.5, 일지 1.3 등)
  }[];
  hasRoot: boolean;       // 뿌리 있음 여부
  bestRootCoefficient: number; // 가장 강한 통근 계수
}

/** 지장간 투간 정보 */
export interface TouganInfo {
  branch: string;           // 지지 글자
  branchPosition: 'year' | 'month' | 'day' | 'hour';
  hiddenStem: string;       // 지장간 천간
  hiddenStemOhaeng: Ohaeng; // 지장간 오행
  penetratedToStem: string; // 투출된 천간
  stemPosition: 'year' | 'month' | 'day' | 'hour';
  multiplier: number;       // 투간 배율
}

/** Phase 3 결과: 절대질량 */
export interface Phase3Result {
  /** 통근 정보 (일간 제외 천간 3개) */
  rootingInfos: RootingInfo[];
  /** 투간 정보 */
  touganInfos: TouganInfo[];
  /** 통근/투간 적용 후 오행 점수 (절대질량) */
  absoluteMass: OhaengScores;
  /** 절대질량 백분율 */
  absolutePercentages: OhaengScores;
  /** Phase 2 대비 변화량 */
  changeFromPhase2: OhaengScores;
  /** 통근/투간 보정이 적용된 개별 점수 매트릭스 (천간 + 지장간) */
  finalMatrix: EnergyMatrixCell[];
}

// ============================================
// 종합 분석 결과
// ============================================

/** 전체 오행 에너지 분석 결과 */
export interface OhaengEnergyAnalysis {
  /** 입력 사주 정보 요약 */
  input: {
    pillars: {
      year: { gan: string; ji: string };
      month: { gan: string; ji: string };
      day: { gan: string; ji: string };
      hour: { gan: string; ji: string };
    };
    ilgan: string;
    ilganOhaeng: Ohaeng;
  };

  /** Phase 1: 기초 카운트 */
  phase1: Phase1Result;

  /** Phase 2: 가중치 적용 */
  phase2: Phase2Result;

  /** Phase 3: 절대질량 */
  phase3: Phase3Result;

  /** 분석 메타 정보 */
  meta: {
    calculatedAt: string;
    version: string;
  };
}

// ============================================
// 시각화용 타입
// ============================================

/** 오행 표시 정보 */
export interface OhaengDisplayInfo {
  ohaeng: Ohaeng;
  korean: string;      // '목', '화', '토', '금', '수'
  hanja: string;       // '木', '火', '土', '金', '水'
  color: string;       // hex 색상
  score: number;
  percentage: number;
}

/** Phase 간 변화 표시 정보 */
export interface PhaseTransition {
  fromPhase: number;
  toPhase: number;
  changes: {
    ohaeng: Ohaeng;
    before: number;
    after: number;
    diff: number;
    diffPercentage: number;
  }[];
}
