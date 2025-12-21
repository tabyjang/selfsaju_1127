/**
 * 이벤트 기반 운세 생성기
 * 일주별 구체적 이벤트와 에너지 조합을 활용한 운세 생성
 */

import {
  FortuneInput,
  GeneratedFortune,
  IljuDailyEvent,
  IljuPersonality,
  UnseongTheme,
  EnergyCombo,
  EventCategory,
  Weekday,
  EnergyLevel,
  ActivityLevel,
} from './types';
import {
  getIljuPersonality,
  getIljuDailyEvent,
  getUnseongTheme,
  loadFortuneTemplates,
} from './dataLoader';
import {
  dateToSeed,
  selectFromArray,
  selectMultipleFromArray,
  calculateMentalEnergy,
  calculateEnergyLevel,
  calculateActivityLevel,
} from './templateSelector';
import { convertMarkdownToHtml } from './markdownToHtml';

/**
 * 에너지 조합 계산
 * 활동 에너지(AE) + 마음 에너지(ME)를 조합하여 9가지 중 하나 반환
 */
function calculateEnergyCombo(
  activityLevel: ActivityLevel,
  mentalEnergyLevel: EnergyLevel
): EnergyCombo {
  const activityMap = {
    active: '높음',
    moderate: '보통',
    rest: '낮음',
  };

  const mentalMap = {
    high: '높음',
    medium: '보통',
    low: '낮음',
  };

  const activity = activityMap[activityLevel];
  const mental = mentalMap[mentalEnergyLevel];

  return `활동${activity}_마음${mental}` as EnergyCombo;
}

/**
 * 요일 계산
 */
function getWeekday(date: Date): Weekday {
  const weekdays: Weekday[] = [
    '일요일',
    '월요일',
    '화요일',
    '수요일',
    '목요일',
    '금요일',
    '토요일',
  ];
  return weekdays[date.getDay()];
}

/**
 * 에너지 레벨에 따라 이벤트 카테고리 선택
 */
function selectEventCategories(
  energyLevel: EnergyLevel,
  seed: number
): EventCategory[] {
  const allCategories: EventCategory[] = ['인연', '재미', '행운', '영감', '도전'];

  if (energyLevel === 'high') {
    // 높은 에너지: 인연, 도전, 행운 중심
    const primary: EventCategory[] = ['인연', '도전', '행운'];
    return selectMultipleFromArray(primary, seed, 2) as EventCategory[];
  } else if (energyLevel === 'medium') {
    // 중간 에너지: 균형있게
    return selectMultipleFromArray(allCategories, seed, 2) as EventCategory[];
  } else {
    // 낮은 에너지: 영감, 재미 중심 (가벼운 것들)
    const primary: EventCategory[] = ['영감', '재미', '인연'];
    return selectMultipleFromArray(primary, seed, 2) as EventCategory[];
  }
}

/**
 * 이벤트 기반 운세 생성
 */
