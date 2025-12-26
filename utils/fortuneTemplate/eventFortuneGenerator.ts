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
import { fixKoreanParticles } from './placeholderReplacer';

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
  // 날짜 정보 (먼저 계산하여 seed를 먼저 생성)
  const seed = dateToSeed(input.date);
  const weekday = getWeekday(input.date);

  // 데이터 로드 (seed를 전달하여 다양성 확보)
  const iljuData = await getIljuPersonality(input.ilju, seed);
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

  // 요일 테마 (플레이스홀더 치환)
  const weekdayThemeRaw = iljuEvents.요일별테마[weekday];
  const weekdayTheme = replacePlaceholdersSimple(weekdayThemeRaw, iljuData);

  // 에너지 조합 메시지 (플레이스홀더 치환)
  const energyMessageRaw = iljuEvents.에너지조합[energyCombo];
  const energyMessage = replacePlaceholdersSimple(energyMessageRaw, iljuData);

  // 제목: event_closing_exciting에서 랜덤 선택
  const titleRaw = selectFromArray(
    templates.event_closing_exciting || ['오늘의 특별한 순간'],
    seed + 10
  );
  const title = replacePlaceholdersSimple(titleRaw, iljuData).replace(/\*\*/g, ''); // ** 제거

  // 액션 플랜: 이벤트 기반 동적 생성 (일주 특성 반영)
  const actionPlans = generateEventActionPlans(
    iljuData,
    iljuEvents,
    eventCategories,
    weekday,
    energyLevel,
    seed
  );

  // 최종 운세 조합 (closing 메시지 제거)
  const content = `${opening}\n\n${energyMessage}\n\n${mainParts.join('\n\n')}\n\n**${weekday}의 테마**\n${weekdayTheme}`;

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
 * 일주 특성을 풍부하게 반영하여 개인화된 오프닝 생성
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
  // 첫 번째 이벤트 미리보기 (플레이스홀더 치환)
  const firstEventRaw = selectFromArray(iljuEvents.오늘의이벤트[firstEventCategory], seed);
  const firstEvent = replacePlaceholdersSimple(firstEventRaw, iljuData);

  // 일주 특성 중 하나만 랜덤 선택 (중복 제거)
  const traitOptions = [
    iljuData.핵심특성,
    iljuData.강점 + ' 있는',
    iljuData.소통스타일,
    iljuData.감정표현,
    iljuData.업무스타일,
  ];
  const selectedTrait = selectFromArray(traitOptions, seed + 100);

  const personalityIntro = `**${selectedTrait} 당신, 오늘을 보내세요.**`;

  return `${personalityIntro}\n\n${firstEvent}`;
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
      // 폴백: 템플릿이 없으면 이벤트 그대로 사용 (플레이스홀더 치환)
      const categoryEmoji = {
        '인연': '💫',
        '재미': '😄',
        '행운': '🍀',
        '영감': '💡',
        '도전': '🚀',
      };
      const eventProcessed = replacePlaceholdersSimple(event, iljuData);
      template = `${categoryEmoji[category]} **${category}**: ${eventProcessed}`;
    }

    parts.push(template);
  });

  return parts;
}

/**
 * 이벤트 기반 액션 플랜 생성
 * 일주 특성을 반영한 개인화된 액션 플랜
 */
function generateEventActionPlans(
  iljuData: IljuPersonality,
  iljuEvents: IljuDailyEvent,
  eventCategories: EventCategory[],
  weekday: Weekday,
  energyLevel: EnergyLevel,
  seed: number
): string[] {
  const plans: string[] = [];

  // 1. 요일별 액션 (일주 특성 반영)
  const weekdayAction = generatePersonalizedWeekdayAction(iljuData, weekday, energyLevel, seed);
  plans.push(weekdayAction);

  // 2. 이벤트 카테고리별 개인화 액션 2개
  eventCategories.slice(0, 2).forEach((category, index) => {
    const action = generatePersonalizedCategoryAction(iljuData, category, seed + index + 30);
    plans.push(action);
  });

  return plans;
}

/**
 * 요일별 개인화 액션 생성
 */
