import type { TarotCard } from './types';

const tarotFileMap: Record<number, string> = {
  0: 'TAROT-00_fool.json',
  1: 'TAROT-01_magician.json',
  2: 'TAROT-02_priestess.json',
  3: 'TAROT-03_empress.json',
  8: 'TAROT-08_strength.json',
  9: 'TAROT-09_hermit.json',
  10: 'TAROT-10_fortune.json',
  17: 'TAROT-17_star.json',
  18: 'TAROT-18_moon.json',
  19: 'TAROT-19_sun.json',
};

export async function loadTarotCard(cardId: number): Promise<TarotCard | null> {
  const filename = tarotFileMap[cardId];
  if (!filename) {
    console.error(`Invalid tarot card ID: ${cardId}`);
    return null;
  }

  const url = new URL(`../DB_tarot_22/${filename}`, import.meta.url);

  const fetchOptions: RequestInit = import.meta.env.DEV
    ? { cache: 'no-store' }
    : { cache: 'default' };

  try {
    const res = await fetch(url, fetchOptions);
    if (!res.ok) throw new Error(`Failed to load card ${cardId}`);

    const data: unknown = await res.json();

    // 기본 검증
    if (!data || typeof data !== 'object') return null;
    const obj = data as Record<string, unknown>;
    if (typeof obj.id !== 'number' || !obj.name_ko || !obj.upright) return null;

    return data as TarotCard;
  } catch (error) {
    console.error(`Error loading tarot card ${cardId}:`, error);
    return null;
  }
}

// 사용 가능한 카드 ID 목록 반환
export function getAvailableCardIds(): number[] {
  return Object.keys(tarotFileMap).map(Number);
}
