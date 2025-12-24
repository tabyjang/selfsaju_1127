import json
import sys
import io
import re

# UTF-8 인코딩 강제 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('today_unse/stories/12_을해.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

fixed_count = 0
issues_found = []

for unsung_name, fortunes in data['운세'].items():
    for fortune in fortunes:
        if '본문' in fortune:
            original = fortune['본문']
            본문 = original

            # 1. "동사+이(가)" 패턴 - 동사 뒤에 조사가 잘못 붙은 경우
            # 예: "몰입하여이(가)" → "몰입력이"
            본문 = re.sub(r'몰입하여이\(가\)', '몰입력이', 본문)
            본문 = re.sub(r'깊이 파고들어이\(가\)', '깊이 파고드는 모습이', 본문)
            본문 = re.sub(r'연구하듯이\(가\)', '연구하는 모습이', 본문)
            본문 = re.sub(r'사색하며이\(가\)', '사색하는 모습이', 본문)
            본문 = re.sub(r'집중하여이\(가\)', '집중력이', 본문)

            # 2. "동사+을(를)" 패턴
            본문 = re.sub(r'몰입하여을\(를\)', '몰입력을', 본문)
            본문 = re.sub(r'깊이 파고들어을\(를\)', '깊이 파고드는 태도를', 본문)
            본문 = re.sub(r'연구하듯을\(를\)', '연구하는 태도를', 본문)
            본문 = re.sub(r'사색하며을\(를\)', '사색하는 마음을', 본문)
            본문 = re.sub(r'집중하여을\(를\)', '집중력을', 본문)
            본문 = re.sub(r'꾸준히을\(를\)', '꾸준함을', 본문)

            # 3. "부사+이(가)" 패턴
            본문 = re.sub(r'차분하게이\(가\)', '차분한 모습이', 본문)
            본문 = re.sub(r'사려깊게이\(가\)', '사려깊은 모습이', 본문)
            본문 = re.sub(r'철학적으로이\(가\)', '철학적인 사고가', 본문)
            본문 = re.sub(r'직관적으로이\(가\)', '직관적인 판단이', 본문)
            본문 = re.sub(r'담백하게이\(가\)', '담백한 태도가', 본문)
            본문 = re.sub(r'진솔하게이\(가\)', '진솔한 모습이', 본문)
            본문 = re.sub(r'조용히이\(가\)', '조용한 모습이', 본문)
            본문 = re.sub(r'깊이 있게이\(가\)', '깊이 있는 모습이', 본문)
            본문 = re.sub(r'평온하게이\(가\)', '평온한 모습이', 본문)
            본문 = re.sub(r'초연하게이\(가\)', '초연한 모습이', 본문)
            본문 = re.sub(r'맑게이\(가\)', '맑은 모습이', 본문)
            본문 = re.sub(r'부드럽게이\(가\)', '부드러운 모습이', 본문)

            # 4. "부사+을(를)" 패턴
            본문 = re.sub(r'차분하게을\(를\)', '차분함을', 본문)
            본문 = re.sub(r'사려깊게을\(를\)', '사려깊음을', 본문)
            본문 = re.sub(r'철학적으로을\(를\)', '철학적 사고를', 본문)
            본문 = re.sub(r'직관적으로을\(를\)', '직관을', 본문)
            본문 = re.sub(r'담백하게을\(를\)', '담백함을', 본문)
            본문 = re.sub(r'진솔하게을\(를\)', '진솔함을', 본문)
            본문 = re.sub(r'조용히을\(를\)', '조용함을', 본문)
            본문 = re.sub(r'깊이 있게을\(를\)', '깊이를', 본문)
            본문 = re.sub(r'평온하게을\(를\)', '평온함을', 본문)
            본문 = re.sub(r'초연하게을\(를\)', '초연함을', 본문)
            본문 = re.sub(r'맑게을\(를\)', '맑음을', 본문)
            본문 = re.sub(r'부드럽게을\(를\)', '부드러움을', 본문)

            if 본문 != original:
                fortune['본문'] = 본문
                fixed_count += 1
                issues_found.append(f"[{unsung_name}-{fortune['v']}] {fortune['제목']}")
                print(f"[{unsung_name}-{fortune['v']}] {fortune['제목']} - 수정 완료")

with open('today_unse/stories/12_을해.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\n{'='*60}")
print(f"✅ 총 {fixed_count}개 항목 문법 수정 완료!")
print(f"{'='*60}")