function generatePersonalizedWeekdayAction(
  iljuData: IljuPersonality,
  weekday: Weekday,
  energyLevel: EnergyLevel,
  seed: number
): string {
  // 강점에서 첫 번째 단어만 추출
  const firstStrength = iljuData.강점.split(',')[0].trim();

  const weekdayTemplates: { [key in Weekday]: string[] } = {
    '월요일': [
      `이번 주 목표 명확히 정하기`,
      `${firstStrength}을(를) 활용해 한 주 계획 세우기`,
      `우선순위 정리하기`,
      `이번 주 가장 중요한 일 먼저 떠올려보기`,
      `${firstStrength}을(를) 믿고 이번 주 도전 과제 설정하기`,
      `월요일 아침 루틴 확립하기`,
      `조용히 앉아 이번 주 목표 마음속에 정리하기`,
      `${firstStrength}을(를) 발휘할 기회 찾아보기`,
      `한 주 동안 집중할 핵심 정하기`,
      `이번 주에 이루고 싶은 것 마음속에 그리기`
    ],
    '화요일': [
      `오늘은 실행에 집중하기`,
      `${firstStrength}을(를) 활용해 업무 속도 높이기`,
      `어제의 경험 되돌아보며 오늘 방향 잡기`,
      `가장 중요한 일부터 처리하기`,
      `${firstStrength}으(로) 어려운 과제 돌파하기`,
      `동료와 협력해 일 효율적으로 진행하기`,
      `당신답게 리듬 찾아가기`,
      `${firstStrength}을(를) 믿고 과감하게 진행하기`,
      `작은 성취에도 스스로 칭찬하기`,
      `집중력 최고조로 끌어올리기`
    ],
    '수요일': [
      `진행 상황 체크하기`,
      `${firstStrength}을(를) 활용해 중간 점검하기`,
      `필요한 부분 조정하며 방향 재확인하기`,
      `방향 재설정할 시간 갖기`,
      `${firstStrength}으(로) 부족한 부분 보완하기`,
      `팀원들과 상태 공유하며 협력하기`,
      `당신답게 균형 찾기`,
      `${firstStrength}을(를) 발휘해 남은 일정 계획하기`,
      `지금까지 온 것 스스로 격려하기`,
      `주중 피로 풀 방법 찾기`
    ],
    '목요일': [
      `주말 전 완료할 것 정리하기`,
      `${firstStrength}을(를) 발휘해 속도 높이기`,
      `마무리 준비하며 남은 일정 확인하기`,
      `금요일 전 해결할 것 우선순위 매기기`,
      `${firstStrength}으(로) 밀린 일 정리하기`,
      `동료들과 진행 상황 확인하며 마무리 준비하기`,
      `당신답게 주말 계획 미리 세우기`,
      `${firstStrength}을(를) 활용해 효율적으로 일 처리하기`,
      `이번 주 성과 미리 정리해보기`,
      `주말까지 에너지 관리하기`
    ],
    '금요일': [
      `다음 주 준비하며 마무리하기`,
      `${firstStrength}을(를) 활용해 이번 주 성과 정리하기`,
      `한 주 되돌아보며 배운 점 정리하기`,
      `미완료 항목 다음 주로 이월하기`,
      `${firstStrength}으(로) 주요 성과 기록하기`,
      `팀원들께 감사 표현하며 한 주 마무리하기`,
      `당신답게 주말 재충전 계획 세우기`,
      `${firstStrength}을(를) 발휘한 순간 떠올리며 뿌듯해하기`,
      `이번 주 수고한 자신에게 선물하기`,
      `다음 주 월요일 준비 가볍게 하기`
    ],
    '토요일': [
      `여유롭게 취미 생활 즐기기`,
      `평소 못했던 활동 해보기`,
      `${firstStrength}을(를) 활용해 새로운 것 배워보기`,
      `친구들과 편하게 시간 보내기`,
      `당신답게 집 정리하며 마음 정돈하기`,
      `${firstStrength}을(를) 살려 개인 프로젝트 진행하기`,
      `좋아하는 것에 푹 빠져보기`,
      `운동하며 몸과 마음 리프레시하기`,
      `${firstStrength}으(로) 가족과 특별한 시간 만들기`,
      `자연 속에서 힐링하며 충전하기`
    ],
    '일요일': [
      `충분히 쉬면서 재충전하기`,
      `다음 주를 위한 에너지 충전하기`,
      `${firstStrength}을(를) 점검하며 자신감 회복하기`,
      `명상이나 요가하며 마음 정돈하기`,
      `당신답게 좋아하는 책이나 영화 즐기기`,
      `${firstStrength}을(를) 되새기며 일기 쓰기`,
      `느긋하게 브런치 즐기기`,
      `다음 주 간단히 미리보기`,
      `${firstStrength}을(를) 떠올리며 감사 일기 쓰기`,
      `완전히 디지털 디톡스하며 쉬기`
    ]
  };

  const templates = weekdayTemplates[weekday];
  return selectFromArray(templates, seed);
}

