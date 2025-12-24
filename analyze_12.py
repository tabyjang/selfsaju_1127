import json
import sys
import io

# UTF-8 인코딩 강제 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('today_unse/stories/12_을해.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
    content = json.dumps(data, ensure_ascii=False)

print("="*60)
print("을해(12) 파일 분석 결과")
print("="*60)

# 기본이미지 확인
if '기본이미지' in data:
    print(f"\n[기본이미지]\n{data['기본이미지']}")

# 구조 확인
print(f"\n[파일 구조]")
print(f"최상위 키: {list(data.keys())}")

if '십이운성' in data:
    print(f"십이운성 키: {list(data['십이운성'].keys())}")
    print("[구조 변경 필요] 십이운성 -> fortunes 구조를 운세 구조로 변경해야 함")
elif '운세' in data:
    print(f"운세 키: {list(data['운세'].keys())}")
    print("[OK] 이미 올바른 운세 구조")

# 플레이스홀더 체크
placeholders = ['{핵심특성}', '{소통스타일}', '{업무스타일}', '{감정표현}']
found_placeholders = {}

for ph in placeholders:
    count = content.count(ph)
    if count > 0:
        found_placeholders[ph] = count

print(f"\n[플레이스홀더]")
if found_placeholders:
    total = sum(found_placeholders.values())
    print(f"총 {total}개 발견:")
    for ph, count in found_placeholders.items():
        print(f"  {ph}: {count}개")
else:
    print("[OK] 플레이스홀더 없음 (0개)")

# 시간 표현 체크
time_expressions = ['저녁쯤', '오후에', '새벽에', '아침에', '밤에']
found_times = {}

for expr in time_expressions:
    count = content.count(expr)
    if count > 0:
        found_times[expr] = count

print(f"\n[시간 표현]")
if found_times:
    total = sum(found_times.values())
    print(f"총 {total}개 발견:")
    for expr, count in found_times.items():
        print(f"  {expr}: {count}개")
else:
    print("[OK] 시간 표현 없음 (0개)")

# 액션 길이 확인
print(f"\n[액션 통계]")
all_actions_length = []
short_actions = 0

if '운세' in data:
    for unsung_name, fortunes in data['운세'].items():
        for fortune in fortunes:
            if '액션' in fortune:
                action_len = len(fortune['액션'])
                all_actions_length.append(action_len)
                if action_len < 40:
                    short_actions += 1

if all_actions_length:
    avg_len = sum(all_actions_length) / len(all_actions_length)
    print(f"총 액션 개수: {len(all_actions_length)}개")
    print(f"평균 액션 길이: {avg_len:.1f}자")
    if short_actions > 0:
        print(f"짧은 액션(<40자): {short_actions}개")
    else:
        print(f"[OK] 모든 액션 40자 이상")

print("\n" + "="*60)
