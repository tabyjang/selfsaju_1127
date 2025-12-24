import json
import random
import sys
import io
import re

# UTF-8 인코딩 강제 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('today_unse/stories/13_병자.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 다양한 마무리 표현
endings = [
    "오늘 하루 잘 보내세요.",
    "좋은 하루 만드세요.",
    "멋진 하루 되세요.",
    "빛나는 하루 보내세요.",
    "행복한 하루 되세요.",
    "당당한 하루 보내세요.",
    "의미 있는 하루 만드세요.",
    "보람찬 하루 되세요.",
    "충만한 하루 보내세요.",
    "값진 하루 만드세요.",
]

fixed_action = 0
fixed_text = 0

for unsung_name, fortunes in data['운세'].items():
    for fortune in fortunes:
        # 본문 띄어쓰기 수정
        if '본문' in fortune:
            original_text = fortune['본문']
            본문 = original_text

            # "XXX로하며" → "XXX로 하며"
            본문 = re.sub(r'([가-힣]+)로하며', r'\1로 하며', 본문)
            # "XXX로하는" → "XXX로 하는"
            본문 = re.sub(r'([가-힣]+)로하는', r'\1로 하는', 본문)
            # "XXX게하며" → "XXX게 하며"
            본문 = re.sub(r'([가-힣]+)게하며', r'\1게 하며', 본문)
            # "XXX게하는" → "XXX게 하는"
            본문 = re.sub(r'([가-힣]+)게하는', r'\1게 하는', 본문)

            if 본문 != original_text:
                fortune['본문'] = 본문
                fixed_text += 1

        # 액션 완전히 재작성
        if '액션' in fortune:
            original_action = fortune['액션']

            # 액션의 첫 단어 추출 (동사)
            # "시작 올바르게..." → "시작하세요"
            # "행동 정직하게..." → "행동하세요"
            first_word = original_action.split()[0] if original_action else ""

            # 기존 액션에서 핵심 내용 추출
            if "시작" in original_action:
                new_action = "시작하세요. 새로운 일을 용기 내어, 첫걸음을 내딛으세요. " + random.choice(endings)
            elif "행동" in original_action:
                new_action = "행동하세요. 당신의 에너지를 활짝, 세상에 펼치세요. " + random.choice(endings)
            elif "감사" in original_action:
                new_action = "감사하세요. 도움에 진심으로, 마음을 전하세요. " + random.choice(endings)
            elif "밀고" in original_action or "나가" in original_action:
                new_action = "나아가세요. 순수한 열정으로, 주저 없이 전진하세요. " + random.choice(endings)
            elif "회복" in original_action:
                new_action = "회복하세요. 긍정의 에너지로, 활력을 되찾으세요. " + random.choice(endings)
            elif "소통" in original_action:
                new_action = "소통하세요. 매력을 발산하며, 사람들과 연결되세요. " + random.choice(endings)
            elif "성장" in original_action:
                new_action = "성장하세요. 도전을 받아들이며, 한 단계 나아가세요. " + random.choice(endings)
            elif "나아가" in original_action or "전진" in original_action:
                new_action = "전진하세요. 준비한 것을 믿고, 자신감 있게 나아가세요. " + random.choice(endings)
            elif "인정" in original_action:
                new_action = "인정받으세요. 당당하게, 겸손함을 잃지 않고 빛나세요. " + random.choice(endings)
            elif "누리" in original_action or "즐기" in original_action:
                new_action = "즐기세요. 감각을 열어, 아름다움을 만끽하세요. " + random.choice(endings)
            elif "발산" in original_action or "드러내" in original_action:
                new_action = "드러내세요. 매력을 자신감 있게, 세상에 보여주세요. " + random.choice(endings)
            elif "받아들이" in original_action or "수용" in original_action:
                new_action = "받아들이세요. 변화를 신중하게, 열린 마음으로 맞이하세요. " + random.choice(endings)
            elif "주도" in original_action or "리드" in original_action:
                new_action = "주도하세요. 책임감 있게, 상황을 이끌어가세요. " + random.choice(endings)
            elif "인정" in original_action:
                new_action = "인정받으세요. 실력을 발휘하며, 존재감을 드러내세요. " + random.choice(endings)
            elif "유지" in original_action or "지키" in original_action:
                new_action = "유지하세요. 꾸준하게 안정을, 흔들림 없이 지켜가세요. " + random.choice(endings)
            elif "발휘" in original_action:
                new_action = "발휘하세요. 실력을 자신 있게, 확실히 보여주세요. " + random.choice(endings)
            elif "자립" in original_action or "독립" in original_action:
                new_action = "자립하세요. 스스로 서는 힘을, 당당하게 키워가세요. " + random.choice(endings)
            elif "균형" in original_action or "조화" in original_action:
                new_action = "균형잡으세요. 조화롭게, 중도를 지키며 나아가세요. " + random.choice(endings)
            elif "완성" in original_action or "마무리" in original_action:
                new_action = "완성하세요. 준비한 것을 깔끔하게, 마무리하세요. " + random.choice(endings)
            elif "정점" in original_action or "최고" in original_action:
                new_action = "빛나세요. 최고의 순간을, 당당하게 누리세요. " + random.choice(endings)
            elif "확대" in original_action or "영향력" in original_action:
                new_action = "확대하세요. 영향력을 책임감 있게, 넓게 펼치세요. " + random.choice(endings)
            elif "성취" in original_action:
                new_action = "이루세요. 성취를 당당하게, 기쁨을 만끽하세요. " + random.choice(endings)
            elif "자신감" in original_action:
                new_action = "당당하세요. 자신감을 드러내며, 빛나는 하루 보내세요. " + random.choice(endings)
            elif "카리스마" in original_action:
                new_action = "이끄세요. 카리스마 있게, 사람들을 감동시키세요. " + random.choice(endings)
            elif "여유" in original_action:
                new_action = "여유롭게 하세요. 느긋하게, 평온함 속에서 지혜를 키우세요. " + random.choice(endings)
            elif "지혜" in original_action:
                new_action = "지혜롭게 하세요. 깊이 생각하며, 통찰을 얻으세요. " + random.choice(endings)
            elif "안정" in original_action:
                new_action = "안정하세요. 차분하게, 흔들림 없이 평온을 유지하세요. " + random.choice(endings)
            elif "실속" in original_action:
                new_action = "챙기세요. 실속을 알뜰하게, 확실히 챙기세요. " + random.choice(endings)
            elif "고집" in original_action:
                new_action = "지키세요. 신념을 은근하게, 꿋꿋이 유지하세요. " + random.choice(endings)
            elif "휴식" in original_action or "쉬" in original_action:
                new_action = "쉬세요. 충분히 깊이, 재충전의 시간을 가지세요. " + random.choice(endings)
            elif "예민" in original_action or "섬세" in original_action:
                new_action = "느끼세요. 예민한 감각으로, 세심하게 관찰하세요. " + random.choice(endings)
            elif "상상" in original_action or "창의" in original_action:
                new_action = "상상하세요. 풍부한 감성으로, 창의력을 발휘하세요. " + random.choice(endings)
            elif "동정" in original_action or "공감" in original_action:
                new_action = "공감하세요. 다정하게, 마음을 나누세요. " + random.choice(endings)
            elif "표현" in original_action:
                new_action = "표현하세요. 감성을 예술적으로, 아름답게 드러내세요. " + random.choice(endings)
            elif "다정" in original_action or "따뜻" in original_action:
                new_action = "따뜻하게 하세요. 다정다감하게, 사람들을 감싸세요. " + random.choice(endings)
            elif "역마" in original_action or "이동" in original_action:
                new_action = "움직이세요. 역마의 기운을 타고, 자유롭게 이동하세요. " + random.choice(endings)
            elif "정신" in original_action or "사색" in original_action:
                new_action = "사색하세요. 깊이 생각하며, 정신적 성장을 이루세요. " + random.choice(endings)
            elif "마무리" in original_action or "정리" in original_action:
                new_action = "정리하세요. 깔끔하게 마무리하며, 완결을 이루세요. " + random.choice(endings)
            elif "내면" in original_action:
                new_action = "돌아보세요. 내면으로 깊이, 자신을 성찰하세요. " + random.choice(endings)
            elif "종결" in original_action or "끝" in original_action:
                new_action = "마치세요. 담담하게 종결하며, 새로운 시작을 준비하세요. " + random.choice(endings)
            elif "고요" in original_action or "평온" in original_action:
                new_action = "고요하세요. 평온함 속에서, 내면의 소리를 들으세요. " + random.choice(endings)
            elif "정산" in original_action:
                new_action = "정산하세요. 차분히 정리하며, 다음을 준비하세요. " + random.choice(endings)
            elif "멈춤" in original_action:
                new_action = "멈추세요. 잠시 쉬어가며, 지혜를 되새기세요. " + random.choice(endings)
            elif "비움" in original_action:
                new_action = "비우세요. 불필요한 것을 내려놓고, 가볍게 하세요. " + random.choice(endings)
            elif "잠재" in original_action or "저장" in original_action:
                new_action = "저장하세요. 조용히 힘을 축적하며, 내면을 키우세요. " + random.choice(endings)
            elif "내면" in original_action and "성장" in original_action:
                new_action = "키우세요. 내면의 힘을 차곡차곡, 성장시키세요. " + random.choice(endings)
            elif "준비" in original_action:
                new_action = "준비하세요. 조용히 차근차근, 미래를 준비하세요. " + random.choice(endings)
            elif "침잠" in original_action:
                new_action = "침잠하세요. 깊이 잠기며, 지혜를 축적하세요. " + random.choice(endings)
            elif "가치" in original_action:
                new_action = "발견하세요. 숨겨진 가치를, 천천히 찾아가세요. " + random.choice(endings)
            elif "축적" in original_action:
                new_action = "쌓으세요. 꾸준히 축적하며, 기반을 다지세요. " + random.choice(endings)
            elif "새로운" in original_action and "마음" in original_action:
                new_action = "새롭게 하세요. 마음을 깨끗이 하며, 출발하세요. " + random.choice(endings)
            elif "쿨" in original_action or "결정" in original_action:
                new_action = "결정하세요. 쿨하게, 과감히 선택하세요. " + random.choice(endings)
            elif "리셋" in original_action:
                new_action = "리셋하세요. 인생을 새롭게, 산뜻하게 시작하세요. " + random.choice(endings)
            elif "뒤끝" in original_action:
                new_action = "내려놓으세요. 뒤끝 없이 깨끗하게, 정리하세요. " + random.choice(endings)
            elif "반전" in original_action:
                new_action = "기대하세요. 반전의 기운을 타고, 새롭게 시작하세요. " + random.choice(endings)
            elif "순수" in original_action and "출발" in original_action:
                new_action = "출발하세요. 순수한 마음으로, 새롭게 나아가세요. " + random.choice(endings)
            elif "자유" in original_action:
                new_action = "자유롭게 하세요. 구애받지 않고, 마음껏 날아가세요. " + random.choice(endings)
            elif "잉태" in original_action or "씨앗" in original_action:
                new_action = "품으세요. 조용히 씨앗을 키우며, 가능성을 키우세요. " + random.choice(endings)
            elif "시작" in original_action and "준비" in original_action:
                new_action = "준비하세요. 신중히 시작을, 차근차근 준비하세요. " + random.choice(endings)
            elif "조용" in original_action and "성장" in original_action:
                new_action = "자라세요. 조용히 성장하며, 내실을 다지세요. " + random.choice(endings)
            elif "심기" in original_action:
                new_action = "심으세요. 좋은 씨앗을 정성껏, 미래를 준비하세요. " + random.choice(endings)
            elif "보호" in original_action:
                new_action = "보호하세요. 소중한 것을 애정으로, 잘 지키세요. " + random.choice(endings)
            elif "가능성" in original_action:
                new_action = "느끼세요. 가능성을 기대하며, 희망을 키우세요. " + random.choice(endings)
            elif "양육" in original_action or "키우" in original_action:
                new_action = "키우세요. 정성껏 양육하며, 성장을 돕세요. " + random.choice(endings)
            elif "지원" in original_action:
                new_action = "지원하세요. 필요한 도움을 아낌없이, 베푸세요. " + random.choice(endings)
            elif "교육" in original_action:
                new_action = "가르치세요. 지혜를 나누며, 성장을 이끄세요. " + random.choice(endings)
            elif "발달" in original_action:
                new_action = "발달시키세요. 꾸준히 성장하며, 발전을 이루세요. " + random.choice(endings)
            elif "보살핌" in original_action:
                new_action = "보살피세요. 세심하게 돌보며, 애정을 쏟으세요. " + random.choice(endings)
            elif "인내" in original_action:
                new_action = "인내하세요. 꾸준히 기다리며, 성과를 이루세요. " + random.choice(endings)
            else:
                # 기본 패턴
                new_action = first_word + "하세요. " + random.choice(endings)

            fortune['액션'] = new_action
            fixed_action += 1

with open('today_unse/stories/13_병자.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"{'='*60}")
print(f"✅ 수정 완료!")
print(f"{'='*60}")
print(f"  본문 띄어쓰기 수정: {fixed_text}개")
print(f"  액션 재작성: {fixed_action}개")
print(f"{'='*60}")
