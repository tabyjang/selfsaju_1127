import json

# 파일 읽기
with open('today_unse/stories/03_갑진.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 갑진의 특성: 지혜로운, 전략적인, 큰 그릇의, 부드러운, 용처럼 대범한, 스케일 큰, 포용력 있는, 통찰력 있는, 여유로운

# 플레이스홀더 교체
replacements = {
    '{소통스타일} 방식이 빛나요': '지혜로운 방식이 빛나요'
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
with open('today_unse/stories/03_갑진.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("[OK] 03_갑진.json 플레이스홀더 교체 완료")
print("- {소통스타일} → 지혜로운")
