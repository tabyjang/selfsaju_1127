# 타로 카드 운세 기능 구현 계획서

## 📋 프로젝트 개요

**목표**: 대시보드의 "만세력 달력" 카드를 "오늘의 타로 운세" 카드로 교체하여 사용자 참여도와 재방문율 향상

**구현 범위**:
- 메이저 아르카나 22장 (The Fool ~ The World)
- 하루 1회 제한 (localStorage 기반)
- 샘플 카드 10장 (나머지는 추후 확장)
- 임시 이미지 사용 (추후 교체 가능)
- 신비로운 애니메이션 효과

---

## 🎯 핵심 기능

### 1. 카드 섹션 (대시보드)
- 위치: 대시보드 오른쪽 상단 (기존 만세력 달력 자리)
- 디자인: 보라색/인디고 그라데이션, 신비로운 분위기
- 상태별 표시:
  - **미뽑음**: "카드 뽑기" 버튼 + 🔮 아이콘
  - **이미 뽑음**: "다시보기" + 뽑은 카드명 표시

### 2. 카드 뽑기 애니메이션 (3단계)
1. **Shuffle** (2초): 카드 뒷면 5장이 bounce 애니메이션
2. **Spread** (사용자 선택): 7장의 카드 펼침, 클릭 대기
3. **Flip** (1.5초): 선택한 카드 180도 회전하며 앞면 공개

### 3. 결과 모달
- 카드 이미지 (앞면)
- 카드명 + 키워드 배지
- 오늘의 메시지 (3-4줄, "오늘 하루 화이팅!" 포함)
- 실천 조언
- (선택) 사주와의 연결 메시지

### 4. 하루 1회 제한
- localStorage에 날짜별 기록 저장
- 자정(00:00) 이후 리셋
- 이미 뽑은 경우 같은 카드 다시 보여줌

---

## 📁 파일 구조

```
utils/
  tarot/
    ├── types.ts              # TypeScript 인터페이스 정의
    ├── loadTarotCard.ts      # 카드 데이터 로더 (Vite dynamic import)
    └── dailyDrawChecker.ts   # 하루 1회 제한 로직

  DB_tarot_22/
    ├── TAROT-00_fool.json           # 바보
    ├── TAROT-01_magician.json       # 마법사
    ├── TAROT-02_priestess.json      # 여사제
    ├── TAROT-03_empress.json        # 여황제
    ├── TAROT-08_strength.json       # 힘
    ├── TAROT-09_hermit.json         # 은둔자
    ├── TAROT-10_fortune.json        # 운명의 수레바퀴
    ├── TAROT-17_star.json           # 별
    ├── TAROT-18_moon.json           # 달
    └── TAROT-19_sun.json            # 태양

public/
  tarot/
    ├── back.png              # 카드 뒷면 디자인
    ├── 00_fool.png           # 앞면 이미지들 (임시)
    ├── 01_magician.png
    └── ... (22장)

pages/
  DashboardPage.tsx           # 메인 통합 파일 (카드 섹션 + 모달)

index.css                     # flip-card 애니메이션 CSS 추가
```

---

## 🔨 구현 단계

### Phase 1: 데이터 준비 (2-3시간)

#### 1.1 TypeScript 타입 정의
**파일**: `utils/tarot/types.ts`

```typescript
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
```

#### 1.2 샘플 JSON 파일 10개 작성
**위치**: `utils/DB_tarot_22/`

**예시**: `TAROT-00_fool.json`
```json
{
  "id": 0,
  "arcana": "major",
  "name_en": "The Fool",
  "name_ko": "바보",
  "keywords": ["새로운 시작", "순수함", "모험", "신뢰"],
  "upright": {
    "summary": "순수한 마음으로 새로운 여정을 떠날 준비가 되었습니다.",
    "message": "오늘은 걱정 대신 호기심을 선택하세요. 낯선 길도 당신의 순수한 마음이 있다면 두렵지 않습니다. 실수를 두려워 말고 한 걸음 내딛으세요. 오늘 하루 화이팅!",
    "advice": "새로운 경험에 열린 마음으로 다가가보세요. 완벽하지 않아도 괜찮습니다.",
    "energy": "high"
  },
  "element": "wood"
}
```

