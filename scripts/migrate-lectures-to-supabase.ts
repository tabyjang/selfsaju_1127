// 강의 데이터 마이그레이션 스크립트 v2.0
// 과목(courses)과 강의(lectures)를 Supabase에 업로드

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { parseMarkdown } from '../utils/theory/markdownParser';
import { generateTableOfContents } from '../utils/theory/tocGenerator';

config(); // .env 파일 로드

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// 샘플 강의 데이터 (마크다운)
// ============================================

const sampleLectures = {
  yeonghaejapyeong: [
    {
      id: 'yeonghaejapyeong-01',
      title: '음양의 이해',
      subtitle: '우주 만물의 근본 원리',
      description: '음양의 개념과 명리학에서의 적용',
      orderIndex: 1,
      readTime: 15,
      tags: ['음양', '기초', '철학'],
      content: `# 음양의 이해

## 음양이란?

**음양(陰陽)**은 우주 만물을 구성하는 가장 기본적인 두 가지 원리입니다.

- **양(陽)**: 밝음, 활동성, 강함, 남성성
- **음(陰)**: 어두움, 수동성, 부드러움, 여성성

## 명리학에서의 음양

사주명리학에서 음양은 천간과 지지의 속성을 결정합니다.

### 천간의 음양

| 양간 | 음간 |
|------|------|
| 甲 (갑목) | 乙 (을목) |
| 丙 (병화) | 丁 (정화) |
| 戊 (무토) | 己 (기토) |
| 庚 (경금) | 辛 (신금) |
| 壬 (임수) | 癸 (계수) |

## 실전 적용

음양의 조화를 통해 사주의 균형을 파악할 수 있습니다.`
    },
    {
      id: 'yeonghaejapyeong-02',
      title: '오행의 상생상극',
      subtitle: '오행 순환의 원리',
      description: '목화토금수의 상생과 상극 관계',
      orderIndex: 2,
      readTime: 20,
      tags: ['오행', '상생상극', '기초'],
      content: `# 오행의 상생상극

## 오행이란?

**오행(五行)**은 목(木), 화(火), 토(土), 금(金), 수(水)를 말합니다.

## 상생(相生) - 서로 돕는 관계

- 木生火: 나무가 불을 생함
- 火生土: 불이 타고 남은 재가 흙이 됨
- 土生金: 땅에서 쇠가 나옴
- 金生水: 쇠에 물이 맺힘
- 水生木: 물이 나무를 키움

## 상극(相剋) - 서로 극하는 관계

- 木剋土: 나무가 흙을 뚫고 자람
- 土剋水: 흙이 물을 막음
- 水剋火: 물이 불을 끔
- 火剋金: 불이 쇠를 녹임
- 金剋木: 쇠가 나무를 베어냄

## 실전 활용

상생상극의 관계를 통해 사주의 강약과 운의 흐름을 파악합니다.`
    },
    {
      id: 'yeonghaejapyeong-03',
      title: '천간의 특성',
      subtitle: '십간의 성질과 의미',
      description: '갑목부터 계수까지 각 천간의 특징',
      orderIndex: 3,
      readTime: 25,
      tags: ['천간', '십간', '심화'],
      content: `# 천간의 특성

## 천간(天干)이란?

천간은 하늘의 기운을 나타내는 10개의 글자입니다.

## 갑목(甲木) - 큰 나무

- **양목(陽木)**
- 떡갈나무, 소나무 같은 큰 나무
- 특성: 곧고 강직하며 높이 자람
- 성격: 정직, 고집, 주관이 뚜렷함

## 을목(乙木) - 작은 나무

- **음목(陰木)**
- 덩굴, 풀, 관목
- 특성: 유연하고 적응력이 강함
- 성격: 섬세, 융통성, 사교적

## 병화(丙火) - 태양

- **양화(陽火)**
- 큰 불, 태양
- 특성: 밝고 활발하며 모든 것을 비춤
- 성격: 외향적, 적극적, 낙천적

## 정화(丁火) - 촛불

- **음화(陰火)**
- 작은 불, 촛불, 등잔불
- 특성: 온화하나 집요함
- 성격: 세심, 감성적, 예술적

*나머지 천간에 대한 설명 계속...*`
    }
  ],
  'ohaeng-theory': [
    {
      id: 'ohaeng-01',
      title: '오행의 기초',
      subtitle: '목화토금수의 본질',
      description: '오행의 기본 개념과 특징',
      orderIndex: 1,
      readTime: 15,
      tags: ['오행', '기초', '개념'],
      content: `# 오행의 기초

## 오행이란?

오행(五行)은 우주 만물을 구성하는 다섯 가지 기본 요소입니다.

### 목(木) - 나무

- 계절: 봄
- 방향: 동쪽
- 색: 청색, 녹색
- 성질: 생장, 발전

### 화(火) - 불

- 계절: 여름
- 방향: 남쪽
- 색: 적색
- 성질: 상승, 발산

### 토(土) - 흙

- 계절: 환절기(4계절 끝)
- 방향: 중앙
- 색: 황색
- 성질: 변화, 중재

### 금(金) - 쇠

- 계절: 가을
- 방향: 서쪽
- 색: 백색
- 성질: 수렴, 정리

### 수(水) - 물

- 계절: 겨울
- 방향: 북쪽
- 색: 흑색
- 성질: 하강, 저장

## 오행과 사주

사주의 천간과 지지는 모두 오행으로 분류됩니다.`
    }
  ],
  'sibsin-guide': [
    {
      id: 'sibsin-01',
      title: '십신이란?',
      subtitle: '나와 타인의 관계',
      description: '십신의 정의와 분류',
      orderIndex: 1,
      readTime: 15,
      tags: ['십신', '기초', '관계'],
      content: `# 십신이란?

## 십신(十神)의 정의

십신은 일간(나)을 기준으로 다른 오행과의 관계를 나타낸 10가지 신살입니다.

## 십신의 분류

### 비견(比肩) - 형제자매

- 나와 같은 오행, 같은 음양
- 의미: 형제, 동료, 경쟁자
- 성향: 독립심, 자주성

### 겁재(劫財) - 재물을 빼앗는 자

- 나와 같은 오행, 다른 음양
- 의미: 재물 손실, 경쟁
- 성향: 의리, 협력

### 식신(食神) - 내가 생하는 것

- 내가 생하는 오행, 같은 음양
- 의미: 표현, 재능, 여유
- 성향: 낙천적, 즐김

### 상관(傷官) - 관을 상하게 하는 것

- 내가 생하는 오행, 다른 음양
- 의미: 비판, 재능, 반항
- 성향: 예민, 예술적

*나머지 십신 설명 계속...*`
    }
  ]
};

