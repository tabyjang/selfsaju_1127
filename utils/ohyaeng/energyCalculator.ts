/**
 * ============================================
 * 오행 에너지 계산 로직
 * ============================================
 *
 * Phase 1: 기초 오행 카운트 (가중치 없음)
 * Phase 2: 위치별 가중치 적용 + 절입일 기준 사령 계산
 * Phase 3: 통근/투간 적용 → 절대질량
 */

import type { Ohaeng, SajuInfo } from '../../types';
import type {
  OhaengScores,
  PositionKey,
  Phase1Result,
  Phase2Result,
  Phase3Result,
  OhaengEnergyAnalysis,
  EnergyMatrixCell,
  RootingInfo,
  TouganInfo,
  SaryeongDetail,
} from './types';
import {
  POSITION_WEIGHTS,
  HIDDEN_STEM_RATIO,
  SARYEONG_MULTIPLIER,
  ROOTING_COEFFICIENT,
  TOUGAN_MULTIPLIER,
  JIJANGGAN_DATA,
  STEM_OHAENG,
  BRANCH_OHAENG,
  MONTH_SARYEONG,
} from './weights';
import { solarTermsData } from '../solarTerms';

// ============================================
// 상수 정의
// ============================================

/** 절기 이름 */
const JEOLGI_NAMES = [
  '소한', '대한', '입춘', '우수', '경칩', '춘분',
  '청명', '곡우', '입하', '소만', '망종', '하지',
  '소서', '대서', '입추', '처서', '백로', '추분',
  '한로', '상강', '입동', '소설', '대설', '동지'
];

/** 월지별 시작 절기 인덱스 */
const MONTH_JEOLGI_INDEX: Record<string, number> = {
  '寅': 2,  // 입춘
  '卯': 4,  // 경칩
  '辰': 6,  // 청명
  '巳': 8,  // 입하
  '午': 10, // 망종
  '未': 12, // 소서
  '申': 14, // 입추
  '酉': 16, // 백로
  '戌': 18, // 한로
  '亥': 20, // 입동
  '子': 22, // 대설
  '丑': 0,  // 소한
};

/** 천간 한자 → 한글 매핑 */
const STEM_KOREAN: Record<string, string> = {
  '甲': '갑목', '乙': '을목',
  '丙': '병화', '丁': '정화',
  '戊': '무토', '己': '기토',
  '庚': '경금', '辛': '신금',
  '壬': '임수', '癸': '계수',
};

// ============================================
// 유틸리티 함수
// ============================================