**작성할 10개 카드** (다양한 분위기):
1. **00_fool** (긍정, 새로운 시작) - 위 예시
2. **01_magician** (긍정, 창조력)
3. **02_priestess** (중립, 직관)
4. **03_empress** (긍정, 풍요)
5. **08_strength** (긍정, 용기)
6. **09_hermit** (중립/도전, 성찰)
7. **10_fortune** (중립, 변화)
8. **17_star** (긍정, 희망)
9. **18_moon** (도전, 불확실)
10. **19_sun** (긍정, 기쁨)

#### 1.3 임시 이미지 준비
**위치**: `public/tarot/`
- **규격**: 600x840px (2.5:3.5 비율), PNG
- **파일명**: `00_fool.png`, `01_magician.png`, ...
- **임시 방법**:
  - 단순 컬러 박스 + 카드명 텍스트
  - 또는 무료 아이콘 + 그라데이션
  - back.png: 보라색 패턴 디자인

---

### Phase 2: 데이터 로더 구현 (2-3시간)

#### 2.1 카드 로더
**파일**: `utils/tarot/loadTarotCard.ts`

```typescript
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
```

#### 2.2 하루 1회 제한 체커
**파일**: `utils/tarot/dailyDrawChecker.ts`

```typescript
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
```

---

### Phase 3: DashboardPage 통합 (4-5시간)

#### 3.1 State 추가
**파일**: `pages/DashboardPage.tsx` (상단)

```typescript
// 기존 imports에 추가
import type { TarotCard } from '../utils/tarot/types';
import { loadTarotCard } from '../utils/tarot/loadTarotCard';
import { getTodayDrawRecord, saveTodayDraw } from '../utils/tarot/dailyDrawChecker';

// State hooks 추가 (line ~70 부근)
const [showTarotDrawing, setShowTarotDrawing] = useState<boolean>(false);
const [showTarotResult, setShowTarotResult] = useState<boolean>(false);
const [drawStage, setDrawStage] = useState<'shuffle' | 'spread' | 'flip'>('shuffle');
const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
const [todayDrawnCard, setTodayDrawnCard] = useState<TarotCard | null>(null);
const [isFlipped, setIsFlipped] = useState<boolean>(false);
```

#### 3.2 초기 체크 로직 (useEffect)
```typescript
// 페이지 로드 시 오늘 뽑았는지 확인 (line ~90 부근)
useEffect(() => {
  const record = getTodayDrawRecord();
  if (record) {
    // 이미 뽑음 - 카드 로드
    loadTarotCard(record.cardId).then(card => {
      if (card) setTodayDrawnCard(card);
    });
  }
}, []);
```

#### 3.3 카드 섹션 교체
**위치**: lines 537-574 (만세력 달력 카드 삭제 후 교체)

```tsx
{/* 오늘의 타로 운세 카드 */}
<div
  onClick={handleTarotCardClick}
  className="group relative bg-gradient-to-br from-purple-100 via-indigo-100 to-violet-100 rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-purple-200 hover:border-indigo-300 w-full md:w-80"
>
  {/* 배경 장식 */}
  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200/50 to-indigo-200/50 rounded-full blur-2xl group-hover:blur-3xl transition-all"></div>
  <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-violet-200/50 to-purple-200/50 rounded-full blur-2xl group-hover:blur-3xl transition-all"></div>

  <div className="relative z-10">
    <div className="flex items-center gap-3 mb-3">
      <div className="text-4xl animate-sparkle">🔮</div>
      <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
        오늘의 타로 운세
      </h3>
    </div>
    <p className="text-sm text-gray-700 mb-4 leading-relaxed">
      오늘 나에게 필요한<br />
      <span className="font-semibold text-purple-700">특별한 메시지</span>를 받아보세요 ✨
    </p>

    {todayDrawnCard ? (
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <span className="text-2xl">⭐</span>
          <span className="text-sm text-purple-600 font-semibold">
            {todayDrawnCard.name_ko}
          </span>
        </div>
        <div className="flex items-center gap-1 text-purple-600 font-semibold text-sm group-hover:gap-2 transition-all">
          <span>다시보기</span>
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    ) : (
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <span className="text-2xl">🌙</span>
          <span className="text-2xl">✨</span>
          <span className="text-2xl">🌟</span>
        </div>
        <div className="flex items-center gap-1 text-purple-600 font-semibold text-sm group-hover:gap-2 transition-all">
          <span>카드 뽑기</span>
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    )}
  </div>

  {/* 반짝이는 효과 */}
  <div className="absolute top-4 right-4 w-2 h-2 bg-purple-300 rounded-full animate-ping"></div>
  <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-indigo-300 rounded-full animate-pulse"></div>
</div>
```

