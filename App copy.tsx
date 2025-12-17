import React, { useState, useCallback, useRef, useEffect } from "react";
// 1. Clerk 기능 가져오기
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";

import type { SajuInfo, SajuAnalysisResult, ChatMessage } from "./types";
import type { Chat } from "@google/genai";
import { SajuInputForm } from "./components/SajuInputForm";
import { AnalysisResult } from "./components/AnalysisResult";
import { OhaengLoading } from "./components/OhaengLoading";
import LandingPage from "./LandingPage";

// [임시 데이터] 프롬프트 등은 기존 코드를 유지한다고 가정
const ANALYSIS_PROMPTS = {
  stage1: `## 1단계: 오행과 일간의 강약... (생략)`,
  stage2: `## 2단계: 용신의 활용... (생략)`,
  stage3: `## 3단계: 인생 대운의 흐름과 미래 예측... (생략)`,
};

const App: React.FC = () => {
  // === [State 관리] ===
  const [showLanding, setShowLanding] = useState(true);
  const [analysisResult, setAnalysisResult] =
    useState<SajuAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sajuDataForDisplay, setSajuDataForDisplay] = useState<SajuInfo | null>(
    null
  );

  // 이미지/채팅 관련 State (기존 유지)
  const [sajuImage, setSajuImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // === [핵심] 랜딩페이지 넘기기 함수 ===
  const handleStart = () => {
    console.log("시작하기 버튼 클릭됨! 메인 화면으로 전환합니다.");
    setShowLanding(false);
  };

  // === [기타 로직들 (분석, 취소 등)] ===
  // (기존 로직 그대로 유지)
  useEffect(() => {
    if (!analysisResult) return;
    console.log("이미지 생성 기능 임시 비활성화");
  }, [analysisResult]);

  const handleAnalysis = useCallback(async (sajuInfo: SajuInfo) => {
    setIsLoading(true);
    setError(null);
    setSajuDataForDisplay(sajuInfo);

    try {
      console.log("AI 분석 기능 임시 비활성화");
      // 로딩바가 너무 빨리 사라지면 어색하므로 약간의 지연 추가 (선택사항)
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  }, []);

  const handleSendMessage = useCallback(
    async (message: string) => {
      console.log("채팅 기능 비활성화");
    },
    [chatSession]
  );

  // ============================================================
  // [화면 렌더링 로직]
  // ============================================================

  // 1. 랜딩 페이지 보여주기 (showLanding이 true일 때)
  // 기존 LandingPage 컴포넌트에 handleStart 함수를 그대로 전달합니다.
  if (showLanding) {
    return <LandingPage onStart={handleStart} />;
  }

  // 2. 메인 앱 화면 (showLanding이 false일 때)
  return (
    <div className="min-h-screen font-sans p-4 sm:p-6 lg:p-8 bg-white">
      {/* --- [우측 상단 로그인 버튼 영역] --- */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <SignedOut>
          {/* 로그인 안 했을 때 */}
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-bold shadow-md cursor-pointer">
              로그인
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          {/* 로그인 했을 때 */}
          <UserButton />
        </SignedIn>
      </div>

      {/* --- [로딩 화면] --- */}
      {isLoading && !analysisResult && <OhaengLoading />}

      {/* --- [메인 컨텐츠 영역] --- */}
      <main className="max-w-7xl mx-auto relative pt-12">
        <header className="text-center mb-12 relative flex justify-center">
          <img
            src="/logo.png"
            alt="아사주달 로고"
            className="h-28 sm:h-36 md:h-44 w-auto object-contain"
          />
        </header>

        {/* A. 로그인한 사용자에게만 보이는 화면 */}
        <SignedIn>
          <SajuInputForm onAnalyze={handleAnalysis} isLoading={isLoading} />

          {error && (
            <div className="text-red-600 text-center mt-4">{error}</div>
          )}

          {sajuDataForDisplay && (
            <AnalysisResult
              result={analysisResult}
              sajuData={sajuDataForDisplay}
              isLoading={isLoading}
              sajuImage={sajuImage}
              isImageLoading={isImageLoading}
              imageError={imageError}
            />
          )}
        </SignedIn>

        {/* B. 로그인 안 한 사용자에게 보이는 안내 화면 */}
        <SignedOut>
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border border-gray-200 shadow-sm mx-4">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              로그인이 필요합니다
            </h2>
            <p className="text-gray-600 mb-8 text-center max-w-md">
              정확한 사주 분석 결과를 위해 로그인이 필요합니다.
              <br />
              3초 만에 로그인하고 내 운명을 확인해보세요!
            </p>
            <SignInButton mode="modal">
              <button className="px-8 py-3 bg-indigo-600 text-white text-lg rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg animate-pulse">
                로그인하고 시작하기
              </button>
            </SignInButton>
          </div>
        </SignedOut>
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

export default App;