/** 빈 오행 점수 객체 생성 */
function createEmptyScores(): OhaengScores {
  return { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
}

/** 오행 점수를 백분율로 변환 */
function toPercentages(scores: OhaengScores): OhaengScores {
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  if (total === 0) return createEmptyScores();

  return {
    wood: (scores.wood / total) * 100,
    fire: (scores.fire / total) * 100,
    earth: (scores.earth / total) * 100,
    metal: (scores.metal / total) * 100,
    water: (scores.water / total) * 100,
  };
}

/** 두 오행 점수의 차이 계산 */
function calcDifference(after: OhaengScores, before: OhaengScores): OhaengScores {
  return {
    wood: after.wood - before.wood,
    fire: after.fire - before.fire,
    earth: after.earth - before.earth,
    metal: after.metal - before.metal,
    water: after.water - before.water,
  };
}

/** 천간 글자에서 오행 추출 */
function getStemOhaeng(stem: string): Ohaeng {
  return STEM_OHAENG[stem] || 'earth';
}

/** 지지 글자에서 오행 추출 */
function getBranchOhaeng(branch: string): Ohaeng {
  return BRANCH_OHAENG[branch] || 'earth';
}

// ============================================
// 절입일 기준 사령 계산 함수
// ============================================

/**
 * 생년월일과 월지를 기반으로 절입일 기준 사령 오행을 계산합니다.
 * @param birthDate 생년월일 (YYYY-MM-DD 형식)
 * @param monthBranch 월지 한자
 * @returns SaryeongDetail
 */
function calculateSaryeongByJeolip(
  birthDate: string,
  monthBranch: string
): SaryeongDetail {
  // 기본값 (절입일 계산 실패 시 본기 사령)
  const jijanggan = JIJANGGAN_DATA[monthBranch];
  const defaultSaryeong: SaryeongDetail = {
    jeolipDate: '',
    jeolgiName: '',
    daysFromJeolip: 0,
    jijangganPeriod: 'main',
    jijangganStem: jijanggan?.main?.stem || '',
    saryeongOhaeng: MONTH_SARYEONG[monthBranch] || 'earth',
    description: '절입일 정보 없음 - 본기 기준 적용',
  };

  if (!birthDate || !jijanggan) {
    return defaultSaryeong;
  }

  // 생년월일 파싱
  const [yearStr, monthStr, dayStr] = birthDate.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return defaultSaryeong;
  }

  // 해당 연도의 절기 데이터
  const yearData = solarTermsData[String(year)];
  if (!yearData) {
    return defaultSaryeong;
  }

  // 월지에 해당하는 절기 인덱스
  const jeolgiIndex = MONTH_JEOLGI_INDEX[monthBranch];
  if (jeolgiIndex === undefined) {
    return defaultSaryeong;
  }

  // 절입일 파싱 (예: "02-04 20:44")
  let jeolipDataStr: string;
  let jeolipYear = year;

  // 축월(소한)의 경우 다음 해 1월 데이터를 사용할 수도 있음
  if (jeolgiIndex === 0 && month === 12) {
    // 12월에 태어났고 축월인 경우, 이전 해 소한 확인
    const prevYearData = solarTermsData[String(year)];
    if (prevYearData) {
      jeolipDataStr = prevYearData[0];
    } else {
      return defaultSaryeong;
    }
  } else {
    jeolipDataStr = yearData[jeolgiIndex];
  }

  if (!jeolipDataStr) {
    return defaultSaryeong;
  }

  // 절입일 파싱
  const [jeolipMD, jeolipTime] = jeolipDataStr.split(' ');
  const [jeolipMonthStr, jeolipDayStr] = jeolipMD.split('-');
  const jeolipMonth = parseInt(jeolipMonthStr, 10);
  const jeolipDay = parseInt(jeolipDayStr, 10);

  // 날짜 객체 생성 (시간은 무시하고 일자만 계산)
  const birthDateObj = new Date(year, month - 1, day);
  const jeolipDateObj = new Date(jeolipYear, jeolipMonth - 1, jeolipDay);

  // 경과 일수 계산
  const diffTime = birthDateObj.getTime() - jeolipDateObj.getTime();
  const daysFromJeolip = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // 지장간 일수 계산
  const totalDays = (jijanggan.initial?.days || 0) +
                   (jijanggan.middle?.days || 0) +
                   jijanggan.main.days;

  const initialDays = jijanggan.initial?.days || 0;
  const middleDays = jijanggan.middle?.days || 0;

  // 어느 구간에 해당하는지 판단
  let period: 'initial' | 'middle' | 'main';
  let stem: string;

  if (jijanggan.initial && daysFromJeolip < initialDays) {
    period = 'initial';
    stem = jijanggan.initial.stem;
  } else if (jijanggan.middle && daysFromJeolip < initialDays + middleDays) {
    period = 'middle';
    stem = jijanggan.middle.stem;
  } else {
    period = 'main';
    stem = jijanggan.main.stem;
  }

  const saryeongOhaeng = getStemOhaeng(stem);
  const jeolgiName = JEOLGI_NAMES[jeolgiIndex];
  const jeolipDateFormatted = `${jeolipYear}-${String(jeolipMonth).padStart(2, '0')}-${String(jeolipDay).padStart(2, '0')}`;

  // 구간 이름
  const periodNames = { initial: '초기', middle: '중기', main: '본기' };
  const periodName = periodNames[period];
  const stemKorean = STEM_KOREAN[stem] || stem;

  const description = `${year}년 ${month}월 ${day}일은 ${jeolipYear}년 ${jeolipMonth}월 ${jeolipDay}일 ${jeolgiName}일 기준 ${daysFromJeolip}일이 지났으므로, ${periodName} ${stemKorean}에 1.5배 보너스를 받습니다.`;

  return {
    jeolipDate: jeolipDateFormatted,
    jeolgiName,
    daysFromJeolip,
    jijangganPeriod: period,
    jijangganStem: stem,
    saryeongOhaeng,
    description,
  };
}

