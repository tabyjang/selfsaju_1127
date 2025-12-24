import json
import sys
import io

# UTF-8 인코딩 강제 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('today_unse/stories/11_을유.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 문법 오류 리포트를 파일로 저장
report = []
report.append("=" * 60)
report.append("11_을유.json 문법 체크 결과")
report.append("=" * 60)

# 실제 문법 오류만 체크
total_issues = 0

for unsung_name, fortunes in data['운세'].items():
    for fortune in fortunes:
        if '본문' in fortune:
            text = fortune['본문']
            issues = []

            # 패턴 1: "XX하게" 다음에 바로 명사가 오는 경우 (동사 누락)
            # 예: "섬세하게\n맡은 일을" (OK - "맡은"은 동사)
            # 예: "섬세하게\n과정을" (NG - 동사 없음)

            # 실제 문제 패턴만 체크
            lines = text.split('\n')
            for i in range(len(lines) - 1):
                curr = lines[i].strip()
                next = lines[i+1].strip()

                # "XX하게" 또는 "XX로" 단독으로 끝나고, 다음 줄이 명사만 있는 경우
                if curr and next:
                    # 부사 뒤에 동사 없이 바로 명사가 오는 경우
                    if (curr.endswith('하게') or curr.endswith('스럽게') or curr.endswith('적으로')) and \
                       (next.endswith('를') or next.endswith('을') or next.endswith('가') or next.endswith('이')):
                        # 다음 줄에 동사가 포함되어 있지 않으면 오류
                        if not any(v in next for v in ['보세요', '하세요', '하면', '하고', '해요', '나누', '살려', '믿고', '느끼', '즐기']):
                            issues.append(f"Line {i+1}-{i+2}: '{curr}' 뒤에 '{next}' - 동사 누락?")

            if issues:
                total_issues += len(issues)
                report.append(f"\n[{unsung_name}-{fortune['v']}] {fortune['제목']}")
                for issue in issues:
                    report.append(f"  {issue}")

report.append(f"\n\n총 {total_issues}개 잠재적 문법 문제 발견")

# 파일로 저장
with open('grammar_check_11.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(report))

# 화면 출력
print('\n'.join(report))
print(f"\n리포트가 grammar_check_11.txt 파일에 저장되었습니다.")
