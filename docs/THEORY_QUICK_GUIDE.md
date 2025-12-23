# 이론 자료 추가 빠른 가이드 ⚡

## 🚀 5분 안에 새 이론 추가하기

### Step 1: 템플릿 복사 (30초)

```bash
# 템플릿 파일 복사
cp public/theories/content/TEMPLATE.md public/theories/content/my-new-theory.md
```

### Step 2: 프론트매터 수정 (1분)

```yaml
---
id: my-new-theory              # ⚠️ 고유한 ID (영문, 하이픈만)
title: 내 새로운 이론          # 이론 제목
category: basics               # classic/basics/advanced/practical
tags: [명리학, 기초, 개념]     # 3-5개 태그
difficulty: beginner           # beginner/intermediate/advanced
readTime: 20                   # 읽는데 걸리는 시간 (분)
featured: false                # 추천 표시 여부
relatedTheories: [saju-basics] # 관련 이론 ID (선택)
---
```

### Step 3: 본문 작성 (3분)

기본 구조:

```markdown
# 제목

## 개요
간단한 소개...

## 주요 개념
### 개념 1
설명...

### 개념 2
설명...

## 실전 활용
사례...

---
**추천 학습 경로**: ...
```

### Step 4: DB에 추가 (30초)

```bash
npx tsx scripts/migrate-theories-to-supabase.ts
```

**완료!** 🎉

---

## 📝 마크다운 문법 치트시트

### 제목
```markdown
# H1 제목
## H2 제목
### H3 제목
```

### 강조
```markdown
**굵게**
*기울임*
***굵고 기울임***
```

### 링크
```markdown
[내부 링크](/theory/saju-basics)
[외부 링크](https://naver.com)
```

### 이미지
```markdown
![설명](이미지URL)
![로컬](/theories/images/my-image.png)
```

### 리스트
```markdown
- 항목 1
- 항목 2

1. 순서 1
2. 순서 2
```

### 표
```markdown
| 열1 | 열2 | 열3 |
|-----|-----|-----|
| A   | B   | C   |
```

### 인용
```markdown
> 인용문입니다.
```

### 구분선
```markdown
---
```

### 코드
```markdown
`인라인 코드`

​```python
# 코드 블록
def hello():
    print("안녕")
​```
```

---

## 🖼️ 이미지 추가 2가지 방법

### 방법 1: Supabase Storage (추천)

1. Supabase → Storage → `theory-images`
2. 이미지 업로드
3. URL 복사
4. 마크다운에 붙여넣기:
   ```markdown
   ![설명](https://vmvpnzjktbcmrpomgcfn.supabase.co/storage/v1/object/public/theory-images/my-image.png)
   ```

### 방법 2: 로컬 파일

1. `public/theories/images/my-folder/` 에 저장
2. 마크다운에서:
   ```markdown
   ![설명](/theories/images/my-folder/my-image.png)
   ```

---

## ⚙️ 카테고리 선택 가이드

| 카테고리 | 설명 | 예시 |
|---------|------|------|
| `classic` | 고전 명리 서적 | 연해자평, 적천수 |
| `basics` | 기초 이론 | 사주 기초, 오행 이론 |
| `advanced` | 심화 이론 | 격국론, 용신론 |
| `practical` | 실전 활용 | 십신 활용, 해석 가이드 |

## 🎯 난이도 선택 가이드

| 난이도 | 대상 | 예시 |
|-------|------|------|
| `beginner` | 초보자 | 사주란?, 오행 기초 |
| `intermediate` | 중급자 | 십신 해석, 대운 보기 |
| `advanced` | 고급자 | 격국 판단, 용신 선택 |

---

## 📋 체크리스트

새 이론 추가 전:

- [ ] `id`가 고유한가? (다른 이론과 중복 X)
- [ ] `category`가 올바른가? (classic/basics/advanced/practical)
- [ ] `tags`를 3-5개 작성했는가?
- [ ] `difficulty` 설정했는가?
- [ ] `readTime` 예상 시간 입력했는가?
- [ ] 제목(H1)이 하나만 있는가?
- [ ] 섹션(H2, H3)으로 구조화했는가?
- [ ] 내부 링크 경로가 `/theory/id` 형식인가?
- [ ] 이미지 경로가 올바른가?
- [ ] 맞춤법 검사했는가?

---

## 🔥 자주 하는 실수

### ❌ 잘못된 예

```markdown
---
id: 새이론  ❌ (한글 X)
category: 기초  ❌ (영문으로: basics)
tags: 태그1, 태그2  ❌ (배열 형식: [태그1, 태그2])
difficulty: 쉬움  ❌ (영문으로: beginner)
---

# 제목
# 또 다른 제목  ❌ (H1은 하나만)

[링크](saju-basics)  ❌ (슬래시 필요: /theory/saju-basics)

![이미지](이미지.png)  ❌ (경로 필요)
```

### ✅ 올바른 예

```markdown
---
id: new-theory
category: basics
tags: [태그1, 태그2]
difficulty: beginner
---

# 제목

## 섹션 1
### 하위 섹션

[링크](/theory/saju-basics)
![이미지](/theories/images/my-image.png)
```

---

## 💡 프로 팁

1. **먼저 목차 작성**: H2, H3로 구조 잡기
2. **짧게 쓰기**: 한 섹션은 2-3 문단
3. **예시 많이**: 추상적인 설명보다 구체적 예시
4. **링크 활용**: 관련 이론으로 자주 연결
5. **이미지 압축**: 500KB 이하로 유지
6. **일관성**: 기존 이론들의 스타일 참고

---

## 🚨 긴급 수정

이미 DB에 있는 이론을 수정하려면:

### 방법 1: 마크다운 수정 후 재마이그레이션
```bash
# 1. .md 파일 수정
# 2. 재실행 (upsert 되므로 덮어씀)
npx tsx scripts/migrate-theories-to-supabase.ts
```

### 방법 2: Supabase 대시보드에서 직접 수정
1. Table Editor → theories
2. 해당 행 클릭
3. `content_markdown` 또는 `content_html` 수정
4. Save

---

## 📞 도움말

- **템플릿 파일**: `public/theories/content/TEMPLATE.md`
- **이미지 가이드**: `docs/THEORY_IMAGE_GUIDE.md`
- **전체 마이그레이션 가이드**: `docs/THEORY_DB_MIGRATION.md`

**문제 발생 시**:
1. 마크다운 문법 확인
2. 프론트매터 YAML 형식 확인
3. 이미지 경로 확인
4. 브라우저 콘솔 에러 확인
