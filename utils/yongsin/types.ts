/**
 * 용신 분석 시스템 타입 정의
 */

import type { SajuInfo, Ohaeng, Pillar } from '../../types';

// ============================================
// 기본 타입
// ============================================

export interface SajuInput {
  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    hour: Pillar;
  };
  birthDate: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
}

export interface OhaengScores {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

// ============================================
// 상호작용 (합/충)
// ============================================

export interface Interaction {
  type: 'hab' | 'chung';
  description: string;
  elements: string[];
}

export interface Interactions {
  habs: Interaction[];
  chungs: Interaction[];
}

// ============================================
// Phase 1: 오행 세력 분석
// ============================================

export interface Phase1Result {
  basicCounts: OhaengScores;
  adjustedScores: OhaengScores;
  interactions: Interactions;
}

// ============================================
// Phase 2: 신강/신약 판정
// ============================================

export type StrengthLevel = 'extreme_strong' | 'strong' | 'neutral' | 'weak' | 'extreme_weak';

export interface StrengthResult {
  level: StrengthLevel;
  index: number; // -50 ~ +50
  deukryeong: boolean; // 득령 (월령을 얻음)
  deukji: boolean; // 득지 (지지에 뿌리)
  deukseScore: number; // 득세 (천간 동류)
  supportScore: number; // 아군 (인성+비겁)
  opposeScore: number; // 적군 (식상+재관)
}

// ============================================
// Phase 2 전체 결과
// ============================================

export interface Phase2Result {
  phase1: Phase1Result;
  strength: StrengthResult;
}
