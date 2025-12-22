/**
 * ============================================
 * 오행 에너지 분석 모듈
 * ============================================
 *
 * Phase 1: 기초 오행 카운트 (가중치 없음)
 * Phase 2: 위치별 가중치 적용
 * Phase 3: 통근/투간 적용 → 절대질량
 */

// 메인 분석 함수 및 개별 Phase 함수
export {
  analyzeOhaengEnergy,
  calculatePhase1,
  calculatePhase2,
  calculatePhase3,
  createEmptyScores,
  toPercentages,
} from './energyCalculator';

// 타입 정의
export type {
  OhaengScores,
  PositionKey,
  Phase1Result,
  Phase2Result,
  Phase3Result,
  OhaengEnergyAnalysis,
  EnergyMatrixCell,
  RootingInfo,
  TouganInfo,
  OhaengDisplayInfo,
  PhaseTransition,
} from './types';

// 가중치 설정 (수정 가능)
export {
  POSITION_WEIGHTS,
  HIDDEN_STEM_RATIO,
  SARYEONG_MULTIPLIER,
  ROOTING_COEFFICIENT,
  TOUGAN_MULTIPLIER,
  INTERACTION_WEIGHTS,
  STRENGTH_THRESHOLDS,
  JIJANGGAN_DATA,
  STEM_OHAENG,
  BRANCH_OHAENG,
  MONTH_SARYEONG,
  ROOTING_MAP,
} from './weights';
