interface TarotDrawRecord {
  date: string;         // YYYY-MM-DD
  cardId: number;
  drawnAt: number;      // Unix timestamp
}

const STORAGE_KEY = 'tarot_daily_draws';

export function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function hasDrawnToday(): boolean {
  const record = getTodayDrawRecord();
  return record !== null;
}

export function getTodayDrawRecord(): TarotDrawRecord | null {
  const today = getTodayDateString();
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) return null;

  try {
    const records: TarotDrawRecord[] = JSON.parse(stored);
    return records.find(r => r.date === today) || null;
  } catch (e) {
    console.error('Failed to parse tarot records:', e);
    return null;
  }
}

export function saveTodayDraw(cardId: number): void {
  const today = getTodayDateString();
  const newRecord: TarotDrawRecord = {
    date: today,
    cardId,
    drawnAt: Date.now()
  };

  const stored = localStorage.getItem(STORAGE_KEY);
  let records: TarotDrawRecord[] = stored ? JSON.parse(stored) : [];

  // 오늘 날짜의 기존 기록 제거
  records = records.filter(r => r.date !== today);
  records.push(newRecord);

  // 최근 30일만 유지
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  records = records.filter(r => r.drawnAt > thirtyDaysAgo);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function clearDrawHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
