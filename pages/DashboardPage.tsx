import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import type { SajuInfo, Ohaeng } from '../types';
import { getDayGanjiByYMD, getUnseongByIlganAndJiji, earthlyBranchGanInfo } from '../utils/manse';

// 오행 색상 맵 (캘린더와 동일)
const ohaengColorMap: Record<Ohaeng, { bg: string; text: string; border: string }> = {
  wood: { bg: 'bg-[#00B050]', text: 'text-white', border: 'border border-gray-800' },
  fire: { bg: 'bg-[#FF0000]', text: 'text-white', border: 'border border-gray-800' },
  earth: { bg: 'bg-[#FEC100]', text: 'text-white', border: 'border border-gray-800' },
  metal: { bg: 'bg-slate-200', text: 'text-white', border: 'border border-gray-800' },
  water: { bg: 'bg-black', text: 'text-white', border: 'border border-gray-800' },
};

// 간지 한글 매핑
const ganjiKoreanMap: Record<string, string> = {
  '甲': '갑목', '乙': '을목',
  '丙': '병화', '丁': '정화',
  '戊': '무토', '己': '기토',
  '庚': '경금', '辛': '신금',
  '壬': '임수', '癸': '계수',
  '子': '자수', '丑': '축토', '寅': '인목', '卯': '묘목',
  '辰': '진토', '巳': '사화', '午': '오화', '未': '미토',
  '申': '신금', '酉': '유금', '戌': '술토', '亥': '해수',
};

