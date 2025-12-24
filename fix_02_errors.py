import json

# 파일 읽기
with open('today_unse/stories/02_갑인.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 갑인의 특성: 거침없는, 당당한, 용기 있는, 호랑이처럼 용맹한, 앞장서는, 개척하는

# 플레이스홀더 교체 매핑
replacements = {
    '{감정표현} 방식으로': '솔직한 방식으로',
    '{소통스타일} 방식이': '당당한 방식이',
    '{업무스타일} 방식으로': '과감한 방식으로'
}

# 모든 운세 메시지 처리
for unsung_name, fortunes in data['운세'].items():
    for fortune in fortunes:
        if '본문' in fortune:
            본문 = fortune['본문']

            # 플레이스홀더 교체
            for old, new in replacements.items():
                본문 = 본문.replace(old, new)

            fortune['본문'] = 본문

# 파일 저장
with open('today_unse/stories/02_갑인.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("[OK] 02_갑인.json 플레이스홀더 교체 완료")
print("- {감정표현} → 솔직한")
print("- {소통스타일} → 당당한")
print("- {업무스타일} → 과감한")
