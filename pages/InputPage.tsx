import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import type { SajuInfo } from "../types";
import { SajuInputForm } from "../components/SajuInputForm";
import { OhaengLoading } from "../components/OhaengLoading";
import { getUserSajuRecords } from "../utils/sajuStorage";
import Header from "../components/Header";
import Footer from "../components/Footer";

const InputPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCheckedSajuData, setHasCheckedSajuData] = useState<boolean>(false);

  // 로그인 후 사주 데이터 자동 확인 및 대시보드 이동
  useEffect(() => {
    const checkAndLoadSajuData = async () => {
      // 강제로 입력을 원하는 경우 (대시보드에서 '다른 사주 입력' 클릭 시)
      const shouldSkipAutoLoad = location.state?.skipAutoLoad;
      if (shouldSkipAutoLoad) {
        console.log("다른 사주 입력 모드: 자동 로드 스킵");
        setHasCheckedSajuData(true);
        return;
      }

      // 로그인하지 않았거나, 이미 확인했으면 스킵
      if (!isSignedIn || !user || hasCheckedSajuData) {
        return;
      }

      try {
        console.log("로그인 감지! 사주 데이터 확인 중...");
        setIsLoading(true);

        // 로그인 전 localStorage 데이터 클리어 (다른 사람의 사주 방지)
        console.log("로그인 전 localStorage 클리어...");
        localStorage.removeItem("currentSajuData");

        // Supabase에서 사주 데이터 조회
        const result = await getUserSajuRecords(user.id);

        if (result.success && result.data && result.data.length > 0) {
          console.log(`✅ 사주 데이터 ${result.data.length}개 발견!`);

          // 가장 최근 데이터 가져오기 (created_at 기준으로 이미 정렬됨)
          const latestRecord = result.data[0];
          const sajuInfo = latestRecord.saju_data as SajuInfo;

          // localStorage에 본인의 사주 데이터 저장
          localStorage.setItem("currentSajuData", JSON.stringify(sajuInfo));

          console.log("대시보드로 자동 이동...");

          // 대시보드로 이동
          navigate("/dashboard");
        } else {
          console.log("저장된 사주 데이터가 없습니다. 입력창에 유지합니다.");
        }

        setHasCheckedSajuData(true);
        setIsLoading(false);
      } catch (error) {
        console.error("사주 데이터 확인 중 오류:", error);
        setHasCheckedSajuData(true);
        setIsLoading(false);
      }
    };

    checkAndLoadSajuData();
  }, [isSignedIn, user, hasCheckedSajuData, navigate, location]);

  const handleAnalysis = useCallback(async (sajuInfo: SajuInfo) => {
    setIsLoading(true);
    setError(null);

    try {
      // [임시] 분석 기능 시뮬레이션
      console.log("분석 기능 임시 비활성화");
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 사주 데이터를 localStorage에 저장
      localStorage.setItem("currentSajuData", JSON.stringify(sajuInfo));

      // 결과 페이지로 이동
      navigate("/result", { state: { sajuData: sajuInfo } });

      setIsLoading(false);
    } catch (e) {
      console.error(e);
      setError("분석 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen font-sans p-4 sm:p-6 lg:p-8 bg-white page-transition">
      <Header />

      {isLoading && <OhaengLoading />}

      <main className="max-w-7xl mx-auto relative pt-8">
        <header className="text-center mb-8">
          {/* 아사주달 로고 */}
          <div className="flex flex-col items-center justify-center mb-4">
            <img
              src="/logo.png"
              alt="아사주달"
              className="w-48 sm:w-56 md:w-64 h-auto mb-3"
            />
          </div>

          <div>
            <p className="text-gray-600 text-base sm:text-lg">
              정확한 <span className="text-red-600 font-bold">양력</span> 생년월일시를 입력해주세요
            </p>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              시간을 모를 경우, 시간에 <span className="text-blue-600 font-bold">"모름"</span>으로 입력해주세요
            </p>
          </div>
        </header>

        <SajuInputForm onAnalyze={handleAnalysis} isLoading={isLoading} />

        {error && <div className="text-red-600 text-center mt-4">{error}</div>}
      </main>

      <Footer />
    </div>
  );
};

export default InputPage;
