# 프로젝트 구조 가이드

## 개요
이 문서는 사주 웹 애플리케이션 (아사주달)의 프로젝트 구조와 각 파일의 역할을 설명합니다.

**프로젝트명**: selfsaju (아사주달)
**타입**: React 19 + TypeScript + Vite 기반 SPA
**기능**: 한국 사주 분석 웹 애플리케이션
**배포**: Vercel

## 기술 스택

### 핵심 프레임워크
- **React**: 19.2.0 (최신 버전)
- **React Router DOM**: 7.11.0 (라우팅)
- **TypeScript**: 5.8.2

### 백엔드 & 인증
- **Clerk**: 5.59.0 (사용자 인증)
- **Supabase**: 2.48.1 (데이터베이스 & 백엔드)

### AI & 시각화
- **Google Generative AI**: 1.28.0 (Gemini API)
- **Three.js**: 0.182.0 (3D 시각화)
- **React Three Fiber**: 9.4.2
- **React Three Drei**: 10.7.7

### 개발 도구
- **Vite**: 6.2.0 (빌드 도구)
- **@vitejs/plugin-react**: 5.0.0

## 디렉토리 구조

```
saju_master_1204-main/
├── components/                   # React 컴포넌트
│   ├── SajuInputForm.tsx        # 사주 입력 폼
│   ├── AnalysisResult.tsx       # 분석 결과 표시
│   ├── OhaengLoading.tsx        # 오행 로딩 애니메이션
│   ├── GyeokgukDisplay.tsx      # 격국 표시
│   ├── SinsalDisplay.tsx        # 신살 표시
│   ├── InteractionsDisplay.tsx  # 상호작용 표시
│   ├── MonthlyIljuCalendar.tsx  # 월간 일주 달력
│   ├── Modal.tsx                # 모달 컴포넌트
│   ├── icons.tsx                # 아이콘 컴포넌트
│   ├── SavedSajuList.tsx        # 저장된 사주 목록 (재활성화 대기)
│   ├── SaveSajuButton.tsx       # 사주 저장 버튼 (재활성화 대기)
│   └── GeokgukTestPage.tsx      # 격국 테스트 페이지 (개발용)
│
├── pages/                       # 페이지 컴포넌트
│   ├── InputPage.tsx           # 사주 입력 페이지
│   ├── ResultPage.tsx          # 결과 페이지
│   ├── DeepAnalysis.tsx        # 심층 분석 페이지
│   ├── DashboardPage.tsx       # 대시보드
│   ├── DaewoonPage.tsx         # 대운 페이지
│   ├── MyEnergyPage.tsx        # 내 에너지 페이지
│   ├── YongsinPage.tsx         # 용신 분석 페이지
│   ├── CalendarPage.tsx        # 달력 페이지
│   ├── CalendarTestPage.tsx    # 달력 테스트 페이지
│   └── FiveElementsOrbit.tsx   # 오행 궤도 시각화 페이지
│
├── utils/                       # 유틸리티 함수
│   ├── manse.ts                # 만세력 계산
│   ├── geokguk.ts              # 격국 판단 로직
│   ├── geokguk-data.ts         # 격국 데이터
│   ├── geokguk-naegyeok.ts     # 격국 내격
│   ├── geokguk-special.ts      # 특수 격국
│   ├── geokguk-sampling.ts     # 샘플링
│   ├── geokguk.test.ts         # 격국 테스트 (개발용)
│   ├── gyeokguk.ts             # 격국 처리
│   ├── interactions.ts         # 오행 상호작용
│   ├── sinsal.ts               # 신살 계산
│   ├── iljuDescriptions.ts     # 60 일주 설명
│   ├── ilganDescriptions.ts    # 일간 설명
│   ├── sibsinDescriptions.ts   # 십신 설명
│   ├── sinsalDescriptions.ts   # 신살 설명
│   ├── unseongDescriptions.ts  # 운성 설명
│   ├── sajuStorage.ts          # Supabase 저장/로드
│   ├── todayUnse.ts            # 오늘의 운세
│   ├── solarTerms.ts           # 절기 계산
│   ├── supabase.ts             # Supabase 클라이언트
│   ├── DB_ilju_60/             # 60개 일주 데이터베이스 (JSON)
│   ├── ilju/                   # 일주 관련
│   │   └── loadIljuBundle.ts  # 일주 번들 로드
│   ├── ohyaeng/                # 오행 에너지 분석
│   │   ├── energyCalculator.ts
│   │   └── weights.ts
│   ├── yongsin/                # 용신 분석
│   │   ├── index.ts
│   │   └── types.ts
│   └── fortuneTemplate/        # 운세 템플릿 시스템
│       ├── dataLoader.ts      # 데이터 로더
│       ├── fortuneGenerator.ts # 운세 생성
│       ├── eventFortuneGenerator.ts # 이벤트 운세
│       ├── placeholderReplacer.ts # 변수 치환
│       ├── templateSelector.ts # 템플릿 선택
│       ├── types.ts           # 타입 정의
│       └── test.ts            # 테스트 (개발용)
│
├── services/                    # API 서비스
│   └── geminiService.ts        # Google Gemini API 통합
│
├── api/                         # API 엔드포인트 (Vercel)
│   ├── analyze.ts              # 분석 API
│   └── chat.ts                 # 채팅 API
│
├── public/                      # 정적 자산
│   ├── logo.png                # 앱 로고
│   ├── sibioonseong.png        # 십이운성 이미지
│   └── today_unse/             # 일일 운세 데이터
│       └── daily_events/       # 60개 일주별 이벤트 JSON
│
├── today_unse/                  # 운세 데이터 (런타임)
│   ├── daily_events/           # 60개 일주별 일일 이벤트 JSON
│   ├── fortune_templates.json  # 운세 템플릿
│   ├── ilju_personalities.json # 일주 성격 데이터
│   ├── holiday_messages.json   # 공휴일 메시지
│   ├── unseong_themes.json     # 운성 테마
│   └── PROJECT_STATUS.md       # 프로젝트 상태
│
├── yongsin/                     # 용신 분석 관련 데이터
│
├── DB_backup/                   # 데이터베이스 백업
│
├── docs/                        # 문서
│   ├── README.md               # 프로젝트 소개 (루트에도 존재)
│   ├── DEPLOYMENT.md           # 배포 가이드 (루트에도 존재)
│   ├── SUPABASE_IMPLEMENTATION.md # Supabase 구현 (루트에도 존재)
│   ├── TODO.md                 # 격국 개발 계획 (루트에도 존재)
│   ├── PROJECT_STRUCTURE.md    # 이 문서
│   ├── design/                 # 설계 문서
│   │   ├── 격국_구현_설계.md
│   │   ├── 내격_로직_정리.md
│   │   ├── 사주_용신_알고리즘.md
│   │   └── 사주_용신수치화.md
│   └── testing/                # 테스트 문서
│       ├── TEST_CASES_SUMMARY.md
│       ├── TEST_COMPLETE_SUMMARY.md
│       ├── TEST_EXECUTION_GUIDE.md
│       └── TEST_RESULTS.md
│
├── landing_update/              # 랜딩 페이지 관련
│
├── App.tsx                      # 메인 앱 컴포넌트
├── LandingPage.tsx              # 랜딩 페이지
├── index.tsx                    # React 진입점
├── index.html                   # HTML 템플릿
├── index.css                    # 글로벌 스타일
├── config.ts                    # 설정 파일
├── types.ts                     # 공용 타입 정의
│
├── .env                         # 환경 변수 (로컬)
├── .env.production              # 환경 변수 (프로덕션)
├── .gitignore                   # Git 제외 목록
├── package.json                 # 패키지 정보
├── vite.config.ts               # Vite 설정
├── tsconfig.json                # TypeScript 설정
└── vercel.json                  # Vercel 배포 설정
```

