import json
import sys
import io
import re

# UTF-8 인코딩 강제 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('today_unse/stories/13_병자.json', 'r', encoding='utf-8') as f:
    content = f.read()
    data = json.load(io.StringIO(content))

# 전문용어 리스트
formal_terms = {
    "고결한": 0, "고결하게": 0, "고결함": 0,
    "고귀한": 0, "고귀하게": 0, "고귀함": 0,
    "품격": 0, "격을": 0, "격이": 0,
    "올곧게": 0, "올곧은": 0, "올곧게": 0,
    "떳떳하게": 0, "떳떳한": 0, "떳떳함": 0,
    "근엄하게": 0, "근엄한": 0,
    "엄정하게": 0, "엄정한": 0,
    "단아하게": 0, "단아한": 0, "단아함": 0,
    "정갈하게": 0, "정갈한": 0, "정갈함": 0,
    "격식을 갖추어": 0, "격식": 0,
    "진중하게": 0, "진중한": 0,
    "정도를": 0, "정도로": 0,
    "공손하게": 0, "공손한": 0,
    "예를 갖추어": 0, "예를 지키며": 0,
    "신조": 0, "신념을 지키며": 0,
    "정중하게": 0,  # 이건 괜찮을 수도
    "예의 바르게": 0,  # 이것도 일상어
}

# 전체 단어 수
total_words = len(content.replace('\n', ' ').replace(',', ' ').split())

# 전문용어 카운트
for term in formal_terms.keys():
    count = content.count(term)
    formal_terms[term] = count

# 결과 출력
print("="*60)
print("13_병자.json 전문용어 사용 현황")
print("="*60)

formal_count = 0
for term, count in sorted(formal_terms.items(), key=lambda x: x[1], reverse=True):
    if count > 0:
        print(f"  {term}: {count}회")
        formal_count += count

print(f"\n전체 단어 수 (근사치): {total_words}")
print(f"전문용어 사용 횟수: {formal_count}")
print(f"전문용어 비율: {formal_count/total_words*100:.1f}%")

if formal_count/total_words > 0.15:
    print(f"\n⚠️ 전문용어 비율이 15%를 초과합니다!")
    print(f"   목표: 15% 이하")
    print(f"   현재: {formal_count/total_words*100:.1f}%")
    print(f"   약 {int((formal_count/total_words - 0.15) * total_words)}개의 전문용어를 일상어로 교체 필요")
else:
    print(f"\n✅ 전문용어 비율이 적절합니다 ({formal_count/total_words*100:.1f}%)")

print("="*60)
