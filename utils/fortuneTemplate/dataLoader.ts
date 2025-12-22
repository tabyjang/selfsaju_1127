/**
 * JSON 데이터 로더
 * 운세 생성에 필요한 데이터 파일들을 로드
 */

import {
  IljuPersonality,
  UnseongTheme,
  HolidayMessage,
  FortuneTemplates,
  IljuDailyEvent,
} from './types';
import { selectFromArray } from './templateSelector';

// 데이터 파일 경로
const DATA_PATH = './today_unse';

// 캐시된 데이터
let iljuPersonalitiesCache: { [key: string]: any } | null = null;
let unseongThemesCache: { [key: string]: UnseongTheme } | null = null;
let holidayMessagesCache: { [key: string]: HolidayMessage } | null = null;
let fortuneTemplatesCache: FortuneTemplates | null = null;
// 일주별 개별 캐시 (일주 한자를 키로 사용)
let iljuDailyEventsCache: { [key: string]: IljuDailyEvent } = {};

/**
 * 60개 일주 성격 데이터 로드
 *
 * @returns 일주 성격 데이터 객체 (필드가 배열 또는 문자열)
 */
export async function loadIljuPersonalities(): Promise<{
  [key: string]: any;
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
 * 배열로 된 필드는 seed를 사용해 랜덤 선택
 *
 * @param ilju - 일주 한자 (예: "己丑")
 * @param seed - 랜덤 선택을 위한 시드 (기본값: 0)
 * @returns 일주 성격 데이터
 */
export async function getIljuPersonality(
  ilju: string,
  seed: number = 0
): Promise<IljuPersonality> {
  const personalities = await loadIljuPersonalities();

  if (!personalities[ilju]) {
    throw new Error(`일주 데이터를 찾을 수 없습니다: ${ilju}`);
  }

  const rawData = personalities[ilju];

  // 배열 필드는 seed를 사용해 선택, 그 외는 그대로 사용
  const selectValue = (field: any, offset: number = 0): string => {
    if (Array.isArray(field)) {
      return selectFromArray(field, seed + offset);
    }
    return field;
  };

  return {
    일주: rawData.일주,
    한자: rawData.한자,
    핵심특성: selectValue(rawData.핵심특성, 1),
    강점: selectValue(rawData.강점, 2),
    소통스타일: selectValue(rawData.소통스타일, 3),
    감정표현: selectValue(rawData.감정표현, 4),
    업무스타일: selectValue(rawData.업무스타일, 5),
    추가특징: rawData.추가특징,
  };
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
 * 60개 일주별 일일 이벤트 데이터 로드
 * @deprecated 모바일 성능 최적화를 위해 getIljuDailyEvent()를 직접 사용하세요
 * @returns 일주별 일일 이벤트 데이터 객체
 */
export async function loadIljuDailyEvents(): Promise<{
  [key: string]: IljuDailyEvent;
}> {
  console.warn('[성능 경고] loadIljuDailyEvents()는 deprecated되었습니다. getIljuDailyEvent()를 사용하세요.');

  // 이전 버전 호환성을 위해 유지하되, 경고 표시
  try {
    const response = await fetch(`${DATA_PATH}/ilju_daily_events.json`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('일주 이벤트 데이터 로드 실패:', error);
    throw new Error('일주 이벤트 데이터를 로드할 수 없습니다.');
  }
}

/**
 * 특정 일주의 일일 이벤트 데이터 가져오기
 * 모바일 최적화: 필요한 일주 파일만 개별 로드 (5.2KB)
 *
 * @param ilju - 일주 한자 (예: "己丑")
 * @returns 일주 일일 이벤트 데이터
 */
export async function getIljuDailyEvent(
  ilju: string
): Promise<IljuDailyEvent> {
  // 캐시에 이미 있으면 반환
  if (iljuDailyEventsCache[ilju]) {
    return iljuDailyEventsCache[ilju];
  }

  try {
    // 개별 일주 파일 로드 (예: daily_events/甲子.json)
    // 프로덕션: 브라우저 캐시 활용 (모바일 성능 최적화)
    const response = await fetch(`${DATA_PATH}/daily_events/${ilju}.json`, {
      cache: 'default', // 브라우저 기본 캐시 전략 (재방문 시 빠른 로드)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // 캐시에 저장
    iljuDailyEventsCache[ilju] = data;

    return data;
  } catch (error) {
    console.error(`일주 이벤트 데이터 로드 실패 (${ilju}):`, error);
    throw new Error(`일주 이벤트 데이터를 로드할 수 없습니다: ${ilju}`);
  }
}

/**
 * 모든 데이터 미리 로드 (성능 최적화용)
 * 주의: 일주 이벤트는 필요할 때 개별 로드되므로 제외
 */
export async function preloadAllData(): Promise<void> {
  await Promise.all([
    loadIljuPersonalities(),
    loadUnseongThemes(),
    loadHolidayMessages(),
    loadFortuneTemplates(),
    // loadIljuDailyEvents() - 모바일 최적화를 위해 제거됨
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
  iljuDailyEventsCache = {}; // 객체로 변경
}