// ============================================
// 통근 확인 함수 (오행 기준)
// ============================================

/**
 * 천간이 지지의 지장간에 같은 오행이 있으면 통근(뿌리)으로 판단합니다.
 * @param stemOhaeng 천간의 오행
 * @param branch 지지 한자
 * @returns 통근하는 지장간 정보 배열
 */
function findRootingInBranch(
  stemOhaeng: Ohaeng,
  branch: string
): { hiddenStem: string; hiddenStemOhaeng: Ohaeng }[] {
  const jijanggan = JIJANGGAN_DATA[branch];
  if (!jijanggan) return [];

  const roots: { hiddenStem: string; hiddenStemOhaeng: Ohaeng }[] = [];

  // 초기 지장간 확인
  if (jijanggan.initial) {
    const hiddenStemOhaeng = getStemOhaeng(jijanggan.initial.stem);
    if (hiddenStemOhaeng === stemOhaeng) {
      roots.push({
        hiddenStem: jijanggan.initial.stem,
        hiddenStemOhaeng,
      });
    }
  }

  // 중기 지장간 확인
  if (jijanggan.middle) {
    const hiddenStemOhaeng = getStemOhaeng(jijanggan.middle.stem);
    if (hiddenStemOhaeng === stemOhaeng) {
      roots.push({
        hiddenStem: jijanggan.middle.stem,
        hiddenStemOhaeng,
      });
    }
  }

  // 본기 지장간 확인
  {
    const hiddenStemOhaeng = getStemOhaeng(jijanggan.main.stem);
    if (hiddenStemOhaeng === stemOhaeng) {
      roots.push({
        hiddenStem: jijanggan.main.stem,
        hiddenStemOhaeng,
      });
    }
  }

  return roots;
}

// ============================================
// Phase 1: 기초 오행 카운트
// ============================================

