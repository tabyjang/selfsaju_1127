// 이론 상세 페이지

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TheoryContent } from '../utils/theory/types';
import { loadTheoryContent } from '../utils/theory/supabaseTheoryLoader';
import TableOfContents from '../components/theory/TableOfContents';
import TheoryMarkdownRenderer from '../components/theory/TheoryMarkdownRenderer';

const TheoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<TheoryContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('이론 ID가 지정되지 않았습니다.');
      setLoading(false);
      return;
    }

    loadTheoryContent(id)
      .then(theoryContent => {
        setContent(theoryContent);
        setLoading(false);
      })
      .catch(err => {
        console.error('이론 콘텐츠 로드 실패:', err);
        setError('이론 콘텐츠를 불러올 수 없습니다.');
        setLoading(false);
      });
  }, [id]);

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

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 flex items-center justify-center p-8">
        <div className="glass-card p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-700 mb-4">오류</h2>
          <p className="text-gray-700 mb-4">
            {error || '이론을 찾을 수 없습니다.'}
          </p>
          <button
            onClick={() => navigate('/theories')}
            className="btn-primary px-6 py-2 rounded-lg"
          >
            ← 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const { metadata } = content;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 p-8 page-transition">
      <div className="max-w-7xl mx-auto">
        {/* 상단 네비게이션 */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/theories')}
            className="glass-card px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <span>←</span>
            <span>목록으로</span>
          </button>

          <div className="flex gap-3 text-xs">
            <span className="glass-card px-3 py-2 rounded-full">
              ⏱️ {metadata.readTime}분
            </span>
            {metadata.updatedAt && (
              <span className="glass-card px-3 py-2 rounded-full text-gray-600">
                업데이트: {metadata.updatedAt}
              </span>
            )}
          </div>
        </div>

        {/* 레이아웃: 사이드바(목차) + 메인(콘텐츠) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 사이드바: 목차 */}
          <aside className="lg:col-span-1 hidden lg:block">
            <TableOfContents items={content.tableOfContents} />
          </aside>

          {/* 메인: 콘텐츠 */}
          <main className="lg:col-span-3">
            <article className="glass-card p-8 md:p-12">
              {/* 제목 및 메타 정보 */}
              <header className="mb-8 pb-6 border-b border-gray-200">
                <h1 className="text-4xl font-bold text-amber-800 mb-2">
                  {metadata.title}
                </h1>

                {metadata.subtitle && (
                  <p className="text-xl text-gray-600 mb-4">
                    {metadata.subtitle}
                  </p>
                )}

                <p className="text-gray-700 mb-4">{metadata.description}</p>

                {/* 태그 */}
                <div className="flex gap-2 flex-wrap">
                  {metadata.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </header>

              {/* 마크다운 콘텐츠 */}
              <TheoryMarkdownRenderer htmlContent={content.htmlContent} />

              {/* 관련 이론 */}
              {metadata.relatedTheories &&
                metadata.relatedTheories.length > 0 && (
                  <footer className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-xl font-bold text-amber-800 mb-4">
                      🔗 관련 이론
                    </h3>
                    <div className="flex gap-3 flex-wrap">
                      {metadata.relatedTheories.map(relatedId => (
                        <button
                          key={relatedId}
                          onClick={() => navigate(`/theory/${relatedId}`)}
                          className="glass-card px-4 py-2 rounded-lg hover:shadow-lg transition-all text-sm text-amber-700 hover:text-amber-900"
                        >
                          {relatedId} →
                        </button>
                      ))}
                    </div>
                  </footer>
                )}
            </article>

            {/* 모바일 목차 (하단) */}
            <div className="lg:hidden mt-8">
              <TableOfContents items={content.tableOfContents} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default TheoryDetailPage;