export async function generateEventBasedFortune(
  input: FortuneInput
): Promise<GeneratedFortune> {
  // 데이터 로드
  const iljuData = await getIljuPersonality(input.ilju);
  const iljuEvents = await getIljuDailyEvent(input.ilju);
  const unseongData = await getUnseongTheme(input.unseong);
  const templates = await loadFortuneTemplates();

  // 에너지 계산
  const mentalEnergy = calculateMentalEnergy(
    unseongData.AE,
    input.deukryeong,
    input.gwiin,
    input.sibsin
  );
  const energyLevel = calculateEnergyLevel(mentalEnergy);
  const activityLevel = calculateActivityLevel(mentalEnergy);
  const energyCombo = calculateEnergyCombo(activityLevel, energyLevel);

  // 날짜 정보
  const seed = dateToSeed(input.date);
  const weekday = getWeekday(input.date);

  // 이벤트 카테고리 선택 (3개)
  const eventCategories = selectEventCategories(energyLevel, seed);

  // 오프닝: 에너지 상태 + 이벤트 프리뷰
  const opening = generateEventOpening(
    iljuData,
    iljuEvents,
    energyLevel,
    activityLevel,
    mentalEnergy,
    eventCategories[0],
    seed
  );

  // 메인 파트: 구체적 이벤트 3개
  const mainParts = generateEventMainParts(
    iljuData,
    iljuEvents,
    templates,
    eventCategories,
    seed
  );

  // 시간대별 예측
  const timePrediction = generateTimePrediction(iljuEvents, seed);

  // 요일 테마
  const weekdayTheme = iljuEvents.요일별테마[weekday];

  // 에너지 조합 메시지
  const energyMessage = iljuEvents.에너지조합[energyCombo];

  // 클로징
  const closing = selectFromArray(
    templates.event_closing_exciting || templates[`closing_${energyLevel === 'high' ? 'high' : energyLevel === 'medium' ? 'medium' : 'low'}_energy`],
    seed + 10
  );
  const closingFinal = replacePlaceholdersSimple(closing, iljuData);

  // 액션 플랜: 이벤트 기반 동적 생성
  const actionPlans = generateEventActionPlans(
    iljuEvents,
    eventCategories,
    weekday,
    seed
  );

  // 최종 운세 조합
  const title = `오늘의 특별한 순간`;
  const content = `${opening}\n\n${energyMessage}\n\n${mainParts.join('\n\n')}\n\n**${weekday}의 테마**\n${weekdayTheme}\n\n${timePrediction}\n\n${closingFinal}`;

  // HTML 변환
  const contentHtml = convertMarkdownToHtml(content);

  return {
    title,
    content: contentHtml,
    actionPlans,
    mentalEnergy,
    energyLevel,
    activityLevel,
  };
}

/**
 * 이벤트 오프닝 생성
 */
function generateEventOpening(
  iljuData: IljuPersonality,
  iljuEvents: IljuDailyEvent,
  energyLevel: EnergyLevel,
  activityLevel: ActivityLevel,
  mentalEnergy: number,
  firstEventCategory: EventCategory,
  seed: number
): string {
  // 에너지 표시
  const activityEmoji = activityLevel === 'active' ? '🔥🔥🔥' : activityLevel === 'moderate' ? '🔥🔥' : '🔥';
  const mentalEmoji = energyLevel === 'high' ? '💎💎💎' : energyLevel === 'medium' ? '💎💎' : '💎';

  // 첫 번째 이벤트 미리보기 - 전체 이벤트 사용 (더 이상 자르지 않음)
  const firstEvent = selectFromArray(iljuEvents.오늘의이벤트[firstEventCategory], seed);

  const activityText = activityLevel === 'active' ? '높음' : activityLevel === 'moderate' ? '보통' : '낮음';
  const mentalText = energyLevel === 'high' ? '높음' : energyLevel === 'medium' ? '보통' : '낮음';

  return `${activityEmoji} **활동 에너지 ${activityText}**  ${mentalEmoji} **마음 에너지 ${mentalText}**\n\n**${iljuData.핵심특성} 당신에게 오늘은 특별해요!**\n\n${firstEvent}`;
}

/**
 * 이벤트 메인 파트 생성 (3개)
 */
function generateEventMainParts(
  iljuData: IljuPersonality,
  iljuEvents: IljuDailyEvent,
  templates: any,
  eventCategories: EventCategory[],
  seed: number
): string[] {
  const parts: string[] = [];

  eventCategories.forEach((category, index) => {
    const event = selectFromArray(iljuEvents.오늘의이벤트[category], seed + index + 1);
    const templateKey = `event_main_${
      category === '인연' ? 'connection' :
      category === '재미' ? 'fun' :
      category === '행운' ? 'luck' :
      category === '영감' ? 'inspiration' :
      'challenge'
    }`;

    let template = '';
    if (templates[templateKey] && templates[templateKey].length > 0) {
      template = selectFromArray(templates[templateKey], seed + index + 10);
      template = template.replace('{event_detail}', event);
      template = replacePlaceholdersSimple(template, iljuData);
    } else {
      // 폴백: 템플릿이 없으면 이벤트 그대로 사용
      const categoryEmoji = {
        '인연': '💫',
        '재미': '😄',
        '행운': '🍀',
        '영감': '💡',
        '도전': '🚀',
      };
      template = `${categoryEmoji[category]} **${category}**: ${event}`;
    }

    parts.push(template);
  });

  return parts;
}

