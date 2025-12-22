#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
정규식 치환으로 인한 공백 문제 수정
"""

import json
import re

# 파일 읽기
with open('today_unse/ilju_daily_events.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

total_fixes = 0

for ilju_key, ilju_data in data.items():
    # 1. 오늘의이벤트
    if "오늘의이벤트" in ilju_data:
        for category, events in ilju_data["오늘의이벤트"].items():
            for i, event in enumerate(events):
                original = event

                # "2-3당신" → "2-3시쯤 당신"
                event = re.sub(r'(\d)-(\d)당신', r'\1-\2시쯤 당신', event)

                # ".당신" → ". 당신"
                event = re.sub(r'\.당신', '. 당신', event)

                # "!당신" → "! 당신"
                event = re.sub(r'!당신', '! 당신', event)

                # "요.당신" → "요. 당신"
                event = re.sub(r'요\.당신', '요. 당신', event)

                if original != event:
                    ilju_data["오늘의이벤트"][category][i] = event
                    total_fixes += 1

    # 2. 시간대별예측
    if "시간대별예측" in ilju_data:
        for time_key, time_msg in ilju_data["시간대별예측"].items():
            original = time_msg
            time_msg = re.sub(r'\.당신', '. 당신', time_msg)
            time_msg = re.sub(r',당신', ', 당신', time_msg)

            if original != time_msg:
                ilju_data["시간대별예측"][time_key] = time_msg
                total_fixes += 1

    # 3. 요일별테마
    if "요일별테마" in ilju_data:
        for weekday, theme_msg in ilju_data["요일별테마"].items():
            original = theme_msg
            theme_msg = re.sub(r'!당신', '! 당신', theme_msg)
            theme_msg = re.sub(r'\.당신', '. 당신', theme_msg)

            if original != theme_msg:
                ilju_data["요일별테마"][weekday] = theme_msg
                total_fixes += 1

    # 4. 에너지조합
    if "에너지조합" in ilju_data:
        for energy_key, energy_msg in ilju_data["에너지조합"].items():
            original = energy_msg
            energy_msg = re.sub(r'\.당신', '. 당신', energy_msg)

            if original != energy_msg:
                ilju_data["에너지조합"][energy_key] = energy_msg
                total_fixes += 1

# 파일 저장
with open('today_unse/ilju_daily_events.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"[DONE] Fixed {total_fixes} spacing issues")
