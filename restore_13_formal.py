import json
import random
import sys
import io

# UTF-8 인코딩 강제 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('today_unse/stories/13_병자.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 병자일주 핵심 전문용어를 다시 일부 복원 (약 15% 목표)
# 핵심: 고결, 품격, 원칙, 이상

restore_count = 0

# 전체 운세 개수 파악
total_items = sum(len(fortunes) for fortunes in data['운세'].values())

# 복원할 패턴 (약 15-20%만 복원)
# 120개 항목 중 약 18-20개 정도만 핵심 전문용어 사용

restore_targets = [
    ("바르게", "고결하게", 20),  # 20개 정도
    ("올바른", "고결한", 8),      # 8개
    ("좋은 모습", "품격", 12),    # 12개
    ("수준", "격", 8),            # 8개
    ("똑바로", "올곧게", 6),      # 6개
    ("당당하게", "떳떳하게", 5),  # 5개
]

item_count = 0
for unsung_name, fortunes in data['운세'].items():
    for fortune in fortunes:
        if '본문' in fortune:
            original = fortune['본문']
            본문 = original

            # 일부 항목만 선택적으로 복원 (확률적으로)
            for casual, formal, target_count in restore_targets:
                # 약 15-20% 확률로 복원
                if casual in 본문 and random.random() < (target_count / total_items):
                    본문 = 본문.replace(casual, formal, 1)  # 한 번만 교체
                    restore_count += 1
                    break  # 한 항목당 하나만 복원

            if 본문 != original:
                fortune['본문'] = 본문

        # 액션도 일부 복원
        if '액션' in fortune:
            original_액션 = fortune['액션']
            액션 = original_액션

            for casual, formal, target_count in restore_targets:
                if casual in 액션 and random.random() < 0.1:  # 액션은 10% 정도만
                    액션 = 액션.replace(casual, formal, 1)
                    restore_count += 1
                    break

            if 액션 != original_액션:
                fortune['액션'] = 액션

        item_count += 1

# 기본이미지도 복원
data['기본이미지'] = data['기본이미지'].replace('빛나는 등불', '고귀한 등불').replace('바른 원칙', '고결한 원칙')
data['설명'] = data['설명'].replace('좋은 품성', '군자의 품격')

with open('today_unse/stories/13_병자.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"{'='*60}")
print(f"✅ 전문용어 복원 완료!")
print(f"{'='*60}")
print(f"  복원된 전문용어: 약 {restore_count}개")
print(f"  전체 항목: {total_items}개")
print(f"  예상 비율: 약 {restore_count/total_items*100:.1f}%")
print(f"{'='*60}")
