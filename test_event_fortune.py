"""
이벤트 기반 운세 생성 테스트
실제로 운세가 어떻게 생성되는지 시뮬레이션
"""
import json
import random
from datetime import datetime

# 데이터 로드
with open('today_unse/ilju_personalities.json', 'r', encoding='utf-8') as f:
    personalities = json.load(f)

with open('today_unse/ilju_daily_events.json', 'r', encoding='utf-8') as f:
    daily_events = json.load(f)

with open('today_unse/unseong_themes.json', 'r', encoding='utf-8') as f:
    unseong_themes = json.load(f)

# 테스트 입력
TEST_ILJU = "己丑"  # 기축
TEST_UNSEONG = "장생"  # 장생
TEST_DEUKRYEONG = True
TEST_GWIIN = False
TEST_DATE = datetime.now()

# 에너지 계산
def calculate_mental_energy(ae, deukryeong, gwiin):
    me = ae
    if deukryeong:
        me += 1
    if gwiin:
        me += 1
    return me

def calculate_energy_level(me):
    if me >= 6:
        return 'high', '높음'
    elif me >= 4:
        return 'medium', '보통'
    else:
        return 'low', '낮음'

def calculate_activity_level(me):
    if me >= 6:
        return 'active', '높음'
    elif me >= 4:
        return 'moderate', '보통'
    else:
        return 'rest', '낮음'

def get_weekday_korean():
    weekdays = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일']
    return weekdays[TEST_DATE.weekday()]

# 운세 생성
def generate_test_fortune():
    # 데이터 가져오기
    ilju_data = personalities[TEST_ILJU]
    ilju_events = daily_events[TEST_ILJU]
    unseong_data = unseong_themes[TEST_UNSEONG]

    # 에너지 계산
    ae = unseong_data['AE']
    me = calculate_mental_energy(ae, TEST_DEUKRYEONG, TEST_GWIIN)
    energy_level, energy_text = calculate_energy_level(me)
    activity_level, activity_text = calculate_activity_level(me)

    # 에너지 조합
    energy_combo = f"활동{activity_text}_마음{energy_text}"

    # 요일
    weekday = get_weekday_korean()

    # 이벤트 카테고리 선택 (에너지 레벨별)
    if energy_level == 'high':
        event_categories = ['인연', '도전', '행운']
    elif energy_level == 'medium':
        event_categories = ['인연', '재미', '영감']
    else:
        event_categories = ['영감', '재미', '인연']

    # 에너지 아이콘
    activity_emoji = '🔥🔥🔥' if activity_level == 'active' else '🔥🔥' if activity_level == 'moderate' else '🔥'
    mental_emoji = '💎💎💎' if energy_level == 'high' else '💎💎' if energy_level == 'medium' else '💎'

    # 운세 생성
    print("="*80)
    print(" " * 30 + "오늘의 운세")
    print("="*80)
    print()

    # 헤더
    activity_icon = "[활동]" if activity_level == 'active' else "[활동]" if activity_level == 'moderate' else "[활동]"
    mental_icon = "[마음]" if energy_level == 'high' else "[마음]" if energy_level == 'medium' else "[마음]"

    print(f"{activity_icon} 활동 에너지 {activity_text}  {mental_icon} 마음 에너지 {energy_text}")
    print()
    print(f"[ {ilju_data['일주']} 일주 운세 ]")
    print()

    # 오프닝
    first_event = random.choice(ilju_events['오늘의이벤트'][event_categories[0]])
    event_preview = first_event.split('수 있어요')[0] + '수 있어요'

    print(f">> {ilju_data['핵심특성']} 당신에게 오늘은 특별해요!")
    print()
    print(f"* {event_preview}")
    print()

    # 에너지 조합 메시지
    print("-" * 80)
    print(ilju_events['에너지조합'][energy_combo])
    print("-" * 80)
    print()

    # 메인 이벤트 3개
    category_prefix = {
        '인연': '[인연]',
        '재미': '[재미]',
        '행운': '[행운]',
        '영감': '[영감]',
        '도전': '[도전]'
    }

    print("< 오늘의 주요 이벤트 >")
    print()
    for i, category in enumerate(event_categories, 1):
        event = random.choice(ilju_events['오늘의이벤트'][category])
        print(f"{i}. {category_prefix[category]} {event}")
        print()

    # 시간대별 예측
    time_periods = ['오전', '점심', '오후', '저녁']
    selected_time = random.choice(time_periods)
    time_prediction = ilju_events['시간대별예측'][selected_time]

    print("-" * 80)
    print(f"[시간] 오늘의 골든타임: {selected_time}")
    print(f"     {time_prediction}")
    print("-" * 80)
    print()

    # 요일 테마
    print(f"[요일] {weekday}의 테마")
    print(f"     {ilju_events['요일별테마'][weekday]}")
    print()

    # 액션 플랜
    print("-" * 80)
    print("[ 오늘의 액션 플랜 ]")
    print()

    action1 = ilju_events['요일별테마'][weekday].split('.')[0]
    action2 = random.choice(ilju_events['오늘의이벤트'][event_categories[0]]).split(',')[0]
    action3 = random.choice(ilju_events['오늘의이벤트'][event_categories[1]]).split(',')[0]

    print(f"  1. {action1}")
    print(f"  2. {action2}")
    print(f"  3. {action3}")
    print()

    # 마무리
    print("-" * 80)
    print(f">> {ilju_data['핵심특성']} 당신에게 오늘은 특별한 날이 될 거예요. 기대 가득!")
    print("="*80)
    print()

    # 메타 정보
    print(f"[정보] 운세 생성 정보")
    print(f"   일주: {ilju_data['일주']} ({TEST_ILJU})")
    print(f"   십이운성: {unseong_data['운성']}")
    print(f"   활동 에너지(AE): {ae}")
    print(f"   마음 에너지(ME): {me}")
    print(f"   득령: {'O' if TEST_DEUKRYEONG else 'X'}")
    print(f"   귀인: {'O' if TEST_GWIIN else 'X'}")
    print(f"   날짜: {TEST_DATE.strftime('%Y-%m-%d (%A)')}")
    print()

# 실행
if __name__ == "__main__":
    print()
    generate_test_fortune()