#### 3.4 클릭 핸들러
```typescript
const handleTarotCardClick = () => {
  if (todayDrawnCard) {
    // 이미 뽑음 - 바로 결과 모달
    setSelectedCard(todayDrawnCard);
    setShowTarotResult(true);
  } else {
    // 새로 뽑기 - 애니메이션 시작
    setShowTarotDrawing(true);
    setDrawStage('shuffle');

    // 2초 후 spread 단계로
    setTimeout(() => {
      setDrawStage('spread');
    }, 2000);
  }
};

const handleCardSelect = (index: number) => {
  // 사용 가능한 카드 ID 목록
  const availableIds = [0, 1, 2, 3, 8, 9, 10, 17, 18, 19];
  const randomId = availableIds[Math.floor(Math.random() * availableIds.length)];

  loadTarotCard(randomId).then(card => {
    if (card) {
      setSelectedCard(card);
      setDrawStage('flip');
      setIsFlipped(true);

      // localStorage에 저장
      saveTodayDraw(card.id);
      setTodayDrawnCard(card);

      // 2초 후 모달로 전환
      setTimeout(() => {
        setShowTarotDrawing(false);
        setShowTarotResult(true);
        setIsFlipped(false);
      }, 2000);
    }
  }).catch(error => {
    console.error('카드 로드 실패:', error);
    setShowTarotDrawing(false);
  });
};
```

#### 3.5 애니메이션 오버레이
**위치**: DashboardPage return문 안, 모달들 위에 추가

```tsx
{/* 타로 뽑기 애니메이션 */}
{showTarotDrawing && (
  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-fade-in">
    {/* Stage 1: Shuffle */}
    {drawStage === 'shuffle' && (
      <div className="text-center">
        <p className="text-white text-2xl mb-8 animate-pulse">
          카드를 섞고 있습니다...
        </p>
        <div className="flex gap-4 justify-center">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-24 h-36 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-lg animate-bounce shadow-2xl"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <img src="/tarot/back.png" alt="카드" className="w-full h-full object-cover rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Stage 2: Spread */}
    {drawStage === 'spread' && (
      <div className="text-center">
        <p className="text-white text-2xl mb-8">
          마음에 와닿는 카드를 선택하세요
        </p>
        <div className="flex gap-6 justify-center flex-wrap">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              onClick={() => handleCardSelect(i)}
              className="w-28 h-40 cursor-pointer transform transition-all hover:scale-110 hover:-translate-y-4 animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <img
                src="/tarot/back.png"
                alt="카드 선택"
                className="w-full h-full object-cover rounded-lg shadow-2xl hover:shadow-purple-500/50"
              />
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Stage 3: Flip */}
    {drawStage === 'flip' && selectedCard && (
      <div className="text-center">
        <div className="flip-card w-64 h-96 mx-auto">
          <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
            <div className="flip-card-front">
              <img src="/tarot/back.png" alt="뒷면" className="w-full h-full object-cover rounded-xl shadow-2xl" />
            </div>
            <div className="flip-card-back">
              <img
                src={`/tarot/${selectedCard.id.toString().padStart(2, '0')}_${selectedCard.name_en.toLowerCase().replace(/\s+/g, '_')}.png`}
                alt={selectedCard.name_ko}
                className="w-full h-full object-cover rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
)}
```