export function calculatePhase1(sajuInfo: SajuInfo, isHourUnknown: boolean = false): Phase1Result {
  const { pillars } = sajuInfo;

  // 기본 카운트 (천간/지지 각 1점)
  const basicCounts = createEmptyScores();

  // 상세 카운트 (지장간 분해 포함)
  const detailedCounts = createEmptyScores();

  // 위치별 오행 정보
  const positionOhaeng: Phase1Result['positionOhaeng'] = {} as Phase1Result['positionOhaeng'];

  // 연주
  basicCounts[pillars.year.cheonGan.ohaeng]++;
  basicCounts[pillars.year.jiJi.ohaeng]++;
  detailedCounts[pillars.year.cheonGan.ohaeng] += 1;

  positionOhaeng['YEAR_STEM'] = {
    char: pillars.year.cheonGan.char,
    ohaeng: pillars.year.cheonGan.ohaeng,
    score: 1,
  };

  // 연지 지장간 분해
  const yearBranchJijanggan = JIJANGGAN_DATA[pillars.year.jiJi.char];
  if (yearBranchJijanggan) {
    if (yearBranchJijanggan.initial) {
      detailedCounts[getStemOhaeng(yearBranchJijanggan.initial.stem)] += HIDDEN_STEM_RATIO.INITIAL;
    }
    if (yearBranchJijanggan.middle) {
      detailedCounts[getStemOhaeng(yearBranchJijanggan.middle.stem)] += HIDDEN_STEM_RATIO.MIDDLE;
    }
    detailedCounts[getStemOhaeng(yearBranchJijanggan.main.stem)] += HIDDEN_STEM_RATIO.MAIN;
  } else {
    detailedCounts[pillars.year.jiJi.ohaeng] += 1;
  }

  positionOhaeng['YEAR_BRANCH'] = {
    char: pillars.year.jiJi.char,
    ohaeng: pillars.year.jiJi.ohaeng,
    score: 1,
  };

  // 월주
  basicCounts[pillars.month.cheonGan.ohaeng]++;
  basicCounts[pillars.month.jiJi.ohaeng]++;
  detailedCounts[pillars.month.cheonGan.ohaeng] += 1;

  positionOhaeng['MONTH_STEM'] = {
    char: pillars.month.cheonGan.char,
    ohaeng: pillars.month.cheonGan.ohaeng,
    score: 1,
  };

  // 월지 지장간 분해
  const monthBranchJijanggan = JIJANGGAN_DATA[pillars.month.jiJi.char];
  if (monthBranchJijanggan) {
    if (monthBranchJijanggan.initial) {
      detailedCounts[getStemOhaeng(monthBranchJijanggan.initial.stem)] += HIDDEN_STEM_RATIO.INITIAL;
    }
    if (monthBranchJijanggan.middle) {
      detailedCounts[getStemOhaeng(monthBranchJijanggan.middle.stem)] += HIDDEN_STEM_RATIO.MIDDLE;
    }
    detailedCounts[getStemOhaeng(monthBranchJijanggan.main.stem)] += HIDDEN_STEM_RATIO.MAIN;
  } else {
    detailedCounts[pillars.month.jiJi.ohaeng] += 1;
  }

  positionOhaeng['MONTH_BRANCH'] = {
    char: pillars.month.jiJi.char,
    ohaeng: pillars.month.jiJi.ohaeng,
    score: 1,
  };

  // 일주
  basicCounts[pillars.day.cheonGan.ohaeng]++;
  basicCounts[pillars.day.jiJi.ohaeng]++;
  detailedCounts[pillars.day.cheonGan.ohaeng] += 1;

  positionOhaeng['DAY_STEM'] = {
    char: pillars.day.cheonGan.char,
    ohaeng: pillars.day.cheonGan.ohaeng,
    score: 1,
  };

  // 일지 지장간 분해
  const dayBranchJijanggan = JIJANGGAN_DATA[pillars.day.jiJi.char];
  if (dayBranchJijanggan) {
    if (dayBranchJijanggan.initial) {
      detailedCounts[getStemOhaeng(dayBranchJijanggan.initial.stem)] += HIDDEN_STEM_RATIO.INITIAL;
    }
    if (dayBranchJijanggan.middle) {
      detailedCounts[getStemOhaeng(dayBranchJijanggan.middle.stem)] += HIDDEN_STEM_RATIO.MIDDLE;
    }
    detailedCounts[getStemOhaeng(dayBranchJijanggan.main.stem)] += HIDDEN_STEM_RATIO.MAIN;
  } else {
    detailedCounts[pillars.day.jiJi.ohaeng] += 1;
  }

  positionOhaeng['DAY_BRANCH'] = {
    char: pillars.day.jiJi.char,
    ohaeng: pillars.day.jiJi.ohaeng,
    score: 1,
  };

  // 시주 (시간 모름이면 제외)
  if (!isHourUnknown && pillars.hour.cheonGan.char !== '-') {
    basicCounts[pillars.hour.cheonGan.ohaeng]++;
    basicCounts[pillars.hour.jiJi.ohaeng]++;
    detailedCounts[pillars.hour.cheonGan.ohaeng] += 1;

    positionOhaeng['HOUR_STEM'] = {
      char: pillars.hour.cheonGan.char,
      ohaeng: pillars.hour.cheonGan.ohaeng,
      score: 1,
    };

    // 시지 지장간 분해
    const hourBranchJijanggan = JIJANGGAN_DATA[pillars.hour.jiJi.char];
    if (hourBranchJijanggan) {
      if (hourBranchJijanggan.initial) {
        detailedCounts[getStemOhaeng(hourBranchJijanggan.initial.stem)] += HIDDEN_STEM_RATIO.INITIAL;
      }
      if (hourBranchJijanggan.middle) {
        detailedCounts[getStemOhaeng(hourBranchJijanggan.middle.stem)] += HIDDEN_STEM_RATIO.MIDDLE;
      }
      detailedCounts[getStemOhaeng(hourBranchJijanggan.main.stem)] += HIDDEN_STEM_RATIO.MAIN;
    } else {
      detailedCounts[pillars.hour.jiJi.ohaeng] += 1;
    }

    positionOhaeng['HOUR_BRANCH'] = {
      char: pillars.hour.jiJi.char,
      ohaeng: pillars.hour.jiJi.ohaeng,
      score: 1,
    };
  } else {
    positionOhaeng['HOUR_STEM'] = { char: '-', ohaeng: 'earth', score: 0 };
    positionOhaeng['HOUR_BRANCH'] = { char: '-', ohaeng: 'earth', score: 0 };
  }

  return {
    basicCounts,
    detailedCounts,
    positionOhaeng,
  };
}

