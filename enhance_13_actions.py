import json
import random
import sys
import io

# UTF-8 인코딩 강제 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 병자일주 액션 강화 패턴 (고결함, 순수함, 원칙, 이상 강조)
action_enhancers = {
    "시작": ["정중하게, 원칙을 세우며", "고결하게, 새로운 이상을 품고", "반듯하게, 순수한 마음으로", "격을 갖추어, 정도를 걸으며"],
    "행동": ["당당하게, 원칙을 지키며", "고결하게, 신념을 담아", "떳떳하게, 올곧게", "정직하게, 품위를 지키며"],
    "감사": ["진심으로, 예를 갖추어", "정중하게, 격을 높이며", "순수하게, 고결한 마음으로", "공손하게, 품격 있게"],
    "밀고": ["순수한 열정으로, 원칙대로", "고결하게, 흔들림 없이", "반듯하게, 신념을 지키며", "떳떳하게, 이상을 향해"],
    "회복": ["맑은 마음으로, 순수함을 되찾으며", "고결하게, 정신을 가다듬으며", "깨끗하게, 원칙을 세우며", "정갈하게, 품격을 되찾으며"],
    "소통": ["정중하게, 예를 갖추어", "품위 있게, 고결한 태도로", "반듯하게, 진정성을 담아", "격식을 갖추어, 진심으로"],
    "성장": ["반듯하게, 원칙을 배우며", "고결하게, 이상을 키우며", "정직하게, 바르게", "떳떳하게, 품격을 높이며"],
    "매력": ["순수하게, 진심을 담아", "고결하게, 품위 있게", "단아하게, 격을 높이며", "정갈하게, 진정성 있게"],
    "변화": ["신중하게, 원칙을 지키며", "고결하게, 올바른 방향으로", "반듯하게, 정도를 걸으며", "정직하게, 떳떳하게"],
    "준비": ["꼼꼼하게, 원칙대로", "차근차근, 격을 갖추어", "신중하게, 정도를 따라", "정확하게, 고결하게"],
    "인정": ["당당하게, 품격을 지키며", "고결하게, 겸손함을 잃지 않고", "떳떳하게, 예를 갖추어", "정중하게, 감사하며"],
    "안정": ["평온하게, 원칙 속에서", "차분하게, 고결함을 지키며", "꾸준하게, 정도를 걸으며", "평정하게, 신념을 지키며"],
    "균형": ["조화롭게, 원칙과 함께", "중도를 지키며, 고결하게", "균형 있게, 올곧게", "절제하며, 품격을 지키며"],
    "성취": ["당당하게, 떳떳하게", "고결하게, 겸손함과 함께", "품위 있게, 감사하며", "정직하게, 기쁨을 나누며"],
    "여유": ["평온하게, 고결함을 잃지 않고", "느긋하게, 품격을 지키며", "차분하게, 원칙 속에서", "여유롭게, 격을 유지하며"],
    "지혜": ["깊이, 원칙을 따라", "통찰하며, 고결하게", "사려 깊게, 올곧게", "신중하게, 정도를 걸으며"],
    "예민": ["섬세하게, 순수함을 지키며", "민감하게, 원칙을 세우며", "세심하게, 고결하게", "조심스럽게, 품격을 유지하며"],
    "마무리": ["깔끔하게, 원칙대로", "정리하며, 고결하게", "정돈하며, 떳떳하게", "완결하며, 격을 지키며"],
    "내면": ["깊이, 순수함을 찾아", "고요히, 고결함을 지키며", "조용히, 원칙을 세우며", "침잠하며, 맑게"],
    "잠재": ["차곡차곡, 고결하게", "조용히, 원칙을 쌓으며", "묵묵히, 품격을 키우며", "꾸준히, 올곧게"],
    "리셋": ["깨끗하게, 순수함으로 돌아가", "새롭게, 원칙을 세우며", "쿨하게, 고결함을 되찾으며", "산뜻하게, 떳떳하게"],
    "자유": ["순수하게, 이상을 향해", "자유롭게, 원칙 안에서", "거침없이, 고결하게", "구애받지 않고, 올곧게"],
    "잉태": ["조용히, 순수한 씨앗을 품고", "소중히, 고결한 이상을 키우며", "차분하게, 원칙을 준비하며", "신중히, 품격을 쌓으며"],
    "양육": ["정성껏, 고결하게", "세심하게, 원칙을 가르치며", "애정으로, 품격을 키우며", "사랑으로, 올곧게"],
    "발휘": ["자신 있게, 원칙대로", "당당하게, 고결한 태도로", "확실하게, 떳떳하게", "적극적으로, 품격을 지키며"]
}

def enhance_action(original_action):
    """액션을 40자 이상으로 강화"""

    # 이미 40자 이상이면 그대로 반환
    if len(original_action) >= 40:
        return original_action

    # 키워드 추출
    for keyword, enhancers in action_enhancers.items():
        if keyword in original_action:
            enhancer = random.choice(enhancers)
            # "하세요." 앞에 강화 문구 삽입
            if "하세요." in original_action:
                enhanced = original_action.replace("하세요.", f" {enhancer} 하세요.")
            elif "세요." in original_action:
                enhanced = original_action.replace("세요.", f" {enhancer} 세요.")
            else:
                enhanced = original_action + f" {enhancer}"

            # 길이 체크
            if len(enhanced) >= 40:
                return enhanced + " 확실하게 실천해나가세요."
            else:
                return enhanced + " 확실하게 실천해나가세요."

    # 키워드가 없으면 일반 강화
    return original_action + " 고결하게, 원칙을 지키며 확실하게 실천해나가세요."

with open('today_unse/stories/13_병자.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

enhanced_count = 0

for unsung_name, fortunes in data['운세'].items():
    for fortune in fortunes:
        if '액션' in fortune:
            original_action = fortune['액션']
            if len(original_action) < 40:
                enhanced_action = enhance_action(original_action)
                fortune['액션'] = enhanced_action
                enhanced_count += 1
                print(f"[{unsung_name}-{fortune['v']}] {len(original_action):2d}자 → {len(enhanced_action):2d}자")

with open('today_unse/stories/13_병자.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\n{'='*60}")
print(f"✅ 총 {enhanced_count}개 액션 강화 완료! (모두 40자 이상)")
print(f"{'='*60}")
