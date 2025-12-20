import { getSibsinByIlganAndTarget } from './manse';
import { cheonEulGwiInMap } from './sinsal';
import type { SajuInfo } from '../types';

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
  todayUnseong: string
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

    // 동적 import로 JSON 파일 로드
    const jsonData = await import(`../today_unse/${jsonFileName}.json`);

    // 8. 키 생성: "십성_귀인_운성" 형식
    const key = `${sibsinName}_${gwiinStr}_${unseongName}`;

    console.log('🔑 운세 조회 키:', {
      일간,
      월지: woljee,
      십성: sibsinName,
      귀인: gwiinStr,
      운성: unseongName,
      득령실령: deukryeongKey,
      최종키: key
    });

    // 9. 데이터 조회
    const data = jsonData.default?.[deukryeongKey]?.[key];

    console.log('📦 조회된 데이터:', data);
    console.log('📁 전체 JSON 구조:', jsonData.default);

    if (!data) {
      console.error('❌ 운세 데이터를 찾을 수 없습니다:', { deukryeongKey, key });
      console.log('사용 가능한 키들:', Object.keys(jsonData.default?.[deukryeongKey] || {}));
      return null;
    }

    return data as TodayUnseData;
  } catch (error) {
    console.error('오늘의 운세 데이터 조회 실패:', error);
    return null;
  }
};
