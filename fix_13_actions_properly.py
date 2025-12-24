import json
import random
import sys
import io

# UTF-8 인코딩 강제 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('today_unse/stories/13_병자.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 다양한 마무리 표현들 (정성스럽게 작성)
action_endings = [
    "오늘 하루 잘 보내세요.",
    "좋은 하루 만들어가세요.",
    "멋진 하루 되세요.",
    "빛나는 하루 보내세요.",
    "행복한 하루 되세요.",
    "당당한 하루 보내세요.",
    "의미 있는 하루 만드세요.",
    "보람찬 하루 되세요.",
    "충만한 하루 보내세요.",
    "값진 하루 만드세요.",
    "훌륭한 하루 되세요.",
    "멋지게 보내세요.",
    "당신답게 보내세요.",
    "진심을 다해 보내세요.",
    "최선을 다하세요.",
    "마음껏 누리세요.",
    "자신 있게 나아가세요.",
    "용기 내어 도전하세요.",
    "믿고 나아가세요.",
    "꾸준히 이어가세요.",
]

fixed_count = 0

for unsung_name, fortunes in data['운세'].items():
    for fortune in fortunes:
        if '액션' in fortune:
            original = fortune['액션']

            # "실천해나가세요" 또는 "확실하게 실천해나가세요" 제거
            if '실천해나가세요' in original:
                # 먼저 불필요한 부분 제거
                액션 = original.replace(' 확실하게 실천해나가세요.', '')
                액션 = 액션.replace(' 실천해나가세요.', '')

                # 40자 이상 유지하면서 다양한 마무리 추가
                if len(액션) >= 30:
                    # 충분히 길면 짧은 마무리
                    ending = random.choice([
                        "오늘 하루 잘 보내세요.",
                        "좋은 하루 되세요.",
                        "멋진 하루 보내세요.",
                        "당당한 하루 되세요.",
                        "빛나는 하루 되세요.",
                        "행복한 하루 만드세요.",
                        "의미 있게 보내세요.",
                        "당신답게 보내세요.",
                        "진심을 다하세요.",
                        "최선을 다하세요.",
                    ])
                else:
                    # 짧으면 좀 더 긴 마무리
                    ending = random.choice([
                        "오늘 하루도 멋지게 보내세요.",
                        "당신답게 빛나는 하루 만드세요.",
                        "진심을 담아 좋은 하루 보내세요.",
                        "자신 있게 훌륭한 하루 만드세요.",
                        "용기 내어 의미 있는 하루 되세요.",
                        "최선을 다해 보람찬 하루 보내세요.",
                        "당당하게 행복한 하루 만드세요.",
                        "마음껏 충만한 하루 누리세요.",
                    ])

                액션 = 액션.strip() + " " + ending

                fortune['액션'] = 액션
                fixed_count += 1

with open('today_unse/stories/13_병자.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"{'='*60}")
print(f"✅ 액션 {fixed_count}개 다양하게 수정 완료!")
print(f"{'='*60}")
print("샘플:")
for unsung_name, fortunes in list(data['운세'].items())[:3]:
    for i, fortune in enumerate(fortunes[:2], 1):
        print(f"  [{unsung_name}-{i}] {fortune['액션'][:60]}...")
print(f"{'='*60}")
