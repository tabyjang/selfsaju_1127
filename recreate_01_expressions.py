import json
import re

# 갑자 이미지(차가운 겨울바다 위의 거목)에서 영감받은 완전히 새로운 창작 표현들
creative_expressions = [
    "거목처럼 굳건한",
    "바다처럼 넓은",
    "겨울처럼 차분한",
    "파도처럼 힘찬",
    "뿌리처럼 깊은",
    "가지처럼 뻗어나가는",
    "바람을 이기는",
    "서리를 견디는",
    "물결을 가르는",
    "하늘을 향한",
    "대지에 선",
    "씨앗을 품은",
    "결을 가진",
    "흔들림 없는",
    "물속 깊은",
    "단단한 중심의",
    "먼 곳을 보는",
    "고요히 서 있는",
    "천천히 자라는",
    "멀리 뻗는"
]

# 파일 읽기
with open('today_unse/stories/01_갑자.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 사용 횟수 추적
usage_count = {expr: 0 for expr in creative_expressions}

def get_creative_expression():
    """가장 적게 사용된 표현 선택"""
    min_usage = min(usage_count.values())
    candidates = [expr for expr, count in usage_count.items() if count == min_usage]

    import random
    selected = random.choice(candidates)
    usage_count[selected] += 1
    return selected

# 기존 특성 표현들을 제거할 패턴
old_patterns = [
    "활동적이고 적극적인",
    "리더십 있는",
    "개척자 기질의",
    "추진력 강한",
    "앞장서는",
    "당당한",
    "선봉에 서는",
    "개척정신 있는",
    "선도력 있는",
    "결단력 있는"
]

# 시간 표현 제거 패턴
time_patterns = [
    r'저녁쯤\s*',
    r'저녁에\s*',
    r'오후쯤\s*',
    r'오후에\s*',
    r'새벽\s*',
    r'아침에\s*',
    r'밤에\s*',
    r'저녁엔\s*'
]

# 운세의 모든 메시지 처리
for unsung_name, fortunes in data['운세'].items():
    for fortune in fortunes:
        if '본문' in fortune:
            본문 = fortune['본문']

            # 기존 특성 표현을 새로운 창작 표현으로 대체
            for old_expr in old_patterns:
                if old_expr in 본문:
                    new_expr = get_creative_expression()
                    본문 = 본문.replace(old_expr, new_expr)

            fortune['본문'] = 본문

        if '액션' in fortune:
            액션 = fortune['액션']

            # 시간 표현 제거
            for time_pattern in time_patterns:
                액션 = re.sub(time_pattern, '', 액션)

            # 연속 공백 정리
            액션 = re.sub(r'\s+', ' ', 액션).strip()

            # 문장 시작 공백 정리
            액션 = re.sub(r'\.\s+([가-힣])', r'. \1', 액션)

            fortune['액션'] = 액션

# 파일 저장
with open('today_unse/stories/01_갑자.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("[OK] 01_갑자.json 표현 재창작 및 시간 표현 제거 완료")
print(f"기존 특성 표현 → 창작 표현으로 대체")
print(f"시간 표현 모두 제거")
