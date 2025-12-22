#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ilju_daily_events.json에서 하드코딩된 일주 특성 제거
"""

import json
import re

# 파일 읽기
with open('today_unse/ilju_daily_events.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 각 일주별로 처리
total_changes = 0

for ilju_key, ilju_data in data.items():
    # 1. 오늘의이벤트
    if "오늘의이벤트" in ilju_data:
        for category, events in ilju_data["오늘의이벤트"].items():
            for i, event in enumerate(events):
                original = event

                # 패턴: "일주특성 당신에게" -> "당신에게"
                event = re.sub(r'[가-힣\s]+당신에게', '당신에게', event)

                # 패턴: "일주특성 당신이라면" -> "당신이라면"
                event = re.sub(r'[가-힣\s]+당신이라면', '당신이라면', event)

                # 패턴: "일주특성 당신의 (스타일/특성/감각/관점)" -> "당신의 ~"
                event = re.sub(r'[가-힣\s,\']+당신의 (스타일|특성|감각|관점|강점)', r'당신의 \1', event)

                # 패턴: "일주특성 당신답게" -> "당신답게"
                event = re.sub(r'[가-힣\s,\']+당신답게', '당신답게', event)

                # 패턴: "일주특성 당신만의" -> "당신만의"
                event = re.sub(r'[가-힣\s,\']+당신만의', '당신만의', event)

                # 패턴: "일주특성 당신," -> "당신,"
                event = re.sub(r'[가-힣\s,\']+당신,', '당신,', event)

                # 패턴: "일주특성 당신이" -> "당신이"
                event = re.sub(r'[가-힣\s,\']+당신이', '당신이', event)

                if original != event:
                    ilju_data["오늘의이벤트"][category][i] = event
                    total_changes += 1
                    print(f"  {ilju_key} {category}: removed trait")

    # 2. 시간대별예측
    if "시간대별예측" in ilju_data:
        for time_key, time_msg in ilju_data["시간대별예측"].items():
            original = time_msg
            time_msg = re.sub(r'[가-힣\s,\']+당신답게', '당신답게', time_msg)

            if original != time_msg:
                ilju_data["시간대별예측"][time_key] = time_msg
                total_changes += 1
                print(f"  {ilju_key} 시간대별예측.{time_key}: removed trait")

    # 3. 요일별테마
    if "요일별테마" in ilju_data:
        for weekday, theme_msg in ilju_data["요일별테마"].items():
            original = theme_msg

            # "일주특성 당신답게" -> "당신답게"
            theme_msg = re.sub(r'[가-힣\s,\']+당신답게', '당신답게', theme_msg)

            # "일주특성 당신에게" -> "당신에게"
            theme_msg = re.sub(r'[가-힣\s,\']+당신에게', '당신에게', theme_msg)

            # "일주특성 당신의 강점" -> "당신의 강점"
            theme_msg = re.sub(r'[가-힣\s,\']+당신의 강점', '당신의 강점', theme_msg)

            if original != theme_msg:
                ilju_data["요일별테마"][weekday] = theme_msg
                total_changes += 1
                print(f"  {ilju_key} 요일별테마.{weekday}: removed trait")

    # 4. 에너지조합
    if "에너지조합" in ilju_data:
        for energy_key, energy_msg in ilju_data["에너지조합"].items():
            original = energy_msg

            # "일주특성 당신이" -> "당신이"
            energy_msg = re.sub(r'[가-힣\s,\']+당신이', '당신이', energy_msg)

            # "일주특성 당신답게" -> "당신답게"
            energy_msg = re.sub(r'[가-힣\s,\']+당신답게', '당신답게', energy_msg)

            if original != energy_msg:
                ilju_data["에너지조합"][energy_key] = energy_msg
                total_changes += 1
                print(f"  {ilju_key} 에너지조합.{energy_key}: removed trait")

# 파일 저장
with open('today_unse/ilju_daily_events.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\n[DONE]")
print(f"   - Total changes: {total_changes}")
print(f"   - Saved: today_unse/ilju_daily_events.json (UTF-8)")
