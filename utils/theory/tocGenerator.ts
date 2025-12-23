// 목차(Table of Contents) 생성기

import { TocItem } from './types';
import { generateAnchorId } from './markdownParser';

/**
 * 마크다운에서 제목을 추출하여 목차 생성
 * @param markdown - 마크다운 텍스트
 * @returns 계층 구조를 가진 목차 배열
 */
export function generateTableOfContents(markdown: string): TocItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const flatToc: Array<{ level: number; title: string; id: string }> = [];

  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length; // # 개수 = 레벨
    const title = match[2].trim();
    const id = generateAnchorId(title);

    flatToc.push({ level, title, id });
  }

  // 평면 배열을 계층 구조로 변환
  return buildHierarchy(flatToc);
}

/**
 * 평면 목차 배열을 계층 구조로 변환
 * @param flatToc - 레벨과 제목 정보를 가진 평면 배열
 * @returns 중첩된 TocItem 배열
 */
function buildHierarchy(
  flatToc: Array<{ level: number; title: string; id: string }>
): TocItem[] {
  const root: TocItem[] = [];
  const stack: Array<{ item: TocItem; level: number }> = [];

  flatToc.forEach(({ level, title, id }) => {
    const newItem: TocItem = { id, level, title };

    // 스택에서 현재 레벨보다 높거나 같은 항목 제거
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    if (stack.length === 0) {
      // 최상위 항목
      root.push(newItem);
    } else {
      // 부모 항목의 자식으로 추가
      const parent = stack[stack.length - 1].item;
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(newItem);
    }

    // 스택에 현재 항목 추가
    stack.push({ item: newItem, level });
  });

  return root;
}

/**
 * 목차를 평면 배열로 변환 (검색이나 순회에 유용)
 * @param toc - 계층 구조 목차
 * @returns 평면 배열
 */
export function flattenToc(toc: TocItem[]): TocItem[] {
  const result: TocItem[] = [];

  function traverse(items: TocItem[]) {
    items.forEach(item => {
      result.push(item);
      if (item.children) {
        traverse(item.children);
      }
    });
  }

  traverse(toc);
  return result;
}

/**
 * 목차 필터링 (특정 레벨만 추출)
 * @param toc - 목차 배열
 * @param maxLevel - 최대 레벨 (예: 2이면 h1, h2만)
 * @returns 필터링된 목차
 */
export function filterTocByLevel(toc: TocItem[], maxLevel: number): TocItem[] {
  return toc
    .filter(item => item.level <= maxLevel)
    .map(item => ({
      ...item,
      children: item.children
        ? filterTocByLevel(item.children, maxLevel)
        : undefined
    }));
}
