import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SajuInfo } from '../types';
import { getDayGanjiByYMD, getUnseongByIlganAndJiji, getSibsinByIlganAndTarget } from '../utils/manse';
import { getTodayStoryFortune } from '../utils/todayUnse';
import type { GeneratedFortune } from '../utils/fortuneTemplate';

/**
 * 캘린더 테스트 페이지
 * 날짜와 일주를 선택해서 운세 생성을 테스트
 */
const CalendarTestPage: React.FC = () => {
  const navigate = useNavigate();

  // 60개 일주 목록
  const ILJU_LIST = [
    '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
    '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
    '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
    '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
    '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
    '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥',
  ];

  const [selectedIlju, setSelectedIlju] = useState<string>('己丑');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [fortune, setFortune] = useState<GeneratedFortune | null>(null);
  const [loading, setLoading] = useState(false);

  // 테스트용 샘플 사주 데이터 생성
  const createTestSajuData = (ilju: string): SajuInfo => {
    const ilgan = ilju[0];
    const ilji = ilju[1];

    return {
      name: "테스트",
      gender: "남",
      birthDate: new Date(1990, 0, 1),
      birthTime: "자시",
      isLunar: false,
      pillars: {
        year: {
          cheonGan: { char: "庚", ohaeng: "metal" },
          jiJi: { char: "午", ohaeng: "fire" },
          ganji: "庚午"
        },
        month: {
          cheonGan: { char: "丁", ohaeng: "fire" },
          jiJi: { char: "丑", ohaeng: "earth" },
          ganji: "丁丑"
        },
        day: {
          cheonGan: { char: ilgan, ohaeng: "earth" },
          jiJi: { char: ilji, ohaeng: "earth" },
          ganji: ilju
        },
        time: {
          cheonGan: { char: "甲", ohaeng: "wood" },
          jiJi: { char: "子", ohaeng: "water" },
          ganji: "甲子"
        }
      },
      sipsin: {
        year: { cheonGan: "편관", jiJi: "편인" },
        month: { cheonGan: "정인", jiJi: "비견" },
        day: { cheonGan: "일주", jiJi: "일주" },
        time: { cheonGan: "편재", jiJi: "정관" }
      },
      sibioonseong: {
        year: { value: "목욕" },
        month: { value: "양" },
        day: { value: "양" },
        time: { value: "절" }
      },
      gyeokguk: {
        name: "신약",
        description: "일간의 힘이 약한 격국"
      },
      yongsin: {
        hee: ["土", "火"],
        gi: ["木", "水", "金"]
      }
    };
  };

  // 운세 생성
  const generateFortune = async () => {
    setLoading(true);
    try {
      const sajuData = createTestSajuData(selectedIlju);
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const day = selectedDate.getDate();

      // 오늘 일주 계산
      const { ji } = getDayGanjiByYMD(year, month, day);

      // 일간으로 십이운성 계산
      const ilgan = selectedIlju[0];
      const unseong = getUnseongByIlganAndJiji(ilgan, ji);

      console.log('🔍 운세 생성 정보:', {
        ilju: selectedIlju,
        date: `${year}-${month}-${day}`,
        todayJiji: ji,
        unseong: unseong.name,
      });

      const generatedFortune = await getTodayStoryFortune(
        sajuData,
        ji,
        unseong.name,
        undefined,  // userBirthday
        selectedDate  // targetDate - 선택한 날짜로 운세 생성
      );

      console.log('✅ 생성된 운세:', generatedFortune);
      setFortune(generatedFortune);
    } catch (error) {
      console.error('❌ 운세 생성 실패:', error);
      alert('운세 생성에 실패했습니다. 콘솔을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 일주나 날짜 변경 시 자동으로 운세 생성
  useEffect(() => {
    generateFortune();
  }, [selectedIlju, selectedDate]);

  // 에너지 개수 계산
  const getEnergyCount = (level: 'high' | 'medium' | 'low' | 'active' | 'moderate' | 'rest' | undefined): number => {
    if (!level) return 0;
    if (level === 'high' || level === 'active') return 3;
    if (level === 'medium' || level === 'moderate') return 2;
    return 1;
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                운세 생성 테스트
              </h1>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition text-sm font-bold border border-indigo-200"
            >
              대시보드로
            </button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8 pb-8">
        {/* 컨트롤 패널 */}
        <div className="mb-6 p-6 bg-white rounded-2xl border-2 border-purple-200 shadow-lg">
          <h2 className="text-xl font-bold text-purple-800 mb-4">🎯 테스트 설정</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 일주 선택 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                일주 선택
              </label>
              <select
                value={selectedIlju}
                onChange={(e) => setSelectedIlju(e.target.value)}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg text-lg font-bold text-purple-700 focus:border-purple-400 focus:outline-none"
              >
                {ILJU_LIST.map((ilju) => (
                  <option key={ilju} value={ilju}>
                    {ilju}
                  </option>
                ))}
              </select>
            </div>

            {/* 날짜 선택 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                날짜 선택
              </label>
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg text-lg font-bold text-purple-700 focus:border-purple-400 focus:outline-none"
              />
            </div>
          </div>

          {/* 재생성 버튼 */}
          <button
            onClick={generateFortune}
            disabled={loading}
            className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50"
          >
            {loading ? '생성 중...' : '🔄 운세 다시 생성'}
          </button>
        </div>

        {/* 운세 결과 */}
        {fortune && (
          <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-2xl border-2 border-purple-200 shadow-lg">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h3 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                {fortune.title}
              </h3>
              <div className="flex items-center gap-4">
                {/* 활동 에너지 */}
                <div className="flex flex-col items-center gap-1 bg-white/70 px-4 py-2 rounded-lg border border-red-200">
                  <span className="text-xs font-semibold text-gray-600">활동 에너지</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 3 }, (_, i) => (
                      <span
                        key={i}
                        className="text-2xl transition-all duration-300"
                        style={{ opacity: i < getEnergyCount(fortune.activityLevel) ? 1 : 0.2 }}
                      >
                        🔥
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{fortune.activityLevel}</span>
                </div>
                {/* 마음 에너지 */}
                <div className="flex flex-col items-center gap-1 bg-white/70 px-4 py-2 rounded-lg border border-blue-200">
                  <span className="text-xs font-semibold text-gray-600">마음 에너지</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 3 }, (_, i) => (
                      <span
                        key={i}
                        className="text-2xl transition-all duration-300"
                        style={{ opacity: i < getEnergyCount(fortune.energyLevel) ? 1 : 0.2 }}
                      >
                        💎
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{fortune.energyLevel}</span>
                </div>
              </div>
            </div>

            {/* 운세 내용 */}
            <div
              className="prose prose-lg max-w-none mb-4 bg-white/50 p-6 rounded-lg"
              dangerouslySetInnerHTML={{ __html: fortune.content }}
            />

            {/* 액션 플랜 */}
            {fortune.actionPlans && fortune.actionPlans.length > 0 && (
              <div className="bg-white/70 p-6 rounded-lg border border-purple-200">
                <h4 className="text-xl font-bold text-purple-800 mb-4">⚡ 오늘의 액션 플랜</h4>
                <ul className="space-y-3">
                  {fortune.actionPlans.map((plan, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700 text-lg">
                      <span className="text-purple-600 font-bold flex-shrink-0 text-xl">{idx + 1}.</span>
                      <span className="font-medium">{plan}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 디버깅 정보 */}
        {fortune && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <details>
              <summary className="font-bold text-gray-700 cursor-pointer hover:text-indigo-600 mb-2">
                🔍 운세 데이터 상세 (개발자용)
              </summary>
              <div className="mt-3 space-y-2">
                <div className="p-3 bg-white rounded">
                  <div className="text-sm font-bold text-gray-600 mb-1">선택 정보</div>
                  <div className="text-sm text-gray-700">
                    <div>일주: <span className="font-bold">{selectedIlju}</span></div>
                    <div>날짜: <span className="font-bold">{selectedDate.toLocaleDateString('ko-KR')}</span></div>
                  </div>
                </div>
                <pre className="p-4 bg-white rounded-lg text-xs overflow-auto max-h-96">
                  {JSON.stringify(fortune, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}
      </main>

      <footer className="text-center mt-16 text-sm text-gray-500 pb-8">
        <p>아사주달 운세 생성 테스트 페이지</p>
      </footer>
    </div>
  );
};

export default CalendarTestPage;
