// 과목별 강의 목록 페이지

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LectureIndex, TheoryLectureMetadata } from '../utils/theory/types';
import { loadLectureIndex } from '../utils/theory/supabaseTheoryLoader';
import Header from '../components/Header';
import Footer from '../components/Footer';

const TheoryLectureListPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [lectureData, setLectureData] = useState<LectureIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      loadLectureIndex(courseId)
        .then(data => {
          setLectureData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('강의 목록 로드 실패:', err);
          setError('강의 목록을 불러올 수 없습니다.');
          setLoading(false);
        });
    }
  }, [courseId]);

  const handleLectureClick = (lectureId: string) => {
    navigate(`/theories/${courseId}/lecture/${lectureId}`);
  };

  const handleBackClick = () => {
    navigate('/theories');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            <p className="text-gray-700">강의 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lectureData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 flex items-center justify-center p-8">
        <div className="glass-card p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-700 mb-4">오류</h2>
          <p className="text-gray-700 mb-4">{error || '과목을 찾을 수 없습니다.'}</p>
          <button
            onClick={handleBackClick}
            className="btn-primary px-6 py-2 rounded-lg"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const { course, lectures } = lectureData;

  // 난이도별 배지 색상
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-700 border-green-300',
    intermediate: 'bg-blue-100 text-blue-700 border-blue-300',
    advanced: 'bg-purple-100 text-purple-700 border-purple-300'
  };

  const difficultyLabels = {
    beginner: '입문',
    intermediate: '중급',
    advanced: '고급'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 p-8 page-transition">
      <Header />

      {/* 헤더 */}
      <div className="max-w-5xl mx-auto mb-8 pt-16">

        {/* 과목 정보 */}
        <div className="glass-card p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold text-amber-800">
                  {course.title}
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${difficultyColors[course.difficulty]}`}>
                  {difficultyLabels[course.difficulty]}
                </span>
              </div>

              {course.subtitle && (
                <p className="text-xl text-amber-600 mb-4">{course.subtitle}</p>
              )}

              <p className="text-gray-700 mb-4">{course.description}</p>

              {/* 태그 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {course.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 통계 정보 */}
            <div className="flex md:flex-col gap-4">
              <div className="text-center glass-card p-4 rounded-lg">
                <div className="text-3xl font-bold text-amber-700">
                  {course.lectureCount}
                </div>
                <div className="text-sm text-gray-600">강의</div>
              </div>
              <div className="text-center glass-card p-4 rounded-lg">
                <div className="text-3xl font-bold text-blue-700">
                  {course.totalReadTime}분
                </div>
                <div className="text-sm text-gray-600">총 소요</div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-amber-800 mb-4">
          📚 강의 목록 ({lectures.length}강)
        </h2>
      </div>

      {/* 강의 목록 */}
      <div className="max-w-5xl mx-auto">
        {lectures.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              강의가 아직 없습니다
            </h3>
            <p className="text-gray-600">
              곧 강의가 추가될 예정입니다.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {lectures.map((lecture, index) => (
              <div
                key={lecture.id}
                onClick={() => handleLectureClick(lecture.id)}
                className="glass-card p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-102 flex items-start gap-6"
              >
                {/* 강의 번호 */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">
                      {lecture.orderIndex}
                    </span>
                  </div>
                </div>

                {/* 강의 정보 */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {lecture.title}
                  </h3>

                  {lecture.subtitle && (
                    <p className="text-amber-600 mb-2">{lecture.subtitle}</p>
                  )}

                  {lecture.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {lecture.description}
                    </p>
                  )}

                  {/* 태그 & 소요시간 */}
                  <div className="flex items-center gap-4 flex-wrap">
                    {lecture.tags && lecture.tags.length > 0 && (
                      <div className="flex gap-2">
                        {lecture.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>⏱️</span>
                      <span>{lecture.readTime}분</span>
                    </div>
                  </div>
                </div>

                {/* 화살표 아이콘 */}
                <div className="flex-shrink-0 text-gray-400 text-2xl">
                  →
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default TheoryLectureListPage;
