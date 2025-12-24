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

            # 1. 시간 표현 제거
            # "저녁쯤 누워서" → "누워서"
            본문 = re.sub(r'저녁쯤\s+누워서 생각할 거예요,', '누워서 생각할 거예요,', 본문)

            # "저녁쯤 뭔가" → "문득 뭔가" 또는 "곧 뭔가"
            본문 = re.sub(r'저녁쯤\s+뭔가 깨달을 거예요', '문득 뭔가 깨달을 거예요', 본문)

            # "저녁쯤 느껴질" → "곧 느껴질"
            본문 = re.sub(r'저녁쯤\s+느껴질 거예요', '곧 느껴질 거예요', 본문)

            fortune['본문'] = 본문

        # 2. 액션 수정
        if '액션' in fortune:
            액션 = fortune['액션']

            # Line 846의 오류 수정: "을 느끼세요" → "새벽의 기운을 느끼세요"
            if 액션 == "을 느끼세요. 오늘은 밤의 끝이에요. 곧 해가 떠요. 준비하세요. 빛이 옵니다.":
                액션 = "새벽의 기운을 느끼세요. 오늘은 밤의 끝이에요. 곧 해가 떠요. 준비하세요. 빛이 옵니다."

            fortune['액션'] = 액션

# 파일 저장
with open('today_unse/stories/01_갑자.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("[OK] 01_갑자.json 문법 오류 수정 완료")
print("- 시간 표현 제거 (4곳)")
print("- 문장 오류 수정 (1곳)")
