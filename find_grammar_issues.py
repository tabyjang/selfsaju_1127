import json
import re

with open('today_unse/stories/11_을유.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

results = []
results.append("=== 11_을유.json Grammar Issues ===\n")

issue_count = 0
for unsung_name, fortunes in data['운세'].items():
    for fortune in fortunes:
        if '본문' in fortune:
            text = fortune['본문']

            # 명백한 문법 오류 패턴들
            issues = []

            # 1. "섬세하게" 단독으로 줄 끝에 있는 경우 (다음 줄이 명사구)
            if re.search(r'섬세하게\n[가-힣\s]+를|을', text):
                issues.append("섬세하게 뒤에 동사 누락")

            # 2. "정확하게" 단독
            if re.search(r'정확하게\n자신감', text):
                issues.append("정확하게 뒤에 동사 누락")

            # 3. "은은하게" 단독
            if re.search(r'은은하게\n순간|변화|감사|자유|기쁨', text):
                issues.append("은은하게 뒤에 동사 누락")

            # 4. "매력적으로" 단독
            if re.search(r'매력적으로\n평소|아름|꼼꼼|지식', text):
                issues.append("매력적으로 뒤에 동사 누락")

            # 5. "조심스럽게" 단독
            if re.search(r'조심스럽게\n변화|내면|성장', text):
                issues.append("조심스럽게 뒤에 동사 누락")

            if issues:
                issue_count += 1
                results.append(f"\n[{unsung_name}-{fortune['v']}] {fortune['제목']}")
                for issue in issues:
                    results.append(f"  - {issue}")
                results.append(f"\n본문:\n{text}\n")

results.append(f"\n\nTotal issues found: {issue_count}")

with open('grammar_report.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(results))

print(f"Report saved to grammar_report.txt - {issue_count} issues found")
