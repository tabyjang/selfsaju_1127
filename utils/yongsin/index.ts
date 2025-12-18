/**
 * 용신 분석 메인 로직
 */

import type { Ohaeng } from '../../types';
import type {
  SajuInput,
  OhaengScores,
  Phase1Result,
  Phase2Result,
  StrengthResult,
  Interactions,
} from './types';

// ============================================
// Phase 1: 오행 세력 분석
// ============================================

function analyzePhase1(input: SajuInput): Phase1Result {
  const { pillars } = input;

  // 기본 오행 개수 계산
  const basicCounts: OhaengScores = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  // 천간과 지지 카운트
  Object.values(pillars).forEach((pillar) => {
    basicCounts[pillar.cheonGan.ohaeng]++;
    basicCounts[pillar.jiJi.ohaeng]++;
  });

  // 가중치 적용 점수 (Phase 2에서 정밀 구현 예정)
  const adjustedScores: OhaengScores = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  // 위치별 가중치 적용
  const weights = {
    year: { gan: 0.8, ji: 1.0 },
    month: { gan: 1.2, ji: 3.0 }, // 월지가 가장 중요
    day: { gan: 1.0, ji: 1.5 },
    hour: { gan: 0.8, ji: 1.2 },
  };

  Object.entries(pillars).forEach(([key, pillar]) => {
    const weight = weights[key as keyof typeof weights];
    adjustedScores[pillar.cheonGan.ohaeng] += weight.gan;
    adjustedScores[pillar.jiJi.ohaeng] += weight.ji;
  });

  // 합/충 상호작용 (간단한 구현, 나중에 정밀화)
  const interactions: Interactions = {
    habs: [],
    chungs: [],
  };

  // TODO: 천간합, 지지합, 충 로직 추가

  return {
    basicCounts,
    adjustedScores,
    interactions,
  };
}

// ============================================
// Phase 2: 신강/신약 판정
// ============================================

function analyzeStrength(
  input: SajuInput,
  phase1: Phase1Result
): StrengthResult {
  const { pillars } = input;
  const ilganOhaeng = pillars.day.cheonGan.ohaeng;
  const iljiOhaeng = pillars.day.jiJi.ohaeng;
  const woljiOhaeng = pillars.month.jiJi.ohaeng;

  // 득령: 일간이 월지에서 힘을 얻는가?
  const deukryeong = isDeukryeong(ilganOhaeng, woljiOhaeng);

  // 득지: 일간이 일지에 뿌리가 있는가?
  const deukji = isSameOhaeng(ilganOhaeng, iljiOhaeng) || isProducedBy(ilganOhaeng, iljiOhaeng);

  // 십신별 점수 계산
  let supportScore = 0; // 비겁 + 인성
  let opposeScore = 0; // 식상 + 재성 + 관성

  const { adjustedScores } = phase1;

  // 비겁 (같은 오행)
  supportScore += adjustedScores[ilganOhaeng];

  // 인성 (나를 생하는 오행)
  const inseongOhaeng = getProducerOhaeng(ilganOhaeng);
  supportScore += adjustedScores[inseongOhaeng];

  // 식상 (내가 생하는 오행)
  const siksangOhaeng = getProducedOhaeng(ilganOhaeng);
  opposeScore += adjustedScores[siksangOhaeng];

  // 재성 (내가 극하는 오행)
  const jaeseongOhaeng = getDestroyedOhaeng(ilganOhaeng);
  opposeScore += adjustedScores[jaeseongOhaeng];

  // 관성 (나를 극하는 오행)
  const gwanseongOhaeng = getDestroyerOhaeng(ilganOhaeng);
  opposeScore += adjustedScores[gwanseongOhaeng];

  // 득세: 천간에 동류가 있는가?
  let deukseScore = 0;
  Object.entries(pillars).forEach(([key, pillar]) => {
    if (key !== 'day' && pillar.cheonGan.ohaeng === ilganOhaeng) {
      deukseScore += 1;
    }
  });

  // 신강약 지수 계산
  let index = supportScore - opposeScore;

  // 득령 보너스
  if (deukryeong) index += 10;
  // 득지 보너스
  if (deukji) index += 5;
  // 득세 가산
  index += deukseScore * 2;

  // 레벨 판정
  let level: StrengthResult['level'];
  if (index > 30) level = 'extreme_strong';
  else if (index > 10) level = 'strong';
  else if (index > -10) level = 'neutral';
  else if (index > -30) level = 'weak';
  else level = 'extreme_weak';

  return {
    level,
    index,
    deukryeong,
    deukji,
    deukseScore,
    supportScore,
    opposeScore,
  };
}

// ============================================
// 오행 관계 헬퍼 함수
// ============================================

const ohaengCycle: Ohaeng[] = ['wood', 'fire', 'earth', 'metal', 'water'];

function getNextOhaeng(ohaeng: Ohaeng): Ohaeng {
  const idx = ohaengCycle.indexOf(ohaeng);
  return ohaengCycle[(idx + 1) % 5];
}

function getPrevOhaeng(ohaeng: Ohaeng): Ohaeng {
  const idx = ohaengCycle.indexOf(ohaeng);
  return ohaengCycle[(idx + 4) % 5];
}

function getProducedOhaeng(ohaeng: Ohaeng): Ohaeng {
  return getNextOhaeng(ohaeng); // 상생: 나 -> 다음
}

function getProducerOhaeng(ohaeng: Ohaeng): Ohaeng {
  return getPrevOhaeng(ohaeng); // 상생: 이전 -> 나
}

function getDestroyedOhaeng(ohaeng: Ohaeng): Ohaeng {
  const idx = ohaengCycle.indexOf(ohaeng);
  return ohaengCycle[(idx + 2) % 5]; // 상극: 나 -> 2칸 뒤
}

function getDestroyerOhaeng(ohaeng: Ohaeng): Ohaeng {
  const idx = ohaengCycle.indexOf(ohaeng);
  return ohaengCycle[(idx + 3) % 5]; // 상극: 3칸 뒤 -> 나
}

function isSameOhaeng(a: Ohaeng, b: Ohaeng): boolean {
  return a === b;
}

function isProducedBy(target: Ohaeng, producer: Ohaeng): boolean {
  return getProducerOhaeng(target) === producer;
}

function isDeukryeong(ilganOhaeng: Ohaeng, woljiOhaeng: Ohaeng): boolean {
  // 득령: 일간이 월지에서 힘을 얻는가?
  // 1. 월지가 일간과 같은 오행
  if (isSameOhaeng(ilganOhaeng, woljiOhaeng)) return true;
  // 2. 월지가 일간을 생하는 오행 (인성)
  if (isProducedBy(ilganOhaeng, woljiOhaeng)) return true;
  return false;
}

// ============================================
// 메인 분석 함수
// ============================================

export function analyzePhase2(input: SajuInput): Phase2Result {
  const phase1 = analyzePhase1(input);
  const strength = analyzeStrength(input, phase1);

  return {
    phase1,
    strength,
  };
}