#### 3.6 결과 모달
**위치**: 애니메이션 오버레이 다음

```tsx
{/* 타로 결과 모달 */}
{showTarotResult && selectedCard && (
  <div
    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
    onClick={() => setShowTarotResult(false)}
  >
    <div
      className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 헤더 */}
      <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 p-6 rounded-t-2xl flex justify-between items-center z-10">
        <h2 className="text-2xl md:text-3xl font-bold text-white">오늘의 타로 카드</h2>
        <button
          onClick={() => setShowTarotResult(false)}
          className="text-white hover:text-gray-200 transition"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 내용 */}
      <div className="p-6 space-y-6">
        {/* 카드 이미지 */}
        <div className="text-center">
          <img
            src={`/tarot/${selectedCard.id.toString().padStart(2, '0')}_${selectedCard.name_en.toLowerCase().replace(/\s+/g, '_')}.png`}
            alt={selectedCard.name_ko}
            className="w-48 h-72 mx-auto rounded-xl shadow-2xl"
          />
        </div>

        {/* 카드명 */}
        <div className="text-center">
          <div className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold mb-2">
            {selectedCard.name_en}
          </div>
          <h3 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
            {selectedCard.name_ko}
          </h3>
        </div>

        {/* 키워드 배지 */}
        <div className="flex flex-wrap gap-2 justify-center">
          {selectedCard.keywords.map((keyword, idx) => (
            <span
              key={idx}
              className="px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-full text-sm font-semibold border border-purple-200"
            >
              {keyword}
            </span>
          ))}
        </div>

        {/* 메시지 */}
        <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-50 p-6 rounded-xl border-2 border-purple-200 shadow-lg">
          <h4 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
            <span>💫</span> 오늘의 메시지
          </h4>
          <p className="text-base md:text-lg font-normal leading-relaxed text-gray-800 whitespace-pre-line">
            {selectedCard.upright.message}
          </p>
        </div>

        {/* 실천 조언 */}
        <div className="bg-white/80 p-6 rounded-xl border-2 border-gray-200 shadow-lg">
          <h4 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span>💡</span> 실천 조언
          </h4>
          <p className="text-base font-normal leading-relaxed text-gray-800">
            {selectedCard.upright.advice}
          </p>
        </div>
      </div>
    </div>
  </div>
)}
```

---

### Phase 4: CSS 애니메이션 추가 (30분)

**파일**: `index.css` (하단에 추가)

```css
/* 타로 카드 뒤집기 애니메이션 */
.flip-card {
  perspective: 1000px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}

.flip-card-inner.flipped {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 0.75rem;
}

.flip-card-back {
  transform: rotateY(180deg);
}
```

---

## 📦 샘플 데이터 (10개 카드)

### 1. The Fool (0) - 바보
```json
{
  "id": 0,
  "arcana": "major",
  "name_en": "The Fool",
  "name_ko": "바보",
  "keywords": ["새로운 시작", "순수함", "모험", "신뢰"],
  "upright": {
    "summary": "순수한 마음으로 새로운 여정을 떠날 준비가 되었습니다.",
    "message": "오늘은 걱정 대신 호기심을 선택하세요. 낯선 길도 당신의 순수한 마음이 있다면 두렵지 않습니다. 실수를 두려워 말고 한 걸음 내딛으세요. 오늘 하루 화이팅!",
    "advice": "새로운 경험에 열린 마음으로 다가가보세요. 완벽하지 않아도 괜찮습니다.",
    "energy": "high"
  },
  "element": "wood"
}
```

