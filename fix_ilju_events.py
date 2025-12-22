#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
일주 이벤트 JSON 파일 수정 스크립트
1. "저녁에 농담" 관련 문장 삭제
2. 배열 형태로 잘못 들어간 일주 특성 수정
"""

import json
import re

def fix_ilju_events():
    """일주 이벤트 JSON 파일 수정"""

    # 파일 읽기
    with open('today_unse/ilju_daily_events.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    modified_count = 0
    array_fixed_count = 0

    # 각 일주별로 수정
    for ilju_key, ilju_data in data.items():
        # 1. "재미" 카테고리에서 "저녁에 농담" 문장 삭제
        if "오늘의이벤트" in ilju_data and "재미" in ilju_data["오늘의이벤트"]:
            original_length = len(ilju_data["오늘의이벤트"]["재미"])
            ilju_data["오늘의이벤트"]["재미"] = [
                event for event in ilju_data["오늘의이벤트"]["재미"]
                if "저녁에 농담" not in event
            ]
            if len(ilju_data["오늘의이벤트"]["재미"]) < original_length:
                modified_count += 1
                print(f"[OK] {ilju_key}: deleted joke")

        # 2. 배열 형태로 잘못 들어간 일주 특성 수정
        # 패턴: ['...', '...', '...', '...']를 찾아서 첫 번째 항목만 사용
        if "오늘의이벤트" in ilju_data:
            for category, events in ilju_data["오늘의이벤트"].items():
                for i, event in enumerate(events):
                    # ['항목1', '항목2', ...] 패턴 찾기
                    match = re.search(r"\['([^']+)'(?:,\s*'[^']+')*\]", event)
                    if match:
                        # 첫 번째 항목만 추출
                        first_item = match.group(1)
                        # 배열을 첫 번째 항목으로 교체
                        fixed_event = event.replace(match.group(0), first_item)
                        ilju_data["오늘의이벤트"][category][i] = fixed_event
                        array_fixed_count += 1
                        print(f"  {ilju_key} {category}: fixed array")

    # 파일 저장 (UTF-8, 들여쓰기 2칸, 한글 유지)
    with open('today_unse/ilju_daily_events.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n[DONE]")
    print(f"   - Deleted jokes: {modified_count} ilju")
    print(f"   - Fixed arrays: {array_fixed_count} items")
    print(f"   - Saved: today_unse/ilju_daily_events.json (UTF-8)")

if __name__ == "__main__":
    fix_ilju_events()
