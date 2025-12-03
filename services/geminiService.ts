import { Chat, GenerateContentResponse } from "@google/genai";
import type { SajuInfo, SajuAnalysisResult } from '../types';
import { getSewoonPillars } from '../utils/manse';
import { analyzeInteractions } from '../utils/interactions';
import { API_BASE_URL } from '../config';

const handleApiError = (error: unknown, context: string): never => {
    if (error instanceof Error && error.name === 'AbortError') {
        throw error;
    }
    console.error(`Error during Gemini ${context}:`, error);
    throw new Error('');
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
    try {
        const resultPromise = fetch(`${API_BASE_URL}/api/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
            signal
        }).then(async (res) => {
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            const data = await res.json();
            return data.text;
        });

        return await raceWithAbort(resultPromise, signal, 'Analysis was cancelled by the user.');
    } catch (error) {
        return handleApiError(error, '텍스트 분석');
    }
};

export const generateSajuImage = async (
    prompt: string,
    signal: AbortSignal
): Promise<string> => {
    // Mock implementation - 실제 이미지 생성은 비용이 많이 들어 모의 데이터 사용
    console.log("--- generateSajuImage: USING MOCK DATA ---");
    await new Promise(resolve => setTimeout(resolve, 1000));
     if (signal.aborted) {
        const error = new Error('Image generation was cancelled by the user.');
        error.name = 'AbortError';
        throw error;
    }
    return `https://via.placeholder.com/512/111827/FFFFFF?text=Mock+Saju+Image`;
};


export const analyzeSaju = async (
    sajuInfo: SajuInfo,
    prompts: { stage1: string, stage2: string, stage3: string },
    signal: AbortSignal
): Promise<SajuAnalysisResult> => {
    console.log('=== AI에게 전달되는 sajuInfo 객체 ===');
    console.log(JSON.stringify(sajuInfo, null, 2));

    const interactions = analyzeInteractions(sajuInfo.pillars);
    const sewoonPillars = getSewoonPillars(new Date().getFullYear(), 10, sajuInfo.pillars.day.cheonGan.char);

    const detailedSajuDataString = `
You are an expert in Saju (Four Pillars of Destiny). Analyze the provided information accurately and in detail according to the instructions below.

---
### 분석 대상 사주 정보

**생년월일시 및 기본 정보**
- 생년월일시: ${sajuInfo.birthDate.year}년 ${sajuInfo.birthDate.month}월 ${sajuInfo.birthDate.day}일 ${sajuInfo.birthDate.hour}시 ${sajuInfo.birthDate.minute}분
- 성별: ${sajuInfo.gender === 'male' ? '남성' : '여성'}
- 대운 방향: ${sajuInfo.daewoon === 'sunhaeng' ? '순행' : '역행'}
- 대운수: ${sajuInfo.daewoonNumber}

**사주 8글자 (四柱 八字)**
- 년주(年柱): ${sajuInfo.pillars.year.ganji} [천간: ${sajuInfo.pillars.year.cheonGan.char}, 지지: ${sajuInfo.pillars.year.jiJi.char}]
- 월주(月柱): ${sajuInfo.pillars.month.ganji} [천간: ${sajuInfo.pillars.month.cheonGan.char}, 지지: ${sajuInfo.pillars.month.jiJi.char}]
- 일주(日柱): ${sajuInfo.pillars.day.ganji} [천간: ${sajuInfo.pillars.day.cheonGan.char}, 지지: ${sajuInfo.pillars.day.jiJi.char}]
- 시주(時柱): ${sajuInfo.pillars.hour.ganji} [천간: ${sajuInfo.pillars.hour.cheonGan.char}, 지지: ${sajuInfo.pillars.hour.jiJi.char}]

**십이운성 정보**
- 년주 십이운성: ${sajuInfo.pillars.year.jiJi.unseong.name}
- 월주 십이운성: ${sajuInfo.pillars.month.jiJi.unseong.name}
- 일주 십이운성: ${sajuInfo.pillars.day.jiJi.unseong.name}
- 시주 십이운성: ${sajuInfo.pillars.hour.jiJi.unseong.name}

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

    console.log('=== AI에게 전달되는 최종 텍스트 ===');
    console.log(detailedSajuDataString);
    console.log('==================');

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
        throw new Error('');
    }
};

export const createChatSession = (
    sajuInfo: SajuInfo,
    analysisResult: SajuAnalysisResult
): Chat => {
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

    // 백엔드 API를 호출하는 Chat 객체 생성
    const sendMessageStream = async function* (params: { message: string }): AsyncGenerator<GenerateContentResponse, void, undefined> {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: params.message,
                systemInstruction
            })
        });

        if (!response.ok) {
            throw new Error(`Chat API error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
            throw new Error('No response body');
        }

        let buffer = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') return;

                    try {
                        const parsed = JSON.parse(data);
                        yield { text: parsed.text } as GenerateContentResponse;
                    } catch (e) {
                        console.error('Failed to parse SSE data:', e);
                    }
                }
            }
        }
    };

    return {
        sendMessageStream: (params: { message: string }) => {
            return {
                [Symbol.asyncIterator]: () => sendMessageStream(params)
            };
        },
    } as unknown as Chat;
};
