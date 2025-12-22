#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
일주 이벤트에 플레이스홀더 다시 추가 (적절하게)
메인 이벤트, 에너지 조합, 요일별 테마에 일주 특성 추가
"""

import json
import random

# 파일 읽기
with open('today_unse/ilju_daily_events.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

total_changes = 0

# 플레이스홀더 옵션들
trait_placeholders = [
    '{ilju.핵심특성}',
    '{ilju.소통스타일}',
    '{ilju.감정표현}',
    '{ilju.업무스타일}',
]

for ilju_key, ilju_data in data.items():
    # 1. 오늘의이벤트 - 일부에만 플레이스홀더 추가 (과하지 않게)
    if "오늘의이벤트" in ilju_data:
        # 인연 - 2-3개 정도만
        if "인연" in ilju_data["오늘의이벤트"]:
            events = ilju_data["오늘의이벤트"]["인연"]
            if len(events) >= 1:
                events[0] = events[0].replace("당신에게", "{ilju.핵심특성} 당신에게")
            if len(events) >= 3:
                events[2] = events[2].replace("당신과", "{ilju.소통스타일} 당신과")
            total_changes += 2

        # 재미 - 1-2개
        if "재미" in ilju_data["오늘의이벤트"]:
            events = ilju_data["오늘의이벤트"]["재미"]
            if len(events) >= 2:
                events[1] = events[1].replace("당신도", "{ilju.핵심특성} 당신도")
            total_changes += 1

        # 행운 - 2개
        if "행운" in ilju_data["오늘의이벤트"]:
            events = ilju_data["오늘의이벤트"]["행운"]
            if len(events) >= 2:
                events[1] = events[1].replace("당신의 방식", "{ilju.업무스타일} 당신의 방식")
            total_changes += 1

        # 영감 - 2개
        if "영감" in ilju_data["오늘의이벤트"]:
            events = ilju_data["오늘의이벤트"]["영감"]
            if len(events) >= 1:
                events[0] = events[0].replace("당신만의", "{ilju.핵심특성} 당신만의")
            if len(events) >= 3:
                events[2] = events[2].replace("당신만의", "{ilju.감정표현} 당신만의")
            total_changes += 2

        # 도전 - 2개
        if "도전" in ilju_data["오늘의이벤트"]:
            events = ilju_data["오늘의이벤트"]["도전"]
            if len(events) >= 1:
                events[0] = events[0].replace("당신이라면", "{ilju.핵심특성} 당신이라면")
            total_changes += 1

    # 2. 시간대별예측 - 새벽, 저녁에만
    if "시간대별예측" in ilju_data:
        if "새벽" in ilju_data["시간대별예측"]:
            msg = ilju_data["시간대별예측"]["새벽"]
            if "당신답게" in msg:
                ilju_data["시간대별예측"]["새벽"] = msg.replace("당신답게", "{ilju.핵심특성} 당신답게")
                total_changes += 1

        if "저녁" in ilju_data["시간대별예측"]:
            msg = ilju_data["시간대별예측"]["저녁"]
            if "당신답게" in msg:
                ilju_data["시간대별예측"]["저녁"] = msg.replace("당신답게", "{ilju.감정표현} 당신답게")
                total_changes += 1

    # 3. 요일별테마 - 월, 수, 금, 일요일에만
    if "요일별테마" in ilju_data:
        weekdays_to_update = ["월요일", "수요일", "금요일", "일요일"]

        for weekday in weekdays_to_update:
            if weekday in ilju_data["요일별테마"]:
                msg = ilju_data["요일별테마"][weekday]
                if "당신" in msg and "{ilju" not in msg:
                    # 첫 번째 "당신" 앞에 플레이스홀더 추가
                    placeholder = random.choice(trait_placeholders)
                    msg = msg.replace("당신답게", f"{placeholder} 당신답게", 1)
                    msg = msg.replace("당신의", f"{placeholder} 당신의", 1)
                    msg = msg.replace("당신에게", f"{placeholder} 당신에게", 1)
                    ilju_data["요일별테마"][weekday] = msg
                    total_changes += 1

    # 4. 에너지조합 - 극단적인 상태에만 (3개)
    if "에너지조합" in ilju_data:
        keys_to_update = ["활동높음_마음높음", "활동낮음_마음낮음", "활동보통_마음보통"]

        for key in keys_to_update:
            if key in ilju_data["에너지조합"]:
                msg = ilju_data["에너지조합"][key]
                if "당신" in msg and "{ilju" not in msg:
                    placeholder = random.choice(trait_placeholders)
                    # 첫 번째 "당신" 앞에 플레이스홀더 추가
                    if "당신이" in msg:
                        msg = msg.replace("당신이", f"{placeholder} 당신이", 1)
                    elif "당신답게" in msg:
                        msg = msg.replace("당신답게", f"{placeholder} 당신답게", 1)
                    ilju_data["에너지조합"][key] = msg
                    total_changes += 1

# 파일 저장
with open('today_unse/ilju_daily_events.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"[DONE] Added {total_changes} placeholders")
print(f"   - Events: moderate usage")
print(f"   - Time predictions: 2 per ilju")
print(f"   - Weekday themes: 4 per ilju")
print(f"   - Energy combos: 3 per ilju")
