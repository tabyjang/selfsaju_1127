import json

with open('today_unse/stories/01_갑자.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
    content = json.dumps(data, ensure_ascii=False)

# 시간 표현 체크
time_expressions = ['저녁쯤', '오후에', '새벽에', '아침에', '밤에']
found_times = []

for expr in time_expressions:
    if expr in content:
        found_times.append(expr)

# 플레이스홀더 체크
placeholders = ['{핵심특성}', '{소통스타일}', '{업무스타일}', '{감정표현}']
found_placeholders = []

for ph in placeholders:
    if ph in content:
        found_placeholders.append(ph)

print(f"파일 구조 키: {list(data.keys())}")
print(f"\n시간 표현 개수: {len(found_times)}개")
if found_times:
    print(f"발견된 시간 표현: {found_times}")
    
print(f"\n플레이스홀더 개수: {len(found_placeholders)}개")
if found_placeholders:
    print(f"발견된 플레이스홀더: {found_placeholders}")

# 액션 길이 확인
short_actions = []
all_actions_length = []

if '운세' in data:
    for unsung_name, fortunes in data['운세'].items():
        for idx, fortune in enumerate(fortunes, 1):
            if '액션' in fortune:
                action_len = len(fortune['액션'])
                all_actions_length.append(action_len)
                if action_len < 40:
                    short_actions.append({
                        '운세': unsung_name,
                        'v': idx,
                        '액션': fortune['액션'],
                        '길이': action_len
                    })

print(f"\n짧은 액션(<40자) 개수: {len(short_actions)}개")
if all_actions_length:
    print(f"평균 액션 길이: {sum(all_actions_length)/len(all_actions_length):.1f}자")