### 2. The Magician (1) - 마법사
```json
{
  "id": 1,
  "arcana": "major",
  "name_en": "The Magician",
  "name_ko": "마법사",
  "keywords": ["창조력", "의지", "능력", "시작"],
  "upright": {
    "summary": "당신 안에 잠든 무한한 가능성을 깨울 때입니다.",
    "message": "오늘 당신은 원하는 것을 이룰 수 있는 모든 도구를 가지고 있습니다. 망설이지 말고 당신의 능력을 믿으세요. 작은 것부터 시작해보세요. 그 작은 시작이 큰 변화를 만들 것입니다. 오늘 하루 화이팅!",
    "advice": "미루던 일을 오늘 시작해보세요. 첫 걸음이 가장 중요합니다.",
    "energy": "high"
  },
  "element": "fire"
}
```

### 3. The High Priestess (2) - 여사제
```json
{
  "id": 2,
  "arcana": "major",
  "name_en": "The High Priestess",
  "name_ko": "여사제",
  "keywords": ["직관", "내면", "신비", "지혜"],
  "upright": {
    "summary": "머리보다 가슴의 소리에 귀 기울일 때입니다.",
    "message": "오늘은 조용히 내면의 목소리를 들어보세요. 당신의 직관이 이미 답을 알고 있습니다. 서두르지 말고 천천히, 당신만의 속도로 나아가세요. 고요함 속에서 진짜 지혜가 찾아올 것입니다. 오늘 하루 화이팅!",
    "advice": "중요한 결정이 있다면 혼자만의 시간을 가져보세요. 명상이나 산책이 도움됩니다.",
    "energy": "medium"
  },
  "element": "water"
}
```

### 4. The Empress (3) - 여황제
```json
{
  "id": 3,
  "arcana": "major",
  "name_en": "The Empress",
  "name_ko": "여황제",
  "keywords": ["풍요", "모성", "창조", "자연"],
  "upright": {
    "summary": "당신 안팎으로 아름다운 것들이 자라나고 있습니다.",
    "message": "오늘은 당신이 가꾸고 키워온 것들이 열매를 맺는 날입니다. 자신에게 관대해지고, 주변 사람들에게도 따뜻한 마음을 나눠보세요. 당신의 풍요로움이 모두를 행복하게 만들 것입니다. 오늘 하루 화이팅!",
    "advice": "좋아하는 음식을 먹거나 자연 속에서 시간을 보내며 에너지를 충전하세요.",
    "energy": "high"
  },
  "element": "earth"
}
```

### 5. Strength (8) - 힘
```json
{
  "id": 8,
  "arcana": "major",
  "name_en": "Strength",
  "name_ko": "힘",
  "keywords": ["용기", "인내", "부드러움", "내적힘"],
  "upright": {
    "summary": "진짜 용기는 강함이 아니라 부드러움에서 나옵니다.",
    "message": "오늘 당신에게 필요한 건 무력이 아니라 따뜻한 용기입니다. 힘든 상황도 부드럽게 감싸 안으면 변화시킬 수 있어요. 당신 안에 이미 충분한 힘이 있습니다. 오늘 하루 화이팅!",
    "advice": "화가 날 때 한 발 물러서서 상황을 바라보세요. 침착함이 최고의 무기입니다.",
    "energy": "high"
  },
  "element": "fire"
}
```

### 6. The Hermit (9) - 은둔자
```json
{
  "id": 9,
  "arcana": "major",
  "name_en": "The Hermit",
  "name_ko": "은둔자",
  "keywords": ["성찰", "고독", "탐구", "내적성장"],
  "upright": {
    "summary": "혼자만의 시간이 필요한 날입니다.",
    "message": "오늘은 다른 사람의 시선에서 벗어나 나 자신에게 집중하세요. 외로움이 아니라 나를 더 깊이 알아가는 소중한 시간입니다. 이 고요함이 당신을 더 단단하게 만들어줄 것입니다. 오늘 하루 화이팅!",
    "advice": "SNS를 잠시 내려놓고 책을 읽거나 일기를 써보세요.",
    "energy": "low"
  },
  "element": "earth"
}
```

