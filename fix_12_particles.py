import json
import sys
import io
import re

# UTF-8 인코딩 강제 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('today_unse/stories/12_을해.json', 'r', encoding='utf-8') as f:
    content = f.read()
    data = json.load(io.StringIO(content))

# 먼저 잘못된 패턴들을 찾아봅시다
print("="*60)
print("잘못된 조사 패턴 찾기")
print("="*60)

# 1. (을)를 패턴 찾기
wrong_patterns_1 = re.findall(r'\S+(을)\(를\)', content)
if wrong_patterns_1:
    print(f"\n❌ '(을)를' 패턴 발견: {len(wrong_patterns_1)}개")
    for p in set(wrong_patterns_1):
        print(f"  - {p}(를)")

# 2. (이)가 패턴 찾기
wrong_patterns_2 = re.findall(r'\S+(이)\(가\)', content)
if wrong_patterns_2:
    print(f"\n❌ '(이)가' 패턴 발견: {len(wrong_patterns_2)}개")
    for p in set(wrong_patterns_2):
        print(f"  - {p}(가)")

# 3. 동사/부사 + 이(가) 패턴
wrong_patterns_3 = re.findall(r'[가-힣]+(하여|하며|하게|듯|히|로|게)이\(가\)', content)
if wrong_patterns_3:
    print(f"\n❌ '동사/부사+이(가)' 패턴 발견: {len(wrong_patterns_3)}개")
    for p in set(wrong_patterns_3):
        print(f"  - {p}")

# 4. 동사/부사 + 을(를) 패턴
wrong_patterns_4 = re.findall(r'[가-힣]+(하여|하며|하게|듯|히|로|게)을\(를\)', content)
if wrong_patterns_4:
    print(f"\n❌ '동사/부사+을(를)' 패턴 발견: {len(wrong_patterns_4)}개")
    for p in set(wrong_patterns_4):
        print(f"  - {p}")

print(f"\n{'='*60}")
print("수정 시작...")
print(f"{'='*60}\n")

fixed_count = 0

for unsung_name, fortunes in data['운세'].items():
    for fortune in fortunes:
        if '본문' in fortune:
            original = fortune['본문']
            본문 = original

            # === 수정 패턴 ===

            # 1. "집중하여을(를)" 같은 동사+조사 패턴
            본문 = re.sub(r'집중하여을\(를\)', '집중력을', 본문)
            본문 = re.sub(r'몰입하여을\(를\)', '몰입력을', 본문)
            본문 = re.sub(r'사색하며을\(를\)', '사색하는 마음을', 본문)
            본문 = re.sub(r'절제하며을\(를\)', '절제하는 모습을', 본문)

            # 2. "집중하여이(가)" 패턴
            본문 = re.sub(r'집중하여이\(가\)', '집중력이', 본문)
            본문 = re.sub(r'몰입하여이\(가\)', '몰입력이', 본문)
            본문 = re.sub(r'사색하며이\(가\)', '사색하는 모습이', 본문)

            # 3. 부사 + 조사 패턴
            # "차분하게을(를)" 같은 패턴
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
            본문 = re.sub(r'꾸준히을\(를\)', '꾸준함을', 본문)
            본문 = re.sub(r'신중하게을\(를\)', '신중함을', 본문)
            본문 = re.sub(r'철저히을\(를\)', '철저함을', 본문)
            본문 = re.sub(r'성실하게을\(를\)', '성실함을', 본문)
            본문 = re.sub(r'묵묵히을\(를\)', '묵묵함을', 본문)
            본문 = re.sub(r'꼼꼼하게을\(를\)', '꼼꼼함을', 본문)

            # "차분하게이(가)" 패턴
            본문 = re.sub(r'차분하게이\(가\)', '차분한 모습이', 본문)
            본문 = re.sub(r'사려깊게이\(가\)', '사려깊은 모습이', 본문)
            본문 = re.sub(r'철학적으로이\(가\)', '철학적인 사고가', 본문)
            본문 = re.sub(r'직관적으로이\(가\)', '직관이', 본문)
            본문 = re.sub(r'담백하게이\(가\)', '담백한 태도가', 본문)
            본문 = re.sub(r'진솔하게이\(가\)', '진솔한 모습이', 본문)

            # 4. "평정심 있게 하며" 패턴 수정
            본문 = re.sub(r'평정심 있게 하며', '평정심 있게', 본문)
            본문 = re.sub(r'평정심 있게하며', '평정심 있게', 본문)

            # 5. 일반 동사형 + 조사 패턴
            본문 = re.sub(r'([가-힣]+하여)을\(를\)', r'\1', 본문)
            본문 = re.sub(r'([가-힣]+하며)을\(를\)', r'\1', 본문)
            본문 = re.sub(r'([가-힣]+하게)을\(를\)', r'\1', 본문)

            if 본문 != original:
                fortune['본문'] = 본문
                fixed_count += 1
                print(f"[{unsung_name}-{fortune['v']}] {fortune['제목']} - 수정")

with open('today_unse/stories/12_을해.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\n{'='*60}")
print(f"✅ 총 {fixed_count}개 항목 조사 오류 수정 완료!")
print(f"{'='*60}")
