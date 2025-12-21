/**
 * 템플릿 기반 운세 생성 시스템 - 타입 정의
 */

// 일주 성격 데이터 타입
export interface IljuPersonality {
  일주: string;
  한자: string;
  핵심특성: string;
  강점: string;
  소통스타일: string;
  감정표현: string;
  업무스타일: string;
  추가특징: string;
}

// 십이운성 테마 데이터 타입
export interface UnseongTheme {
  운성: string;
  한자: string;
  AE: number;
  에너지단계: string;
  핵심키워드: string;
  분위기: string;
  신체감각: string;
  심리상태: string;
  행동경향: string;
  조언톤: string;
  주의사항: string;
}

// 공휴일 메시지 타입
export interface HolidayMessage {
  날짜: string;
  이름: string;
  메시지: string;
  액션플랜: string[];
}

// 운세 템플릿 타입
export interface FortuneTemplates {
  opening_high_energy: string[];
  opening_medium_energy: string[];
  opening_low_energy: string[];
  main_work_active: string[];
  main_work_moderate: string[];
  main_work_rest: string[];
  main_relationship_positive: string[];
  main_relationship_moderate: string[];
  main_relationship_careful: string[];
  main_opportunity: string[];
  main_caution: string[];
  main_decision_go: string[];
  main_decision_wait: string[];
  main_decision_careful: string[];
  main_health_active: string[];
  main_health_moderate: string[];
  main_health_rest: string[];
  main_learning: string[];
  main_creativity: string[];
  main_money_positive: string[];
  main_money_careful: string[];
  closing_high_energy: string[];
  closing_medium_energy: string[];
  closing_low_energy: string[];
  action_plans_active: string[];
  action_plans_moderate: string[];
  action_plans_rest: string[];
  special_gwiin_positive: string[];
  titles_positive: string[];
  titles_moderate: string[];
  titles_rest: string[];
}

// 에너지 레벨 타입
export type EnergyLevel = 'high' | 'medium' | 'low';

// 활동 레벨 타입
export type ActivityLevel = 'active' | 'moderate' | 'rest';

// 운세 생성 입력 데이터
export interface FortuneInput {
  ilju: string;           // 일주 (예: "己丑")
  todayJiji: string;      // 오늘 지지 (예: "寅")
  sibsin: string;         // 십성 (예: "비견")
  unseong: string;        // 십이운성 (예: "장생")
  deukryeong: boolean;    // 득령 여부
  gwiin: boolean;         // 천을귀인 여부
  date: Date;             // 날짜 (시드용)
}

// 생성된 운세 출력
export interface GeneratedFortune {
  title: string;
  content: string;
  actionPlans: string[];
  mentalEnergy: number;
  energyLevel: EnergyLevel;
}

// 공휴일 정보
export interface HolidayInfo {
  name: string;
  type: 'fixed' | 'lunar' | 'weekly' | 'birthday';
  message: HolidayMessage;
}