/**
 * 카테고리별 개인화 액션 생성
 */
function generatePersonalizedCategoryAction(
  iljuData: IljuPersonality,
  category: EventCategory,
  seed: number
): string {
  // 강점에서 첫 번째 단어만 추출
  const firstStrength = iljuData.강점.split(',')[0].trim();

  const categoryTemplates: { [key in EventCategory]: string[] } = {
    인연: [
      `오늘 만나는 사람들과 진심으로 소통하기`,
      `당신답게 새로운 인연에 열린 마음으로 다가가기`,
      `주변 사람들에게 먼저 연락해보기`,
      `${firstStrength}을(를) 활용해 협업 기회 적극 참여하기`,
      `관계에서 진정성 보여주기`,
      `상대방 마음 헤아리며 깊이 대화하기`,
      `${firstStrength}으(로) 팀워크 강화하기`,
      `네트워킹 기회 적극 만들어보기`,
      `오늘 만난 사람에게 긍정 에너지 전하기`,
      `소중한 인연에게 감사 표현하기`
    ],
    재미: [
      `평소 안 가던 새로운 곳 탐험해보기`,
      `즐거운 활동 계획하고 실천하기`,
      `${firstStrength}을(를) 살려 새로운 것 시도하며 즐거움 찾기`,
      `당신답게 여유롭게 시간 보내기`,
      `웃음 가득한 순간 만들기`,
      `${firstStrength}으(로) 창의적인 놀이 즐기기`,
      `주변 분위기 밝게 만들며 즐기기`,
      `일상 속 작은 재미 발견하기`,
      `유머 감각 발휘하며 즐겁게 보내기`,
      `${firstStrength}을(를) 활용해 즐거운 추억 만들기`
    ],
    행운: [
      `작은 행운에도 감사하는 마음 갖기`,
      `당신답게 긍정적인 마인드로 하루 시작하기`,
      `${firstStrength}을(를) 믿고 좋은 기회 주저 없이 잡기`,
      `직감 따라 결정해보기`,
      `행운을 끌어당기는 태도 유지하기`,
      `${firstStrength}으(로) 기회의 순간 포착하기`,
      `미뤄뒀던 일 오늘 처리하기`,
      `우연한 만남도 소중히 여기기`,
      `당신답게 행운의 신호 알아채기`,
      `${firstStrength}을(를) 발휘할 타이밍 잡기`
    ],
    영감: [
      `떠오르는 아이디어 바로 메모하기`,
      `${firstStrength}을(를) 활용해 다른 관점에서 문제 바라보기`,
      `산책하며 영감 얻기`,
      `관심 분야 조금이라도 공부해보기`,
      `예술 작품에서 영감 받기`,
      `${firstStrength}으(로) 창의적 사고 확장하기`,
      `창의적인 작업에 집중하기`,
      `평소와 다른 루틴으로 자극 받기`,
      `몽상하며 상상력 펼치기`,
      `${firstStrength}을(를) 활용해 독창적인 해결책 찾기`
    ],
    도전: [
      `평소 망설이던 제안 용기내서 말하기`,
      `${firstStrength}을(를) 믿고 안전지대에서 벗어나 도전하기`,
      `실패 두려워 말고 시도하기`,
      `새로운 목표 설정하고 첫걸음 떼기`,
      `${firstStrength}으(로) 어려운 과제에 도전하기`,
      `두려움 극복하며 앞으로 나아가기`,
      `새로운 방식으로 업무 처리해보기`,
      `당신답게 한계 뛰어넘기`,
      `${firstStrength}을(를) 발휘해 불가능해 보이는 것 시도하기`,
      `도전하는 자신에게 응원 보내기`
    ]
  };

  const templates = categoryTemplates[category];
  return selectFromArray(templates, seed);
}

