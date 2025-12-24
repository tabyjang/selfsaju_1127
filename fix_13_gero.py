import json
import sys
import io
import re

# UTF-8 인코딩 강제 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('today_unse/stories/13_병자.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

fixed_count = 0

for unsung_name, fortunes in data['운세'].items():
    for fortune in fortunes:
        # 본문 수정
        if '본문' in fortune:
            original = fortune['본문']

            # ~~게로 → ~~게
            본문 = re.sub(r'([가-힣]+)게로', r'\1게', original)

            # ~~히로 → ~~히 (혹시 있을 경우)
            본문 = re.sub(r'([가-힣]+)히로', r'\1히', 본문)

            if 본문 != original:
                fortune['본문'] = 본문
                fixed_count += 1
                print(f"[{unsung_name}-{fortune['v']}] {fortune['제목']} - 수정")

        # 액션 수정
        if '액션' in fortune:
            original_액션 = fortune['액션']

            # ~~게로 → ~~게
            액션 = re.sub(r'([가-힣]+)게로', r'\1게', original_액션)

            # ~~히로 → ~~히
            액션 = re.sub(r'([가-힣]+)히로', r'\1히', 액션)

            if 액션 != original_액션:
                fortune['액션'] = 액션
                fixed_count += 1

with open('today_unse/stories/13_병자.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\n{'='*60}")
print(f"✅ ~~게로 패턴 {fixed_count}개 수정 완료!")
print(f"{'='*60}")
