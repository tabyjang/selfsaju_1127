import json
import random

# 갑자 일주 특성에 맞는 대체 문구들
replacements = {
    "{핵심특성}": [
        "활동적이고 적극적인",
        "리더십 있는",
        "개척자 기질의",
        "추진력 강한",
        "앞장서는",
        "당당한",
        "선봉에 서는"
    ],
    "{소통스타일}": [
        "직접적이고 솔직하게",
        "앞장서서",
        "당당하게",
        "명확하게",
        "거침없이",
        "적극적으로",
        "주도적으로"
    ],
    "{업무스타일}": [
        "선봉에 서서",
        "주도적으로",
        "적극적으로",
        "과감하게",
        "앞장서서",
        "리더십을 발휘하며",
        "추진력 있게"
    ],
    "{감정표현}": [
        "솔직하게",
        "거침없이",
        "당당하게",
        "진심으로",
        "직접적으로",
        "명확하게",
        "적극적으로"
    ]
}

# 파일 읽기
with open('today_unse/stories/01_갑자.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 각 플레이스홀더의 사용 횟수 추적 (다양성을 위해)
usage_count = {key: {val: 0 for val in values} for key, values in replacements.items()}

def get_replacement(placeholder):
    """플레이스홀더를 대체할 문구를 선택 (가장 적게 사용된 것 우선)"""
    if placeholder not in replacements:
        return placeholder

    # 사용 횟수가 가장 적은 것들 중에서 랜덤 선택
    candidates = replacements[placeholder]
    min_usage = min(usage_count[placeholder].values())
    least_used = [c for c in candidates if usage_count[placeholder][c] == min_usage]

    selected = random.choice(least_used)
    usage_count[placeholder][selected] += 1
    return selected

# 운세의 모든 메시지 처리
for unsung_name, fortunes in data['운세'].items():
    for fortune in fortunes:
        # 타입을 중립 → 심오로 변경
        if fortune.get('타입') == '중립':
            fortune['타입'] = '심오'

        # 본문에서 플레이스홀더 대체
        if '본문' in fortune:
            본문 = fortune['본문']
            for placeholder in replacements.keys():
                if placeholder in 본문:
                    replacement = get_replacement(placeholder)
                    본문 = 본문.replace(placeholder, replacement)
            fortune['본문'] = 본문

# 파일 저장
with open('today_unse/stories/01_갑자.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("[OK] 01_갑자.json 플레이스홀더 대체 및 타입 변경 완료")
print(f"중립 → 심오 변경됨")
print(f"플레이스홀더 대체 완료")
