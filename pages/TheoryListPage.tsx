// 이론 목록 페이지

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TheoryCourse } from '../utils/theory/types';
import { loadCourseIndex } from '../utils/theory/supabaseTheoryLoader';
import TheoryCard from '../components/theory/TheoryCard';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
      <Header />

      {/* 헤더 */}
      <div className="max-w-7xl mx-auto mb-12 pt-16">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-amber-800 mb-2">
            📚 명리학 이론 자료
          </h1>
          <p className="text-gray-600">
            사주명리학의 기초부터 고전까지, 체계적으로 학습하세요
          </p>
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
        {/* 60일주 특별 섹션 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-amber-800 mb-6 flex items-center gap-2">
            <span>🔮</span>
            <span>60일주 완벽 가이드</span>
          </h2>
          <div
            onClick={() => navigate('/60ilju')}
            className="glass-card p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300"
          >
            <div className="flex items-center gap-6">
              <div className="text-6xl">📅</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-amber-900 mb-2">
                  60일주 자세히 보기
                </h3>
                <p className="text-gray-700 mb-3">
                  갑자부터 계해까지, 60가지 일주의 성격과 운명을 알아보세요.
                  천간과 지지의 조합으로 이루어진 각 일주별 상세 해설을 제공합니다.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="px-3 py-1 bg-amber-200 text-amber-800 rounded-full font-medium">60개 일주</span>
                  <span className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full font-medium">10개 천간</span>
                  <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full font-medium">이미지 포함</span>
                </div>
              </div>
              <div className="text-amber-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

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

      <Footer />
    </div>
  );
};

export default TheoryListPage;