## 주요 파일 설명

### 진입점

#### App.tsx
- 앱의 메인 컴포넌트
- Clerk 인증 처리
- React Router 라우팅 설정
- 전역 상태 관리

#### LandingPage.tsx
- 첫 화면 랜딩 페이지
- 서비스 소개 및 시작 버튼

#### index.tsx
- React 진입점
- Clerk Provider, BrowserRouter 설정

### 타입 정의

#### types.ts
전역 타입 정의:
- `SajuInfo`: 사주 기본 정보
- `SajuAnalysisResult`: 사주 분석 결과
- `Pillar`: 사주 기둥 (년/월/일/시)
- `Geokguk`: 격국 정보
- `Sinsal`: 신살 정보

### 페이지 라우팅

App.tsx에서 정의된 라우팅:

| 경로 | 컴포넌트 | 설명 |
|------|----------|------|
| `/` | LandingPage | 진입 페이지 |
| `/input` | InputPage | 사주 입력 |
| `/result` | ResultPage | 기본 분석 결과 |
| `/deep-analysis` | DeepAnalysis | AI 심층 분석 |
| `/calendar` | CalendarPage | 만세력 달력 |
| `/calendar-test` | CalendarTestPage | 달력 테스트 |
| `/daewoon` | DaewoonPage | 대운 분석 |
| `/dashboard` | DashboardPage | 사용자 대시보드 |
| `/orbit` | FiveElementsOrbit | 3D 오행 시각화 |
| `/yongsin` | YongsinPage | 용신 분석 |
| `/my-energy` | MyEnergyPage | 오행 에너지 분석 |

