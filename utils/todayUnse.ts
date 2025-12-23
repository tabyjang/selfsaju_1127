import { getSibsinByIlganAndTarget } from './manse';
import { cheonEulGwiInMap } from './sinsal';
import type { SajuInfo } from '../types';
import { generateFortune, formatFortune, type FortuneInput, type GeneratedFortune } from './fortuneTemplate';
import { generateStoryFortune, formatStoryFortune } from './fortuneTemplate/storyFortuneGenerator';

// 일간별 JSON 파일 매핑
const ilganJsonMap: { [key: string]: string } = {
  '甲': 'gapMok',
  '乙': 'eulMok',
  '丙': 'byeongHwa',
  '丁': 'jeongHwa',
  '戊': 'muTo',
  '己': 'giTo',
  '庚': 'gyeongGeum',
  '辛': 'sinGeum',
  '壬': 'imSu',
  '癸': 'gyeSu',
};

// 십성 한글 이름
const sibsinNames = ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인'];

// 십이운성 한글 이름
const unseongNames = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양'];

// 득령 여부 판단 (십성이 인성/비겁이면 득령, 식상/재성/관성이면 실령)
const isDeukryeong = (sibsinName: string): boolean => {
  // 비견(0), 겁재(1), 편인(8), 정인(9) -> 득령
  // 식신(2), 상관(3), 편재(4), 정재(5), 편관(6), 정관(7) -> 실령
  return sibsinName === '비견' || sibsinName === '겁재' || sibsinName === '편인' || sibsinName === '정인';
};

// 천을귀인 여부 확인
const hasCheonEulGwiin = (ilgan: string, jiji: string): boolean => {
  const gwiins = cheonEulGwiInMap[ilgan] || [];
  return gwiins.includes(jiji);
};

// 오늘의 운세 데이터 조회
export interface TodayUnseData {
  십성: string;
  귀인: string;
  운성: string;
  AE: number;
  ME: number;
  액션플랜: string[];
  운세전반: string;
}

export const getTodayUnseData = async (
  sajuData: SajuInfo,
  todayJiji: string,
  todayUnseong: string,
  loadBoth: boolean = false // 득령+실령 둘 다 로딩 옵션
): Promise<TodayUnseData | null> => {
  try {
    // 1. 일간 가져오기
    const ilgan = sajuData.pillars.day.cheonGan.char;

    // 2. 월지 가져오기
    const woljee = sajuData.pillars.month.jiJi.char;

    // 3. 월지의 십성 계산
    const sibsinInfo = getSibsinByIlganAndTarget(ilgan, woljee);
    const sibsinName = sibsinInfo.name;

    // 4. 천을귀인 여부 확인 (오늘 일주의 지지 기준)
    const hasGwiin = hasCheonEulGwiin(ilgan, todayJiji);
    const gwiinStr = hasGwiin ? 'O' : 'X';

    // 5. 십이운성 사용 (파라미터로 전달받음)
    const unseongName = todayUnseong;

    // 6. 득령/실령 판단
    const deukryeong = isDeukryeong(sibsinName);
    const deukryeongKey = deukryeong ? '득령' : '실령';

    // 7. JSON 파일 로드
    const jsonFileName = ilganJsonMap[ilgan];
    if (!jsonFileName) {
      console.error('지원하지 않는 일간:', ilgan);
      return null;
    }

    // 8. 키 생성: "십성_귀인_운성" 형식
    const key = `${sibsinName}_${gwiinStr}_${unseongName}`;

    // 9. 득령/실령에 따라 파일 로드
    if (loadBoth) {
      // 옵션: 득령+실령 둘 다 로드 (분량 늘리기)
      const 득령Data = await import(`../today_unse/${jsonFileName}_득령.json`);
      const 실령Data = await import(`../today_unse/${jsonFileName}_실령.json`);

      const 득령Result = 득령Data.default?.[key];
      const 실령Result = 실령Data.default?.[key];

      // 둘 다 있으면 합치기
      if (득령Result && 실령Result) {
        return {
          십성: 득령Result.십성,
          귀인: 득령Result.귀인,
          운성: 득령Result.운성,
          AE: 득령Result.AE,
          ME: 득령Result.ME,
          액션플랜: [...득령Result.액션플랜, ...실령Result.액션플랜],
          운세전반: `[득령일 때]\n${득령Result.운세전반}\n\n[실령일 때]\n${실령Result.운세전반}`
        } as TodayUnseData;
      }

      // 하나만 있으면 그것 반환
      return (득령Result || 실령Result) as TodayUnseData;
    } else {
      // 기본: 득령 또는 실령 하나만 로드
      const suffix = deukryeong ? '_득령' : '_실령';
      const jsonData = await import(`../today_unse/${jsonFileName}${suffix}.json`);
      const data = jsonData.default?.[key];

      if (!data) {
        console.error('❌ 운세 데이터를 찾을 수 없습니다:', { deukryeongKey, key });
        return null;
      }

      return data as TodayUnseData;
    }
  } catch (error) {
    console.error('오늘의 운세 데이터 조회 실패:', error);
    return null;
  }
};

