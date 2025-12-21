/**
 * 템플릿 선택 함수
 * 날짜 기반 시드를 사용하여 템플릿 배열에서 선택
 * 같은 날짜는 항상 같은 템플릿을 반환
 */

import { EnergyLevel, ActivityLevel } from './types';

/**
 * 날짜를 시드 값으로 변환
 * 같은 날짜는 항상 같은 시드를 생성
 *
 * @param date - 날짜 객체
 * @returns 시드 숫자
 */
export function dateToSeed(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 간단한 해시 함수: YYYYMMDD 형식으로 변환
  return year * 10000 + month * 100 + day;
}

/**
 * 시드 기반 랜덤 선택 (같은 시드는 같은 인덱스 반환)
 *
 * @param seed - 시드 값
 * @param arrayLength - 배열 길이
 * @returns 선택된 인덱스
 */
export function seededRandomIndex(seed: number, arrayLength: number): number {
  if (arrayLength === 0) return 0;

  // 간단한 LCG (Linear Congruential Generator) 방식
  const a = 1103515245;
  const c = 12345;
  const m = 2147483648; // 2^31

  const random = ((seed * a + c) % m) / m;
  return Math.floor(random * arrayLength);
}

/**
 * 배열에서 시드 기반으로 하나 선택
 *
 * @param array - 선택할 배열
 * @param seed - 시드 값
 * @returns 선택된 요소
 */
export function selectFromArray<T>(array: T[], seed: number): T {
  if (array.length === 0) {
    throw new Error('배열이 비어있습니다');
  }

  const index = seededRandomIndex(seed, array.length);
  return array[index];
}

/**
 * 배열에서 시드 기반으로 여러 개 선택 (중복 없이)
 *
 * @param array - 선택할 배열
 * @param seed - 시드 값
 * @param count - 선택할 개수
 * @returns 선택된 요소 배열
 */
export function selectMultipleFromArray<T>(
  array: T[],
  seed: number,
  count: number
): T[] {
  if (array.length === 0) {
    throw new Error('배열이 비어있습니다');
  }

  if (count > array.length) {
    count = array.length;
  }

  const result: T[] = [];
  const usedIndices = new Set<number>();

  let currentSeed = seed;
  while (result.length < count) {
    const index = seededRandomIndex(currentSeed, array.length);

    if (!usedIndices.has(index)) {
      result.push(array[index]);
      usedIndices.add(index);
    }

    // 다음 시드 생성 (같은 날짜라도 여러 개 선택 시 다른 값)
    currentSeed = (currentSeed * 1103515245 + 12345) % 2147483648;
  }

  return result;
}

/**
 * 에너지 레벨에 따른 템플릿 카테고리 접미사 반환
 *
 * @param energyLevel - 에너지 레벨
 * @returns 카테고리 접미사
 */
export function getEnergySuffix(energyLevel: EnergyLevel): string {
  switch (energyLevel) {
    case 'high':
      return 'high_energy';
    case 'medium':
      return 'medium_energy';
    case 'low':
      return 'low_energy';
  }
}

/**
 * 활동 레벨에 따른 템플릿 카테고리 접미사 반환
 *
 * @param activityLevel - 활동 레벨
 * @returns 카테고리 접미사
 */
export function getActivitySuffix(activityLevel: ActivityLevel): string {
  return activityLevel; // 'active', 'moderate', 'rest'
}

/**
 * ME(Mental Energy) 값으로 에너지 레벨 계산
 *
 * @param mentalEnergy - ME 값 (1-7)
 * @returns 에너지 레벨
 */
export function calculateEnergyLevel(mentalEnergy: number): EnergyLevel {
  if (mentalEnergy >= 6) return 'high';
  if (mentalEnergy >= 4) return 'medium';
  return 'low';
}

/**
 * ME(Mental Energy) 값으로 활동 레벨 계산
 *
 * @param mentalEnergy - ME 값 (1-7)
 * @returns 활동 레벨
 */
export function calculateActivityLevel(mentalEnergy: number): ActivityLevel {
  if (mentalEnergy >= 6) return 'active';
  if (mentalEnergy >= 4) return 'moderate';
  return 'rest';
}

/**
 * ME(Mental Energy) 계산
 * AE(Action Energy) + 득령 보너스 + 귀인 보너스
 *
 * @param ae - 십이운성의 기본 AE 값
 * @param deukryeong - 득령 여부
 * @param gwiin - 귀인 여부
 * @param sibsin - 십성 (귀인 보너스는 비견/겁재만 적용)
 * @returns ME 값 (1-7 범위로 제한)
 */
export function calculateMentalEnergy(
  ae: number,
  deukryeong: boolean,
  gwiin: boolean,
  sibsin: string
): number {
  let me = ae;

  // 득령이면 +1
  if (deukryeong) {
    me += 1;
  }

  // 귀인이고 십성이 비견 또는 겁재면 +1
  if (gwiin && (sibsin === '비견' || sibsin === '겁재')) {
    me += 1;
  }

  // ME는 1-7 범위로 제한
  return Math.max(1, Math.min(7, me));
}
