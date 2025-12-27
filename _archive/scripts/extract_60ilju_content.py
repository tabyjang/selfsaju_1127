import os
from docx import Document

# 경로 설정
base_path = r'C:\NewProject\saju_master_main\selfsaju_1127_main\selfsaju_1127'
word_path = os.path.join(base_path, r'public\theories\content\00_saju_study_wordfiles\60ilju_word_files')
output_path = os.path.join(base_path, r'60ilju_content')

# 출력 폴더 생성
os.makedirs(output_path, exist_ok=True)

# 먼저 갑자 파일만 읽어보기
test_file = os.path.join(word_path, '갑자.docx')
doc = Document(test_file)

content = []
for para in doc.paragraphs:
    content.append(para.text)

# 갑자 내용 저장
output_file = os.path.join(output_path, '갑자_content.txt')
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(content))

print(f"갑자 내용 추출 완료: {output_file}")
print(f"총 {len(content)} 단락")
