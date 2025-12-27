// 60일주 MD 파일 로더

import { SIXTY_GANJI, ILJU_ORDER_INDEX, getCheonganFromIlju } from './iljuData';
import { parseFrontMatter, parseMarkdown } from '../theory/markdownParser';

// 일주 콘텐츠 타입
export interface IljuContent {
  name: string;
  title: string;
  subtitle: string;
  orderIndex: number;
  tags: string[];
  contentHtml: string;
  images: string[];
}

// 캐시
const iljuContentCache = new Map<string, IljuContent>();

/**
 * 일주 MD 파일 로드
 * @param iljuName - 일주 이름 (예: '갑자')
 * @returns 파싱된 일주 콘텐츠
 */
export async function loadIljuContent(iljuName: string): Promise<IljuContent | null> {
  // 캐시 확인
  if (iljuContentCache.has(iljuName)) {
    return iljuContentCache.get(iljuName)!;
  }

  // 유효한 일주인지 확인
  if (!SIXTY_GANJI.includes(iljuName)) {
    console.error(`유효하지 않은 일주: ${iljuName}`);
    return null;
  }

  try {
    // MD 파일 로드
    const response = await fetch(`/theories/content/60ilju/${iljuName}.md`);
    if (!response.ok) {
      throw new Error(`MD 파일 로드 실패: ${response.status}`);
    }

    const markdown = await response.text();

    // 프론트매터 파싱
    const { metadata, content } = parseFrontMatter(markdown);

    // 마크다운 → HTML 변환
    const contentHtml = parseMarkdown(content);

    // 이미지 경로 생성 (img-02 ~ img-05, 4개)
    const images = [2, 3, 4, 5].map(
      (num) => `/60ilju/${iljuName}/img-0${num}.webp`
    );

    const iljuContent: IljuContent = {
      name: iljuName,
      title: metadata.title || iljuName,
      subtitle: metadata.subtitle || '',
      orderIndex: metadata.orderIndex || ILJU_ORDER_INDEX[iljuName],
      tags: metadata.tags || [],
      contentHtml,
      images,
    };

    // 캐시에 저장
    iljuContentCache.set(iljuName, iljuContent);

    return iljuContent;
  } catch (error) {
    console.error(`일주 콘텐츠 로드 실패 (${iljuName}):`, error);
    return null;
  }
}

/**
 * 모든 일주 목록 로드 (메타데이터만)
 */
export async function loadAllIljuMeta(): Promise<{ name: string; orderIndex: number }[]> {
  return SIXTY_GANJI.map((name) => ({
    name,
    orderIndex: ILJU_ORDER_INDEX[name],
  }));
}

/**
 * 천간별 일주 목록 로드
 * @param cheongan - 천간 (예: '갑')
 */
export async function loadIljuByCheongan(cheongan: string): Promise<string[]> {
  return SIXTY_GANJI.filter((ilju) => getCheonganFromIlju(ilju) === cheongan);
}

/**
 * 캐시 클리어
 */
export function clearIljuCache(): void {
  iljuContentCache.clear();
}
