/**
 * 운세 생성기 (메인)
 * 모든 컴포넌트를 조합하여 최종 운세 생성
 */

import { FortuneInput, GeneratedFortune } from './types';
import {
  loadFortuneTemplates,
  getIljuPersonality,
  getUnseongTheme,
  getHolidayMessage,
} from './dataLoader';
import { replacePlaceholders, replaceHolidayPlaceholders, replaceActionPlanPlaceholders } from './placeholderReplacer';
import {
  dateToSeed,
  selectFromArray,
  selectMultipleFromArray,
  calculateMentalEnergy,
  calculateEnergyLevel,
  calculateActivityLevel,
  getEnergySuffix,
  getActivitySuffix,
} from './templateSelector';
import { checkHoliday } from './holidayChecker';
import { convertMarkdownToHtml } from './markdownToHtml';
import { generateEventBasedFortune } from './eventFortuneGenerator';

/**
 * 템플릿 기반 운세 생성 (메인 함수)
 *
 * @param input - 운세 생성 입력 데이터
 * @param userBirthday - 사용자 생일 (선택, 'MM-DD' 형식)
 * @param useEventBased - 이벤트 기반 운세 사용 여부 (기본값: true)
 * @returns 생성된 운세
 *
 * @example
 * const fortune = await generateFortune({
 *   ilju: "己丑",
 *   todayJiji: "寅",
 *   sibsin: "비견",
 *   unseong: "장생",
 *   deukryeong: true,
 *   gwiin: false,
 *   date: new Date()
 * });
 */
export async function generateFortune(
  input: FortuneInput,
  userBirthday?: string,
  useEventBased: boolean = true
): Promise<GeneratedFortune> {
  // 1. 공휴일/특별한 날 체크
  const holiday = checkHoliday(input.date, userBirthday);

  if (holiday) {
    return await generateHolidayFortune(input, holiday.name);
  }

  // 2. 이벤트 기반 운세 생성 (기본값)
  if (useEventBased) {
    try {
      return await generateEventBasedFortune(input);
    } catch (error) {
      console.error('이벤트 기반 운세 생성 실패, 기존 방식으로 폴백:', error);
      // 폴백: 기존 템플릿 방식으로 생성
      return await generateRegularFortune(input);
    }
  }

  // 3. 기존 템플릿 방식 운세 생성
  return await generateRegularFortune(input);
}

/**
 * 공휴일 운세 생성
 */
async function generateHolidayFortune(
  input: FortuneInput,
  holidayName: string
): Promise<GeneratedFortune> {
  // 날짜 기반 시드 생성
  const seed = dateToSeed(input.date);

  // 일주 성격 데이터 로드
  const iljuData = await getIljuPersonality(input.ilju, seed);

  // 공휴일 메시지 로드
  const holidayMessage = await getHolidayMessage(holidayName);

  // 플레이스홀더 치환
  const content = replaceHolidayPlaceholders(holidayMessage.메시지, iljuData);
  const actionPlans = holidayMessage.액션플랜.map(plan =>
    replaceHolidayPlaceholders(plan, iljuData)
  );

  // 마크다운을 HTML로 변환
  const contentHtml = convertMarkdownToHtml(content);

  // 공휴일 운세는 에너지 레벨을 중간으로 설정
  return {
    title: `${holidayMessage.이름}`,
    content: contentHtml,
    actionPlans,
    mentalEnergy: 5,
    energyLevel: 'medium',
    activityLevel: 'moderate',
  };
}

/**
 * 일반 운세 생성
 */
