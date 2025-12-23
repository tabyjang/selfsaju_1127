// 이론 카드 컴포넌트 (목록 페이지용)

import React from 'react';
import { TheoryMetadata, DifficultyLevel } from '../../utils/theory/types';

interface TheoryCardProps {
  theory: TheoryMetadata;
  onClick: () => void;
}

const difficultyConfig: Record<
  DifficultyLevel,
  { label: string; color: string; bgColor: string }
> = {
  beginner: {
    label: '입문',
    color: 'text-green-700',
    bgColor: 'bg-green-100'
  },
  intermediate: {
    label: '중급',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100'
  },
  advanced: {
    label: '고급',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100'
  }
};

const TheoryCard: React.FC<TheoryCardProps> = ({ theory, onClick }) => {
  const difficulty = difficultyConfig[theory.difficulty];

  return (
    <div
      onClick={onClick}
      className="glass-card p-6 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
    >
      {/* 이미지 */}
      {theory.imageUrl && (
        <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
          <img
            src={theory.imageUrl}
            alt={theory.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      {/* 제목 */}
      <h3 className="text-xl font-bold text-amber-800 mb-2 group-hover:text-amber-600 transition-colors">
        {theory.title}
      </h3>

      {/* 부제목 */}
      {theory.subtitle && (
        <p className="text-sm text-gray-600 mb-3">{theory.subtitle}</p>
      )}

      {/* 설명 */}
      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
        {theory.description}
      </p>

      {/* 메타 정보 */}
      <div className="flex items-center gap-3 mb-4 text-xs text-gray-600">
        {/* 난이도 */}
        <span
          className={`px-2 py-1 rounded-full ${difficulty.bgColor} ${difficulty.color} font-medium`}
        >
          {difficulty.label}
        </span>

        {/* 읽기 시간 */}
        <span className="flex items-center gap-1">
          <span>⏱️</span>
          <span>{theory.readTime}분</span>
        </span>

        {/* Featured 뱃지 */}
        {theory.featured && (
          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
            ⭐ 추천
          </span>
        )}
      </div>

      {/* 태그 */}
      <div className="flex gap-2 flex-wrap">
        {theory.tags.map(tag => (
          <span
            key={tag}
            className="px-2 py-1 bg-amber-50 text-amber-800 rounded text-xs border border-amber-200"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TheoryCard;
