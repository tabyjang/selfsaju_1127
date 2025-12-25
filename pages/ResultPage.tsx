import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";
import type { SajuInfo, SajuAnalysisResult, ChatMessage } from "../types";
import type { Chat } from "@google/genai";
import { AnalysisResult } from "../components/AnalysisResult";
import { upsertMySaju } from "../utils/sajuStorage";
import Header from '../components/Header';
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
      <Header showSaveButton={true} onSave={handleSaveMySaju} isSaving={isSaving} />

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
