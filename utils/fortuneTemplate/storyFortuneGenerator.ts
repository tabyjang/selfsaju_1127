/**
 * 스토리 기반 운세 생성기
 * 짧고 강렬한 시적 운세를 생성
 */

import { FortuneInput, GeneratedFortune } from './types';
import { loadStoryForIlju, selectStoryVersion } from './storyLoader';
import { dateToSeed, calculateMentalEnergy, calculateEnergyLevel, calculateActivityLevel } from './templateSelector';
import { convertMarkdownToHtml } from './markdownToHtml';
import { checkHoliday } from './holidayChecker';
import { getHolidayMessage } from './dataLoader';
import { replaceHolidayPlaceholders, replaceStoryPlaceholders } from './placeholderReplacer';
import { getIljuPersonality } from './dataLoader';

/**
 * 스토리 기반 운세 생성 (메인 함수)
 *
 * @param input - 운세 생성 입력 데이터
 * @param userBirthday - 사용자 생일 (선택, 'MM-DD' 형식)
 * @returns 생성된 운세
 */
export async function generateStoryFortune(
  input: FortuneInput,
  userBirthday?: string
): Promise<GeneratedFortune> {
  // 1. 공휴일/특별한 날 체크
  const holiday = checkHoliday(input.date, userBirthday);

  if (holiday) {
    return await generateHolidayFortune(input, holiday.name, userBirthday);
  }

  // 2. 스토리 기반 일반 운세 생성
  return await generateRegularStoryFortune(input);
}

/**
 * 공휴일 운세 생성
 */
async function generateHolidayFortune(
  input: FortuneInput,
  holidayName: string,
  userBirthday?: string
): Promise<GeneratedFortune> {
  const seed = dateToSeed(input.date);

  // 일주 성격 데이터 로드
  const iljuData = await getIljuPersonality(input.ilju, seed);

  // 공휴일 메시지 로드
  const holidayMessage = await getHolidayMessage(holidayName);

  // 플레이스홀더 치환
  const content = replaceHolidayPlaceholders(holidayMessage.메시지, iljuData);
  const actionPlans = [
    holidayMessage.액션플랜.map(plan =>
      replaceHolidayPlaceholders(plan, iljuData)
    ).join(' ')
  ];

  // 마크다운을 HTML로 변환
  const contentHtml = convertMarkdownToHtml(content);

  // 공휴일 운세는 에너지 레벨을 중간으로 설정
  return {
    title: holidayMessage.이름,
    content: contentHtml,
    actionPlans,
    mentalEnergy: 5,
    energyLevel: 'medium',
    activityLevel: 'moderate',
  };
}

/**
 * 일반 스토리 운세 생성
 */
async function generateRegularStoryFortune(
  input: FortuneInput
): Promise<GeneratedFortune> {
  // 1. 날짜 기반 시드 생성
  const seed = dateToSeed(input.date);

  // 2. 일주별 스토리 데이터 로드 (Lazy Loading)
  const iljuStories = await loadStoryForIlju(input.ilju);

  if (!iljuStories) {
    throw new Error(`스토리 로드 실패: ${input.ilju}`);
  }

  // 3. 오늘 운성에 해당하는 스토리 버전 선택
  const story = selectStoryVersion(iljuStories, input.unseong, seed);

  if (!story) {
    throw new Error(`${input.unseong} 운세 없음: ${input.ilju}`);
  }

  // 4. 일주 성격 데이터 로드 (플레이스홀더 치환용)
  const iljuPersonalityData = await loadIljuPersonalityData(input.ilju);

  // 5. 플레이스홀더 치환
  const replacedContent = replaceStoryPlaceholders(story.본문, iljuPersonalityData, seed);
  const replacedAction = replaceStoryPlaceholders(story.액션, iljuPersonalityData, seed);

  // 6. 에너지 계산 (기존 로직 유지)
  const unseongAE = getUnseongAE(input.unseong);
  const mentalEnergy = calculateMentalEnergy(
    unseongAE,
    input.deukryeong,
    input.gwiin,
    input.sibsin
  );
  const energyLevel = calculateEnergyLevel(mentalEnergy);
  const activityLevel = calculateActivityLevel(mentalEnergy);

  // 7. 본문 HTML 변환
  const contentHtml = convertMarkdownToHtml(replacedContent);

  // 8. 최종 운세 반환
  return {
    title: story.제목,
    content: contentHtml,
    actionPlans: [replacedAction], // 1개만!
    mentalEnergy,
    energyLevel,
    activityLevel,
  };
}

/**
 * 일주 성격 데이터 로드 (플레이스홀더 치환용)
 * ilju_personalities.json에서 데이터를 로드
 */
async function loadIljuPersonalityData(ilju: string): Promise<any> {
  try {
    const data = await import('../../today_unse/ilju_personalities.json');
    const personalityData = data.default[ilju];

    if (!personalityData) {
      console.warn(`일주 성격 데이터 없음: ${ilju}`);
      return {
        핵심특성: [],
        소통스타일: [],
        감정표현: [],
        업무스타일: [],
      };
    }

    return personalityData;
  } catch (error) {
    console.error('일주 성격 데이터 로드 실패:', error);
    return {
      핵심특성: [],
      소통스타일: [],
      감정표현: [],
      업무스타일: [],
    };
  }
}

/**
 * 십이운성별 AE 값 (활동 에너지)
 */
function getUnseongAE(unseong: string): number {
  const aeMap: { [key: string]: number } = {
    '장생': 4,
    '목욕': 5,
    '관대': 6,
    '건록': 7,
    '제왕': 7,
    '쇠': 6,
    '병': 5,
    '사': 3,
    '묘': 2,
    '절': 2,
    '태': 3,
    '양': 4,
  };

  return aeMap[unseong] || 4;
}

/**
 * 운세를 마크다운 형식으로 포맷팅
 */
export function formatStoryFortune(fortune: GeneratedFortune): string {
  let result = `**${fortune.title}**\n\n`;
  result += `${fortune.content}\n\n`;
  result += `오늘의 액션:\n${fortune.actionPlans[0]}\n`;
  return result;
}
