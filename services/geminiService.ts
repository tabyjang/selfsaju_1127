import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import type { SajuInfo, SajuAnalysisResult } from '../types';
import { getSewoonPillars } from '../utils/manse';
import { analyzeInteractions } from '../utils/interactions';

const handleApiError = (error: unknown, context: string): never => {
    if (error instanceof Error && error.name === 'AbortError') {
        throw error;
    }
    console.error(`Error during Gemini ${context}:`, error);
    // You can customize this error message for the user.
    throw new Error(`AI ${context} 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.`);
};

const raceWithAbort = <T>(promise: Promise<T>, signal: AbortSignal, errorMessage: string): Promise<T> => {
    return new Promise((resolve, reject) => {
        const onAbort = () => {
            const error = new Error(errorMessage);
            error.name = 'AbortError';
            reject(error);
        };

        if (signal.aborted) {
            onAbort();
            return;
        }

        signal.addEventListener('abort', onAbort, { once: true });

        promise.then(
            (result) => {
                signal.removeEventListener('abort', onAbort);
                resolve(result);
            },
            (err) => {
                signal.removeEventListener('abort', onAbort);
                reject(err);
            }
        );
    });
};


const callGemini = async (prompt: string, signal: AbortSignal): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.");
    }
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = 'gemini-2.5-flash';
        
        const resultPromise = ai.models.generateContent({ model, contents: prompt });
        const result = await raceWithAbort(resultPromise, signal, 'Analysis was cancelled by the user.');
        
        // FIX: Cast result to GenerateContentResponse to access the 'text' property.
        return (result as GenerateContentResponse).text;
    } catch (error) {
        return handleApiError(error, '텍스트 분석');
    }
};

export const generateSajuImage = async (
    prompt: string,
    signal: AbortSignal
): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.");
    }

    // --- START MOCK IMPLEMENTATION (API DISABLED) ---
    console.log("--- generateSajuImage: USING MOCK DATA (API DISABLED) ---");
    await new Promise(resolve => setTimeout(resolve, 1000));
     if (signal.aborted) {
        const error = new Error('Image generation was cancelled by the user.');
        error.name = 'AbortError';
        throw error;
    }
    // Return a placeholder image from a service
    return `https://via.placeholder.com/512/111827/FFFFFF?text=Mock+Saju+Image`;
    // --- END MOCK IMPLEMENTATION ---

    /*
     try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const fullPrompt = `An artistic and symbolic digital painting of '${prompt}'. Mystical, vibrant colors, detailed, epic fantasy concept art style.`;
        
        const resultPromise = ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        const result = await raceWithAbort(resultPromise, signal, 'Image generation was cancelled by the user.');
        
        // FIX: Cast result to access 'generatedImages' property, as its type is not correctly inferred.
        const response = result as { generatedImages: { image: { imageBytes: string } }[] };
        
        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error('AI가 이미지를 생성하지 못했습니다.');
        }
    } catch (error) {
        return handleApiError(error, '이미지 생성');
    }
    */
};


