import json

# giTo.json 파일 읽기
with open('today_unse/giTo.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 득령 부분만 추출
deukryeong_data = data.get('득령', {})
silryeong_data = data.get('실령', {})

# giTo_득령.json 생성
with open('today_unse/giTo_득령.json', 'w', encoding='utf-8') as f:
    json.dump(deukryeong_data, f, ensure_ascii=False, indent=2)

# giTo_실령.json 생성
with open('today_unse/giTo_실령.json', 'w', encoding='utf-8') as f:
    json.dump(silryeong_data, f, ensure_ascii=False, indent=2)

print("File split completed!")
print(f"  - giTo_deukryeong.json: {len(deukryeong_data)} items")
print(f"  - giTo_silryeong.json: {len(silryeong_data)} items")
