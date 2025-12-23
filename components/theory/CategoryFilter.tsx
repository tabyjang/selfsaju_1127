// 카테고리 필터 컴포넌트

import React from 'react';
import { TheoryCategory } from '../../utils/theory/types';

interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
  counts?: Record<string, number>; // 각 카테고리별 이론 개수
}

const categories: CategoryInfo[] = [
  {
    id: 'all',
    name: '전체',
    icon: '📚',
    description: '모든 이론'
  },
  {
    id: 'classic',
    name: '고전 명리',
    icon: '📜',
    description: '연해자평, 적천수 등'
  },
  {
    id: 'basics',
    name: '기초 이론',
    icon: '📖',
    description: '명리학 기초'
  },
  {
    id: 'advanced',
    name: '심화 이론',
    icon: '🎓',
    description: '고급 이론'
  },
  {
    id: 'practical',
    name: '실전 활용',
    icon: '⚡',
    description: '실전 해석'
  }
];

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selected,
  onSelect,
  counts
}) => {
  return (
    <div className="w-full">
      {/* 모바일: 드롭다운 */}
      <div className="block md:hidden">
        <select
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full px-4 py-3 glass-card rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
              {counts && counts[cat.id] !== undefined && ` (${counts[cat.id]})`}
            </option>
          ))}
        </select>
      </div>

      {/* 데스크톱: 버튼 그룹 */}
      <div className="hidden md:flex flex-wrap gap-3">
        {categories.map((cat) => {
          const isSelected = selected === cat.id;
          const count = counts?.[cat.id];

          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`
                group relative px-5 py-3 rounded-xl font-medium transition-all duration-200
                ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg scale-105'
                    : 'glass-card text-gray-700 hover:shadow-md hover:scale-102'
                }
              `}
              title={cat.description}
            >
              {/* 아이콘 + 이름 */}
              <div className="flex items-center gap-2">
                <span className={`text-lg ${isSelected ? 'animate-bounce' : ''}`}>
                  {cat.icon}
                </span>
                <span>{cat.name}</span>

                {/* 개수 뱃지 */}
                {count !== undefined && (
                  <span
                    className={`
                      ml-1 px-2 py-0.5 rounded-full text-xs font-bold
                      ${
                        isSelected
                          ? 'bg-white/30 text-white'
                          : 'bg-amber-100 text-amber-700'
                      }
                    `}
                  >
                    {count}
                  </span>
                )}
              </div>

              {/* Hover 툴팁 */}
              {!isSelected && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {cat.description}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 선택된 카테고리 설명 (모바일) */}
      <div className="block md:hidden mt-2 text-sm text-gray-600">
        {categories.find((c) => c.id === selected)?.description}
      </div>
    </div>
  );
};

export default CategoryFilter;