### 7. Wheel of Fortune (10) - 운명의 수레바퀴
```json
{
  "id": 10,
  "arcana": "major",
  "name_en": "Wheel of Fortune",
  "name_ko": "운명의 수레바퀴",
  "keywords": ["변화", "순환", "운명", "기회"],
  "upright": {
    "summary": "인생의 수레바퀴가 당신에게 유리한 방향으로 돌고 있습니다.",
    "message": "오늘은 예상치 못한 좋은 변화가 찾아올 수 있는 날입니다. 흐름에 몸을 맡기고 새로운 기회를 잡으세요. 모든 것은 때가 있으니, 지금이 바로 당신의 때입니다. 오늘 하루 화이팅!",
    "advice": "평소와 다른 길로 출근하거나, 새로운 사람을 만나보세요. 운명적 만남이 기다릴 수 있습니다.",
    "energy": "medium"
  },
  "element": "water"
}
```

### 8. The Star (17) - 별
```json
{
  "id": 17,
  "arcana": "major",
  "name_en": "The Star",
  "name_ko": "별",
  "keywords": ["희망", "치유", "영감", "평온"],
  "upright": {
    "summary": "어둠 끝에 반짝이는 희망의 빛이 보입니다.",
    "message": "힘들었던 시간들이 이제 천천히 아물고 있습니다. 오늘은 당신에게 희망과 평온이 찾아오는 날입니다. 별빛처럼 작지만 분명한 기쁨을 발견하게 될 것입니다. 오늘 하루 화이팅!",
    "advice": "감사한 일 세 가지를 떠올려보세요. 작은 것들이 큰 위안이 됩니다.",
    "energy": "medium"
  },
  "element": "water"
}
```

### 9. The Moon (18) - 달
```json
{
  "id": 18,
  "arcana": "major",
  "name_en": "The Moon",
  "name_ko": "달",
  "keywords": ["불확실", "환상", "무의식", "감정"],
  "upright": {
    "summary": "모든 것이 명확하지 않아도 괜찮습니다.",
    "message": "오늘은 조금 불안하거나 혼란스러울 수 있습니다. 하지만 달빛 아래서 길을 찾듯, 천천히 나아가면 됩니다. 모든 답을 지금 알 필요는 없어요. 당신의 감정을 있는 그대로 느껴보세요. 오늘 하루 화이팅!",
    "advice": "큰 결정은 내일로 미루고, 오늘은 충분히 쉬어주세요.",
    "energy": "low"
  },
  "element": "water"
}
```

### 10. The Sun (19) - 태양
```json
{
  "id": 19,
  "arcana": "major",
  "name_en": "The Sun",
  "name_ko": "태양",
  "keywords": ["기쁨", "성공", "활력", "긍정"],
  "upright": {
    "summary": "눈부신 햇살이 당신의 하루를 비춥니다.",
    "message": "오늘은 당신에게 최고로 좋은 날입니다! 모든 일이 잘 풀리고, 주변 사람들도 당신의 밝은 에너지에 이끌릴 것입니다. 웃으며 하루를 시작하세요. 당신의 미소가 세상을 바꿉니다. 오늘 하루 화이팅!",
    "advice": "좋아하는 사람에게 먼저 연락해보세요. 기쁨을 나누면 두 배가 됩니다.",
    "energy": "high"
  },
  "element": "fire"
}
```

---

## ✅ 테스트 체크리스트

### 기능 테스트
- [ ] 카드 섹션이 대시보드에 정상 표시
- [ ] 🔮 아이콘에 sparkle 애니메이션 적용
- [ ] 클릭 시 애니메이션 시작
- [ ] Shuffle 단계 (2초) → Spread 단계 자동 전환
- [ ] 7장의 카드 클릭 가능
- [ ] Flip 애니메이션 정상 작동
- [ ] 결과 모달 정상 표시
- [ ] 모든 데이터 필드 렌더링 확인 (이름, 키워드, 메시지, 조언)
- [ ] localStorage에 날짜/카드ID 저장 확인
- [ ] 새로고침 후에도 "다시보기" 표시
- [ ] 다음날 자정 이후 다시 뽑기 가능
- [ ] 모달 닫기 버튼 작동
- [ ] 모달 외부 클릭으로 닫기

