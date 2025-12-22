# -*- coding: utf-8 -*-
import json
import os

# 천간 정보
CHEONGAN = {
    '甲': {'ohaeng': 'wood', 'yinyang': 'yang'},
    '乙': {'ohaeng': 'wood', 'yinyang': 'yin'},
    '丙': {'ohaeng': 'fire', 'yinyang': 'yang'},
    '丁': {'ohaeng': 'fire', 'yinyang': 'yin'},
    '戊': {'ohaeng': 'earth', 'yinyang': 'yang'},
    '己': {'ohaeng': 'earth', 'yinyang': 'yin'},
    '庚': {'ohaeng': 'metal', 'yinyang': 'yang'},
    '辛': {'ohaeng': 'metal', 'yinyang': 'yin'},
    '壬': {'ohaeng': 'water', 'yinyang': 'yang'},
    '癸': {'ohaeng': 'water', 'yinyang': 'yin'},
}

# 지지 정보
JIJI = {
    '子': {'ohaeng': 'water', 'yinyang': 'yin', 'index': 0},
    '丑': {'ohaeng': 'earth', 'yinyang': 'yin', 'index': 1},
    '寅': {'ohaeng': 'wood', 'yinyang': 'yang', 'index': 2},
    '卯': {'ohaeng': 'wood', 'yinyang': 'yin', 'index': 3},
    '辰': {'ohaeng': 'earth', 'yinyang': 'yang', 'index': 4},
    '巳': {'ohaeng': 'fire', 'yinyang': 'yang', 'index': 5},
    '午': {'ohaeng': 'fire', 'yinyang': 'yin', 'index': 6},
    '未': {'ohaeng': 'earth', 'yinyang': 'yin', 'index': 7},
    '申': {'ohaeng': 'metal', 'yinyang': 'yang', 'index': 8},
    '酉': {'ohaeng': 'metal', 'yinyang': 'yin', 'index': 9},
    '戌': {'ohaeng': 'earth', 'yinyang': 'yang', 'index': 10},
    '亥': {'ohaeng': 'water', 'yinyang': 'yang', 'index': 11},
}

JIJI_ORDER = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

# 천을귀인 맵
CHEON_EUL_GWIIN = {
    '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
    '乙': ['子', '申'], '己': ['子', '申'],
    '丙': ['亥', '酉'], '丁': ['亥', '酉'],
    '壬': ['卯', '巳'], '癸': ['卯', '巳'],
    '辛': ['寅', '午'],
}

# 오행 관계
OHAENG_RELATION = {
    'wood': {'wood': 0, 'fire': 2, 'earth': 4, 'metal': 6, 'water': 8},
    'fire': {'wood': 8, 'fire': 0, 'earth': 2, 'metal': 4, 'water': 6},
    'earth': {'wood': 6, 'fire': 8, 'earth': 0, 'metal': 2, 'water': 4},
    'metal': {'wood': 4, 'fire': 6, 'earth': 8, 'metal': 0, 'water': 2},
    'water': {'wood': 2, 'fire': 4, 'earth': 6, 'metal': 8, 'water': 0},
}

# 십성 맵
SIBSIN_MAP = {
    0: '비견', 1: '겁재',
    2: '식신', 3: '상관',
    4: '편재', 5: '정재',
    6: '편관', 7: '정관',
    8: '편인', 9: '정인',
}

# 십이운성 순서
UNSEONG_NAMES = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양']

# 양간 십이운성 시작 인덱스 (장생지)
YANG_UNSEONG_START = {
    '甲': 11,  # 亥에서 장생
    '丙': 2,   # 寅에서 장생
    '戊': 2,   # 寅에서 장생
    '庚': 5,   # 巳에서 장생
    '壬': 8,   # 申에서 장생
}

# 음간 십이운성 시작 인덱스 (장생지)
YIN_UNSEONG_START = {
    '乙': 6,   # 午에서 장생
    '丁': 9,   # 酉에서 장생
    '己': 9,   # 酉에서 장생
    '辛': 0,   # 子에서 장생
    '癸': 3,   # 卯에서 장생
}

