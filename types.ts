export type Gender = 'male' | 'female';
export type Daewoon = 'sunhaeng' | 'yeokhaeng';
export type Ohaeng = 'wood' | 'fire' | 'earth' | 'metal' | 'water';
export type YinYang = 'yang' | 'yin';

// Legacy type for form input before full calculation
export interface SajuData {
  gender: Gender;
  characters: string[];
  daewoon: Daewoon;
  daewoonNumber: number;
}

// --- New Rich Saju Info Types ---

export interface Sibsin {
  name: string;
  hanja: string;
}

export interface Unseong {
  name: string;
  hanja: string;
}

export interface Gan {
  char: string;
  ohaeng: Ohaeng;
  sibsin: Sibsin;
}

export interface Ji extends Gan {
  jijanggan: Gan[];
  unseong: Unseong;
}

export interface Pillar {
  cheonGan: Gan;
  jiJi: Ji;
  label: string;
  ganji: string;
}

export interface DaewoonPillar {
  age: number;
  ganji: string;
  cheonGan: Gan;
  jiJi: Ji;
}

export interface SewoonPillar {
  year: number;
  ganji: string;
  cheonGan: Gan;
  jiJi: Ji;
}

export interface WolwoonPillar {
  month: number; // 양력 월 (1-12)
  monthName: string; // 월 이름 (인월, 묘월, ...)
  ganji: string; // 간지 (庚寅, 辛卯, ...)
  cheonGan: Gan;
  jiJi: Ji;
}
export interface SajuInfo {
  name?: string; // 이름 (선택 필드)
  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    hour: Pillar;
  };
  gender: Gender;
  daewoon: Daewoon;
  daewoonNumber: number;
  daewoonPillars: DaewoonPillar[];
  birthRegion: string;
  birthDate: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
}

export interface SajuAnalysisResult {
  stage1: string;
  stage2: string;
  stage3: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

// ============================================
// 격국(格局) 관련 타입
// ============================================

/**
 * 격국 판단 결과
 */
export interface GeokgukResult {
  판단가능: boolean;
  격국?: {
    격명칭: string;
    격용신: string; // 격을 이루는 천간
    격분류: '내격' | '외격';
    월지: string;
    용신?: {
      천간: string;
      십성: string;
      설명: string;
    };
    성격상태: '성격' | '파격';
    강도: '강' | '중' | '약';
    신뢰도: number; // 0-100
    판단근거: {
      방법: string;
      투출천간?: string[];
      일간체크?: string;
      합국여부?: string | null;
    };
    해석: string;
  };
  메시지?: string;
  이유?: string[];
}