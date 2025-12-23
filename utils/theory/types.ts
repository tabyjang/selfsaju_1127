// 이론 자료 타입 정의 v2.0
// 3단계 구조: 과목 > 강의 목록 > 강의 상세

export type TheoryCategory = 'classic' | 'basics' | 'advanced' | 'practical';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// ============================================
// 과목 (Course) 관련 타입
// ============================================

/**
 * 과목 정보 (연해자평, 오행이론 등)
 */
export interface TheoryCourse {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  category: TheoryCategory;
  difficulty: DifficultyLevel;
  tags: string[];
  imageUrl?: string;
  featured?: boolean;
  lectureCount: number; // 이 과목에 속한 강의 개수
  totalReadTime: number; // 전체 강의 예상 소요 시간 (분)
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 과목 목록 (대시보드용)
 */
export interface CourseIndex {
  courses: TheoryCourse[];
  categories: CategoryInfo[];
}

// ============================================
// 강의 (Lecture) 관련 타입
// ============================================

/**
 * 강의 메타데이터 (목록용)
 */
export interface TheoryLectureMetadata {
  id: string;
  courseId: string; // 소속 과목 ID
  title: string;
  subtitle?: string;
  description?: string;
  orderIndex: number; // 강의 순서 (1, 2, 3, ...)
  readTime: number; // 예상 소요 시간 (분)
  imageUrl?: string;
  tags?: string[];
  relatedLectures?: string[]; // 관련 강의 ID 목록
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 강의 상세 콘텐츠 (상세 페이지용)
 */
export interface TheoryLectureContent {
  metadata: TheoryLectureMetadata;
  content: string; // 원본 마크다운
  htmlContent: string; // 파싱된 HTML
  tableOfContents: TocItem[];
}

/**
 * 특정 과목의 강의 목록
 */
export interface LectureIndex {
  course: TheoryCourse;
  lectures: TheoryLectureMetadata[];
}

// ============================================
// 하위 호환성: 기존 타입 (deprecated)
// ============================================

/**
 * @deprecated v2.0부터 TheoryLectureMetadata 사용
 */
export interface TheoryMetadata {
  id: string;
  title: string;
  subtitle?: string;
  category: TheoryCategory;
  tags: string[];
  description: string;
  difficulty: DifficultyLevel;
  readTime: number;
  imageUrl?: string;
  updatedAt?: string;
  featured?: boolean;
  relatedTheories?: string[];
}

/**
 * @deprecated v2.0부터 TheoryLectureContent 사용
 */
export interface TheoryContent {
  metadata: TheoryMetadata;
  content: string;
  htmlContent: string;
  tableOfContents: TocItem[];
}

/**
 * 목차 아이템
 */
export interface TocItem {
  id: string; // 앵커 ID
  level: number; // 1-6 (h1-h6)
  title: string;
  children?: TocItem[];
}

/**
 * 카테고리 정보
 */
export interface CategoryInfo {
  id: TheoryCategory;
  name: string;
  description: string;
  icon: string;
}

/**
 * 이론 인덱스 (목록 데이터)
 */
export interface TheoryIndex {
  theories: TheoryMetadata[];
  categories: CategoryInfo[];
}

/**
 * 검색 결과
 */
export interface SearchResult {
  theory: TheoryMetadata;
  matchType: 'title' | 'description' | 'content' | 'tag';
  matchScore: number;
  snippet?: string;
}
