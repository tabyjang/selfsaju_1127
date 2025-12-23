/**
 * 심플 운세 생성기
 * 복잡한 기존 시스템 대신 단순하게:
 * 1. 일주 스토리 파일 로드
 * 2. 십이운성으로 운세 선택
 * 3. 플레이스홀더 치환
 */

import type { SajuInfo } from '../types';

// 운세 결과 타입
export interface SimpleFortune {
  title: string;
  content: string;
  actionPlan: string;
  energyLevel: 'high' | 'medium' | 'low';
  activityLevel: 'active' | 'moderate' | 'rest';
}

// 일주 한자 → 한글 매핑
const iljuKoreanMap: { [key: string]: string } = {
  '甲子': '갑자', '乙丑': '을축', '丙寅': '병인', '丁卯': '정묘',
  '戊辰': '무진', '己巳': '기사', '庚午': '경오', '辛未': '신미',
  '壬申': '임신', '癸酉': '계유', '甲戌': '갑술', '乙亥': '을해',
  '丙子': '병자', '丁丑': '정축', '戊寅': '무인', '己卯': '기묘',
  '庚辰': '경진', '辛巳': '신사', '壬午': '임오', '癸未': '계미',
  '甲申': '갑신', '乙酉': '을유', '丙戌': '병술', '丁亥': '정해',
  '戊子': '무자', '己丑': '기축', '庚寅': '경인', '辛卯': '신묘',
  '壬辰': '임진', '癸巳': '계사', '甲午': '갑오', '乙未': '을미',
  '丙申': '병신', '丁酉': '정유', '戊戌': '무술', '己亥': '기해',
  '庚子': '경자', '辛丑': '신축', '壬寅': '임인', '癸卯': '계묘',
  '甲辰': '갑진', '乙巳': '을사', '丙午': '병오', '丁未': '정미',
  '戊申': '무신', '己酉': '기유', '庚戌': '경술', '辛亥': '신해',
  '壬子': '임자', '癸丑': '계축', '甲寅': '갑인', '乙卯': '을묘',
  '丙辰': '병진', '丁巳': '정사', '戊午': '무오', '己未': '기미',
  '庚申': '경신', '辛酉': '신유', '壬戌': '임술', '癸亥': '계해',
};

// 일주 한글 → 파일명 매핑
const iljuFileMap: { [key: string]: string } = {
  '갑자': '01_갑자', '갑인': '02_갑인', '갑진': '03_갑진', '갑오': '04_갑오',
  '갑신': '05_갑신', '갑술': '06_갑술', '을축': '07_을축', '을묘': '08_을묘',
  '을사': '09_을사', '을미': '10_을미', '을유': '11_을유', '을해': '12_을해',
  '병자': '13_병자', '병인': '14_병인', '병진': '15_병진', '병오': '16_병오',
  '병신': '17_병신', '병술': '18_병술', '정축': '19_정축', '정묘': '20_정묘',
  '정사': '21_정사', '정미': '22_정미', '정유': '23_정유', '정해': '24_정해',
  '무자': '25_무자', '무인': '26_무인', '무진': '27_무진', '무오': '28_무오',
  '무신': '29_무신', '무술': '30_무술', '기축': '31_기축', '기묘': '32_기묘',
  '기사': '33_기사', '기미': '34_기미', '기유': '35_기유', '기해': '36_기해',
  '경자': '37_경자', '경인': '38_경인', '경진': '39_경진', '경오': '40_경오',
  '경신': '41_경신', '경술': '42_경술', '신축': '43_신축', '신묘': '44_신묘',
  '신사': '45_신사', '신미': '46_신미', '신유': '47_신유', '신해': '48_신해',
  '임자': '49_임자', '임인': '50_임인', '임진': '51_임진', '임오': '52_임오',
  '임신': '53_임신', '임술': '54_임술', '계축': '55_계축', '계묘': '56_계묘',
  '계사': '57_계사', '계미': '58_계미', '계유': '59_계유', '계해': '60_계해',
};

// 십이운성별 에너지 레벨
const unseongEnergy: { [key: string]: { energy: 'high' | 'medium' | 'low', activity: 'active' | 'moderate' | 'rest' } } = {
  '장생': { energy: 'high', activity: 'active' },
  '목욕': { energy: 'medium', activity: 'moderate' },
  '관대': { energy: 'high', activity: 'active' },
  '건록': { energy: 'high', activity: 'active' },
  '제왕': { energy: 'high', activity: 'active' },
  '쇠': { energy: 'medium', activity: 'moderate' },
  '병': { energy: 'low', activity: 'rest' },
  '사': { energy: 'low', activity: 'rest' },
  '묘': { energy: 'low', activity: 'rest' },
  '절': { energy: 'low', activity: 'rest' },
  '태': { energy: 'medium', activity: 'moderate' },
  '양': { energy: 'medium', activity: 'moderate' },
};

// 스토리 캐시
const storyCache = new Map<string, any>();

// 일주 퍼스낼리티 캐시
let personalityCache: any = null;

/**
 * 날짜 기반 시드 생성 (버전 선택용)
 */
function getDateSeed(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return y * 10000 + m * 100 + d;
}

/**
 * 일주 스토리 파일 로드
 */