### UI/UX 테스트
- [ ] 보라색/인디고 테마 일관성
- [ ] 애니메이션 부드러움 (60fps)
- [ ] 이미지 로딩 에러 없음
- [ ] 모바일 반응형 (320px~)
- [ ] 태블릿 레이아웃 정상
- [ ] Hover 효과 작동

### 브라우저 호환성
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## 🚀 배포 전 확인사항

1. **이미지 최적화**
   - [ ] 모든 이미지 200KB 이하
   - [ ] WebP 포맷 변환 고려

2. **코드 정리**
   - [ ] Console.log 제거
   - [ ] 주석 정리
   - [ ] 사용하지 않는 import 제거

3. **에러 핸들링**
   - [ ] loadTarotCard 실패 시 사용자 알림
   - [ ] 이미지 로드 실패 시 placeholder 표시

4. **성능**
   - [ ] Lighthouse 점수 90점 이상
   - [ ] 페이지 로드 시간 3초 이내

---

## 📈 향후 확장 가능성

### 단계별 확장
1. **Phase 1**: 나머지 12장 카드 추가 (4-21번)
2. **Phase 2**: 정식 이미지 교체 (AI 생성 or 커스텀 디자인)
3. **Phase 3**: 역방향 해석 추가
4. **Phase 4**: 타로 히스토리 페이지
5. **Phase 5**: 공유 기능 (이미지 생성)

### 데이터 마이그레이션 (선택)
- localStorage → Supabase로 전환
- 로그인 사용자 전용 히스토리 저장

---

## 🎨 디자인 참고

**색상 팔레트** (타로 전용):
- Primary: `#9333ea` (보라)
- Secondary: `#6366f1` (인디고)
- Accent: `#7c3aed` (바이올렛)
- Background: `#faf5ff` (연보라)

**아이콘/이모지**:
- 🔮 - 수정구슬 (메인 아이콘, sparkle 애니메이션)
- 🌙 - 달
- ✨ - 반짝임
- 🌟 - 별
- 💫 - 메시지 섹션
- 💡 - 조언 섹션
- ⭐ - 뽑은 카드 표시

---

## 📞 문제 해결

### Q1. 카드 이미지가 안 보여요
**A**: `public/tarot/` 폴더에 이미지 파일이 있는지 확인. 파일명이 정확한지 체크.

### Q2. 하루 1회 제한이 안 돼요
**A**: 브라우저 localStorage가 활성화되어 있는지 확인. 개발 중엔 `localStorage.removeItem('tarot_daily_draws')`로 리셋.

### Q3. Flip 애니메이션이 안 돼요
**A**: `index.css`에 flip-card CSS가 추가되었는지 확인.

### Q4. "다시보기" 클릭 시 에러
**A**: `getTodayDrawRecord()`가 올바른 cardId를 반환하는지, 해당 카드 JSON 파일이 있는지 확인.

---

## 🎯 핵심 파일 경로 요약

```
수정 파일:
  - pages/DashboardPage.tsx (라인 537-574 교체 + 모달 추가)
  - index.css (flip-card CSS 추가)

신규 파일:
  - utils/tarot/types.ts
  - utils/tarot/loadTarotCard.ts
  - utils/tarot/dailyDrawChecker.ts
  - utils/DB_tarot_22/TAROT-00_fool.json (외 9개)
  - public/tarot/back.png
  - public/tarot/00_fool.png (외 9개)
```

---

## ✨ 완성 예상 시간

- **Phase 1** (데이터): 2-3시간
- **Phase 2** (로더): 2-3시간
- **Phase 3** (DashboardPage): 4-5시간
- **Phase 4** (CSS): 30분
- **테스트 & 디버깅**: 2시간

**총 예상**: 약 11-14시간

---

이 계획서를 따라 단계별로 구현하면 타로 카드 운세 기능을 성공적으로 완성할 수 있습니다! 🎉