export const analyzeSaju = async (
    sajuInfo: SajuInfo,
    prompts: { stage1: string, stage2: string, stage3: string },
    signal: AbortSignal
): Promise<SajuAnalysisResult> => {
    if (!process.env.API_KEY) {
        // Mock data doesn't need API key, but we keep this check for when it's re-enabled.
        // throw new Error("API 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.");
    }
    
    // --- START MOCK IMPLEMENTATION (API DISABLED) ---
    console.log("--- analyzeSaju: USING MOCK DATA (API DISABLED) ---");
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (signal.aborted) {
        const error = new Error('Analysis was cancelled by the user.');
        error.name = 'AbortError';
        throw error;
    }
    return {
        stage1: `## 1단계: [MOCK] 핵심 진단
*   **재미있는 비유**: "가을 들판의 황금 벼"
*   **오행**: "불의 기운이 강한 사주입니다."
*   **약점(병)**: "너무 뜨거운 기운이 문제입니다."
*   **해결책(약)**: "차가운 물(水)의 기운이 필요합니다."
*   **개운법**: "검은색 옷을 입고, 북쪽으로 여행을 떠나보세요."`,
        stage2: `## 2단계: [MOCK] 인생 주요 테마
*   **재물운**: "사업을 통해 큰 돈을 벌 수 있습니다."
*   **건강운**: "심장 및 혈관 계통의 질환을 조심해야 합니다."
*   **애정운**: "열정적이지만 다툼이 잦을 수 있습니다."

**[2단계 요약]**
마지막으로, 위 분석을 종합하여 이 사주의 재물, 건강, 애정운에 대한 **핵심적인 한 줄 요약(One-Line Summary)**을 각각 제시해주세요.
재물운: 사업가적 기질로 큰 성공을 거둘 수 있습니다.
건강운: 화(火) 기운이 강해 심혈관 계통의 관리가 중요합니다.
애정운: 뜨거운 사랑을 하지만, 감정 조절이 필요합니다.`,
        stage3: `## 3단계: [MOCK] 대운의 흐름
*   **초년운**: "학업에 어려움이 있었을 수 있습니다."
*   **중년운**: "30대부터 재물운이 크게 발복합니다."
*   **말년운**: "안정적이고 평화로운 노년을 보냅니다."`
    };
    // --- END MOCK IMPLEMENTATION ---

    /*
    const interactions = analyzeInteractions(sajuInfo.pillars);
    const sewoonPillars = getSewoonPillars(new Date().getFullYear(), 10, sajuInfo.pillars.day.cheonGan.char);

    const detailedSajuDataString = `
You are an expert in Saju (Four Pillars of Destiny). Analyze the provided information accurately and in detail according to the instructions below.

---
### 분석 대상 사주 정보

**사주 원국 (四柱 原局)**
- 년주(年柱): ${sajuInfo.pillars.year.ganji} (십이운성: ${sajuInfo.pillars.year.jiJi.unseong.name})
- 월주(月柱): ${sajuInfo.pillars.month.ganji} (십이운성: ${sajuInfo.pillars.month.jiJi.unseong.name})
- 일주(日柱): ${sajuInfo.pillars.day.ganji} (십이운성: ${sajuInfo.pillars.day.jiJi.unseong.name})
- 시주(時柱): ${sajuInfo.pillars.hour.ganji} (십이운성: ${sajuInfo.pillars.hour.jiJi.unseong.name})

**기본 정보**
- 성별: ${sajuInfo.gender === 'male' ? '남성' : '여성'}
- 대운 방향: ${sajuInfo.daewoon === 'sunhaeng' ? '순행' : '역행'}
- 대운수: ${sajuInfo.daewoonNumber}

**대운 (大運)의 흐름**
${sajuInfo.daewoonPillars.map(p => `- ${p.age}세 대운: ${p.ganji}`).join('\n')}

**세운 (世運)의 흐름 (향후 10년)**
${sewoonPillars.map(p => `- ${p.year}년 세운: ${p.ganji}`).join('\n')}

**지지 형충회합 (地支 刑冲會合)**
- 형(刑): ${interactions.hyeong.length > 0 ? interactions.hyeong.join(', ') : '해당 없음'}
- 충(冲): ${interactions.chung.length > 0 ? interactions.chung.join(', ') : '해당 없음'}
- 회(會): ${interactions.hoe.length > 0 ? interactions.hoe.join(', ') : '해당 없음'}
- 합(合): ${interactions.hab.length > 0 ? interactions.hab.join(', ') : '해당 없음'}
---
아래 지시사항에 따라 위의 사주 정보를 상세하고 정확하게 분석해주세요.
`;

    const promptStep1 = `${detailedSajuDataString}\n${prompts.stage1}`;
    const promptStep2 = `${detailedSajuDataString}\n${prompts.stage2}`;
    const promptStep3 = `${detailedSajuDataString}\n${prompts.stage3}`;

    try {
        const [stage1, stage2, stage3] = await Promise.all([
            callGemini(promptStep1, signal),
            callGemini(promptStep2, signal),
            callGemini(promptStep3, signal)
        ]);
        
        return { stage1, stage2, stage3 };

    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw error;
        }
        throw new Error("사주 분석 중 오류가 발생했습니다.");
    }
    */
};

export const createChatSession = (
    sajuInfo: SajuInfo,
    analysisResult: SajuAnalysisResult
): Chat => {
    if (!process.env.API_KEY) {
        // throw new Error("API 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.");
    }
    
    // --- START MOCK IMPLEMENTATION (API DISABLED) ---
    console.log("--- createChatSession: USING MOCK CHAT (API DISABLED) ---");
    
    // Mock sendMessageStream
    const sendMessageStream = async function* (params: { message: string }): AsyncGenerator<GenerateContentResponse, void, undefined> {
        const mockMessage = `[MOCK] 당신의 질문 "${params.message}"에 대한 답변입니다. 저는 현재 테스트 모드로 동작하고 있어 실제 AI 답변을 드릴 수 없습니다. 이 메시지는 API 연결이 해제되었음을 알리기 위한 것입니다.`;
        const words = mockMessage.split(' ');
        for (const word of words) {
            await new Promise(resolve => setTimeout(resolve, 50));
            // Mimic the structure of GenerateContentResponse
            yield { text: word + ' ' } as GenerateContentResponse;
        }
    };

    // Return a mock Chat object that matches the required interface
    return {
        sendMessageStream: (params: { message: string }) => {
            return {
                [Symbol.asyncIterator]: () => sendMessageStream(params)
            };
        },
    } as unknown as Chat; // Cast to Chat to satisfy the type checker
    // --- END MOCK IMPLEMENTATION ---

    /*
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const systemInstruction = `You are a helpful Saju (Four Pillars of Destiny) expert. The user has just received the following analysis about their Saju. Your role is to answer any follow-up questions they have based on this context. Be friendly, insightful, and clear in your explanations.
    
    --- ANALYSIS CONTEXT ---
    [SAJU INFO]
    - Birth Date: ${sajuInfo.birthDate.year}-${sajuInfo.birthDate.month}-${sajuInfo.birthDate.day} ${sajuInfo.birthDate.hour}:${sajuInfo.birthDate.minute}
    - Gender: ${sajuInfo.gender}
    - Day Pillar: ${sajuInfo.pillars.day.ganji}
    
    [STAGE 1 SUMMARY]
    ${analysisResult.stage1.substring(0, 500)}...
    
    [STAGE 2 SUMMARY]
    ${analysisResult.stage2.substring(0, 500)}...
    
    [STAGE 3 SUMMARY]
    ${analysisResult.stage3.substring(0, 500)}...
    --- END OF CONTEXT ---
    
    Now, begin the conversation with the user.`;

    const chatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        },
    });

    return chatSession;
    */
};