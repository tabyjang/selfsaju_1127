/**
 * 스토리 운세 로더
 * 일주별 파일을 동적으로 로드하고 캐싱
 *
 * 지원 형식:
 * 1. 기존 형식: {v, 타입, 제목, 본문, 액션}
 * 2. 새 형식: {version, content}
 */

// 기존 스토리 버전 타입 (11_을유.json 등)
export interface OldStoryVersion {
  v: number;
  타입: string;
  제목: string;
  본문: string;
  액션: string;
}

// 새 스토리 버전 타입 (02_갑인.json 등)
export interface NewStoryVersion {
  version: string;
  content: string;
}

// 통합 스토리 버전 타입 (내부 사용)
export interface StoryVersion {
  v: number;
  그룹: string;
  제목: string;
  본문: string;
  액션: string;
}

export interface IljuStoryData {
  일주: string;
  한자?: string;
  기본이미지?: string;
  운세: {
    [unseong: string]: StoryVersion[];
  };
}

// 캐시 (메모리)
const storyCache = new Map<string, IljuStoryData>();

// 일주 한글명 → 파일번호 매핑
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
  '경신': '41_경신', '경술': '42_경술', '경해': '43_경해', '신축': '43_신축',
  '신묘': '44_신묘', '신사': '45_신사', '신미': '46_신미', '신유': '47_신유',
  '신해': '48_신해', '임자': '49_임자', '임인': '50_임인', '임진': '51_임진',
  '임오': '52_임오', '임신': '53_임신', '임술': '54_임술', '계축': '55_계축',
  '계묘': '56_계묘', '계사': '57_계사', '계미': '58_계미', '계유': '59_계유',
  '계해': '60_계해',
};

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

/**
 * 일주 한글명 가져오기
 */
function getIljuKoreanName(ilju: string): string {
  return iljuKoreanMap[ilju] || '갑자';
}

/**
 * 파일명 가져오기 (번호 접두사 포함)
 */
function getFileName(iljuKorean: string): string {
  return iljuFileMap[iljuKorean] || iljuKorean;
}

/**
 * 새 형식 데이터를 통합 형식으로 변환
 * {version: "v1", content: "..."} → {v: 1, 그룹: "중립", 제목: "오늘의 운세", 본문: "...", 액션: ""}
 */
function normalizeStoryVersion(item: OldStoryVersion | NewStoryVersion, index: number): StoryVersion {
  // 새 형식인 경우
  if ('version' in item && 'content' in item) {
    const vNum = parseInt(item.version.replace('v', '')) || (index + 1);
    const isPlaceholder = item.content.includes('{핵심특성}') ||
                          item.content.includes('{소통스타일}') ||
                          item.content.includes('{감정표현}') ||
                          item.content.includes('{업무스타일}');

    return {
      v: vNum,
      그룹: isPlaceholder ? '중립' : '심오',
      제목: '오늘의 운세',
      본문: item.content,
      액션: '',
    };
  }

  // 기존 형식인 경우
  const oldItem = item as OldStoryVersion;
  return {
    v: oldItem.v,
    그룹: oldItem.타입 || '중립',
    제목: oldItem.제목,
    본문: oldItem.본문,
    액션: oldItem.액션,
  };
}

/**
 * 운세 데이터 정규화 (새 형식/기존 형식 모두 지원)
 */
function normalizeStoryData(rawData: any): IljuStoryData {
  const normalized: IljuStoryData = {
    일주: rawData.일주 || '',
    한자: rawData.한자,
    기본이미지: rawData.기본이미지,
    운세: {},
  };

  // 각 운성별로 스토리 정규화
  if (rawData.운세) {
    for (const [unseong, stories] of Object.entries(rawData.운세)) {
      if (Array.isArray(stories)) {
        normalized.운세[unseong] = stories.map((story, idx) =>
          normalizeStoryVersion(story as OldStoryVersion | NewStoryVersion, idx)
        );
      }
    }
  }

  return normalized;
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
  const iljuKorean = getIljuKoreanName(ilju);

  // 3. 파일명 가져오기 (번호 접두사 포함)
  const fileName = getFileName(iljuKorean);

  // 4. 해당 일주 파일만 동적 로드
  try {
    const data = await import(`../../today_unse/stories/${fileName}.json`);
    const rawData = data.default;

    // 5. 데이터 정규화 (새 형식/기존 형식 모두 지원)
    const storyData = normalizeStoryData(rawData);

    // 6. 캐시에 저장
    storyCache.set(ilju, storyData);

    console.log('✅ 스토리 파일 로드 완료:', fileName, `(12운성 × 버전들)`);
    return storyData;
  } catch (error) {
    console.error('❌ 스토리 로드 실패:', fileName, error);
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
