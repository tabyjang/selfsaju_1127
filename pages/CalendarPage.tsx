import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import type { SajuInfo } from '../types';
import { MonthlyIljuCalendar } from '../components/MonthlyIljuCalendar';

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sajuData, setSajuData] = useState<SajuInfo | null>(null);

  useEffect(() => {
    // location state에서 먼저 가져오기
    const stateData = location.state as { sajuData?: SajuInfo } | null;
    if (stateData?.sajuData) {
      setSajuData(stateData.sajuData);
      // localStorage에도 백업 저장
      localStorage.setItem('calendarSajuData', JSON.stringify(stateData.sajuData));
      return;
    }

    // localStorage에서 가져오기 (백업)
    const savedData = localStorage.getItem('calendarSajuData');
    if (savedData) {
      try {
        setSajuData(JSON.parse(savedData));
      } catch (error) {
        console.error('사주 데이터 복원 실패:', error);
        // 데이터가 없으면 결과 페이지로 리다이렉트
        navigate('/result');
      }
    } else {
      // 데이터가 없으면 결과 페이지로 리다이렉트
      navigate('/result');
    }
  }, [location, navigate]);

  if (!sajuData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 page-fade-in">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">사주 데이터를 불러오는 중...</h2>
          <p className="text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 page-transition">
      {/* 우측 상단 로그인 버튼 */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-bold shadow-md cursor-pointer">
              로그인
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl={window.location.href} />
        </SignedIn>
      </div>

      <main className="max-w-7xl mx-auto relative pt-12">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/result')}
            className="mb-4 text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            돌아가기
          </button>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
            📅 사주 캘린더
          </h1>
          <p className="text-gray-600">
            월별 일주(日柱)와 십성(十星), 십이운성(十二運星) 정보를 확인하세요
          </p>
        </div>

        {/* 로고 */}
        <header className="text-center mb-8 relative flex justify-center">
          <img
            src="/logo.png"
            alt="아사주달 로고"
            className="h-20 sm:h-24 md:h-28 w-auto object-contain cursor-pointer"
            onClick={() => navigate('/')}
          />
        </header>

        {/* 캘린더 */}
        <div className="max-w-6xl mx-auto">
          <MonthlyIljuCalendar sajuInfo={sajuData} />
        </div>

        {/* 안내 문구 */}
        <div className="mt-8 p-6 bg-white/80 rounded-2xl border border-indigo-200 shadow-lg max-w-4xl mx-auto">
          <h3 className="text-lg font-bold text-gray-800 mb-3">💡 사주 캘린더 사용법</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <span>각 날짜를 클릭하면 해당 날의 일주(日柱) 정보를 자세히 볼 수 있습니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <span>십성(十星)과 십이운성(十二運星)을 통해 그날의 운세를 파악할 수 있습니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <span>오행(五行) 색상으로 구분되어 있어 한눈에 기운의 흐름을 확인할 수 있습니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <span>이전/다음 월 버튼으로 원하는 달을 탐색할 수 있습니다.</span>
            </li>
          </ul>
        </div>

        {/* 다시 분석하기 버튼 */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/input')}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
          >
            ← 다시 분석하기
          </button>
        </div>
      </main>

      <footer className="text-center mt-16 text-sm text-gray-500 pb-8">
        <p>아사주달의 분석을 통해 건강과 행복이 함께 하시길 기원합니다.</p>
        <p>
          &copy; {new Date().getFullYear()} asajudal.com. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default CalendarPage;
