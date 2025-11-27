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
  stage1: `## 1단계: 내 사주 핵심 진단 및 개운법 찾기

**목표:** 당신은 사주 초보자도 쉽게 이해할 수 있도록 설명하는 친절한 사주 멘토입니다. 아래 지시사항에 따라 이 사주의 핵심 특징을 분석하고, 삶에서 좋은 기운을 끌어오는 방법을 구체적으로 안내해주세요. 모든 답변은 마크다운 형식을 사용하여 명확하고 보기 좋게 정리해야 합니다.

**1. 내 사주의 핵심 캐릭터는? (일주와 오행 비유)**
*   이 사주의 주인공인 '일간(日干)'과 그 '일주(日柱)'의 특징을 누구나 알기 쉬운 **재미있는 비유(예: '불을 다루는 장인', '숲속의 현자')**를 들어 설명해주세요.
*   사주 전체에 분포된 '오행(五行)'의 구성을 보고, 어떤 기운이 많고 어떤 기운이 부족한지 알려주세요. 이것을 **하나의 그림이나 풍경(예: '물이 넘치는 호수', '뜨거운 용암 지대')**처럼 묘사하여 초보자가 직관적으로 이해할 수 있게 해주세요.

**2. 내 사주의 '약점(병)'과 '해결책(약)'은? (병약과 용신)**
*   위 분석을 바탕으로, 이 사주가 균형을 잡기 위해 해결해야 할 가장 근본적인 **'문제점(병)'**이 무엇인지 명확하게 진단해주세요. (예: "사주가 너무 차갑고 어두운 것이 문제입니다.")
*   이 문제점을 해결해 줄 결정적인 **'해결책(약)'**, 즉 이 사주의 '용신(用神)'이 어떤 오행인지 알려주세요. 왜 그 오행이 용신이 되는지 쉬운 말로 설명해주세요.

**3. 좋은 기운 끌어오기! (용신 활용 개운법)**
*   위에서 찾은 '용신'의 기운을 일상생활에서 실제로 끌어올 수 있는 **구체적이고 실용적인 '개운법(開運法)'**을 3가지 이상 제안해주세요.
    *   **행동:** 어떤 활동이나 습관이 도움이 될까요? (예: 등산, 요리, 명상 등)
    *   **환경:** 주변 환경(색상, 물건, 장소)을 어떻게 꾸미면 좋을까요?
    *   **인간관계:** 어떤 성향의 사람들과 어울리는 것이 도움이 될까요?

**[진단 요약]**
마지막으로, 위 모든 내용을 종합하여 이 사주의 핵심 진단과 가장 중요한 개운법 팁을 한두 문장으로 요약해주세요.`,
  stage2: `## 2단계: 인생의 주요 테마 분석 (재물, 건강, 애정)

**목표:** 당신은 사주 명리학의 관점에서 인생의 중요한 세 가지 영역인 재물, 건강, 애정에 대해 깊이 있고 통찰력 있는 분석을 제공하는 전문가입니다. 사주 원국과 1단계 분석 내용을 종합적으로 고려하여, 각 영역별로 긍정적인 부분, 주의할 점, 그리고 구체적인 조언을 마크다운 형식으로 명확하게 제시해주세요.

**1. 재물운 (財物運) 분석**
*   **타고난 재물 그릇:** 이 사주가 타고난 재물의 크기와 형태는 어떤가요? (예: 꾸준한 월급, 큰 규모의 사업, 투자 재물 등) 사주 구조(십신, 신강/신약 등)를 근거로 설명해주세요.
*   **돈을 버는 방법과 시기:** 어떤 방식으로 돈을 벌 때 가장 유리하며, 인생에서 재물운이 특히 강해지는 시기는 언제인가요? (용신운, 대운의 흐름과 연관 지어 설명)
*   **주의할 점과 재물 관리법:** 돈을 모으기 위해 주의해야 할 점이나 피해야 할 행동은 무엇인가요? 이 사주에 맞는 효과적인 재물 관리 팁을 알려주세요.

**2. 건강운 (健康運) 분석**
*   **타고난 건강 체질:** 사주 오행의 균형을 바탕으로, 이 사주가 특별히 주의해야 할 신체 부위나 질병은 무엇인가요? (예: 특정 오행의 과다/부족으로 인한 문제)
*   **건강을 지키는 생활 습관:** 이 사주의 약점을 보완하고 건강을 유지하기 위해 도움이 되는 음식, 운동, 생활 습관 등을 구체적으로 추천해주세요.
*   **건강이 특히 중요해지는 시기:** 대운이나 세운의 흐름 상 건강에 적신호가 켜질 수 있는 시기는 언제이며, 어떻게 대비해야 할까요?

**3. 애정운 (戀愛運) 분석**
*   **나의 연애 스타일과 매력:** 사주에 나타난 나의 연애 스타일은 어떤가요? (예: 안정적, 열정적, 친구 같은) 이성에게 어필하는 가장 큰 매력은 무엇인가요?
*   **잘 맞는 인연의 유형:** 어떤 성향이나 사주 구조를 가진 사람과 만났을 때 좋은 관계를 오래 유지할 수 있을까요? (일주, 오행 보완 관계 등을 활용)
*   **인연을 만나는 시기와 조언:** 인생에서 연애운이 강하게 들어오는 시기는 언제인가요? 좋은 인연을 만나기 위해 어떤 노력을 하면 좋을지 조언해주세요.

**[2단계 요약]**
마지막으로, 위 분석을 종합하여 이 사주의 재물, 건강, 애정운에 대한 **핵심적인 한 줄 요약(One-Line Summary)**을 각각 제시해주세요.`,
  stage3: `## 3단계: 인생 대운의 흐름과 미래 예측

**목표:** 당신은 시간의 흐름에 따른 인생의 변화를 예측하는 대운(大運) 분석 전문가입니다. 사주 원국과 1, 2단계 분석을 바탕으로, 인생 전체의 큰 흐름인 대운을 통찰력 있게 분석해주세요. 답변은 마크다운 형식을 사용하여 체계적으로 제시해야 합니다.

**1. 과거 대운 리뷰 (현재 대운 이전)**
*   이 사람이 거쳐온 과거 대운에 대해 간략하게 리뷰해주세요. 각 10년의 시기별 핵심적인 특징과 경험했을 법한 주요 이슈(예: 학업, 진로, 인간관계, 건강 등)는 무엇이었을지 요약해주세요.

**2. 현재와 미래 30년 심층 분석 (가장 중요)**
*   **현재 대운:** 지금 어떤 환경과 기운 속에 있는지, 이 시기의 주요 과제와 기회는 무엇인지 심층적으로 분석해주세요. 재물, 직업, 건강, 애정, 학업 등 구체적인 영역별로 어떤 긍정적/부정적 변화가 예상되는지 자세히 설명해주세요.
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
                setError(e instanceof Error ? e.message : "An unknown error occurred during analysis.");
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
             const errorMessage = e instanceof Error ? e.message : "AI와 대화 중 알 수 없는 오류가 발생했습니다.";
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
                        AI 사주 분석
                    </h1>
                </header>

                <SajuInputForm onAnalyze={handleAnalysis} isLoading={isLoading} />

                {error && (
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
                <p>본 분석은 AI에 의해 생성되었으며, 참고용으로만 활용해 주시기 바랍니다.</p>
                 <p>&copy; {new Date().getFullYear()} AI Saju Analysis. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default App;