import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import type { SajuInfo, Ohaeng } from '../types';
import { MonthlyIljuCalendar } from '../components/MonthlyIljuCalendar';
import { upsertMySaju } from '../utils/sajuStorage';

// 오행 색상 맵 (달력과 동일)
const ohaengColorMap: Record<Ohaeng, { bg: string; text: string; border?: string }> = {
  wood: { bg: "bg-[#00B050]", text: "text-white", border: "border border-gray-800" },
  fire: { bg: "bg-[#FF0000]", text: "text-white", border: "border border-gray-800" },
  earth: { bg: "bg-[#FEC100]", text: "text-white", border: "border border-gray-800" },
  metal: { bg: "bg-slate-200", text: "text-white", border: "border border-gray-800" },
  water: { bg: "bg-black", text: "text-white", border: "border border-gray-800" },
};

// 천간 정보
const cheonganOhaengMap: Record<string, Ohaeng> = {
  '甲': 'wood', '乙': 'wood',
  '丙': 'fire', '丁': 'fire',
  '戊': 'earth', '己': 'earth',
  '庚': 'metal', '辛': 'metal',
  '壬': 'water', '癸': 'water',
};

// 지지 정보
const jijiOhaengMap: Record<string, Ohaeng> = {
  '子': 'water', '丑': 'earth', '寅': 'wood', '卯': 'wood',
  '辰': 'earth', '巳': 'fire', '午': 'fire', '未': 'earth',
  '申': 'metal', '酉': 'metal', '戌': 'earth', '亥': 'water',
};

// 달력과 동일한 스타일의 천간 박스
const CheonganCharBox: React.FC<{ char: string }> = ({ char }) => {
  const ohaeng = cheonganOhaengMap[char];
  if (!ohaeng) return <span>{char}</span>;

  const color = ohaengColorMap[ohaeng];

  return (
    <div
      className={`inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 text-xl md:text-2xl font-bold rounded-md shadow-md mr-2 border border-gray-800 ${color.bg} ${color.text}`}
      style={{
        WebkitTextStroke: '0.5px black',
        textShadow: '0 0 1px rgba(0,0,0,0.5), 1px 1px 2px rgba(0,0,0,0.3)'
      }}
    >
      {char}
    </div>
  );
};

