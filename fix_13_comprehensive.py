import json
import random
import sys
import io
import re

# UTF-8 인코딩 강제 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('today_unse/stories/13_병자.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 통계
replaced_ilju = 0
replaced_particles = 0
replaced_formal = 0

# 전문용어 -> 일상용어 매핑
formal_to_casual = {
    # 고결 관련 (85회 - 가장 많음!)
    "고결하게": ["바르게", "정직하게", "올바르게", "똑바로", "진심으로", "솔직하게"],
    "고결한": ["바른", "올바른", "좋은", "착한", "진실한"],
    "고결함": ["바름", "올바름", "진실함"],

    # 격/품격 관련 (69회)
    "격을 갖추어": ["예의 바르게", "정중하게"],
    "격을 높이며": ["수준을 높이며", "더 나아지며"],
    "격을 지키며": ["모습을 지키며", "태도를 지키며"],
    "격식을 갖추어": ["예의 바르게", "정중하게"],
    "품격을 지키며": ["좋은 모습을 지키며", "바른 태도를 지키며"],
    "품격을 키우며": ["좋은 모습을 키우며", "나은 태도를 키우며"],
    "품격을 되찾으며": ["좋은 모습을 되찾으며"],
    "품격 있게": ["좋은 모습으로", "바른 태도로"],
    "품격": ["모습", "태도"],
    "격": ["수준", "모습"],

    # 올곧 관련 (17회)
    "올곧게": ["똑바로", "바르게", "정직하게"],
    "올곧은": ["바른", "똑바른", "정직한"],

    # 고귀 관련 (17회)
    "고귀한": ["좋은", "훌륭한", "멋진"],
    "고귀하게": ["좋게", "훌륭하게"],

    # 떳떳 관련 (10회)
    "떳떳하게": ["당당하게", "자신 있게"],
    "떳떳한": ["당당한", "자신 있는"],

    # 기타 전문용어
    "근엄하게": ["진지하게", "차분하게"],
    "엄정하게": ["정확하게", "확실하게"],
    "단아하게": ["단정하게", "깔끔하게"],
    "정갈하게": ["깔끔하게", "단정하게"],
    "진중하게": ["신중하게", "차분하게"],
    "공손하게": ["예의 바르게", "정중하게"],
    "정도를 걷다": ["바르게 하다", "올바르게 하다"],
    "정도를": ["바른 길을", "올바른 길을"],
    "신조": ["신념", "생각"],
    "예를 갖추어": ["예의 바르게", "정중하게"],
    "예를 지키며": ["예의를 지키며", "예의 바르게"],
    "신념을 지키며": ["생각을 지키며", "마음을 지키며"],
}

for unsung_name, fortunes in data['운세'].items():
    for fortune in fortunes:
        # 본문 수정
        if '본문' in fortune:
            original_본문 = fortune['본문']
            본문 = original_본문

            # 1. "병자일주의" -> "당신의"
            if "병자일주의" in 본문:
                본문 = 본문.replace("병자일주의", "당신의")
                replaced_ilju += 1

            # 2. "을(를)" 제거 - 을 또는 를 중 하나로 선택
            # 받침 있으면 "을", 없으면 "를"
            def replace_particle(match):
                word = match.group(1)
                # 마지막 글자의 받침 확인
                last_char = word[-1]
                has_jongseong = (ord(last_char) - 0xAC00) % 28 != 0
                return word + ("을" if has_jongseong else "를")

            # "XXX을(를)" 패턴 찾아서 적절한 조사로 교체
            count_before = 본문.count("을(를)")
            본문 = re.sub(r'([가-힣]+)을\(를\)', replace_particle, 본문)
            if count_before > 본문.count("을(를)"):
                replaced_particles += count_before - 본문.count("을(를)")

            # 3. 전문용어를 일상용어로 교체 (무작위로 다양하게)
            for formal, casual_options in formal_to_casual.items():
                if formal in 본문:
                    # 여러 옵션 중 랜덤하게 선택하되, 문맥에 따라
                    if isinstance(casual_options, list):
                        casual = random.choice(casual_options)
                    else:
                        casual = casual_options

                    # 교체 (모든 인스턴스를 같은 것으로 교체하지 않고 순차적으로)
                    while formal in 본문:
                        casual = random.choice(casual_options) if isinstance(casual_options, list) else casual_options
                        본문 = 본문.replace(formal, casual, 1)
                        replaced_formal += 1

            if 본문 != original_본문:
                fortune['본문'] = 본문

        # 액션 수정
        if '액션' in fortune:
            original_액션 = fortune['액션']
            액션 = original_액션

            # 1. "을(를)" 제거
            count_before = 액션.count("을(를)")
            액션 = re.sub(r'([가-힣]+)을\(를\)', replace_particle, 액션)
            if count_before > 액션.count("을(를)"):
                replaced_particles += count_before - 액션.count("을(를)")

            # 2. 전문용어를 일상용어로 교체
            for formal, casual_options in formal_to_casual.items():
                if formal in 액션:
                    casual = random.choice(casual_options) if isinstance(casual_options, list) else casual_options
                    액션 = 액션.replace(formal, casual)
                    replaced_formal += 1

            if 액션 != original_액션:
                fortune['액션'] = 액션

with open('today_unse/stories/13_병자.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"{'='*60}")
print(f"✅ 13_병자.json 종합 수정 완료!")
print(f"{'='*60}")
print(f"  1. '병자일주의' → '당신의': {replaced_ilju}회")
print(f"  2. '을(를)' 제거: {replaced_particles}회")
print(f"  3. 전문용어 → 일상용어: {replaced_formal}회")
print(f"{'='*60}")
