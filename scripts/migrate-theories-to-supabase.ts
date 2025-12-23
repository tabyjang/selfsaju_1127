// 이론 데이터를 Supabase DB로 마이그레이션하는 스크립트

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// .env 파일 로드
config();

// Supabase 클라이언트 설정
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Supabase URL:', supabaseUrl ? '✅ 설정됨' : '❌ 없음');
console.log('Supabase Key:', supabaseKey ? '✅ 설정됨' : '❌ 없음');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 마크다운 파싱 함수들 (기존 코드 재사용)
function parseFrontMatter(markdown: string): {
  metadata: any;
  content: string;
} {
  // Windows 줄바꿈 처리
  const normalized = markdown.replace(/\r\n/g, '\n');
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = normalized.match(frontMatterRegex);

  if (!match) {
    console.error('마크다운 첫 100자:', normalized.substring(0, 100));
    throw new Error('프론트매터를 찾을 수 없습니다.');
  }

  const [, frontMatter, content] = match;
  const metadata: any = {};
  const lines = frontMatter.split('\n');

  lines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;

    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();

    if (value.startsWith('[') && value.endsWith(']')) {
      metadata[key] = value
        .slice(1, -1)
        .split(',')
        .map(item => item.trim());
    } else if (!isNaN(Number(value))) {
      metadata[key] = Number(value);
    } else if (value === 'true' || value === 'false') {
      metadata[key] = value === 'true';
    } else {
      metadata[key] = value;
    }
  });

  return { metadata, content: content.trim() };
}

function parseMarkdown(markdown: string): string {
  let html = markdown;

  // 제목
  html = html.replace(/^######\s+(.+)$/gm, (match, title) => {
    const id = generateAnchorId(title);
    return `<h6 id="${id}">${title}</h6>`;
  });
  html = html.replace(/^#####\s+(.+)$/gm, (match, title) => {
    const id = generateAnchorId(title);
    return `<h5 id="${id}">${title}</h5>`;
  });
  html = html.replace(/^####\s+(.+)$/gm, (match, title) => {
    const id = generateAnchorId(title);
    return `<h4 id="${id}">${title}</h4>`;
  });
  html = html.replace(/^###\s+(.+)$/gm, (match, title) => {
    const id = generateAnchorId(title);
    return `<h3 id="${id}">${title}</h3>`;
  });
  html = html.replace(/^##\s+(.+)$/gm, (match, title) => {
    const id = generateAnchorId(title);
    return `<h2 id="${id}">${title}</h2>`;
  });
  html = html.replace(/^#\s+(.+)$/gm, (match, title) => {
    const id = generateAnchorId(title);
    return `<h1 id="${id}">${title}</h1>`;
  });

  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" loading="lazy" class="theory-image" />'
  );
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="theory-link">$1</a>'
  );
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  html = html.replace(/^---$/gm, '<hr />');

  return html;
}

function generateAnchorId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function generateTableOfContents(markdown: string): any[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const toc: any[] = [];

  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const id = generateAnchorId(title);

    toc.push({ id, level, title });
  }

  return toc;
}

async function migrateTheories() {
  console.log('🚀 이론 데이터 마이그레이션 시작...\n');

  const contentDir = path.join(process.cwd(), 'public', 'theories', 'content');
  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));

  console.log(`📂 발견된 마크다운 파일: ${files.length}개\n`);

  for (const file of files) {
    const filePath = path.join(contentDir, file);
    const markdown = fs.readFileSync(filePath, 'utf-8');

    try {
      const { metadata, content } = parseFrontMatter(markdown);
      const contentHtml = parseMarkdown(content);
      const tableOfContents = generateTableOfContents(content);

      // description 자동 생성 (없으면 본문 첫 200자)
      const description = metadata.description ||
        content.replace(/^#+\s+.+$/gm, '') // 제목 제거
               .replace(/\*\*/g, '') // 볼드 제거
               .replace(/\*/g, '') // 기울임 제거
               .trim()
               .substring(0, 200) + '...';

      // Supabase에 삽입할 데이터 준비
      const theoryData = {
        id: metadata.id,
        title: metadata.title,
        subtitle: metadata.subtitle || null,
        category: metadata.category,
        tags: metadata.tags,
        description: description,
        difficulty: metadata.difficulty,
        read_time: metadata.readTime,
        image_url: metadata.imageUrl || null,
        featured: metadata.featured || false,
        content_markdown: content,
        content_html: contentHtml,
        table_of_contents: tableOfContents,
        related_theories: metadata.relatedTheories || []
      };

      // Supabase에 삽입 (upsert - 있으면 업데이트, 없으면 삽입)
      const { data, error } = await supabase
        .from('theories')
        .upsert(theoryData, { onConflict: 'id' });

      if (error) {
        console.error(`❌ ${metadata.id} 삽입 실패:`, error);
      } else {
        console.log(`✅ ${metadata.id} 삽입 성공`);
      }
    } catch (err) {
      console.error(`❌ ${file} 처리 중 오류:`, err);
    }
  }

  console.log('\n🎉 마이그레이션 완료!');
}

// 실행
migrateTheories().catch(console.error);
