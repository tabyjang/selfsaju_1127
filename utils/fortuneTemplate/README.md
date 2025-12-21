# 템플릿 기반 운세 생성 시스템

일주 특성을 반영한 개인화된 오늘의 운세를 생성하는 시스템입니다.

## 📁 파일 구조

```
utils/fortuneTemplate/
├── types.ts                    # 타입 정의
├── placeholderReplacer.ts      # 플레이스홀더 치환 함수
├── templateSelector.ts         # 템플릿 선택 및 ME 계산
├── holidayChecker.ts           # 공휴일/특별한 날 체크
├── dataLoader.ts               # JSON 데이터 로더
├── fortuneGenerator.ts         # 메인 운세 생성기
├── index.ts                    # Export 모음
└── README.md                   # 이 파일

today_unse/
├── ilju_personalities.json     # 60개 일주 성격 데이터
├── unseong_themes.json         # 12개 십이운성 테마
├── fortune_templates.json      # 150+ 문장 템플릿
└── holiday_messages.json       # 15개 특별한 날 메시지
```

## 🚀 사용법

### 1. 기본 사용 (todayUnse.ts 통합)

가장 간단한 방법은 `todayUnse.ts`의 새로운 함수를 사용하는 것입니다:

```typescript
import { getTodayUnseWithTemplate, getTodayUnseMarkdown } from './utils/todayUnse';

// 방법 1: GeneratedFortune 객체로 받기
const fortune = await getTodayUnseWithTemplate(
  sajuData,
  todayJiji,
  todayUnseong,
  userBirthday  // 선택사항
);

console.log(fortune.title);        // "[차근차근 쌓아가는 시작]"
console.log(fortune.content);      // 운세 내용
console.log(fortune.actionPlans);  // ["액션플랜1", "액션플랜2", "액션플랜3"]
console.log(fortune.mentalEnergy); // 5
console.log(fortune.energyLevel);  // "medium"

// 방법 2: 마크다운 형식 문자열로 받기 (추천)
const markdown = await getTodayUnseMarkdown(
  sajuData,
  todayJiji,
  todayUnseong,
  userBirthday
);

console.log(markdown);
// **[차근차근 쌓아가는 시작]**
//
// 오늘은 뭔가 새롭게 시작하고 싶은...
// ...
// 오늘의 액션플랜:
// - 액션플랜1
// - 액션플랜2
// - 액션플랜3
```

### 2. 직접 사용

템플릿 시스템을 직접 사용하려면:

```typescript
import { generateFortune, formatFortune, type FortuneInput } from './utils/fortuneTemplate';

const input: FortuneInput = {
  ilju: "己丑",           // 일주 (일간+일지)
  todayJiji: "寅",        // 오늘 지지
  sibsin: "비견",         // 십성
  unseong: "장생",        // 십이운성
  deukryeong: true,       // 득령 여부
  gwiin: false,           // 천을귀인 여부
  date: new Date(),       // 날짜
};

// 운세 생성
const fortune = await generateFortune(input, "01-15"); // 생일 선택사항

// 마크다운 형식으로 변환
const markdown = formatFortune(fortune);
```

## 🎯 주요 특징

### 1. 일주 기반 개인화

- **60개 일주** 각각의 고유한 성격 특성 반영
- "차분하고 신중한 당신", "섬세하고 감성적인 당신" 등 개인별 차별화
- → "내 얘기 같은" 느낌!

### 2. 템플릿 조합 시스템

```
60개 일주 성격 × 12개 운성 테마 × 150개 템플릿
= 실질적으로 무한대의 조합
```

- 같은 날짜는 같은 템플릿 선택 (일관성)
- 날짜가 바뀌면 다른 템플릿 조합 (다양성)

### 3. 에너지 레벨 시스템

```typescript
ME (Mental Energy) = AE + 득령보너스 + 귀인보너스

ME >= 6: high energy    → 적극적, 긍정적 톤
ME 4-5:  medium energy  → 균형적, 안정적 톤
ME <= 3: low energy     → 휴식, 내면 집중 톤
```

### 4. 특별한 날 메시지

- 공휴일: 신정, 설날, 추석, 크리스마스 등
- 요일: 월요일, 금요일, 주말
- 생일: 사용자 생일 입력 시

## 📊 데이터 구조

### ilju_personalities.json

```json
{
  "己丑": {
    "일주": "기축",
    "한자": "己丑",
    "핵심특성": "차분하고 신중한",
    "강점": "책임감, 인내심, 꼼꼼함, 안정성",
    "소통스타일": "신중하게 말을 고르는",
    "감정표현": "겉으로 드러내지 않지만 깊은",
    "업무스타일": "체계적으로 준비하는",
    "추가특징": "한번 시작하면 끝을 보는 성향..."
  }
}
```

### unseong_themes.json

