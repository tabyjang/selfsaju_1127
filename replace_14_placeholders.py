import json
import random
import sys
import io

# UTF-8 인코딩 강제 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 병인일주 특성: 지칠 줄 모르는 열정, 순수한 영혼, 창의적 지혜, 희망, 생명력

placeholders = {
    "{핵심특성}": [
        "뜨거운 열정", "밝은 에너지", "창의적 지혜", "순수한 영혼",
        "희망의 불씨", "생명력", "넘치는 활력", "긍정의 힘",
        "따뜻한 마음", "밝은 기운", "열정적 태도", "생동감",
        "창조적 영감", "순수한 열정", "햇살 같은 따뜻함", "빛나는 에너지"
    ],
    "{소통스타일}": [
        "밝게", "열정적으로", "따뜻하게", "솔직하게",
        "친근하게", "활기차게", "긍정적으로", "적극적으로",
        "상냥하게", "환하게", "진심으로", "다정하게",
        "열린 마음으로", "시원하게", "경쾌하게", "명랑하게"
    ],
    "{업무스타일}": [
        "열정을 쏟으며", "창의적으로", "적극적으로", "활기차게",
        "끈기 있게", "열심히", "몰입하며", "즐겁게",
        "긍정적으로", "에너지 넘치게", "신나게", "재미있게",
        "독창적으로", "자유롭게", "역동적으로", "생동감 있게"
    ],
    "{감정표현}": [
        "밝게", "솔직하게", "따뜻하게", "순수하게",
        "진심으로", "활짝", "열정적으로", "긍정적으로",
        "환하게", "다정하게", "상냥하게", "친근하게",
        "시원시원하게", "명랑하게", "경쾌하게", "생기 있게"
    ]
}

with open('today_unse/stories/14_병인.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

replaced_count = 0

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

with open('today_unse/stories/14_병인.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\n{'='*60}")
print(f"✅ 총 {replaced_count}개 플레이스홀더 치환 완료!")
print(f"{'='*60}")
