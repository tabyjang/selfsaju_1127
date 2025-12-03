import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { SajuInfo, SajuAnalysisResult, ChatMessage } from './types';
import type { Chat } from '@google/genai';
import { analyzeSaju, createChatSession, generateSajuImage } from './services/geminiService';
import { SajuInputForm } from './components/SajuInputForm';
import { AnalysisResult } from './components/AnalysisResult';
import { InteractiveChat } from './components/InteractiveChat';
import { OhaengLoading } from './components/OhaengLoading';
import LandingPage from './LandingPage';


const ANALYSIS_PROMPTS = {
  stage1: `## 1단계: 오행과 일간의 강약

**목표:** 당신은 사주 초보자도 쉽게 이해할 수 있도록 설명하는 친절한 사주 멘토입니다. 아래 지시사항에 따라 이 사주의 핵심 특징을 분석해주세요.  모든 답변은 마크다운 형식을 사용하여 명확하고 보기 좋게 정리해야 합니다. 1단계 글자는 1000자 내외로 완성해주세요.  답변은 마크다운 형식을 사용하여 체계적으로 제시해야 합니다.
본문에는 인사나 나는 사주 멘토입니다, 이런 말 절대 쓰지말 것.
**1. 내 사주의 핵심 캐릭터는? (일주와 오행 비유)**
*   이 사주의 주인공인 '일간(日干)'과 그 '일주(日柱)'의 특징을 누구나 알기 쉬운 **재미있는 비유(예: '불을 다루는 장인', '숲속의 현자')**를 들어 설명해주세요.

**2. 일간이 강한지 약한지 설명해주세요.
강한 일간, 약한 일간, 결과에 맞는 일간의 특징을 얘기해주세요

마지막으로, 위 모든 내용을 종합하여 오행과 일간의 강약에 대해서 요약해주세요.
`,
  stage2: `## 2단계: 용신의 활용
본문에는 인사나 나는 사주 멘토입니다, 이런 말 절대 쓰지말 것.
**목표:** 당신은 사주 초보자도 쉽게 이해할 수 있도록 설명하는 친절한 사주 멘토입니다. 사주 원국과 1단계 분석 내용을 종합적으로 고려하여, 용신이 무엇이고 용신을 돕는 희신이 무엇인지 알려주고, 용신과 희신을 당겨올 수 있는 개운법에 대해서 설명해주세요. 글자는 1000자 내외로 완성해주세요.  답변은 마크다운 형식을 사용하여 체계적으로 제시해야 합니다.

**[2단계 요약]**
용신과 희신, 개운법을 한줄로 요약해주세요.
`,
  stage3: `## 3단계: 인생 대운의 흐름과 미래 예측
본문에는 인사나 나는 사주 멘토입니다, 이런 말 절대 쓰지말 것.
당신은 사주 초보자도 쉽게 이해할 수 있도록 설명하는 친절한 사주 멘토입니다.사주 원국과 1, 2단계 분석을 바탕으로, 인생 전체의 큰 흐름인 대운을 통찰력 있게 분석해주세요. 답변은 마크다운 형식을 사용하여 체계적으로 제시해야 합니다.
초보자에게 설명한다고 생각하여, 어려운 단어나 명리학적 설명은 제외하고, 결과적으로 어떻게 하면 좋을지 생활용어를 사용해서 친절하게 설명해주세요. 어려운 단어는 쓰지 말고. 해야 할일을 명확하게 제시해주세요. 전체 글은 1500자 내외로 해주세요.

**1. 과거 대운 리뷰 (현재 대운 이전)**
*   이 사람이 거쳐온 과거 대운에 대해 간단하게 한줄 정리를 해주시고,

**2. 현재와 미래 20년 심층 분석 (가장 중요)**
*   **현재 대운:** 지금 어떤 환경과 기운 속에 있는지, 지금 용신의 관점에서 어떤 흐름이 있는지 설명해주세요.
*   **다음 대운 (10년 후):** 현재 대운의 경험을 바탕으로 맞이하게 될 다음 10년의 환경 변화를 예측해주세요. 무엇을 준비하고 대비해야 할까요? 인생의 중요한 전환점이 될 수 있는지, 어떤 부분에서 성장과 변화가 두드러질지 알려주세요.
*   **그다음 대운 (20년 후):** 장기적인 관점에서 인생의 방향성이 어떻게 흘러갈지 조망해주세요. 사회적 성취, 인간관계, 개인적 만족도 측면에서 어떤 흐름을 탈 것으로 보이며, 인생의 전성기 또는 중요한 변화의 시기가 될 수 있는지 설명해주세요.

**[3단계 종합 요약 및 조언]**
마지막으로, 이 사주의 인생 대운 흐름 전체를 관통하는 **핵심 조언과 미래를 위한 한 줄 요약**을 제시해주세요.`,
};


