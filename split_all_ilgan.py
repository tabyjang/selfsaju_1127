import json
import os

# 분리할 일간 파일 목록
ilgan_files = [
    'gapMok',
    'eulMok',
    'byeongHwa',
    'jeongHwa',
    'muTo',
    'gyeongGeum',
    'sinGeum',
    'imSu',
    'gyeSu'
]

total_processed = 0

for ilgan in ilgan_files:
    json_path = f'today_unse/{ilgan}.json'

    # 파일 존재 확인
    if not os.path.exists(json_path):
        print(f"Skip: {ilgan}.json not found")
        continue

    print(f"\nProcessing: {ilgan}.json")

    # JSON 파일 읽기
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 득령 부분만 추출
    deukryeong_data = data.get('득령', {})
    silryeong_data = data.get('실령', {})

    # 득령 파일 생성
    deukryeong_path = f'today_unse/{ilgan}_득령.json'
    with open(deukryeong_path, 'w', encoding='utf-8') as f:
        json.dump(deukryeong_data, f, ensure_ascii=False, indent=2)

    # 실령 파일 생성
    silryeong_path = f'today_unse/{ilgan}_실령.json'
    with open(silryeong_path, 'w', encoding='utf-8') as f:
        json.dump(silryeong_data, f, ensure_ascii=False, indent=2)

    print(f"  - {ilgan}_득령.json: {len(deukryeong_data)} items")
    print(f"  - {ilgan}_실령.json: {len(silryeong_data)} items")

    total_processed += 1

print(f"\n=== Complete! ===")
print(f"Total {total_processed} ilgan files split successfully")
print(f"Created {total_processed * 2} new files")
