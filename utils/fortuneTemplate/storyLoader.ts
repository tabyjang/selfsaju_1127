/**
 * 스토리 운세 로더
 * 일주별 파일을 동적으로 로드하고 캐싱
 */

// 일주 스토리 데이터 타입
export interface StoryVersion {
  v: number;
  그룹: string;
  제목: string;
  본문: string;
  액션: string;
}

export interface IljuStoryData {
  일주: string;
  한자: string;
  기본이미지: string;
  운세: {
    [unseong: string]: StoryVersion[];
  };
}

// 캐시 (메모리)
const storyCache = new Map<string, IljuStoryData>();

// 일주 한글명 매핑
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

/**
 * 일주 한글명 가져오기
 */
function getIljuKoreanName(ilju: string): string {
  return iljuKoreanMap[ilju] || '갑자';
}

/**
 * 일주별 스토리 데이터 로드 (Lazy Loading + Caching)
 *
 * @param ilju - 일주 한자 (예: "甲子")
 * @returns 일주 스토리 데이터
 */
export async function loadStoryForIlju(ilju: string): Promise<IljuStoryData | null> {
  // 1. 캐시 확인
  if (storyCache.has(ilju)) {
    console.log('✅ 캐시에서 스토리 로드:', ilju);
    return storyCache.get(ilju)!;
  }

  // 2. 일주 한글명 변환
  const iljuName = getIljuKoreanName(ilju);

  // 3. 해당 일주 파일만 동적 로드
  try {
    const data = await import(`../../today_unse/stories/${iljuName}.json`);
    const storyData = data.default as IljuStoryData;

    // 4. 캐시에 저장
    storyCache.set(ilju, storyData);

    console.log('✅ 스토리 파일 로드 완료:', iljuName, `(12운성 × 버전들)`);
    return storyData;
  } catch (error) {
    console.error('❌ 스토리 로드 실패:', iljuName, error);
    return null;
  }
}

/**
 * 특정 운성의 스토리 버전 선택
 *
 * @param iljuData - 일주 스토리 데이터
 * @param unseong - 십이운성 이름 (예: "장생", "목욕")
 * @param seed - 날짜 기반 시드 (버전 선택용)
 * @returns 선택된 스토리
 */
export function selectStoryVersion(
  iljuData: IljuStoryData,
  unseong: string,
  seed: number
): StoryVersion | null {
  const unseongStories = iljuData.운세[unseong];

  if (!unseongStories || unseongStories.length === 0) {
    console.error(`❌ ${unseong} 운세 데이터 없음:`, iljuData.일주);
    return null;
  }

  // 시드를 사용하여 버전 선택 (0 ~ 버전 개수-1)
  const selectedIndex = seed % unseongStories.length;
  return unseongStories[selectedIndex];
}

/**
 * 캐시 초기화
 */
export function clearStoryCache(): void {
  storyCache.clear();
  console.log('🧹 스토리 캐시 초기화 완료');
}

/**
 * 캐시 상태 확인
 */
export function getStoryCacheStatus(): {
  size: number;
  cached: string[];
} {
  return {
    size: storyCache.size,
    cached: Array.from(storyCache.keys()),
  };
}
