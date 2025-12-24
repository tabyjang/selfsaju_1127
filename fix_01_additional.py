import json
import re

# 파일 읽기
with open('today_unse/stories/01_갑자.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 모든 운세 메시지 처리
for unsung_name, fortunes in data['운세'].items():
    for fortune in fortunes:
        if '본문' in fortune:
            본문 = fortune['본문']

            # "저녁쯤 힌트가" → "문득 힌트가" 또는 "곧 힌트가"
            본문 = re.sub(r'저녁쯤\s+힌트가', '문득 힌트가', 본문)

            fortune['본문'] = 본문

# 파일 저장
with open('today_unse/stories/01_갑자.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("[OK] 01_갑자.json 추가 수정 완료")
print("- 시간 표현 제거 (1곳 추가)")
