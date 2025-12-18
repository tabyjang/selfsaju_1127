import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton, useClerk } from "@clerk/clerk-react";
import type { SajuInfo, SajuAnalysisResult, ChatMessage } from "../types";
import type { Chat } from "@google/genai";
import { AnalysisResult } from "../components/AnalysisResult";

const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const clerk = useClerk();

  const [sajuDataForDisplay, setSajuDataForDisplay] = useState<SajuInfo | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SajuAnalysisResult | null>(null);
  const [sajuImage, setSajuImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // 페이지 로드 시 사주 데이터 복원
  useEffect(() => {
    // location state에서 먼저 가져오기
    const stateData = location.state as { sajuData?: SajuInfo } | null;
    if (stateData?.sajuData) {
      setSajuDataForDisplay(stateData.sajuData);
      return;
    }

    // localStorage에서 가져오기 (백업)
    const savedData = localStorage.getItem("currentSajuData");
    if (savedData) {
      try {
        setSajuDataForDisplay(JSON.parse(savedData));
      } catch (error) {
        console.error("사주 데이터 복원 실패:", error);
        // 데이터가 없으면 입력 페이지로 리다이렉트
        navigate("/input");
      }
    } else {
      // 데이터가 없으면 입력 페이지로 리다이렉트
      navigate("/input");
    }
  }, [location, navigate]);

  const handleLoginRequired = () => {
    clerk.openSignIn({
      forceRedirectUrl: window.location.href,
    });
  };

  const handleSendMessage = useCallback(
    async (message: string) => {},
    [chatSession]
  );

  if (!sajuDataForDisplay) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white page-fade-in">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">사주 데이터를 불러오는 중...</h2>
          <p className="text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

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

      <main className="max-w-7xl mx-auto relative pt-12">
        <header className="text-center mb-12 relative flex justify-center">
          <img
            src="/logo.png"
            alt="아사주달 로고"
            className="h-28 sm:h-36 md:h-44 w-auto object-contain cursor-pointer"
            onClick={() => navigate("/")}
          />
        </header>

        <AnalysisResult
          result={analysisResult}
          sajuData={sajuDataForDisplay}
          isLoading={false}
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
              navigate("/deep-analysis");
            }}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-bold hover:from-purple-700 hover:to-indigo-700 transition shadow-xl animate-sparkle text-lg"
          >
            <span className="text-2xl">✨</span>
            <span>더 깊은 내용 보기</span>
            <span className="text-2xl">✨</span>
          </button>
        </div>

        {/* 다시 분석하기 버튼 */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/input")}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
          >
            ← 다시 분석하기
          </button>
        </div>
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

export default ResultPage;