/**
 * 템플릿 기반 오늘의 운세 생성 (신규)
 * 일주 특성을 반영한 개인화된 운세 생성
 *
 * @param sajuData - 사주 데이터
 * @param todayJiji - 오늘 지지
 * @param todayUnseong - 오늘 십이운성
 * @param userBirthday - 사용자 생일 (선택, 'MM-DD' 형식)
 * @returns 생성된 운세
 */
export const getTodayUnseWithTemplate = async (
  sajuData: SajuInfo,
  todayJiji: string,
  todayUnseong: string,
  userBirthday?: string
): Promise<GeneratedFortune | null> => {
  try {
    // 1. 일간 가져오기
    const ilgan = sajuData.pillars.day.cheonGan.char;

    // 2. 일주 가져오기 (일간 + 일지)
    const ilju = sajuData.pillars.day.cheonGan.char + sajuData.pillars.day.jiJi.char;

    // 3. 월지 가져오기
    const woljee = sajuData.pillars.month.jiJi.char;

    // 4. 월지의 십성 계산
    const sibsinInfo = getSibsinByIlganAndTarget(ilgan, woljee);
    const sibsinName = sibsinInfo.name;

    // 5. 천을귀인 여부 확인 (오늘 일주의 지지 기준)
    const hasGwiin = hasCheonEulGwiin(ilgan, todayJiji);

    // 6. 득령/실령 판단
    const deukryeong = isDeukryeong(sibsinName);

    // 7. FortuneInput 생성
    const input: FortuneInput = {
      ilju,
      todayJiji,
      sibsin: sibsinName,
      unseong: todayUnseong,
      deukryeong,
      gwiin: hasGwiin,
      date: new Date(),
    };

    // 8. 템플릿 기반 운세 생성
    const fortune = await generateFortune(input, userBirthday);

    return fortune;
  } catch (error) {
    console.error('템플릿 기반 운세 생성 실패:', error);
    return null;
  }
};

/**
 * 템플릿 기반 오늘의 운세를 마크다운 형식으로 가져오기
 *
 * @param sajuData - 사주 데이터
 * @param todayJiji - 오늘 지지
 * @param todayUnseong - 오늘 십이운성
 * @param userBirthday - 사용자 생일 (선택)
 * @returns 마크다운 형식 운세 문자열
 */
export const getTodayUnseMarkdown = async (
  sajuData: SajuInfo,
  todayJiji: string,
  todayUnseong: string,
  userBirthday?: string
): Promise<string | null> => {
  const fortune = await getTodayUnseWithTemplate(sajuData, todayJiji, todayUnseong, userBirthday);

  if (!fortune) {
    return null;
  }

  return formatFortune(fortune);
};

/**
 * 스토리 기반 오늘의 운세 생성 (신규)
 * 짧고 강렬한 시적 운세
 *
 * @param sajuData - 사주 데이터
 * @param todayJiji - 오늘 지지
 * @param todayUnseong - 오늘 십이운성
 * @param userBirthday - 사용자 생일 (선택, 'MM-DD' 형식)
 * @param targetDate - 운세 생성 기준 날짜 (선택, 기본값: 오늘)
 * @returns 생성된 운세
 */
export const getTodayStoryFortune = async (
  sajuData: SajuInfo,
  todayJiji: string,
  todayUnseong: string,
  userBirthday?: string,
  targetDate?: Date
): Promise<GeneratedFortune | null> => {
  try {
    // 1. 일간 가져오기
    const ilgan = sajuData.pillars.day.cheonGan.char;

    // 2. 일주 가져오기 (일간 + 일지)
    const ilju = sajuData.pillars.day.cheonGan.char + sajuData.pillars.day.jiJi.char;

    // 3. 월지 가져오기
    const woljee = sajuData.pillars.month.jiJi.char;

    // 4. 월지의 십성 계산
    const sibsinInfo = getSibsinByIlganAndTarget(ilgan, woljee);
    const sibsinName = sibsinInfo.name;

    // 5. 천을귀인 여부 확인 (오늘 일주의 지지 기준)
    const hasGwiin = hasCheonEulGwiin(ilgan, todayJiji);

    // 6. 득령/실령 판단
    const deukryeong = isDeukryeong(sibsinName);

    // 7. FortuneInput 생성
    const input: FortuneInput = {
      ilju,
      todayJiji,
      sibsin: sibsinName,
      unseong: todayUnseong,
      deukryeong,
      gwiin: hasGwiin,
      date: targetDate || new Date(),
    };

    // 8. 스토리 기반 운세 생성
    const fortune = await generateStoryFortune(input, userBirthday);

    return fortune;
  } catch (error) {
    console.error('스토리 기반 운세 생성 실패:', error);
    return null;
  }
};

/**
 * 스토리 기반 오늘의 운세를 마크다운 형식으로 가져오기
 *
 * @param sajuData - 사주 데이터
 * @param todayJiji - 오늘 지지
 * @param todayUnseong - 오늘 십이운성
 * @param userBirthday - 사용자 생일 (선택)
 * @returns 마크다운 형식 운세 문자열
 */
export const getTodayStoryMarkdown = async (
  sajuData: SajuInfo,
  todayJiji: string,
  todayUnseong: string,
  userBirthday?: string
): Promise<string | null> => {
  const fortune = await getTodayStoryFortune(sajuData, todayJiji, todayUnseong, userBirthday);

  if (!fortune) {
    return null;
  }

  return formatStoryFortune(fortune);
};
