/**
 * 타로 카드 섹션 컴포넌트 (DashboardPage에서 추출)
 *
 * 이 파일은 대시보드에 통합되었던 타로 카드 기능의 백업입니다.
 * 별도의 타로 앱 개발시 참고용으로 사용할 수 있습니다.
 */

import React, { useState, useEffect } from 'react';
import type { TarotCard } from '../utils/tarot/types';
import { loadTarotCard, getAvailableCardIds } from '../utils/tarot/loadTarotCard';
import { getTodayDrawRecord, saveTodayDraw } from '../utils/tarot/dailyDrawChecker';

export const TarotCardSection: React.FC = () => {
  // 타로 카드 관련 state
  const [showTarotDrawing, setShowTarotDrawing] = useState<boolean>(false);
  const [showTarotResult, setShowTarotResult] = useState<boolean>(false);
  const [drawStage, setDrawStage] = useState<'shuffle' | 'gather' | 'spread' | 'flip'>('shuffle');
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [todayDrawnCard, setTodayDrawnCard] = useState<TarotCard | null>(null);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

  // 페이지 로드 시 오늘 뽑은 타로 카드 확인
  useEffect(() => {
    const record = getTodayDrawRecord();
    if (record) {
      loadTarotCard(record.cardId).then(card => {
        if (card) setTodayDrawnCard(card);
      });
    }
  }, []);

  // 타로 카드 클릭 핸들러 (테스트용 - 항상 새로 뽑기)
  const handleTarotCardClick = () => {
    setShowTarotDrawing(true);
    setDrawStage('shuffle');
    setSelectedCardIndex(null);

    setTimeout(() => {
      setDrawStage('gather');
    }, 2000);

    setTimeout(() => {
      setDrawStage('spread');
    }, 3000);
  };

  // 카드 선택 핸들러
  const handleCardSelect = (index: number, event: React.MouseEvent<HTMLDivElement>) => {
    const availableIds = getAvailableCardIds();
    const randomId = availableIds[Math.floor(Math.random() * availableIds.length)];

    setSelectedCardIndex(index);

    const cardElement = event.currentTarget;
    const rect = cardElement.getBoundingClientRect();
    const screenCenterX = window.innerWidth / 2;
    const cardCenterX = rect.left + rect.width / 2;
    const moveX = screenCenterX - cardCenterX;

    cardElement.style.setProperty('--move-x', `${moveX}px`);
    cardElement.classList.add('card-selected');

    setTimeout(() => {
      loadTarotCard(randomId).then(card => {
        if (card) {
          setSelectedCard(card);
          setDrawStage('flip');
          setIsFlipped(true);
          setTodayDrawnCard(card);

          setTimeout(() => {
            setShowTarotDrawing(false);
            setShowTarotResult(true);
            setIsFlipped(false);
            setSelectedCardIndex(null);
          }, 3500);
        }
      }).catch(error => {
        console.error('카드 로드 실패:', error);
        setShowTarotDrawing(false);
      });
    }, 800);
  };

  return (
    <>
      {/* 타로 카드 섹션 */}
      <div
        onClick={handleTarotCardClick}
        className="group relative bg-gradient-to-br from-purple-100 via-indigo-100 to-violet-100 rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-purple-200 hover:border-indigo-300 w-full md:w-80"
      >
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200/50 to-indigo-200/50 rounded-full blur-2xl group-hover:blur-3xl transition-all"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-violet-200/50 to-purple-200/50 rounded-full blur-2xl group-hover:blur-3xl transition-all"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-4xl animate-sparkle">🔮</div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              오늘의 타로 운세
            </h3>
          </div>
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            오늘 나에게 필요한<br />
            <span className="font-semibold text-purple-700">특별한 메시지</span>를 받아보세요 ✨
          </p>

          {todayDrawnCard ? (
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                <span className="text-2xl">⭐</span>
                <span className="text-sm text-purple-600 font-semibold">
                  {todayDrawnCard.name_ko}
                </span>
              </div>
              <div className="flex items-center gap-1 text-purple-600 font-semibold text-sm group-hover:gap-2 transition-all">
                <span>다시보기</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                <span className="text-2xl">🌙</span>
                <span className="text-2xl">✨</span>
                <span className="text-2xl">🌟</span>
              </div>
              <div className="flex items-center gap-1 text-purple-600 font-semibold text-sm group-hover:gap-2 transition-all">
                <span>카드 뽑기</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="absolute top-4 right-4 w-2 h-2 bg-purple-300 rounded-full animate-ping"></div>
        <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-indigo-300 rounded-full animate-pulse"></div>
      </div>

      {/* 타로 뽑기 애니메이션 오버레이 */}
      {showTarotDrawing && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center animate-fade-in">
          {/* Stage 1: Shuffle */}
          {drawStage === 'shuffle' && (
            <div className="text-center">
              <p className="text-white text-3xl mb-12 animate-pulse font-bold">
                ✨ 카드를 섞고 있습니다 ✨
              </p>
              <div className="relative w-full flex justify-center items-center h-64">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-32 h-48 bg-gradient-to-br from-purple-900 via-indigo-900 to-violet-900 rounded-xl shadow-2xl flex items-center justify-center text-7xl border-4 border-purple-500/30 card-shuffle"
                    style={{
                      animationDelay: `${i * 0.15}s`,
                      transform: `rotate(${i * 45}deg)`,
                    }}
                  >
                    🔮
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stage 2: Gather */}
          {drawStage === 'gather' && (
            <div className="text-center">
              <p className="text-white text-3xl mb-12 font-bold animate-pulse">
                🌙 집중하세요 🌙
              </p>
              <div className="relative w-full flex justify-center items-center h-64">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-32 h-48 bg-gradient-to-br from-purple-900 via-indigo-900 to-violet-900 rounded-xl shadow-2xl flex items-center justify-center text-7xl border-4 border-purple-500/30 card-gather"
                    style={{
                      animationDelay: `${i * 0.05}s`,
                    }}
                  >
                    🔮
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stage 3: Spread */}
          {drawStage === 'spread' && (
            <div className="text-center">
              <p className="text-white text-3xl mb-12 font-bold">
                💫 마음에 와닿는 카드를 선택하세요 💫
              </p>
              <div className="flex gap-8 justify-center items-center">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    onClick={(e) => handleCardSelect(i, e)}
                    className="w-32 h-48 cursor-pointer bg-gradient-to-br from-purple-900 via-indigo-900 to-violet-900 rounded-xl shadow-2xl hover:shadow-purple-500/70 flex items-center justify-center text-7xl border-4 border-purple-500/30 hover:border-yellow-400/80 card-spread"
                    style={{
                      animationDelay: `${i * 0.1}s`,
                    }}
                  >
                    🔮
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stage 4: Flip */}
          {drawStage === 'flip' && selectedCard && (
            <div className="text-center relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[500px] h-[500px] bg-gradient-radial from-yellow-300/30 via-purple-500/20 to-transparent rounded-full animate-pulse-slow blur-3xl"></div>
              </div>

              <div className="flip-card-zoom relative z-10">
                <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
                  <div className="flip-card-front bg-gradient-to-br from-purple-900 via-indigo-900 to-violet-900 rounded-xl shadow-2xl flex items-center justify-center text-9xl border-4 border-purple-500/50">
                    🔮
                  </div>
                  <div className="flip-card-back bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 rounded-xl shadow-2xl flex flex-col items-center justify-center p-8 text-white border-4 border-yellow-400/80">
                    <div className="text-8xl mb-6 animate-sparkle">✨</div>
                    <div className="text-5xl font-extrabold mb-4 text-shadow-glow">{selectedCard.name_ko}</div>
                    <div className="text-2xl font-semibold text-yellow-200">{selectedCard.name_en}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 타로 결과 모달 */}
      {showTarotResult && selectedCard && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowTarotResult(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 p-6 rounded-t-2xl flex justify-between items-center z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white">오늘의 타로 카드</h2>
              <button
                onClick={() => setShowTarotResult(false)}
                className="text-white hover:text-gray-200 transition"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="w-48 h-72 mx-auto rounded-xl shadow-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex flex-col items-center justify-center text-white">
                  <div className="text-8xl mb-4">✨</div>
                  <div className="text-3xl font-bold">{selectedCard.name_ko}</div>
                  <div className="text-lg mt-2">{selectedCard.name_en}</div>
                </div>
              </div>

              <div className="text-center">
                <div className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold mb-2">
                  {selectedCard.name_en}
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
                  {selectedCard.name_ko}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {selectedCard.keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-full text-sm font-semibold border border-purple-200"
                  >
                    {keyword}
                  </span>
                ))}
              </div>

              <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-50 p-6 rounded-xl border-2 border-purple-200 shadow-lg">
                <h4 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                  <span>💫</span> 오늘의 메시지
                </h4>
                <p className="text-base md:text-lg font-normal leading-relaxed text-gray-800 whitespace-pre-line">
                  {selectedCard.upright.message}
                </p>
              </div>

              <div className="bg-white/80 p-6 rounded-xl border-2 border-gray-200 shadow-lg">
                <h4 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <span>💡</span> 실천 조언
                </h4>
                <p className="text-base font-normal leading-relaxed text-gray-800">
                  {selectedCard.upright.advice}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
