# -*- coding: utf-8 -*-
import json
import os

# giTo 득령 확인
with open('today_unse/giTo_득령.json', 'r', encoding='utf-8') as f:
    giTo_deuk = json.load(f)

print("=== giTo_득령.json ===")
print(f"Total items: {len(giTo_deuk)}")

# 십성별 카운트
sipseong_count = {}
gwiin_count = {'O': 0, 'X': 0, 'None': 0}

for key in giTo_deuk.keys():
    parts = key.split('_')
    if len(parts) >= 1:
        sipseong = parts[0]
        sipseong_count[sipseong] = sipseong_count.get(sipseong, 0) + 1

    if len(parts) >= 2:
        gwiin = parts[1]
        if gwiin in ['O', 'X']:
            gwiin_count[gwiin] += 1
        else:
            gwiin_count['None'] += 1

print("\n십성별 개수:")
for s, c in sorted(sipseong_count.items()):
    print(f"  {s}: {c}개")

print(f"\n귀인 분포:")
print(f"  귀인 O: {gwiin_count['O']}개")
print(f"  귀인 X: {gwiin_count['X']}개")
print(f"  귀인 없음: {gwiin_count['None']}개")

# muTo 확인
with open('today_unse/muTo.json', 'r', encoding='utf-8') as f:
    muTo = json.load(f)

print("\n\n=== muTo.json (득령) ===")
muTo_deuk = muTo['득령']
print(f"Total items: {len(muTo_deuk)}")

sipseong_count2 = {}
gwiin_count2 = {'O': 0, 'X': 0}

for key in muTo_deuk.keys():
    parts = key.split('_')
    if len(parts) >= 1:
        sipseong = parts[0]
        sipseong_count2[sipseong] = sipseong_count2.get(sipseong, 0) + 1

    if len(parts) >= 2:
        gwiin = parts[1]
        if gwiin in ['O', 'X']:
            gwiin_count2[gwiin] += 1

print("\n십성별 개수:")
for s, c in sorted(sipseong_count2.items()):
    print(f"  {s}: {c}개")

print(f"\n귀인 분포:")
print(f"  귀인 O: {gwiin_count2['O']}개")
print(f"  귀인 X: {gwiin_count2['X']}개")

# 샘플 키 출력
print("\n\nmuTo 득령 샘플 키 (처음 5개):")
for i, key in enumerate(sorted(muTo_deuk.keys())[:5]):
    print(f"  {key}")
