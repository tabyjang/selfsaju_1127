/**
 * 플레이스홀더 치환 함수
 * 템플릿 문자열의 {ilju.XXX}, {unseong.XXX}를 실제 값으로 바꿈
 */

import { IljuPersonality, UnseongTheme } from './types';

/**
 * 한글 마지막 글자의 받침 유무를 확인
 * @param char - 검사할 글자
 * @returns 받침이 있으면 true, 없으면 false
 */
function hasBatchim(char: string): boolean {
  if (!char) return false;
  const code = char.charCodeAt(0);
  // 한글 유니코드 범위: 가(0xAC00) ~ 힣(0xD7A3)
  if (code < 0xAC00 || code > 0xD7A3) return false;
  // 받침 유무: (code - 0xAC00) % 28 === 0 이면 받침 없음
  return (code - 0xAC00) % 28 !== 0;
}

/**
 * 한국어 조사를 자동으로 교정
 * "을(를)", "이(가)", "은(는)", "과(와)" 등을 앞 글자에 맞게 변환
 * @param text - 교정할 텍스트
 * @returns 조사가 교정된 텍스트
 */
export function fixKoreanParticles(text: string): string {
  // 받침 있을 때 / 받침 없을 때
  const particlePairs: [string, string, string][] = [
    ['을(를)', '을', '를'],
    ['이(가)', '이', '가'],
    ['은(는)', '은', '는'],
    ['과(와)', '과', '와'],
    ['아(야)', '아', '야'],
    ['으로(로)', '으로', '로'],
    ['으(로)', '으로', '로'],  // 추가
  ];

  let result = text;

  for (const [pattern, withBatchim, withoutBatchim] of particlePairs) {
    const regex = new RegExp(`(.)(${pattern.replace(/[()]/g, '\\$&')})`, 'g');
    result = result.replace(regex, (_, prevChar, __) => {
      const particle = hasBatchim(prevChar) ? withBatchim : withoutBatchim;
      return prevChar + particle;
    });
  }

  return result;
}

/**
 * 템플릿 문자열의 플레이스홀더를 실제 값으로 치환
 *
 * @param template - 플레이스홀더가 포함된 템플릿 문자열
 * @param ilju - 일주 성격 데이터
 * @param unseong - 십이운성 테마 데이터
 * @returns 치환된 문자열
 *
 * @example
 * const template = "오늘은 {unseong.분위기} 날입니다. {ilju.핵심특성} 당신이라면 잘할 수 있어요.";
 * const result = replacePlaceholders(template, iljuData, unseongData);
 * // "오늘은 뭔가 새롭게 시작하고 싶은 날입니다. 차분하고 신중한 당신이라면 잘할 수 있어요."
 */
export function replacePlaceholders(
  template: string,
  ilju: IljuPersonality,
  unseong: UnseongTheme
): string {
  let result = template;

  // {ilju.XXX} 패턴 치환
  const iljuPattern = /\{ilju\.([^}]+)\}/g;
  result = result.replace(iljuPattern, (match, key) => {
    const value = ilju[key as keyof IljuPersonality];
    return value !== undefined ? String(value) : match;
  });

  // {unseong.XXX} 패턴 치환
  const unseongPattern = /\{unseong\.([^}]+)\}/g;
  result = result.replace(unseongPattern, (match, key) => {
    const value = unseong[key as keyof UnseongTheme];
    return value !== undefined ? String(value) : match;
  });

  return result;
}

/**
 * 여러 템플릿 문자열을 한번에 치환
 *
 * @param templates - 템플릿 문자열 배열
 * @param ilju - 일주 성격 데이터
 * @param unseong - 십이운성 테마 데이터
 * @returns 치환된 문자열 배열
 */
export function replacePlaceholdersInArray(
  templates: string[],
  ilju: IljuPersonality,
  unseong: UnseongTheme
): string[] {
  return templates.map(template => replacePlaceholders(template, ilju, unseong));
}

/**
 * 공휴일 메시지의 플레이스홀더 치환
 * (공휴일 메시지는 일주 특성만 사용)
 *
 * @param message - 공휴일 메시지 템플릿
 * @param ilju - 일주 성격 데이터
 * @returns 치환된 메시지
 */
export function replaceHolidayPlaceholders(
  message: string,
  ilju: IljuPersonality
): string {
  let result = message;

  // {ilju.XXX} 패턴 치환
  const iljuPattern = /\{ilju\.([^}]+)\}/g;
  result = result.replace(iljuPattern, (match, key) => {
    const value = ilju[key as keyof IljuPersonality];
    return value !== undefined ? String(value) : match;
  });

  return result;
}

/**
 * 액션플랜 배열의 플레이스홀더 치환
 *
 * @param actionPlans - 액션플랜 문자열 배열
 * @param ilju - 일주 성격 데이터
 * @param unseong - 십이운성 테마 데이터
 * @returns 치환된 액션플랜 배열
 */
export function replaceActionPlanPlaceholders(
  actionPlans: string[],
  ilju: IljuPersonality,
  unseong: UnseongTheme
): string[] {
  return actionPlans.map(plan => replacePlaceholders(plan, ilju, unseong));
}

/**
 * 스토리 운세의 플레이스홀더 치환 (시드값 기반)
 * {핵심특성}, {소통스타일}, {감정표현}, {업무스타일} 등을 치환
 *
 * @param text - 치환할 텍스트
 * @param iljuPersonalityData - 일주 성격 전체 데이터 (배열 포함)
 * @param seed - 선택을 위한 시드값
 * @returns 치환된 텍스트
 */
export function replaceStoryPlaceholders(
  text: string,
  iljuPersonalityData: any,
  seed: number
): string {
  let result = text;

  // {핵심특성} 치환
  if (result.includes('{핵심특성}')) {
    const traits = iljuPersonalityData.핵심특성 || [];
    if (traits.length > 0) {
      const selectedTrait = traits[seed % traits.length];
      result = result.replace(/\{핵심특성\}/g, selectedTrait);
    }
  }

  // {소통스타일} 치환
  if (result.includes('{소통스타일}')) {
    const styles = iljuPersonalityData.소통스타일 || [];
    if (styles.length > 0) {
      const selectedStyle = styles[seed % styles.length];
      result = result.replace(/\{소통스타일\}/g, selectedStyle);
    }
  }

  // {감정표현} 치환
  if (result.includes('{감정표현}')) {
    const expressions = iljuPersonalityData.감정표현 || [];
    if (expressions.length > 0) {
      const selectedExpression = expressions[seed % expressions.length];
      result = result.replace(/\{감정표현\}/g, selectedExpression);
    }
  }

  // {업무스타일} 치환
  if (result.includes('{업무스타일}')) {
    const workStyles = iljuPersonalityData.업무스타일 || [];
    if (workStyles.length > 0) {
      const selectedWorkStyle = workStyles[seed % workStyles.length];
      result = result.replace(/\{업무스타일\}/g, selectedWorkStyle);
    }
  }

  return result;
}