# 일간별 파일명 매핑
ILGAN_FILE_MAP = {
    '甲': 'gapMok',
    '乙': 'eulMok',
    '丙': 'byeongHwa',
    '丁': 'jeongHwa',
    '戊': 'muTo',
    '己': 'giTo',
    '庚': 'gyeongGeum',
    '辛': 'sinGeum',
    '壬': 'imSu',
    '癸': 'gyeSu',
}

def get_sibsin(ilgan, jiji):
    """일간과 지지로 십성 계산"""
    ilgan_info = CHEONGAN[ilgan]
    jiji_info = JIJI[jiji]

    relation_index = OHAENG_RELATION[ilgan_info['ohaeng']][jiji_info['ohaeng']]
    yinyang_index = 0 if ilgan_info['yinyang'] == jiji_info['yinyang'] else 1

    return SIBSIN_MAP[relation_index + yinyang_index]

def get_unseong(ilgan, jiji):
    """일간과 지지로 십이운성 계산"""
    ilgan_info = CHEONGAN[ilgan]
    is_yang = ilgan_info['yinyang'] == 'yang'

    if is_yang:
        start_index = YANG_UNSEONG_START[ilgan]
    else:
        start_index = YIN_UNSEONG_START[ilgan]

    target_index = JIJI[jiji]['index']

    diff = target_index - start_index
    if not is_yang:
        diff = -diff

    unseong_index = (diff + 12) % 12

    return UNSEONG_NAMES[unseong_index]

def has_gwiin(ilgan, jiji):
    """천을귀인 여부 확인"""
    gwiins = CHEON_EUL_GWIIN.get(ilgan, [])
    return 'O' if jiji in gwiins else 'X'

def generate_12_combinations(ilgan):
    """일간의 12개 조합 생성"""
    combinations = {}

    for jiji in JIJI_ORDER:
        sibsin = get_sibsin(ilgan, jiji)
        unseong = get_unseong(ilgan, jiji)
        gwiin = has_gwiin(ilgan, jiji)

        key = f"{sibsin}_{gwiin}_{unseong}"

        combinations[key] = {
            "십성": sibsin,
            "귀인": gwiin,
            "운성": unseong,
            "지지": jiji,
            "AE": 0,  # 나중에 채워야 함
            "ME": 0,  # 나중에 채워야 함
            "액션플랜": [],
            "운세전반": ""
        }

    return combinations

def main():
    """모든 일간 파일을 12개 조합으로 변환"""

    for ilgan, filename in ILGAN_FILE_MAP.items():
        print(f"\n처리 중: {ilgan} ({filename})")

        # 12개 조합 생성
        combinations = generate_12_combinations(ilgan)

        print(f"  생성된 조합 수: {len(combinations)}개")
        print(f"  조합 키 목록:")
        for key in sorted(combinations.keys()):
            combo = combinations[key]
            print(f"    {key} (지지: {combo['지지']})")

        # 득령 파일 저장
        deuk_path = f'today_unse/{filename}_득령.json'
        with open(deuk_path, 'w', encoding='utf-8') as f:
            json.dump(combinations, f, ensure_ascii=False, indent=2)
        print(f"  [OK] {deuk_path} saved")

        # 실령 파일 저장
        sil_path = f'today_unse/{filename}_실령.json'
        with open(sil_path, 'w', encoding='utf-8') as f:
            json.dump(combinations, f, ensure_ascii=False, indent=2)
        print(f"  [OK] {sil_path} saved")

    print("\n\n=== 전체 작업 완료 ===")
    print("각 일간별로 득령/실령 파일에 12개 조합이 생성되었습니다.")
    print("AE, ME, 액션플랜, 운세전반은 나중에 채워야 합니다.")

if __name__ == '__main__':
    main()
