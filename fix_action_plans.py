#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
액션 플랜의 강점 참조를 다양한 일주 특성으로 대체
"""

import re

# 파일 읽기
with open('utils/fortuneTemplate/eventFortuneGenerator.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# iljuData.강점 패턴을 찾아서 다양한 특성으로 교체
replacements = [
    # 화요일
    (r"      `\$\{iljuData\.핵심특성\} 당신, 오늘은 실행에 집중하기`,\n      `\$\{iljuData\.강점\}을 활용해 업무 속도 높이기`,",
     "      `${iljuData.핵심특성} 당신, 오늘은 실행에 집중하기`,\n      `${firstStrength}을(를) 활용해 업무 속도 높이기`,"),

    (r"`\$\{iljuData\.강점\}으로 어려운 과제 돌파하기`",
     "`${firstStrength}으(로) 어려운 과제 돌파하기`"),

    (r"`\$\{iljuData\.강점\}을 믿고 과감하게 진행하기`",
     "`${firstStrength}을(를) 믿고 과감하게 진행하기`"),

    # 수요일
    (r"`\$\{iljuData\.강점\}을 활용해 중간 점검하기`",
     "`${firstStrength}을(를) 활용해 중간 점검하기`"),

    (r"`\$\{iljuData\.강점\}으로 부족한 부분 보완하기`",
     "`${firstStrength}으(로) 부족한 부분 보완하기`"),

    (r"`\$\{iljuData\.강점\}을 발휘해 남은 일정 계획하기`",
     "`${firstStrength}을(를) 발휘해 남은 일정 계획하기`"),

    # 목요일
    (r"`\$\{iljuData\.강점\}을 발휘해 속도 높이기`",
     "`${firstStrength}을(를) 발휘해 속도 높이기`"),

    (r"`\$\{iljuData\.강점\}으로 밀린 일 정리하기`",
     "`${firstStrength}으(로) 밀린 일 정리하기`"),

    (r"`\$\{iljuData\.강점\}을 활용해 효율적으로 일 처리하기`",
     "`${firstStrength}을(를) 활용해 효율적으로 일 처리하기`"),

    # 금요일
    (r"`\$\{iljuData\.강점\}을 활용해 이번 주 성과 정리하기`",
     "`${firstStrength}을(를) 활용해 이번 주 성과 정리하기`"),

    (r"`\$\{iljuData\.강점\}으로 주요 성과 기록하기`",
     "`${firstStrength}으(로) 주요 성과 기록하기`"),

    (r"`\$\{iljuData\.강점\}을 발휘한 순간 떠올리며 뿌듯해하기`",
     "`${firstStrength}을(를) 발휘한 순간 떠올리며 뿌듯해하기`"),

    # 토요일
    (r"`\$\{iljuData\.강점\}을 활용해 새로운 것 배워보기`",
     "`${firstStrength}을(를) 활용해 새로운 것 배워보기`"),

    (r"`\$\{iljuData\.강점\}을 살려 개인 프로젝트 진행하기`",
     "`${firstStrength}을(를) 살려 개인 프로젝트 진행하기`"),

    (r"`\$\{iljuData\.강점\}으로 가족과 특별한 시간 만들기`",
     "`${firstStrength}으(로) 가족과 특별한 시간 만들기`"),

    # 일요일
    (r"`\$\{iljuData\.강점\}을 점검하며 자신감 회복하기`",
     "`${firstStrength}을(를) 점검하며 자신감 회복하기`"),

    (r"`\$\{iljuData\.강점\}을 되새기며 일기 쓰기`",
     "`${firstStrength}을(를) 되새기며 일기 쓰기`"),

    (r"`\$\{iljuData\.강점\}을 떠올리며 감사 일기 쓰기`",
     "`${firstStrength}을(를) 떠올리며 감사 일기 쓰기`"),

    # 카테고리별 액션 - 인연
    (r"`\$\{iljuData\.강점\}을 활용해 협업 기회 적극 참여하기`",
     "`${firstStrength}을(를) 활용해 협업 기회 적극 참여하기`"),

    (r"`\$\{iljuData\.강점\}으로 팀워크 강화하기`",
     "`${firstStrength}으(로) 팀워크 강화하기`"),

    # 재미
    (r"`\$\{iljuData\.강점\}을 살려 새로운 것 시도하며 즐거움 찾기`",
     "`${firstStrength}을(를) 살려 새로운 것 시도하며 즐거움 찾기`"),

    (r"`\$\{iljuData\.강점\}으로 창의적인 놀이 즐기기`",
     "`${firstStrength}으(로) 창의적인 놀이 즐기기`"),

    (r"`\$\{iljuData\.강점\}을 활용해 즐거운 추억 만들기`",
     "`${firstStrength}을(를) 활용해 즐거운 추억 만들기`"),

    # 행운
    (r"`\$\{iljuData\.강점\}을 믿고 좋은 기회 주저 없이 잡기`",
     "`${firstStrength}을(를) 믿고 좋은 기회 주저 없이 잡기`"),

    (r"`\$\{iljuData\.강점\}으로 기회의 순간 포착하기`",
     "`${firstStrength}으(로) 기회의 순간 포착하기`"),

    (r"`\$\{iljuData\.강점\}을 발휘할 타이밍 잡기`",
     "`${firstStrength}을(를) 발휘할 타이밍 잡기`"),

    # 영감
    (r"`\$\{iljuData\.강점\}을 활용해 다른 관점에서 문제 바라보기`",
     "`${firstStrength}을(를) 활용해 다른 관점에서 문제 바라보기`"),

    (r"`\$\{iljuData\.강점\}으로 창의적 사고 확장하기`",
     "`${firstStrength}으(로) 창의적 사고 확장하기`"),

    (r"`\$\{iljuData\.강점\}을 활용해 독창적인 해결책 찾기`",
     "`${firstStrength}을(를) 활용해 독창적인 해결책 찾기`"),

    # 도전
    (r"`\$\{iljuData\.강점\}을 믿고 안전지대에서 벗어나 도전하기`",
     "`${firstStrength}을(를) 믿고 안전지대에서 벗어나 도전하기`"),

    (r"`\$\{iljuData\.강점\}으로 어려운 과제에 도전하기`",
     "`${firstStrength}으(로) 어려운 과제에 도전하기`"),

    (r"`\$\{iljuData\.강점\}을 발휘해 불가능해 보이는 것 시도하기`",
     "`${firstStrength}을(를) 발휘해 불가능해 보이는 것 시도하기`"),
]

# 순차적으로 교체
for pattern, replacement in replacements:
    content = re.sub(pattern, replacement, content)

# 파일 저장
with open('utils/fortuneTemplate/eventFortuneGenerator.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("[DONE] Fixed all action plan references to use firstStrength")
