/**
 * 공휴일 및 특별한 날 체크 함수
 */

import { HolidayInfo } from './types';

/**
 * 양력 공휴일 맵
 * 키: 'MM-DD' 형식
 */
const SOLAR_HOLIDAYS: { [key: string]: string } = {
  '01-01': '신정',
  '03-01': '삼일절',
  '05-05': '어린이날',
  '06-06': '현충일',
  '08-15': '광복절',
  '10-03': '개천절',
  '10-09': '한글날',
  '12-25': '크리스마스',
};

/**
 * 음력 공휴일 정보
 * 실제 음력 변환은 별도 라이브러리 필요
 */
const LUNAR_HOLIDAYS: { [key: string]: string } = {
  '01-01': '설날',
  '04-08': '부처님오신날',
  '08-15': '추석',
};

/**
 * 날짜를 'MM-DD' 형식 문자열로 변환
 *
 * @param date - 날짜 객체
 * @returns 'MM-DD' 형식 문자열
 */
function formatDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}

/**
 * 요일을 숫자로 반환 (0: 일요일, 1: 월요일, ..., 6: 토요일)
 *
 * @param date - 날짜 객체
 * @returns 요일 숫자 (0-6)
 */
function getDayOfWeek(date: Date): number {
  return date.getDay();
}

/**
 * 오늘이 특별한 날인지 체크
 *
 * @param date - 체크할 날짜
 * @param userBirthday - 사용자 생일 (선택, 'MM-DD' 형식)
 * @returns 공휴일 정보 또는 null
 */
export function checkHoliday(
  date: Date,
  userBirthday?: string
): HolidayInfo | null {
  const dateKey = formatDateKey(date);
  const dayOfWeek = getDayOfWeek(date);

  // 1. 생일 체크 (최우선)
  if (userBirthday && dateKey === userBirthday) {
    return {
      name: '생일',
      type: 'birthday',
      message: null as any, // fortune_generator에서 로드
    };
  }

  // 2. 양력 공휴일 체크
  if (SOLAR_HOLIDAYS[dateKey]) {
    return {
      name: SOLAR_HOLIDAYS[dateKey],
      type: 'fixed',
      message: null as any, // fortune_generator에서 로드
    };
  }

  // 3. 요일 체크 (월요일, 금요일, 주말)
  if (dayOfWeek === 1) {
    // 월요일
    return {
      name: '월요일',
      type: 'weekly',
      message: null as any,
    };
  }

  if (dayOfWeek === 5) {
    // 금요일
    return {
      name: '금요일',
      type: 'weekly',
      message: null as any,
    };
  }

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    // 주말 (일요일 또는 토요일)
    return {
      name: '주말',
      type: 'weekly',
      message: null as any,
    };
  }

  // 4. 음력 공휴일 체크 (TODO: 음력 변환 라이브러리 필요)
  // 현재는 구현하지 않음. 필요시 추가.

  return null;
}

/**
 * 특정 날짜가 공휴일인지만 확인 (true/false)
 *
 * @param date - 체크할 날짜
 * @param userBirthday - 사용자 생일 (선택)
 * @returns 공휴일 여부
 */
export function isHoliday(date: Date, userBirthday?: string): boolean {
  return checkHoliday(date, userBirthday) !== null;
}

/**
 * 공휴일 이름 가져오기
 *
 * @param date - 체크할 날짜
 * @param userBirthday - 사용자 생일 (선택)
 * @returns 공휴일 이름 또는 null
 */
export function getHolidayName(date: Date, userBirthday?: string): string | null {
  const holiday = checkHoliday(date, userBirthday);
  return holiday ? holiday.name : null;
}

/**
 * 음력 날짜를 양력으로 변환 (TODO)
 * 현재는 빈 구현. 추후 음력 라이브러리 추가 필요
 *
 * @param lunarYear - 음력 연도
 * @param lunarMonth - 음력 월
 * @param lunarDay - 음력 일
 * @returns 양력 날짜 또는 null
 */
export function lunarToSolar(
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number
): Date | null {
  // TODO: 음력 변환 라이브러리 사용
  // 예: korean-lunar-calendar, lunar-calendar 등
  console.warn('음력 변환 기능이 아직 구현되지 않았습니다.');
  return null;
}

/**
 * 양력 날짜를 음력으로 변환 (TODO)
 * 현재는 빈 구현. 추후 음력 라이브러리 추가 필요
 *
 * @param date - 양력 날짜
 * @returns 음력 날짜 정보 또는 null
 */
export function solarToLunar(date: Date): {
  year: number;
  month: number;
  day: number;
} | null {
  // TODO: 음력 변환 라이브러리 사용
  console.warn('음력 변환 기능이 아직 구현되지 않았습니다.');
  return null;
}
