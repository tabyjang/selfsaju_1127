// Supabase를 사용한 이론 데이터 로더

import { createClient } from '@supabase/supabase-js';
import { TheoryIndex, TheoryContent, TheoryMetadata } from './types';

// Supabase 클라이언트 초기화
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 캐시 (선택사항 - DB 쿼리도 충분히 빠름)
let indexCache: TheoryIndex | null = null;
const contentCache: Map<string, TheoryContent> = new Map();

/**
 * 이론 목록 인덱스 로드 (DB에서)
 */
export async function loadTheoryIndex(): Promise<TheoryIndex> {
  if (indexCache) {
    console.log('[Theory] 캐시에서 인덱스 로드');
    return indexCache;
  }

  try {
    console.log('[Theory] Supabase에서 인덱스 로드 중...');

    // theories 테이블에서 메타데이터만 가져오기
    const { data: theories, error } = await supabase
      .from('theories')
      .select('id, title, subtitle, category, tags, description, difficulty, read_time, image_url, featured, related_theories, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // 데이터 변환
    const theoryMetadata: TheoryMetadata[] = theories.map(t => ({
      id: t.id,
      title: t.title,
      subtitle: t.subtitle,
      category: t.category,
      tags: t.tags,
      description: t.description,
      difficulty: t.difficulty,
      readTime: t.read_time,
      imageUrl: t.image_url,
      featured: t.featured,
      relatedTheories: t.related_theories,
      updatedAt: t.updated_at
    }));

    // 카테고리 정보 (하드코딩 또는 별도 테이블에서 가져오기)
    const categories = [
      { id: 'classic', name: '고전 명리', description: '전통 명리학 경전', icon: '📜' },
      { id: 'basics', name: '기초 이론', description: '명리학 기초 개념', icon: '📖' },
      { id: 'advanced', name: '심화 이론', description: '고급 명리학 이론', icon: '🎓' },
      { id: 'practical', name: '실전 활용', description: '실전 해석 가이드', icon: '⚡' }
    ];

    const index: TheoryIndex = {
      theories: theoryMetadata,
      categories
    };

    indexCache = index;
    console.log(`[Theory] 인덱스 로드 완료: ${theories.length}개 이론`);

    return index;
  } catch (error) {
    console.error('[Theory] 인덱스 로드 실패:', error);
    throw new Error('이론 목록을 로드할 수 없습니다.');
  }
}

/**
 * 이론 콘텐츠 로드 (DB에서)
 */
export async function loadTheoryContent(id: string): Promise<TheoryContent> {
  // 캐시 확인
  if (contentCache.has(id)) {
    console.log(`[Theory] 캐시에서 콘텐츠 로드: ${id}`);
    return contentCache.get(id)!;
  }

  try {
    console.log(`[Theory] Supabase에서 콘텐츠 로드 중: ${id}`);

    // 전체 데이터 가져오기
    const { data: theory, error } = await supabase
      .from('theories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!theory) {
      throw new Error(`이론을 찾을 수 없습니다: ${id}`);
    }

    // 데이터 변환
    const theoryContent: TheoryContent = {
      metadata: {
        id: theory.id,
        title: theory.title,
        subtitle: theory.subtitle,
        category: theory.category,
        tags: theory.tags,
        description: theory.description,
        difficulty: theory.difficulty,
        readTime: theory.read_time,
        imageUrl: theory.image_url,
        featured: theory.featured,
        relatedTheories: theory.related_theories,
        updatedAt: theory.updated_at
      },
      content: theory.content_markdown,
      htmlContent: theory.content_html,
      tableOfContents: theory.table_of_contents || []
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
 * 카테고리별 이론 목록 가져오기
 */
export async function getTheoriesByCategory(category: string): Promise<TheoryMetadata[]> {
  const { data, error } = await supabase
    .from('theories')
    .select('id, title, subtitle, category, tags, description, difficulty, read_time, image_url, featured, related_theories')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(t => ({
    id: t.id,
    title: t.title,
    subtitle: t.subtitle,
    category: t.category,
    tags: t.tags,
    description: t.description,
    difficulty: t.difficulty,
    readTime: t.read_time,
    imageUrl: t.image_url,
    featured: t.featured,
    relatedTheories: t.related_theories
  }));
}

/**
 * 이론 검색 (전체 텍스트 검색)
 */
export async function searchTheories(query: string): Promise<TheoryMetadata[]> {
  const { data, error } = await supabase
    .from('theories')
    .select('id, title, subtitle, category, tags, description, difficulty, read_time, image_url, featured, related_theories')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(t => ({
    id: t.id,
    title: t.title,
    subtitle: t.subtitle,
    category: t.category,
    tags: t.tags,
    description: t.description,
    difficulty: t.difficulty,
    readTime: t.read_time,
    imageUrl: t.image_url,
    featured: t.featured,
    relatedTheories: t.related_theories
  }));
}

/**
 * Featured 이론 가져오기
 */
export async function getFeaturedTheories(): Promise<TheoryMetadata[]> {
  const { data, error } = await supabase
    .from('theories')
    .select('id, title, subtitle, category, tags, description, difficulty, read_time, image_url, featured, related_theories')
    .eq('featured', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(t => ({
    id: t.id,
    title: t.title,
    subtitle: t.subtitle,
    category: t.category,
    tags: t.tags,
    description: t.description,
    difficulty: t.difficulty,
    readTime: t.read_time,
    imageUrl: t.image_url,
    featured: t.featured,
    relatedTheories: t.related_theories
  }));
}

/**
 * 캐시 초기화
 */
export function clearTheoryCache(): void {
  indexCache = null;
  contentCache.clear();
  console.log('[Theory] 캐시 초기화됨');
}
