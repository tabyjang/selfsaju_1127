# 이론 자료 이미지 업로드 가이드

## 🖼️ Supabase Storage 사용 (추천)

### 1단계: Storage Bucket 생성 (한 번만)

1. **Supabase 대시보드** 열기: https://supabase.com/dashboard
2. 프로젝트 선택
3. 왼쪽 메뉴 **Storage** 클릭
4. **New bucket** 클릭
5. 설정:
   - Name: `theory-images`
   - ✅ **Public bucket** 체크 (중요!)
6. **Create bucket** 클릭

### 2단계: 이미지 업로드

1. `theory-images` 버킷 클릭
2. **Upload file** 클릭
3. 이미지 선택 (PNG, JPG, SVG 등)
4. 업로드 완료 후 이미지 클릭
5. **Get public URL** 복사

**예시 URL**:
```
https://vmvpnzjktbcmrpomgcfn.supabase.co/storage/v1/object/public/theory-images/ohaeng-cycle.png
```

### 3단계: 마크다운에서 사용

```markdown
![오행 순환도](https://vmvpnzjktbcmrpomgcfn.supabase.co/storage/v1/object/public/theory-images/ohaeng-cycle.png)
```

---

## 📁 로컬 이미지 사용

### 1단계: 이미지 저장

프로젝트 폴더에 저장:
```
public/
  theories/
    images/
      ohaeng-theory/
        cycle-diagram.png
        five-elements.svg
      sibsin-guide/
        sibsin-chart.png
```

### 2단계: 마크다운에서 참조

```markdown
![오행 순환도](/theories/images/ohaeng-theory/cycle-diagram.png)
```

**장점**: 빠름, 서버 불필요
**단점**: 빌드 크기 증가

---

## 🎨 이미지 최적화 팁

### 권장 사양
- **형식**: PNG (다이어그램), JPG (사진), SVG (벡터)
- **크기**: 최대 1920px 너비
- **용량**: 500KB 이하 (압축 권장)

### 무료 압축 도구
- **TinyPNG**: https://tinypng.com
- **Squoosh**: https://squoosh.app

### 예시

**좋은 예**:
```markdown
![오행 상생 관계도](https://vmvpnzjktbcmrpomgcfn.supabase.co/storage/v1/object/public/theory-images/ohaeng-sangsaeng.png)
```

**나쁜 예** (너무 큰 이미지):
```markdown
![이미지](huge-10mb-image.png)  ❌
```

---

## 📸 이미지 종류별 가이드

### 1. 다이어그램 (오행 순환, 사주 구조 등)

**추천**: SVG 또는 PNG

```markdown
![사주 구조도](/theories/images/saju-structure.svg)
```

### 2. 표 이미지

**추천**: PNG (고해상도)

```markdown
![십신표](/theories/images/sibsin-table.png)
```

### 3. 스크린샷

**추천**: JPG (압축)

```markdown
![예시 화면](/theories/images/example-screen.jpg)
```

---

## 🔗 이미지 링크 패턴

### 패턴 1: Supabase Storage (클라우드)
```markdown
![설명](https://vmvpnzjktbcmrpomgcfn.supabase.co/storage/v1/object/public/theory-images/파일명.png)
```

### 패턴 2: 로컬 (public 폴더)
```markdown
![설명](/theories/images/폴더명/파일명.png)
```

### 패턴 3: 외부 링크
```markdown
![설명](https://example.com/image.png)
```

---

## ✅ 체크리스트

새 이론 자료 작성 시:

- [ ] 이미지 크기 최적화 (500KB 이하)
- [ ] 이미지 파일명 영문 사용 (한글 X)
- [ ] alt 텍스트 작성 (접근성)
- [ ] Supabase Storage 또는 public 폴더에 저장
- [ ] 마크다운에서 URL 확인
- [ ] 실제 표시 확인

---

## 🚨 주의사항

1. **파일명**:
   - ✅ `ohaeng-cycle.png`
   - ❌ `오행 순환도.png` (한글 X)

2. **경로**:
   - ✅ `/theories/images/my-image.png`
   - ❌ `theories/images/my-image.png` (슬래시 빠짐)

3. **Public bucket**:
   - Storage bucket은 반드시 **Public**으로 설정
   - Private 시 이미지 안 보임

4. **CORS 설정**:
   - 외부 이미지 사용 시 CORS 오류 가능
   - Supabase Storage 사용 권장