// ============================================
// 메인 마이그레이션 함수
// ============================================

async function migrateLectures() {
  console.log('📚 강의 데이터 마이그레이션 시작...\n');

  try {
    // 각 과목별로 강의 마이그레이션
    for (const [courseId, lectures] of Object.entries(sampleLectures)) {
      console.log(`\n📖 [${courseId}] 과목의 강의 마이그레이션 중...`);

      for (const lecture of lectures) {
        console.log(`   - ${lecture.orderIndex}강: ${lecture.title}`);

        // 마크다운 파싱
        const htmlContent = parseMarkdown(lecture.content);
        const tableOfContents = generateTableOfContents(lecture.content);

        // Supabase에 업로드 (upsert)
        const { error } = await supabase
          .from('theory_lectures')
          .upsert({
            id: lecture.id,
            course_id: courseId,
            title: lecture.title,
            subtitle: lecture.subtitle,
            description: lecture.description,
            order_index: lecture.orderIndex,
            read_time: lecture.readTime,
            tags: lecture.tags,
            content_markdown: lecture.content,
            content_html: htmlContent,
            table_of_contents: tableOfContents,
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error(`   ❌ 실패:`, error.message);
        } else {
          console.log(`   ✅ 성공`);
        }
      }
    }

    // 과목별 강의 개수 및 총 시간 업데이트
    console.log('\n📊 과목 통계 업데이트 중...');

    for (const courseId of Object.keys(sampleLectures)) {
      const { data: lectures, error: fetchError } = await supabase
        .from('theory_lectures')
        .select('read_time')
        .eq('course_id', courseId);

      if (fetchError) {
        console.error(`   ❌ ${courseId} 통계 조회 실패:`, fetchError.message);
        continue;
      }

      const lectureCount = lectures.length;
      const totalReadTime = lectures.reduce((sum, l) => sum + (l.read_time || 0), 0);

      const { error: updateError } = await supabase
        .from('theory_courses')
        .update({
          lecture_count: lectureCount,
          total_read_time: totalReadTime
        })
        .eq('id', courseId);

      if (updateError) {
        console.error(`   ❌ ${courseId} 통계 업데이트 실패:`, updateError.message);
      } else {
        console.log(`   ✅ ${courseId}: ${lectureCount}개 강의, 총 ${totalReadTime}분`);
      }
    }

    console.log('\n✨ 마이그레이션 완료!');
  } catch (error) {
    console.error('\n❌ 마이그레이션 실패:', error);
    process.exit(1);
  }
}

// 실행
migrateLectures();
