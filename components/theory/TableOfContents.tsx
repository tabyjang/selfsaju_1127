// 목차 컴포넌트 (상세 페이지 사이드바용)

import React, { useState, useEffect } from 'react';
import { TocItem } from '../../utils/theory/types';

interface TableOfContentsProps {
  items: TocItem[];
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ items }) => {
  const [activeId, setActiveId] = useState<string>('');

  // 스크롤 시 현재 섹션 활성화
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -80% 0px'
      }
    );

    // 모든 제목 요소 관찰
    const headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
    headings.forEach(heading => observer.observe(heading));

    return () => {
      headings.forEach(heading => observer.unobserve(heading));
    };
  }, []);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const renderTocItem = (item: TocItem, depth = 0) => {
    const isActive = activeId === item.id;
    const paddingLeft = depth * 12; // 계층에 따른 들여쓰기

    return (
      <li key={item.id} style={{ paddingLeft: `${paddingLeft}px` }}>
        <a
          href={`#${item.id}`}
          onClick={e => {
            e.preventDefault();
            handleClick(item.id);
          }}
          className={`
            block py-2 px-3 rounded-md text-sm transition-all duration-200
            ${
              isActive
                ? 'bg-amber-100 text-amber-800 font-semibold border-l-4 border-amber-600'
                : 'text-gray-700 hover:text-amber-700 hover:bg-amber-50 border-l-4 border-transparent'
            }
          `}
        >
          {item.title}
        </a>

        {/* 자식 항목 재귀 렌더링 */}
        {item.children && item.children.length > 0 && (
          <ul className="mt-1">
            {item.children.map(child => renderTocItem(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="glass-card p-4 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <h3 className="font-bold text-lg text-amber-800 mb-4 flex items-center gap-2">
        <span>📑</span>
        <span>목차</span>
      </h3>

      <ul className="space-y-1">
        {items.map(item => renderTocItem(item))}
      </ul>

      {/* 스크롤 힌트 */}
      {items.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            ↕️ 스크롤하여 더보기
          </p>
        </div>
      )}
    </nav>
  );
};

export default TableOfContents;
