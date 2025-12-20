import React, { useMemo, useState, useEffect } from "react";
import type { SajuInfo, Ohaeng } from "../types";
import {
  earthlyBranchGanInfo,
  getDayGanjiByYMD,
  getMonthGanjiByDateKST,
  getUnseongByIlganAndJiji,
  getSibsinByIlganAndTarget,
} from "../utils/manse";
import { cheonEulGwiInMap, getGongmangByGanji } from "../utils/sinsal";
import { getTodayUnseData, type TodayUnseData } from "../utils/todayUnse";

const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"] as const;
const weekdayFullLabels = [
  "일요일",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
] as const;

const ohaengColorMap: Record<Ohaeng, { bg: string; text: string; border?: string }> =
  {
    wood: { bg: "bg-[#00B050]", text: "text-white", border: "border border-gray-800" },
    fire: { bg: "bg-[#FF0000]", text: "text-white", border: "border border-gray-800" },
    earth: { bg: "bg-[#FEC100]", text: "text-white", border: "border border-gray-800" },
    metal: { bg: "bg-slate-200", text: "text-white", border: "border border-gray-800" },
    water: { bg: "bg-black", text: "text-white", border: "border border-gray-800" },
  };

const buildDateKST = (year: number, month: number, day: number) => {
  const isoStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}T00:00:00+09:00`;
  return new Date(isoStr);
};

const MIN_YEAR = 1940;
const MIN_MONTH = 2; // 1940년 1월은 이전 사주연도(1939) 절기 데이터가 없어 월주 계산이 불가
const MAX_YEAR = 2050;
const MAX_MONTH = 12;

const clampYearMonth = (year: number, month: number) => {
  let y = year;
  let m = month;
  if (y < MIN_YEAR) {
    y = MIN_YEAR;
    m = MIN_MONTH;
  }
  if (y === MIN_YEAR && m < MIN_MONTH) m = MIN_MONTH;
  if (y > MAX_YEAR) {
    y = MAX_YEAR;
    m = MAX_MONTH;
  }
  if (y === MAX_YEAR && m > MAX_MONTH) m = MAX_MONTH;
  return { year: y, month: m };
};

const addMonths = (year: number, month: number, delta: number) => {
  const idx = year * 12 + (month - 1) + delta;
  const y = Math.floor(idx / 12);
  const m = (idx % 12) + 1;
  return { year: y, month: m };
};

const SmallCharBox: React.FC<{ char: string }> = ({ char }) => {
  const info = earthlyBranchGanInfo[char];
  if (!info) return null;
  const color = ohaengColorMap[info.ohaeng];

  return (
    <div
      className={`saju-char-outline-small w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-lg md:text-xl font-bold rounded-md shadow-sm ${color.bg} ${color.text} ${
        color.border ?? ""
      }`}
    >
      {char}
    </div>
  );
};

// 사주 원국 박스와 유사한 큼직한 크기(달력 셀 일주 표시용)
const BigCharBox: React.FC<{ char: string }> = ({ char }) => {
  const info = earthlyBranchGanInfo[char];
  if (!info) return null;
  const color = ohaengColorMap[info.ohaeng];

  return (
    <div
      className={`saju-char-outline-small w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-2xl md:text-3xl font-bold rounded-md shadow-md ${color.bg} ${color.text} ${
        color.border ?? ""
      }`}
    >
      {char}
    </div>
  );
};

// 캘린더 셀 내부용: BigCharBox보다 한 단계 작은 크기
const CalendarCharBox: React.FC<{ char: string }> = ({ char }) => {
  const info = earthlyBranchGanInfo[char];
  if (!info) return null;
  const color = ohaengColorMap[info.ohaeng];

  return (
    <div
      className={`saju-char-outline-small w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-xl md:text-2xl font-bold rounded-md shadow-md ${color.bg} ${color.text} ${
        color.border ?? ""
      }`}
    >
      {char}
    </div>
  );
};
export const MonthlyIljuCalendar: React.FC<{ sajuInfo: SajuInfo }> = ({
  sajuInfo,
}) => {
  const ilgan = sajuInfo.pillars.day.cheonGan.char;
  const ilganji = sajuInfo.pillars.day.ganji;
  const cheonEulJijis = useMemo(() => cheonEulGwiInMap[ilgan] || [], [ilgan]);
  const gongmangJijis = useMemo(() => getGongmangByGanji(ilganji), [ilganji]);

  const today = new Date();
  const initialYM = clampYearMonth(today.getFullYear(), today.getMonth() + 1);
  const [viewYear, setViewYear] = useState<number>(initialYM.year);
  const [viewMonth, setViewMonth] = useState<number>(initialYM.month); // 1-12
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
  const [todayUnseData, setTodayUnseData] = useState<TodayUnseData | null>(null);

  // 체크박스 상태 관리 (localStorage 연동)
  // localStorage에서 초기값 직접 로드 (기본값: 천을귀인 true, 용신 false)
  const [showCheonEul, setShowCheonEul] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('calendar-display-options');
      if (saved) {
        const options = JSON.parse(saved);
        return options.showCheonEul ?? true; // 기본값 true
      }
      return true; // localStorage에 값이 없으면 true
    } catch (error) {
      console.error('Failed to load calendar display options:', error);
      return true; // 에러 시에도 true
    }
  });

  const [showYongsin, setShowYongsin] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('calendar-display-options');
      if (saved) {
        const options = JSON.parse(saved);
        return options.showYongsin ?? false; // 기본값 false
      }
      return false; // localStorage에 값이 없으면 false
    } catch (error) {
      console.error('Failed to load calendar display options:', error);
      return false; // 에러 시에도 false
    }
  });

  // localStorage에 저장
  useEffect(() => {
    try {
      const options = {
        showCheonEul,
        showYongsin,
      };
      localStorage.setItem('calendar-display-options', JSON.stringify(options));
    } catch (error) {
      console.error('Failed to save calendar display options:', error);
    }
  }, [showCheonEul, showYongsin]);

  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth, 0).getDate();
  }, [viewYear, viewMonth]);

  const firstDow = useMemo(() => {
    return new Date(viewYear, viewMonth - 1, 1).getDay();
  }, [viewYear, viewMonth]);

  const selectedDate = useMemo(
    () => buildDateKST(viewYear, viewMonth, Math.min(selectedDay, daysInMonth)),
    [viewYear, viewMonth, selectedDay, daysInMonth]
  );

  const headerText = useMemo(() => {
    const d = selectedDate.getDate();
    const dow = selectedDate.getDay();
    return `${viewMonth}월 ${d}일 ${weekdayFullLabels[dow]}`;
  }, [selectedDate, viewMonth]);

  const selectedDayInfo = useMemo(() => {
    const d = Math.min(selectedDay, daysInMonth);
    const { gan, ji, ganji } = getDayGanjiByYMD(viewYear, viewMonth, d);
    const unseong = getUnseongByIlganAndJiji(ilgan, ji);
    const sibsinGan = getSibsinByIlganAndTarget(ilgan, gan);
    const sibsinJi = getSibsinByIlganAndTarget(ilgan, ji);
    return { d, gan, ji, ganji, unseong, sibsinGan, sibsinJi };
  }, [ilgan, viewYear, viewMonth, selectedDay, daysInMonth]);

  // 선택된 날짜의 운세 데이터 로드
  useEffect(() => {
    const loadUnseData = async () => {
      if (sajuInfo && selectedDayInfo && selectedDayInfo.unseong) {
        const unseData = await getTodayUnseData(sajuInfo, selectedDayInfo.ji, selectedDayInfo.unseong.name);
        setTodayUnseData(unseData);
      }
    };
    loadUnseData();
  }, [sajuInfo, selectedDayInfo]);

  const selectedMonthInfo = useMemo(() => {
    try {
      return getMonthGanjiByDateKST(selectedDate);
    } catch {
      return null;
    }
  }, [selectedDate]);

  const canPrev = useMemo(() => {
    if (viewYear > MIN_YEAR) return true;
    return viewYear === MIN_YEAR && viewMonth > MIN_MONTH;
  }, [viewYear, viewMonth]);

  const canNext = useMemo(() => {
    if (viewYear < MAX_YEAR) return true;
    return viewYear === MAX_YEAR && viewMonth < MAX_MONTH;
  }, [viewYear, viewMonth]);

  const goPrevMonth = () => {
    if (!canPrev) return;
    const moved = addMonths(viewYear, viewMonth, -1);
    const nextYM = clampYearMonth(moved.year, moved.month);
    setViewYear(nextYM.year);
    setViewMonth(nextYM.month);
  };

  const goNextMonth = () => {
    if (!canNext) return;
    const moved = addMonths(viewYear, viewMonth, 1);
    const nextYM = clampYearMonth(moved.year, moved.month);
    setViewYear(nextYM.year);
    setViewMonth(nextYM.month);
  };

  const cells = useMemo(() => {
    const total = firstDow + daysInMonth;
    const padded = Math.ceil(total / 7) * 7;
    return Array.from({ length: padded }, (_, idx) => {
      const day = idx - firstDow + 1;
      if (day < 1 || day > daysInMonth) return null;
      const { gan, ji } = getDayGanjiByYMD(viewYear, viewMonth, day);
      const unseong = getUnseongByIlganAndJiji(ilgan, ji);
      const isCheonEul = cheonEulJijis.includes(ji);
      const isGongmang = gongmangJijis.includes(ji);
      return { day, gan, ji, unseong, isCheonEul, isGongmang };
    });
  }, [firstDow, daysInMonth, viewYear, viewMonth, ilgan, cheonEulJijis, gongmangJijis]);

  return (
    <div className="mt-8 p-4 md:p-6 glass-card animate-fade-in">
      {/* 헤더(선택 날짜 + 일주 + 월주) */}
      <div className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-4 md:p-6 mb-6 shadow-lg border-2 border-indigo-200">
        {/* 배경 장식 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex items-center justify-between gap-3 flex-wrap">
          {/* 왼쪽: 날짜 */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <div className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 whitespace-nowrap">
              {headerText}
            </div>
          </div>

          {/* 중앙: 일주 */}
          <div className="flex items-center justify-center gap-2 flex-wrap bg-white/60 backdrop-blur-sm rounded-xl px-4 py-3 shadow-md border border-purple-200">
            <span className="text-sm md:text-base font-semibold text-gray-700 whitespace-nowrap">
              ({selectedDayInfo.sibsinGan.name})
            </span>
            <BigCharBox char={selectedDayInfo.gan} />
            <BigCharBox char={selectedDayInfo.ji} />
            <span className="text-sm md:text-base font-semibold text-gray-700 whitespace-nowrap">
              ({selectedDayInfo.sibsinJi.name}) ({selectedDayInfo.unseong.name})
            </span>
          </div>

          {/* 오른쪽: 월주 + 이전/다음 버튼 */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 md:p-4 flex flex-col justify-center min-w-[200px] shadow-md border border-indigo-200">
            <div className="flex items-center justify-between gap-2 mb-2">
              <button
                type="button"
                onClick={goPrevMonth}
                disabled={!canPrev}
                className={`px-3 py-1.5 rounded-lg border text-sm font-bold transition-all ${
                  canPrev
                    ? "border-indigo-300 bg-white hover:bg-indigo-50 text-indigo-700 hover:shadow-md"
                    : "border-gray-200 bg-gray-100/60 text-gray-400 cursor-not-allowed"
                }`}
                aria-label="이전 달"
              >
                ‹
              </button>
              <div className="text-indigo-700 font-bold text-sm md:text-base whitespace-nowrap">
                {viewYear}년 {viewMonth}월
              </div>
              <button
                type="button"
                onClick={goNextMonth}
                disabled={!canNext}
                className={`px-3 py-1.5 rounded-lg border text-sm font-bold transition-all ${
                  canNext
                    ? "border-indigo-300 bg-white hover:bg-indigo-50 text-indigo-700 hover:shadow-md"
                    : "border-gray-200 bg-gray-100/60 text-gray-400 cursor-not-allowed"
                }`}
                aria-label="다음 달"
              >
                ›
              </button>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-xs md:text-sm justify-center">
              <span className="font-semibold text-gray-700 whitespace-nowrap">월주:</span>
              {selectedMonthInfo?.monthGanji ? (
                <>
                  <SmallCharBox char={selectedMonthInfo.monthGanji[0]} />
                  <SmallCharBox char={selectedMonthInfo.monthGanji[1]} />
                </>
              ) : (
                <span className="font-semibold text-gray-800">-</span>
              )}
              {selectedMonthInfo?.monthName ? (
                <span className="text-gray-500">({selectedMonthInfo.monthName})</span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1.5 mb-3">
        {weekdayLabels.map((w, idx) => (
          <div
            key={w}
            className={`text-center text-sm md:text-base font-extrabold py-3 rounded-lg shadow-sm border tracking-wide ${
              idx === 0
                ? 'bg-gradient-to-br from-red-50 to-pink-50 text-red-600 border-red-200'
                : idx === 6
                ? 'bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 border-blue-200'
                : 'bg-gradient-to-br from-gray-50 to-slate-50 text-gray-700 border-gray-200'
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell, idx) => {
          if (!cell) {
            return (
              <div
                key={`empty-${idx}`}
                className="h-[92px] md:h-[108px] rounded-lg bg-gray-100/30"
              />
            );
          }

          const isSelected = cell.day === selectedDayInfo.d;

          // 표시할 특성 계산
          const displayCheonEul = showCheonEul && cell.isCheonEul;

          // 테두리 및 그림자 스타일 결정
          let borderClass = "";
          let shadowClass = "";
          let bgClass = "";

          if (isSelected) {
            // 선택된 셀
            borderClass = "border-blue-800 border-2 ring-2 ring-blue-400";
            shadowClass = "shadow-lg";
            bgClass = "bg-blue-200/70";
          } else if (displayCheonEul) {
            // 천을귀인 (화려하게)
            borderClass = "border-4 border-yellow-400";
            shadowClass = "shadow-lg shadow-yellow-300/50";
            bgClass = "bg-gradient-to-br from-yellow-50/80 to-amber-50/60";
          } else {
            // 기본
            borderClass = "border-gray-200";
            bgClass = "bg-white/60 hover:bg-white";
          }

          return (
            <button
              key={`${viewYear}-${viewMonth}-${cell.day}`}
              type="button"
              onClick={() => setSelectedDay(cell.day)}
              className={`h-[92px] md:h-[108px] rounded-lg border transition-all overflow-hidden ${borderClass} ${shadowClass} ${bgClass}`}
            >
              <div className="h-full grid grid-cols-[56px_44px] grid-rows-2 justify-center items-center">
                {/* 좌측: 일주 */}
                <div className="row-span-2 flex flex-col items-center justify-center gap-1 bg-white/30">
                  <CalendarCharBox char={cell.gan} />
                  <CalendarCharBox char={cell.ji} />
                </div>

                {/* 우측 상단: 날짜 */}
                <div className="flex items-start justify-center pt-1 text-sm font-extrabold text-gray-800">
                  {cell.day}
                </div>

                {/* 우측 하단: 십이운성 */}
                <div className="flex items-end justify-center pb-1 text-xs md:text-sm font-bold text-gray-700">
                  {cell.unseong.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 달력 표시 옵션 & 범례 */}
      <div className="mt-6 p-4 md:p-6 bg-white/70 rounded-lg border-2 border-indigo-200 shadow-lg">
        <div className="text-base md:text-lg font-bold text-gray-800 mb-4">
          📌 달력 표시 옵션
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 천을귀인 */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200 hover:shadow-md transition">
            <label className="flex items-center gap-3 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={showCheonEul}
                onChange={(e) => setShowCheonEul(e.target.checked)}
                className="w-5 h-5 cursor-pointer accent-yellow-500"
              />
              <div className="w-8 h-8 rounded border-4 border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-md shadow-yellow-300/50 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-semibold text-gray-800 block">천을귀인</span>
                <span className="text-xs md:text-sm text-gray-600">귀인의 도움, 좋은 인연</span>
              </div>
            </label>
          </div>

          {/* 용신 (준비중) */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 opacity-50">
            <label className="flex items-center gap-3 cursor-not-allowed flex-1">
              <input
                type="checkbox"
                checked={showYongsin}
                disabled
                className="w-5 h-5 cursor-not-allowed"
              />
              <div className="w-8 h-8 rounded border-2 border-gray-300 bg-gray-100 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-semibold text-gray-500 block">용신</span>
                <span className="text-xs md:text-sm text-gray-400">내게 필요한 기운 (준비중)</span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};


