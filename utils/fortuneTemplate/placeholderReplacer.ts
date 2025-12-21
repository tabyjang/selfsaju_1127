/**
 * 플레이스홀더 치환 함수
 * 템플릿 문자열의 {ilju.XXX}, {unseong.XXX}를 실제 값으로 바꿈
 */

import { IljuPersonality, UnseongTheme } from './types';

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