async function loadStoryFile(ilju: string): Promise<any> {
  // 캐시 확인
  if (storyCache.has(ilju)) {
    return storyCache.get(ilju);
  }

  // 한자 → 한글 변환
  const iljuKorean = iljuKoreanMap[ilju];
  if (!iljuKorean) {
    console.error('❌ 알 수 없는 일주:', ilju);
    return null;
  }

  // 파일명 가져오기
  const fileName = iljuFileMap[iljuKorean];
  if (!fileName) {
    console.error('❌ 파일 매핑 없음:', iljuKorean);
    return null;
  }

  try {
    const data = await import(`../today_unse/stories/${fileName}.json`);
    const storyData = data.default;
    storyCache.set(ilju, storyData);
    console.log('✅ 스토리 로드 성공:', fileName);
    return storyData;
  } catch (error) {
    console.error('❌ 스토리 로드 실패:', fileName, error);
    return null;
  }
}

/**
 * 일주 퍼스낼리티 로드
 */
async function loadPersonality(ilju: string): Promise<any> {
  if (!personalityCache) {
    try {
      const data = await import('../today_unse/ilju_personalities.json');
      personalityCache = data.default;
    } catch (error) {
      console.error('❌ 퍼스낼리티 로드 실패:', error);
      return null;
    }
  }
  return personalityCache[ilju] || null;
}

/**
 * 플레이스홀더 치환
 */
function replacePlaceholders(text: string, personality: any, seed: number): string {
  if (!text || !personality) return text;

  // 배열에서 시드 기반으로 선택
  const selectFromArray = (arr: any[], offset: number = 0): string => {
    if (!Array.isArray(arr) || arr.length === 0) return '';
    return arr[(seed + offset) % arr.length];
  };

  let result = text;

  // {핵심특성}, {소통스타일}, {감정표현}, {업무스타일} 치환
  if (personality.핵심특성) {
    const value = Array.isArray(personality.핵심특성)
      ? selectFromArray(personality.핵심특성, 1)
      : personality.핵심특성;
    result = result.replace(/\{핵심특성\}/g, value);
  }

  if (personality.소통스타일) {
    const value = Array.isArray(personality.소통스타일)
      ? selectFromArray(personality.소통스타일, 2)
      : personality.소통스타일;
    result = result.replace(/\{소통스타일\}/g, value);
  }

  if (personality.감정표현) {
    const value = Array.isArray(personality.감정표현)
      ? selectFromArray(personality.감정표현, 3)
      : personality.감정표현;
    result = result.replace(/\{감정표현\}/g, value);
  }

  if (personality.업무스타일) {
    const value = Array.isArray(personality.업무스타일)
      ? selectFromArray(personality.업무스타일, 4)
      : personality.업무스타일;
    result = result.replace(/\{업무스타일\}/g, value);
  }

  return result;
}

/**
 * 마크다운을 HTML로 간단 변환
 */
function simpleMarkdownToHtml(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br /><br />')
    .replace(/\n/g, '<br />');
}

/**
 * 심플 운세 생성 (메인 함수)
 */
export async function generateSimpleFortune(
  ilju: string,          // 일주 한자 (예: "己丑")
  unseong: string,       // 십이운성 (예: "장생")
  targetDate?: Date      // 날짜 (기본: 오늘)
): Promise<SimpleFortune | null> {
  const date = targetDate || new Date();
  const seed = getDateSeed(date);

  console.log('🔮 심플 운세 생성 시작:', { ilju, unseong, date: date.toLocaleDateString() });

  // 1. 스토리 파일 로드
  const storyData = await loadStoryFile(ilju);
  if (!storyData) {
    console.error('❌ 스토리 데이터 없음');
    return null;
  }

  // 2. 운세 데이터 가져오기 (십이운성 또는 운세 키)
  const fortuneData = storyData.십이운성 || storyData.운세;
  if (!fortuneData) {
    console.error('❌ 운세 데이터 키 없음:', Object.keys(storyData));
    return null;
  }

  // 3. 해당 운성의 스토리들 가져오기
  let stories = fortuneData[unseong];

  // 형식 2: { fortunes: [...] } 객체인 경우 배열 추출
  if (stories && !Array.isArray(stories) && stories.fortunes) {
    stories = stories.fortunes;
  }

  if (!stories || stories.length === 0) {
    console.error('❌ 해당 운성 스토리 없음:', unseong);
    return null;
  }

  // 4. 날짜 기반으로 버전 선택
  const selectedIndex = seed % stories.length;
  const selectedStory = stories[selectedIndex];

  console.log('📖 선택된 스토리:', { index: selectedIndex, v: selectedStory.v || selectedStory.version });

  // 5. 퍼스낼리티 로드 (플레이스홀더 치환용)
  const personality = await loadPersonality(ilju);

  // 6. 본문 추출 및 플레이스홀더 치환
  let content = selectedStory.본문 || selectedStory.content || '';
  let title = selectedStory.제목 || '오늘의 운세';
  let action = selectedStory.액션 || '';

  if (personality) {
    content = replacePlaceholders(content, personality, seed);
    title = replacePlaceholders(title, personality, seed);
    action = replacePlaceholders(action, personality, seed);
  }

  // 7. HTML 변환
  const contentHtml = simpleMarkdownToHtml(content);

  // 8. 에너지 레벨 결정
  const energyInfo = unseongEnergy[unseong] || { energy: 'medium', activity: 'moderate' };

  console.log('✅ 운세 생성 완료');

  return {
    title,
    content: contentHtml,
    actionPlan: action,
    energyLevel: energyInfo.energy,
    activityLevel: energyInfo.activity,
  };
}

/**
 * SajuInfo에서 바로 운세 생성 (편의 함수)
 */
export async function getSimpleFortune(
  sajuData: SajuInfo,
  todayUnseong: string,
  targetDate?: Date
): Promise<SimpleFortune | null> {
  const ilju = sajuData.pillars.day.ganji;
  return generateSimpleFortune(ilju, todayUnseong, targetDate);
}