// 간지 박스 컴포넌트 (캘린더와 동일한 스타일)
const GanjiBox: React.FC<{ char: string; showKorean?: boolean }> = ({ char, showKorean = true }) => {
  const info = earthlyBranchGanInfo[char];
  if (!info) return <span className="text-2xl font-bold">{char}</span>;

  const color = ohaengColorMap[info.ohaeng];
  const koreanLabel = ganjiKoreanMap[char] || '';

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`inline-flex items-center justify-center w-16 h-16 text-4xl font-bold rounded-md shadow-md ${color.bg} ${color.text} ${color.border}`}
        style={{
          WebkitTextStroke: '0.5px black',
          textShadow: '0 0 1px rgba(0,0,0,0.5), 1px 1px 2px rgba(0,0,0,0.3)'
        }}
      >
        {char}
      </div>
      {showKorean && koreanLabel && (
        <span className="text-xs text-gray-600 font-medium">{koreanLabel}</span>
      )}
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [sajuData, setSajuData] = useState<SajuInfo | null>(null);
  const [userName, setUserName] = useState<string>('사용자');

  // 페이지 로드 시 스크롤을 최상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // localStorage에서 사주 데이터 불러오기
    const savedData = localStorage.getItem('currentSajuData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setSajuData(data);
        // 이름 추출
        if (data.name) {
          setUserName(data.name);
        }
      } catch (error) {
        console.error('사주 데이터 복원 실패:', error);
      }
    }
  }, []);

  // 오늘 날짜 정보 계산
  const todayInfo = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const weekday = weekdays[today.getDay()];

    try {
      const { gan, ji, ganji } = getDayGanjiByYMD(year, month, day);

      // 일간 정보 (사주 데이터에서)
      const ilgan = sajuData?.pillars.day.cheonGan.char || '';

      // 12운성 계산
      const unseong = ilgan ? getUnseongByIlganAndJiji(ilgan, ji) : null;

      return {
        year,
        month,
        day,
        weekday,
        gan,
        ji,
        ganji,
        ilgan,
        unseong,
      };
    } catch (error) {
      console.error('오늘 날짜 정보 계산 실패:', error);
      return null;
    }
  }, [sajuData]);

  // 메뉴 카드 데이터
  const menuCards = [
    {
      title: '사주 분석 결과',
      description: '나의 사주팔자 전체 분석 결과를 확인하세요',
      icon: '🎯',
      path: '/result',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
    },
    {
      title: '심층 사주 분석',
      description: '오행 가중치, 신강신약, 용신 기반 정밀 분석',
      icon: '🔮',
      path: '/deep-analysis',
      gradient: 'from-purple-500 to-indigo-500',
      bgGradient: 'from-purple-50 to-indigo-50',
    },
    {
      title: '오행 에너지 보기',
      description: '나를 둘러싼 오행의 에너지 흐름을 한눈에 볼 수 있습니다',
      icon: '✨',
      path: '/orbit',
      gradient: 'from-pink-500 to-rose-500',
      bgGradient: 'from-pink-50 to-rose-50',
    },
    {
      title: '대운 분석',
      description: '10년 주기 대운의 흐름과 변화를 살펴보세요',
      icon: '📈',
      path: '/daewoon',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
    },
    {
      title: '만세력 캘린더',
      description: '날짜별 천간지지와 길흉을 확인하세요',
      icon: '📅',
      path: '/calendar',
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
    },
  ];

  // 통계 카드 데이터
  const statsCards = [
    {
      label: '일간',
      value: sajuData?.pillars.day.cheonGan.char || '-',
      description: '나의 본질',
      icon: '⭐',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      label: '월령',
      value: sajuData?.pillars.month.jiJi.char || '-',
      description: '운명의 사령관',
      icon: '🌙',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      label: '격국',
      value: sajuData?.gyeokguk?.name || '-',
      description: '사주의 유형',
      icon: '🎭',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 page-transition">
      {/* 헤더 */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img
                src="/logo.png"
                alt="아사주달 로고"
                className="h-10 w-auto object-contain"
              />
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                아사주달
              </h1>
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

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* 환영 메시지 */}
        <div className="mb-12 text-center animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
            안녕하세요, <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{userName}</span>님! 👋
          </h2>
          <p className="text-lg text-gray-600">
            나의 운명을 탐험하고 인생의 지도를 그려보세요
          </p>
        </div>

        {/* 오늘의 운세 섹션 */}
        {sajuData && todayInfo && (
          <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 overflow-hidden shadow-lg">
              {/* 상단 헤더 */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-white font-bold text-base md:text-lg">
                    {todayInfo.month}월 {todayInfo.day}일 {todayInfo.weekday}
                  </span>
                </div>
                <div className="flex items-center gap-4 absolute left-1/2 transform -translate-x-1/2">
                  <span className="text-white/80 text-lg">일간</span>
                  <div className="flex flex-col items-center">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 text-3xl font-bold rounded-md shadow-md ${(() => {
                          const info = earthlyBranchGanInfo[todayInfo.ilgan];
                          return info ? `${ohaengColorMap[info.ohaeng].bg} ${ohaengColorMap[info.ohaeng].text} ${ohaengColorMap[info.ohaeng].border}` : 'bg-gray-200 text-black border border-gray-800';
                        })()
                        }`}
                      style={{
                        WebkitTextStroke: '0.5px black',
                        textShadow: '0 0 1px rgba(0,0,0,0.5), 1px 1px 2px rgba(0,0,0,0.3)'
                      }}
                    >
                      {todayInfo.ilgan}
                    </div>
                  </div>
                  <span className="text-white/80 text-lg">나 자신</span>
                </div>
                <div className="text-white font-bold flex items-center gap-2 flex-1 justify-end">
                  <span>✨</span>
                  <span className="hidden sm:inline text-lg">오늘의 운세</span>
                </div>
              </div>

              {/* 내용 */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4">
                {/* 왼쪽: 오늘의 날짜 정보 (1/5) */}
                <div className="bg-white rounded-lg p-4 shadow border border-indigo-100">
                  <div className="flex flex-col items-center justify-center h-full">
                    {/* 일주 세로 배치 */}
                    <div className="flex flex-col gap-3">
                      <GanjiBox char={todayInfo.gan} />
                      <GanjiBox char={todayInfo.ji} />
                    </div>
                  </div>
                </div>

                {/* 오른쪽: 운세 메시지 (4/5) */}
                <div className="md:col-span-4 bg-white rounded-lg p-6 shadow border border-indigo-100 flex items-center justify-center min-h-[250px]">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🔮</div>
                    <p className="text-gray-600 text-base leading-relaxed">
                      오늘의 운세가 표시됩니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 통계 카드 섹션 */}
        {sajuData && (
          <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span>📊</span>
              <span>나의 사주 핵심 정보</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {statsCards.map((stat, index) => (
                <div
                  key={index}
                  className={`${stat.bgColor} ${stat.borderColor} border-2 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-sm text-gray-600 font-semibold mb-1">{stat.label}</div>
                  <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 메뉴 카드 섹션 */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span>🗂️</span>
            <span>메뉴</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuCards.map((card, index) => (
              <div
                key={index}
                onClick={() => {
                  if (card.path) {
                    navigate(card.path);
                  }
                }}
                className={`bg-gradient-to-br ${card.bgGradient} rounded-2xl p-8 border-2 border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group`}
              >
                <div className="flex items-start gap-4">
                  <div className={`text-5xl transform group-hover:scale-110 transition-transform duration-300`}>
                    {card.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-2xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent mb-2`}>
                      {card.title}
                    </h4>
                    <p className="text-gray-600 text-base leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                  <div className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 사주 데이터가 없을 때 안내 */}
        {!sajuData && (
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200 text-center animate-fade-in">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              아직 사주 분석을 시작하지 않으셨네요!
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              나의 사주를 분석하고 운명의 비밀을 알아보세요
            </p>
            <button
              onClick={() => navigate('/input')}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold hover:from-blue-700 hover:to-indigo-700 transition shadow-xl text-lg"
            >
              <span>✨</span>
              <span>사주 분석 시작하기</span>
              <span>✨</span>
            </button>
          </div>
        )}

        {/* 추가 정보 섹션 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
            <div className="text-3xl mb-3">💡</div>
            <h4 className="text-lg font-bold text-gray-800 mb-2">사주란?</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              태어난 년, 월, 일, 시의 천간지지로 구성된 8글자로, 인생의 운명과 성격, 적성 등을 분석하는 동양 철학입니다.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
            <div className="text-3xl mb-3">🎯</div>
            <h4 className="text-lg font-bold text-gray-800 mb-2">격국이란?</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              사주팔자의 기본 틀을 결정하는 핵심 요소로, 직업운, 재물운, 명예운 등을 판단하는 기준이 됩니다.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
            <div className="text-3xl mb-3">✨</div>
            <h4 className="text-lg font-bold text-gray-800 mb-2">용신이란?</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              사주의 균형을 맞추고 부족한 부분을 보완해주는 오행으로, 인생의 방향성을 제시해줍니다.
            </p>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="text-center py-8 border-t border-gray-200 bg-white/50">
        <p className="text-sm text-gray-500 mb-2">
          아사주달의 분석을 통해 건강과 행복이 함께 하시길 기원합니다.
        </p>
        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} asajudal.com. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default DashboardPage;
