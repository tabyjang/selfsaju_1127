import React, { useState, useCallback, useRef, useEffect } from "react";

// Clerk 훅 가져오기
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
  useClerk,
} from "@clerk/clerk-react";

import type { SajuInfo, SajuAnalysisResult, ChatMessage } from "./types";
import type { Chat } from "@google/genai";
import { SajuInputForm } from "./components/SajuInputForm";
import { AnalysisResult } from "./components/AnalysisResult";
import { OhaengLoading } from "./components/OhaengLoading";
import { SavedSajuList } from "./components/SavedSajuList";
import LandingPage from "./LandingPage";

const App: React.FC = () => {
  // === [Clerk 훅 사용] ===
  const { isSignedIn } = useUser();
  const clerk = useClerk();

  // === [State 관리] ===
  const [showLanding, setShowLanding] = useState(true);
  const [analysisResult, setAnalysisResult] =
    useState<SajuAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sajuDataForDisplay, setSajuDataForDisplay] = useState<SajuInfo | null>(
    null
  );

  // 화면 스크롤을 위한 '위치 표시기(Ref)'
  const resultRef = useRef<HTMLDivElement>(null);

  // 이미지/채팅 관련 State
  const [sajuImage, setSajuImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const handleStart = () => {
    setShowLanding(false);
  };

  // 로그인 후 사주 데이터 복원
  useEffect(() => {
    if (isSignedIn) {
      const pendingSajuData = localStorage.getItem("pendingSajuData");
      if (pendingSajuData) {
        try {
          const sajuData = JSON.parse(pendingSajuData);
          setSajuDataForDisplay(sajuData);
          setShowLanding(false);
          localStorage.removeItem("pendingSajuData");
        } catch (error) {
          console.error("사주 데이터 복원 실패:", error);
        }
      }
    }
  }, [isSignedIn]);

  // 로그인 모달 열기
  const handleLoginRequired = () => {
    // 로그인 후 현재 보고 있는 '풀 주소'로 돌아오도록 설정
    clerk.openSignIn({
      forceRedirectUrl: window.location.href,
    });
  };

  // === [수정됨] 분석 요청 로직 (로그인 강제 제거!) ===
  const handleAnalysis = useCallback(async (sajuInfo: SajuInfo) => {
    // 1. 로그인 체크 로직 삭제함!
    // 이제 로그인을 안 해도 바로 분석이 시작됩니다.

    setIsLoading(true);
    setError(null);
    setSajuDataForDisplay(sajuInfo);

    try {
      // [임시] 분석 기능 시뮬레이션
      console.log("분석 기능 임시 비활성화");
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  }, []);

  // === [결과 나오면 자동 스크롤] ===
  useEffect(() => {
    if (sajuDataForDisplay && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [sajuDataForDisplay]);

  // 기타 로직들
  useEffect(() => {
    if (!analysisResult) return;
  }, [analysisResult]);

  const handleSendMessage = useCallback(
    async (message: string) => {},
    [chatSession]
  );

  if (showLanding) {
    return <LandingPage onStart={handleStart} />;
  }

  return (
    <div className="min-h-screen font-sans p-4 sm:p-6 lg:p-8 bg-white">
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
          {/* 로그아웃 후 입력 페이지로 이동 */}
          <UserButton afterSignOutUrl="/input" />
        </SignedIn>
      </div>

      {isLoading && !analysisResult && <OhaengLoading />}

      <main className="max-w-7xl mx-auto relative pt-12">
        <header className="text-center mb-12 relative flex justify-center">
          <img
            src="/logo.png"
            alt="아사주달 로고"
            className="h-28 sm:h-36 md:h-44 w-auto object-contain"
          />
        </header>

        {/* 저장된 사주 불러오기 버튼 (로그인한 유저에게만 보임) */}
        {/* <SignedIn>
          <div className="flex justify-center mb-6">
            <SavedSajuList
              onSelect={(sajuData) => {
                setSajuDataForDisplay(sajuData);
                setShowLanding(false);
              }}
            />
          </div>
        </SignedIn> */}

        <SajuInputForm onAnalyze={handleAnalysis} isLoading={isLoading} />

        {/* 결과 화면 위치 표시기 */}
        <div ref={resultRef} className="scroll-mt-10">
          {sajuDataForDisplay && (
            <>
              <AnalysisResult
                result={analysisResult}
                sajuData={sajuDataForDisplay}
                isLoading={isLoading}
                sajuImage={sajuImage}
                isImageLoading={isImageLoading}
                imageError={imageError}
                onLoginRequired={handleLoginRequired}
              />

              {/* 더 깊은 내용 보기 버튼 */}
              <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200 text-center animate-border-sparkle">
                <h3 className="text-xl font-bold text-purple-900 mb-3">
                  🔮 더 정확하고 깊은 사주 분석이 필요하신가요?
                </h3>
                <p className="text-purple-700 mb-4 text-sm leading-relaxed">
                  오행 가중치 분석, 신강신약 판단, 용신 추출을 통한<br />
                  궁합·직업운·재물운·연애운 심층 분석
                </p>
                <button
                  onClick={() => {
                    // 사주 데이터를 localStorage에 저장하고 새 페이지로 이동
                    localStorage.setItem(
                      "deepAnalysisSajuData",
                      JSON.stringify(sajuDataForDisplay)
                    );
                    window.location.href = "/deep-analysis";
                  }}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-bold hover:from-purple-700 hover:to-indigo-700 transition shadow-xl animate-sparkle text-lg"
                >
                  <span className="text-2xl">✨</span>
                  <span>더 깊은 내용 보기</span>
                  <span className="text-2xl">✨</span>
                </button>
              </div>
            </>
          )}
        </div>

        {error && <div className="text-red-600 text-center mt-4">{error}</div>}
      </main>

      <footer className="text-center mt-16 text-sm text-gray-500 pb-8">
        <p>아사주달의 분석을 통해 건강과 행복이 함께 하시길 기원합니다.</p>
        <div className="mt-2 mb-2">
          <a href="/privacy" className="mx-3 hover:text-gray-700 underline">
            개인정보처리방침
          </a>
          <a href="/terms" className="mx-3 hover:text-gray-700 underline">
            이용약관
          </a>
        </div>
        <p>
          &copy; {new Date().getFullYear()} asajudal.com. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default App;