/**
 * 시간대별 예측 생성
 */
function generateTimePrediction(iljuEvents: IljuDailyEvent, seed: number): string {
  const timePeriods = ['오전', '점심', '오후', '저녁'];
  const selectedPeriod = selectFromArray(timePeriods, seed + 20);
  const prediction = iljuEvents.시간대별예측[selectedPeriod as keyof typeof iljuEvents.시간대별예측];

  return `**⏰ 오늘의 골든타임: ${selectedPeriod}**\n${prediction}`;
}

/**
 * 이벤트 기반 액션 플랜 생성
 */
function generateEventActionPlans(
  iljuEvents: IljuDailyEvent,
  eventCategories: EventCategory[],
  weekday: Weekday,
  seed: number
): string[] {
  const plans: string[] = [];

  // 액션 플랜용 템플릿 (명령형)
  const actionTemplates = {
    인연: [
      "오늘 만나는 사람들과 진심으로 소통하기",
      "새로운 인연에 열린 마음으로 다가가기",
      "주변 사람들에게 먼저 연락해보기",
      "협업 기회가 있다면 적극적으로 참여하기",
      "오래된 인연에게 안부 메시지 보내기"
    ],
    재미: [
      "점심시간에 평소 안 가던 곳 가보기",
      "퇴근 후 재미있는 활동 하나 계획하기",
      "유머 감각 발휘해서 분위기 밝게 만들기",
      "새로운 것 시도하며 즐거움 찾기",
      "친구들과 가볍게 수다 떨 시간 갖기"
    ],
    행운: [
      "작은 행운에도 감사하는 마음 갖기",
      "평소 미뤄뒀던 일 오늘 처리하기",
      "긍정적인 마인드로 하루 시작하기",
      "좋은 기회 오면 망설이지 말고 잡기",
      "직감을 믿고 결정하기"
    ],
    영감: [
      "새로운 아이디어 떠오르면 바로 메모하기",
      "창의적인 작업에 집중할 시간 만들기",
      "다른 관점에서 문제 바라보기",
      "산책하며 머리 식히고 영감 얻기",
      "평소 관심 있던 분야 조금이라도 공부하기"
    ],
    도전: [
      "새로운 방식으로 업무 처리해보기",
      "평소 망설이던 제안 용기내서 말하기",
      "안전지대에서 벗어나 도전하기",
      "실패 두려워하지 말고 시도하기",
      "배우고 싶던 것 오늘 바로 시작하기"
    ]
  };

  // 1. 요일 테마를 액션으로 변환
  const weekdayActions: { [key in Weekday]: string } = {
    '월요일': '한 주 계획 세우고 우선순위 정리하기',
    '화요일': '어제 시작한 일 집중해서 진행하기',
    '수요일': '중간 점검하고 방향 조정하기',
    '목요일': '마무리 준비하며 속도 높이기',
    '금요일': '이번 주 성과 정리하고 다음 주 준비하기',
    '토요일': '평소 못했던 취미 활동 즐기기',
    '일요일': '충분히 쉬면서 에너지 충전하기'
  };
  plans.push(weekdayActions[weekday]);

  // 2. 이벤트 카테고리별 액션 2개 추가
  eventCategories.slice(0, 2).forEach((category, index) => {
    const categoryActions = actionTemplates[category];
    const action = selectFromArray(categoryActions, seed + index + 30);
    plans.push(action);
  });

  return plans;
}

/**
 * 간단한 플레이스홀더 치환
 */
function replacePlaceholdersSimple(
  template: string,
  iljuData: IljuPersonality
): string {
  return template
    .replace(/\{ilju\.핵심특성\}/g, iljuData.핵심특성)
    .replace(/\{ilju\.강점\}/g, iljuData.강점)
    .replace(/\{ilju\.소통스타일\}/g, iljuData.소통스타일)
    .replace(/\{ilju\.감정표현\}/g, iljuData.감정표현)
    .replace(/\{ilju\.업무스타일\}/g, iljuData.업무스타일);
}
