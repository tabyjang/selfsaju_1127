import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import type { SajuInfo, Ohaeng, GeokgukResult } from '../types';
import { getDayGanjiByYMD, getUnseongByIlganAndJiji, earthlyBranchGanInfo } from '../utils/manse';
import { upsertMySaju, getUserSajuRecords } from '../utils/sajuStorage';
import { analyzeGeokguk } from '../utils/gyeokguk';
import { geokgukDescriptions } from '../utils/geokgukDescriptions';
import { loadIljuBundle } from '../utils/ilju/loadIljuBundle';
import type { IljuBundle } from '../utils/ilju/types';
import { sibsinPositionDescriptions } from '../utils/sibsinPositionDescriptions';
import { unseongDescriptions } from '../utils/unseongDescriptions';
import { getSimpleFortune, type SimpleFortune } from '../utils/simpleFortuneGenerator';
import { SajuPillarsDisplay, SajuInfoSummary, OhaengEnergyDisplay, IlganPersonalityDisplay } from '../components/AnalysisResult';
import { InteractionsDisplay } from '../components/InteractionsDisplay';
import { SinsalDisplay } from '../components/SinsalDisplay';
import Header from '../components/Header';
import Footer from '../components/Footer';

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

// 간지 박스 컴포넌트 (사주결과 페이지와 동일한 스타일)
const GanjiBox: React.FC<{ char: string; showKorean?: boolean }> = ({ char, showKorean = true }) => {
  const info = earthlyBranchGanInfo[char];
  if (!info) return <span className="text-2xl font-bold">{char}</span>;

  const color = ohaengColorMap[info.ohaeng];
  const koreanLabel = ganjiKoreanMap[char] || '';

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`saju-char-outline inline-flex items-center justify-center w-16 h-16 text-4xl font-bold rounded-md shadow-md ${color.bg} ${color.text} ${color.border}`}
      >
        {char}
      </div>
      {showKorean && koreanLabel && (
        <span className="text-xs text-gray-600 font-medium">{koreanLabel}</span>
      )}
    </div>
  );
};

