import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import type { SajuInfo } from "../types";
import { SajuInputForm } from "../components/SajuInputForm";
import { OhaengLoading } from "../components/OhaengLoading";

const InputPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

      {isLoading && <OhaengLoading />}

      <main className="max-w-7xl mx-auto relative pt-12">
        <header className="text-center mb-12 relative flex justify-center">
          <img
            src="/logo.png"
            alt="아사주달 로고"
            className="h-28 sm:h-36 md:h-44 w-auto object-contain cursor-pointer"
            onClick={() => navigate("/")}
          />
        </header>

        <SajuInputForm onAnalyze={handleAnalysis} isLoading={isLoading} />

        {error && <div className="text-red-600 text-center mt-4">{error}</div>}
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

export default InputPage;
