-- ====================================
-- 이론 자료 시스템 v2.0 스키마
-- 3단계 구조: 과목 > 강의 목록 > 강의 상세
-- ====================================

-- 1. 기존 theories 테이블 백업 (선택사항)
-- CREATE TABLE theories_backup AS SELECT * FROM theories;

-- 2. 기존 theories 테이블 삭제 또는 이름 변경
-- DROP TABLE IF EXISTS theories CASCADE;
-- 또는
-- ALTER TABLE theories RENAME TO theories_old;

-- ====================================
-- theory_courses 테이블 (과목)
-- ====================================
CREATE TABLE theory_courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('classic', 'basics', 'advanced', 'practical')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  tags TEXT[] NOT NULL,
  image_url TEXT,
  featured BOOLEAN DEFAULT false,
  lecture_count INTEGER DEFAULT 0, -- 이 과목에 속한 강의 개수
  total_read_time INTEGER DEFAULT 0, -- 전체 강의 예상 소요 시간 (분)

  -- 메타데이터
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_courses_category ON theory_courses(category);
CREATE INDEX idx_courses_difficulty ON theory_courses(difficulty);
CREATE INDEX idx_courses_featured ON theory_courses(featured);
CREATE INDEX idx_courses_tags ON theory_courses USING GIN(tags);

-- ====================================
-- theory_lectures 테이블 (강의)
-- ====================================
CREATE TABLE theory_lectures (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES theory_courses(id) ON DELETE CASCADE,

  -- 강의 기본 정보
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  order_index INTEGER NOT NULL, -- 강의 순서 (1, 2, 3, ...)
  read_time INTEGER NOT NULL, -- 예상 소요 시간 (분)

  -- 콘텐츠
  content_markdown TEXT NOT NULL,
  content_html TEXT NOT NULL,
  table_of_contents JSONB, -- 강의 내 목차 (H2, H3 등)

  -- 메타데이터
  image_url TEXT,
  tags TEXT[],
  related_lectures TEXT[], -- 관련 강의 ID 목록

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- 제약조건: 같은 과목 내에서 order_index 중복 불가
  UNIQUE(course_id, order_index)
);

-- 인덱스
CREATE INDEX idx_lectures_course_id ON theory_lectures(course_id);
CREATE INDEX idx_lectures_order ON theory_lectures(course_id, order_index);
CREATE INDEX idx_lectures_tags ON theory_lectures USING GIN(tags);

-- ====================================
-- RLS (Row Level Security) 정책
-- ====================================

-- 과목 테이블
ALTER TABLE theory_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "과목 데이터는 누구나 읽을 수 있음"
  ON theory_courses
  FOR SELECT
  USING (true);

CREATE POLICY "임시: 과목 누구나 삽입 가능"
  ON theory_courses
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "임시: 과목 누구나 수정 가능"
  ON theory_courses
  FOR UPDATE
  USING (true);

-- 강의 테이블
ALTER TABLE theory_lectures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "강의 데이터는 누구나 읽을 수 있음"
  ON theory_lectures
  FOR SELECT
  USING (true);

CREATE POLICY "임시: 강의 누구나 삽입 가능"
  ON theory_lectures
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "임시: 강의 누구나 수정 가능"
  ON theory_lectures
  FOR UPDATE
  USING (true);

-- ====================================
-- 샘플 데이터 (테스트용)
-- ====================================

-- 과목 1: 연해자평
INSERT INTO theory_courses (id, title, subtitle, description, category, difficulty, tags, featured, lecture_count, total_read_time)
VALUES (
  'yeonghaejapyeong',
  '연해자평',
  '명리학의 기초를 다지는 고전',
  '명리학의 기초 이론을 체계적으로 다룬 고전 텍스트입니다. 음양오행, 십간십이지, 격국론 등 명리학의 핵심 개념을 학습합니다.',
  'classic',
  'intermediate',
  ARRAY['고전', '기초이론', '격국', '음양오행'],
  true,
  0, -- 나중에 강의 추가 시 업데이트
  0
);

-- 과목 2: 오행 이론
INSERT INTO theory_courses (id, title, subtitle, description, category, difficulty, tags, featured, lecture_count, total_read_time)
VALUES (
  'ohaeng-theory',
  '오행 이론',
  '우주 만물의 근본 원리',
  '목화토금수 오행의 상생상극 원리와 실전 활용법을 학습합니다. 명리학의 가장 기초가 되는 이론입니다.',
  'basics',
  'beginner',
  ARRAY['오행', '상생상극', '기초'],
  true,
  0,
  0
);

-- 과목 3: 십신 활용법
INSERT INTO theory_courses (id, title, subtitle, description, category, difficulty, tags, featured, lecture_count, total_read_time)
VALUES (
  'sibsin-guide',
  '십신 활용법',
  '십신을 통한 사주 해석',
  '비견, 겁재, 식신, 상관, 편재, 정재, 편관, 정관, 편인, 정인 십신의 특성과 실전 해석 방법을 배웁니다.',
  'practical',
  'intermediate',
  ARRAY['십신', '해석', '실전'],
  false,
  0,
  0
);

-- ====================================
-- 유용한 쿼리 예시
-- ====================================

-- 1. 과목별 강의 개수 업데이트
-- UPDATE theory_courses
-- SET lecture_count = (
--   SELECT COUNT(*) FROM theory_lectures WHERE course_id = theory_courses.id
-- );

-- 2. 과목별 전체 소요 시간 업데이트
-- UPDATE theory_courses
-- SET total_read_time = (
--   SELECT COALESCE(SUM(read_time), 0) FROM theory_lectures WHERE course_id = theory_courses.id
-- );

-- 3. 특정 과목의 강의 목록 조회 (순서대로)
-- SELECT * FROM theory_lectures
-- WHERE course_id = 'yeonghaejapyeong'
-- ORDER BY order_index ASC;

-- 4. 과목 + 강의 개수 조인 조회
-- SELECT
--   c.*,
--   COUNT(l.id) as actual_lecture_count
-- FROM theory_courses c
-- LEFT JOIN theory_lectures l ON c.id = l.course_id
-- GROUP BY c.id;