// 에너지 레벨을 숫자로 변환하는 헬퍼 함수
const getEnergyCount = (level: 'high' | 'medium' | 'low' | 'active' | 'moderate' | 'rest' | undefined): number => {
  if (!level) return 0;
  if (level === 'high' || level === 'active') return 3;
  if (level === 'medium' || level === 'moderate') return 2;
  return 1; // low 또는 rest
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  const [sajuData, setSajuData] = useState<SajuInfo | null>(null);
  const [userName, setUserName] = useState<string>('사용자');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [showGyeokgukModal, setShowGyeokgukModal] = useState<boolean>(false);
  const [showIljuModal, setShowIljuModal] = useState<boolean>(false);
  const [iljuData, setIljuData] = useState<IljuBundle | null>(null);
  const [iljuLoading, setIljuLoading] = useState<boolean>(false);
  const [showWollyeongModal, setShowWollyeongModal] = useState<boolean>(false);
  const [showSajuWongukModal, setShowSajuWongukModal] = useState<boolean>(false);
  const [showJinjjaModal, setShowJinjjaModal] = useState<boolean>(false);
  const [checkedPlans, setCheckedPlans] = useState<boolean[]>([false, false, false]);
  const [todayFortune, setTodayFortune] = useState<SimpleFortune | null>(null); // 심플 운세

  // 페이지 로드 시 스크롤을 최상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadSajuData = async () => {
      // 1. 먼저 localStorage에서 사주 데이터 확인
      const savedData = localStorage.getItem('currentSajuData');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          setSajuData(data);
          // 이름 추출
          if (data.name) {
            setUserName(data.name);
          }
          return; // localStorage에 데이터 있으면 종료
        } catch (error) {
          console.error('사주 데이터 복원 실패:', error);
        }
      }

      // 2. localStorage가 비어있고 로그인된 경우, DB에서 불러오기
      if (isSignedIn && user) {
        try {
          console.log('로그인 상태: DB에서 사주 데이터 조회 중...');
          const result = await getUserSajuRecords(user.id);

          if (result.success && result.data && result.data.length > 0) {
            console.log(`✅ DB에서 사주 데이터 ${result.data.length}개 발견!`);
            const latestRecord = result.data[0];
            const sajuInfo = latestRecord.saju_data as SajuInfo;

            // localStorage에 저장
            localStorage.setItem('currentSajuData', JSON.stringify(sajuInfo));
            console.log('✅ localStorage에 사주 데이터 저장 완료');

            setSajuData(sajuInfo);
            if (sajuInfo.name) {
              setUserName(sajuInfo.name);
            }
          } else {
            console.log('DB에 저장된 사주 데이터가 없습니다.');
          }
        } catch (error) {
          console.error('DB에서 사주 데이터 조회 오류:', error);
        }
      }
    };

    loadSajuData();
  }, [isSignedIn, user]);

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

  // 오늘의 운세 데이터 로드
  useEffect(() => {
    const loadTodayUnse = async () => {
      if (sajuData && todayInfo && todayInfo.unseong) {
        // 심플 운세 생성 (일주 + 십이운성만 사용)
        try {
          const fortune = await getSimpleFortune(sajuData, todayInfo.unseong.name);
          setTodayFortune(fortune);
        } catch (error) {
          console.error('스토리 기반 운세 생성 실패:', error);
        }
      }
    };
    loadTodayUnse();
  }, [sajuData, todayInfo]);

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
      title: '나의 오행 에너지',
      description: '위치별 가중치와 통근·투간 반영 정밀 에너지 분석',
      icon: '⚡',
      path: '/my-energy',
      gradient: 'from-indigo-500 to-violet-500',
      bgGradient: 'from-indigo-50 to-violet-50',
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
    {
      title: '명리학 이론 자료',
      description: '사주명리학의 기초부터 고전까지 체계적으로 학습하세요',
      icon: '📚',
      path: '/theories',
      gradient: 'from-amber-500 to-yellow-500',
      bgGradient: 'from-amber-50 to-yellow-50',
    },
    {
      title: '60일주 자세히 보기',
      description: '60가지 일주의 특성과 운명을 깊이 있게 알아보세요',
      icon: '🔮',
      path: '/60ilju',
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-50 to-purple-50',
    },
    {
      title: '나의 용신 찾기',
      description: '나를 도와주는 오행의 힘을 찾아보세요',
      icon: '🌿',
      path: '/yongsin',
      gradient: 'from-emerald-400 to-green-400',
      bgGradient: 'from-emerald-50 to-green-50',
    },
  ];

  // 격국 분석 결과
  const geokgukResult = useMemo(() => {
    if (!sajuData) return null;
    try {
      const isHourUnknown =
        sajuData.pillars.hour.cheonGan.char === '-' ||
        sajuData.pillars.hour.jiJi.char === '-';
      return analyzeGeokguk(sajuData, isHourUnknown);
    } catch (e) {
      console.error('격국 분석 오류:', e);
      return null;
    }
  }, [sajuData]);

  // 일주 데이터 로드
  useEffect(() => {
    if (!showIljuModal || !sajuData) {
      setIljuData(null);
      return;
    }

    const iljuGanji = sajuData.pillars.day.ganji;
    setIljuLoading(true);

    loadIljuBundle(iljuGanji)
      .then((data) => {
        setIljuData(data);
        setIljuLoading(false);
      })
      .catch((error) => {
        console.error('일주 데이터 로드 실패:', error);
        setIljuData(null);
        setIljuLoading(false);
      });
  }, [showIljuModal, sajuData]);

  // renderBoldMarkdown 헬퍼 함수
  const renderBoldMarkdown = (text: string, strongClassName: string): React.ReactNode => {
    const regex = /\*\*(.+?)\*\*/g;
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;

    for (let match = regex.exec(text); match; match = regex.exec(text)) {
      const start = match.index;
      const full = match[0];
      const inner = match[1];
      if (start > lastIndex) {
        nodes.push(text.slice(lastIndex, start));
      }
      nodes.push(
        <strong key={start} className={strongClassName}>
          {inner}
        </strong>
      );
      lastIndex = start + full.length;
    }
    if (lastIndex < text.length) {
      nodes.push(text.slice(lastIndex));
    }
    return <>{nodes}</>;
  };

  // 오행 개수 계산
  const ohaengCounts = useMemo(() => {
    if (!sajuData) return { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

    const counts: Record<string, number> = {
      wood: 0,
      fire: 0,
      earth: 0,
      metal: 0,
      water: 0,
    };

    // 시주가 없을 경우 확인
    const isHourUnknown =
      sajuData.pillars.hour.cheonGan.char === '-' || sajuData.pillars.hour.jiJi.char === '-';

    Object.entries(sajuData.pillars).forEach(([key, pillar]) => {
      // 시주가 없으면 제외
      if (key === 'hour' && isHourUnknown) {
        return;
      }
      counts[pillar.cheonGan.ohaeng]++;
      counts[pillar.jiJi.ohaeng]++;
    });

    return counts;
  }, [sajuData]);

  // 통계 카드 데이터
  const statsCards = [
    {
      label: '사주원국',
      value: '',
      description: '나의 사주팔자',
      icon: '📜',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      onClick: () => setShowSajuWongukModal(true), // 클릭 가능
      isSpecial: true, // 특수 박스 표시
    },
    {
      label: '일주',
      value: sajuData?.pillars.day.ganji || '-',
      description: '나의 본질',
      icon: '⭐',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      onClick: () => setShowIljuModal(true),
      isIlju: true, // 일주 특수 표시
    },
    {
      label: '진짜 속마음',
      value: '특별해설',
      description: '일주의 숨겨진 진실',
      icon: '💭',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      isIlju: true, // 일주 특수 표시
      onClick: () => {
        setShowJinjjaModal(true);
        // 일주 데이터 로드
        if (!iljuData && sajuData) {
          setIljuLoading(true);
          loadIljuBundle(sajuData.pillars.day.ganji)
            .then(data => {
              setIljuData(data);
              setIljuLoading(false);
            })
            .catch(error => {
              console.error('일주 데이터 로드 실패:', error);
              setIljuLoading(false);
            });
        }
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 page-transition">
      <Header showSaveButton={true} onSave={handleSaveMySaju} isSaving={isSaving} />

      {/* 저장 메시지 표시 */}
      {saveMessage && (
        <div className="fixed top-20 right-4 z-[60] px-4 py-2 bg-white border-2 border-green-500 text-green-700 rounded-lg shadow-lg text-sm font-bold animate-fade-in">
          {saveMessage}
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/* 환영 메시지 */}
        <div className="mb-12 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* 왼쪽: 인사문구 */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
                안녕하세요, <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{userName}</span>님! 👋
              </h2>
              <p className="text-lg text-gray-600">
                나의 운명을 탐험하고 인생의 지도를 그려보세요
              </p>
            </div>

          </div>
        </div>

        {/* 오늘의 운세 섹션 */}
        {sajuData && todayInfo && (
          <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border-2 border-indigo-200 overflow-hidden shadow-2xl">
              {/* 상단 헤더 */}
              <div className="bg-gradient-to-r from-violet-300 via-purple-300 to-pink-300 px-6 py-3 flex items-center relative">
                {/* 왼쪽: 날짜 + 오늘의 일주 */}
                <div className="flex items-center gap-6">
                  {/* 날짜 강조 */}
                  <div className="flex flex-col md:flex-row md:items-baseline md:gap-3">
                    <span className="text-white font-extrabold text-2xl md:text-3xl leading-tight" style={{ textShadow: '1px 1px 0 black, -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 0 0 black, -1px 0 0 black, 0 1px 0 black, 0 -1px 0 black' }}>
                      {todayInfo.month}월 {todayInfo.day}일
                    </span>
                    <span className="text-white/90 font-bold text-lg md:text-xl" style={{ textShadow: '1px 1px 0 black, -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 0 0 black, -1px 0 0 black, 0 1px 0 black, 0 -1px 0 black' }}>
                      {todayInfo.weekday}
                    </span>
                  </div>

                  {/* 오늘의 일주 */}
                  <div className="flex items-center gap-3 bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                    <span className="text-white/90 text-sm font-semibold" style={{ textShadow: '1px 1px 0 black, -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 0 0 black, -1px 0 0 black, 0 1px 0 black, 0 -1px 0 black' }}>오늘 일주</span>
                    <div className="flex items-center gap-2">
                      {/* 천간 */}
                      <div
                        className={`saju-char-outline-small inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 text-2xl md:text-3xl font-bold rounded-lg shadow-md ${(() => {
                            const info = earthlyBranchGanInfo[todayInfo.gan];
                            return info ? `${ohaengColorMap[info.ohaeng].bg} ${ohaengColorMap[info.ohaeng].text} ${ohaengColorMap[info.ohaeng].border}` : 'bg-gray-200 text-black border border-gray-800';
                          })()
                          }`}
                      >
                        {todayInfo.gan}
                      </div>
                      {/* 지지 */}
                      <div
                        className={`saju-char-outline-small inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 text-2xl md:text-3xl font-bold rounded-lg shadow-md ${(() => {
                            const info = earthlyBranchGanInfo[todayInfo.ji];
                            return info ? `${ohaengColorMap[info.ohaeng].bg} ${ohaengColorMap[info.ohaeng].text} ${ohaengColorMap[info.ohaeng].border}` : 'bg-gray-200 text-black border border-gray-800';
                          })()
                          }`}
                      >
                        {todayInfo.ji}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 중앙: 오늘의 운세 */}
                <div className="absolute left-1/2 transform -translate-x-1/2 text-white font-bold flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  <span className="hidden sm:inline text-lg md:text-xl bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm" style={{ textShadow: '1px 1px 0 black, -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 0 0 black, -1px 0 0 black, 0 1px 0 black, 0 -1px 0 black' }}>오늘의 운세</span>
                </div>
              </div>

              {/* 메인 컨텐츠 */}
              <div className="p-4">
                {/* 액션플랜 + 운세전반 */}
                <div className="space-y-6">
                  {/* 오늘의 액션 - 1개 긴 박스 */}
                  <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200 shadow-lg">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl flex-shrink-0">✨</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-purple-900 mb-3 text-lg">오늘의 액션</h4>
                        <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                          {todayFortune?.actionPlan || "오늘 하루를 의미 있게 보내세요."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 운세 전반 큰 박스 */}
                  <div className="relative bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-200 shadow-xl overflow-hidden">
                    {/* 배경 장식 */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                      {/* 템플릿 기반 운세 제목 (있으면 표시) */}
                      {todayFortune?.title && (
                        <div className="mb-4">
                          <h4 className="text-2xl font-bold text-purple-800 text-center">
                            {/* [대괄호] 제거하고 표시 */}
                            {todayFortune.title.replace(/[\[\]]/g, '')}
                          </h4>
                        </div>
                      )}

                      {/* 운세 내용 */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100 shadow-inner">
                        <div
                          className="text-lg md:text-xl text-gray-800 leading-relaxed font-medium"
                          dangerouslySetInnerHTML={{
                            __html: (
                              todayFortune?.content ||
                              "오늘의 운세를 불러오는 중입니다..."
                            )
                          }}
                        />
                      </div>
                    </div>
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
                  onClick={stat.onClick || undefined}
                  className={`${stat.bgColor} ${stat.borderColor} border-2 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                    stat.onClick ? 'cursor-pointer' : ''
                  }`}
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-lg md:text-xl text-gray-700 font-bold mb-2">{stat.label}</div>
                  {stat.isSpecial ? (
                    <div className="flex flex-col items-center justify-center gap-2 mb-2">
                      {/* 4주 색상 박스로 표시 */}
                      <div className="flex items-center justify-center gap-1">
                        {['hour', 'day', 'month', 'year'].map((key) => {
                          const pillar = sajuData.pillars[key as keyof typeof sajuData.pillars];
                          const isHourUnknown = pillar.cheonGan.char === '-';

                          if (isHourUnknown) {
                            return (
                              <div key={key} className="flex flex-col gap-0.5">
                                <div className="w-7 h-7 flex items-center justify-center bg-gray-100 text-gray-300 rounded text-xs font-bold">-</div>
                                <div className="w-7 h-7 flex items-center justify-center bg-gray-100 text-gray-300 rounded text-xs font-bold">-</div>
                              </div>
                            );
                          }

                          const ganInfo = earthlyBranchGanInfo[pillar.cheonGan.char];
                          const jiInfo = earthlyBranchGanInfo[pillar.jiJi.char];
                          const ganColor = ganInfo ? ohaengColorMap[ganInfo.ohaeng] : { bg: 'bg-gray-200', text: 'text-gray-800', border: 'border-gray-300' };
                          const jiColor = jiInfo ? ohaengColorMap[jiInfo.ohaeng] : { bg: 'bg-gray-200', text: 'text-gray-800', border: 'border-gray-300' };

                          return (
                            <div key={key} className="flex flex-col gap-0.5">
                              <div className={`w-7 h-7 flex items-center justify-center ${ganColor.bg} ${ganColor.text} ${ganColor.border} rounded text-xs font-bold shadow-sm saju-char-outline`}>
                                {pillar.cheonGan.char}
                              </div>
                              <div className={`w-7 h-7 flex items-center justify-center ${jiColor.bg} ${jiColor.text} ${jiColor.border} rounded text-xs font-bold shadow-sm saju-char-outline`}>
                                {pillar.jiJi.char}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : stat.isIlju ? (
                    <div className="flex flex-col items-center justify-center gap-2 mb-2">
                      {/* 일주 색상 박스로 표시 */}
                      <div className="flex items-center justify-center gap-1">
                        {(() => {
                          const dayPillar = sajuData.pillars.day;
                          const ganInfo = earthlyBranchGanInfo[dayPillar.cheonGan.char];
                          const jiInfo = earthlyBranchGanInfo[dayPillar.jiJi.char];
                          const ganColor = ganInfo ? ohaengColorMap[ganInfo.ohaeng] : { bg: 'bg-gray-200', text: 'text-gray-800', border: 'border-gray-300' };
                          const jiColor = jiInfo ? ohaengColorMap[jiInfo.ohaeng] : { bg: 'bg-gray-200', text: 'text-gray-800', border: 'border-gray-300' };

                          return (
                            <>
                              <div className={`w-12 h-12 flex items-center justify-center ${ganColor.bg} ${ganColor.text} ${ganColor.border} rounded-lg text-2xl font-bold shadow-md saju-char-outline`}>
                                {dayPillar.cheonGan.char}
                              </div>
                              <div className={`w-12 h-12 flex items-center justify-center ${jiColor.bg} ${jiColor.text} ${jiColor.border} rounded-lg text-2xl font-bold shadow-md saju-char-outline`}>
                                {dayPillar.jiJi.char}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                      {stat.value}
                    </div>
                  )}
                  <div className="text-sm md:text-base text-gray-600 font-medium">{stat.description}</div>
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
                    // 만세력 캘린더로 이동 시 데이터 설정
                    if (card.path === '/calendar' && sajuData) {
                      localStorage.setItem('calendarSajuData', JSON.stringify(sajuData));
                    }
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

      {/* 일주 모달 */}
      {showIljuModal && sajuData && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowIljuModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-500 p-6 rounded-t-2xl flex justify-between items-center z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white">일주(日柱) - 나와 배우자</h2>
              <button
                onClick={() => setShowIljuModal(false)}
                className="text-white hover:text-gray-200 transition"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-6 space-y-6">
              {/* 일주 소개 */}
              <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-xl border-2 border-emerald-200 p-6">
                <div className="bg-white/80 p-6 rounded-xl border-2 border-emerald-200 shadow-lg">
                  <div className="space-y-4 text-base font-normal leading-relaxed text-gray-700">
                    <p>
                      <strong className="text-emerald-700 font-bold">일주(日柱)</strong>는 나 자신의 핵심이자 배우자의 궁입니다.
                    </p>
                    <p>
                      <strong className="text-emerald-600 font-semibold">일간(日干)</strong>은 내{' '}
                      <strong className="text-emerald-700 font-bold">영혼</strong>을,{' '}
                      <strong className="text-emerald-600 font-semibold">일지(日支)</strong>는 내{' '}
                      <strong className="text-emerald-700 font-bold">몸과 배우자</strong>를 상징합니다.
                    </p>
                    <p>
                      일주를 통해 나의 본성과 배우자와의 인연, 그리고 인생의 안정감을 읽어낼 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 로딩 중 */}
              {iljuLoading && (
                <div className="bg-white/60 p-8 rounded-xl border border-emerald-200 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                  <p className="text-gray-700">일주 정보를 불러오는 중입니다...</p>
                </div>
              )}

              {/* 일주 정보 표시 */}
              {!iljuLoading && iljuData && (
                <div className="space-y-6">
                  {/* 일주 이름 및 특성 */}
                  <div className="text-center">
                    <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold mb-2">
                      나의 일주 (Day Pillar)
                    </div>
                    <h3 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2">
                      {iljuData.name || sajuData.pillars.day.ganji}
                    </h3>
                    <p className="text-lg text-gray-600 font-medium">
                      "{renderBoldMarkdown(iljuData.general.nature || '', 'font-extrabold text-emerald-800')}"
                    </p>
                  </div>

                  {/* 핵심 특징 */}
                  <div className="bg-white/80 p-6 rounded-xl border-2 border-emerald-200 shadow-lg">
                    <h4 className="text-xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
                      <span>💎</span> 핵심 특징
                    </h4>
                    <p className="text-base md:text-lg font-normal leading-relaxed text-gray-800 whitespace-pre-line">
                      {renderBoldMarkdown(iljuData.general.characteristic || '', 'font-extrabold text-emerald-800')}
                    </p>
                  </div>

                  {/* 배우자 */}
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border-2 border-pink-200 shadow-lg">
                    <h4 className="text-xl font-bold text-pink-700 mb-4 flex items-center gap-2">
                      <span>💕</span> 배우자
                    </h4>
                    <p className="text-base md:text-lg font-normal leading-relaxed text-gray-800 whitespace-pre-line">
                      {renderBoldMarkdown(iljuData.general.spouse || '', 'font-extrabold text-pink-900')}
                    </p>
                  </div>

                  {/* 직업 · 재물운 */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-200 shadow-lg">
                    <h4 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                      <span>💼</span> 직업 · 재물운
                    </h4>
                    <p className="text-base md:text-lg font-normal leading-relaxed text-gray-800 whitespace-pre-line">
                      {renderBoldMarkdown(iljuData.general.jobWealth || '', 'font-extrabold text-blue-900')}
                    </p>
                  </div>

                  {/* 족집게 조언 */}
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-xl border-2 border-amber-200 shadow-lg">
                    <h4 className="text-xl font-bold text-amber-700 mb-4 flex items-center gap-2">
                      <span>🍀</span> 족집게 조언
                    </h4>
                    <p className="text-base md:text-lg font-medium leading-relaxed text-gray-800 whitespace-pre-line">
                      {renderBoldMarkdown(iljuData.general.advice || '', 'font-extrabold text-emerald-800')}
                    </p>
                  </div>

                  {/* 더 자세히 보기 버튼 */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-200 text-center">
                    <p className="text-gray-700 mb-4">
                      더 자세한 일주 분석이 궁금하시다면 사주 분석 결과 페이지를 확인해보세요!
                    </p>
                    <button
                      onClick={() => {
                        setShowIljuModal(false);
                        navigate('/result');
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
                    >
                      사주 분석 결과로 이동 →
                    </button>
                  </div>
                </div>
              )}

              {/* 데이터 로드 실패 */}
              {!iljuLoading && !iljuData && (
                <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200 text-center">
                  <p className="text-gray-700 mb-2">일주 상세 정보를 불러올 수 없습니다.</p>
                  <p className="text-sm text-gray-600">사주 분석 결과 페이지에서 확인해주세요.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 사주원국 모달 */}
      {showSajuWongukModal && sajuData && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowSajuWongukModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 p-6 rounded-t-2xl flex justify-between items-center z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white">사주원국 - 나의 사주팔자</h2>
              <button
                onClick={() => setShowSajuWongukModal(false)}
                className="text-white hover:text-gray-200 transition"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-6 space-y-6">
              {/* 사주 원국 정보 제목 */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">사주 원국 정보</h3>
              </div>

              {/* 사주 4주 표시 - 기존 컴포넌트 재사용 */}
              <SajuPillarsDisplay sajuInfo={sajuData} />

              {/* 오행 개수, 월령, 천을귀인 - 기존 컴포넌트 재사용 */}
              <SajuInfoSummary sajuInfo={sajuData} />

              {/* 지지의 형충회합 */}
              <InteractionsDisplay sajuInfo={sajuData} />

              {/* 일간으로 보는 신살 */}
              <SinsalDisplay sajuInfo={sajuData} />

              {/* 오행의 기운 */}
              <OhaengEnergyDisplay
                ilganChar={sajuData.pillars.day.cheonGan.char}
                sajuInfo={sajuData}
              />

              {/* 일간(日干) - 나의 본질 */}
              <IlganPersonalityDisplay ilganChar={sajuData.pillars.day.cheonGan.char} />
            </div>
          </div>
        </div>
      )}

      {/* 월령 모달 */}
      {showWollyeongModal && sajuData && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowWollyeongModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-500 p-6 rounded-t-2xl flex justify-between items-center z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                월령(月令) - 운명의 사령관
              </h2>
              <button
                onClick={() => setShowWollyeongModal(false)}
                className="text-white hover:text-gray-200 transition"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-6 space-y-6">
              {/* 월령 소개 */}
              <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 rounded-xl border-2 border-purple-200 p-6">
                <div className="bg-white/80 p-6 rounded-xl border-2 border-purple-200 shadow-lg">
                  <div className="space-y-4 text-base font-normal leading-relaxed text-gray-700">
                    <p>
                      <strong className="text-purple-700 font-bold">월령(月令)</strong>은 사주 8글자 중에서 가장 강력한 권한을 가진 자리이자, 운명의 사령탑입니다.
                    </p>
                    <p>
                      내가 세상에 나올 때{' '}
                      <strong className="text-purple-600 font-semibold">자연으로부터 부여받은 '특명'</strong>과 같습니다.
                    </p>
                    <p>
                      봄의 생명력(木), 여름의 열정(火), 가을의 결실(金), 겨울의 지혜(水) 중 어떤 계절의 힘을 주무기로 삼아야 하는지를 결정합니다.
                    </p>
                    <div className="mt-4 space-y-2">
                      <p>
                        <strong className="text-purple-700 font-bold">운명의 뿌리:</strong>{' '}
                        나의 사회적 성공, 직업, 부귀빈천을 결정짓는{' '}
                        <strong className="text-purple-600 font-semibold">'격국(格局)'</strong>이 바로 이곳에서 탄생합니다.
                      </p>
                      <p>
                        <strong className="text-purple-700 font-bold">환경의 지배자:</strong>{' '}
                        내가 평생을 살아가며 활동해야 할 무대의 성격을 규정합니다.
                      </p>
                    </div>
                    <p className="mt-4 font-semibold text-purple-800">
                      월령을 장악했다는 것은, 내 인생의 주도권을 쥐고 세상의 흐름을 내 편으로 만들 준비가 되었음을 의미합니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 월령 정보 */}
              {(() => {
                const wollyeongSibsin = sajuData.pillars.month.jiJi.sibsin.name;
                const wollyeongChar = sajuData.pillars.month.jiJi.char;
                const wollyeongUnseong = sajuData.pillars.month.jiJi.unseong;

                return (
                  <div className="space-y-6">
                    {/* 월령 십신 */}
                    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6 rounded-2xl border-2 border-blue-300 shadow-lg">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-200">
                        <div className="bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold text-sm">
                          월령 (月令)
                        </div>
                        <h4 className="text-3xl font-bold text-blue-900">{wollyeongSibsin}</h4>
                        <div
                          className={`inline-flex items-center justify-center w-12 h-12 text-2xl font-bold rounded shadow-md ${
                            (() => {
                              const info = earthlyBranchGanInfo[wollyeongChar];
                              const color = info ? ohaengColorMap[info.ohaeng] : { bg: 'bg-gray-200', text: 'text-gray-800', border: 'border-gray-300' };
                              return `${color.bg} ${color.text} ${color.border}`;
                            })()
                          } saju-char-outline-small`}
                        >
                          {wollyeongChar}
                        </div>
                      </div>

                      {/* 월주 위치별 해석 */}
                      {sibsinPositionDescriptions[wollyeongSibsin] && (
                        <div className="bg-gradient-to-r from-blue-100/50 to-white p-5 rounded-xl border border-blue-300 mb-5">
                          <h5 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-xl">
                            <span>🎯</span> 월주에 위치한 의미
                          </h5>
                          <div className="space-y-3">
                            <p className="font-bold text-blue-800 text-lg">
                              {sibsinPositionDescriptions[wollyeongSibsin]['월주'].meaning}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {sibsinPositionDescriptions[wollyeongSibsin]['월주'].keywords.map((kw, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-blue-200 text-blue-900 rounded-full text-xs font-semibold"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                            <div className="text-base md:text-lg font-normal leading-relaxed text-gray-700 whitespace-pre-line bg-white/70 p-4 rounded-lg">
                              {sibsinPositionDescriptions[wollyeongSibsin]['월주'].detail}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 월주 십이운성 정보 */}
                      {unseongDescriptions[wollyeongUnseong.name] && (
                        <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-6 rounded-xl border-2 border-amber-200">
                          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-amber-200">
                            <div className="bg-amber-500 text-white px-3 py-1.5 rounded-lg font-bold text-sm">
                              십이운성 (十二運星)
                            </div>
                            <h4 className="text-2xl font-bold text-amber-900">
                              {wollyeongUnseong.name} ({wollyeongUnseong.hanja})
                            </h4>
                          </div>

                          <div className="bg-white/80 p-4 rounded-lg border border-amber-200 mb-4">
                            <h5 className="font-bold text-amber-800 mb-2 flex items-center gap-2 text-xl">
                              <span>⭐</span> {unseongDescriptions[wollyeongUnseong.name].title}
                            </h5>
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {unseongDescriptions[wollyeongUnseong.name].keywords.map((kw, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full text-xs font-semibold"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                            <p className="text-base md:text-lg font-normal leading-relaxed text-gray-700 whitespace-pre-line">
                              {unseongDescriptions[wollyeongUnseong.name].description}
                            </p>
                          </div>

                          {/* 월지 십이운성 정보 */}
                          {unseongDescriptions[wollyeongUnseong.name].월지 && (
                            <div className="bg-gradient-to-r from-blue-100/50 to-amber-100/50 p-5 rounded-xl border border-blue-300">
                              <h5 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-xl">
                                <span>🌙</span> {unseongDescriptions[wollyeongUnseong.name].월지.title}
                              </h5>
                              <p className="text-base md:text-lg font-normal leading-relaxed text-gray-700 whitespace-pre-line bg-white/70 p-4 rounded-lg">
                                {unseongDescriptions[wollyeongUnseong.name].월지.description}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 더 자세히 보기 버튼 */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-200 text-center">
                      <p className="text-gray-700 mb-4">
                        더 자세한 월령 분석이 궁금하시다면 심층 분석 페이지를 확인해보세요!
                      </p>
                      <button
                        onClick={() => {
                          setShowWollyeongModal(false);
                          navigate('/deep-analysis');
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-bold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg"
                      >
                        심층 분석으로 이동 →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 격국 모달 */}
      {showGyeokgukModal && sajuData && geokgukResult && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowGyeokgukModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-6 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white">격국(格局) 상세 정보</h2>
              <button
                onClick={() => setShowGyeokgukModal(false)}
                className="text-white hover:text-gray-200 transition"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-6 space-y-6">
              {/* 격국 소개 */}
              <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 rounded-xl border-2 border-indigo-200 p-6">
                <div className="max-w-4xl mx-auto space-y-4">
                  <div className="bg-white/70 p-5 rounded-xl border border-indigo-200">
                    <p className="text-base font-normal leading-relaxed text-gray-700 mb-4">
                      <strong className="text-indigo-700">격국(格局)</strong>은 인생이라는 전쟁터에서 승리하기 위해 지급받은{' '}
                      <strong className="text-indigo-700">'단 하나의 필살기'</strong>입니다.
                    </p>
                    <p className="text-base font-normal leading-relaxed text-gray-700 mb-4">
                      누구에게나 세상을 살아가는 도구가 주어집니다. 누군가는{' '}
                      <strong className="text-indigo-700">'말(언변)'</strong>이 무기이고, 누군가는{' '}
                      <strong className="text-indigo-700">'돈(재력)'</strong>이 무기이며, 누군가는{' '}
                      <strong className="text-indigo-700">'자격증(기술)'</strong>이 무기입니다.
                    </p>
                    <p className="text-base font-normal leading-relaxed text-gray-700">
                      남의 무기를 부러워하면 백전백패하지만, 내 격국에 맞는 무기를 갈고닦으면 반드시 정상에 오릅니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 격국 결과 */}
              {geokgukResult.판단가능 && geokgukResult.격국 ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-300 shadow-lg">
                    <div className="text-center mb-6">
                      <div className="inline-block px-4 py-2 bg-green-500 text-white rounded-full text-lg font-bold mb-3">
                        ✅ 당신의 격국
                      </div>
                      <h3 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2">
                        {geokgukResult.격국.격명칭}
                      </h3>
                    </div>

                    <div className="bg-white/80 p-5 rounded-xl border border-green-200 mb-4">
                      <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2 text-lg">
                        <span>📝</span> 해석
                      </h4>
                      <p className="text-gray-700 leading-relaxed text-base">
                        {geokgukResult.격국.해석}
                      </p>
                    </div>

                    {/* 격국 상세 설명 */}
                    {geokgukDescriptions[geokgukResult.격국.격명칭] && (
                      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border-2 border-indigo-200">
                        <h4 className="font-bold text-indigo-800 mb-4 flex items-center gap-2 text-xl">
                          <span>📚</span> {geokgukDescriptions[geokgukResult.격국.격명칭].title}
                        </h4>

                        <div className="mb-4">
                          <p className="text-gray-700 leading-relaxed text-base mb-3">
                            {geokgukDescriptions[geokgukResult.격국.격명칭].description}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-white/70 p-4 rounded-lg border border-indigo-100">
                            <h5 className="font-bold text-indigo-700 mb-2 flex items-center gap-2">
                              <span>✅</span> 장점
                            </h5>
                            <ul className="space-y-1">
                              {geokgukDescriptions[geokgukResult.격국.격명칭].characteristics.pros.map((item, idx) => (
                                <li key={idx} className="text-gray-700 text-sm">
                                  • {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-white/70 p-4 rounded-lg border border-indigo-100">
                            <h5 className="font-bold text-indigo-700 mb-2 flex items-center gap-2">
                              <span>⚠️</span> 주의점
                            </h5>
                            <ul className="space-y-1">
                              {geokgukDescriptions[geokgukResult.격국.격명칭].characteristics.cons.map((item, idx) => (
                                <li key={idx} className="text-gray-700 text-sm">
                                  • {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="bg-white/70 p-4 rounded-lg border border-indigo-100 mb-4">
                          <h5 className="font-bold text-indigo-700 mb-2 flex items-center gap-2">
                            <span>💼</span> 적합한 직업/분야
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {geokgukDescriptions[geokgukResult.격국.격명칭].suitableJobs.map((job, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold"
                              >
                                {job}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                          <h5 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                            <span>💡</span> 조언
                          </h5>
                          <p className="text-gray-800 text-sm leading-relaxed">
                            {geokgukDescriptions[geokgukResult.격국.격명칭].advice}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl border-2 border-yellow-300 shadow-lg">
                  <div className="text-center mb-4">
                    <div className="inline-block px-4 py-2 bg-yellow-500 text-white rounded-full text-lg font-bold mb-3">
                      ⚠️ 격국 판단 어려움
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-800 mb-2">
                      {geokgukResult.메시지 || '격국을 판단하기 어렵습니다'}
                    </h3>
                  </div>
                  {geokgukResult.이유 && geokgukResult.이유.length > 0 && (
                    <div className="bg-white/80 p-5 rounded-xl border border-yellow-200">
                      <h4 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                        <span>📋</span> 이유
                      </h4>
                      <ul className="space-y-2">
                        {geokgukResult.이유.map((reason, idx) => (
                          <li key={idx} className="text-gray-700 text-sm flex items-start gap-2">
                            <span className="text-yellow-600 mt-1">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 진짜 속마음 모달 */}
      {showJinjjaModal && sajuData && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowJinjjaModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-gradient-to-r from-pink-600 via-rose-600 to-red-500 p-6 rounded-t-2xl flex justify-between items-center z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white">나의 진짜 속마음</h2>
              <button
                onClick={() => setShowJinjjaModal(false)}
                className="text-white hover:text-gray-200 transition"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-6 space-y-6">
              {/* 로딩 중 */}
              {iljuLoading && (
                <div className="bg-white/60 p-8 rounded-xl border border-pink-200 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                  <p className="text-gray-700">일주 특별해설을 불러오는 중입니다...</p>
                </div>
              )}

              {/* 일주 정보 표시 */}
              {!iljuLoading && iljuData && (
                <div className="space-y-6">
                  {/* 십성 특별해설 */}
                  {iljuData.ilji?.sibsin?.special_analysis && (
                    <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 rounded-2xl border-2 border-pink-300 p-6 shadow-lg">
                      <div className="bg-white/80 p-6 rounded-xl border-2 border-pink-200 shadow-inner">
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-pink-200">
                          <span className="text-3xl">💖</span>
                          <h3 className="text-2xl font-bold text-pink-800">
                            십성 특별해설: {iljuData.ilji.sibsin.name}
                          </h3>
                        </div>
                        <h4 className="text-xl font-bold text-pink-900 mb-4">
                          {iljuData.ilji.sibsin.special_analysis.title}
                        </h4>
                        <div className="text-base md:text-lg font-normal leading-relaxed text-gray-800 whitespace-pre-line">
                          {renderBoldMarkdown(iljuData.ilji.sibsin.special_analysis.description || '', 'font-extrabold text-pink-900')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 십이운성 특별해설 */}
                  {iljuData.ilji?.unseong && (
                    <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-2xl border-2 border-amber-300 p-6 shadow-lg">
                      <div className="bg-white/80 p-6 rounded-xl border-2 border-amber-200 shadow-inner">
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-amber-200">
                          <span className="text-3xl">✨</span>
                          <h3 className="text-2xl font-bold text-amber-800">
                            십이운성 특별해설: {iljuData.ilji.unseong.name} ({iljuData.ilji.unseong.hanja})
                          </h3>
                        </div>
                        <h4 className="text-xl font-bold text-amber-900 mb-4">
                          {iljuData.ilji.unseong.title}
                        </h4>

                        {/* 키워드 */}
                        {iljuData.ilji.unseong.keywords && iljuData.ilji.unseong.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {iljuData.ilji.unseong.keywords.map((keyword, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-amber-200 text-amber-900 rounded-full text-sm font-semibold"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* 설명 */}
                        <div className="text-base md:text-lg font-normal leading-relaxed text-gray-800 whitespace-pre-line">
                          {renderBoldMarkdown(iljuData.ilji.unseong.description || '', 'font-extrabold text-amber-900')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 더 자세히 보기 버튼 */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-200 text-center">
                    <p className="text-gray-700 mb-4">
                      더 자세한 일주 분석이 궁금하시다면 사주 분석 결과 페이지를 확인해보세요!
                    </p>
                    <button
                      onClick={() => {
                        setShowJinjjaModal(false);
                        navigate('/result');
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
                    >
                      사주 분석 결과로 이동 →
                    </button>
                  </div>
                </div>
              )}

              {/* 데이터 로드 실패 */}
              {!iljuLoading && !iljuData && (
                <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200 text-center">
                  <p className="text-gray-700 mb-2">일주 특별해설 정보를 불러올 수 없습니다.</p>
                  <p className="text-sm text-gray-600">사주 분석 결과 페이지에서 확인해주세요.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 푸터 */}
      <Footer />
    </div>
  );
};

export default DashboardPage;
