// 이론 목록 페이지

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TheoryCourse } from '../utils/theory/types';
import { loadCourseIndex } from '../utils/theory/supabaseTheoryLoader';
import TheoryCard from '../components/theory/TheoryCard';

const TheoryListPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<TheoryCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCourseIndex()
      .then(data => {
        setCourses(data.courses);
        setLoading(false);
      })
      .catch(err => {
        console.error('과목 목록 로드 실패:', err);
        setError('과목 목록을 불러올 수 없습니다.');
        setLoading(false);
      });
  }, []);

  const handleCourseClick = (courseId: string) => {
    navigate(`/theories/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            <p className="text-gray-700">이론 자료를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 flex items-center justify-center p-8">
        <div className="glass-card p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-700 mb-4">오류</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary px-6 py-2 rounded-lg"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 p-8 page-transition">
      {/* 헤더 */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-amber-800 mb-2">
              📚 명리학 이론 자료
            </h1>
            <p className="text-gray-600">
              사주명리학의 기초부터 고전까지, 체계적으로 학습하세요
            </p>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="glass-card px-6 py-3 rounded-lg hover:shadow-lg transition-all"
          >
            ← 대시보드로
          </button>
        </div>

        {/* 통계 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-bold text-amber-700">
              {courses.length}
            </div>
            <div className="text-sm text-gray-600">전체 과목</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-bold text-green-700">
              {courses.filter(c => c.difficulty === 'beginner').length}
            </div>
            <div className="text-sm text-gray-600">입문 과목</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-bold text-blue-700">
              {courses.filter(c => c.difficulty === 'intermediate').length}
            </div>
            <div className="text-sm text-gray-600">중급 과목</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-bold text-purple-700">
              {courses.filter(c => c.difficulty === 'advanced').length}
            </div>
            <div className="text-sm text-gray-600">고급 과목</div>
          </div>
        </div>
      </div>

      {/* 과목 카드 그리드 */}
      <div className="max-w-7xl mx-auto">
        {/* Featured 과목 */}
        {courses.some(c => c.featured) && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-amber-800 mb-6 flex items-center gap-2">
              <span>⭐</span>
              <span>추천 과목</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses
                .filter(c => c.featured)
                .map(course => (
                  <TheoryCard
                    key={course.id}
                    theory={{
                      ...course,
                      readTime: course.totalReadTime
                    }}
                    onClick={() => handleCourseClick(course.id)}
                  />
                ))}
            </div>
          </div>
        )}

        {/* 전체 과목 */}
        <div>
          <h2 className="text-2xl font-bold text-amber-800 mb-6 flex items-center gap-2">
            <span>📖</span>
            <span>전체 과목</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <TheoryCard
                key={course.id}
                theory={{
                  ...course,
                  readTime: course.totalReadTime
                }}
                onClick={() => handleCourseClick(course.id)}
              />
            ))}
          </div>
        </div>

        {/* 빈 상태 */}
        {courses.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              과목이 없습니다
            </h3>
            <p className="text-gray-600">
              곧 다양한 명리학 과목을 추가할 예정입니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TheoryListPage;
