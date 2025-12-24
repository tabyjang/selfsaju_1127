import json
import sys
import io

# UTF-8 인코딩 강제 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('today_unse/stories/12_을해.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("="*60)
print("12_을해.json 문법 체크 결과")
print("="*60)

# 문법 오류 패턴 체크
total_issues = 0

for unsung_name, fortunes in data['운세'].items():
    for fortune in fortunes:
        if '본문' in fortune:
            text = fortune['본문']
            issues = []

            # 의심스러운 패턴들 체크
            # 1. "XX한로" 패턴 (형용사+로)
            if '한로' in text or '은로' in text or '적인로' in text:
                issues.append("형용사+로 패턴 발견")

            # 2. "XX한하며" 패턴
            if '한하며' in text or '은하며' in text:
                issues.append("형용사+하며 패턴 발견")

            # 3. 이중 조사
            if '면서도도' in text or '이이' in text or '가가' in text:
                issues.append("이중 조사 발견")

            if issues:
                total_issues += len(issues)
                print(f"\n[{unsung_name}-{fortune['v']}] {fortune['제목']}")
                for issue in issues:
                    print(f"  ⚠️ {issue}")
                print(f"본문: {text[:100]}...")

if total_issues == 0:
    print("\n✅ 문법 오류 없음! 완벽합니다.")
else:
    print(f"\n⚠️ 총 {total_issues}개 문법 문제 발견")

print("="*60)
