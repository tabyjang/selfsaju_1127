import os
from docx import Document

# 경로 설정
base_path = r'C:\NewProject\saju_master_main\selfsaju_1127_main\selfsaju_1127'
word_path = os.path.join(base_path, r'public\theories\content\00_saju_study_wordfiles\60ilju_word_files')
output_path = os.path.join(base_path, r'60ilju_content')

# 출력 폴더 생성
os.makedirs(output_path, exist_ok=True)

# Word 파일 목록
word_files = sorted([f for f in os.listdir(word_path) if f.endswith('.docx')])

for word_file in word_files:
    ilju_name = word_file.replace('.docx', '')
    doc_path = os.path.join(word_path, word_file)

    try:
        doc = Document(doc_path)
        content = []
        for para in doc.paragraphs:
            content.append(para.text)

        output_file = os.path.join(output_path, f'{ilju_name}_content.txt')
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(content))

        print(f"[OK] {ilju_name}")
    except Exception as e:
        print(f"[ERR] {ilju_name}: {str(e)[:30]}")

print(f"\n완료! {len(word_files)}개 파일 추출")
