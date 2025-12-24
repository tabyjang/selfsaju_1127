import json
import sys
import io
import re

# UTF-8 인코딩 강제 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('today_unse/stories/13_병자.json', 'r', encoding='utf-8') as f:
    content = f.read()
    data = json.load(io.StringIO(content))

print("="*60)
print("13_병자.json 문법 오류 체크")
print("="*60)

total_issues = 0

# 1. 동사+을(를) 패턴
pattern1 = re.findall(r'[가-힣]+(하여|하며|하게)을\(를\)', content)
if pattern1:
    print(f"\n❌ 동사+을(를) 패턴: {len(pattern1)}개")
    for p in set(pattern1):
        print(f"  - {p}을(를)")
    total_issues += len(pattern1)

# 2. 동사+이(가) 패턴
pattern2 = re.findall(r'[가-힣]+(하여|하며|하게)이\(가\)', content)
if pattern2:
    print(f"\n❌ 동사+이(가) 패턴: {len(pattern2)}개")
    for p in set(pattern2):
        print(f"  - {p}이(가)")
    total_issues += len(pattern2)

# 3. 부사+을(를) 패턴
pattern3 = re.findall(r'[가-힣]+(게|히|로)을\(를\)', content)
if pattern3:
    print(f"\n❌ 부사+을(를) 패턴: {len(pattern3)}개")
    for p in set(pattern3):
        print(f"  - {p}을(를)")
    total_issues += len(pattern3)

# 4. 부사+이(가) 패턴
pattern4 = re.findall(r'[가-힣]+(게|히|로)이\(가\)', content)
if pattern4:
    print(f"\n❌ 부사+이(가) 패턴: {len(pattern4)}개")
    for p in set(pattern4):
        print(f"  - {p}이(가)")
    total_issues += len(pattern4)

# 5. 형용사+로 패턴
pattern5 = re.findall(r'[가-힣]+(한|은|적인)로\s', content)
if pattern5:
    print(f"\n❌ 형용사+로 패턴: {len(pattern5)}개")
    for p in set(pattern5):
        print(f"  - {p}로")
    total_issues += len(pattern5)

# 6. ~하게하는 패턴
pattern6 = re.findall(r'[가-힣]+하게하는', content)
if pattern6:
    print(f"\n❌ ~하게하는 패턴: {len(pattern6)}개")
    for p in set(pattern6):
        print(f"  - {p}")
    total_issues += len(pattern6)

# 7. ~히 하며 패턴
pattern7 = re.findall(r'[가-힣]+히 하며', content)
if pattern7:
    print(f"\n❌ ~히 하며 패턴: {len(pattern7)}개")
    for p in set(pattern7):
        print(f"  - {p}")
    total_issues += len(pattern7)

if total_issues == 0:
    print("\n✅ 문법 오류 없음!")
else:
    print(f"\n⚠️ 총 {total_issues}개 문법 오류 발견")

print("="*60)
