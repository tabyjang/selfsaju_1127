/**
 * JSON 데이터 로더
 * 운세 생성에 필요한 데이터 파일들을 로드
 */

import {
  IljuPersonality,
  UnseongTheme,
  HolidayMessage,
  FortuneTemplates,
} from './types';

// 데이터 파일 경로
const DATA_PATH = './today_unse';

// 캐시된 데이터
let iljuPersonalitiesCache: { [key: string]: IljuPersonality } | null = null;
let unseongThemesCache: { [key: string]: UnseongTheme } | null = null;
let holidayMessagesCache: { [key: string]: HolidayMessage } | null = null;
let fortuneTemplatesCache: FortuneTemplates | null = null;

/**
 * 60개 일주 성격 데이터 로드
 *
 * @returns 일주 성격 데이터 객체
 */
export async function loadIljuPersonalities(): Promise<{
  [key: string]: IljuPersonality;
}> {
  if (iljuPersonalitiesCache) {
    return iljuPersonalitiesCache;
  }

  try {
    const response = await fetch(`${DATA_PATH}/ilju_personalities.json`);
    const data = await response.json();
    iljuPersonalitiesCache = data;
    return data;
  } catch (error) {
    console.error('일주 성격 데이터 로드 실패:', error);
    throw new Error('일주 성격 데이터를 로드할 수 없습니다.');
  }
}

/**
 * 12개 십이운성 테마 데이터 로드
 *
 * @returns 십이운성 테마 데이터 객체
 */
export async function loadUnseongThemes(): Promise<{
  [key: string]: UnseongTheme;
}> {
  if (unseongThemesCache) {
    return unseongThemesCache;
  }

  try {
    const response = await fetch(`${DATA_PATH}/unseong_themes.json`);
    const data = await response.json();
    unseongThemesCache = data;
    return data;
  } catch (error) {
    console.error('십이운성 테마 데이터 로드 실패:', error);
    throw new Error('십이운성 테마 데이터를 로드할 수 없습니다.');
  }
}

/**
 * 공휴일 메시지 데이터 로드
 *
 * @returns 공휴일 메시지 데이터 객체
 */
export async function loadHolidayMessages(): Promise<{
  [key: string]: HolidayMessage;
}> {
  if (holidayMessagesCache) {
    return holidayMessagesCache;
  }

  try {
    const response = await fetch(`${DATA_PATH}/holiday_messages.json`);
    const data = await response.json();
    holidayMessagesCache = data;
    return data;
  } catch (error) {
    console.error('공휴일 메시지 데이터 로드 실패:', error);
    throw new Error('공휴일 메시지 데이터를 로드할 수 없습니다.');
  }
}

/**
 * 운세 템플릿 데이터 로드
 *
 * @returns 운세 템플릿 데이터 객체
 */
export async function loadFortuneTemplates(): Promise<FortuneTemplates> {
  if (fortuneTemplatesCache) {
    return fortuneTemplatesCache;
  }

  try {
    const response = await fetch(`${DATA_PATH}/fortune_templates.json`);
    const data = await response.json();
    fortuneTemplatesCache = data;
    return data;
  } catch (error) {
    console.error('운세 템플릿 데이터 로드 실패:', error);
    throw new Error('운세 템플릿 데이터를 로드할 수 없습니다.');
  }
}

/**
 * 특정 일주의 성격 데이터 가져오기
 *
 * @param ilju - 일주 한자 (예: "己丑")
 * @returns 일주 성격 데이터
 */
export async function getIljuPersonality(
  ilju: string
): Promise<IljuPersonality> {
  const personalities = await loadIljuPersonalities();

  if (!personalities[ilju]) {
    throw new Error(`일주 데이터를 찾을 수 없습니다: ${ilju}`);
  }

  return personalities[ilju];
}

/**
 * 특정 운성의 테마 데이터 가져오기
 *
 * @param unseong - 십이운성 (예: "장생")
 * @returns 십이운성 테마 데이터
 */
export async function getUnseongTheme(unseong: string): Promise<UnseongTheme> {
  const themes = await loadUnseongThemes();

  if (!themes[unseong]) {
    throw new Error(`십이운성 테마 데이터를 찾을 수 없습니다: ${unseong}`);
  }

  return themes[unseong];
}

/**
 * 특정 공휴일의 메시지 가져오기
 *
 * @param holidayName - 공휴일 이름 (예: "신정", "생일")
 * @returns 공휴일 메시지 데이터
 */
export async function getHolidayMessage(
  holidayName: string
): Promise<HolidayMessage> {
  const messages = await loadHolidayMessages();

  if (!messages[holidayName]) {
    throw new Error(`공휴일 메시지를 찾을 수 없습니다: ${holidayName}`);
  }

  return messages[holidayName];
}

/**
 * 모든 데이터 미리 로드 (성능 최적화용)
 */
export async function preloadAllData(): Promise<void> {
  await Promise.all([
    loadIljuPersonalities(),
    loadUnseongThemes(),
    loadHolidayMessages(),
    loadFortuneTemplates(),
  ]);
}

/**
 * 캐시 초기화 (테스트용)
 */
export function clearCache(): void {
  iljuPersonalitiesCache = null;
  unseongThemesCache = null;
  holidayMessagesCache = null;
  fortuneTemplatesCache = null;
}
