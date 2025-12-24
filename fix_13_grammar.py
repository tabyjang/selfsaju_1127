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
        if '본문' in fortune:
            original = fortune['본문']
            본문 = original

            # 1. 동사+을(를) 패턴 수정
            본문 = re.sub(r'원칙을 지키며을\(를\)', '원칙을', 본문)
            본문 = re.sub(r'이상을 품고을\(를\)', '이상을', 본문)
            본문 = re.sub(r'신념을 지키며을\(를\)', '신념을', 본문)
            본문 = re.sub(r'품격을 지키며을\(를\)', '품격을', 본문)
            본문 = re.sub(r'정직하게 임하며을\(를\)', '정직하게 임하는 태도를', 본문)
            본문 = re.sub(r'고결하게 행동하며을\(를\)', '고결하게 행동하는 모습을', 본문)
            본문 = re.sub(r'격을 높이며을\(를\)', '격을', 본문)
            본문 = re.sub(r'예를 지키며을\(를\)', '예를', 본문)

            # 2. 동사+이(가) 패턴 수정
            본문 = re.sub(r'원칙을 지키며이\(가\)', '원칙을 지키는 모습이', 본문)
            본문 = re.sub(r'이상을 품고이\(가\)', '이상을 품은 모습이', 본문)
            본문 = re.sub(r'신념을 지키며이\(가\)', '신념을 지키는 모습이', 본문)
            본문 = re.sub(r'고결하게이\(가\)', '고결한 모습이', 본문)

            # 3. 부사+을(를) 패턴 수정
            본문 = re.sub(r'정중하게을\(를\)', '정중함을', 본문)
            본문 = re.sub(r'예의 바르게을\(를\)', '예의 바름을', 본문)
            본문 = re.sub(r'반듯하게을\(를\)', '반듯함을', 본문)
            본문 = re.sub(r'품위 있게을\(를\)', '품위를', 본문)
            본문 = re.sub(r'단정하게을\(를\)', '단정함을', 본문)
            본문 = re.sub(r'정직하게을\(를\)', '정직함을', 본문)
            본문 = re.sub(r'진중하게을\(를\)', '진중함을', 본문)
            본문 = re.sub(r'격식을 갖추어을\(를\)', '격식을', 본문)
            본문 = re.sub(r'공손하게을\(를\)', '공손함을', 본문)
            본문 = re.sub(r'차분하게을\(를\)', '차분함을', 본문)
            본문 = re.sub(r'정갈하게을\(를\)', '정갈함을', 본문)
            본문 = re.sub(r'엄정하게을\(를\)', '엄정함을', 본문)
            본문 = re.sub(r'근엄하게을\(를\)', '근엄함을', 본문)
            본문 = re.sub(r'단아하게을\(를\)', '단아함을', 본문)

            # 4. 부사+이(가) 패턴 수정
            본문 = re.sub(r'정중하게이\(가\)', '정중한 모습이', 본문)
            본문 = re.sub(r'예의 바르게이\(가\)', '예의 바른 모습이', 본문)
            본문 = re.sub(r'반듯하게이\(가\)', '반듯한 모습이', 본문)
            본문 = re.sub(r'품위 있게이\(가\)', '품위 있는 모습이', 본문)
            본문 = re.sub(r'단정하게이\(가\)', '단정한 모습이', 본문)
            본문 = re.sub(r'정직하게이\(가\)', '정직한 모습이', 본문)

            # 5. 일반 패턴 (catch-all)
            본문 = re.sub(r'([가-힣]+하며)을\(를\)', r'\1', 본문)
            본문 = re.sub(r'([가-힣]+하게)을\(를\)', r'\1', 본문)

            if 본문 != original:
                fortune['본문'] = 본문
                fixed_count += 1
                print(f"[{unsung_name}-{fortune['v']}] {fortune['제목']} - 수정 완료")

with open('today_unse/stories/13_병자.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\n{'='*60}")
print(f"✅ 총 {fixed_count}개 항목 문법 수정 완료!")
print(f"{'='*60}")