/**
 * 간단한 플레이스홀더 치환
 */
function replacePlaceholdersSimple(
  template: string,
  iljuData: IljuPersonality
): string {
  // 강점에서 첫 번째 단어만 추출 (쉼표로 구분)
  const firstStrength = iljuData.강점.split(',')[0].trim();

  return template
    .replace(/\{ilju\.핵심특성\}/g, iljuData.핵심특성)
    .replace(/\{ilju\.강점\}/g, firstStrength)
    .replace(/\{ilju\.소통스타일\}/g, iljuData.소통스타일)
    .replace(/\{ilju\.감정표현\}/g, iljuData.감정표현)
    .replace(/\{ilju\.업무스타일\}/g, iljuData.업무스타일)
    .replace(/\{ilju\.추가특징\}/g, iljuData.추가특징 || '');
}

/**
 * 콘텐츠 소스 타입
 */
export type ContentSource =
  | '인연' | '재미' | '행운' | '영감' | '도전'  // 오늘의이벤트
  | '요일테마'
  | '에너지조합';

/**
 * 간단한 운세 출력 타입 (랜덤 1개 콘텐츠 + 액션플랜 1개)
 */
export interface SimpleFortune {
  content: string;        // 랜덤 선택된 1개 콘텐츠
  actionPlan: string;     // 액션플랜 1개
  source: ContentSource;  // 콘텐츠 출처
  energyLevel: EnergyLevel;
  activityLevel: ActivityLevel;
}

/**
 * 간단한 랜덤 운세 생성 (콘텐츠 1개 + 액션플랜 1개)
 * 시간대별예측 제외, 나머지 풀에서 랜덤 선택
 */
export async function generateSimpleFortune(
  input: FortuneInput
): Promise<SimpleFortune> {
  const seed = dateToSeed(input.date);
  const weekday = getWeekday(input.date);

  // 데이터 로드
  const iljuData = await getIljuPersonality(input.ilju, seed);
  const iljuEvents = await getIljuDailyEvent(input.ilju);
  const unseongData = await getUnseongTheme(input.unseong);

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

  // 모든 콘텐츠 풀 구성 (시간대별예측 제외)
  const contentPool: { content: string; source: ContentSource }[] = [];

  // 1. 오늘의이벤트 5개 카테고리
  const eventCategories: EventCategory[] = ['인연', '재미', '행운', '영감', '도전'];
  eventCategories.forEach(category => {
    iljuEvents.오늘의이벤트[category].forEach(item => {
      contentPool.push({
        content: replacePlaceholdersSimple(item, iljuData),
        source: category
      });
    });
  });

  // 2. 요일별테마 (해당 요일만)
  contentPool.push({
    content: replacePlaceholdersSimple(iljuEvents.요일별테마[weekday], iljuData),
    source: '요일테마'
  });

  // 3. 에너지조합 (해당 조합만)
  contentPool.push({
    content: replacePlaceholdersSimple(iljuEvents.에너지조합[energyCombo], iljuData),
    source: '에너지조합'
  });

  // 랜덤 선택 (seed 기반)
  const selectedIndex = seed % contentPool.length;
  const selected = contentPool[selectedIndex];

  // 액션플랜 1개 생성
  const actionPlan = generateSingleActionPlan(
    iljuData,
    selected.source === '요일테마' ? '행운' :
    selected.source === '에너지조합' ? '영감' :
    selected.source as EventCategory,
    weekday,
    seed
  );

  return {
    content: fixKoreanParticles(selected.content),
    actionPlan: fixKoreanParticles(actionPlan),
    source: selected.source,
    energyLevel,
    activityLevel,
  };
}

/**
 * 단일 액션플랜 생성
 */
function generateSingleActionPlan(
  iljuData: IljuPersonality,
  category: EventCategory,
  weekday: Weekday,
  seed: number
): string {
  // 50% 확률로 요일별 액션 or 카테고리별 액션
  const useWeekday = seed % 2 === 0;

  if (useWeekday) {
    return generatePersonalizedWeekdayAction(iljuData, weekday, 'medium', seed);
  } else {
    return generatePersonalizedCategoryAction(iljuData, category, seed);
  }
}
