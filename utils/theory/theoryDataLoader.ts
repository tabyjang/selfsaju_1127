// 이론 데이터 로더 (캐싱 포함)

import { TheoryIndex, TheoryContent, TheoryMetadata } from './types';
import { parseMarkdown, parseFrontMatter } from './markdownParser';
import { generateTableOfContents } from './tocGenerator';

// 캐시 저장소
let indexCache: TheoryIndex | null = null;
const contentCache: Map<string, TheoryContent> = new Map();

/**
 * 이론 목록 인덱스 로드
 */
export async function loadTheoryIndex(): Promise<TheoryIndex> {
  if (indexCache) {
    console.log('[Theory] 캐시에서 인덱스 로드');
    return indexCache;
  }

  try {
    console.log('[Theory] 인덱스 파일 로드 중...');
    const response = await fetch('/theories/index.json');

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태: ${response.status}`);
    }

    const data: TheoryIndex = await response.json();
    indexCache = data;
    console.log(`[Theory] 인덱스 로드 완료: ${data.theories.length}개 이론`);

    return data;
  } catch (error) {
    console.error('[Theory] 인덱스 로드 실패:', error);
    throw new Error('이론 목록을 로드할 수 없습니다.');
  }
}

/**
 * 이론 콘텐츠 로드
 */
export async function loadTheoryContent(id: string): Promise<TheoryContent> {
  // 캐시 확인
  if (contentCache.has(id)) {
    console.log(`[Theory] 캐시에서 콘텐츠 로드: ${id}`);
    return contentCache.get(id)!;
  }

  try {
    console.log(`[Theory] 콘텐츠 파일 로드 중: ${id}`);
    const response = await fetch(`/theories/content/${id}.md`);

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태: ${response.status}`);
    }

    const markdown = await response.text();

    // 프론트매터 파싱
    const { metadata, content } = parseFrontMatter(markdown);

    // 마크다운 → HTML 변환
    const htmlContent = parseMarkdown(content);

    // 목차 생성
    const tableOfContents = generateTableOfContents(content);

    const theoryContent: TheoryContent = {
      metadata,
      content,
      htmlContent,
      tableOfContents
    };

    // 캐시 저장
    contentCache.set(id, theoryContent);
    console.log(`[Theory] 콘텐츠 로드 완료: ${id}`);

    return theoryContent;
  } catch (error) {
    console.error(`[Theory] 콘텐츠 로드 실패 (${id}):`, error);
    throw new Error(`"${id}" 이론을 로드할 수 없습니다.`);
  }
}

/**
 * 특정 카테고리의 이론 목록 가져오기
 */
export async function getTheoriesByCategory(category: string): Promise<TheoryMetadata[]> {
  const index = await loadTheoryIndex();

  if (category === 'all') {
    return index.theories;
  }

  return index.theories.filter(t => t.category === category);
}

/**
 * 추천 이론 (featured) 가져오기
 */
export async function getFeaturedTheories(): Promise<TheoryMetadata[]> {
  const index = await loadTheoryIndex();
  return index.theories.filter(t => t.featured);
}

/**
 * ID로 이론 메타데이터 찾기
 */
export async function getTheoryMetadata(id: string): Promise<TheoryMetadata | null> {
  const index = await loadTheoryIndex();
  return index.theories.find(t => t.id === id) || null;
}

/**
 * 캐시 초기화 (개발용)
 */
export function clearTheoryCache(): void {
  indexCache = null;
  contentCache.clear();
  console.log('[Theory] 캐시 초기화됨');
}

/**
 * 모든 이론 데이터 미리 로드 (선택사항)
 */
export async function preloadAllTheories(): Promise<void> {
  const index = await loadTheoryIndex();
  console.log('[Theory] 모든 이론 미리 로드 시작...');

  await Promise.all(
    index.theories.map(theory => loadTheoryContent(theory.id))
  );

  console.log('[Theory] 모든 이론 미리 로드 완료');
}