// ============================================
// Phase 2: 위치별 가중치 적용 + 절입일 기준 사령
// ============================================

export function calculatePhase2(
  sajuInfo: SajuInfo,
  phase1: Phase1Result,
  isHourUnknown: boolean = false
): Phase2Result {
  const { pillars, birthDate } = sajuInfo;
  const matrix: EnergyMatrixCell[] = [];
  const weightedScores = createEmptyScores();

  // birthDate 객체를 문자열로 변환
  const birthDateStr = `${birthDate.year}-${String(birthDate.month).padStart(2, '0')}-${String(birthDate.day).padStart(2, '0')}`;

  // 절입일 기준 사령 오행 계산
  const saryeongDetail = calculateSaryeongByJeolip(birthDateStr, pillars.month.jiJi.char);
  const saryeongOhaeng = saryeongDetail.saryeongOhaeng;

  // 적용된 가중치 정보
  const appliedWeights = {
    positionWeights: { ...POSITION_WEIGHTS },
    saryeongMultiplier: SARYEONG_MULTIPLIER,
  };

  // 천간 처리 함수
  const processStem = (
    position: PositionKey,
    char: string,
    ohaeng: Ohaeng,
    skip: boolean = false
  ) => {
    if (skip || char === '-') return;

    const baseScore = 1;
    const positionWeight = POSITION_WEIGHTS[position];
    const weightedScore = baseScore * positionWeight;

    // 일간은 계산에서 제외하지만 매트릭스에는 포함
    const isDayMaster = position === 'DAY_STEM';

    const cell: EnergyMatrixCell = {
      position,
      char,
      ohaeng,
      baseScore,
      positionWeight,
      weightedScore,
      finalScore: isDayMaster ? 0 : weightedScore,
    };

    matrix.push(cell);

    if (!isDayMaster) {
      weightedScores[ohaeng] += weightedScore;
    }
  };

  // 지지 처리 함수 (지장간 분해)
  const processBranch = (
    position: PositionKey,
    char: string,
    ohaeng: Ohaeng,
    skip: boolean = false
  ) => {
    if (skip || char === '-') return;

    const positionWeight = POSITION_WEIGHTS[position];
    const jijanggan = JIJANGGAN_DATA[char];
    const isMonthBranch = position === 'MONTH_BRANCH';

    if (jijanggan) {
      // 지장간 분해하여 각각 계산
      const totalDays = (jijanggan.initial?.days || 0) +
                       (jijanggan.middle?.days || 0) +
                       jijanggan.main.days;

      // 초기
      if (jijanggan.initial) {
        const ratio = jijanggan.initial.days / totalDays;
        const stemOhaeng = getStemOhaeng(jijanggan.initial.stem);
        let baseScore = ratio;
        let weightedScore = baseScore * positionWeight;
        let saryeongBonus = 0;

        // 월령 사령 보너스 (절입일 기준 사령 오행과 일치 시)
        if (isMonthBranch && stemOhaeng === saryeongOhaeng) {
          saryeongBonus = weightedScore * (SARYEONG_MULTIPLIER - 1);
          weightedScore *= SARYEONG_MULTIPLIER;
        }

        weightedScores[stemOhaeng] += weightedScore;

        matrix.push({
          position,
          char: `${char}(${jijanggan.initial.stem})`,
          ohaeng: stemOhaeng,
          baseScore,
          positionWeight,
          weightedScore: baseScore * positionWeight,
          isSaryeong: saryeongBonus > 0,
          saryeongBonus,
          finalScore: weightedScore,
        });
      }

      // 중기
      if (jijanggan.middle) {
        const ratio = jijanggan.middle.days / totalDays;
        const stemOhaeng = getStemOhaeng(jijanggan.middle.stem);
        let baseScore = ratio;
        let weightedScore = baseScore * positionWeight;
        let saryeongBonus = 0;

        if (isMonthBranch && stemOhaeng === saryeongOhaeng) {
          saryeongBonus = weightedScore * (SARYEONG_MULTIPLIER - 1);
          weightedScore *= SARYEONG_MULTIPLIER;
        }

        weightedScores[stemOhaeng] += weightedScore;

        matrix.push({
          position,
          char: `${char}(${jijanggan.middle.stem})`,
          ohaeng: stemOhaeng,
          baseScore,
          positionWeight,
          weightedScore: baseScore * positionWeight,
          isSaryeong: saryeongBonus > 0,
          saryeongBonus,
          finalScore: weightedScore,
        });
      }

      // 본기
      {
        const ratio = jijanggan.main.days / totalDays;
        const stemOhaeng = getStemOhaeng(jijanggan.main.stem);
        let baseScore = ratio;
        let weightedScore = baseScore * positionWeight;
        let saryeongBonus = 0;

        if (isMonthBranch && stemOhaeng === saryeongOhaeng) {
          saryeongBonus = weightedScore * (SARYEONG_MULTIPLIER - 1);
          weightedScore *= SARYEONG_MULTIPLIER;
        }

        weightedScores[stemOhaeng] += weightedScore;

        matrix.push({
          position,
          char: `${char}(${jijanggan.main.stem})`,
          ohaeng: stemOhaeng,
          baseScore,
          positionWeight,
          weightedScore: baseScore * positionWeight,
          isSaryeong: saryeongBonus > 0,
          saryeongBonus,
          finalScore: weightedScore,
        });
      }
    } else {
      // 지장간 데이터 없으면 지지 본오행으로 처리
      const baseScore = 1;
      let weightedScore = baseScore * positionWeight;
      let saryeongBonus = 0;

      if (isMonthBranch && ohaeng === saryeongOhaeng) {
        saryeongBonus = weightedScore * (SARYEONG_MULTIPLIER - 1);
        weightedScore *= SARYEONG_MULTIPLIER;
      }

      weightedScores[ohaeng] += weightedScore;

      matrix.push({
        position,
        char,
        ohaeng,
        baseScore,
        positionWeight,
        weightedScore: baseScore * positionWeight,
        isSaryeong: saryeongBonus > 0,
        saryeongBonus,
        finalScore: weightedScore,
      });
    }
  };

  // 8글자 처리
  processStem('YEAR_STEM', pillars.year.cheonGan.char, pillars.year.cheonGan.ohaeng);
  processBranch('YEAR_BRANCH', pillars.year.jiJi.char, pillars.year.jiJi.ohaeng);
  processStem('MONTH_STEM', pillars.month.cheonGan.char, pillars.month.cheonGan.ohaeng);
  processBranch('MONTH_BRANCH', pillars.month.jiJi.char, pillars.month.jiJi.ohaeng);
  processStem('DAY_STEM', pillars.day.cheonGan.char, pillars.day.cheonGan.ohaeng);
  processBranch('DAY_BRANCH', pillars.day.jiJi.char, pillars.day.jiJi.ohaeng);

  if (!isHourUnknown && pillars.hour.cheonGan.char !== '-') {
    processStem('HOUR_STEM', pillars.hour.cheonGan.char, pillars.hour.cheonGan.ohaeng);
    processBranch('HOUR_BRANCH', pillars.hour.jiJi.char, pillars.hour.jiJi.ohaeng);
  }

  return {
    matrix,
    weightedScores,
    weightedPercentages: toPercentages(weightedScores),
    saryeongOhaeng,
    saryeongDetail,
    appliedWeights,
  };
}