async function generateRegularFortune(
  input: FortuneInput
): Promise<GeneratedFortune> {
  // 날짜 기반 시드 생성
  const seed = dateToSeed(input.date);

  // 데이터 로드
  const iljuData = await getIljuPersonality(input.ilju, seed);
  const unseongData = await getUnseongTheme(input.unseong);
  const templates = await loadFortuneTemplates();

  // ME (Mental Energy) 계산
  const mentalEnergy = calculateMentalEnergy(
    unseongData.AE,
    input.deukryeong,
    input.gwiin,
    input.sibsin
  );

  // 에너지 레벨 및 활동 레벨 계산
  const energyLevel = calculateEnergyLevel(mentalEnergy);
  const activityLevel = calculateActivityLevel(mentalEnergy);

  // 템플릿 선택
  const title = selectTitle(templates, energyLevel, seed);
  const opening = selectOpening(templates, energyLevel, seed);
  const mainParts = selectMainParts(templates, energyLevel, activityLevel, input.gwiin, seed);
  const closing = selectClosing(templates, energyLevel, seed);
  const actionPlansRaw = selectActionPlans(templates, activityLevel, seed);

  // 플레이스홀더 치환
  const titleFinal = replacePlaceholders(title, iljuData, unseongData);
  const openingFinal = replacePlaceholders(opening, iljuData, unseongData);
  const mainFinal = mainParts
    .map(part => replacePlaceholders(part, iljuData, unseongData))
    .join('\n\n');
  const closingFinal = replacePlaceholders(closing, iljuData, unseongData);
  const actionPlansFinal = replaceActionPlanPlaceholders(actionPlansRaw, iljuData, unseongData);

  // 최종 운세 조합
  const content = `${openingFinal}\n\n${mainFinal}\n\n${closingFinal}`;

  // 마크다운을 HTML로 변환
  const contentHtml = convertMarkdownToHtml(content);

  return {
    title: `[${titleFinal}]`,
    content: contentHtml,
    actionPlans: actionPlansFinal,
    mentalEnergy,
    energyLevel,
    activityLevel,
  };
}

/**
 * 제목 템플릿 선택
 */
function selectTitle(templates: any, energyLevel: string, seed: number): string {
  const key = `titles_${energyLevel === 'high' ? 'positive' : energyLevel === 'medium' ? 'moderate' : 'rest'}`;
  return selectFromArray(templates[key], seed);
}

/**
 * 오프닝 템플릿 선택
 */
function selectOpening(templates: any, energyLevel: string, seed: number): string {
  const key = `opening_${getEnergySuffix(energyLevel as any)}`;
  return selectFromArray(templates[key], seed + 1);
}

/**
 * 메인 파트 템플릿 선택 (3-4개)
 */
function selectMainParts(
  templates: any,
  energyLevel: string,
  activityLevel: string,
  gwiin: boolean,
  seed: number
): string[] {
  const parts: string[] = [];

  // 1. 일/업무 관련 (필수)
  const workKey = `main_work_${activityLevel}`;
  parts.push(selectFromArray(templates[workKey], seed + 2));

  // 2. 관계 관련 또는 기회/주의사항 (랜덤)
  const relationType = energyLevel === 'high' ? 'positive' : energyLevel === 'medium' ? 'moderate' : 'careful';
  const relationKey = `main_relationship_${relationType}`;
  parts.push(selectFromArray(templates[relationKey], seed + 3));

  // 3. 결정/선택 관련
  const decisionType = energyLevel === 'high' ? 'go' : energyLevel === 'medium' ? 'careful' : 'wait';
  const decisionKey = `main_decision_${decisionType}`;
  parts.push(selectFromArray(templates[decisionKey], seed + 4));

  // 4. 건강 관련
  const healthKey = `main_health_${activityLevel}`;
  parts.push(selectFromArray(templates[healthKey], seed + 5));

  // 5. 귀인이 있으면 특별 메시지 추가
  if (gwiin) {
    parts.push(selectFromArray(templates.special_gwiin_positive, seed + 6));
  }

  return parts;
}

/**
 * 클로징 템플릿 선택
 */
function selectClosing(templates: any, energyLevel: string, seed: number): string {
  const key = `closing_${getEnergySuffix(energyLevel as any)}`;
  return selectFromArray(templates[key], seed + 7);
}

/**
 * 액션플랜 템플릿 선택 (3개)
 */
function selectActionPlans(templates: any, activityLevel: string, seed: number): string[] {
  const key = `action_plans_${activityLevel}`;
  return selectMultipleFromArray(templates[key], seed + 8, 3);
}

/**
 * 운세를 마크다운 형식으로 포맷팅
 */
export function formatFortune(fortune: GeneratedFortune): string {
  let result = `**${fortune.title}**\n\n`;
  result += `${fortune.content}\n\n`;
  result += `오늘의 액션플랜:\n`;
  fortune.actionPlans.forEach(plan => {
    result += `- ${plan}\n`;
  });

  return result;
}
