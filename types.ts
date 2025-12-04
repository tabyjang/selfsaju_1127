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

export interface SajuInfo {
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