```json
{
  "장생": {
    "운성": "장생",
    "한자": "長生",
    "AE": 4,
    "에너지단계": "탄생",
    "핵심키워드": "시작, 활력, 새출발, 생명력",
    "분위기": "뭔가 새롭게 시작하고 싶은",
    "조언톤": "지금이 시작할 타이밍입니다",
    "주의사항": "너무 조급하게 서두르지 마세요"
  }
}
```

### fortune_templates.json

```json
{
  "opening_high_energy": [
    "오늘은 {unseong.분위기} 날입니다. {ilju.핵심특성} 당신이라면, 이런 날을 어떻게 보낼까요?",
    "..."
  ],
  "main_work_active": [
    "{ilju.업무스타일} 당신의 스타일이 오늘 특히 빛을 발할 것 같습니다...",
    "..."
  ]
}
```

## 🔧 커스터마이징

### 1. 템플릿 추가

`today_unse/fortune_templates.json`에 새로운 문장 추가:

```json
{
  "opening_high_energy": [
    "기존 문장들...",
    "새로운 문장 추가: {ilju.핵심특성} 당신에게..."
  ]
}
```

### 2. 일주 특성 수정

`today_unse/ilju_personalities.json`에서 특정 일주 수정:

```json
{
  "己丑": {
    "핵심특성": "차분하고 신중한" → "안정적이고 꼼꼼한"
  }
}
```

### 3. 공휴일 추가

`today_unse/holiday_messages.json`에 새로운 날 추가:

```json
{
  "새로운날": {
    "날짜": "MM-DD",
    "이름": "새로운날",
    "메시지": "{ilju.핵심특성} 당신에게...",
    "액션플랜": ["...", "...", "..."]
  }
}
```

## ⚙️ API 참고

### generateFortune()

```typescript
async function generateFortune(
  input: FortuneInput,
  userBirthday?: string
): Promise<GeneratedFortune>
```

**입력:**
- `input.ilju`: 일주 (예: "己丑")
- `input.todayJiji`: 오늘 지지
- `input.sibsin`: 십성
- `input.unseong`: 십이운성
- `input.deukryeong`: 득령 여부
- `input.gwiin`: 귀인 여부
- `input.date`: 날짜
- `userBirthday`: 생일 (선택)

**출력:**
```typescript
{
  title: string;           // "[제목]"
  content: string;         // 운세 내용
  actionPlans: string[];   // 액션플랜 3개
  mentalEnergy: number;    // ME 값 (1-7)
  energyLevel: EnergyLevel; // 'high' | 'medium' | 'low'
}
```

### calculateMentalEnergy()

```typescript
function calculateMentalEnergy(
  ae: number,
  deukryeong: boolean,
  gwiin: boolean,
  sibsin: string
): number
```

ME 계산 로직:
- 기본: `ae` (십이운성의 AE 값)
- 득령이면: `+1`
- 귀인이고 십성이 비견/겁재면: `+1`
- 최종: 1-7 범위로 제한

## 🧪 테스트

콘솔에서 테스트:

```typescript
// 기축일주 × 장생 운성 테스트
const testInput: FortuneInput = {
  ilju: "己丑",
  todayJiji: "寅",
  sibsin: "비견",
  unseong: "장생",
  deukryeong: true,
  gwiin: false,
  date: new Date("2025-01-15"),
};

const fortune = await generateFortune(testInput);
console.log(formatFortune(fortune));
```

## 📝 변경 이력

### v1.0 (현재)
- ✅ 60개 일주 성격 데이터 완성
- ✅ 12개 십이운성 테마 완성
- ✅ 150+ 운세 템플릿 완성
- ✅ 15개 특별한 날 메시지 완성
- ✅ 템플릿 조합 로직 구현
- ✅ todayUnse.ts 연동 완료

### 향후 계획
- ⏳ 음력 공휴일 변환 기능
- ⏳ 3,600개 일주 상호작용 데이터 (선택)
- ⏳ 템플릿 다양성 확대 (150개 → 300개)
- ⏳ A/B 테스팅 시스템

## 💡 문제 해결

### 데이터가 로드되지 않을 때

```typescript
import { preloadAllData } from './utils/fortuneTemplate';

// 앱 시작 시 데이터 미리 로드
await preloadAllData();
```

### 캐시 초기화

```typescript
import { clearCache } from './utils/fortuneTemplate';

// 데이터 수정 후 캐시 초기화
clearCache();
```

### 타입 에러

```typescript
// FortuneInput 타입 명시
import type { FortuneInput } from './utils/fortuneTemplate';

const input: FortuneInput = { ... };
```

## 📧 지원

문제가 발생하면:
1. 콘솔 로그 확인
2. 데이터 파일 JSON 문법 검증
3. 타입 에러 확인

---

**Made with ❤️ for personalized fortune telling**