## 핵심 기능별 파일

### 1. 사주 계산
- `utils/manse.ts`: 만세력 계산 (천간지지, 절기)
- `utils/interactions.ts`: 오행 상호작용 (합, 충, 형, 파, 해)
- `utils/sinsal.ts`: 신살 계산

### 2. 격국 분석
- `utils/geokguk.ts`: 격국 판단 메인 로직
- `utils/geokguk-data.ts`: 격국 데이터
- `utils/geokguk-naegyeok.ts`: 내격 로직
- `utils/geokguk-special.ts`: 특수 격국
- `utils/gyeokguk.ts`: 격국 처리 래퍼

### 3. 용신 분석
- `utils/yongsin/index.ts`: 용신 계산 로직
- `utils/yongsin/types.ts`: 용신 타입 정의

### 4. 오행 에너지 분석
- `utils/ohyaeng/energyCalculator.ts`: 오행 에너지 계산
- `utils/ohyaeng/weights.ts`: 오행 가중치 설정

### 5. 일일 운세 생성
- `utils/fortuneTemplate/dataLoader.ts`: JSON 데이터 로드
- `utils/fortuneTemplate/fortuneGenerator.ts`: 운세 문구 생성
- `utils/fortuneTemplate/eventFortuneGenerator.ts`: 이벤트 기반 운세
- `utils/fortuneTemplate/placeholderReplacer.ts`: 변수 치환
- `utils/fortuneTemplate/templateSelector.ts`: 랜덤 템플릿 선택
- `today_unse/`: 운세 생성용 JSON 데이터

### 6. AI 분석
- `services/geminiService.ts`: Google Gemini API 통합
- `api/analyze.ts`: 분석 API 엔드포인트
- `api/chat.ts`: 채팅 API 엔드포인트

### 7. 데이터 저장
- `utils/sajuStorage.ts`: Supabase를 통한 사주 저장/복원
- `utils/supabase.ts`: Supabase 클라이언트 설정

## 데이터 구조

### today_unse/ 디렉토리 (절대 삭제 금지)
런타임에 필요한 JSON 데이터:

- **fortune_templates.json**: 운세 문구 템플릿
- **ilju_personalities.json**: 60일주 성격 데이터
- **holiday_messages.json**: 공휴일 특별 메시지
- **unseong_themes.json**: 12운성 테마
- **daily_events/**: 60개 일주별 일일 이벤트 JSON (예: 갑자_ilju_daily_events.json)

### utils/DB_ilju_60/ 디렉토리
60개 일주 상세 데이터 JSON 파일

## 개발 가이드

### 새로운 컴포넌트 추가
1. `components/` 또는 `pages/`에 .tsx 파일 생성
2. App.tsx 또는 상위 컴포넌트에서 import
3. 필요시 App.tsx에 라우팅 추가

### 새로운 운세 데이터 추가
1. `today_unse/`의 해당 JSON 파일 수정
2. `utils/fortuneTemplate/types.ts`에 타입 정의 추가
3. `utils/fortuneTemplate/dataLoader.ts`에 로더 함수 추가

### 새로운 격국 로직 추가
1. `utils/geokguk-data.ts`에 데이터 추가
2. `utils/geokguk.ts`에 판단 로직 추가
3. `components/GyeokgukDisplay.tsx`에 표시 로직 추가

## 빌드 및 배포

### 개발 서버 실행
```bash
npm run dev          # 포트 3000에서 실행
```

### 프로덕션 빌드
```bash
npm run build        # dist/ 폴더에 빌드 결과 생성
npm run preview      # 빌드 결과 미리보기
```

### 배포
Vercel을 통해 자동 배포됩니다.
- main 브랜치 푸시 시 자동 배포
- vercel.json에 설정 정의

## 파일 네이밍 규칙

- **컴포넌트**: PascalCase.tsx (예: SajuInputForm.tsx)
- **유틸리티**: camelCase.ts (예: sajuCalculator.ts)
- **타입/인터페이스**: PascalCase (예: SajuInfo)
- **JSON 데이터**: snake_case.json (예: fortune_templates.json)
- **상수**: UPPER_SNAKE_CASE

## 환경 변수 (.env)

```bash
# Clerk 인증
VITE_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
VITE_CLERK_SIGN_IN_URL=/sign-in
VITE_CLERK_SIGN_UP_URL=/sign-up

# Supabase 데이터베이스
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_KEY=

# AI API
GEMINI_API_KEY=
```

## 삭제 금지 파일/폴더

⚠️ 다음 파일/폴더는 런타임에 필수이므로 절대 삭제하지 마세요:

- **today_unse/**: 일일 운세 데이터 (런타임 필수)
- **utils/manse.ts**: 사주 계산 핵심 로직
- **utils/geokguk.ts**: 격국 판단 핵심 로직
- **SavedSajuList.tsx, SaveSajuButton.tsx**: Supabase 저장 기능 (재활성화 예정)
- **.env, .env.production**: 환경 변수 설정

## 개발용 파일 (프로덕션 빌드 제외)

다음 파일들은 개발/테스트 목적이며, 프로덕션 빌드에는 포함되지 않습니다:

- `components/GeokgukTestPage.tsx`: 격국 테스트 페이지
- `utils/geokguk.test.ts`: 격국 테스트 파일
- `utils/fortuneTemplate/test.ts`: 템플릿 테스트 파일

## 버전 관리

- **Git**: 버전 관리 시스템
- **main 브랜치**: 프로덕션 코드
- 중요한 변경 전 백업 브랜치 생성 권장

## 문서 업데이트 히스토리

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2025-12-23 | 1.0 | 초기 프로젝트 구조 문서 생성 |

## 추가 참고 문서

- [README.md](../README.md): 프로젝트 소개
- [DEPLOYMENT.md](../DEPLOYMENT.md): 배포 가이드
- [SUPABASE_IMPLEMENTATION.md](../SUPABASE_IMPLEMENTATION.md): Supabase 설정
- [TODO.md](../TODO.md): 격국 개발 계획
- [design/격국_구현_설계.md](design/격국_구현_설계.md): 격국 구현 설계
- [testing/](testing/): 테스트 관련 문서

---

**작성자**: Claude Code
**마지막 업데이트**: 2025-12-23
**버전**: 1.0