// ============================================
// Phase 3: 통근/투간 적용 → 절대질량
// ============================================

export function calculatePhase3(
  sajuInfo: SajuInfo,
  phase2: Phase2Result,
  isHourUnknown: boolean = false
): Phase3Result {
  const { pillars } = sajuInfo;
  const rootingInfos: RootingInfo[] = [];
  const touganInfos: TouganInfo[] = [];

  // 지지 목록
  const branches: { branch: string; position: 'year' | 'month' | 'day' | 'hour' }[] = [
    { branch: pillars.year.jiJi.char, position: 'year' },
    { branch: pillars.month.jiJi.char, position: 'month' },
    { branch: pillars.day.jiJi.char, position: 'day' },
  ];

  if (!isHourUnknown && pillars.hour.jiJi.char !== '-') {
    branches.push({ branch: pillars.hour.jiJi.char, position: 'hour' });
  }

  // 천간 목록 (일간 포함 - 모든 천간의 통근 여부 확인)
  const allStems: { stem: string; position: 'year' | 'month' | 'day' | 'hour' }[] = [
    { stem: pillars.year.cheonGan.char, position: 'year' },
    { stem: pillars.month.cheonGan.char, position: 'month' },
    { stem: pillars.day.cheonGan.char, position: 'day' },
  ];

  if (!isHourUnknown && pillars.hour.cheonGan.char !== '-') {
    allStems.push({ stem: pillars.hour.cheonGan.char, position: 'hour' });
  }

  // 통근 분석 (오행 기준으로 수정)
  allStems.forEach(({ stem, position }) => {
    const stemOhaeng = getStemOhaeng(stem);
    const foundRoots: RootingInfo['rootingBranches'] = [];

    // 모든 지지를 검사하여 같은 오행의 지장간이 있는지 확인
    branches.forEach(({ branch, position: branchPosition }) => {
      const rootsInBranch = findRootingInBranch(stemOhaeng, branch);

      rootsInBranch.forEach(({ hiddenStem, hiddenStemOhaeng }) => {
        let coefficient = ROOTING_COEFFICIENT.YEAR;
        if (branchPosition === 'month') coefficient = ROOTING_COEFFICIENT.MONTH;
        else if (branchPosition === 'day') coefficient = ROOTING_COEFFICIENT.DAY;
        else if (branchPosition === 'hour') coefficient = ROOTING_COEFFICIENT.HOUR;

        foundRoots.push({
          branch,
          branchPosition,
          hiddenStem,
          hiddenStemOhaeng,
          coefficient,
        });
      });
    });

    const hasRoot = foundRoots.length > 0;
    const bestRootCoefficient = hasRoot
      ? Math.max(...foundRoots.map((r) => r.coefficient))
      : ROOTING_COEFFICIENT.NONE;

    rootingInfos.push({
      stem,
      stemOhaeng,
      position,
      rootingBranches: foundRoots,
      hasRoot,
      bestRootCoefficient,
    });
  });

  // 투간 분석: 지장간이 천간에 나타났는지 확인
  const stemChars = allStems.map(s => s.stem);

  branches.forEach(({ branch, position: branchPosition }) => {
    const jijanggan = JIJANGGAN_DATA[branch];
    if (!jijanggan) return;

    // 지장간의 각 천간이 사주 천간에 있는지 확인
    const hiddenStems = [
      jijanggan.initial?.stem,
      jijanggan.middle?.stem,
      jijanggan.main.stem,
    ].filter(Boolean) as string[];

    hiddenStems.forEach((hiddenStem) => {
      const stemIndex = stemChars.indexOf(hiddenStem);
      if (stemIndex !== -1) {
        touganInfos.push({
          branch,
          branchPosition,
          hiddenStem,
          hiddenStemOhaeng: getStemOhaeng(hiddenStem),
          penetratedToStem: hiddenStem,
          stemPosition: allStems[stemIndex].position,
          multiplier: TOUGAN_MULTIPLIER,
        });
      }
    });
  });

  // 절대질량 계산
  const absoluteMass = { ...phase2.weightedScores };

  // 통근 계수 적용 (일간 제외한 천간에만 적용)
  rootingInfos
    .filter(info => info.position !== 'day') // 일간 제외
    .forEach((info) => {
      const stemWeight =
        info.position === 'year'
          ? POSITION_WEIGHTS.YEAR_STEM
          : info.position === 'month'
          ? POSITION_WEIGHTS.MONTH_STEM
          : POSITION_WEIGHTS.HOUR_STEM;

      // 통근 여부에 따른 조정
      const adjustmentFactor = info.bestRootCoefficient - 1;
      const adjustment = stemWeight * adjustmentFactor;
      absoluteMass[info.stemOhaeng] += adjustment;
    });

  // 투간 보너스 적용
  touganInfos.forEach((info) => {
    const bonus = 0.3 * (info.multiplier - 1);
    absoluteMass[info.hiddenStemOhaeng] += bonus;
  });

  // 음수 방지
  Object.keys(absoluteMass).forEach((key) => {
    if (absoluteMass[key as Ohaeng] < 0) {
      absoluteMass[key as Ohaeng] = 0;
    }
  });

  // finalMatrix 계산: Phase 2 matrix에 통근/투간 보정 적용
  const finalMatrix: EnergyMatrixCell[] = phase2.matrix.map((cell) => {
    let finalScore = cell.finalScore;
    const cellCopy = { ...cell };

    // 천간인 경우 통근 보정 적용
    if (
      cell.position === 'YEAR_STEM' ||
      cell.position === 'MONTH_STEM' ||
      cell.position === 'HOUR_STEM'
    ) {
      // 해당 천간의 통근 정보 찾기
      const positionMap = {
        YEAR_STEM: 'year',
        MONTH_STEM: 'month',
        HOUR_STEM: 'hour',
      } as const;
      const pos = positionMap[cell.position as keyof typeof positionMap];
      const rootingInfo = rootingInfos.find((r) => r.position === pos);

      if (rootingInfo && rootingInfo.position !== 'day') {
        // 통근 보정 적용
        const adjustmentFactor = rootingInfo.bestRootCoefficient - 1;
        const adjustment = cell.finalScore * adjustmentFactor;
        finalScore = cell.finalScore + adjustment;
      }
    }

    // 일간인 경우 그대로 0 유지
    if (cell.position === 'DAY_STEM') {
      finalScore = 0;
    }

    // 지장간인 경우 투간 보너스 적용
    if (
      cell.position === 'YEAR_BRANCH' ||
      cell.position === 'MONTH_BRANCH' ||
      cell.position === 'DAY_BRANCH' ||
      cell.position === 'HOUR_BRANCH'
    ) {
      // 이 지장간이 투간되었는지 확인
      // char 형식: "子(癸)" 같은 형태에서 괄호 안의 천간 추출
      const match = cell.char.match(/\((.)\)/);
      if (match) {
        const hiddenStem = match[1];
        const touganInfo = touganInfos.find(
          (t) => t.hiddenStem === hiddenStem && t.branch === cell.char.split('(')[0]
        );

        if (touganInfo) {
          // 투간 보너스 적용 (비례 배분)
          const totalHiddenStemScore = phase2.matrix
            .filter((c) => c.char.includes(`(${hiddenStem})`))
            .reduce((sum, c) => sum + c.finalScore, 0);

          if (totalHiddenStemScore > 0) {
            const ratio = cell.finalScore / totalHiddenStemScore;
            const bonus = 0.3 * (touganInfo.multiplier - 1) * ratio;
            finalScore = cell.finalScore + bonus;
          }
        }
      }
    }

    cellCopy.finalScore = Math.max(finalScore, 0); // 음수 방지
    return cellCopy;
  });

  return {
    rootingInfos,
    touganInfos,
    absoluteMass,
    absolutePercentages: toPercentages(absoluteMass),
    changeFromPhase2: calcDifference(absoluteMass, phase2.weightedScores),
    finalMatrix,
  };
}

