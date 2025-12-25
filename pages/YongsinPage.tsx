import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const YongsinPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 page-transition">
      <Header />

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* 페이지 타이틀 */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-4">
            <div className="text-7xl mb-4 animate-bounce">🌿</div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
            나의 용신 찾기
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            나를 도와주는 <span className="font-bold text-green-700">오행의 힘</span>을 찾아보세요 ✨
          </p>
        </div>

        {/* 준비중 안내 */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl border-2 border-green-200 p-12 text-center shadow-xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="text-6xl mb-6">🔨</div>
            <h2 className="text-2xl md:text-3xl font-bold text-green-800 mb-4">
              열심히 준비중입니다
            </h2>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
              더 나은 서비스를 제공하기 위해<br />
              용신 찾기 기능을 개발하고 있습니다.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              <span>곧 찾아뵙겠습니다</span>
            </div>
          </div>

          {/* 용신에 대한 간단한 설명 */}
          <div className="mt-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-lg animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>💡</span>
              용신이란?
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              용신(用神)은 사주팔자에서 나의 부족한 부분을 채워주거나,
              과한 부분을 조절해주는 오행의 힘을 말합니다.
            </p>
            <p className="text-gray-700 leading-relaxed">
              나의 용신을 알면 어떤 색상, 방향, 직업, 사람이 나에게 도움이 되는지
              알 수 있어 인생의 방향을 설정하는 데 큰 도움이 됩니다.
            </p>
          </div>

          {/* 대시보드로 돌아가기 버튼 */}
          <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full font-bold hover:from-green-700 hover:to-emerald-700 transition shadow-lg hover:shadow-xl hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>대시보드로 돌아가기</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default YongsinPage;
