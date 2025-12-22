export interface TarotCard {
  id: number;                    // 0-21
  arcana: 'major';
  name_en: string;               // "The Fool"
  name_ko: string;               // "바보"
  keywords: string[];            // ["새로운 시작", "순수함", "모험"]

  upright: {
    summary: string;             // 1-2문장 요약
    message: string;             // 3-4줄 메시지 ("오늘 하루 화이팅!" 포함)
    advice: string;              // 실천 조언
    energy: 'high' | 'medium' | 'low';
  };

  element?: 'wood' | 'fire' | 'earth' | 'metal' | 'water';  // 사주 연결용
}
