// 마크다운 파서 (프론트매터 + 본문 변환)

import { TheoryMetadata } from './types';

/**
 * 프론트매터(YAML) 파싱
 * @param markdown - 프론트매터가 포함된 전체 마크다운 텍스트
 * @returns {metadata, content} - 메타데이터와 본문 분리
 */
export function parseFrontMatter(markdown: string): {
  metadata: TheoryMetadata;
  content: string;
} {
  // Windows(\r\n)와 Unix(\n) 줄바꿈 모두 지원
  const normalizedMarkdown = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = normalizedMarkdown.match(frontMatterRegex);

  if (!match) {
    throw new Error('프론트매터를 찾을 수 없습니다.');
  }

  const [, frontMatter, content] = match;

  // YAML 파싱 (간단한 key: value 형식)
  const metadata: any = {};
  const lines = frontMatter.split('\n');

  lines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;

    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();

    // 배열 파싱 [item1, item2]
    if (value.startsWith('[') && value.endsWith(']')) {
      metadata[key] = value
        .slice(1, -1)
        .split(',')
        .map(item => item.trim());
    }
    // 숫자 파싱
    else if (!isNaN(Number(value))) {
      metadata[key] = Number(value);
    }
    // 불린 파싱
    else if (value === 'true' || value === 'false') {
      metadata[key] = value === 'true';
    }
    // 문자열
    else {
      metadata[key] = value;
    }
  });

  return {
    metadata: metadata as TheoryMetadata,
    content: content.trim()
  };
}

/**
 * 제목 텍스트를 앵커 ID로 변환
 * @param title - 제목 텍스트
 * @returns 앵커에 사용할 ID (소문자, 공백→하이픈)
 */
export function generateAnchorId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w가-힣\s-]/g, '') // 특수문자 제거
    .replace(/\s+/g, '-') // 공백을 하이픈으로
    .replace(/-+/g, '-') // 연속 하이픈 하나로
    .trim();
}

/**
 * 마크다운을 HTML로 변환
 * @param markdown - 마크다운 텍스트
 * @returns HTML 문자열
 */
export function parseMarkdown(markdown: string): string {
  let html = markdown;

  // 1. 제목 (h1~h6) - 앵커 ID 포함
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

  // 2. 이미지 (링크보다 먼저 처리)
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" loading="lazy" class="theory-image" />'
  );

  // 3. 링크
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="theory-link">$1</a>'
  );

  // 4. 볼드 (**text**)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // 5. 기울임 (*text*)
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // 6. 코드 블록 (```language\ncode\n```)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang || 'text'}">${escapeHtml(
      code.trim()
    )}</code></pre>`;
  });

  // 7. 인라인 코드 (`code`)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 8. 순서 없는 리스트 (- item)
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // 9. 순서 있는 리스트 (1. item)
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, match => {
    if (match.includes('<ul>')) return match; // 이미 ul로 감싸진 경우
    return `<ol>${match}</ol>`;
  });

  // 10. 수평선 (---)
  html = html.replace(/^---$/gm, '<hr />');

  // 11. 블록쿼트 (> text)
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // 12. 표 (table)
  html = parseTable(html);

  // 13. 단락 (연속된 텍스트를 <p>로 감싸기)
  html = html
    .split('\n\n')
    .map(block => {
      // 이미 태그로 감싸진 경우 제외
      if (
        block.startsWith('<h') ||
        block.startsWith('<ul>') ||
        block.startsWith('<ol>') ||
        block.startsWith('<pre>') ||
        block.startsWith('<blockquote>') ||
        block.startsWith('<hr')
      ) {
        return block;
      }
      return `<p>${block}</p>`;
    })
    .join('\n');

  return html;
}

/**
 * 마크다운 표를 HTML table로 변환
 */
function parseTable(html: string): string {
  const lines = html.split('\n');
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 표 시작 감지 (| col1 | col2 | 형식)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines: string[] = [];
      tableLines.push(line);

      // 다음 줄이 구분선인지 확인 (|-----|-----|)
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        if (nextLine.includes('---')) {
          tableLines.push(nextLine);
          i += 2;

          // 나머지 표 본문 수집
          while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
            tableLines.push(lines[i]);
            i++;
          }

          // 표를 HTML로 변환
          result.push(convertTableToHtml(tableLines));
          continue;
        }
      }
    }

    result.push(line);
    i++;
  }

  return result.join('\n');
}

/**
 * 마크다운 표 라인들을 HTML table로 변환
 */
function convertTableToHtml(lines: string[]): string {
  if (lines.length < 2) return lines.join('\n');

  // 헤더 행
  const headerLine = lines[0];
  const headers = headerLine
    .split('|')
    .map(cell => cell.trim())
    .filter(cell => cell);

  // 본문 행들
  const bodyLines = lines.slice(2); // 0: 헤더, 1: 구분선, 2~: 본문

  let html = '<table class="theory-table">\n';

  // thead
  html += '  <thead>\n    <tr>\n';
  headers.forEach(header => {
    html += `      <th>${header}</th>\n`;
  });
  html += '    </tr>\n  </thead>\n';

  // tbody
  html += '  <tbody>\n';
  bodyLines.forEach(line => {
    const cells = line
      .split('|')
      .map(cell => cell.trim())
      .filter(cell => cell);

    html += '    <tr>\n';
    cells.forEach(cell => {
      html += `      <td>${cell}</td>\n`;
    });
    html += '    </tr>\n';
  });
  html += '  </tbody>\n';

  html += '</table>';

  return html;
}

/**
 * HTML 특수문자 이스케이프 (코드 블록용)
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
