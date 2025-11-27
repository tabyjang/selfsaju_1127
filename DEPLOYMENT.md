# 배포 가이드

이 프로젝트는 프론트엔드와 백엔드 API를 분리하여 배포합니다.

## 구조

- **프론트엔드**: selfsaju.co.kr (일반 웹 호스팅)
- **백엔드 API**: Vercel Serverless Functions

## 1. 백엔드 API 배포 (Vercel)

### 1.1 Vercel 프로젝트 생성

1. https://vercel.com 접속 및 GitHub 연동
2. "Add New Project" 클릭
3. 이 저장소 선택
4. 프로젝트 설정:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 1.2 환경 변수 설정

Vercel 프로젝트 설정에서 Environment Variables 추가:

```
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**중요**: 실제 Gemini API 키를 여기에 입력하세요.
- API 키 발급: https://aistudio.google.com/apikey

### 1.3 배포

- Vercel이 자동으로 배포합니다
- 배포 완료 후 URL 확인 (예: `https://your-project.vercel.app`)

### 1.4 API 엔드포인트

배포 후 사용 가능한 엔드포인트:
- `https://your-project.vercel.app/api/analyze` - 사주 분석
- `https://your-project.vercel.app/api/chat` - 채팅

## 2. 프론트엔드 배포 (selfsaju.co.kr)

### 2.1 환경 변수 설정

`.env.production` 파일 생성:

```
VITE_API_URL=https://your-project.vercel.app
```

**중요**: `your-project.vercel.app`를 실제 Vercel 배포 URL로 변경하세요.

### 2.2 빌드

```bash
npm run build
```

빌드 완료 후 `dist` 폴더 생성됨.

### 2.3 FTP 업로드

`dist` 폴더 **안의 내용**을 selfsaju.co.kr의 웹 루트 디렉토리에 업로드:

```
public_html/ (또는 www/, htdocs/)
├── index.html
└── assets/
    ├── *.js
    └── *.css
```

**주의**: `dist` 폴더 자체가 아닌 내부 파일들을 업로드하세요.

## 3. 테스트

1. selfsaju.co.kr 접속
2. 생년월일 입력 후 분석 시작
3. AI 분석 결과 확인
4. 채팅 기능 테스트

## 4. 문제 해결

### API 연결 오류

- Vercel 배포 URL이 올바른지 확인
- `.env.production` 파일의 `VITE_API_URL` 확인
- 브라우저 개발자 도구에서 네트워크 탭 확인

### CORS 오류

- `api/analyze.ts`와 `api/chat.ts`의 CORS 헤더 확인
- 필요시 특정 도메인만 허용하도록 수정:
  ```typescript
  res.setHeader('Access-Control-Allow-Origin', 'https://selfsaju.co.kr');
  ```

### API 키 오류

- Vercel 프로젝트의 Environment Variables에서 `GEMINI_API_KEY` 확인
- 재배포: Vercel Dashboard에서 "Redeploy" 클릭

## 5. 보안

✅ **완료된 보안 조치**:
- API 키는 Vercel 환경 변수에만 저장
- 프론트엔드 코드에 API 키 노출 없음
- 모든 API 호출은 백엔드를 통해 처리

⚠️ **추가 권장 사항**:
- Google Cloud Console에서 API 키에 도메인 제한 설정
- Vercel 환경 변수는 절대 공개하지 마세요
- `.env.local` 파일은 Git에 커밋하지 마세요 (이미 .gitignore에 포함)
