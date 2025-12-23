// 강의 추가 스크립트
// 마크다운 파일을 읽어서 Supabase에 업로드

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
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
// 프론트매터 파싱
// ============================================

interface FrontMatter {
  courseId: string;
  title: string;
  subtitle?: string;
  description?: string;
  orderIndex: number;
  readTime: number;
  tags?: string[];
  relatedLectures?: string[];
}

function parseFrontMatter(markdown: string): { metadata: FrontMatter; content: string } {
  const normalized = markdown.replace(/\r\n/g, '\n');
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = normalized.match(frontMatterRegex);

  if (!match) {
    throw new Error('프론트매터를 찾을 수 없습니다. 파일 맨 위에 ---로 시작하고 끝나는 프론트매터가 있는지 확인하세요.');
  }

  const frontMatterText = match[1];
  const content = match[2];

  // 간단한 YAML 파싱 (key: value 형식)
  const metadata: any = {};
  const lines = frontMatterText.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    let value: any = line.substring(colonIndex + 1).trim();

    // 배열 파싱 [item1, item2]
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .substring(1, value.length - 1)
        .split(',')
        .map(v => v.trim())
        .filter(v => v);
    }
    // 숫자 파싱
    else if (!isNaN(Number(value))) {
      value = Number(value);
    }
    // 불린 파싱
    else if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    }

    metadata[key] = value;
  }

  // 필수 항목 체크
  const required = ['courseId', 'title', 'orderIndex', 'readTime'];
  for (const field of required) {
    if (metadata[field] === undefined) {
      throw new Error(`필수 항목이 누락되었습니다: ${field}`);
    }
  }

  return { metadata: metadata as FrontMatter, content };
}

// ============================================
// 강의 ID 자동 생성
// ============================================

function generateLectureId(courseId: string, orderIndex: number): string {
  return `${courseId}-${String(orderIndex).padStart(2, '0')}`;
}

// ============================================
// 과목 존재 여부 확인
// ============================================

async function verifyCourseExists(courseId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('theory_courses')
    .select('id')
    .eq('id', courseId)
    .single();

  if (error || !data) {
    // 사용 가능한 과목 목록 조회
    const { data: courses } = await supabase
      .from('theory_courses')
      .select('id, title');

    const availableCourses = courses?.map(c => `${c.id} (${c.title})`).join(', ') || '없음';
    throw new Error(
      `'${courseId}' 과목을 찾을 수 없습니다.\n사용 가능한 과목: ${availableCourses}`
    );
  }

  return true;
}

// ============================================
// 강의 업로드
// ============================================

async function uploadLecture(filePath: string) {
  console.log(`\n📄 파일 읽는 중: ${filePath}`);

  // 파일 읽기
  const markdown = readFileSync(filePath, 'utf-8');

  // 프론트매터 파싱
  const { metadata, content } = parseFrontMatter(markdown);

  console.log(`   제목: ${metadata.title}`);
  console.log(`   과목: ${metadata.courseId}`);
  console.log(`   순서: ${metadata.orderIndex}강`);

  // 과목 존재 여부 확인
  await verifyCourseExists(metadata.courseId);

  // 강의 ID 생성
  const lectureId = generateLectureId(metadata.courseId, metadata.orderIndex);
  console.log(`   강의 ID: ${lectureId}`);

  // 마크다운 파싱
  const htmlContent = parseMarkdown(content);
  const tableOfContents = generateTableOfContents(content);

  // Supabase에 업로드 (upsert)
  const { error } = await supabase
    .from('theory_lectures')
    .upsert({
      id: lectureId,
      course_id: metadata.courseId,
      title: metadata.title,
      subtitle: metadata.subtitle,
      description: metadata.description,
      order_index: metadata.orderIndex,
      read_time: metadata.readTime,
      tags: metadata.tags || [],
      related_lectures: metadata.relatedLectures || [],
      content_markdown: content,
      content_html: htmlContent,
      table_of_contents: tableOfContents,
      updated_at: new Date().toISOString()
    });

  if (error) {
    throw error;
  }

  console.log(`   ✅ 업로드 성공!`);

  return { courseId: metadata.courseId, lectureId };
}

// ============================================
// 과목 통계 업데이트
// ============================================

async function updateCourseStats(courseId: string) {
  console.log(`\n📊 "${courseId}" 과목 통계 업데이트 중...`);

  // 강의 개수 및 총 시간 계산
  const { data: lectures, error } = await supabase
    .from('theory_lectures')
    .select('read_time')
    .eq('course_id', courseId);

  if (error) {
    throw error;
  }

  const lectureCount = lectures.length;
  const totalReadTime = lectures.reduce((sum, l) => sum + (l.read_time || 0), 0);

  // 과목 정보 업데이트
  const { error: updateError } = await supabase
    .from('theory_courses')
    .update({
      lecture_count: lectureCount,
      total_read_time: totalReadTime
    })
    .eq('id', courseId);

  if (updateError) {
    throw updateError;
  }

  console.log(`   ✅ ${lectureCount}개 강의, 총 ${totalReadTime}분`);
}

// ============================================
// 메인 함수
// ============================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
사용법:
  npx tsx scripts/add-lecture.ts <파일경로>
  npx tsx scripts/add-lecture.ts <폴더경로>

예시:
  npx tsx scripts/add-lecture.ts public/lectures/yeonghaejapyeong-04.md
  npx tsx scripts/add-lecture.ts public/lectures/
`);
    process.exit(1);
  }

  const target = args[0];

  console.log('🚀 강의 업로드 시작...\n');

  try {
    const stat = statSync(target);
    const updatedCourses = new Set<string>();

    if (stat.isDirectory()) {
      // 폴더 내 모든 .md 파일 처리
      const files = readdirSync(target)
        .filter(f => extname(f) === '.md')
        .map(f => join(target, f));

      if (files.length === 0) {
        console.log('❌ 폴더에 마크다운 파일(.md)이 없습니다.');
        process.exit(1);
      }

      console.log(`📂 ${files.length}개 파일 발견\n`);

      for (const file of files) {
        try {
          const { courseId } = await uploadLecture(file);
          updatedCourses.add(courseId);
        } catch (error: any) {
          console.error(`   ❌ 실패: ${error.message}`);
        }
      }
    } else {
      // 단일 파일 처리
      const { courseId } = await uploadLecture(target);
      updatedCourses.add(courseId);
    }

    // 업데이트된 과목들의 통계 갱신
    for (const courseId of updatedCourses) {
      await updateCourseStats(courseId);
    }

    console.log('\n✨ 모든 작업 완료!');
  } catch (error: any) {
    console.error(`\n❌ 오류 발생: ${error.message}`);
    process.exit(1);
  }
}

main();
