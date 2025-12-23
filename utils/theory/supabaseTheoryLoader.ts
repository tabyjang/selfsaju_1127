// Supabase를 사용한 이론 데이터 로더 v2.0
// 3단계 구조: 과목 > 강의 목록 > 강의 상세

import { createClient } from '@supabase/supabase-js';
import {
  CourseIndex,
  TheoryCourse,
  LectureIndex,
  TheoryLectureMetadata,
  TheoryLectureContent,
  // 하위 호환성
  TheoryIndex,
  TheoryContent,
  TheoryMetadata
} from './types';

// Supabase 클라이언트 초기화
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 캐시
let courseIndexCache: CourseIndex | null = null;
const lectureIndexCache: Map<string, LectureIndex> = new Map();
const lectureContentCache: Map<string, TheoryLectureContent> = new Map();

// ============================================
// 과목 (Course) 관련 함수
// ============================================

/**
 * 과목 목록 로드 (대시보드용)
 */
export async function loadCourseIndex(): Promise<CourseIndex> {
  if (courseIndexCache) {
    console.log('[Theory] 캐시에서 과목 목록 로드');
    return courseIndexCache;
  }

  try {
    console.log('[Theory] Supabase에서 과목 목록 로드 중...');

    const { data: courses, error } = await supabase
      .from('theory_courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // 데이터 변환
    const courseList: TheoryCourse[] = courses.map(c => ({
      id: c.id,
      title: c.title,
      subtitle: c.subtitle,
      description: c.description,
      category: c.category,
      difficulty: c.difficulty,
      tags: c.tags,
      imageUrl: c.image_url,
      featured: c.featured,
      lectureCount: c.lecture_count || 0,
      totalReadTime: c.total_read_time || 0,
      createdAt: c.created_at,
      updatedAt: c.updated_at
    }));

    // 카테고리 정보
    const categories = [
      { id: 'classic', name: '고전 명리', description: '전통 명리학 경전', icon: '📜' },
      { id: 'basics', name: '기초 이론', description: '명리학 기초 개념', icon: '📖' },
      { id: 'advanced', name: '심화 이론', description: '고급 명리학 이론', icon: '🎓' },
      { id: 'practical', name: '실전 활용', description: '실전 해석 가이드', icon: '⚡' }
    ];

    const index: CourseIndex = {
      courses: courseList,
      categories
    };

    courseIndexCache = index;
    console.log(`[Theory] 과목 목록 로드 완료: ${courses.length}개`);

    return index;
  } catch (error) {
    console.error('[Theory] 과목 목록 로드 실패:', error);
    throw new Error('과목 목록을 로드할 수 없습니다.');
  }
}

/**
 * 특정 과목 정보 로드
 */
export async function loadCourse(courseId: string): Promise<TheoryCourse> {
  try {
    console.log(`[Theory] 과목 정보 로드: ${courseId}`);

    const { data: course, error } = await supabase
      .from('theory_courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error) {
      throw error;
    }

    if (!course) {
      throw new Error(`과목을 찾을 수 없습니다: ${courseId}`);
    }

    return {
      id: course.id,
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      tags: course.tags,
      imageUrl: course.image_url,
      featured: course.featured,
      lectureCount: course.lecture_count || 0,
      totalReadTime: course.total_read_time || 0,
      createdAt: course.created_at,
      updatedAt: course.updated_at
    };
  } catch (error) {
    console.error(`[Theory] 과목 로드 실패 (${courseId}):`, error);
    throw new Error(`"${courseId}" 과목을 로드할 수 없습니다.`);
  }
}

// ============================================
// 강의 (Lecture) 관련 함수
// ============================================

/**
 * 특정 과목의 강의 목록 로드
 */
export async function loadLectureIndex(courseId: string): Promise<LectureIndex> {
  // 캐시 확인
  if (lectureIndexCache.has(courseId)) {
    console.log(`[Theory] 캐시에서 강의 목록 로드: ${courseId}`);
    return lectureIndexCache.get(courseId)!;
  }

  try {
    console.log(`[Theory] Supabase에서 강의 목록 로드 중: ${courseId}`);

    // 과목 정보 로드
    const course = await loadCourse(courseId);

    // 강의 목록 로드
    const { data: lectures, error } = await supabase
      .from('theory_lectures')
      .select('id, course_id, title, subtitle, description, order_index, read_time, image_url, tags, related_lectures, created_at, updated_at')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (error) {
      throw error;
    }

    // 데이터 변환
    const lectureList: TheoryLectureMetadata[] = lectures.map(l => ({
      id: l.id,
      courseId: l.course_id,
      title: l.title,
      subtitle: l.subtitle,
      description: l.description,
      orderIndex: l.order_index,
      readTime: l.read_time,
      imageUrl: l.image_url,
      tags: l.tags,
      relatedLectures: l.related_lectures,
      createdAt: l.created_at,
      updatedAt: l.updated_at
    }));

    const index: LectureIndex = {
      course,
      lectures: lectureList
    };

    // 캐시 저장
    lectureIndexCache.set(courseId, index);
    console.log(`[Theory] 강의 목록 로드 완료: ${courseId} (${lectures.length}개 강의)`);

    return index;
  } catch (error) {
    console.error(`[Theory] 강의 목록 로드 실패 (${courseId}):`, error);
    throw new Error(`"${courseId}" 과목의 강의 목록을 로드할 수 없습니다.`);
  }
}

/**
 * 강의 상세 콘텐츠 로드
 */
export async function loadLectureContent(lectureId: string): Promise<TheoryLectureContent> {
  // 캐시 확인
  if (lectureContentCache.has(lectureId)) {
    console.log(`[Theory] 캐시에서 강의 콘텐츠 로드: ${lectureId}`);
    return lectureContentCache.get(lectureId)!;
  }

  try {
    console.log(`[Theory] Supabase에서 강의 콘텐츠 로드 중: ${lectureId}`);

    const { data: lecture, error } = await supabase
      .from('theory_lectures')
      .select('*')
      .eq('id', lectureId)
      .single();

    if (error) {
      throw error;
    }

    if (!lecture) {
      throw new Error(`강의를 찾을 수 없습니다: ${lectureId}`);
    }

    const lectureContent: TheoryLectureContent = {
      metadata: {
        id: lecture.id,
        courseId: lecture.course_id,
        title: lecture.title,
        subtitle: lecture.subtitle,
        description: lecture.description,
        orderIndex: lecture.order_index,
        readTime: lecture.read_time,
        imageUrl: lecture.image_url,
        tags: lecture.tags,
        relatedLectures: lecture.related_lectures,
        createdAt: lecture.created_at,
        updatedAt: lecture.updated_at
      },
      content: lecture.content_markdown,
      htmlContent: lecture.content_html,
      tableOfContents: lecture.table_of_contents || []
    };

    // 캐시 저장
    lectureContentCache.set(lectureId, lectureContent);
    console.log(`[Theory] 강의 콘텐츠 로드 완료: ${lectureId}`);

    return lectureContent;
  } catch (error) {
    console.error(`[Theory] 강의 콘텐츠 로드 실패 (${lectureId}):`, error);
    throw new Error(`"${lectureId}" 강의를 로드할 수 없습니다.`);
  }
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 카테고리별 과목 목록 가져오기
 */
export async function getCoursesByCategory(category: string): Promise<TheoryCourse[]> {
  const { data, error } = await supabase
    .from('theory_courses')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(c => ({
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    description: c.description,
    category: c.category,
    difficulty: c.difficulty,
    tags: c.tags,
    imageUrl: c.image_url,
    featured: c.featured,
    lectureCount: c.lecture_count || 0,
    totalReadTime: c.total_read_time || 0,
    createdAt: c.created_at,
    updatedAt: c.updated_at
  }));
}

/**
 * Featured 과목 가져오기
 */
export async function getFeaturedCourses(): Promise<TheoryCourse[]> {
  const { data, error } = await supabase
    .from('theory_courses')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(c => ({
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    description: c.description,
    category: c.category,
    difficulty: c.difficulty,
    tags: c.tags,
    imageUrl: c.image_url,
    featured: c.featured,
    lectureCount: c.lecture_count || 0,
    totalReadTime: c.total_read_time || 0,
    createdAt: c.created_at,
    updatedAt: c.updated_at
  }));
}

/**
 * 과목 검색
 */
export async function searchCourses(query: string): Promise<TheoryCourse[]> {
  const { data, error } = await supabase
    .from('theory_courses')
    .select('*')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(c => ({
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    description: c.description,
    category: c.category,
    difficulty: c.difficulty,
    tags: c.tags,
    imageUrl: c.image_url,
    featured: c.featured,
    lectureCount: c.lecture_count || 0,
    totalReadTime: c.total_read_time || 0,
    createdAt: c.created_at,
    updatedAt: c.updated_at
  }));
}

/**
 * 캐시 초기화
 */
export function clearTheoryCache(): void {
  courseIndexCache = null;
  lectureIndexCache.clear();
  lectureContentCache.clear();
  console.log('[Theory] 캐시 초기화됨');
}

// ============================================
// 하위 호환성: 기존 함수 (deprecated)
// ============================================

/**
 * @deprecated v2.0부터 loadCourseIndex() 사용
 */
export async function loadTheoryIndex(): Promise<TheoryIndex> {
  console.warn('[Theory] loadTheoryIndex()는 deprecated입니다. loadCourseIndex()를 사용하세요.');
  const courseIndex = await loadCourseIndex();

  // 과목을 이론처럼 변환 (하위 호환성)
  const theories: TheoryMetadata[] = courseIndex.courses.map(c => ({
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    category: c.category,
    tags: c.tags,
    description: c.description,
    difficulty: c.difficulty,
    readTime: c.totalReadTime,
    imageUrl: c.imageUrl,
    featured: c.featured,
    updatedAt: c.updatedAt
  }));

  return {
    theories,
    categories: courseIndex.categories
  };
}

/**
 * @deprecated v2.0부터 loadLectureContent() 사용
 */
export async function loadTheoryContent(id: string): Promise<TheoryContent> {
  console.warn('[Theory] loadTheoryContent()는 deprecated입니다. loadLectureContent()를 사용하세요.');
  const lectureContent = await loadLectureContent(id);

  // 강의를 이론처럼 변환 (하위 호환성)
  return {
    metadata: {
      id: lectureContent.metadata.id,
      title: lectureContent.metadata.title,
      subtitle: lectureContent.metadata.subtitle,
      category: 'basics', // 기본값
      tags: lectureContent.metadata.tags || [],
      description: lectureContent.metadata.description || '',
      difficulty: 'beginner', // 기본값
      readTime: lectureContent.metadata.readTime,
      imageUrl: lectureContent.metadata.imageUrl,
      updatedAt: lectureContent.metadata.updatedAt
    },
    content: lectureContent.content,
    htmlContent: lectureContent.htmlContent,
    tableOfContents: lectureContent.tableOfContents
  };
}
