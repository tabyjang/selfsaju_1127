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
      const pendingSajuData = localStorage.getItem('pendingSajuData');
      if (pendingSajuData) {
        try {
          const sajuData = JSON.parse(pendingSajuData);
          setSajuDataForDisplay(sajuData);
          setShowLanding(false);
          localStorage.removeItem('pendingSajuData');
        } catch (error) {
          console.error('사주 데이터 복원 실패:', error);
        }
      }
    }
  }, [isSignedIn]);

  // 로그인 모달 열기
  const handleLoginRequired = () => {
    // 로그인 후 현재 페이지로 돌아오도록 설정
    clerk.openSignIn({
      redirectUrl: window.location.pathname + window.location.search + window.location.hash,
    });
  };

  // === [수정됨] 분석 요청 로직 (로그인 강제 제거!) ===
  const handleAnalysis = useCallback(
    async (sajuInfo: SajuInfo) => {
      // 1. 로그인 체크 로직 삭제함! 
      // 이제 로그인을 안 해도 바로 분석이 시작됩니다.

      setIsLoading(true);
      setError(null);
      setSajuDataForDisplay(sajuInfo);

      try {
        // [임시] 분석 기능 시뮬레이션
        console.log("AI 분석 기능 임시 비활성화");
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsLoading(false);
      } catch (e) {
        console.error(e);
        setIsLoading(false);
      }
    },
    [] 
  );

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
          <UserButton />
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
        <SignedIn>
          <div className="flex justify-center mb-6">
            <SavedSajuList
              onSelect={(sajuData) => {
                setSajuDataForDisplay(sajuData);
                setShowLanding(false);
              }}
            />
          </div>
        </SignedIn>

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
              
              {/* [추가됨] 결과 하단에 로그인 유도 배너 (비로그인 시에만 보임) */}
              <SignedOut>
                <div className="mt-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 text-center">
                  <h3 className="text-lg font-bold text-indigo-900 mb-2">
                    로그인하면 사주결과를 저장할 수있습니다. 💾
                  </h3>
                  <p className="text-indigo-700 mb-4 text-sm">

                  </p>
                  <button
                    onClick={() => {
                      // localStorage에 사주 데이터 저장 후 로그인 모달 열기
                      localStorage.setItem('pendingSajuSave', 'true');
                      localStorage.setItem('pendingSajuData', JSON.stringify(sajuDataForDisplay));
                      handleLoginRequired();
                    }}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg animate-pulse"
                  >
                    결과 저장하기 (로그인)
                  </button>
                </div>
              </SignedOut>
            </>
          )}
        </div>

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

export default App;