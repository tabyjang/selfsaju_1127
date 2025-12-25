import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton, useClerk, useUser } from "@clerk/clerk-react";
import type { SajuInfo, SajuAnalysisResult, ChatMessage } from "../types";
import type { Chat } from "@google/genai";
import { AnalysisResult } from "../components/AnalysisResult";
import { upsertMySaju } from "../utils/sajuStorage";
import Footer from '../components/Footer';

const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const clerk = useClerk();
  const { user, isSignedIn } = useUser();

  const [sajuDataForDisplay, setSajuDataForDisplay] = useState<SajuInfo | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SajuAnalysisResult | null>(null);
  const [sajuImage, setSajuImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>("");

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

  // 자동 저장 기능 제거 - "내 사주로 저장" 버튼으로 대체

  // "내 사주로 저장" 핸들러
  const handleSaveMySaju = async () => {
    if (!isSignedIn || !user || !sajuDataForDisplay) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      setIsSaving(true);
      setSaveMessage("");

      const result = await upsertMySaju(user.id, sajuDataForDisplay);

      if (result.success) {
        const name = sajuDataForDisplay.name || "사주 정보";
        const message = result.isUpdate
          ? `✅ ${name}님의 사주가 업데이트되었습니다!`
          : `✅ ${name}님의 사주가 저장되었습니다!`;
        setSaveMessage(message);

        // 3초 후 메시지 제거
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setSaveMessage("❌ 저장 중 오류가 발생했습니다.");
        console.error("저장 실패:", result.error);
      }
    } catch (error) {
      setSaveMessage("❌ 저장 중 오류가 발생했습니다.");
      console.error("저장 오류:", error);
    } finally {
      setIsSaving(false);
    }
  };

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
      {/* 치티키 헤더 (대시보드와 동일) - 데스크톱 */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="아사주달 로고"
                className="h-10 w-auto object-contain cursor-pointer"
                onClick={() => navigate('/')}
              />
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  아사주달
                </h1>
                <span className="text-xs font-semibold text-purple-500 animate-pulse">
                  (아! 사주 보여달라고?)
                </span>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => navigate('/input', { state: { skipAutoLoad: true } })}
                className="hidden md:block px-4 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition text-sm font-bold border border-indigo-200"
              >
                다른 사주 입력
              </button>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-bold shadow-md cursor-pointer">
                    로그인
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveMySaju}
                    disabled={isSaving}
                    className="group relative px-5 py-2.5 bg-gradient-to-r from-purple-300 via-pink-300 to-rose-300 text-white rounded-xl hover:from-purple-400 hover:via-pink-400 hover:to-rose-400 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                    <span className="relative flex items-center gap-2" style={{ textShadow: '1px 1px 0 black, -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 0 0 black, -1px 0 0 black, 0 1px 0 black, 0 -1px 0 black' }}>
                      {isSaving ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          저장 중...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          내 사주로 저장
                        </>
                      )}
                    </span>
                  </button>
                  <UserButton afterSignOutUrl="/input" />
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      </div>

      {/* 헤더 - 모바일 */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50 flex md:hidden">
        <div className="w-full px-4">
          <div className="flex justify-between items-center h-12 gap-2">
            {/* 왼쪽: 로고 */}
            <img
              src="/logo.png"
              alt="아사주달 로고"
              className="h-8 w-auto object-contain cursor-pointer"
              onClick={() => navigate('/')}
            />
            {/* 오른쪽: 버튼들 */}
            <div className="flex items-center gap-2">
              <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-bold shadow-md cursor-pointer">
                  로그인
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-2">
                {/* 저장 버튼 - 디스크 아이콘 */}
                <button
                  onClick={handleSaveMySaju}
                  disabled={isSaving}
                  className="group relative p-2.5 bg-gradient-to-r from-purple-300 via-pink-300 to-rose-300 text-white rounded-xl hover:from-purple-400 hover:via-pink-400 hover:to-rose-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  title="내 사주로 저장"
                >
                  {isSaving ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(1px 1px 0 black) drop-shadow(-1px -1px 0 black) drop-shadow(1px -1px 0 black) drop-shadow(-1px 1px 0 black)' }}>
                      <path d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14c1.1 0 2-.9 2-2V7l-4-4zm2 16H5V5h11.17L19 7.83V19zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zM6 6h9v4H6V6z"/>
                    </svg>
                  )}
                </button>
                {/* 사주입력 버튼 - 문서 아이콘 */}
                <button
                  onClick={() => navigate('/input', { state: { skipAutoLoad: true } })}
                  className="p-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition shadow-md border border-indigo-200"
                  title="다른 사주 입력"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15h8v2H8v-2zm0-4h8v2H8v-2zm0-4h5v2H8V7z"/>
                  </svg>
                </button>
                <UserButton afterSignOutUrl="/input" />
              </div>
            </SignedIn>
            </div>
          </div>
        </div>
      </div>

      {/* 저장 메시지 표시 */}
      {saveMessage && (
        <div className="fixed top-20 right-4 z-[60] px-4 py-2 bg-white border-2 border-green-500 text-green-700 rounded-lg shadow-lg text-sm font-bold animate-fade-in">
          {saveMessage}
        </div>
      )}

      <main className="max-w-7xl mx-auto relative pt-16">

        <AnalysisResult
          result={analysisResult}
          sajuData={sajuDataForDisplay}
          isLoading={false}
          sajuImage={sajuImage}
          isImageLoading={isImageLoading}
          imageError={imageError}
          onLoginRequired={handleLoginRequired}
        />

        {/* 대시보드로 이동 버튼 */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 text-center">
          <h3 className="text-xl font-bold text-blue-900 mb-3">
            📊 대시보드에서 한눈에 보기
          </h3>
          <p className="text-blue-700 mb-4 text-sm leading-relaxed">
            사주 정보와 분석 결과를 한 화면에서 확인하세요
          </p>
          <button
            onClick={() => {
              navigate("/dashboard");
            }}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full font-bold hover:from-blue-700 hover:to-cyan-700 transition shadow-xl text-lg"
          >
            <span className="text-2xl">🎯</span>
            <span>대시보드로 이동</span>
            <span className="text-2xl">→</span>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResultPage;
