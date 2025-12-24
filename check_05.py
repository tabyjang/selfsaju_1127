import json

with open('today_unse/stories/05_갑신.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 구조 확인
print(f"파일 구조 키: {list(data.keys())}")

placeholder_count = 0
short_actions = []
all_actions_length = []
placeholder_types = {}

# 십이운성 구조 확인
if '십이운성' in data:
    for unsung_name, unsung_data in data['십이운성'].items():
        fortunes = unsung_data.get('fortunes', [])
        for idx, fortune in enumerate(fortunes, 1):
            # 플레이스홀더 확인
            if '본문' in fortune:
                for placeholder in ['{핵심특성}', '{소통스타일}', '{업무스타일}', '{감정표현}']:
                    if placeholder in fortune['본문']:
                        placeholder_count += 1
                        placeholder_types[placeholder] = placeholder_types.get(placeholder, 0) + 1

            # 액션 길이 확인
            if '액션' in fortune:
                action_len = len(fortune['액션'])
                all_actions_length.append(action_len)
                if action_len < 40:
                    short_actions.append({
                        '십이운성': unsung_name,
                        'v': idx,
                        '액션': fortune['액션'],
                        '길이': action_len
                    })

print(f"플레이스홀더 개수: {placeholder_count}개")
print(f"플레이스홀더 종류: {placeholder_types}")
print(f"짧은 액션(<40자) 개수: {len(short_actions)}개")
if all_actions_length:
    print(f"평균 액션 길이: {sum(all_actions_length)/len(all_actions_length):.1f}자")
print(f"\n가장 짧은 액션 5개:")
short_actions.sort(key=lambda x: x['길이'])
for item in short_actions[:5]:
    print(f"  {item['십이운성']} v{item['v']}: {item['액션']} ({item['길이']}자)")