const App: React.FC = () => {
    const [showLanding, setShowLanding] = useState(true);
    const [analysisResult, setAnalysisResult] = useState<SajuAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [sajuDataForDisplay, setSajuDataForDisplay] = useState<SajuInfo | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const [sajuImage, setSajuImage] = useState<string | null>(null);
    const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
    const [imageError, setImageError] = useState<string | null>(null);

    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
    const [chatError, setChatError] = useState<string | null>(null);

    const handleStart = () => {
        setShowLanding(false);
    }

    useEffect(() => {
        if (!analysisResult) return;

        const extractMetaphor = (text: string): string | null => {
            const metaphorRegex = /\*\*재미있는 비유\*\*[^'"]*['"]([^'"]+)['"]/;
            const match = text.match(metaphorRegex);
            return match ? match[1] : null;
        };

        const generateImage = async () => {
            const metaphor = extractMetaphor(analysisResult.stage1);
            if (!metaphor) {
                console.log("No metaphor found in stage 1 analysis for image generation.");
                return;
            }

            setIsImageLoading(true);
            setImageError(null);
            
            const imageAbortController = new AbortController();
            const mainAbortSignal = abortControllerRef.current?.signal;
            const onAbort = () => imageAbortController.abort();
            mainAbortSignal?.addEventListener('abort', onAbort);

            try {
                const imageUrl = await generateSajuImage(metaphor, imageAbortController.signal);
                setSajuImage(imageUrl);
            } catch (e) {
                if (e instanceof Error && e.name !== 'AbortError') {
                    setImageError(e.message);
                }
            } finally {
                setIsImageLoading(false);
                mainAbortSignal?.removeEventListener('abort', onAbort);
            }
        };

        generateImage();

    }, [analysisResult]);


    const handleAnalysis = useCallback(async (sajuInfo: SajuInfo) => {
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setSajuImage(null);
        setIsImageLoading(false);
        setImageError(null);
        setChatSession(null);
        setChatHistory([]);
        setChatError(null);
        
        setSajuDataForDisplay(sajuInfo);
        
        abortControllerRef.current = new AbortController();
        try {
            const result = await analyzeSaju(
                sajuInfo,
                ANALYSIS_PROMPTS,
                abortControllerRef.current.signal
            );
            setAnalysisResult(result);
             if (result) {
                const session = createChatSession(sajuInfo, result);
                setChatSession(session);
            }

        } catch (e) {
            if (e instanceof Error && e.name === 'AbortError') {
                console.log('Analysis was cancelled by the user.');
                setSajuDataForDisplay(null);
            } else {
                setError('');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const handleCancel = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    const handleSendMessage = useCallback(async (message: string) => {
        if (!chatSession) return;

        const newUserMessage: ChatMessage = { role: 'user', content: message };
        setChatHistory(prev => [...prev, newUserMessage]);
        setIsChatLoading(true);
        setChatError(null);

        let fullResponse = '';
        try {
            const stream = await chatSession.sendMessageStream({ message });
            
            setChatHistory(prev => [...prev, { role: 'model', content: '' }]);

            for await (const chunk of stream) {
                fullResponse += chunk.text;
                setChatHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1] = { role: 'model', content: fullResponse };
                    return newHistory;
                });
            }
        } catch (e) {
             const errorMessage = '';
            setChatError(errorMessage);
            setChatHistory(prev => prev.slice(0, -1));
        } finally {
            setIsChatLoading(false);
        }
    }, [chatSession]);

    if (showLanding) {
        return <LandingPage onStart={handleStart} />;
    }

    return (
        <div className="min-h-screen font-sans p-4 sm:p-6 lg:p-8">
            {isLoading && !analysisResult && <OhaengLoading />}
            <main className="max-w-7xl mx-auto relative">
                <header className="text-center mb-12">
                     <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800">
                         사주 분석
                    </h1>
                </header>

                <SajuInputForm onAnalyze={handleAnalysis} isLoading={isLoading} />

                {error && error.trim() && (
                    <div className="mt-8 text-center p-6 bg-red-100 border border-red-300 rounded-xl">
                        <p className="font-bold text-xl text-red-600">오류 발생</p>
                        <p className="text-red-700 mt-2">{error}</p>
                    </div>
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

                {analysisResult && chatSession && (
                    <InteractiveChat
                        onSendMessage={handleSendMessage}
                        chatHistory={chatHistory}
                        isLoading={isChatLoading}
                        error={chatError}
                    />
                )}
            </main>
            <footer className="text-center mt-16 text-sm text-gray-500">
                <p>본 분석을 통해 도움이 되길 진심으로 기원합니다. </p>
                 <p>&copy; {new Date().getFullYear()} AI Saju Analysis. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default App;