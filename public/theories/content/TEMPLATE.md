<!--
================================================================================
  강의 콘텐츠 템플릿

  [사용 방법]
  1. 이 파일을 복사하여 새 파일 생성 (예: yeonghaejapyeong-04.md)
  2. 아래 프론트매터 중 하나를 선택하여 수정
  3. 본문 내용 작성
  4. 업로드 실행: npx tsx scripts/add-lecture.ts <파일경로>
================================================================================
-->

<!-- ========== 프론트매터 옵션 1: 과목 내 강의용 ========== -->
---
courseId: yeonghaejapyeong
title: 강의 제목을 입력하세요
subtitle: 부제목 (선택사항)
description: 이 강의에서 배울 내용을 한 줄로 설명
orderIndex: 1
readTime: 15
tags: [태그1, 태그2, 태그3]
relatedLectures: [yeonghaejapyeong-01, yeonghaejapyeong-02]
---

<!-- ========== 프론트매터 옵션 2: 독립 이론 콘텐츠용 ========== -->
<!--
---
id: new-theory-id
title: 이론 제목을 입력하세요
category: basics
tags: [태그1, 태그2, 태그3]
difficulty: beginner
readTime: 15
featured: false
relatedTheories: [saju-basics, ohaeng-theory]
---
-->

<!--
================================================================================
  프론트매터 필드 설명
================================================================================

[강의용 필수 필드]
  courseId    : 과목 ID (yeonghaejapyeong, jeokcheonsu, saju-basics 등)
  title       : 강의 제목
  orderIndex  : 강의 순서 (1, 2, 3...)
  readTime    : 예상 읽기 시간 (분)

[강의용 선택 필드]
  subtitle        : 부제목
  description     : 강의 설명
  tags            : 태그 배열
  relatedLectures : 관련 강의 ID 배열

[이론용 필드]
  id              : 고유 ID (영문, 하이픈 사용)
  category        : basics | classic | advanced | practical
  difficulty      : beginner | intermediate | advanced
  featured        : true | false (메인 노출 여부)
  relatedTheories : 관련 이론 ID 배열

[카테고리 옵션]
  basics    : 기초 이론 (입문자용)
  classic   : 고전 명리 (연해자평, 적천수 등)
  advanced  : 심화 이론 (고급 분석)
  practical : 실전 활용 (사례 중심)

[난이도 옵션]
  beginner     : 입문 (명리학 처음 접하는 분)
  intermediate : 중급 (기초 개념 이해한 분)
  advanced     : 고급 (실전 경험 있는 분)

================================================================================
-->

# 강의 제목

## 학습 목표

이 강의를 마치면 다음을 이해할 수 있습니다:
- 첫 번째 학습 목표
- 두 번째 학습 목표
- 세 번째 학습 목표

## 개요

이 강의에 대한 간단한 소개를 작성하세요. **중요한 부분**은 굵게 표시할 수 있습니다.

## 주요 개념

### 첫 번째 개념

여기에 설명을 작성합니다.

- 리스트 항목 1
- 리스트 항목 2
- 리스트 항목 3

### 두 번째 개념

1. 순서 있는 리스트 1
2. 순서 있는 리스트 2
3. 순서 있는 리스트 3

## 상세 설명

### 예시와 함께 설명

**예시**: 갑자일주의 경우...

내부 링크는 이렇게 사용합니다: [사주명리 기초](/theory/saju-basics)

외부 링크는 이렇게: [위키백과](https://ko.wikipedia.org)

### 이미지 삽입

![이미지 설명](https://vmvpnzjktbcmrpomgcfn.supabase.co/storage/v1/object/public/theory-images/your-image.png)

또는 로컬 이미지:

![로컬 이미지](/theories/images/your-folder/your-image.png)

### 표 작성

| 구분 | 특징 | 예시 |
|------|------|------|
| 목(木) | 생장, 발산 | 봄 |
| 화(火) | 발산, 상승 | 여름 |
| 토(土) | 화육, 포용 | 환절기 |
| 금(金) | 수렴, 하강 | 가을 |
| 수(水) | 침잠, 저장 | 겨울 |

## 실전 활용

### 사례 1: 제목

실제 사례를 들어 설명합니다.

### 사례 2: 제목

또 다른 사례...

## 심화 내용

> 인용문은 이렇게 작성합니다.
> 중요한 고전 문구나 격언을 인용할 때 사용합니다.

### 코드 예시 (필요시)

```python
# Python 코드 예시
def calculate_ohaeng(ilgan):
    return ohaeng_map[ilgan]
```

## 핵심 정리

이 강의의 핵심 요약:

1. 첫 번째 핵심 포인트
2. 두 번째 핵심 포인트
3. 세 번째 핵심 포인트

## 복습 문제

스스로 점검해보세요:

1. (질문 1)?
2. (질문 2)?
3. (질문 3)?

---

**추천 학습 경로**:
1. [사주명리 기초](/theory/saju-basics) - 기본 개념
2. [오행 이론](/theory/ohaeng-theory) - 오행 이해
3. **현재 강의** - 심화 학습

**다음 강의**:
- [다음 강의 제목](/theory/course-id/lecture-id)

**관련 강의**:
- [관련 강의 1](/theory/related-1)
- [관련 강의 2](/theory/related-2)

<!--
================================================================================
  작성 팁
================================================================================

1. 제목 구조
   - # : 강의 제목 (1개만)
   - ## : 주요 섹션
   - ### : 하위 섹션

2. 강조 표현
   - **굵게** : 핵심 용어, 중요 개념
   - *기울임* : 부연 설명, 참고사항
   - `코드` : 기술 용어, 명령어

3. 명리학 용어 표기
   - 한자 병기 권장: 격국(格局), 용신(用神)
   - 첫 등장 시 설명 추가

4. 이미지 업로드
   - Supabase Storage: theory-images 버킷 사용
   - 파일명: 과목ID-강의번호-설명.png (예: yeonghaejapyeong-04-geokguk-diagram.png)

5. 내부 링크 형식
   - 이론 페이지: /theory/이론ID
   - 강의 페이지: /theories/과목ID/lecture/강의ID

================================================================================
-->
