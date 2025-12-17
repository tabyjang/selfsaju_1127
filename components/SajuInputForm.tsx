import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import type { Gender, SajuInfo } from "../types";
import { WandIcon, InfoIcon } from "./icons";
import {
  getSajuFromDate,
  getSajuInfoFromCharacters,
  birthLocations,
} from "../utils/manse";
import { Modal } from "./Modal";

const heavenlyStems = [
  "甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"
];

const earthlyBranches = [
  "子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"
];

// 양간: 甲, 丙, 戊, 庚, 壬
const yangGan = ["甲", "丙", "戊", "庚", "壬"];
// 음간: 乙, 丁, 己, 辛, 癸
const yinGan = ["乙", "丁", "己", "辛", "癸"];

// 양지: 子, 寅, 辰, 午, 申, 戌
const yangJi = ["子", "寅", "辰", "午", "申", "戌"];
// 음지: 丑, 卯, 巳, 未, 酉, 亥
const yinJi = ["丑", "卯", "巳", "未", "酉", "亥"];

// 천간이 양간인지 음간인지 확인
const isYangGan = (gan: string): boolean => yangGan.includes(gan);
const isYinGan = (gan: string): boolean => yinGan.includes(gan);

// 지지가 양지인지 음지인지 확인
const isYangJi = (ji: string): boolean => yangJi.includes(ji);
const isYinJi = (ji: string): boolean => yinJi.includes(ji);

interface SajuInputFormProps {
  onAnalyze: (data: SajuInfo) => void;
  isLoading: boolean;
}

