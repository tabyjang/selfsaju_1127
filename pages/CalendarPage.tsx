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

          </h1>
          <p className="text-gray-600">

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

        {/* 천을귀인 상세 설명 */}
        <div className="mt-8 space-y-6 max-w-6xl mx-auto">
          {/* 1. 천을귀인이란? */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 md:p-8 rounded-xl border-2 border-amber-200 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                1
              </div>
              <h4 className="text-2xl md:text-3xl font-bold text-amber-900">천을귀인이란 무엇인가?</h4>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p className="bg-white/70 p-5 rounded-lg text-base md:text-lg">
                <strong className="text-amber-800">천을귀인</strong>은 수많은 신살(神殺) 중 <strong className="text-amber-700">가장 존귀하고 길한 최고봉</strong>입니다.
              </p>
              <div className="bg-amber-100/50 p-5 rounded-lg border-l-4 border-amber-400">
                <p className="font-semibold text-amber-900 mb-2 text-base md:text-lg">✨ 본질</p>
                <p className="text-base md:text-lg">
                  하늘의 황제(태을)를 보좌하는 <strong>신령한 기운</strong>입니다.
                </p>
              </div>
              <div className="bg-white/70 p-5 rounded-lg">
                <p className="font-semibold text-amber-900 mb-2 text-base md:text-lg">🎯 핵심 효과</p>
                <p className="text-base md:text-lg mb-3">
                  <strong className="text-amber-700">흉한 운은 반으로 줄여주고, 길한 운은 배로 증폭</strong>시킵니다.
                </p>
                <p className="text-base md:text-lg">
                  설령 사주 원국이 조금 좋지 않더라도 천을귀인이 잘 자리 잡고 있으면
                  <strong className="text-amber-700"> 인품이 고결하고 주변의 도움을 받아 위기를 기적처럼 넘기게</strong> 됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* 2. 천을귀인 도표 */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 md:p-8 rounded-xl border-2 border-blue-200 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                2
              </div>
              <h4 className="text-2xl md:text-3xl font-bold text-blue-900">일간(日干) 기준 천을귀인 도표</h4>
            </div>
            <div className="space-y-4">
              <p className="text-base md:text-lg text-gray-700 bg-white/70 p-4 rounded-lg">
                천을귀인은 철저하게 <strong className="text-blue-700">태어난 날의 천간(일간)</strong>을 기준으로 결정됩니다.
              </p>

              {/* 테이블 */}
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg overflow-hidden shadow-md">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-4 py-4 text-left text-base md:text-lg font-bold">일간 (나)</th>
                      <th className="px-4 py-4 text-left text-base md:text-lg font-bold">천을귀인이 되는 지지</th>
                      <th className="px-4 py-4 text-left text-base md:text-lg font-bold">설명</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-blue-50 transition">
                      <td className="px-4 py-4 font-bold text-blue-900 text-base md:text-lg">갑(甲), 무(戊), 경(庚)</td>
                      <td className="px-4 py-4 text-base md:text-lg">
                        <span className="inline-block bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-bold mr-2">축(丑)</span>
                        <span className="inline-block bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-bold">미(未)</span>
                      </td>
                      <td className="px-4 py-4 text-gray-700 text-base md:text-lg">소(丑)와 양(未)의 기운이 귀인입니다.</td>
                    </tr>
                    <tr className="hover:bg-blue-50 transition">
                      <td className="px-4 py-4 font-bold text-blue-900 text-base md:text-lg">을(乙), 기(己)</td>
                      <td className="px-4 py-4 text-base md:text-lg">
                        <span className="inline-block bg-cyan-100 text-cyan-900 px-3 py-1 rounded-full font-bold mr-2">자(子)</span>
                        <span className="inline-block bg-cyan-100 text-cyan-900 px-3 py-1 rounded-full font-bold">신(申)</span>
                      </td>
                      <td className="px-4 py-4 text-gray-700 text-base md:text-lg">쥐(子)와 원숭이(申)의 기운이 귀인입니다.</td>
                    </tr>
                    <tr className="hover:bg-blue-50 transition">
                      <td className="px-4 py-4 font-bold text-blue-900 text-base md:text-lg">병(丙), 정(丁)</td>
                      <td className="px-4 py-4 text-base md:text-lg">
                        <span className="inline-block bg-purple-100 text-purple-900 px-3 py-1 rounded-full font-bold mr-2">해(亥)</span>
                        <span className="inline-block bg-purple-100 text-purple-900 px-3 py-1 rounded-full font-bold">유(酉)</span>
                      </td>
                      <td className="px-4 py-4 text-gray-700 text-base md:text-lg">돼지(亥)와 닭(酉)의 기운이 귀인입니다.</td>
                    </tr>
                    <tr className="hover:bg-blue-50 transition">
                      <td className="px-4 py-4 font-bold text-blue-900 text-base md:text-lg">임(壬), 계(癸)</td>
                      <td className="px-4 py-4 text-base md:text-lg">
                        <span className="inline-block bg-green-100 text-green-900 px-3 py-1 rounded-full font-bold mr-2">묘(卯)</span>
                        <span className="inline-block bg-green-100 text-green-900 px-3 py-1 rounded-full font-bold">사(巳)</span>
                      </td>
                      <td className="px-4 py-4 text-gray-700 text-base md:text-lg">토끼(卯)와 뱀(巳)의 기운이 귀인입니다.</td>
                    </tr>
                    <tr className="hover:bg-blue-50 transition">
                      <td className="px-4 py-4 font-bold text-blue-900 text-base md:text-lg">신(辛)</td>
                      <td className="px-4 py-4 text-base md:text-lg">
                        <span className="inline-block bg-red-100 text-red-900 px-3 py-1 rounded-full font-bold mr-2">인(寅)</span>
                        <span className="inline-block bg-red-100 text-red-900 px-3 py-1 rounded-full font-bold">오(午)</span>
                      </td>
                      <td className="px-4 py-4 text-gray-700 text-base md:text-lg">호랑이(寅)와 말(午)의 기운이 귀인입니다.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 3. 천을귀인의 3가지 핵심 인사이트 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 md:p-8 rounded-xl border-2 border-purple-200 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                3
              </div>
              <h4 className="text-2xl md:text-3xl font-bold text-purple-900">천을귀인의 3가지 핵심 인사이트</h4>
            </div>
            <div className="space-y-4">
              {/* 인사이트 1 */}
              <div className="bg-white/70 p-5 rounded-lg border-l-4 border-purple-400">
                <div className="flex items-start gap-3">
                  <span className="text-3xl flex-shrink-0">①</span>
                  <div className="flex-1">
                    <p className="font-bold text-purple-900 text-xl md:text-2xl mb-3">"나를 돕는 보이지 않는 손"</p>
                    <p className="text-base md:text-lg text-gray-700 mb-3">
                      천을귀인이 운에서 들어오는 날(또는 해)에는 내가 감당하기 힘든 난관에 부딪혀도
                      반드시 <strong className="text-purple-700">귀인(사람)이 나타나거나 환경적 도움</strong>이 생깁니다.
                    </p>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-base md:text-lg text-gray-700">
                        시험 합격, 취업, 계약 등 중요한 결정이 있을 때 천을귀인 운이 오면
                        <strong className="text-purple-700"> "하늘의 결재"를 받은 것</strong>과 같습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 인사이트 2 */}
              <div className="bg-white/70 p-5 rounded-lg border-l-4 border-pink-400">
                <div className="flex items-start gap-3">
                  <span className="text-3xl flex-shrink-0">②</span>
                  <div className="flex-1">
                    <p className="font-bold text-pink-900 text-xl md:text-2xl mb-3">"인품과 지혜의 상징"</p>
                    <p className="text-base md:text-lg text-gray-700 mb-3">
                      사주에 천을귀인이 있는 사람은 기본적으로 <strong className="text-pink-700">총명하고 인품이 단정</strong>합니다.
                    </p>
                    <div className="bg-pink-50 p-4 rounded-lg">
                      <p className="text-base md:text-lg text-gray-700">
                        남들에게 호감을 주는 매력이 있어 주위에 사람이 모입니다.
                        그래서 천을귀인은 단순히 운이 좋은 것을 넘어
                        <strong className="text-pink-700"> "인간관계의 복"</strong>을 의미하기도 합니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 인사이트 3 */}
              <div className="bg-white/70 p-5 rounded-lg border-l-4 border-indigo-400">
                <div className="flex items-start gap-3">
                  <span className="text-3xl flex-shrink-0">③</span>
                  <div className="flex-1">
                    <p className="font-bold text-indigo-900 text-xl md:text-2xl mb-3">"흉살을 제어하는 힘"</p>
                    <p className="text-base md:text-lg text-gray-700 mb-3">
                      천을귀인은 다른 나쁜 살(공망, 형, 충 등)의 기운을 <strong className="text-indigo-700">억제하는 강력한 힘</strong>이 있습니다.
                    </p>
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <p className="text-base md:text-lg text-gray-700">
                        하지만 천을귀인 자체가 <strong className="text-red-600">충(沖)이나 형(刑)을 당하면</strong> 그 힘이 반감되니,
                        캘린더에서는 <strong className="text-indigo-700">"귀인의 힘이 조금 약해지는 날"</strong> 정도로 섬세하게 표현해 줄 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