// ============================================
// 메인 분석 함수
// ============================================

export function analyzeOhaengEnergy(
  sajuInfo: SajuInfo,
  isHourUnknown: boolean = false
): OhaengEnergyAnalysis {
  const { pillars } = sajuInfo;

  // Phase 1: 기초 카운트
  const phase1 = calculatePhase1(sajuInfo, isHourUnknown);

  // Phase 2: 위치별 가중치 적용
  const phase2 = calculatePhase2(sajuInfo, phase1, isHourUnknown);

  // Phase 3: 통근/투간 적용 → 절대질량
  const phase3 = calculatePhase3(sajuInfo, phase2, isHourUnknown);

  return {
    input: {
      pillars: {
        year: { gan: pillars.year.cheonGan.char, ji: pillars.year.jiJi.char },
        month: { gan: pillars.month.cheonGan.char, ji: pillars.month.jiJi.char },
        day: { gan: pillars.day.cheonGan.char, ji: pillars.day.jiJi.char },
        hour: { gan: pillars.hour.cheonGan.char, ji: pillars.hour.jiJi.char },
      },
      ilgan: pillars.day.cheonGan.char,
      ilganOhaeng: pillars.day.cheonGan.ohaeng,
    },
    phase1,
    phase2,
    phase3,
    meta: {
      calculatedAt: new Date().toISOString(),
      version: '1.1.0',
    },
  };
}

// ============================================
// 모듈 내보내기
// ============================================

export { createEmptyScores, toPercentages };
