#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
일주 이벤트 JSON 파일 전체 배열 수정 스크립트
시간대별예측, 요일별테마, 에너지조합의 배열 형태도 모두 수정
"""

import json
import re

def fix_all_arrays():
    """일주 이벤트 JSON 파일의 모든 배열 형태 수정"""

    # 파일 읽기
    with open('today_unse/ilju_daily_events.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    total_fixed = 0

    # 각 일주별로 수정
    for ilju_key, ilju_data in data.items():
        # 1. 오늘의이벤트 (이미 수정됨)
        if "오늘의이벤트" in ilju_data:
            for category, events in ilju_data["오늘의이벤트"].items():
                for i, event in enumerate(events):
                    match = re.search(r"\['([^']+)'(?:,\s*'[^']+')*\]", event)
                    if match:
                        first_item = match.group(1)
                        fixed_event = event.replace(match.group(0), first_item)
                        ilju_data["오늘의이벤트"][category][i] = fixed_event
                        total_fixed += 1

        # 2. 시간대별예측
        if "시간대별예측" in ilju_data:
            for time_key, time_msg in ilju_data["시간대별예측"].items():
                match = re.search(r"\['([^']+)'(?:,\s*'[^']+')*\]", time_msg)
                if match:
                    first_item = match.group(1)
                    fixed_msg = time_msg.replace(match.group(0), first_item)
                    ilju_data["시간대별예측"][time_key] = fixed_msg
                    total_fixed += 1
                    print(f"  {ilju_key} 시간대별예측.{time_key}: fixed")

        # 3. 요일별테마
        if "요일별테마" in ilju_data:
            for weekday, theme_msg in ilju_data["요일별테마"].items():
                match = re.search(r"\['([^']+)'(?:,\s*'[^']+')*\]", theme_msg)
                if match:
                    first_item = match.group(1)
                    fixed_msg = theme_msg.replace(match.group(0), first_item)
                    ilju_data["요일별테마"][weekday] = fixed_msg
                    total_fixed += 1
                    print(f"  {ilju_key} 요일별테마.{weekday}: fixed")

        # 4. 에너지조합
        if "에너지조합" in ilju_data:
            for energy_key, energy_msg in ilju_data["에너지조합"].items():
                match = re.search(r"\['([^']+)'(?:,\s*'[^']+')*\]", energy_msg)
                if match:
                    first_item = match.group(1)
                    fixed_msg = energy_msg.replace(match.group(0), first_item)
                    ilju_data["에너지조합"][energy_key] = fixed_msg
                    total_fixed += 1
                    print(f"  {ilju_key} 에너지조합.{energy_key}: fixed")

    # 파일 저장 (UTF-8, 들여쓰기 2칸, 한글 유지)
    with open('today_unse/ilju_daily_events.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n[DONE]")
    print(f"   - Total arrays fixed: {total_fixed} items")
    print(f"   - Saved: today_unse/ilju_daily_events.json (UTF-8)")

if __name__ == "__main__":
    fix_all_arrays()
