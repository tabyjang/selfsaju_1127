import json
import sys
import io
import re

# UTF-8 인코딩 강제 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('today_unse/stories/12_을해.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

fixed_count = 0

for unsung_name, fortunes in data['운세'].items():
    for fortune in fortunes:
        if '본문' in fortune:
            original = fortune['본문']
            본문 = original

            # 1. "초연하게하는" → "초연하게 표현하는"
            본문 = re.sub(r'초연하게하는', '초연하게 표현하는', 본문)

            # 2. "담백히 하며" → "담백하게"
            본문 = re.sub(r'담백히 하며', '담백하게', 본문)

            # 3. "고요히 하며" → "고요하게"
            본문 = re.sub(r'고요히 하며', '고요하게', 본문)

            # 4. "사색하며을(를)" → "사색하는 마음을"
            본문 = re.sub(r'사색하며을\(를\)', '사색하는 마음을', 본문)

            # 5. "꼼꼼하게로" → "꼼꼼하게"
            본문 = re.sub(r'꼼꼼하게로', '꼼꼼하게', 본문)

            # 6. 일반적인 "~하게로" 패턴 수정
            본문 = re.sub(r'하게로', '하게', 본문)
            본문 = re.sub(r'히로', '하게', 본문)

            # 7. "~하게하는" 패턴 전체 수정
            본문 = re.sub(r'평온하게하는', '평온하게 표현하는', 본문)
            본문 = re.sub(r'깊이 있게하는', '깊이 있게 표현하는', 본문)
            본문 = re.sub(r'부드럽게하는', '부드럽게 표현하는', 본문)
            본문 = re.sub(r'맑게하는', '맑게 표현하는', 본문)

            if 본문 != original:
                fortune['본문'] = 본문
                fixed_count += 1
                print(f"[{unsung_name}-{fortune['v']}] 수정 완료")

with open('today_unse/stories/12_을해.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\n✅ 총 {fixed_count}개 항목 문법 수정 완료!")
