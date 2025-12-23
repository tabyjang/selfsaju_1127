// 이론 자료 타입 정의

export type TheoryCategory = 'classic' | 'basics' | 'advanced' | 'practical';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * 이론 메타데이터
 */
export interface TheoryMetadata {
  id: string;
  title: string;
  subtitle?: string;
  category: TheoryCategory;
  tags: string[];
  description: string;
  difficulty: DifficultyLevel;
  readTime: number; // 예상 읽기 시간 (분)
  imageUrl?: string;
  updatedAt?: string;
  featured?: boolean;
  relatedTheories?: string[]; // 관련 이론 ID 목록
}

/**
 * 이론 콘텐츠 (메타데이터 + 본문)
 */
export interface TheoryContent {
  metadata: TheoryMetadata;
  content: string; // 원본 마크다운
  htmlContent: string; // 파싱된 HTML
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
