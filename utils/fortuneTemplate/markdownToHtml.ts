/**
 * 간단한 마크다운 → HTML 변환 함수
 * 운세 텍스트의 기본적인 마크다운을 HTML로 변환
 */

/**
 * 마크다운을 HTML로 변환
 *
 * 지원하는 문법:
 * - **텍스트** → <strong>텍스트</strong>
 * - [텍스트] → <strong>텍스트</strong>
 * - \n → <br />
 *
 * @param markdown - 마크다운 텍스트
 * @returns HTML 문자열
 */
export function convertMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;

  // **텍스트** → <strong>텍스트</strong>
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // [텍스트] → <strong>텍스트</strong> (운세 제목 등)
  html = html.replace(/\[(.+?)\]/g, '<strong>$1</strong>');

  // \n → <br />
  html = html.replace(/\n/g, '<br />');

  return html;
}

/**
 * 운세 텍스트를 HTML로 변환 (별칭)
 */
export function formatFortuneText(text: string): string {
  return convertMarkdownToHtml(text);
}