const ManseInput: React.FC<{
  birthDate: {
    year: string;
    month: string;
    day: string;
    hour: string;
    minute: string;
  };
  setBirthDate: (date: {
    year: string;
    month: string;
    day: string;
    hour: string;
    minute: string;
  }) => void;
  isLoading: boolean;
}> = ({ birthDate, setBirthDate, isLoading }) => {
  const currentYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleChange =
    (field: keyof typeof birthDate) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setBirthDate({ ...birthDate, [field]: e.target.value });
    };

  const inputClass =
    "w-full p-3 bg-black/5 hover:bg-black/10 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed text-base text-center";

  return (
    <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
      <div className="text-center">
        <label className="block text-sm text-gray-500 font-medium mb-1.5">
          년
        </label>
        <input
          type="number"
          value={birthDate.year}
          onChange={handleChange("year")}
          placeholder={`${currentYear}`}
          className={inputClass}
          disabled={isLoading}
          min="1940"
          max="2050"
        />
      </div>
      <div className="text-center">
        <label className="block text-sm text-gray-500 font-medium mb-1.5">
          월
        </label>
        <select
          value={birthDate.month}
          onChange={handleChange("month")}
          className={inputClass}
          disabled={isLoading}
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <div className="text-center">
        <label className="block text-sm text-gray-500 font-medium mb-1.5">
          일
        </label>
        <select
          value={birthDate.day}
          onChange={handleChange("day")}
          className={inputClass}
          disabled={isLoading}
        >
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div className="text-center">
        <label className="block text-sm text-gray-500 font-medium mb-1.5">
          시
        </label>
        <select
          value={birthDate.hour}
          onChange={handleChange("hour")}
          className={inputClass}
          disabled={isLoading}
        >
          <option value="unknown">모름</option>
          {hours.map((h) => (
            <option key={h} value={h}>
              {h.toString()}
            </option>
          ))}
        </select>
      </div>
      <div className="text-center">
        <label className="block text-sm text-gray-500 font-medium mb-1.5">
          분
        </label>
        <select
          value={birthDate.minute}
          onChange={handleChange("minute")}
          className={inputClass}
          disabled={isLoading}
        >
          {minutes.map((m) => (
            <option key={m} value={m}>
              {m.toString()}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export const SajuInputForm: React.FC<SajuInputFormProps> = ({
  onAnalyze,
  isLoading,
}) => {
  const [inputMode, setInputMode] = useState<"date" | "direct">("date");
  const [name, setName] = useState<string>("");
  const [gender, setGender] = useState<Gender>("female");
  const [dateError, setDateError] = useState<string | null>(null);
  const [location, setLocation] = useState(birthLocations[0].name);
  const [yajasiOption, setYajasiOption] = useState<"none" | "apply">("none");
  const [isYajasiInfoOpen, setIsYajasiInfoOpen] = useState<boolean>(false);
  
  // 사주 직접 입력용 상태
  const [directSaju, setDirectSaju] = useState({
    yearGan: "",
    yearJi: "",
    monthGan: "",
    monthJi: "",
    dayGan: "",
    dayJi: "",
    hourGan: "",
    hourJi: "",
  });

  // 가능한 년도 목록 및 선택된 년도
  const [possibleYears, setPossibleYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // 년주로부터 가능한 년도 계산 (1940-2050 범위)
  const calculatePossibleYears = (gan: string, ji: string): number[] => {
    if (!gan || !ji) return [];

    const ganIndex = heavenlyStems.indexOf(gan);
    const jiIndex = earthlyBranches.indexOf(ji);

    if (ganIndex === -1 || jiIndex === -1) return [];

    // 60갑자 주기에서 해당 간지가 나타나는 인덱스 찾기
    // 천간은 10년 주기, 지지는 12년 주기이므로
    // i % 10 = ganIndex && i % 12 = jiIndex를 만족하는 i를 찾아야 함
    let ganjiIndex = -1;
    for (let i = 0; i < 60; i++) {
      if (i % 10 === ganIndex && i % 12 === jiIndex) {
        ganjiIndex = i;
        break;
      }
    }

    if (ganjiIndex === -1) return [];

    // 년도 계산: yearGapjaIndex = (year - 4 + 60) % 60
    // 역산: year = (ganjiIndex - 4 + 60) % 60 + 60 * k + 4
    // 또는: year = ganjiIndex + 60 * k + 4 (단, ganjiIndex < 4이면 60을 더해야 함)
    // 1984년이 갑자년(인덱스 0)이므로: 1984 = 0 + 60 * k + 4 → k = 33
    // 따라서: year = ganjiIndex + 60 * k + 4

    const years: number[] = [];
    
    // 1940-2050 범위에서 가능한 모든 년도 찾기
    // k의 범위를 넓게 잡아서 모든 가능한 년도 찾기
    for (let k = -35; k <= 35; k++) {
      const year = ganjiIndex + 60 * k + 4;
      if (year >= 1940 && year <= 2050) {
        years.push(year);
      }
    }

    return years.sort((a, b) => a - b);
  };

  // 년주가 변경될 때 가능한 년도 계산
  React.useEffect(() => {
    if (directSaju.yearGan && directSaju.yearJi) {
      const years = calculatePossibleYears(directSaju.yearGan, directSaju.yearJi);
      setPossibleYears(years);
      
      if (years.length === 1) {
        // 년도가 1개면 자동 선택
        setSelectedYear(years[0]);
      } else if (years.length > 1) {
        // 년도가 여러 개면 첫 번째를 기본값으로 (사용자가 선택 가능)
        if (!selectedYear || !years.includes(selectedYear)) {
          setSelectedYear(years[0]);
        }
      } else {
        setSelectedYear(null);
      }
    } else {
      setPossibleYears([]);
      setSelectedYear(null);
    }
  }, [directSaju.yearGan, directSaju.yearJi]);

  const [birthDate, setBirthDate] = useState({
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(),
    day: new Date().getDate().toString(),
    hour: new Date().getHours().toString(),
    minute: "0",
  });

  const inputClass =
    "w-full p-3 bg-white/50 hover:bg-white/80 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed text-base";

  // 필터링된 천간 목록 반환 (지지에 따라)
  const getFilteredGan = (ji: string): string[] => {
    if (!ji) return heavenlyStems;
    if (isYangJi(ji)) return yangGan;
    if (isYinJi(ji)) return yinGan;
    return heavenlyStems;
  };

  // 필터링된 지지 목록 반환 (천간에 따라)
  const getFilteredJi = (gan: string): string[] => {
    if (!gan) return earthlyBranches;
    if (isYangGan(gan)) return yangJi;
    if (isYinGan(gan)) return yinJi;
    return earthlyBranches;
  };

  const handleDirectSajuChange = (field: keyof typeof directSaju) => (
    e: ChangeEvent<HTMLSelectElement>
  ) => {
    const newValue = e.target.value;
    const updatedSaju = { ...directSaju, [field]: newValue };

    // 천간을 선택한 경우, 해당하는 지지가 유효하지 않으면 지지를 초기화
    if (field === "yearGan" && newValue) {
      const filteredJi = getFilteredJi(newValue);
      if (directSaju.yearJi && !filteredJi.includes(directSaju.yearJi)) {
        updatedSaju.yearJi = "";
      }
    } else if (field === "monthGan" && newValue) {
      const filteredJi = getFilteredJi(newValue);
      if (directSaju.monthJi && !filteredJi.includes(directSaju.monthJi)) {
        updatedSaju.monthJi = "";
      }
    } else if (field === "dayGan" && newValue) {
      const filteredJi = getFilteredJi(newValue);
      if (directSaju.dayJi && !filteredJi.includes(directSaju.dayJi)) {
        updatedSaju.dayJi = "";
      }
    } else if (field === "hourGan" && newValue) {
      const filteredJi = getFilteredJi(newValue);
      if (directSaju.hourJi && !filteredJi.includes(directSaju.hourJi)) {
        updatedSaju.hourJi = "";
      }
    }

    // 지지를 선택한 경우, 해당하는 천간이 유효하지 않으면 천간을 초기화
    if (field === "yearJi" && newValue) {
      const filteredGan = getFilteredGan(newValue);
      if (directSaju.yearGan && !filteredGan.includes(directSaju.yearGan)) {
        updatedSaju.yearGan = "";
      }
    } else if (field === "monthJi" && newValue) {
      const filteredGan = getFilteredGan(newValue);
      if (directSaju.monthGan && !filteredGan.includes(directSaju.monthGan)) {
        updatedSaju.monthGan = "";
      }
    } else if (field === "dayJi" && newValue) {
      const filteredGan = getFilteredGan(newValue);
      if (directSaju.dayGan && !filteredGan.includes(directSaju.dayGan)) {
        updatedSaju.dayGan = "";
      }
    } else if (field === "hourJi" && newValue) {
      const filteredGan = getFilteredGan(newValue);
      if (directSaju.hourGan && !filteredGan.includes(directSaju.hourGan)) {
        updatedSaju.hourGan = "";
      }
    }

    setDirectSaju(updatedSaju);
  };

  const handleDirectSubmit = (e: FormEvent) => {
    e.preventDefault();
    setDateError(null);

    // 필수 입력 확인
    if (
      !directSaju.yearGan ||
      !directSaju.yearJi ||
      !directSaju.monthGan ||
      !directSaju.monthJi ||
      !directSaju.dayGan ||
      !directSaju.dayJi
    ) {
      alert("년주, 월주, 일주는 필수로 입력해주세요.");
      return;
    }

    try {
      // characters 배열 생성 (시주, 일주, 월주, 년주 순서)
      const isHourUnknown = !directSaju.hourGan || !directSaju.hourJi;
      const characters = [
        isHourUnknown ? "-" : directSaju.hourGan, // 시간
        isHourUnknown ? "-" : directSaju.hourJi,  // 시지
        directSaju.dayGan,   // 일간
        directSaju.dayJi,   // 일지
        directSaju.monthGan, // 월간
        directSaju.monthJi,  // 월지
        directSaju.yearGan,  // 년간
        directSaju.yearJi,   // 년지
      ];

      // 대운 방향 계산: 년간과 성별에 따라 결정
      // 양년(갑, 병, 무, 경, 임) + 남성 → 순행
      // 양년(갑, 병, 무, 경, 임) + 여성 → 역행
      // 음년(을, 정, 기, 신, 계) + 남성 → 역행
      // 음년(을, 정, 기, 신, 계) + 여성 → 순행
      const isYangYear = isYangGan(directSaju.yearGan);
      let daewoon: "sunhaeng" | "yeokhaeng";
      if (isYangYear) {
        // 양년: 남성은 순행, 여성은 역행
        daewoon = gender === "male" ? "sunhaeng" : "yeokhaeng";
      } else {
        // 음년: 남성은 역행, 여성은 순행
        daewoon = gender === "male" ? "yeokhaeng" : "sunhaeng";
      }
      const daewoonNumber = 5; // 직접 입력 시 대운 번호는 5로 설정

      // 선택된 년도 사용 (없으면 첫 번째 가능한 년도 또는 2000)
      // 년도가 선택되지 않았거나 가능한 년도가 없으면 계산
      let birthYear = selectedYear;
      if (!birthYear && possibleYears.length > 0) {
        birthYear = possibleYears[0];
      }
      if (!birthYear) {
        // 가능한 년도가 없으면 기본값 사용 (하지만 이 경우는 거의 없을 것)
        birthYear = 2000;
      }

      const numericBirthDate = {
        year: birthYear,
        month: 1,
        day: 1,
        hour: isHourUnknown ? -1 : 12,
        minute: isHourUnknown ? -1 : 0,
      };

      const sajuInfo = getSajuInfoFromCharacters(
        characters,
        gender,
        daewoon,
        daewoonNumber,
        numericBirthDate,
        location,
        isHourUnknown,
        name || undefined
      );
      onAnalyze(sajuInfo);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "";
      setDateError(errorMessage);
      if (errorMessage) {
        alert(errorMessage);
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setDateError(null);

    if (!birthDate.year || !birthDate.month || !birthDate.day) {
      alert("생년월일을 입력해주세요.");
      return;
    }

    const isHourUnknown = birthDate.hour === "unknown";
    if (!isHourUnknown && (!birthDate.hour || !birthDate.minute)) {
      alert('시간을 입력하거나 "모름"을 선택해주세요.');
      return;
    }

    try {
      // 시간이 모름인 경우, 정오(12시)로 설정 (시주 계산에는 사용되지 않음)
      const hour = isHourUnknown ? 12 : parseInt(birthDate.hour);
      const minute = isHourUnknown ? 0 : parseInt(birthDate.minute);

      const date = new Date(
        parseInt(birthDate.year),
        parseInt(birthDate.month) - 1,
        parseInt(birthDate.day),
        hour,
        minute
      );

      if (
        isNaN(date.getTime()) ||
        date.getFullYear() !== parseInt(birthDate.year) ||
        date.getMonth() !== parseInt(birthDate.month) - 1 ||
        date.getDate() !== parseInt(birthDate.day)
      ) {
        const errorMsg = "유효하지 않은 날짜입니다. (예: 2월 30일)";
        setDateError(errorMsg);
        alert(errorMsg);
        return;
      }

      if (parseInt(birthDate.year) < 1940 || parseInt(birthDate.year) > 2050) {
        const errorMsg = "유효한 날짜를 입력해주세요. (1940년 ~ 2050년)";
        setDateError(errorMsg);
        alert(errorMsg);
        return;
      }

      const selectedLocation =
        birthLocations.find((l) => l.name === location) || birthLocations[0];
      const timeOffset = selectedLocation.offsetMinutes;
      const isYajasiApplied = yajasiOption === "apply";

      const derivedSajuData = getSajuFromDate(
        date,
        gender,
        timeOffset,
        isYajasiApplied,
        isHourUnknown
      );

      const numericBirthDate = {
        year: parseInt(birthDate.year),
        month: parseInt(birthDate.month),
        day: parseInt(birthDate.day),
        hour: isHourUnknown ? -1 : parseInt(birthDate.hour),
        minute: isHourUnknown ? -1 : parseInt(birthDate.minute),
      };

      const sajuInfo = getSajuInfoFromCharacters(
        derivedSajuData.characters,
        gender,
        derivedSajuData.daewoon,
        derivedSajuData.daewoonNumber,
        numericBirthDate,
        location,
        isHourUnknown,
        name || undefined
      );
      onAnalyze(sajuInfo);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "";
      setDateError(errorMessage);
      if (errorMessage) {
        alert(errorMessage);
      }
    }
  };

  return (
    <div className="relative">
      {/* 모드 전환 버튼 */}
      <div className="absolute -top-12 right-0">
        <button
          type="button"
          onClick={() => setInputMode(inputMode === "date" ? "direct" : "date")}
          disabled={isLoading}
          className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 ${
            inputMode === "direct"
              ? "bg-amber-500 text-white border-amber-500 shadow-lg"
              : "bg-white text-gray-700 border-amber-300 hover:bg-amber-50"
          }`}
        >
          {inputMode === "date" ? "사주 직접 입력" : "생년월일시 입력"}
        </button>
      </div>

      <form
        onSubmit={inputMode === "date" ? handleSubmit : handleDirectSubmit}
        className="glass-card p-6 md:p-8"
      >
        <div className="space-y-8">
        {/* 가로 5칸 레이아웃: 이름, 성별, 출생지역, 야자시 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. 이름 */}
          <div className="lg:col-span-1">
            <label className="block text-base font-semibold text-gray-800 mb-3">
              이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className={`${inputClass} h-14`}
              disabled={isLoading}
            />
          </div>

          {/* 2. 성별 */}
          <div className="lg:col-span-2">
            <label className="block text-base font-semibold text-gray-800 mb-3">
              성별
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender("male")}
                disabled={isLoading}
                className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 border-2 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 ${
                  gender === "male"
                    ? "bg-sky-400 text-white border-sky-400 shadow-lg"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200"
                }`}
              >
                남성
              </button>
              <button
                type="button"
                onClick={() => setGender("female")}
                disabled={isLoading}
                className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 border-2 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 ${
                  gender === "female"
                    ? "bg-pink-400 text-white border-pink-400 shadow-lg"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200"
                }`}
              >
                여성
              </button>
            </div>
          </div>

          {/* 3. 출생 지역 */}
          <div className="lg:col-span-1">
            <label className="block text-base font-semibold text-gray-800 mb-3">
              출생 지역
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`${inputClass} h-14`}
              disabled={isLoading}
            >
              {birthLocations.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. 야자시 적용 */}
          <div className="lg:col-span-1">
            <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
              야자시
              <button
                type="button"
                onClick={() => setIsYajasiInfoOpen(true)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="야자시 정보"
              >
                <InfoIcon className="w-5 h-5" />
              </button>
            </label>
            <select
              value={yajasiOption}
              onChange={(e) =>
                setYajasiOption(e.target.value as "none" | "apply")
              }
              className={`${inputClass} h-14`}
              disabled={isLoading}
            >
              <option value="none">미적용</option>
              <option value="apply">적용</option>
            </select>
          </div>
        </div>

        {inputMode === "date" ? (
          <div>
            <label className="block text-base font-bold text-gray-800 mb-3 text-center">
              생년월일시 (양력 기준)
            </label>
            <div className="p-4 bg-black/5 rounded-xl border border-gray-200">
              <ManseInput
                birthDate={birthDate}
                setBirthDate={setBirthDate}
                isLoading={isLoading}
              />
            </div>
            {dateError && (
              <p className="text-red-500 text-sm mt-2 text-center">{dateError}</p>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-base font-bold text-gray-800 mb-3 text-center">
              사주 팔자 직접 입력
            </label>
            {/* 가능한 년도 표시 */}
            {possibleYears.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <span className="text-sm font-semibold text-gray-700">
                    {directSaju.yearGan}{directSaju.yearJi}년 가능한 년도:
                  </span>
                  {possibleYears.length === 1 ? (
                    <span className="text-base font-bold text-blue-700">
                      {possibleYears[0]}년
                    </span>
                  ) : (
                    <select
                      value={selectedYear || ""}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="px-4 py-2 bg-white border border-blue-300 rounded-lg text-base font-semibold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      disabled={isLoading}
                    >
                      {possibleYears.map((year) => (
                        <option key={year} value={year}>
                          {year}년
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}
            <div className="p-4 bg-black/5 rounded-xl border border-gray-200">
              <div className="space-y-4">
                {/* 년주 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <label className="block text-sm text-gray-500 font-medium mb-1.5">
                      년간 (年干)
                    </label>
                    <select
                      value={directSaju.yearGan}
                      onChange={handleDirectSajuChange("yearGan")}
                      className={inputClass}
                      disabled={isLoading}
                      required
                    >
                      <option value="">선택</option>
                      {getFilteredGan(directSaju.yearJi).map((gan) => (
                        <option key={gan} value={gan}>
                          {gan}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-center">
                    <label className="block text-sm text-gray-500 font-medium mb-1.5">
                      년지 (年支)
                    </label>
                    <select
                      value={directSaju.yearJi}
                      onChange={handleDirectSajuChange("yearJi")}
                      className={inputClass}
                      disabled={isLoading}
                      required
                    >
                      <option value="">선택</option>
                      {getFilteredJi(directSaju.yearGan).map((ji) => (
                        <option key={ji} value={ji}>
                          {ji}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 월주 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <label className="block text-sm text-gray-500 font-medium mb-1.5">
                      월간 (月干)
                    </label>
                    <select
                      value={directSaju.monthGan}
                      onChange={handleDirectSajuChange("monthGan")}
                      className={inputClass}
                      disabled={isLoading}
                      required
                    >
                      <option value="">선택</option>
                      {getFilteredGan(directSaju.monthJi).map((gan) => (
                        <option key={gan} value={gan}>
                          {gan}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-center">
                    <label className="block text-sm text-gray-500 font-medium mb-1.5">
                      월지 (月支)
                    </label>
                    <select
                      value={directSaju.monthJi}
                      onChange={handleDirectSajuChange("monthJi")}
                      className={inputClass}
                      disabled={isLoading}
                      required
                    >
                      <option value="">선택</option>
                      {getFilteredJi(directSaju.monthGan).map((ji) => (
                        <option key={ji} value={ji}>
                          {ji}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 일주 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <label className="block text-sm text-gray-500 font-medium mb-1.5">
                      일간 (日干)
                    </label>
                    <select
                      value={directSaju.dayGan}
                      onChange={handleDirectSajuChange("dayGan")}
                      className={inputClass}
                      disabled={isLoading}
                      required
                    >
                      <option value="">선택</option>
                      {getFilteredGan(directSaju.dayJi).map((gan) => (
                        <option key={gan} value={gan}>
                          {gan}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-center">
                    <label className="block text-sm text-gray-500 font-medium mb-1.5">
                      일지 (日支)
                    </label>
                    <select
                      value={directSaju.dayJi}
                      onChange={handleDirectSajuChange("dayJi")}
                      className={inputClass}
                      disabled={isLoading}
                      required
                    >
                      <option value="">선택</option>
                      {getFilteredJi(directSaju.dayGan).map((ji) => (
                        <option key={ji} value={ji}>
                          {ji}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 시주 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <label className="block text-sm text-gray-500 font-medium mb-1.5">
                      시간 (時干) <span className="text-gray-400">(선택)</span>
                    </label>
                    <select
                      value={directSaju.hourGan}
                      onChange={handleDirectSajuChange("hourGan")}
                      className={inputClass}
                      disabled={isLoading}
                    >
                      <option value="">선택 안 함</option>
                      {getFilteredGan(directSaju.hourJi).map((gan) => (
                        <option key={gan} value={gan}>
                          {gan}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-center">
                    <label className="block text-sm text-gray-500 font-medium mb-1.5">
                      시지 (時支) <span className="text-gray-400">(선택)</span>
                    </label>
                    <select
                      value={directSaju.hourJi}
                      onChange={handleDirectSajuChange("hourJi")}
                      className={inputClass}
                      disabled={isLoading}
                    >
                      <option value="">선택 안 함</option>
                      {getFilteredJi(directSaju.hourGan).map((ji) => (
                        <option key={ji} value={ji}>
                          {ji}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            {dateError && (
              <p className="text-red-500 text-sm mt-2 text-center">{dateError}</p>
            )}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary mt-10 w-full flex items-center justify-center gap-3 py-4 px-4 rounded-xl duration-300 disabled:opacity-60 disabled:cursor-not-allowed transform focus:outline-none focus:ring-4 focus:ring-yellow-400/50"
      >
        <WandIcon className="w-6 h-6" />
        <span className="text-lg">
          {isLoading ? "분석 중..." : "분석 시작하기"}
        </span>
      </button>

      {isYajasiInfoOpen && (
        <Modal
          isOpen={isYajasiInfoOpen}
          onClose={() => setIsYajasiInfoOpen(false)}
          title="야자시 (夜子時) 설명"
        >
          <div className="space-y-4">
            <p>
              명리학에서 하루의 시작은 00시가 아닌 자시(子時,
              23:00~01:00)입니다. 따라서 전통적으로 23시 이후 출생자는 다음 날의
              일주(日柱)로 간주합니다.
            </p>
            <p>
              하지만 '야자시'는 23:00~23:59 사이 출생자의 일주를 당일로 유지해야
              한다는 학설입니다. 특히 동지(冬至)와 가까운 시기에는 해가 짧아져
              이 학설을 적용하기도 합니다.
            </p>
            <p className="font-bold text-amber-700 mt-4 p-3 bg-yellow-100 rounded-lg border border-yellow-200">
              이 옵션을 체크하면, 23:30 ~ 23:59 사이에 태어난 경우 일주가 다음
              날로 넘어가지 않고 당일의 일주를 유지하여 사주를 계산합니다.
            </p>
            <p>
              본인의 출생 시간에 야자시 적용 여부가 확실하지 않다면, 체크하지
              않은 결과와 체크한 결과를 모두 참고하여 자신에게 더 잘 맞는 것을
              선택하는 것이 좋습니다.
            </p>
          </div>
        </Modal>
      )}
      </form>
    </div>
  );
};
