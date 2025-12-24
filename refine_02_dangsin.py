import json
import re

# 파일 읽기
with open('today_unse/stories/02_갑인.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# "~~한 당신" 패턴을 더 자연스럽게 변경하는 규칙들
def refine_dangsin_patterns(text):
    """당신 표현을 자연스럽게 수정"""

    # 패턴 1: "~~한 당신,\n오늘은" → "~~하니,\n오늘은"
    text = re.sub(r'(\S+)한\s+당신,\s*\n\s*오늘은', r'\1하니,\n오늘은', text)

    # 패턴 2: "~~한 당신,\n그" → "~~하게,\n그"
    text = re.sub(r'(\S+)한\s+당신,\s*\n\s*그', r'\1하게,\n그', text)

    # 패턴 3: "~~한 당신이\n~~" → "~~한 모습이\n~~"
    text = re.sub(r'(\S+)한\s+당신이\s*\n', r'\1한 모습이\n', text)

    # 패턴 4: "~~한 당신의\n~~" → "~~한 이가\n~~" 또는 "~~한 모습의\n~~"
    text = re.sub(r'(\S+)한\s+당신의\s*\n', r'\1한 이가\n', text)

    # 패턴 5: "~~한 당신 안에서" → "~~한 이 안에서" 또는 그냥 "~~하게"
    text = re.sub(r'(\S+)한\s+당신\s+안에서', r'\1하게', text)

    # 패턴 6: "~~한\n오늘은 당신의" → "~~하니,\n오늘은"
    text = re.sub(r'(\S+)한\s*\n\s*오늘은\s+당신의', r'\1하니,\n오늘은', text)

    return text

# 수동으로 특정 어색한 문장 수정
manual_fixes = {
    "호랑이처럼 용맹한\n오늘은 당신의 무대예요.": "호랑이처럼 용맹하게,\n오늘은 당신의 무대예요.",
    "생명력 가득한 모습이\n먼저 길을 내니까.": "생명력 가득하게\n먼저 길을 내니까.",
    "하늘을 향한 모습이\n하루를 열어가요.": "하늘을 향해\n하루를 열어가요.",
}

# 운세의 모든 메시지 처리
for unsung_name, fortunes in data['운세'].items():
    for fortune in fortunes:
        if '본문' in fortune:
            본문 = fortune['본문']

            # 수동 수정 적용
            for old, new in manual_fixes.items():
                if old in 본문:
                    본문 = 본문.replace(old, new)

            # 패턴 기반 수정 적용
            본문 = refine_dangsin_patterns(본문)

            fortune['본문'] = 본문

# 파일 저장
with open('today_unse/stories/02_갑인.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("[OK] 02_갑인.json '당신' 표현 정제 완료")
print("- '~~한 당신' 패턴 자연스럽게 변경")
print("- 어색한 문장 수동 수정")
