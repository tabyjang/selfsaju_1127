import json
import random
import sys
import io

# UTF-8 인코딩 강제 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 병자일주 플레이스홀더 정의
# 한겨울 호수 위의 태양, 고귀한 등불, 순수한 이상주의, 고결한 원칙, 군자의 품격

placeholders = {
    "{핵심특성}": [
        "고결한 이상", "순수한 원칙", "밝은 비전", "고귀한 마음",
        "반듯한 신념", "깨끗한 양심", "맑은 정신", "올곧은 신조",
        "순수한 열정", "고귀한 품격", "정직한 마음", "바른 신념",
        "맑은 이상", "깨끗한 원칙", "고결한 정신", "순수한 의지"
    ],
    "{소통스타일}": [
        "정중하게", "예의 바르게", "반듯하게", "고결하게",
        "품위 있게", "단정하게", "정직하게", "진중하게",
        "격식을 갖추어", "예를 갖추어", "공손하게", "차분하게",
        "정갈하게", "엄정하게", "근엄하게", "단아하게"
    ],
    "{업무스타일}": [
        "원칙을 지키며", "이상을 품고", "반듯하게", "고결하게 행동하며",
        "바르게", "정도를 걸으며", "올곧게", "정직하게 임하며",
        "신념을 지키며", "원칙대로", "깨끗하게", "떳떳하게",
        "고귀하게", "품격을 지키며", "격을 높이며", "예를 지키며"
    ],
    "{감정표현}": [
        "순수하게", "진심을 담아", "고결하게", "정직하게",
        "진정성 있게", "순수한 마음으로", "올곧게", "맑게",
        "깨끗하게", "순수한 감정으로", "진심 어린 태도로", "정갈하게",
        "순수함을 담아", "진솔하게", "고귀하게", "반듯하게"
    ]
}

with open('today_unse/stories/13_병자.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

replaced_count = 0
used_combinations = set()

for unsung_name, fortunes in data['운세'].items():
    for fortune in fortunes:
        if '본문' in fortune:
            본문 = fortune['본문']
            original = 본문

            # 각 플레이스홀더를 치환
            for placeholder, options in placeholders.items():
                while placeholder in 본문:
                    replacement = random.choice(options)
                    본문 = 본문.replace(placeholder, replacement, 1)
                    replaced_count += 1

            fortune['본문'] = 본문

            if original != 본문:
                print(f"[{unsung_name}-{fortune['v']}] {fortune['제목']} - 치환 완료")

with open('today_unse/stories/13_병자.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\n{'='*60}")
print(f"✅ 총 {replaced_count}개 플레이스홀더 치환 완료!")
print(f"{'='*60}")