// 달력과 동일한 스타일의 지지 박스
const JijiCharBox: React.FC<{ char: string }> = ({ char }) => {
  const ohaeng = jijiOhaengMap[char];
  if (!ohaeng) return <span>{char}</span>;

  const color = ohaengColorMap[ohaeng];

  return (
    <div
      className={`inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 text-xl md:text-2xl font-bold rounded-md shadow-md mr-2 border border-gray-800 ${color.bg} ${color.text}`}
      style={{
        WebkitTextStroke: '0.5px black',
        textShadow: '0 0 1px rgba(0,0,0,0.5), 1px 1px 2px rgba(0,0,0,0.3)'
      }}
    >
      {char}
    </div>
  );
};

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isSignedIn } = useUser();
  const [sajuData, setSajuData] = useState<SajuInfo | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');

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
        // 데이터가 없으면 대시보드로 리다이렉트
        navigate('/dashboard');
      }
    } else {
      // 데이터가 없으면 대시보드로 리다이렉트
      navigate('/dashboard');
    }
  }, [location, navigate]);

  // "내 사주로 저장" 핸들러
  const handleSaveMySaju = async () => {
    if (!isSignedIn || !user || !sajuData) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      setIsSaving(true);
      setSaveMessage('');

      const result = await upsertMySaju(user.id, sajuData);

      if (result.success) {
        const name = sajuData.name || '사주 정보';
        const message = result.isUpdate
          ? `✅ ${name}님의 사주가 업데이트되었습니다!`
          : `✅ ${name}님의 사주가 저장되었습니다!`;
        setSaveMessage(message);

        // 3초 후 메시지 제거
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('❌ 저장 중 오류가 발생했습니다.');
        console.error('저장 실패:', result.error);
      }
    } catch (error) {
      setSaveMessage('❌ 저장 중 오류가 발생했습니다.');
      console.error('저장 오류:', error);
    } finally {
      setIsSaving(false);
    }
  };

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
    <div className="min-h-screen font-sans bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 page-transition">
      {/* 헤더 */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="아사주달 로고"
                className="h-10 w-auto object-contain cursor-pointer"
                onClick={() => navigate('/')}
              />
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  아사주달
                </h1>
                <span className="text-xs font-semibold text-purple-500 animate-pulse">
                  (아! 사주 보여달라고?)
                </span>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => navigate('/input', { state: { skipAutoLoad: true } })}
                className="hidden md:block px-4 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition text-sm font-bold border border-indigo-200"
              >
                다른 사주 입력
              </button>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-bold shadow-md cursor-pointer">
                    로그인
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveMySaju}
                    disabled={isSaving}
                    className="group relative px-5 py-2.5 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:via-purple-600 hover:to-indigo-700 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                    <span className="relative flex items-center gap-2">
                      {isSaving ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          저장 중...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          내 사주로 저장
                        </>
                      )}
                    </span>
                  </button>
                  <button
                    onClick={() => navigate('/input', { state: { skipAutoLoad: true } })}
                    className="md:hidden px-3 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition text-xs font-bold border border-indigo-200"
                  >
                    새 사주
                  </button>
                  <UserButton afterSignOutUrl="/input" />
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      </div>

      {/* 저장 메시지 표시 */}
      {saveMessage && (
        <div className="fixed top-20 right-4 z-[60] px-4 py-2 bg-white border-2 border-green-500 text-green-700 rounded-lg shadow-lg text-sm font-bold animate-fade-in">
          {saveMessage}
        </div>
      )}

      <main className="max-w-7xl mx-auto relative pt-24 px-4 sm:px-6 lg:px-8 pb-8">

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
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <CheonganCharBox char="甲" />
                          <CheonganCharBox char="戊" />
                          <CheonganCharBox char="庚" />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <JijiCharBox char="丑" />
                          <JijiCharBox char="未" />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-700 text-base md:text-lg">소(丑)와 양(未)의 기운이 귀인입니다.</td>
                    </tr>
                    <tr className="hover:bg-blue-50 transition">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <CheonganCharBox char="乙" />
                          <CheonganCharBox char="己" />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <JijiCharBox char="子" />
                          <JijiCharBox char="申" />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-700 text-base md:text-lg">쥐(子)와 원숭이(申)의 기운이 귀인입니다.</td>
                    </tr>
                    <tr className="hover:bg-blue-50 transition">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <CheonganCharBox char="丙" />
                          <CheonganCharBox char="丁" />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <JijiCharBox char="亥" />
                          <JijiCharBox char="酉" />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-700 text-base md:text-lg">돼지(亥)와 닭(酉)의 기운이 귀인입니다.</td>
                    </tr>
                    <tr className="hover:bg-blue-50 transition">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <CheonganCharBox char="壬" />
                          <CheonganCharBox char="癸" />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <JijiCharBox char="卯" />
                          <JijiCharBox char="巳" />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-700 text-base md:text-lg">토끼(卯)와 뱀(巳)의 기운이 귀인입니다.</td>
                    </tr>
                    <tr className="hover:bg-blue-50 transition">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <CheonganCharBox char="辛" />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <JijiCharBox char="寅" />
                          <JijiCharBox char="午" />
                        </div>
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

          {/* 4. 십이운성 (十二運星) - 에너지의 흐름을 읽는 지혜 */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 md:p-8 rounded-xl border-2 border-emerald-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                1
              </div>
              <h4 className="text-2xl md:text-3xl font-bold text-emerald-900">십이운성 - 당신의 에너지 흐름을 이해하는 나침반</h4>
            </div>

            {/* 친절한 소개 */}
            <div className="bg-white/80 p-6 rounded-lg mb-6 border-l-4 border-emerald-400">
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
                <strong className="text-emerald-700">십이운성</strong>은 우리 삶의 에너지가 어떻게 흐르는지를
                <strong className="text-emerald-600"> 탄생부터 소멸까지 12단계의 생명 주기</strong>로 표현한 지혜입니다.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
                마치 사계절이 순환하듯, 우리의 에너지도 <strong className="text-emerald-600">오르고 내리며 변화</strong>합니다.
                이것은 <span className="text-red-600 font-bold">좋고 나쁨이 아니라</span>,
                <strong className="text-emerald-700"> 지금 이 순간 나의 에너지를 어디에 쓰면 좋을지</strong>를 알려주는 신호입니다.
              </p>
              <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-5 rounded-lg">
                <p className="text-base md:text-lg text-emerald-900 font-semibold text-center">
                  💚 십이운성을 이해하면, 힘들 때 "왜 나만 이럴까?" 대신<br />
                  "지금은 내면을 돌아볼 시기구나"라고 받아들일 수 있는 여유가 생깁니다.
                </p>
              </div>
            </div>

            {/* 에너지 흐름 그래프 이미지 */}
            <div className="bg-white/80 p-6 rounded-lg mb-6">
              <h5 className="text-xl md:text-2xl font-bold text-emerald-800 mb-4 text-center">
                📊 십이운성의 에너지 흐름 (외적 활동 ↔ 내적 활동)
              </h5>
              <div className="flex justify-center">
                <img
                  src="/sibioonseong.png"
                  alt="십이운성 에너지 흐름 그래프"
                  className="max-w-full h-auto rounded-lg shadow-md"
                />
              </div>
              <p className="text-sm md:text-base text-gray-600 text-center mt-4 italic">
                * 에너지는 단순히 오르락내리락하는 것이 아니라, '외적 활동'과 '내적 활동'의 교차를 보여줍니다.
              </p>
            </div>

            {/* 4개 그룹 상세 설명 */}
            <div className="space-y-5">
              {/* ① 성장기 */}
              <div className="bg-gradient-to-r from-green-50 to-lime-50 p-6 rounded-xl border-2 border-green-300 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🌱</span>
                  <h5 className="text-xl md:text-2xl font-bold text-green-800">① 성장기 - 에너지가 솟구치는 시기</h5>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-lg overflow-hidden shadow-sm">
                    <thead className="bg-green-400 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-base md:text-lg font-bold">단계</th>
                        <th className="px-4 py-3 text-left text-base md:text-lg font-bold">의미</th>
                        <th className="px-4 py-3 text-left text-base md:text-lg font-bold">특징 및 심리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm md:text-base">
                      <tr className="hover:bg-green-50 transition">
                        <td className="px-4 py-3 font-bold text-green-700">장생(長生)</td>
                        <td className="px-4 py-3">탄생</td>
                        <td className="px-4 py-3">세상에 막 나온 상태. 후원자가 있고 활기차며 배움의 의지가 강함.</td>
                      </tr>
                      <tr className="hover:bg-green-50 transition">
                        <td className="px-4 py-3 font-bold text-green-700">목욕(沐浴)</td>
                        <td className="px-4 py-3">목욕, 시련</td>
                        <td className="px-4 py-3">아이가 옷을 벗고 씻는 과정. 호기심, 유행, 반복적인 시행착오, 도화(桃花)의 기운.</td>
                      </tr>
                      <tr className="hover:bg-green-50 transition">
                        <td className="px-4 py-3 font-bold text-green-700">관대(冠帶)</td>
                        <td className="px-4 py-3">의복, 사춘기</td>
                        <td className="px-4 py-3">사회에 나갈 준비를 마침. 추진력과 자신감은 넘치나 고집이 세고 좌충우돌함.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ② 전성기 */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-300 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">👑</span>
                  <h5 className="text-xl md:text-2xl font-bold text-amber-800">② 전성기 - 에너지가 정점에 달하는 시기</h5>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-lg overflow-hidden shadow-sm">
                    <thead className="bg-amber-400 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-base md:text-lg font-bold">단계</th>
                        <th className="px-4 py-3 text-left text-base md:text-lg font-bold">의미</th>
                        <th className="px-4 py-3 text-left text-base md:text-lg font-bold">특징 및 심리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm md:text-base">
                      <tr className="hover:bg-amber-50 transition">
                        <td className="px-4 py-3 font-bold text-amber-700">건록(建祿)</td>
                        <td className="px-4 py-3">자립, 완성</td>
                        <td className="px-4 py-3">사회적으로 안정된 위치. 노련하고 합리적이며 완숙한 힘을 발휘함.</td>
                      </tr>
                      <tr className="hover:bg-amber-50 transition">
                        <td className="px-4 py-3 font-bold text-amber-700">제왕(帝王)</td>
                        <td className="px-4 py-3">정점, 권위</td>
                        <td className="px-4 py-3">에너지의 최정상. 타협하지 않는 강력한 힘과 카리스마. (쇠퇴의 시작점)</td>
                      </tr>
                      <tr className="hover:bg-amber-50 transition">
                        <td className="px-4 py-3 font-bold text-amber-700">쇠(衰)</td>
                        <td className="px-4 py-3">퇴각, 노련</td>
                        <td className="px-4 py-3">힘은 여전하나 전면에서 물러남. 지혜롭고 보수적이며 내실을 기함.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ③ 수렴기 - 내적 활동 증대 */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-300 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🧘</span>
                  <h5 className="text-xl md:text-2xl font-bold text-purple-800">③ 수렴기 - 에너지가 안으로 향하는 시기</h5>
                </div>
                <div className="bg-purple-100/50 p-4 rounded-lg mb-4">
                  <p className="text-base md:text-lg text-purple-900 font-semibold">
                    ⭐ <strong>'내적 활동 증대'</strong>의 핵심 구간입니다.
                    외부 활동보다는 내면의 성장에 집중하는 시기입니다.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-lg overflow-hidden shadow-sm">
                    <thead className="bg-purple-400 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-base md:text-lg font-bold">단계</th>
                        <th className="px-4 py-3 text-left text-base md:text-lg font-bold">의미</th>
                        <th className="px-4 py-3 text-left text-base md:text-lg font-bold">특징 및 심리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm md:text-base">
                      <tr className="hover:bg-purple-50 transition">
                        <td className="px-4 py-3 font-bold text-purple-700">병(病)</td>
                        <td className="px-4 py-3">쇠약, 동정</td>
                        <td className="px-4 py-3">육체적 힘은 빠지고 정신적인 교감과 동정심이 많아짐. 예술적 감수성.</td>
                      </tr>
                      <tr className="hover:bg-purple-50 transition">
                        <td className="px-4 py-3 font-bold text-purple-700">사(死)</td>
                        <td className="px-4 py-3">정지, 집중</td>
                        <td className="px-4 py-3">움직임이 멈춘 상태. 생각이 깊고 하나에 몰두하는 집중력, 철학적 사고.</td>
                      </tr>
                      <tr className="hover:bg-purple-50 transition">
                        <td className="px-4 py-3 font-bold text-purple-700">묘(墓)</td>
                        <td className="px-4 py-3">저장, 입묘</td>
                        <td className="px-4 py-3">모든 것을 창고에 넣고 문을 닫음. 알뜰함, 정신적 가치 중시, 실속 추구.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ④ 전환기 */}
              <div className="bg-gradient-to-r from-sky-50 to-cyan-50 p-6 rounded-xl border-2 border-sky-300 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🔄</span>
                  <h5 className="text-xl md:text-2xl font-bold text-sky-800">④ 전환기 - 새로운 생명을 기다리는 시기</h5>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-lg overflow-hidden shadow-sm">
                    <thead className="bg-sky-400 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-base md:text-lg font-bold">단계</th>
                        <th className="px-4 py-3 text-left text-base md:text-lg font-bold">의미</th>
                        <th className="px-4 py-3 text-left text-base md:text-lg font-bold">특징 및 심리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm md:text-base">
                      <tr className="hover:bg-sky-50 transition">
                        <td className="px-4 py-3 font-bold text-sky-700">절(絶)</td>
                        <td className="px-4 py-3">단절, 무(無)</td>
                        <td className="px-4 py-3">기존 기운이 완전히 끊김. 가장 순수하고 변화무쌍하며 반전의 기회가 있음.</td>
                      </tr>
                      <tr className="hover:bg-sky-50 transition">
                        <td className="px-4 py-3 font-bold text-sky-700">태(胎)</td>
                        <td className="px-4 py-3">잉태, 시작</td>
                        <td className="px-4 py-3">새로운 생명이 자리 잡음. 아이디어, 기획, 의존성, 보호받고 싶은 심리.</td>
                      </tr>
                      <tr className="hover:bg-sky-50 transition">
                        <td className="px-4 py-3 font-bold text-sky-700">양(養)</td>
                        <td className="px-4 py-3">배양, 준비</td>
                        <td className="px-4 py-3">엄마 뱃속에서 자람. 안정적인 환경, 교육, 양육, 미래를 향한 준비 단계.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 실전 해석의 핵심 인사이트 */}
            <div className="mt-6 bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-xl border-2 border-rose-300 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-3xl">💡</span>
                <h5 className="text-xl md:text-2xl font-bold text-rose-800">실전 해석의 핵심 인사이트</h5>
              </div>

              {/* 인사이트 1: 외적 vs 내적 활동 */}
              <div className="bg-white/80 p-5 rounded-lg mb-4 border-l-4 border-rose-400">
                <p className="font-bold text-rose-900 text-lg md:text-xl mb-3">
                  1️⃣ 외적 활동 vs 내적 활동 - 에너지를 쓰는 방향이 다를 뿐입니다
                </p>
                <div className="space-y-3 text-base md:text-lg text-gray-700">
                  <div className="bg-rose-50 p-4 rounded-lg">
                    <p className="font-semibold text-rose-700 mb-2">📈 상승 곡선 (장생→제왕)</p>
                    <p>사업 확장, 대외 활동, 적극적인 소통, 육체적 에너지가 필요한 일에 적합합니다.</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="font-semibold text-purple-700 mb-2">📉 하락 곡선 (쇠→묘)</p>
                    <p>연구, 공부, 명상, 기획, 자산 관리, 내면 수양에 적합합니다.</p>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-4 rounded-lg">
                    <p className="font-bold text-emerald-800 text-center">
                      ✨ "운이 나쁜 게 아니라, 에너지를 쓰는 방향이 달라지는 것"입니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 인사이트 2: 십성과의 결합 */}
              <div className="bg-white/80 p-5 rounded-lg border-l-4 border-pink-400">
                <p className="font-bold text-pink-900 text-lg md:text-xl mb-3">
                  2️⃣ 십성(十星)과의 결합 - 더 깊은 이해를 위해
                </p>
                <div className="space-y-3 text-base md:text-lg text-gray-700">
                  <div className="bg-yellow-50 p-4 rounded-lg border-l-2 border-yellow-400">
                    <p className="mb-2">
                      <strong className="text-yellow-700">재성(돈)</strong>이
                      <strong className="text-sky-700"> '절/태'</strong>지에 놓이면
                    </p>
                    <p className="pl-4">
                      → 돈의 기운이 불안정하므로 큰 투자는 피하고,
                      <strong className="text-yellow-700"> 아이디어 중심의 사업</strong>을 구상하는 것이 좋습니다.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border-l-2 border-blue-400">
                    <p className="mb-2">
                      <strong className="text-blue-700">인성(공부)</strong>이
                      <strong className="text-purple-700"> '사/묘'</strong>지에 놓이면
                    </p>
                    <p className="pl-4">
                      → 학문적 성취가 매우 깊어지며,
                      <strong className="text-blue-700"> 고전이나 정신세계 공부</strong>에 탁월한 능력을 발휘합니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 마무리 메시지 */}
              <div className="mt-5 bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 p-6 rounded-xl border-2 border-purple-300">
                <p className="text-base md:text-lg text-gray-800 leading-relaxed text-center">
                  <span className="text-2xl mr-2">🌸</span>
                  <strong className="text-purple-700">십이운성</strong>은 여러분의 삶이
                  <strong className="text-pink-700"> 어떤 계절을 지나고 있는지</strong>를 알려주는 나침반입니다.<br />
                  지금 힘들다면, 그것은 <span className="text-red-600 font-bold">실패가 아니라</span>
                  <strong className="text-emerald-700"> 내면으로 깊이 들어가는 소중한 시간</strong>일 수 있습니다.<br />
                  <span className="text-xl">💚</span>
                  <strong className="text-teal-700"> 당신의 에너지가 가장 빛나는 순간을 응원합니다.</strong>
                  <span className="text-xl ml-1">💚</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 대시보드로 이동 버튼 */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
          >
            대시보드로 이동 →
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
